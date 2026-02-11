import { Router, Request, Response } from 'express';
import { prisma } from '@capvista/database';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Validation schemas
const signupSchema = z.object({
  clerkId: z.string(),
  email: z.string().email(),
  role: z.enum(['FOUNDER', 'INVESTOR', 'ADMIN']),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional()
});

const riskAcknowledgementSchema = z.object({
  acknowledged: z.boolean(),
  ipAddress: z.string()
});

// POST /v1/auth/signup - Create user after Clerk signup
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const body = signupSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: body.clerkId }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'User already exists'
        }
      });
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        clerkId: body.clerkId,
        email: body.email,
        role: body.role,
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone
      }
    });

    return res.status(201).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
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

    console.error('Signup error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create user'
      }
    });
  }
});

// GET /v1/auth/me - Get current user
router.get('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: req.user!.clerkId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        riskAcknowledgedAt: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    return res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch user'
      }
    });
  }
});

// POST /v1/auth/acknowledge-risk - Investor risk acknowledgement
router.post('/acknowledge-risk', requireAuth, async (req: Request, res: Response) => {
  try {
    const body = riskAcknowledgementSchema.parse(req.body);

    // Only investors need to acknowledge risk
    const user = await prisma.user.findUnique({
      where: { clerkId: req.user!.clerkId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    if (user.role !== 'INVESTOR') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ROLE',
          message: 'Only investors need to acknowledge risk'
        }
      });
    }

    if (!body.acknowledged) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ACKNOWLEDGEMENT_REQUIRED',
          message: 'Risk acknowledgement is required'
        }
      });
    }

    // Update user with acknowledgement
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        riskAcknowledgedAt: new Date(),
        riskAcknowledgedIp: body.ipAddress
      },
      select: {
        id: true,
        email: true,
        role: true,
        riskAcknowledgedAt: true
      }
    });

    return res.json({
      success: true,
      data: updatedUser
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

    console.error('Risk acknowledgement error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to record acknowledgement'
      }
    });
  }
});

export default router;