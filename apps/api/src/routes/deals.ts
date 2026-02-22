import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth";
import { sendEmail } from "../lib/email";
import { dealSubmittedEmail } from "../lib/emailTemplates";

const router = Router();

// Validation schemas — full submission (UNDER_REVIEW) requires all core fields
const createDealSchema = z.object({
  companyId: z.string(),
  name: z.string().min(1),
  lane: z.enum(["YIELD", "VENTURES"]),
  instrumentType: z.enum([
    "REVENUE_SHARE_NOTE",
    "ASSET_BACKED_PARTICIPATION",
    "CONVERTIBLE_NOTE",
    "SAFE",
    "SPV_EQUITY",
  ]),
  targetAmount: z.number().positive(),
  minimumInvestment: z.number().positive(),
  terms: z.any(), // JSON object with instrument-specific terms
  duration: z.number().int().positive().optional().nullable(),
  status: z.enum(["DRAFT", "UNDER_REVIEW"]).optional(),

  // Overview fields
  jurisdiction: z.string().optional().nullable(),
  entityType: z.string().optional().nullable(),
  offeringStructure: z.string().optional().nullable(),
  closingType: z.string().optional().nullable(),
  leadInvestor: z.string().optional().nullable(),

  // Financials
  softCap: z.number().positive().optional().nullable(),
  closeDate: z.string().optional().nullable(), // ISO date string
  rollingClose: z.boolean().optional(),
  allowWaitlist: z.boolean().optional(),
  useOfFunds: z.string().optional().nullable(),
  currentRevenue: z.string().optional().nullable(),
  previousCapitalRaised: z.string().optional().nullable(),
  expectedReturnStructure: z.string().optional().nullable(),
  paymentFrequency: z.string().optional().nullable(),
  capitalProtection: z.string().optional().nullable(),
  maturityTerms: z.string().optional().nullable(),

  // Disclosure & Risks (JSON)
  companyDisclosure: z.any().optional().nullable(),
  dealRisks: z.any().optional().nullable(),

  // Document URLs
  pitchDeckUrl: z.string().optional().nullable(),
  financialDocsUrl: z.string().optional().nullable(),
  termsSheetUrl: z.string().optional().nullable(),
  incorporationDocsUrl: z.string().optional().nullable(),
  instrumentTemplateUrl: z.string().optional().nullable(),
  riskDisclosureDocUrl: z.string().optional().nullable(),
  subscriptionAgreementUrl: z.string().optional().nullable(),
  capTableDocUrl: z.string().optional().nullable(),
  financialStatementsUrl: z.string().optional().nullable(),
  founderBackgroundDocsUrl: z.string().optional().nullable(),
  customerContractsUrl: z.string().optional().nullable(),
  bankStatementsUrl: z.string().optional().nullable(),
});

// Draft schema — only companyId required, everything else optional
const createDraftDealSchema = z.object({
  companyId: z.string(),
  name: z.string().optional().default(""),
  lane: z.enum(["YIELD", "VENTURES"]).optional().nullable(),
  instrumentType: z.enum([
    "REVENUE_SHARE_NOTE",
    "ASSET_BACKED_PARTICIPATION",
    "CONVERTIBLE_NOTE",
    "SAFE",
    "SPV_EQUITY",
  ]).optional().nullable(),
  targetAmount: z.number().positive().optional().nullable(),
  minimumInvestment: z.number().positive().optional().nullable(),
  terms: z.any().optional().nullable(),
  duration: z.number().int().positive().optional().nullable(),
  status: z.literal("DRAFT").optional(),

  // Overview fields
  jurisdiction: z.string().optional().nullable(),
  entityType: z.string().optional().nullable(),
  offeringStructure: z.string().optional().nullable(),
  closingType: z.string().optional().nullable(),
  leadInvestor: z.string().optional().nullable(),

  // Financials
  softCap: z.number().positive().optional().nullable(),
  closeDate: z.string().optional().nullable(),
  rollingClose: z.boolean().optional(),
  allowWaitlist: z.boolean().optional(),
  useOfFunds: z.string().optional().nullable(),
  currentRevenue: z.string().optional().nullable(),
  previousCapitalRaised: z.string().optional().nullable(),
  expectedReturnStructure: z.string().optional().nullable(),
  paymentFrequency: z.string().optional().nullable(),
  capitalProtection: z.string().optional().nullable(),
  maturityTerms: z.string().optional().nullable(),

  // Disclosure & Risks (JSON)
  companyDisclosure: z.any().optional().nullable(),
  dealRisks: z.any().optional().nullable(),

  // Document URLs
  pitchDeckUrl: z.string().optional().nullable(),
  financialDocsUrl: z.string().optional().nullable(),
  termsSheetUrl: z.string().optional().nullable(),
  incorporationDocsUrl: z.string().optional().nullable(),
  instrumentTemplateUrl: z.string().optional().nullable(),
  riskDisclosureDocUrl: z.string().optional().nullable(),
  subscriptionAgreementUrl: z.string().optional().nullable(),
  capTableDocUrl: z.string().optional().nullable(),
  financialStatementsUrl: z.string().optional().nullable(),
  founderBackgroundDocsUrl: z.string().optional().nullable(),
  customerContractsUrl: z.string().optional().nullable(),
  bankStatementsUrl: z.string().optional().nullable(),
});

const updateDealSchema = createDealSchema.partial().omit({ companyId: true }).extend({
  status: z.enum(["DRAFT", "UNDER_REVIEW"]).optional(),
});

// POST /v1/deals - Create deal (founders only)
router.post(
  "/",
  requireAuth,
  requireRole("FOUNDER"),
  async (req: Request, res: Response) => {
    try {
      // Determine which schema to use based on the requested status
      const requestedStatus = req.body.status || "DRAFT";
      const isDraft = requestedStatus === "DRAFT";
      const body = isDraft
        ? createDraftDealSchema.parse(req.body)
        : createDealSchema.parse(req.body);

      // Verify user is founder of the company (check both owner and companyFounder)
      const founderProfile = await prisma.founderProfile.findUnique({
        where: { userId: req.user!.id },
      });

      if (!founderProfile) {
        return res.status(403).json({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Founder profile not found",
          },
        });
      }

      const company = await prisma.company.findUnique({
        where: { id: body.companyId },
        select: {
          ownerId: true,
          approvalStatus: true,
          equityAcknowledgementAccepted: true,
        },
      });

      if (!company) {
        return res.status(404).json({
          success: false,
          error: {
            code: "COMPANY_NOT_FOUND",
            message: "Company not found",
          },
        });
      }

      // Check ownership or founder membership
      const isOwner = company.ownerId === founderProfile.id;
      const companyFounder = !isOwner
        ? await prisma.companyFounder.findFirst({
            where: {
              companyId: body.companyId,
              founderId: founderProfile.id,
            },
          })
        : null;

      if (!isOwner && !companyFounder) {
        return res.status(403).json({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "You are not authorized to create deals for this company",
          },
        });
      }

      // Verify company is approved
      if (company.approvalStatus !== "APPROVED") {
        return res.status(400).json({
          success: false,
          error: {
            code: "COMPANY_NOT_APPROVED",
            message: "Company must be approved before creating deals",
          },
        });
      }

      // Validate lane and instrument match (only for full submissions with both fields)
      if (body.lane && body.instrumentType) {
        const yieldInstruments = [
          "REVENUE_SHARE_NOTE",
          "ASSET_BACKED_PARTICIPATION",
        ];
        const venturesInstruments = ["CONVERTIBLE_NOTE", "SAFE", "SPV_EQUITY"];

        if (
          body.lane === "YIELD" &&
          !yieldInstruments.includes(body.instrumentType)
        ) {
          return res.status(400).json({
            success: false,
            error: {
              code: "INVALID_INSTRUMENT",
              message: "Selected instrument is not valid for Yield lane",
            },
          });
        }

        if (
          body.lane === "VENTURES" &&
          !venturesInstruments.includes(body.instrumentType)
        ) {
          return res.status(400).json({
            success: false,
            error: {
              code: "INVALID_INSTRUMENT",
              message: "Selected instrument is not valid for Ventures lane",
            },
          });
        }
      }

      // Create deal with the requested status (DRAFT or UNDER_REVIEW)
      const dealStatus = isDraft ? "DRAFT" : "UNDER_REVIEW";
      const deal = await prisma.deal.create({
        data: {
          companyId: body.companyId,
          name: body.name || "Untitled Deal",
          lane: body.lane ?? undefined,
          instrumentType: body.instrumentType ?? undefined,
          targetAmount: body.targetAmount ?? undefined,
          minimumInvestment: body.minimumInvestment ?? undefined,
          terms: body.terms ?? undefined,
          duration: body.duration ?? undefined,
          status: dealStatus,

          // Overview
          jurisdiction: body.jurisdiction ?? undefined,
          entityType: body.entityType ?? undefined,
          offeringStructure: body.offeringStructure ?? undefined,
          closingType: body.closingType ?? undefined,
          leadInvestor: body.leadInvestor ?? undefined,

          // Financials
          softCap: body.softCap ?? undefined,
          closeDate: body.closeDate ? new Date(body.closeDate) : undefined,
          rollingClose: body.rollingClose ?? false,
          allowWaitlist: body.allowWaitlist ?? false,
          useOfFunds: body.useOfFunds ?? undefined,
          currentRevenue: body.currentRevenue ?? undefined,
          previousCapitalRaised: body.previousCapitalRaised ?? undefined,
          expectedReturnStructure: body.expectedReturnStructure ?? undefined,
          paymentFrequency: body.paymentFrequency ?? undefined,
          capitalProtection: body.capitalProtection ?? undefined,
          maturityTerms: body.maturityTerms ?? undefined,

          // Disclosure & Risks
          companyDisclosure: body.companyDisclosure ?? undefined,
          dealRisks: body.dealRisks ?? undefined,

          // Document URLs
          pitchDeckUrl: body.pitchDeckUrl ?? undefined,
          financialDocsUrl: body.financialDocsUrl ?? undefined,
          termsSheetUrl: body.termsSheetUrl ?? undefined,
          incorporationDocsUrl: body.incorporationDocsUrl ?? undefined,
          instrumentTemplateUrl: body.instrumentTemplateUrl ?? undefined,
          riskDisclosureDocUrl: body.riskDisclosureDocUrl ?? undefined,
          subscriptionAgreementUrl: body.subscriptionAgreementUrl ?? undefined,
          capTableDocUrl: body.capTableDocUrl ?? undefined,
          financialStatementsUrl: body.financialStatementsUrl ?? undefined,
          founderBackgroundDocsUrl: body.founderBackgroundDocsUrl ?? undefined,
          customerContractsUrl: body.customerContractsUrl ?? undefined,
          bankStatementsUrl: body.bankStatementsUrl ?? undefined,
        },
        include: {
          company: {
            select: {
              id: true,
              legalName: true,
              tradingName: true,
              sector: true,
              stage: true,
            },
          },
        },
      });

      // Fire and forget — deal submission email (only if submitted for review)
      if (dealStatus === "UNDER_REVIEW") {
        (async () => {
          try {
            const emailUser = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { email: true } });
            if (emailUser) {
              const { subject, html } = dealSubmittedEmail(deal.name, deal.company.legalName);
              await sendEmail({ to: emailUser.email, subject, html });
            }
          } catch (err) {
            console.error("Deal submission email failed:", err);
          }
        })();
      }

      return res.status(201).json({
        success: true,
        data: deal,
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

      console.error("Create deal error:", error);
      return res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to create deal",
        },
      });
    }
  },
);

// GET /v1/deals - Browse deals (authenticated, with filters)
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const {
      companyId,
      lane,
      sector,
      stage,
      status = "LIVE",
      page = "1",
      limit = "20",
    } = req.query;

    const where: any = {};

    // Allow status=ALL to skip status filter (useful for founders viewing their own deals)
    if (status && status !== "ALL") {
      where.status = status;
    }

    if (companyId) where.companyId = companyId;
    if (lane) where.lane = lane;
    if (sector) {
      where.company = { sector };
    }
    if (stage) {
      where.company = { ...where.company, stage };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [deals, total] = await Promise.all([
      prisma.deal.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          name: true,
          lane: true,
          instrumentType: true,
          targetAmount: true,
          raisedAmount: true,
          minimumInvestment: true,
          duration: true,
          status: true,
          currentMonitoringStatus: true,
          createdAt: true,
          jurisdiction: true,
          entityType: true,
          offeringStructure: true,
          closingType: true,
          closeDate: true,
          company: {
            select: {
              id: true,
              legalName: true,
              tradingName: true,
              oneLineDescription: true,
              sector: true,
              stage: true,
              verificationRecords: {
                where: { status: "VERIFIED" },
                select: { type: true },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.deal.count({ where }),
    ]);

    return res.json({
      success: true,
      data: deals,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("List deals error:", error);
    return res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch deals",
      },
    });
  }
});

// GET /v1/deals/:id - Get deal details
router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deal = await prisma.deal.findUnique({
      where: { id },
      include: {
        company: {
          include: {
            founders: {
              include: {
                founder: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                      },
                    },
                  },
                },
              },
            },
            verificationRecords: {
              where: { status: "VERIFIED" },
              select: {
                type: true,
                verifiedAt: true,
              },
            },
          },
        },
        investments: {
          select: {
            id: true,
            commitmentAmount: true,
            fundedAmount: true,
            status: true,
            committedAt: true,
          },
        },
      },
    });

    if (!deal) {
      return res.status(404).json({
        success: false,
        error: {
          code: "DEAL_NOT_FOUND",
          message: "Deal not found",
        },
      });
    }

    // Calculate progress
    const targetAmount = Number(deal.targetAmount);
    const raisedAmount = Number(deal.raisedAmount);
    const progress = targetAmount > 0 ? (raisedAmount / targetAmount) * 100 : 0;

    return res.json({
      success: true,
      data: {
        ...deal,
        progress: Math.round(progress * 100) / 100, // Round to 2 decimals
      },
    });
  } catch (error) {
    console.error("Get deal error:", error);
    return res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch deal",
      },
    });
  }
});

// PATCH /v1/deals/:id - Update deal (founders only, only if DRAFT)
router.patch(
  "/:id",
  requireAuth,
  requireRole("FOUNDER"),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const body = updateDealSchema.parse(req.body);

      // Get deal with company
      const deal = await prisma.deal.findUnique({
        where: { id },
        include: {
          company: {
            include: {
              founders: true,
            },
          },
        },
      });

      if (!deal) {
        return res.status(404).json({
          success: false,
          error: {
            code: "DEAL_NOT_FOUND",
            message: "Deal not found",
          },
        });
      }

      // Verify user is founder
      const founderProfile = await prisma.founderProfile.findUnique({
        where: { userId: req.user!.id },
      });
      const isFounder = founderProfile
        ? deal.company.founders.some((f) => f.founderId === founderProfile.id)
        : false;
      if (!isFounder) {
        return res.status(403).json({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "You are not authorized to update this deal",
          },
        });
      }

      // Can only update DRAFT deals
      if (deal.status !== "DRAFT") {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_STATUS",
            message: "Can only update deals in DRAFT status",
          },
        });
      }

      // Build update data, converting closeDate string to Date if present
      const updateData: any = { ...body };
      if (body.closeDate) {
        updateData.closeDate = new Date(body.closeDate);
      }

      // Update deal
      const updatedDeal = await prisma.deal.update({
        where: { id },
        data: updateData,
      });

      return res.json({
        success: true,
        data: updatedDeal,
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

      console.error("Update deal error:", error);
      return res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to update deal",
        },
      });
    }
  },
);

// PATCH /v1/deals/:id/submit - Submit deal for review (founders only)
router.patch(
  "/:id/submit",
  requireAuth,
  requireRole("FOUNDER"),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const deal = await prisma.deal.findUnique({
        where: { id },
        include: {
          company: {
            include: { founders: true },
          },
        },
      });

      if (!deal) {
        return res.status(404).json({
          success: false,
          error: {
            code: "DEAL_NOT_FOUND",
            message: "Deal not found",
          },
        });
      }

      // Verify founder
      const founderProfile = await prisma.founderProfile.findUnique({
        where: { userId: req.user!.id },
      });
      const isFounder = founderProfile
        ? deal.company.founders.some((f) => f.founderId === founderProfile.id)
        : false;
      if (!isFounder) {
        return res.status(403).json({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Not authorized",
          },
        });
      }

      // Can only submit DRAFT deals
      if (deal.status !== "DRAFT") {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_STATUS",
            message: "Deal is not in DRAFT status",
          },
        });
      }

      // Update to UNDER_REVIEW
      const updatedDeal = await prisma.deal.update({
        where: { id },
        data: { status: "UNDER_REVIEW" },
      });

      // Fire and forget — deal submission email
      (async () => {
        try {
          const emailUser = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { email: true } });
          const dealCompany = await prisma.company.findUnique({ where: { id: deal.companyId }, select: { legalName: true } });
          if (emailUser && dealCompany) {
            const { subject, html } = dealSubmittedEmail(deal.name, dealCompany.legalName);
            await sendEmail({ to: emailUser.email, subject, html });
          }
        } catch (err) {
          console.error("Deal submission email failed:", err);
        }
      })();

      return res.json({
        success: true,
        data: updatedDeal,
        message: "Deal submitted for admin review",
      });
    } catch (error) {
      console.error("Submit deal error:", error);
      return res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to submit deal",
        },
      });
    }
  },
);

export default router;
