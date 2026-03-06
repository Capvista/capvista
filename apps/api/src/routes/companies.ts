import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth";
import { submissionLimiter } from "../middleware/rateLimiter";
import { sendEmail } from "../lib/email";
import { companySubmissionEmail } from "../lib/emailTemplates";
import { pickFields } from "../utils/pickFields";
import { sanitizeObject, sanitizeString, isValidURL } from "../utils/sanitize";
import { trackEvent } from "../utils/trackEvent";

const router = Router();

// ============================================================================
// DEAL CREATION GUARD
// Use this helper in the deal creation endpoint to ensure a company is approved
// before allowing deals to be created against it.
// ============================================================================
export async function assertCompanyApproved(companyId: string): Promise<{ approved: boolean; status: string }> {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { approvalStatus: true },
  });

  if (!company) {
    return { approved: false, status: "NOT_FOUND" };
  }

  return {
    approved: company.approvalStatus === "APPROVED",
    status: company.approvalStatus,
  };
}

// Validation schemas
const createCompanySchema = z.object({
  logoUrl: z.string().url().optional(),
  legalName: z.string().min(1),
  tradingName: z.string().optional(),
  countryOfIncorporation: z.string().default("Nigeria"),
  incorporationNumber: z.string().min(1),
  incorporationDate: z.string().datetime(),
  companyAddress: z.string().min(1),
  operatingCountries: z.array(z.string()),
  website: z.string().url().optional(),
  officialEmailDomain: z.string().min(1),
  teamSize: z.string().optional(),
  oneLineDescription: z.string().min(10).max(200),
  detailedDescription: z.string().min(50),
  sector: z.enum([
    "TECHNOLOGY",
    "FINTECH",
    "LOGISTICS",
    "ENERGY",
    "CONSUMER_FMCG",
    "HEALTH",
    "AGRI_FOOD",
    "REAL_ESTATE",
    "INFRASTRUCTURE",
    "SAAS_TECH",
    "MANUFACTURING",
  ]),
  subsector: z.string().optional(),
  businessModel: z.enum(["B2B", "B2C", "B2B2C", "B2G", "Marketplace"]),
  revenueModel: z.enum(["TRANSACTIONAL", "SUBSCRIPTION", "ASSET_BACKED"]),
  stage: z.enum(["PRE_SEED", "SEED", "SERIES_A", "SERIES_B", "SERIES_C", "SERIES_D_PLUS", "GROWTH_LATE", "PRE_IPO", "BOOTSTRAPPED"]),
  revenueStatus: z.string().optional(),
  revenueRange: z.string().optional(),
  primaryRevenueSource: z.string().optional(),
  keyMetrics: z.any().optional(),
  majorCustomers: z.array(z.string()).optional(),
  geographicFootprint: z.string().optional(),
  regulatoryDependencies: z.string().optional(),
  hasRaisedBefore: z.boolean().default(false),
  previousRaises: z.any().optional(),
  founderOwnedPercent: z.number().min(0).max(100).optional(),
  externalInvestorsPercent: z.number().min(0).max(100).optional(),
  notableInvestors: z.array(z.string()).optional(),
  topRisks: z.array(z.string()).min(3).max(3),
  materialThreats: z.string().optional(),
  singleSupplier: z.boolean().default(false),
  fxExposure: z.boolean().default(false),
  regulationDependent: z.boolean().default(false),
  infrastructureDependent: z.boolean().default(false),
  preferredLane: z.enum(["YIELD", "VENTURES"]).optional(),
  preferredInstrument: z
    .enum([
      "REVENUE_SHARE_NOTE",
      "ASSET_BACKED_PARTICIPATION",
      "CONVERTIBLE_NOTE",
      "SAFE",
      "SPV_EQUITY",
    ])
    .optional(),
  targetRaiseRange: z.string().optional(),
  primaryUseOfFunds: z.string().optional(),
  founderLinkedIn: z.string().optional(),
  yearsExperience: z.string().optional(),
  founderNIN: z.string().optional(),
  founderBVN: z.string().optional(),
  // Platform Participation Acknowledgement
  participationAcknowledged: z.boolean().optional(),
});

const updateCompanySchema = createCompanySchema.partial();

// GET /api/companies - List companies (any authenticated user)
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const { sector, stage, lane, page = "1", limit = "20" } = req.query;

    // Validate pagination params
    const pageNum = Math.max(1, Math.floor(Number(page)) || 1);
    const limitNum = Math.min(100, Math.max(1, Math.floor(Number(limit)) || 20));

    const where: any = {};
    where.approvalStatus = 'APPROVED';
    if (sector && typeof sector === "string") where.sector = sector;
    if (stage && typeof stage === "string") where.stage = stage;
    if (lane && typeof lane === "string") where.preferredLane = lane;

    const skip = (pageNum - 1) * limitNum;
    const take = limitNum;

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          legalName: true,
          tradingName: true,
          oneLineDescription: true,
          sector: true,
          subsector: true,
          stage: true,
          preferredLane: true,
          preferredInstrument: true,
          targetRaiseRange: true,
          currentMonitoringStatus: true,
          createdAt: true,
          logoUrl: true,
          deals: {
            where: { status: "LIVE" },
            select: {
              id: true,
              name: true,
              lane: true,
              targetAmount: true,
              raisedAmount: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.company.count({ where }),
    ]);

    return res.json({
      success: true,
      data: companies,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("List companies error:", error);
    return res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to fetch companies" },
    });
  }
});

// GET /api/companies/my-companies - Get current founder's companies
router.get(
  "/my-companies",
  requireAuth,
  requireRole("FOUNDER"),
  async (req: Request, res: Response) => {
    try {
      const founderProfile = await prisma.founderProfile.findUnique({
        where: { userId: req.user!.id },
      });

      if (!founderProfile) {
        return res.json({ success: true, data: [] });
      }

      const companies = await prisma.company.findMany({
        where: { ownerId: founderProfile.id },
        select: {
          id: true,
          legalName: true,
          tradingName: true,
          sector: true,
          subsector: true,
          stage: true,
          incorporationDate: true,
          preferredLane: true,
          preferredInstrument: true,
          targetRaiseRange: true,
          currentMonitoringStatus: true,
          approvalStatus: true,
          participationStatus: true,
          participationAcknowledged: true,
          participationExecutedAt: true,
          participationExecutorSignature: true,
          boardResolutionUrl: true,
          shareCertificateUrl: true,
          shareholderRegisterUrl: true,
          capTableConfirmationUrl: true,
          countryOfIncorporation: true,
          createdAt: true,
          logoUrl: true,
          deals: {
            select: {
              id: true,
              name: true,
              lane: true,
              instrumentType: true,
              status: true,
              targetAmount: true,
              raisedAmount: true,
              createdAt: true,
            },
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return res.json({ success: true, data: companies });
    } catch (error) {
      console.error("My companies error:", error);
      return res.status(500).json({
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to fetch companies" },
      });
    }
  },
);

// GET /api/companies/:id/status - Get company approval status and latest admin action
router.get(
  "/:id/status",
  requireAuth,
  requireRole("FOUNDER", "ADMIN"),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const company = await prisma.company.findUnique({
        where: { id },
        select: { id: true, approvalStatus: true, ownerId: true },
      });

      if (!company) {
        return res.status(404).json({
          success: false,
          error: { code: "COMPANY_NOT_FOUND", message: "Company not found" },
        });
      }

      // Verify ownership for founders (admins can access any)
      if (req.user!.role === "FOUNDER") {
        const founderProfile = await prisma.founderProfile.findUnique({
          where: { userId: req.user!.id },
        });
        if (!founderProfile || company.ownerId !== founderProfile.id) {
          return res.status(403).json({
            success: false,
            error: { code: "FORBIDDEN", message: "Not authorized to view this company's status" },
          });
        }
      }

      // Fetch the most recent admin action for this company
      const latestAction = await prisma.adminAction.findFirst({
        where: {
          targetId: id,
          targetType: "COMPANY",
          actionType: {
            in: [
              "COMPANY_APPROVED",
              "COMPANY_REJECTED",
              "COMPANY_INFO_REQUESTED",
            ],
          },
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          actionType: true,
          reason: true,
          createdAt: true,
        },
      });

      return res.json({
        success: true,
        data: {
          approvalStatus: company.approvalStatus,
          latestAction: latestAction || null,
        },
      });
    } catch (error) {
      console.error("Get company status error:", error);
      return res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch company status",
        },
      });
    }
  },
);

// GET /api/companies/:id/similar - Get similar companies (same sector)
router.get("/:id/similar", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // First, get the current company's sector and subsector
    const company = await prisma.company.findUnique({
      where: { id },
      select: { sector: true, subsector: true },
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        error: { code: "COMPANY_NOT_FOUND", message: "Company not found" },
      });
    }

    // Find similar companies: same sector, approved, exclude current
    const similarCompanies = await prisma.company.findMany({
      where: {
        sector: company.sector,
        id: { not: id },
        approvalStatus: "APPROVED",
      },
      select: {
        id: true,
        legalName: true,
        tradingName: true,
        oneLineDescription: true,
        sector: true,
        subsector: true,
        stage: true,
        preferredLane: true,
        logoUrl: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 12, // fetch extra to re-sort by subsector match
    });

    // Sort: matching subsector first, then by createdAt desc
    const sorted = similarCompanies.sort((a, b) => {
      const aMatch = a.subsector === company.subsector ? 1 : 0;
      const bMatch = b.subsector === company.subsector ? 1 : 0;
      if (bMatch !== aMatch) return bMatch - aMatch;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return res.json({
      success: true,
      data: sorted.slice(0, 6),
    });
  } catch (error) {
    console.error("Get similar companies error:", error);
    return res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to fetch similar companies" },
    });
  }
});

// GET /api/companies/:id - Get company details (any authenticated user)
router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        owner: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        founders: {
          include: {
            founder: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
        teamMembers: {
          orderBy: { sortOrder: "asc" },
        },
        deals: {
          select: {
            id: true,
            name: true,
            lane: true,
            instrumentType: true,
            status: true,
            targetAmount: true,
            raisedAmount: true,
            minimumInvestment: true,
            terms: true,
            openedAt: true,
            closedAt: true,
          },
        },
        verificationRecords: {
          where: { status: "VERIFIED" },
          select: { type: true, verifiedAt: true },
        },
      },
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        error: { code: "COMPANY_NOT_FOUND", message: "Company not found" },
      });
    }

    return res.json({
      success: true,
      data: company,
    });
  } catch (error) {
    console.error("Get company error:", error);
    return res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to fetch company" },
    });
  }
});

// POST /api/companies - Create company (founders only)
router.post(
  "/",
  submissionLimiter,
  requireAuth,
  requireRole("FOUNDER"),
  async (req: Request, res: Response) => {
    try {
      const body = sanitizeObject(createCompanySchema.parse(req.body));

      // Look up the FounderProfile for this user
      const founderProfile = await prisma.founderProfile.findUnique({
        where: { userId: req.user!.id },
      });

      if (!founderProfile) {
        return res.status(400).json({
          success: false,
          error: { code: "NO_PROFILE", message: "Founder profile not found" },
        });
      }

      // Check if CAC number already exists
      const existing = await prisma.company.findUnique({
        where: { incorporationNumber: body.incorporationNumber },
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          error: {
            code: "COMPANY_EXISTS",
            message: "A company with this incorporation number already exists",
          },
        });
      }

      // Create company + CompanyFounder in a transaction
      const company = await prisma.company.create({
        data: {
          ownerId: founderProfile.id,
          logoUrl: body.logoUrl,
          legalName: body.legalName,
          tradingName: body.tradingName,
          countryOfIncorporation: body.countryOfIncorporation,
          incorporationNumber: body.incorporationNumber,
          incorporationDate: new Date(body.incorporationDate),
          companyAddress: body.companyAddress,
          operatingCountries: body.operatingCountries || [],
          website: body.website,
          officialEmailDomain: body.officialEmailDomain,
          teamSize: body.teamSize,
          oneLineDescription: body.oneLineDescription,
          detailedDescription: body.detailedDescription,
          sector: body.sector,
          subsector: body.subsector,
          businessModel: body.businessModel,
          revenueModel: body.revenueModel,
          stage: body.stage,
          revenueStatus: body.revenueStatus,
          revenueRange: body.revenueRange,
          primaryRevenueSource: body.primaryRevenueSource,
          keyMetrics: body.keyMetrics,
          majorCustomers: body.majorCustomers || [],
          geographicFootprint: body.geographicFootprint,
          regulatoryDependencies: body.regulatoryDependencies,
          hasRaisedBefore: body.hasRaisedBefore,
          previousRaises: body.previousRaises,
          founderOwnedPercent: body.founderOwnedPercent,
          externalInvestorsPercent: body.externalInvestorsPercent,
          notableInvestors: body.notableInvestors || [],
          topRisks: body.topRisks,
          materialThreats: body.materialThreats,
          singleSupplier: body.singleSupplier,
          fxExposure: body.fxExposure,
          regulationDependent: body.regulationDependent,
          infrastructureDependent: body.infrastructureDependent,
          preferredLane: body.preferredLane,
          preferredInstrument: body.preferredInstrument,
          targetRaiseRange: body.targetRaiseRange,
          primaryUseOfFunds: body.primaryUseOfFunds,
          // Platform Participation
          participationAcknowledged: body.participationAcknowledged || false,
          participationAcknowledgedAt: body.participationAcknowledged ? new Date() : undefined,
          participationAcknowledgedIp: body.participationAcknowledged ? String(req.ip || req.headers["x-forwarded-for"] || "unknown") : undefined,
          participationStatus: body.participationAcknowledged ? "ACKNOWLEDGED" : "NOT_STARTED",
          founders: {
            create: {
              founderId: founderProfile.id,
              role: "CEO",
              bio: "Founder and CEO",
              isPrimary: true,
            },
          },
        },
        include: {
          founders: {
            include: {
              founder: {
                include: {
                  user: {
                    select: {
                      id: true,
                      email: true,
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      console.log(`✅ Company created: ${company.legalName} (${company.id})`);

      trackEvent("company_submitted", "company", req.user!.id, "FOUNDER", {
        companyId: company.id,
        companyName: company.legalName,
      });

      // Fire and forget — company submission email
      (async () => {
        try {
          const emailUser = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { email: true } });
          if (emailUser) {
            const { subject, html } = companySubmissionEmail(company.legalName);
            await sendEmail({ to: emailUser.email, subject, html });
          }
        } catch (err) {
          console.error("Company submission email failed:", err);
        }
      })();

      // Update FounderProfile with data from the onboarding form
      await prisma.founderProfile.update({
        where: { userId: req.user!.id },
        data: {
          linkedinUrl: body.founderLinkedIn || undefined,
          yearsExperience: body.yearsExperience
            ? parseInt(body.yearsExperience, 10)
            : undefined,
          nin: body.founderNIN || undefined,
          bvn: body.founderBVN || undefined,
          onboardingCompleted: true,
          onboardingCompletedAt: new Date(),
        },
      });

      console.log(`✅ FounderProfile updated for user: ${req.user!.id}`);

      return res.status(201).json({
        success: true,
        data: company,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request data",
            details: error.errors,
          },
        });
      }

      console.error("Create company error:", error);
      return res.status(500).json({
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to create company" },
      });
    }
  },
);

// PATCH /api/companies/:id - Update company (founders only)
const ALLOWED_COMPANY_UPDATE_FIELDS = [
  "logoUrl", "legalName", "tradingName", "countryOfIncorporation",
  "incorporationNumber", "incorporationDate", "companyAddress",
  "operatingCountries", "website", "officialEmailDomain", "teamSize",
  "oneLineDescription", "detailedDescription", "sector", "subsector",
  "businessModel", "revenueModel", "stage", "revenueStatus", "revenueRange",
  "primaryRevenueSource", "keyMetrics", "majorCustomers", "geographicFootprint",
  "regulatoryDependencies", "hasRaisedBefore", "previousRaises",
  "founderOwnedPercent", "externalInvestorsPercent", "notableInvestors",
  "topRisks", "materialThreats", "singleSupplier", "fxExposure",
  "regulationDependent", "infrastructureDependent", "preferredLane",
  "preferredInstrument", "targetRaiseRange", "primaryUseOfFunds",
  "participationAcknowledged",
];

router.patch(
  "/:id",
  requireAuth,
  requireRole("FOUNDER"),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const body = sanitizeObject(updateCompanySchema.parse(req.body));
      const updateData = pickFields(body, ALLOWED_COMPANY_UPDATE_FIELDS, "PATCH /companies/:id");

      // Get founder profile
      const founderProfile = await prisma.founderProfile.findUnique({
        where: { userId: req.user!.id },
      });

      if (!founderProfile) {
        return res.status(400).json({
          success: false,
          error: { code: "NO_PROFILE", message: "Founder profile not found" },
        });
      }

      // Check ownership
      const company = await prisma.company.findUnique({
        where: { id },
        include: {
          founders: { where: { founderId: founderProfile.id } },
        },
      });

      if (!company) {
        return res.status(404).json({
          success: false,
          error: { code: "COMPANY_NOT_FOUND", message: "Company not found" },
        });
      }

      const isOwner = company.ownerId === founderProfile.id;
      const isFounder = company.founders.length > 0;

      if (!isOwner && !isFounder) {
        return res.status(403).json({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "You are not authorized to update this company",
          },
        });
      }

      const updatedCompany = await prisma.company.update({
        where: { id },
        data: {
          ...updateData,
          incorporationDate: body.incorporationDate
            ? new Date(body.incorporationDate)
            : undefined,
        },
      });

      trackEvent("company_updated", "company", req.user!.id, "FOUNDER", { companyId: id });

      return res.json({
        success: true,
        data: updatedCompany,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request data",
            details: error.errors,
          },
        });
      }

      console.error("Update company error:", error);
      return res.status(500).json({
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to update company" },
      });
    }
  },
);

// PATCH /api/companies/:id/sign-participation — Founder signs the participation agreement
router.patch(
  "/:id/sign-participation",
  requireAuth,
  requireRole("FOUNDER"),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { signature } = req.body as { signature?: unknown };

      if (!signature || typeof signature !== "string" || !signature.trim()) {
        return res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Signature (typed full name) is required" },
        });
      }

      const founderProfile = await prisma.founderProfile.findUnique({
        where: { userId: req.user!.id },
      });

      if (!founderProfile) {
        return res.status(400).json({
          success: false,
          error: { code: "NO_PROFILE", message: "Founder profile not found" },
        });
      }

      const company = await prisma.company.findUnique({ where: { id } });

      if (!company) {
        return res.status(404).json({
          success: false,
          error: { code: "COMPANY_NOT_FOUND", message: "Company not found" },
        });
      }

      if (company.ownerId !== founderProfile.id) {
        return res.status(403).json({
          success: false,
          error: { code: "FORBIDDEN", message: "You are not authorized to sign for this company" },
        });
      }

      if (company.participationStatus !== "ACKNOWLEDGED") {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_STATE",
            message: `Cannot sign agreement. Current status: ${company.participationStatus}. Must be ACKNOWLEDGED.`,
          },
        });
      }

      const clientIp = req.ip || req.headers["x-forwarded-for"] || "unknown";

      const updated = await prisma.company.update({
        where: { id },
        data: {
          participationExecutorSignature: sanitizeString(signature),
          participationExecutedAt: new Date(),
          participationExecutorIp: String(clientIp),
          participationStatus: "EXECUTED",
        },
      });

      return res.json({
        success: true,
        data: {
          participationStatus: updated.participationStatus,
          participationExecutedAt: updated.participationExecutedAt,
        },
      });
    } catch (error) {
      console.error("Sign participation error:", error);
      return res.status(500).json({
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to sign participation agreement" },
      });
    }
  },
);

// PATCH /api/companies/:id/upload-issuance-docs — Founder uploads issuance documentation
router.patch(
  "/:id/upload-issuance-docs",
  requireAuth,
  requireRole("FOUNDER"),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { boardResolutionUrl, shareCertificateUrl, shareholderRegisterUrl, capTableConfirmationUrl } = req.body;

      if (!boardResolutionUrl || !shareCertificateUrl || !shareholderRegisterUrl || !capTableConfirmationUrl) {
        return res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "All four document URLs are required" },
        });
      }

      // Validate all are proper URLs
      const docUrls = { boardResolutionUrl, shareCertificateUrl, shareholderRegisterUrl, capTableConfirmationUrl };
      for (const [field, url] of Object.entries(docUrls)) {
        if (typeof url !== "string" || !isValidURL(url)) {
          return res.status(400).json({
            success: false,
            error: { code: "VALIDATION_ERROR", message: `${field} must be a valid URL` },
          });
        }
      }

      const founderProfile = await prisma.founderProfile.findUnique({
        where: { userId: req.user!.id },
      });

      if (!founderProfile) {
        return res.status(400).json({
          success: false,
          error: { code: "NO_PROFILE", message: "Founder profile not found" },
        });
      }

      const company = await prisma.company.findUnique({ where: { id } });

      if (!company) {
        return res.status(404).json({
          success: false,
          error: { code: "COMPANY_NOT_FOUND", message: "Company not found" },
        });
      }

      if (company.ownerId !== founderProfile.id) {
        return res.status(403).json({
          success: false,
          error: { code: "FORBIDDEN", message: "You are not authorized to upload documents for this company" },
        });
      }

      if (company.participationStatus !== "EXECUTED") {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_STATE",
            message: `Cannot upload documents. Current status: ${company.participationStatus}. Must be EXECUTED.`,
          },
        });
      }

      const updated = await prisma.company.update({
        where: { id },
        data: {
          boardResolutionUrl,
          shareCertificateUrl,
          shareholderRegisterUrl,
          capTableConfirmationUrl,
        },
      });

      return res.json({
        success: true,
        data: {
          boardResolutionUrl: updated.boardResolutionUrl,
          shareCertificateUrl: updated.shareCertificateUrl,
          shareholderRegisterUrl: updated.shareholderRegisterUrl,
          capTableConfirmationUrl: updated.capTableConfirmationUrl,
        },
      });
    } catch (error) {
      console.error("Upload issuance docs error:", error);
      return res.status(500).json({
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to upload issuance documents" },
      });
    }
  },
);

// DELETE /api/companies/:id - Delete company (admin only)
router.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      await prisma.company.delete({ where: { id } });

      return res.json({
        success: true,
        message: "Company deleted successfully",
      });
    } catch (error) {
      console.error("Delete company error:", error);
      return res.status(500).json({
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to delete company" },
      });
    }
  },
);

export default router;
