import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { submissionLimiter } from "../middleware/rateLimiter";
import { isValidUUID } from "../utils/sanitize";

const router = Router();

// ============================================================================
// GET /api/watchlist — Get user's watchlist (company IDs)
// ============================================================================
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const items = await prisma.watchlist.findMany({
      where: { userId: req.user!.id },
      select: { companyId: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      success: true,
      data: items.map((item) => item.companyId),
    });
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    return res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Failed to fetch watchlist" },
    });
  }
});

// ============================================================================
// POST /api/watchlist/:companyId — Add company to watchlist
// ============================================================================
router.post("/:companyId", submissionLimiter, requireAuth, async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    if (!isValidUUID(companyId)) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid company ID format" },
      });
    }

    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true },
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Company not found" },
      });
    }

    // Upsert to handle duplicate gracefully
    await prisma.watchlist.upsert({
      where: {
        userId_companyId: {
          userId: req.user!.id,
          companyId,
        },
      },
      create: {
        userId: req.user!.id,
        companyId,
      },
      update: {},
    });

    return res.status(201).json({
      success: true,
      message: "Company added to watchlist",
    });
  } catch (error) {
    console.error("Error adding to watchlist:", error);
    return res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Failed to add to watchlist" },
    });
  }
});

// ============================================================================
// DELETE /api/watchlist/:companyId — Remove company from watchlist
// ============================================================================
router.delete("/:companyId", requireAuth, async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    if (!isValidUUID(companyId)) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid company ID format" },
      });
    }

    await prisma.watchlist.deleteMany({
      where: {
        userId: req.user!.id,
        companyId,
      },
    });

    return res.json({
      success: true,
      message: "Company removed from watchlist",
    });
  } catch (error) {
    console.error("Error removing from watchlist:", error);
    return res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Failed to remove from watchlist" },
    });
  }
});

export default router;
