import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import bcrypt from "bcrypt";

const router = Router();

// Mask sensitive ID strings: "1234567890" → "******7890"
function maskId(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value.length <= 4) return "****";
  return "*".repeat(value.length - 4) + value.slice(-4);
}

// GET /api/investors/profile/manage — Full profile + user data + masked IDs
router.get(
  "/profile/manage",
  requireAuth,
  requireRole("INVESTOR"),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          status: true,
          createdAt: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: { message: "User not found" },
        });
      }

      const profile = await prisma.investorProfile.findUnique({
        where: { userId },
      });

      // Build masked ID info for view-only display
      let maskedIds: Record<string, string | null> = {};
      if (profile) {
        maskedIds = {
          idType: profile.idType || null,
          idNumber: maskId(profile.idNumber),
          nin: maskId(profile.nin),
          bvn: maskId(profile.bvn),
          ssn: maskId(profile.ssn),
          niNumber: maskId(profile.niNumber),
          passportNumber: maskId(profile.passportNumber),
        };
      }

      return res.json({
        success: true,
        data: {
          user,
          profile: profile || null,
          maskedIds,
        },
      });
    } catch (error) {
      console.error("Error fetching manage profile data:", error);
      return res.status(500).json({
        success: false,
        error: { message: "Failed to fetch profile data" },
      });
    }
  },
);

// PUT /api/investors/profile/personal — Update personal info
router.put(
  "/profile/personal",
  requireAuth,
  requireRole("INVESTOR"),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const body = req.body;

      if (!body.firstName || !body.lastName) {
        return res.status(400).json({
          success: false,
          error: { message: "First name and last name are required" },
        });
      }

      // Update User record
      await prisma.user.update({
        where: { id: userId },
        data: {
          firstName: body.firstName,
          lastName: body.lastName,
          phone: body.phone || null,
        },
      });

      // Update InvestorProfile fields
      const profile = await prisma.investorProfile.findUnique({
        where: { userId },
      });

      if (profile) {
        await prisma.investorProfile.update({
          where: { userId },
          data: {
            fullName: `${body.firstName} ${body.lastName}`.trim(),
            phone: body.phone || null,
            dateOfBirth: body.dateOfBirth
              ? new Date(body.dateOfBirth)
              : undefined,
            residentialAddress: body.residentialAddress ?? undefined,
            city: body.city ?? undefined,
            stateProvince: body.stateProvince ?? undefined,
            postalCode: body.postalCode ?? undefined,
            countryOfResidence: body.countryOfResidence ?? undefined,
            citizenship: body.citizenship ?? undefined,
            taxResidency: body.taxResidency ?? undefined,
          },
        });
      }

      return res.json({
        success: true,
        data: { message: "Personal information updated" },
      });
    } catch (error) {
      console.error("Error updating personal info:", error);
      return res.status(500).json({
        success: false,
        error: { message: "Failed to update personal information" },
      });
    }
  },
);

// PUT /api/investors/profile/investor — Update investor profile
router.put(
  "/profile/investor",
  requireAuth,
  requireRole("INVESTOR"),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const body = req.body;

      if (!body.investorType) {
        return res.status(400).json({
          success: false,
          error: { message: "Investor type is required" },
        });
      }

      const profile = await prisma.investorProfile.findUnique({
        where: { userId },
      });

      if (!profile) {
        return res.status(404).json({
          success: false,
          error: {
            message:
              "Investor profile not found. Please complete onboarding first.",
          },
        });
      }

      await prisma.investorProfile.update({
        where: { userId },
        data: {
          investorType: body.investorType,
          firmName: body.firmName ?? undefined,
          investorTitle: body.title ?? undefined,
          aum: body.aum ?? undefined,
          yearsInvesting: body.yearsExperience ?? undefined,
        },
      });

      return res.json({
        success: true,
        data: { message: "Investor profile updated" },
      });
    } catch (error) {
      console.error("Error updating investor profile:", error);
      return res.status(500).json({
        success: false,
        error: { message: "Failed to update investor profile" },
      });
    }
  },
);

// PUT /api/investors/profile/preferences — Update investment preferences
router.put(
  "/profile/preferences",
  requireAuth,
  requireRole("INVESTOR"),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const body = req.body;

      const profile = await prisma.investorProfile.findUnique({
        where: { userId },
      });

      if (!profile) {
        return res.status(404).json({
          success: false,
          error: {
            message:
              "Investor profile not found. Please complete onboarding first.",
          },
        });
      }

      await prisma.investorProfile.update({
        where: { userId },
        data: {
          investmentFocus: body.preferredSectors ?? undefined,
          preferredLanes: body.preferredLanes ?? undefined,
          minimumCheckSize:
            body.minimumCheckSize != null
              ? parseFloat(body.minimumCheckSize)
              : undefined,
          maximumCheckSize:
            body.maximumCheckSize != null
              ? parseFloat(body.maximumCheckSize)
              : undefined,
          holdingPeriod: body.holdingPeriod ?? undefined,
        },
      });

      return res.json({
        success: true,
        data: { message: "Investment preferences updated" },
      });
    } catch (error) {
      console.error("Error updating preferences:", error);
      return res.status(500).json({
        success: false,
        error: { message: "Failed to update investment preferences" },
      });
    }
  },
);

// PUT /api/investors/profile/notifications — Update notification preferences
router.put(
  "/profile/notifications",
  requireAuth,
  requireRole("INVESTOR"),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { notificationPreferences } = req.body;

      const profile = await prisma.investorProfile.findUnique({
        where: { userId },
      });

      if (!profile) {
        return res.status(404).json({
          success: false,
          error: {
            message:
              "Investor profile not found. Please complete onboarding first.",
          },
        });
      }

      await prisma.investorProfile.update({
        where: { userId },
        data: {
          notificationPreferences: notificationPreferences ?? {},
        },
      });

      return res.json({
        success: true,
        data: { message: "Notification preferences updated" },
      });
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      return res.status(500).json({
        success: false,
        error: { message: "Failed to update notification preferences" },
      });
    }
  },
);

// PUT /api/investors/password — Change password
router.put(
  "/password",
  requireAuth,
  requireRole("INVESTOR"),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { currentPassword, newPassword, confirmPassword } = req.body;

      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
          success: false,
          error: { message: "All password fields are required" },
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          error: { message: "New password and confirmation do not match" },
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          error: { message: "New password must be at least 8 characters" },
        });
      }

      if (
        !/[A-Z]/.test(newPassword) ||
        !/[a-z]/.test(newPassword) ||
        !/[0-9]/.test(newPassword)
      ) {
        return res.status(400).json({
          success: false,
          error: {
            message:
              "Password must contain uppercase, lowercase, and a number",
          },
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: { message: "User not found" },
        });
      }

      const passwordValid = await bcrypt.compare(
        currentPassword,
        user.passwordHash,
      );
      if (!passwordValid) {
        return res.status(400).json({
          success: false,
          error: { message: "Current password is incorrect" },
        });
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
      });

      return res.json({
        success: true,
        data: { message: "Password updated successfully" },
      });
    } catch (error) {
      console.error("Error changing password:", error);
      return res.status(500).json({
        success: false,
        error: { message: "Failed to change password" },
      });
    }
  },
);

// DELETE /api/investors/account — Deactivate account (soft delete)
router.delete(
  "/account",
  requireAuth,
  requireRole("INVESTOR"),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { confirmEmail } = req.body;

      if (!confirmEmail) {
        return res.status(400).json({
          success: false,
          error: {
            message:
              "Please confirm your email address to deactivate your account",
          },
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: { message: "User not found" },
        });
      }

      if (confirmEmail.toLowerCase() !== user.email.toLowerCase()) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Email confirmation does not match your account email",
          },
        });
      }

      await prisma.user.update({
        where: { id: userId },
        data: { status: "DEACTIVATED" },
      });

      return res.json({
        success: true,
        data: { message: "Account has been deactivated" },
      });
    } catch (error) {
      console.error("Error deactivating account:", error);
      return res.status(500).json({
        success: false,
        error: { message: "Failed to deactivate account" },
      });
    }
  },
);

export default router;
