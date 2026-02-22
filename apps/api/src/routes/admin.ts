import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import { sendEmail } from "../lib/email";
import {
  companyApprovedEmail,
  companyRejectedEmail,
  investorVerifiedEmail,
  investorRejectedEmail,
  dealLiveEmail,
  fundingConfirmedEmail,
} from "../lib/emailTemplates";

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
      totalInvestments,
      pendingFundingInvestments,
      fundedInvestments,
      activeInvestments,
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
      prisma.investment.count(),
      prisma.investment.count({ where: { status: "PENDING_FUNDING" } }),
      prisma.investment.count({ where: { status: "FUNDED" } }),
      prisma.investment.count({ where: { status: "ACTIVE" } }),
    ]);

    return res.json({
      success: true,
      data: {
        companies: { total: totalCompanies, pending: pendingCompanies, approved: approvedCompanies, rejected: rejectedCompanies },
        investors: { total: totalInvestors, pending: pendingInvestors, verified: verifiedInvestors, rejected: rejectedInvestors },
        users: totalUsers,
        deals: { total: totalDeals, underReview: underReviewDeals, approved: approvedDeals, live: liveDeals },
        investments: { total: totalInvestments, pendingFunding: pendingFundingInvestments, funded: fundedInvestments, active: activeInvestments },
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

    // Fire and forget — company approved email to founder
    (async () => {
      try {
        const companyWithOwner = await prisma.company.findUnique({
          where: { id },
          select: { legalName: true, owner: { select: { user: { select: { email: true } } } } },
        });
        if (companyWithOwner) {
          const { subject, html } = companyApprovedEmail(companyWithOwner.legalName);
          await sendEmail({ to: companyWithOwner.owner.user.email, subject, html });
        }
      } catch (err) {
        console.error("Company approved email failed:", err);
      }
    })();

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

    // Fire and forget — company rejected email to founder
    (async () => {
      try {
        const companyWithOwner = await prisma.company.findUnique({
          where: { id },
          select: { legalName: true, owner: { select: { user: { select: { email: true } } } } },
        });
        if (companyWithOwner) {
          const { subject, html } = companyRejectedEmail(companyWithOwner.legalName, reason);
          await sendEmail({ to: companyWithOwner.owner.user.email, subject, html });
        }
      } catch (err) {
        console.error("Company rejected email failed:", err);
      }
    })();

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

// PATCH /api/admin/companies/:id/verify-participation — Admin verifies and counter-signs
router.patch("/companies/:id/verify-participation", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { adminSignature } = req.body;

    if (!adminSignature || typeof adminSignature !== "string" || !adminSignature.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Admin signature is required" },
      });
    }

    const company = await prisma.company.findUnique({ where: { id } });
    if (!company) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Company not found" },
      });
    }

    if (company.participationStatus !== "EXECUTED") {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_STATE",
          message: `Cannot verify participation. Current status: ${company.participationStatus}. Must be EXECUTED.`,
        },
      });
    }

    // Ensure all four documents are uploaded
    if (!company.boardResolutionUrl || !company.shareCertificateUrl || !company.shareholderRegisterUrl || !company.capTableConfirmationUrl) {
      return res.status(400).json({
        success: false,
        error: {
          code: "MISSING_DOCUMENTS",
          message: "All four issuance documents must be uploaded before verification.",
        },
      });
    }

    await prisma.$transaction([
      prisma.company.update({
        where: { id },
        data: {
          participationCapvistaSignedAt: new Date(),
          participationCapvistaSignedBy: req.user!.id,
          issuanceDocsReviewedAt: new Date(),
          issuanceDocsReviewedBy: req.user!.id,
          participationStatus: "VERIFIED",
        },
      }),
      prisma.adminAction.create({
        data: {
          adminId: req.user!.id,
          actionType: "PARTICIPATION_VERIFIED",
          targetType: "COMPANY",
          targetId: id,
          metadata: { adminSignature: adminSignature.trim() },
        },
      }),
    ]);

    return res.json({ success: true, message: "Participation verified and counter-signed" });
  } catch (error) {
    console.error("Admin verify participation error:", error);
    return res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to verify participation" },
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

    // Fire and forget — investor verified email
    (async () => {
      try {
        const investorWithUser = await prisma.investorProfile.findUnique({
          where: { id },
          select: { user: { select: { email: true } } },
        });
        if (investorWithUser) {
          const { subject, html } = investorVerifiedEmail();
          await sendEmail({ to: investorWithUser.user.email, subject, html });
        }
      } catch (err) {
        console.error("Investor verified email failed:", err);
      }
    })();

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

    // Fire and forget — investor rejected email
    (async () => {
      try {
        const investorWithUser = await prisma.investorProfile.findUnique({
          where: { id },
          select: { user: { select: { email: true } } },
        });
        if (investorWithUser) {
          const { subject, html } = investorRejectedEmail(reason);
          await sendEmail({ to: investorWithUser.user.email, subject, html });
        }
      } catch (err) {
        console.error("Investor rejected email failed:", err);
      }
    })();

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

    // Check participation gate
    const company = await prisma.company.findUnique({ where: { id: deal.companyId } });

    if (!company || company.participationStatus !== "VERIFIED") {
      return res.status(403).json({
        success: false,
        error: {
          code: "PARTICIPATION_NOT_VERIFIED",
          message: "Deal cannot go live until platform participation agreement is executed and issuance documentation is verified.",
        },
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

    // Fire and forget — deal live email to founder
    (async () => {
      try {
        const dealWithCompany = await prisma.deal.findUnique({
          where: { id },
          select: { name: true, company: { select: { owner: { select: { user: { select: { email: true } } } } } } },
        });
        if (dealWithCompany) {
          const { subject, html } = dealLiveEmail(dealWithCompany.name);
          await sendEmail({ to: dealWithCompany.company.owner.user.email, subject, html });
        }
      } catch (err) {
        console.error("Deal live email failed:", err);
      }
    })();

    return res.json({ success: true, message: "Deal is now live" });
  } catch (error) {
    console.error("Admin go-live deal error:", error);
    return res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to set deal live" },
    });
  }
});

// PATCH /api/admin/deals/:id/close — close/cancel a deal
router.patch("/deals/:id/close", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const deal = await prisma.deal.findUnique({
      where: { id },
      select: { id: true, status: true, name: true },
    });

    if (!deal) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Deal not found" },
      });
    }

    if (deal.status === "CLOSED") {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_STATE", message: "Deal is already closed" },
      });
    }

    if (deal.status === "DRAFT" || deal.status === "UNDER_REVIEW") {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_STATE", message: "Deal must be APPROVED or LIVE to close" },
      });
    }

    // Find all investments that need cancellation (PENDING_FUNDING or COMMITTED)
    const investmentsToCancelIds = await prisma.investment.findMany({
      where: {
        dealId: id,
        status: { in: ["PENDING_FUNDING", "COMMITTED"] },
      },
      select: { id: true },
    });

    const investmentIds = investmentsToCancelIds.map((i) => i.id);

    await prisma.$transaction([
      // 1. Close the deal
      prisma.deal.update({
        where: { id },
        data: { status: "CLOSED", closedAt: new Date() },
      }),

      // 2. Cancel all PENDING_FUNDING and COMMITTED investments
      prisma.investment.updateMany({
        where: {
          dealId: id,
          status: { in: ["PENDING_FUNDING", "COMMITTED"] },
        },
        data: { status: "CANCELLED" },
      }),

      // 3. Refund all PENDING escrow transactions for those investments
      ...(investmentIds.length > 0
        ? [
            prisma.escrowTransaction.updateMany({
              where: {
                investmentId: { in: investmentIds },
                status: "PENDING",
              },
              data: { status: "REFUNDED" },
            }),
          ]
        : []),

      // 4. Log admin action
      prisma.adminAction.create({
        data: {
          adminId: req.user!.id,
          actionType: "CLOSE_DEAL",
          targetType: "DEAL",
          targetId: id,
          dealId: id,
          reason: reason || "Deal closed by admin",
          metadata: {
            cancelledInvestments: investmentIds.length,
          },
        },
      }),
    ]);

    return res.json({
      success: true,
      message: "Deal closed successfully",
      data: {
        cancelledInvestments: investmentIds.length,
      },
    });
  } catch (error) {
    console.error("Admin close deal error:", error);
    return res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to close deal" },
    });
  }
});

// ============================================================================
// INVESTMENTS
// ============================================================================

// GET /api/admin/investments — list all investments with filters
router.get("/investments", async (req: Request, res: Response) => {
  try {
    const { status, dealId, investorId, search, page = "1", limit = "20" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {};
    if (status) where.status = status;
    if (dealId) where.dealId = dealId;
    if (investorId) where.investorId = investorId;
    if (search) {
      where.OR = [
        { fundingReference: { contains: String(search), mode: "insensitive" } },
        { deal: { name: { contains: String(search), mode: "insensitive" } } },
        { investor: { user: { email: { contains: String(search), mode: "insensitive" } } } },
      ];
    }

    const [investments, total] = await Promise.all([
      prisma.investment.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          deal: {
            select: {
              id: true,
              name: true,
              lane: true,
              instrumentType: true,
              status: true,
              company: {
                select: { id: true, legalName: true, tradingName: true },
              },
            },
          },
          investor: {
            select: {
              id: true,
              fullName: true,
              user: {
                select: { id: true, email: true, firstName: true, lastName: true },
              },
            },
          },
        },
      }),
      prisma.investment.count({ where }),
    ]);

    return res.json({
      success: true,
      data: investments,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Admin list investments error:", error);
    return res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to fetch investments" },
    });
  }
});

// GET /api/admin/investments/:id — investment detail
router.get("/investments/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const investment = await prisma.investment.findUnique({
      where: { id },
      include: {
        deal: {
          include: {
            company: {
              select: { id: true, legalName: true, tradingName: true, sector: true },
            },
          },
        },
        investor: {
          include: {
            user: {
              select: { id: true, email: true, firstName: true, lastName: true },
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

    return res.json({ success: true, data: investment });
  } catch (error) {
    console.error("Admin get investment error:", error);
    return res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to fetch investment" },
    });
  }
});

// PATCH /api/admin/investments/:id/confirm-funding — mark investment as FUNDED
router.patch("/investments/:id/confirm-funding", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { fundedAmount, externalRef } = req.body;

    const investment = await prisma.investment.findUnique({
      where: { id },
      include: { deal: true },
    });

    if (!investment) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Investment not found" },
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

    const expectedAmount = Number(investment.commitmentAmount);
    if (Number(fundedAmount) !== expectedAmount) {
      return res.status(400).json({
        success: false,
        error: {
          code: "AMOUNT_MISMATCH",
          message: `Funded amount ($${fundedAmount}) must match commitment amount ($${expectedAmount})`,
        },
      });
    }

    // Transaction: update investment, create escrow, update deal
    const [updatedInvestment] = await prisma.$transaction([
      prisma.investment.update({
        where: { id },
        data: {
          status: "FUNDED",
          fundedAmount,
          fundedAt: new Date(),
          currentValue: fundedAmount,
          reviewedBy: req.user!.id,
          reviewedAt: new Date(),
        },
      }),
      prisma.escrowTransaction.create({
        data: {
          investmentId: id,
          amount: fundedAmount,
          direction: "INVESTOR_TO_ESCROW",
          status: "COMPLETED",
          externalRef: externalRef || investment.fundingReference,
        },
      }),
      prisma.deal.update({
        where: { id: investment.dealId },
        data: {
          raisedAmount: { increment: fundedAmount },
          investorCount: { increment: 1 },
        },
      }),
      prisma.adminAction.create({
        data: {
          adminId: req.user!.id,
          actionType: "CONFIRM_FUNDING",
          targetType: "INVESTMENT",
          targetId: id,
          dealId: investment.dealId,
          metadata: { fundedAmount, externalRef },
        },
      }),
    ]);

    // Fire and forget — funding confirmed email to investor
    (async () => {
      try {
        const investmentWithDetails = await prisma.investment.findUnique({
          where: { id },
          select: {
            fundedAmount: true,
            investor: { select: { user: { select: { email: true } } } },
            deal: { select: { name: true, company: { select: { legalName: true } } } },
          },
        });
        if (investmentWithDetails) {
          const { subject, html } = fundingConfirmedEmail(
            investmentWithDetails.deal.name,
            investmentWithDetails.deal.company.legalName,
            Number(investmentWithDetails.fundedAmount),
          );
          await sendEmail({ to: investmentWithDetails.investor.user.email, subject, html });
        }
      } catch (err) {
        console.error("Funding confirmed email failed:", err);
      }
    })();

    return res.json({
      success: true,
      data: updatedInvestment,
      message: "Funding confirmed. Investment is now FUNDED.",
    });
  } catch (error) {
    console.error("Admin confirm funding error:", error);
    return res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to confirm funding" },
    });
  }
});

// PATCH /api/admin/investments/:id/cancel — admin cancel investment
router.patch("/investments/:id/cancel", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const investment = await prisma.investment.findUnique({
      where: { id },
    });

    if (!investment) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Investment not found" },
      });
    }

    if (investment.status === "COMPLETED") {
      return res.status(400).json({
        success: false,
        error: {
          code: "CANNOT_CANCEL",
          message: "Cannot cancel a completed investment",
        },
      });
    }

    await prisma.$transaction([
      prisma.investment.update({
        where: { id },
        data: {
          status: "CANCELLED",
          adminNotes: reason || "Cancelled by admin",
          reviewedBy: req.user!.id,
          reviewedAt: new Date(),
        },
      }),
      prisma.adminAction.create({
        data: {
          adminId: req.user!.id,
          actionType: "CANCEL_INVESTMENT",
          targetType: "INVESTMENT",
          targetId: id,
          dealId: investment.dealId,
          reason: reason || "Cancelled by admin",
        },
      }),
    ]);

    return res.json({ success: true, message: "Investment cancelled by admin" });
  } catch (error) {
    console.error("Admin cancel investment error:", error);
    return res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to cancel investment" },
    });
  }
});

export default router;
