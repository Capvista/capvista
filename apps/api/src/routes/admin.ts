import { Router, Request, Response } from "express";
import { prisma } from "@capvista/database";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

// All admin routes require authentication and ADMIN role
router.use(requireAuth, requireRole("ADMIN"));

// ============================================================================
// DASHBOARD STATS
// ============================================================================

// GET /api/admin/stats — dashboard overview counts
router.get("/stats", async (req: Request, res: Response) => {
  try {
    const [
      totalCompanies,
      pendingCompanies,
      approvedCompanies,
      rejectedCompanies,
      totalInvestors,
      pendingInvestors,
      verifiedInvestors,
      rejectedInvestors,
      totalUsers,
      totalDeals,
      underReviewDeals,
      approvedDeals,
      liveDeals,
    ] = await Promise.all([
      prisma.company.count(),
      prisma.company.count({ where: { approvalStatus: "PENDING_REVIEW" } }),
      prisma.company.count({ where: { approvalStatus: "APPROVED" } }),
      prisma.company.count({ where: { approvalStatus: "REJECTED" } }),
      prisma.investorProfile.count(),
      prisma.investorProfile.count({ where: { verificationStatus: "PENDING" } }),
      prisma.investorProfile.count({ where: { verificationStatus: "VERIFIED" } }),
      prisma.investorProfile.count({ where: { verificationStatus: "REJECTED" } }),
      prisma.user.count(),
      prisma.deal.count(),
      prisma.deal.count({ where: { status: "UNDER_REVIEW" } }),
      prisma.deal.count({ where: { status: "APPROVED" } }),
      prisma.deal.count({ where: { status: "LIVE" } }),
    ]);

    return res.json({
      success: true,
      data: {
        companies: { total: totalCompanies, pending: pendingCompanies, approved: approvedCompanies, rejected: rejectedCompanies },
        investors: { total: totalInvestors, pending: pendingInvestors, verified: verifiedInvestors, rejected: rejectedInvestors },
        users: totalUsers,
        deals: { total: totalDeals, underReview: underReviewDeals, approved: approvedDeals, live: liveDeals },
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to fetch stats" },
    });
  }
});

// ============================================================================
// ACTIVITY LOG
// ============================================================================

// GET /api/admin/activity — recent admin actions (paginated)
router.get("/activity", async (req: Request, res: Response) => {
  try {
    const { page = "1", limit = "20" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [actions, total] = await Promise.all([
      prisma.adminAction.findMany({
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          admin: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      }),
      prisma.adminAction.count(),
    ]);

    return res.json({
      success: true,
      data: actions,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Admin activity error:", error);
    return res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to fetch activity" },
    });
  }
});

// GET /api/admin/activity/recent — recent submissions (companies + investors) for dashboard feed
router.get("/activity/recent", async (req: Request, res: Response) => {
  try {
    const [recentCompanies, recentInvestors] = await Promise.all([
      prisma.company.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          legalName: true,
          approvalStatus: true,
          createdAt: true,
          owner: {
            include: {
              user: { select: { email: true, firstName: true, lastName: true } },
            },
          },
        },
      }),
      prisma.investorProfile.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          fullName: true,
          verificationStatus: true,
          createdAt: true,
          user: { select: { email: true, firstName: true, lastName: true } },
        },
      }),
    ]);

    const feed = [
      ...recentCompanies.map((c) => ({
        type: "Company" as const,
        id: c.id,
        name: c.legalName,
        email: c.owner.user.email,
        status: c.approvalStatus,
        createdAt: c.createdAt,
      })),
      ...recentInvestors.map((i) => ({
        type: "Investor" as const,
        id: i.id,
        name: i.fullName || `${i.user.firstName} ${i.user.lastName}`,
        email: i.user.email,
        status: i.verificationStatus,
        createdAt: i.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    return res.json({ success: true, data: feed });
  } catch (error) {
    console.error("Admin recent activity error:", error);
    return res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to fetch recent activity" },
    });
  }
});

// ============================================================================
// COMPANIES
// ============================================================================

// GET /api/admin/companies — list companies with filters
router.get("/companies", async (req: Request, res: Response) => {
  try {
    const { approvalStatus, sector, search, page = "1", limit = "20" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {};
    if (approvalStatus) where.approvalStatus = approvalStatus;
    if (sector) where.sector = sector;
    if (search) {
      where.OR = [
        { legalName: { contains: String(search), mode: "insensitive" } },
        { owner: { user: { email: { contains: String(search), mode: "insensitive" } } } },
      ];
    }

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          owner: {
            include: {
              user: { select: { id: true, email: true, firstName: true, lastName: true } },
            },
          },
        },
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
    console.error("Admin list companies error:", error);
    return res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to fetch companies" },
    });
  }
});

// GET /api/admin/companies/:id — full company detail
router.get("/companies/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        owner: {
          include: {
            user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
          },
        },
        founders: {
          include: {
            founder: {
              include: {
                user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
              },
            },
          },
        },
        deals: true,
        verificationRecords: true,
      },
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Company not found" },
      });
    }

    return res.json({ success: true, data: company });
  } catch (error) {
    console.error("Admin get company error:", error);
    return res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to fetch company" },
    });
  }
});

// PATCH /api/admin/companies/:id/approve
router.patch("/companies/:id/approve", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const company = await prisma.company.findUnique({ where: { id } });
    if (!company) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Company not found" },
      });
    }

    await prisma.$transaction([
      prisma.company.update({
        where: { id },
        data: { approvalStatus: "APPROVED" },
      }),
      prisma.adminAction.create({
        data: {
          adminId: req.user!.id,
          actionType: "COMPANY_APPROVED",
          targetType: "COMPANY",
          targetId: id,
        },
      }),
    ]);

    return res.json({ success: true, message: "Company approved" });
  } catch (error) {
    console.error("Admin approve company error:", error);
    return res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to approve company" },
    });
  }
});

// PATCH /api/admin/companies/:id/reject
router.patch("/companies/:id/reject", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Reason is required for rejection" },
      });
    }

    const company = await prisma.company.findUnique({ where: { id } });
    if (!company) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Company not found" },
      });
    }

    await prisma.$transaction([
      prisma.company.update({
        where: { id },
        data: { approvalStatus: "REJECTED" },
      }),
      prisma.adminAction.create({
        data: {
          adminId: req.user!.id,
          actionType: "COMPANY_REJECTED",
          targetType: "COMPANY",
          targetId: id,
          reason,
        },
      }),
    ]);

    return res.json({ success: true, message: "Company rejected" });
  } catch (error) {
    console.error("Admin reject company error:", error);
    return res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to reject company" },
    });
  }
});

// PATCH /api/admin/companies/:id/info
router.patch("/companies/:id/info", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Message is required" },
      });
    }

    const company = await prisma.company.findUnique({ where: { id } });
    if (!company) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Company not found" },
      });
    }

    await prisma.$transaction([
      prisma.company.update({
        where: { id },
        data: { approvalStatus: "INFO_REQUESTED" },
      }),
      prisma.adminAction.create({
        data: {
          adminId: req.user!.id,
          actionType: "COMPANY_INFO_REQUESTED",
          targetType: "COMPANY",
          targetId: id,
          reason: message,
        },
      }),
    ]);

    return res.json({ success: true, message: "Info requested from company" });
  } catch (error) {
    console.error("Admin request info company error:", error);
    return res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to request info" },
    });
  }
});

// ============================================================================
// INVESTORS
// ============================================================================

// GET /api/admin/investors — list investor profiles with filters
router.get("/investors", async (req: Request, res: Response) => {
  try {
    const { verificationStatus, country, search, page = "1", limit = "20" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {};
    if (verificationStatus) where.verificationStatus = verificationStatus;
    if (country) where.countryOfResidence = country;
    if (search) {
      where.OR = [
        { fullName: { contains: String(search), mode: "insensitive" } },
        { user: { email: { contains: String(search), mode: "insensitive" } } },
      ];
    }

    const [investors, total] = await Promise.all([
      prisma.investorProfile.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
        },
      }),
      prisma.investorProfile.count({ where }),
    ]);

    return res.json({
      success: true,
      data: investors,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Admin list investors error:", error);
    return res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to fetch investors" },
    });
  }
});

// GET /api/admin/investors/:id — full investor profile detail
router.get("/investors/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const investor = await prisma.investorProfile.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true, createdAt: true } },
      },
    });

    if (!investor) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Investor profile not found" },
      });
    }

    return res.json({ success: true, data: investor });
  } catch (error) {
    console.error("Admin get investor error:", error);
    return res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to fetch investor" },
    });
  }
});

// PATCH /api/admin/investors/:id/verify
router.patch("/investors/:id/verify", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const investor = await prisma.investorProfile.findUnique({ where: { id } });
    if (!investor) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Investor profile not found" },
      });
    }

    await prisma.$transaction([
      prisma.investorProfile.update({
        where: { id },
        data: { verificationStatus: "VERIFIED" },
      }),
      prisma.adminAction.create({
        data: {
          adminId: req.user!.id,
          actionType: "INVESTOR_VERIFIED",
          targetType: "INVESTOR",
          targetId: id,
        },
      }),
    ]);

    return res.json({ success: true, message: "Investor verified" });
  } catch (error) {
    console.error("Admin verify investor error:", error);
    return res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to verify investor" },
    });
  }
});

// PATCH /api/admin/investors/:id/reject
router.patch("/investors/:id/reject", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Reason is required for rejection" },
      });
    }

    const investor = await prisma.investorProfile.findUnique({ where: { id } });
    if (!investor) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Investor profile not found" },
      });
    }

    await prisma.$transaction([
      prisma.investorProfile.update({
        where: { id },
        data: { verificationStatus: "REJECTED" },
      }),
      prisma.adminAction.create({
        data: {
          adminId: req.user!.id,
          actionType: "INVESTOR_REJECTED",
          targetType: "INVESTOR",
          targetId: id,
          reason,
        },
      }),
    ]);

    return res.json({ success: true, message: "Investor rejected" });
  } catch (error) {
    console.error("Admin reject investor error:", error);
    return res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to reject investor" },
    });
  }
});

// PATCH /api/admin/investors/:id/info
router.patch("/investors/:id/info", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Message is required" },
      });
    }

    const investor = await prisma.investorProfile.findUnique({ where: { id } });
    if (!investor) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Investor profile not found" },
      });
    }

    await prisma.adminAction.create({
      data: {
        adminId: req.user!.id,
        actionType: "INVESTOR_INFO_REQUESTED",
        targetType: "INVESTOR",
        targetId: id,
        reason: message,
      },
    });

    return res.json({ success: true, message: "Info requested from investor" });
  } catch (error) {
    console.error("Admin request info investor error:", error);
    return res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to request info" },
    });
  }
});

// ============================================================================
// USERS
// ============================================================================

// GET /api/admin/users — list all users
router.get("/users", async (req: Request, res: Response) => {
  try {
    const { page = "1", limit = "20" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.user.count(),
    ]);

    return res.json({
      success: true,
      data: users,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Admin list users error:", error);
    return res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to fetch users" },
    });
  }
});

// ============================================================================
// DEALS
// ============================================================================

// GET /api/admin/deals — list deals with filters
router.get("/deals", async (req: Request, res: Response) => {
  try {
    const { status, lane, companyId, search, page = "1", limit = "20" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {};
    if (status) where.status = status;
    if (lane) where.lane = lane;
    if (companyId) where.companyId = companyId;
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: "insensitive" } },
        { company: { legalName: { contains: String(search), mode: "insensitive" } } },
      ];
    }

    const [deals, total] = await Promise.all([
      prisma.deal.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          company: {
            select: { id: true, legalName: true, logoUrl: true, sector: true },
          },
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
    console.error("Admin list deals error:", error);
    return res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to fetch deals" },
    });
  }
});

// GET /api/admin/deals/:id — full deal detail with company info
router.get("/deals/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deal = await prisma.deal.findUnique({
      where: { id },
      include: {
        company: {
          include: {
            owner: {
              include: {
                user: { select: { id: true, email: true, firstName: true, lastName: true } },
              },
            },
          },
        },
        adminActions: {
          orderBy: { createdAt: "desc" },
          include: {
            admin: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
        },
      },
    });

    if (!deal) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Deal not found" },
      });
    }

    return res.json({ success: true, data: deal });
  } catch (error) {
    console.error("Admin get deal error:", error);
    return res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to fetch deal" },
    });
  }
});

// PATCH /api/admin/deals/:id/approve — approve deal (UNDER_REVIEW → APPROVED)
router.patch("/deals/:id/approve", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deal = await prisma.deal.findUnique({ where: { id } });
    if (!deal) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Deal not found" },
      });
    }

    if (deal.status !== "UNDER_REVIEW") {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_STATE", message: "Deal must be UNDER_REVIEW to approve" },
      });
    }

    await prisma.$transaction([
      prisma.deal.update({
        where: { id },
        data: { status: "APPROVED" },
      }),
      prisma.adminAction.create({
        data: {
          adminId: req.user!.id,
          actionType: "APPROVE_DEAL",
          targetType: "DEAL",
          targetId: id,
          dealId: id,
        },
      }),
    ]);

    return res.json({ success: true, message: "Deal approved" });
  } catch (error) {
    console.error("Admin approve deal error:", error);
    return res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to approve deal" },
    });
  }
});

// PATCH /api/admin/deals/:id/reject — reject deal with reason
router.patch("/deals/:id/reject", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Reason is required for rejection" },
      });
    }

    const deal = await prisma.deal.findUnique({ where: { id } });
    if (!deal) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Deal not found" },
      });
    }

    if (deal.status !== "UNDER_REVIEW") {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_STATE", message: "Deal must be UNDER_REVIEW to reject" },
      });
    }

    await prisma.$transaction([
      prisma.deal.update({
        where: { id },
        data: { status: "DRAFT" },
      }),
      prisma.adminAction.create({
        data: {
          adminId: req.user!.id,
          actionType: "REJECT_DEAL",
          targetType: "DEAL",
          targetId: id,
          dealId: id,
          reason,
        },
      }),
    ]);

    return res.json({ success: true, message: "Deal rejected" });
  } catch (error) {
    console.error("Admin reject deal error:", error);
    return res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to reject deal" },
    });
  }
});

// PATCH /api/admin/deals/:id/golive — set deal to LIVE (APPROVED → LIVE)
router.patch("/deals/:id/golive", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deal = await prisma.deal.findUnique({ where: { id } });
    if (!deal) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Deal not found" },
      });
    }

    if (deal.status !== "APPROVED") {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_STATE", message: "Deal must be APPROVED to go live" },
      });
    }

    await prisma.$transaction([
      prisma.deal.update({
        where: { id },
        data: { status: "LIVE", openedAt: new Date() },
      }),
      prisma.adminAction.create({
        data: {
          adminId: req.user!.id,
          actionType: "APPROVE_DEAL",
          targetType: "DEAL",
          targetId: id,
          dealId: id,
          reason: "Deal set to LIVE",
        },
      }),
    ]);

    return res.json({ success: true, message: "Deal is now live" });
  } catch (error) {
    console.error("Admin go-live deal error:", error);
    return res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to set deal live" },
    });
  }
});

export default router;
