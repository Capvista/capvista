import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth";
import { submissionLimiter } from "../middleware/rateLimiter";
import { sanitizeObject } from "../utils/sanitize";
import { trackEvent } from "../utils/trackEvent";

const router = Router();

// Helper: verify founder owns the company
async function verifyOwnership(userId: string, companyId: string) {
  const founderProfile = await prisma.founderProfile.findUnique({
    where: { userId },
  });
  if (!founderProfile) return { authorized: false, founderProfile: null };

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { ownerId: true },
  });
  if (!company) return { authorized: false, founderProfile };

  return {
    authorized: company.ownerId === founderProfile.id,
    founderProfile,
  };
}

// ============================================================================
// TEAM MEMBER CRUD
// ============================================================================

const teamMemberSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  role: z.string().min(1, "Role is required"),
  bio: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  photoUrl: z.string().url().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  equityPercent: z.number().min(0).max(100).optional().nullable(),
});

// GET /api/companies/:companyId/team
router.get(
  "/:companyId/team",
  requireAuth,
  requireRole("FOUNDER"),
  async (req: Request, res: Response) => {
    try {
      const { companyId } = req.params;
      const { authorized } = await verifyOwnership(req.user!.id, companyId);
      if (!authorized) {
        return res.status(403).json({
          success: false,
          error: { code: "FORBIDDEN", message: "Not authorized" },
        });
      }

      const teamMembers = await prisma.teamMember.findMany({
        where: { companyId },
        orderBy: { sortOrder: "asc" },
      });

      return res.json({ success: true, data: teamMembers });
    } catch (error) {
      console.error("Get team members error:", error);
      return res.status(500).json({
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to fetch team members" },
      });
    }
  },
);

// POST /api/companies/:companyId/team
router.post(
  "/:companyId/team",
  submissionLimiter,
  requireAuth,
  requireRole("FOUNDER"),
  async (req: Request, res: Response) => {
    try {
      const { companyId } = req.params;
      const { authorized } = await verifyOwnership(req.user!.id, companyId);
      if (!authorized) {
        return res.status(403).json({
          success: false,
          error: { code: "FORBIDDEN", message: "Not authorized" },
        });
      }

      const body = sanitizeObject(teamMemberSchema.parse(req.body));

      // Get current max sortOrder
      const lastMember = await prisma.teamMember.findFirst({
        where: { companyId },
        orderBy: { sortOrder: "desc" },
        select: { sortOrder: true },
      });

      const member = await prisma.teamMember.create({
        data: {
          companyId,
          fullName: body.fullName,
          role: body.role,
          bio: body.bio || null,
          linkedinUrl: body.linkedinUrl || null,
          photoUrl: body.photoUrl || null,
          email: body.email || null,
          equityPercent: body.equityPercent ?? null,
          sortOrder: (lastMember?.sortOrder ?? -1) + 1,
        },
      });

      trackEvent("team_member_added", "team", req.user!.id, "FOUNDER", {
        companyId,
        memberId: member.id,
      });

      return res.status(201).json({ success: true, data: member });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Invalid data", details: error.errors },
        });
      }
      console.error("Create team member error:", error);
      return res.status(500).json({
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to create team member" },
      });
    }
  },
);

// PUT /api/companies/:companyId/team/reorder
router.put(
  "/:companyId/team/reorder",
  requireAuth,
  requireRole("FOUNDER"),
  async (req: Request, res: Response) => {
    try {
      const { companyId } = req.params;
      const { authorized } = await verifyOwnership(req.user!.id, companyId);
      if (!authorized) {
        return res.status(403).json({
          success: false,
          error: { code: "FORBIDDEN", message: "Not authorized" },
        });
      }

      const { memberIds } = req.body;
      if (!Array.isArray(memberIds) || !memberIds.every((id: unknown) => typeof id === "string")) {
        return res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "memberIds must be an array of strings" },
        });
      }

      await Promise.all(
        memberIds.map((id: string, index: number) =>
          prisma.teamMember.update({
            where: { id },
            data: { sortOrder: index },
          }),
        ),
      );

      return res.json({ success: true, message: "Order updated" });
    } catch (error) {
      console.error("Reorder team members error:", error);
      return res.status(500).json({
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to reorder team members" },
      });
    }
  },
);

// PUT /api/companies/:companyId/team/:memberId
router.put(
  "/:companyId/team/:memberId",
  requireAuth,
  requireRole("FOUNDER"),
  async (req: Request, res: Response) => {
    try {
      const { companyId, memberId } = req.params;
      const { authorized } = await verifyOwnership(req.user!.id, companyId);
      if (!authorized) {
        return res.status(403).json({
          success: false,
          error: { code: "FORBIDDEN", message: "Not authorized" },
        });
      }

      const body = sanitizeObject(teamMemberSchema.partial().parse(req.body));

      const member = await prisma.teamMember.update({
        where: { id: memberId },
        data: {
          ...(body.fullName !== undefined && { fullName: body.fullName }),
          ...(body.role !== undefined && { role: body.role }),
          ...(body.bio !== undefined && { bio: body.bio || null }),
          ...(body.linkedinUrl !== undefined && { linkedinUrl: body.linkedinUrl || null }),
          ...(body.photoUrl !== undefined && { photoUrl: body.photoUrl || null }),
          ...(body.email !== undefined && { email: body.email || null }),
          ...(body.equityPercent !== undefined && { equityPercent: body.equityPercent ?? null }),
        },
      });

      return res.json({ success: true, data: member });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Invalid data", details: error.errors },
        });
      }
      console.error("Update team member error:", error);
      return res.status(500).json({
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to update team member" },
      });
    }
  },
);

// DELETE /api/companies/:companyId/team/:memberId
router.delete(
  "/:companyId/team/:memberId",
  requireAuth,
  requireRole("FOUNDER"),
  async (req: Request, res: Response) => {
    try {
      const { companyId, memberId } = req.params;
      const { authorized } = await verifyOwnership(req.user!.id, companyId);
      if (!authorized) {
        return res.status(403).json({
          success: false,
          error: { code: "FORBIDDEN", message: "Not authorized" },
        });
      }

      await prisma.teamMember.delete({ where: { id: memberId } });

      trackEvent("team_member_removed", "team", req.user!.id, "FOUNDER", {
        companyId,
        memberId,
      });

      return res.json({ success: true, message: "Team member removed" });
    } catch (error) {
      console.error("Delete team member error:", error);
      return res.status(500).json({
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to delete team member" },
      });
    }
  },
);

// ============================================================================
// COMPANY INFO UPDATE (editable fields only)
// ============================================================================

const updateCompanyInfoSchema = z.object({
  legalName: z.string().min(1).optional(),
  tradingName: z.string().optional(),
  oneLineDescription: z.string().min(10).max(200).optional(),
  detailedDescription: z.string().min(50).optional(),
  website: z.string().url().optional().or(z.literal("")),
  sector: z
    .enum([
      "TECHNOLOGY", "FINTECH", "LOGISTICS", "ENERGY", "CONSUMER_FMCG",
      "HEALTH", "AGRI_FOOD", "REAL_ESTATE", "INFRASTRUCTURE", "SAAS_TECH", "MANUFACTURING",
    ])
    .optional(),
  subsector: z.string().optional(),
  stage: z.enum(["PRE_SEED", "SEED", "SERIES_A", "SERIES_B", "SERIES_C", "SERIES_D_PLUS", "GROWTH_LATE", "PRE_IPO", "BOOTSTRAPPED"]).optional(),
  businessModel: z.enum(["B2B", "B2C", "B2B2C", "B2G", "Marketplace"]).optional(),
  teamSize: z.string().optional(),
  operatingCountries: z.array(z.string()).optional(),
  logoUrl: z.string().optional(),
});

// PUT /api/companies/:companyId/info
router.put(
  "/:companyId/info",
  requireAuth,
  requireRole("FOUNDER"),
  async (req: Request, res: Response) => {
    try {
      const { companyId } = req.params;
      const { authorized } = await verifyOwnership(req.user!.id, companyId);
      if (!authorized) {
        return res.status(403).json({
          success: false,
          error: { code: "FORBIDDEN", message: "Not authorized" },
        });
      }

      const body = sanitizeObject(updateCompanyInfoSchema.parse(req.body));

      const updated = await prisma.company.update({
        where: { id: companyId },
        data: {
          ...(body.legalName !== undefined && { legalName: body.legalName }),
          ...(body.tradingName !== undefined && { tradingName: body.tradingName }),
          ...(body.oneLineDescription !== undefined && { oneLineDescription: body.oneLineDescription }),
          ...(body.detailedDescription !== undefined && { detailedDescription: body.detailedDescription }),
          ...(body.website !== undefined && { website: body.website || null }),
          ...(body.sector !== undefined && { sector: body.sector }),
          ...(body.subsector !== undefined && { subsector: body.subsector }),
          ...(body.stage !== undefined && { stage: body.stage }),
          ...(body.businessModel !== undefined && { businessModel: body.businessModel }),
          ...(body.teamSize !== undefined && { teamSize: body.teamSize }),
          ...(body.operatingCountries !== undefined && { operatingCountries: body.operatingCountries }),
          ...(body.logoUrl !== undefined && { logoUrl: body.logoUrl }),
        },
        include: {
          teamMembers: { orderBy: { sortOrder: "asc" } },
        },
      });

      return res.json({ success: true, data: updated });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Invalid data", details: error.errors },
        });
      }
      console.error("Update company info error:", error);
      return res.status(500).json({
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to update company info" },
      });
    }
  },
);

export default router;
