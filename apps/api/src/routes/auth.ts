import { Router, Request, Response } from "express";
import { prisma } from "@capvista/database";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = Router();

const JWT_SECRET =
  process.env.JWT_SECRET || "capvista-dev-secret-change-in-production";
const JWT_EXPIRES_IN = "7d";

// Helper to generate tokens
function generateTokens(userId: string, role: string) {
  const accessToken = jwt.sign({ userId, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
  return { accessToken };
}

// POST /api/auth/register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "All fields are required" },
      });
    }

    if (!["FOUNDER", "INVESTOR"].includes(role)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Role must be FOUNDER or INVESTOR",
        },
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Password must be at least 8 characters",
        },
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          code: "USER_EXISTS",
          message: "An account with this email already exists",
        },
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create User + profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          role,
          firstName,
          lastName,
          status: "active",
        },
      });

      if (role === "FOUNDER") {
        const founderProfile = await tx.founderProfile.create({
          data: {
            userId: user.id,
            onboardingCompleted: false,
            ninVerified: false,
            bvnVerified: false,
          },
        });
        return { user, founderProfile, investorProfile: null };
      } else {
        const investorProfile = await tx.investorProfile.create({
          data: {
            userId: user.id,
            accreditationStatus: "PENDING",
            investmentFocus: [],
            preferredLanes: [],
          },
        });
        return { user, founderProfile: null, investorProfile };
      }
    });

    // Generate token
    const { accessToken } = generateTokens(result.user.id, result.user.role);

    console.log(`✅ Registered: ${role} - ${email} (${result.user.id})`);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        accessToken,
        user: {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
        },
        founderProfile: result.founderProfile,
        investorProfile: result.investorProfile,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Registration failed" },
    });
  }
});

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Email and password are required",
        },
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        founderProfile: true,
        investorProfile: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password",
        },
      });
    }

    // Check password
    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password",
        },
      });
    }

    // Check status
    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        error: { code: "ACCOUNT_INACTIVE", message: "Account is not active" },
      });
    }

    // Generate token
    const { accessToken } = generateTokens(user.id, user.role);

    console.log(`✅ Login: ${user.role} - ${email}`);

    return res.json({
      success: true,
      message: "Login successful",
      data: {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        founderProfile: user.founderProfile,
        investorProfile: user.investorProfile,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Login failed" },
    });
  }
});

export default router;
