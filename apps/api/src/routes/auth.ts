import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "../lib/email";
import { welcomeEmail, passwordResetEmail } from "../lib/emailTemplates";
import { authLimiter } from "../middleware/rateLimiter";
import { sanitizeString, isValidEmail } from "../utils/sanitize";

const router = Router();

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "7d";

// Helper to generate tokens
function generateTokens(userId: string, role: string) {
  const accessToken = jwt.sign({ userId, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
  return { accessToken };
}

// POST /api/auth/register
router.post("/register", authLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "All fields are required" },
      });
    }

    // Validate types
    if (typeof email !== "string" || typeof password !== "string" ||
        typeof firstName !== "string" || typeof lastName !== "string" || typeof role !== "string") {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "All fields must be strings" },
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid email format" },
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
    const validRole = role as "FOUNDER" | "INVESTOR";

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Password must be at least 8 characters",
        },
      });
    }

    if (firstName.length > 100 || lastName.length > 100) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Name fields must be under 100 characters" },
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

    // Sanitize text inputs
    const cleanEmail = email.trim().toLowerCase();
    const cleanFirstName = sanitizeString(firstName);
    const cleanLastName = sanitizeString(lastName);

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create User + profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: cleanEmail,
          passwordHash,
          role: validRole,
          firstName: cleanFirstName,
          lastName: cleanLastName,
          status: "active",
        },
      });

      if (validRole === "FOUNDER") {
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
            verificationStatus: "PENDING",
            investmentFocus: [],
            preferredLanes: [],
          },
        });
        return { user, founderProfile: null, investorProfile };
      }
    });

    // Generate token
    const { accessToken } = generateTokens(result.user.id, result.user.role);

    console.log(`✅ Registered: ${validRole} - ${cleanEmail} (${result.user.id})`);

    // Fire and forget — welcome email
    const { subject, html } = welcomeEmail(cleanFirstName, validRole);
    sendEmail({ to: cleanEmail, subject, html }).catch((err) =>
      console.error("Welcome email failed:", err),
    );

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
router.post("/login", authLimiter, async (req: Request, res: Response) => {
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

    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Email and password must be strings" },
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
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

// POST /api/auth/register-admin
router.post("/register-admin", authLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, inviteCode } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !inviteCode) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "All fields are required" },
      });
    }

    if (typeof email !== "string" || typeof password !== "string" ||
        typeof firstName !== "string" || typeof lastName !== "string" || typeof inviteCode !== "string") {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "All fields must be strings" },
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid email format" },
      });
    }

    // Validate invite code
    const validInviteCode = process.env.ADMIN_INVITE_CODE;
    if (!validInviteCode || inviteCode !== validInviteCode) {
      return res.status(403).json({
        success: false,
        error: { code: "INVALID_INVITE_CODE", message: "Invalid invite code" },
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

    if (firstName.length > 100 || lastName.length > 100) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Name fields must be under 100 characters" },
      });
    }

    // Sanitize text inputs
    const cleanAdminEmail = email.trim().toLowerCase();
    const cleanAdminFirstName = sanitizeString(firstName);
    const cleanAdminLastName = sanitizeString(lastName);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanAdminEmail },
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

    // Create admin user (no FounderProfile or InvestorProfile)
    const user = await prisma.user.create({
      data: {
        email: cleanAdminEmail,
        passwordHash,
        role: "ADMIN",
        firstName: cleanAdminFirstName,
        lastName: cleanAdminLastName,
        status: "active",
      },
    });

    // Generate token
    const { accessToken } = generateTokens(user.id, user.role);

    console.log(`✅ Admin registered: ${email} (${user.id})`);

    return res.status(201).json({
      success: true,
      message: "Admin registration successful",
      data: {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      },
    });
  } catch (error) {
    console.error("Admin registration error:", error);
    return res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Registration failed" },
    });
  }
});

// POST /api/auth/forgot-password
router.post("/forgot-password", authLimiter, async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Email is required" },
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid email format" },
      });
    }

    // Always return success to prevent email enumeration
    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken, resetTokenExpiry },
      });

      const { subject, html } = passwordResetEmail(resetToken);
      sendEmail({ to: email, subject, html }).catch((err) =>
        console.error("Password reset email failed:", err),
      );
    }

    return res.json({
      success: true,
      message: "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to process request" },
    });
  }
});

// POST /api/auth/reset-password
router.post("/reset-password", authLimiter, async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword || typeof token !== "string" || typeof newPassword !== "string") {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Token and new password are required" },
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Password must be at least 8 characters" },
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_TOKEN", message: "Invalid or expired reset token" },
      });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return res.json({
      success: true,
      message: "Password has been reset successfully. You can now sign in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to reset password" },
    });
  }
});

export default router;
