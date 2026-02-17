import { Router, Request, Response } from "express";
import { prisma } from "@capvista/database";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

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
  stage: z.enum(["PRE_REVENUE", "EARLY_REVENUE", "GROWTH", "PROFITABLE"]),
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
});

const updateCompanySchema = createCompanySchema.partial();

// GET /api/companies - List companies
router.get("/", async (req: Request, res: Response) => {
  try {
    const { sector, stage, lane, page = "1", limit = "20" } = req.query;

    const where: any = {};
    if (sector) where.sector = sector;
    if (stage) where.stage = stage;
    if (lane) where.preferredLane = lane;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

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
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
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
          preferredLane: true,
          preferredInstrument: true,
          targetRaiseRange: true,
          currentMonitoringStatus: true,
          createdAt: true,
          logoUrl: true,
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

// GET /api/companies/:id - Get company details
router.get("/:id", async (req: Request, res: Response) => {
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
  requireAuth,
  requireRole("FOUNDER"),
  async (req: Request, res: Response) => {
    try {
      const body = createCompanySchema.parse(req.body);

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
router.patch(
  "/:id",
  requireAuth,
  requireRole("FOUNDER"),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const body = updateCompanySchema.parse(req.body);

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
          ...body,
          incorporationDate: body.incorporationDate
            ? new Date(body.incorporationDate)
            : undefined,
        },
      });

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
