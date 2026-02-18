import { Router, Request, Response } from "express";
import { prisma } from "@capvista/database";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

// Validation schemas
const createInvestmentSchema = z.object({
  dealId: z.string(),
  commitmentAmount: z.number().positive(),
});

const fundInvestmentSchema = z.object({
  fundedAmount: z.number().positive(),
  externalRef: z.string().optional(),
});

// POST /v1/investments - Create investment (soft commitment)
router.post(
  "/",
  requireAuth,
  requireRole("INVESTOR"),
  async (req: Request, res: Response) => {
    try {
      const body = createInvestmentSchema.parse(req.body);

      // Verify investor has acknowledged risk
      const investorProfile = await prisma.investorProfile.findUnique({
        where: { userId: req.user!.id },
        select: { id: true, riskAcknowledged: true },
      });

      if (!investorProfile?.riskAcknowledged) {
        return res.status(400).json({
          success: false,
          error: {
            code: "RISK_ACKNOWLEDGEMENT_REQUIRED",
            message: "You must acknowledge investment risks before committing",
          },
        });
      }

      // Get deal and verify it's LIVE
      const deal = await prisma.deal.findUnique({
        where: { id: body.dealId },
        select: {
          id: true,
          status: true,
          targetAmount: true,
          raisedAmount: true,
          minimumInvestment: true,
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

      if (deal.status !== "LIVE") {
        return res.status(400).json({
          success: false,
          error: {
            code: "DEAL_NOT_LIVE",
            message: "Deal is not currently accepting investments",
          },
        });
      }

      // Verify minimum investment
      if (body.commitmentAmount < Number(deal.minimumInvestment)) {
        return res.status(400).json({
          success: false,
          error: {
            code: "BELOW_MINIMUM",
            message: `Minimum investment is ${deal.minimumInvestment}`,
          },
        });
      }

      // Check if deal would be over-subscribed
      const totalCommitted = Number(deal.raisedAmount) + body.commitmentAmount;
      if (totalCommitted > Number(deal.targetAmount)) {
        return res.status(400).json({
          success: false,
          error: {
            code: "OVERSUBSCRIBED",
            message: "This investment would exceed the deal target",
          },
        });
      }

      // Create investment in COMMITTED status
      if (!investorProfile) {
        return res.status(400).json({
          success: false,
          error: {
            code: "PROFILE_REQUIRED",
            message: "Complete your investor profile first",
          },
        });
      }

      const investment = await prisma.investment.create({
        data: {
          investorId: investorProfile.id,
          dealId: body.dealId,
          commitmentAmount: body.commitmentAmount,
          status: "COMMITTED",
        },
        include: {
          deal: {
            select: {
              id: true,
              name: true,
              lane: true,
              instrumentType: true,
              company: {
                select: {
                  legalName: true,
                  tradingName: true,
                },
              },
            },
          },
        },
      });

      return res.status(201).json({
        success: true,
        data: investment,
        message: "Investment committed. Please proceed to funding.",
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

      console.error("Create investment error:", error);
      return res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to create investment",
        },
      });
    }
  },
);

// POST /v1/investments/:id/fund - Fund investment (move to FUNDED)
router.post(
  "/:id/fund",
  requireAuth,
  requireRole("INVESTOR"),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const body = fundInvestmentSchema.parse(req.body);

      // Get investment
      const investment = await prisma.investment.findUnique({
        where: { id },
        include: {
          deal: true,
        },
      });

      if (!investment) {
        return res.status(404).json({
          success: false,
          error: {
            code: "INVESTMENT_NOT_FOUND",
            message: "Investment not found",
          },
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
          error: {
            code: "FORBIDDEN",
            message: "Not authorized",
          },
        });
      }

      // Can only fund COMMITTED investments
      if (investment.status !== "COMMITTED") {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_STATUS",
            message: "Investment is not in COMMITTED status",
          },
        });
      }

      // Verify funded amount matches commitment
      if (body.fundedAmount !== Number(investment.commitmentAmount)) {
        return res.status(400).json({
          success: false,
          error: {
            code: "AMOUNT_MISMATCH",
            message: "Funded amount must match commitment amount",
          },
        });
      }

      // Update investment to FUNDED and create escrow transaction
      const [updatedInvestment, escrowTx] = await prisma.$transaction([
        prisma.investment.update({
          where: { id },
          data: {
            fundedAmount: body.fundedAmount,
            fundedAt: new Date(),
            status: "FUNDED",
            currentValue: body.fundedAmount,
          },
        }),
        prisma.escrowTransaction.create({
          data: {
            investmentId: id,
            amount: body.fundedAmount,
            direction: "INVESTOR_TO_ESCROW",
            status: "COMPLETED",
            externalRef: body.externalRef,
          },
        }),
        // Update deal raised amount
        prisma.deal.update({
          where: { id: investment.dealId },
          data: {
            raisedAmount: {
              increment: body.fundedAmount,
            },
          },
        }),
      ]);

      return res.json({
        success: true,
        data: updatedInvestment,
        message: "Investment funded successfully",
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

      console.error("Fund investment error:", error);
      return res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fund investment",
        },
      });
    }
  },
);

// GET /v1/investments/:id - Get investment details
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
        error: {
          code: "INVESTMENT_NOT_FOUND",
          message: "Investment not found",
        },
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
        error: {
          code: "FORBIDDEN",
          message: "Not authorized",
        },
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
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch investment",
      },
    });
  }
});

// GET /v1/investments/investor/:userId/portfolio - Get investor portfolio
router.get(
  "/investor/:userId/portfolio",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      // Verify access (own portfolio OR admin)
      if (userId !== req.user!.id && req.user!.role !== "ADMIN") {
        return res.status(403).json({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Not authorized",
          },
        });
      }

      const investorProfile = await prisma.investorProfile.findUnique({
        where: { userId },
        select: { id: true },
      });

      const investments = await prisma.investment.findMany({
        where: { investorId: investorProfile?.id || "" },
        include: {
          deal: {
            select: {
              id: true,
              name: true,
              lane: true,
              instrumentType: true,
              currentMonitoringStatus: true,
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
        {
          totalCommitted: 0,
          totalFunded: 0,
          totalCurrentValue: 0,
          totalReturned: 0,
        },
      );

      const totalReturns =
        totals.totalCurrentValue + totals.totalReturned - totals.totalFunded;
      const portfolioMultiple =
        totals.totalFunded > 0
          ? (totals.totalCurrentValue + totals.totalReturned) /
            totals.totalFunded
          : 0;

      return res.json({
        success: true,
        data: {
          investments,
          summary: {
            ...totals,
            totalReturns,
            portfolioMultiple: Math.round(portfolioMultiple * 100) / 100,
            investmentCount: investments.length,
            activeCount: investments.filter(
              (i) => i.status === "ACTIVE" || i.status === "FUNDED",
            ).length,
          },
        },
      });
    } catch (error) {
      console.error("Get portfolio error:", error);
      return res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch portfolio",
        },
      });
    }
  },
);

export default router;
