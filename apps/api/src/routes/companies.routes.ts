import { Router, Request, Response } from 'express';
import { prisma } from '@capvista/database';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// Validation schemas
const createCompanySchema = z.object({
  // 1️⃣ Identity
  legalName: z.string().min(1),
  tradingName: z.string().optional(),
  countryOfIncorporation: z.string().default('Nigeria'),
  incorporationNumber: z.string().min(1), // CAC number
  incorporationDate: z.string().datetime(),
  companyAddress: z.string().min(1),
  operatingCountries: z.array(z.string()),
  website: z.string().url().optional(),
  officialEmailDomain: z.string().min(1),

  // 2️⃣ Team
  teamSize: z.string().optional(),

  // 3️⃣ Overview
  oneLineDescription: z.string().min(10).max(200),
  detailedDescription: z.string().min(50),
  sector: z.enum([
    'FINTECH', 'LOGISTICS', 'ENERGY', 'CONSUMER_FMCG', 
    'HEALTH', 'AGRI_FOOD', 'REAL_ESTATE', 'INFRASTRUCTURE', 
    'SAAS_TECH', 'MANUFACTURING'
  ]),
  businessModel: z.enum(['B2B', 'B2C', 'B2B2C']),
  revenueModel: z.enum(['TRANSACTIONAL', 'SUBSCRIPTION', 'ASSET_BACKED']),
  stage: z.enum(['PRE_REVENUE', 'EARLY_REVENUE', 'GROWTH', 'PROFITABLE']),

  // 4️⃣ Traction
  revenueStatus: z.string().optional(),
  revenueRange: z.string().optional(),
  primaryRevenueSource: z.string().optional(),
  keyMetrics: z.any().optional(),
  majorCustomers: z.array(z.string()).optional(),
  geographicFootprint: z.string().optional(),
  regulatoryDependencies: z.string().optional(),

  // 5️⃣ Capital History
  hasRaisedBefore: z.boolean().default(false),
  previousRaises: z.any().optional(),
  founderOwnedPercent: z.number().min(0).max(100).optional(),
  externalInvestorsPercent: z.number().min(0).max(100).optional(),
  notableInvestors: z.array(z.string()).optional(),

  // 6️⃣ Risks
  topRisks: z.array(z.string()).min(3).max(3),
  materialThreats: z.string().optional(),
  singleSupplier: z.boolean().default(false),
  fxExposure: z.boolean().default(false),
  regulationDependent: z.boolean().default(false),
  infrastructureDependent: z.boolean().default(false),

  // 7️⃣ Fundraising Intent
  preferredLane: z.enum(['YIELD', 'VENTURES']).optional(),
  preferredInstrument: z.enum([
    'REVENUE_SHARE_NOTE', 'ASSET_BACKED_PARTICIPATION',
    'CONVERTIBLE_NOTE', 'SAFE', 'SPV_EQUITY'
  ]).optional(),
  targetRaiseRange: z.string().optional(),
  primaryUseOfFunds: z.string().optional()
});

const updateCompanySchema = createCompanySchema.partial();

// POST /v1/companies - Create company (founders only)
router.post('/', requireAuth, requireRole('FOUNDER'), async (req: Request, res: Response) => {
  try {
    const body = createCompanySchema.parse(req.body);

    // Check if CAC number already exists
    const existing = await prisma.company.findUnique({
      where: { incorporationNumber: body.incorporationNumber }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'COMPANY_EXISTS',
          message: 'A company with this incorporation number already exists'
        }
      });
    }

    // Create company
    const company = await prisma.company.create({
      data: {
        ...body,
        incorporationDate: new Date(body.incorporationDate),
        operatingCountries: body.operatingCountries || [],
        majorCustomers: body.majorCustomers || [],
        notableInvestors: body.notableInvestors || [],
        topRisks: body.topRisks,
        founders: {
          create: {
            userId: req.user!.id,
            role: 'CEO', // Default role
            bio: 'Founder',
            isPrimary: true
          }
        }
      },
      include: {
        founders: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    return res.status(201).json({
      success: true,
      data: company
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: error.errors
        }
      });
    }

    console.error('Create company error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create company'
      }
    });
  }
});

// GET /v1/companies/:id - Get company details
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        founders: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        deals: {
          select: {
            id: true,
            name: true,
            lane: true,
            instrumentType: true,
            status: true,
            targetAmount: true,
            raisedAmount: true
          }
        },
        verificationRecords: {
          where: {
            status: 'VERIFIED'
          },
          select: {
            type: true,
            verifiedAt: true
          }
        }
      }
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'COMPANY_NOT_FOUND',
          message: 'Company not found'
        }
      });
    }

    // Hide sensitive internal fields
    const publicCompany = {
      ...company,
      cacVerificationStatus: undefined,
      sanctionsWatchlistCheck: undefined,
      bankAccountVerified: undefined,
      revenueVerificationMethod: undefined,
      equityAcknowledgementAccepted: undefined,
      equityAcknowledgementTimestamp: undefined,
      equityAcknowledgementIp: undefined
    };

    return res.json({
      success: true,
      data: publicCompany
    });
  } catch (error) {
    console.error('Get company error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch company'
      }
    });
  }
});

// PATCH /v1/companies/:id - Update company (founders only)
router.patch('/:id', requireAuth, requireRole('FOUNDER'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = updateCompanySchema.parse(req.body);

    // Check if user is a founder of this company
    const companyFounder = await prisma.companyFounder.findFirst({
      where: {
        companyId: id,
        userId: req.user!.id
      }
    });

    if (!companyFounder) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You are not authorized to update this company'
        }
      });
    }

    // Update company
    const company = await prisma.company.update({
      where: { id },
      data: {
        ...body,
        incorporationDate: body.incorporationDate ? new Date(body.incorporationDate) : undefined
      }
    });

    return res.json({
      success: true,
      data: company
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: error.errors
        }
      });
    }

    console.error('Update company error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update company'
      }
    });
  }
});

// GET /v1/companies - List companies (with filters)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { sector, stage, lane, page = '1', limit = '20' } = req.query;

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
          stage: true,
          preferredLane: true,
          preferredInstrument: true,
          targetRaiseRange: true,
          currentMonitoringStatus: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.company.count({ where })
    ]);

    return res.json({
      success: true,
      data: companies,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('List companies error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch companies'
      }
    });
  }
});

export default router;