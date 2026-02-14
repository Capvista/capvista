import { Router, Request, Response } from "express";
import { prisma } from "@capvista/database";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";

const router = Router();

// Validation schema
const updateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
});

// GET /api/users/me - Get current user profile + role-specific profile
router.get("/me", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        founderProfile: {
          include: {
            companiesOwned: {
              select: {
                id: true,
                legalName: true,
                tradingName: true,
                sector: true,
                stage: true,
                oneLineDescription: true,
                verificationStatus: true,
              },
            },
          },
        },
        investorProfile: {
          include: {
            investments: {
              select: {
                id: true,
                commitmentAmount: true,
                fundedAmount: true,
                status: true,
                deal: {
                  select: {
                    id: true,
                    name: true,
                    company: {
                      select: {
                        legalName: true,
                        tradingName: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "User not found",
        },
      });
    }

    return res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch user profile",
      },
    });
  }
});

// PATCH /api/users/me - Update current user profile
router.patch("/me", requireAuth, async (req: Request, res: Response) => {
  try {
    const body = updateUserSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: body,
    });

    return res.json({
      success: true,
      data: user,
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

    console.error("Update user error:", error);
    return res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to update user profile",
      },
    });
  }
});

export default router;
