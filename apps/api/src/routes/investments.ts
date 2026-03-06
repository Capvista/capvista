import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth";
import { submissionLimiter } from "../middleware/rateLimiter";
import { sendEmail } from "../lib/email";
import { investmentCommitmentEmail, fundingInstructionsEmail } from "../lib/emailTemplates";

const router = Router();

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const expressInterestSchema = z.object({
  dealId: z.string(),
});

const commitSchema = z.object({
  commitmentAmount: z.number().positive(),
});

const subscribeSchema = z.object({
  confirmedQualifiedInvestor: z.boolean(),
  confirmedUnderstandsRisks: z.boolean(),
  confirmedOwnAccount: z.boolean(),
  confirmedNoLiquidityExpectation: z.boolean(),
  eSignature: z.string().min(1),
});

const fundingMethodSchema = z.object({
  fundingMethod: z.enum(["wire", "ach", "escrow"]),
});

// ============================================================================
// HELPERS
// ============================================================================

function generateFundingReference(dealId: string, investorId: string): string {
  const dealShort = dealId.slice(-6).toUpperCase();
  const investorShort = investorId.slice(-6).toUpperCase();
  const ts = Date.now().toString(36).toUpperCase();
  return `CV-${dealShort}-${investorShort}-${ts}`;
}

function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const dayOfWeek = result.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      added++;
    }
  }
  return result;
}

// ============================================================================
// POST /express-interest — Phase 1: Express interest in a deal
// ============================================================================

router.post(
  "/express-interest",
  submissionLimiter,
  requireAuth,
  requireRole("INVESTOR"),
  async (req: Request, res: Response) => {
    try {
      const body = expressInterestSchema.parse(req.body);

      // Get investor profile
      const investorProfile = await prisma.investorProfile.findUnique({
        where: { userId: req.user!.id },
        select: { id: true, verificationStatus: true, riskAcknowledged: true },
      });

      if (!investorProfile) {
        return res.status(400).json({
          success: false,
          error: {
            code: "PROFILE_REQUIRED",
            message: "Complete your investor profile first",
          },
        });
      }

      if (investorProfile.verificationStatus !== "VERIFIED") {
        return res.status(400).json({
          success: false,
          error: {
            code: "NOT_VERIFIED",
            message: "Your investor profile must be verified before investing",
          },
        });
      }

      // Get deal
      const deal = await prisma.deal.findUnique({
        where: { id: body.dealId },
        include: {
          company: {
            select: { legalName: true, tradingName: true },
          },
        },
      });

      if (!deal) {
        return res.status(404).json({
          success: false,
          error: { code: "DEAL_NOT_FOUND", message: "Deal not found" },
        });
      }

      if (deal.status !== "LIVE") {
        return res.status(400).json({
          success: false,
          error: {
            code: "DEAL_NOT_LIVE",
            message: "This deal is not currently accepting interest",
          },
        });
      }

      // Check for duplicate
      const existing = await prisma.investment.findFirst({
        where: {
          investorId: investorProfile.id,
          dealId: body.dealId,
          status: { notIn: ["CANCELLED"] },
        },
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          error: {
            code: "DUPLICATE_INTEREST",
            message: "You have already expressed interest in this deal",
          },
          data: existing,
        });
      }

      // Check capacity
      const targetAmount = Number(deal.targetAmount || 0);
      const raisedAmount = Number(deal.raisedAmount || 0);
      const atCapacity = targetAmount > 0 && raisedAmount >= targetAmount;

      if (atCapacity && !deal.allowWaitlist) {
        return res.status(400).json({
          success: false,
          error: {
            code: "FULLY_SUBSCRIBED",
            message: "This deal is fully subscribed and is not accepting a waitlist",
          },
        });
      }

      // Determine waitlist position if at capacity
      let waitlisted = false;
      let waitlistPosition: number | undefined;

      if (atCapacity && deal.allowWaitlist) {
        waitlisted = true;
        const maxPosition = await prisma.investment.aggregate({
          where: { dealId: body.dealId, waitlisted: true },
          _max: { waitlistPosition: true },
        });
        waitlistPosition = (maxPosition._max.waitlistPosition || 0) + 1;
      }

      const investment = await prisma.investment.create({
        data: {
          investorId: investorProfile.id,
          dealId: body.dealId,
          status: waitlisted ? "WAITLISTED" : "INTERESTED",
          interestedAt: new Date(),
          waitlisted,
          waitlistPosition: waitlistPosition ?? null,
        },
        include: {
          deal: {
            select: {
              id: true,
              name: true,
              lane: true,
              instrumentType: true,
              targetAmount: true,
              raisedAmount: true,
              minimumInvestment: true,
              terms: true,
              closeDate: true,
              company: {
                select: { legalName: true, tradingName: true },
              },
            },
          },
        },
      });

      return res.status(201).json({
        success: true,
        data: investment,
        message: waitlisted
          ? `You have been added to the waitlist at position ${waitlistPosition}`
          : "Interest registered. Please proceed to commitment.",
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
      console.error("Express interest error:", error);
      return res.status(500).json({
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to express interest" },
      });
    }
  },
);

// ============================================================================
// PATCH /:id/commit — Phase 2: Enter commitment amount
// ============================================================================

router.patch(
  "/:id/commit",
  requireAuth,
  requireRole("INVESTOR"),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const body = commitSchema.parse(req.body);

      // Get investment with deal
      const investment = await prisma.investment.findUnique({
        where: { id },
        include: {
          deal: {
            select: {
              id: true,
              name: true,
              lane: true,
              instrumentType: true,
              targetAmount: true,
              raisedAmount: true,
              minimumInvestment: true,
              terms: true,
              allowWaitlist: true,
            },
          },
        },
      });

      if (!investment) {
        return res.status(404).json({
          success: false,
          error: { code: "NOT_FOUND", message: "Investment not found" },
        });
      }

      // Verify ownership
      const investorProfile = await prisma.investorProfile.findUnique({
        where: { userId: req.user!.id },
        select: { id: true },
      });

      if (!investorProfile || investment.investorId !== investorProfile.id) {
        return res.status(403).json({
          success: false,
          error: { code: "FORBIDDEN", message: "Not authorized" },
        });
      }

      if (investment.status !== "INTERESTED") {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_STATUS",
            message: `Investment must be in INTERESTED status to commit. Current: ${investment.status}`,
          },
        });
      }

      // Validate minimum
      const minInvestment = Number(investment.deal.minimumInvestment || 0);
      if (body.commitmentAmount < minInvestment) {
        return res.status(400).json({
          success: false,
          error: {
            code: "BELOW_MINIMUM",
            message: `Minimum investment is $${minInvestment.toLocaleString()}`,
          },
        });
      }

      // Check oversubscription
      const targetAmount = Number(investment.deal.targetAmount || 0);
      const raisedAmount = Number(investment.deal.raisedAmount || 0);
      const wouldExceed = targetAmount > 0 && raisedAmount + body.commitmentAmount > targetAmount;

      if (wouldExceed && !investment.deal.allowWaitlist) {
        return res.status(400).json({
          success: false,
          error: {
            code: "FULLY_SUBSCRIBED",
            message: "This offering is fully subscribed",
          },
        });
      }

      // If oversubscribed but waitlist allowed, create as WAITLISTED
      if (wouldExceed && investment.deal.allowWaitlist) {
        const maxPosition = await prisma.investment.aggregate({
          where: { dealId: investment.dealId, waitlisted: true },
          _max: { waitlistPosition: true },
        });
        const waitlistPosition = (maxPosition._max.waitlistPosition || 0) + 1;

        const waitlisted = await prisma.investment.update({
          where: { id },
          data: {
            commitmentAmount: body.commitmentAmount,
            status: "WAITLISTED",
            committedAt: new Date(),
            waitlisted: true,
            waitlistPosition,
          },
          include: {
            deal: {
              select: {
                id: true,
                name: true,
                lane: true,
                instrumentType: true,
                company: { select: { legalName: true, tradingName: true } },
              },
            },
          },
        });

        return res.json({
          success: true,
          data: waitlisted,
          message: `This offering is fully subscribed. You have been added to the waitlist at position ${waitlistPosition}.`,
        });
      }

      // Calculate dynamic info based on instrument type
      const terms = (investment.deal.terms as any) || {};
      const platformFeeRate = 0.02; // 2%
      const platformFee = body.commitmentAmount * platformFeeRate;
      const netInvestment = body.commitmentAmount - platformFee;
      let investmentSummary: any = {
        commitmentAmount: body.commitmentAmount,
        platformFee,
        platformFeeRate: `${platformFeeRate * 100}%`,
        netInvestment,
      };

      if (investment.deal.lane === "VENTURES") {
        if (investment.deal.instrumentType === "SAFE") {
          const valuationCap = terms.valuationCap || terms.valuation_cap;
          if (valuationCap) {
            const ownershipEstimate = (netInvestment / Number(valuationCap)) * 100;
            investmentSummary.ownershipEstimate = `${ownershipEstimate.toFixed(4)}%`;
            investmentSummary.valuationCap = valuationCap;
          }
          if (terms.discount) {
            investmentSummary.discount = terms.discount;
          }
        } else if (investment.deal.instrumentType === "CONVERTIBLE_NOTE") {
          const valuationCap = terms.valuationCap || terms.valuation_cap;
          if (valuationCap) {
            const conversionEstimate = (netInvestment / Number(valuationCap)) * 100;
            investmentSummary.conversionEstimate = `${conversionEstimate.toFixed(4)}%`;
            investmentSummary.valuationCap = valuationCap;
          }
          if (terms.interestRate) investmentSummary.interestRate = terms.interestRate;
          if (terms.maturityDate) investmentSummary.maturityDate = terms.maturityDate;
        } else if (investment.deal.instrumentType === "SPV_EQUITY") {
          const preMoneyValuation = terms.preMoneyValuation || terms.valuation;
          if (preMoneyValuation) {
            const ownershipEstimate = (netInvestment / (Number(preMoneyValuation) + targetAmount)) * 100;
            investmentSummary.ownershipEstimate = `${ownershipEstimate.toFixed(4)}%`;
            investmentSummary.preMoneyValuation = preMoneyValuation;
          }
        }
      } else if (investment.deal.lane === "YIELD") {
        const revenueSharePct = terms.revenueSharePercentage || terms.revenueShare;
        const repaymentCap = terms.repaymentCap || terms.returnCap;
        if (revenueSharePct) {
          investmentSummary.revenueSharePercentage = revenueSharePct;
        }
        if (repaymentCap) {
          const expectedReturn = netInvestment * Number(repaymentCap);
          investmentSummary.expectedReturn = expectedReturn;
          investmentSummary.repaymentCap = `${repaymentCap}x`;
        }
        if (terms.paymentFrequency) investmentSummary.paymentFrequency = terms.paymentFrequency;
      }

      // Update investment
      const updated = await prisma.investment.update({
        where: { id },
        data: {
          commitmentAmount: body.commitmentAmount,
          status: "COMMITTED",
          committedAt: new Date(),
        },
        include: {
          deal: {
            select: {
              id: true,
              name: true,
              lane: true,
              instrumentType: true,
              company: { select: { legalName: true, tradingName: true } },
            },
          },
        },
      });

      // Fire and forget — investment commitment email
      (async () => {
        try {
          const investorUser = await prisma.investorProfile.findUnique({
            where: { id: investment.investorId },
            select: { user: { select: { email: true } } },
          });
          if (investorUser) {
            const companyName = updated.deal.company.legalName || updated.deal.company.tradingName || "";
            const { subject, html } = investmentCommitmentEmail(
              updated.deal.name,
              companyName,
              body.commitmentAmount,
              updated.deal.id,
            );
            await sendEmail({ to: investorUser.user.email, subject, html });
          }
        } catch (err) {
          console.error("Investment commitment email failed:", err);
        }
      })();

      return res.json({
        success: true,
        data: updated,
        investmentSummary,
        message: "Commitment recorded. Please proceed to subscription agreement.",
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
      console.error("Commit error:", error);
      return res.status(500).json({
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to commit investment" },
      });
    }
  },
);

// ============================================================================
// PATCH /:id/subscribe — Phase 3: Sign subscription agreement
// ============================================================================

router.patch(
  "/:id/subscribe",
  requireAuth,
  requireRole("INVESTOR"),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const body = subscribeSchema.parse(req.body);

      const investment = await prisma.investment.findUnique({
        where: { id },
      });

      if (!investment) {
        return res.status(404).json({
          success: false,
          error: { code: "NOT_FOUND", message: "Investment not found" },
        });
      }

      // Verify ownership
      const investorProfile = await prisma.investorProfile.findUnique({
        where: { userId: req.user!.id },
        select: { id: true },
      });

      if (!investorProfile || investment.investorId !== investorProfile.id) {
        return res.status(403).json({
          success: false,
          error: { code: "FORBIDDEN", message: "Not authorized" },
        });
      }

      if (investment.status !== "COMMITTED") {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_STATUS",
            message: `Investment must be in COMMITTED status to subscribe. Current: ${investment.status}`,
          },
        });
      }

      // Validate all confirmations are true
      if (
        !body.confirmedQualifiedInvestor ||
        !body.confirmedUnderstandsRisks ||
        !body.confirmedOwnAccount ||
        !body.confirmedNoLiquidityExpectation
      ) {
        return res.status(400).json({
          success: false,
          error: {
            code: "CONFIRMATIONS_REQUIRED",
            message: "All investor representations must be confirmed",
          },
        });
      }

      if (!body.eSignature || body.eSignature.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: "SIGNATURE_REQUIRED",
            message: "Electronic signature (typed full name) is required",
          },
        });
      }

      const now = new Date();
      const clientIp = req.ip || req.socket.remoteAddress || "unknown";

      const updated = await prisma.investment.update({
        where: { id },
        data: {
          confirmedQualifiedInvestor: true,
          confirmedUnderstandsRisks: true,
          confirmedOwnAccount: true,
          confirmedNoLiquidityExpectation: true,
          eSignature: body.eSignature.trim(),
          eSignatureTimestamp: now,
          eSignatureIp: clientIp,
          subscriptionAgreementSignedAt: now,
          subscriptionAgreementIp: clientIp,
          status: "PENDING_FUNDING",
        },
        include: {
          deal: {
            select: {
              id: true,
              name: true,
              lane: true,
              instrumentType: true,
              company: { select: { legalName: true, tradingName: true } },
            },
          },
        },
      });

      return res.json({
        success: true,
        data: updated,
        message: "Subscription agreement signed. Please select your funding method.",
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
      console.error("Subscribe error:", error);
      return res.status(500).json({
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to sign subscription" },
      });
    }
  },
);

// ============================================================================
// PATCH /:id/funding-method — Phase 4: Select funding method
// ============================================================================

router.patch(
  "/:id/funding-method",
  requireAuth,
  requireRole("INVESTOR"),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const body = fundingMethodSchema.parse(req.body);

      const investment = await prisma.investment.findUnique({
        where: { id },
        include: {
          deal: {
            select: {
              id: true,
              name: true,
              company: { select: { legalName: true, tradingName: true } },
            },
          },
        },
      });

      if (!investment) {
        return res.status(404).json({
          success: false,
          error: { code: "NOT_FOUND", message: "Investment not found" },
        });
      }

      // Verify ownership
      const investorProfile = await prisma.investorProfile.findUnique({
        where: { userId: req.user!.id },
        select: { id: true },
      });

      if (!investorProfile || investment.investorId !== investorProfile.id) {
        return res.status(403).json({
          success: false,
          error: { code: "FORBIDDEN", message: "Not authorized" },
        });
      }

      if (investment.status !== "PENDING_FUNDING") {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_STATUS",
            message: `Investment must be in PENDING_FUNDING status. Current: ${investment.status}`,
          },
        });
      }

      const fundingReference = generateFundingReference(
        investment.dealId,
        investment.investorId,
      );
      const fundingDeadline = addBusinessDays(new Date(), 7);

      const wireInstructions = {
        bankName: "Capvista Trust & Escrow Services",
        accountName: "Capvista Escrow Account",
        accountNumber: "XXXXX-XXXXX-1234",
        routingNumber: "021000021",
        swiftCode: "CVSTUS33",
        reference: fundingReference,
        amount: Number(investment.commitmentAmount),
        currency: "USD",
        deadline: fundingDeadline.toISOString(),
        instructions: `Include reference code ${fundingReference} in your wire memo. Funds must be received by ${fundingDeadline.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}.`,
      };

      const updated = await prisma.investment.update({
        where: { id },
        data: {
          fundingMethod: body.fundingMethod,
          fundingReference,
          fundingDeadline,
          wireInstructions,
        },
        include: {
          deal: {
            select: {
              id: true,
              name: true,
              lane: true,
              instrumentType: true,
              company: { select: { legalName: true, tradingName: true } },
            },
          },
        },
      });

      // Fire and forget — funding instructions email
      (async () => {
        try {
          const investorUser = await prisma.investorProfile.findUnique({
            where: { id: investment.investorId },
            select: { user: { select: { email: true } } },
          });
          if (investorUser) {
            const { subject, html } = fundingInstructionsEmail(
              investment.deal.name,
              wireInstructions,
            );
            await sendEmail({ to: investorUser.user.email, subject, html });
          }
        } catch (err) {
          console.error("Funding instructions email failed:", err);
        }
      })();

      return res.json({
        success: true,
        data: updated,
        wireInstructions,
        message:
          "Funding method selected. Please transfer funds using the provided instructions. An admin will confirm receipt.",
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
      console.error("Funding method error:", error);
      return res.status(500).json({
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to set funding method" },
      });
    }
  },
);

// ============================================================================
// GET /my-investments — Get investor's investments
// ============================================================================

router.get(
  "/my-investments",
  requireAuth,
  requireRole("INVESTOR"),
  async (req: Request, res: Response) => {
    try {
      const investorProfile = await prisma.investorProfile.findUnique({
        where: { userId: req.user!.id },
        select: { id: true },
      });

      if (!investorProfile) {
        return res.status(400).json({
          success: false,
          error: { code: "PROFILE_REQUIRED", message: "Complete your investor profile first" },
        });
      }

      const investments = await prisma.investment.findMany({
        where: { investorId: investorProfile.id },
        include: {
          deal: {
            select: {
              id: true,
              name: true,
              lane: true,
              instrumentType: true,
              targetAmount: true,
              raisedAmount: true,
              status: true,
              company: {
                select: {
                  id: true,
                  legalName: true,
                  tradingName: true,
                  sector: true,
                  logoUrl: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      // Calculate portfolio totals
      const totals = investments.reduce(
        (acc, inv) => {
          const committed = Number(inv.commitmentAmount);
          const funded = Number(inv.fundedAmount);
          const current = Number(inv.currentValue);
          const returned = Number(inv.totalReturned);

          return {
            totalCommitted: acc.totalCommitted + committed,
            totalFunded: acc.totalFunded + funded,
            totalCurrentValue: acc.totalCurrentValue + current,
            totalReturned: acc.totalReturned + returned,
          };
        },
        { totalCommitted: 0, totalFunded: 0, totalCurrentValue: 0, totalReturned: 0 },
      );

      return res.json({
        success: true,
        data: {
          investments,
          summary: {
            ...totals,
            investmentCount: investments.length,
            activeCount: investments.filter(
              (i) => i.status === "ACTIVE" || i.status === "FUNDED",
            ).length,
          },
        },
      });
    } catch (error) {
      console.error("Get my investments error:", error);
      return res.status(500).json({
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to fetch investments" },
      });
    }
  },
);

// ============================================================================
// GET /:id — Get single investment details
// ============================================================================

router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const investment = await prisma.investment.findUnique({
      where: { id },
      include: {
        deal: {
          include: {
            company: {
              select: {
                id: true,
                legalName: true,
                tradingName: true,
                sector: true,
                currentMonitoringStatus: true,
              },
            },
          },
        },
        escrowTransactions: {
          orderBy: { createdAt: "desc" },
        },
        ownershipRecords: true,
      },
    });

    if (!investment) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Investment not found" },
      });
    }

    // Verify access (investor owns it OR admin)
    const investorProfile = await prisma.investorProfile.findUnique({
      where: { userId: req.user!.id },
      select: { id: true },
    });
    if (
      (!investorProfile || investment.investorId !== investorProfile.id) &&
      req.user!.role !== "ADMIN"
    ) {
      return res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "Not authorized" },
      });
    }

    // Calculate returns
    const fundedAmount = Number(investment.fundedAmount);
    const currentValue = Number(investment.currentValue);
    const totalReturned = Number(investment.totalReturned);
    const returns = currentValue + totalReturned - fundedAmount;
    const returnPercentage =
      fundedAmount > 0 ? (returns / fundedAmount) * 100 : 0;

    return res.json({
      success: true,
      data: {
        ...investment,
        calculated: {
          returns,
          returnPercentage: Math.round(returnPercentage * 100) / 100,
        },
      },
    });
  } catch (error) {
    console.error("Get investment error:", error);
    return res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to fetch investment" },
    });
  }
});

// ============================================================================
// PATCH /:id/cancel — Cancel investment (only if not yet FUNDED)
// ============================================================================

router.patch(
  "/:id/cancel",
  requireAuth,
  requireRole("INVESTOR"),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const investment = await prisma.investment.findUnique({
        where: { id },
      });

      if (!investment) {
        return res.status(404).json({
          success: false,
          error: { code: "NOT_FOUND", message: "Investment not found" },
        });
      }

      // Verify ownership
      const investorProfile = await prisma.investorProfile.findUnique({
        where: { userId: req.user!.id },
        select: { id: true },
      });

      if (!investorProfile || investment.investorId !== investorProfile.id) {
        return res.status(403).json({
          success: false,
          error: { code: "FORBIDDEN", message: "Not authorized" },
        });
      }

      const cancellableStatuses = ["INTERESTED", "COMMITTED", "PENDING_FUNDING", "WAITLISTED"];
      if (!cancellableStatuses.includes(investment.status)) {
        return res.status(400).json({
          success: false,
          error: {
            code: "CANNOT_CANCEL",
            message: "Investment cannot be cancelled after funding has been confirmed",
          },
        });
      }

      const updated = await prisma.investment.update({
        where: { id },
        data: { status: "CANCELLED" },
      });

      // If a non-waitlisted investment was cancelled, promote the next waitlisted investor
      if (investment.status !== "WAITLISTED") {
        const nextWaitlisted = await prisma.investment.findFirst({
          where: {
            dealId: investment.dealId,
            status: "WAITLISTED",
            waitlisted: true,
          },
          orderBy: { waitlistPosition: "asc" },
        });

        if (nextWaitlisted) {
          await prisma.investment.update({
            where: { id: nextWaitlisted.id },
            data: {
              status: "INTERESTED",
              waitlisted: false,
              waitlistPosition: null,
            },
          });
        }
      }

      return res.json({
        success: true,
        data: updated,
        message: "Investment cancelled",
      });
    } catch (error) {
      console.error("Cancel investment error:", error);
      return res.status(500).json({
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to cancel investment" },
      });
    }
  },
);

export default router;
