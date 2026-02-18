import { Router, Request, Response } from "express";
import { prisma } from "@capvista/database";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

// GET /api/investors/profile
router.get(
  "/profile",
  requireAuth,
  requireRole("INVESTOR"),
  async (req: Request, res: Response) => {
    try {
      const profile = await prisma.investorProfile.findUnique({
        where: { userId: req.user!.id },
      });

      return res.json({ success: true, data: profile || null });
    } catch (error) {
      console.error("Error fetching investor profile:", error);
      return res.status(500).json({
        success: false,
        error: { message: "Failed to fetch investor profile" },
      });
    }
  },
);

// PUT /api/investors/profile
router.put(
  "/profile",
  requireAuth,
  requireRole("INVESTOR"),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const body = req.body;

      if (
        !body.investorType ||
        !body.fullName ||
        !body.phone ||
        !body.idType ||
        !body.idNumber
      ) {
        return res.status(400).json({
          success: false,
          error: { message: "Missing required fields" },
        });
      }

      // Compliance & suitability required fields
      const complianceMissing: string[] = [];
      if (!body.taxResidency) complianceMissing.push("taxResidency");
      if (!body.yearsInvesting) complianceMissing.push("yearsInvesting");
      if (!body.investorTitle) complianceMissing.push("investorTitle");
      if (body.canAbsorbTotalLoss === undefined || body.canAbsorbTotalLoss === null || body.canAbsorbTotalLoss === "")
        complianceMissing.push("canAbsorbTotalLoss");
      if (!body.illiquidityComfort || body.illiquidityComfort < 1 || body.illiquidityComfort > 5)
        complianceMissing.push("illiquidityComfort");
      if (!body.holdingPeriod) complianceMissing.push("holdingPeriod");
      if (!body.liquidityNeeds) complianceMissing.push("liquidityNeeds");
      if (!body.investmentHorizon) complianceMissing.push("investmentHorizon");
      if (!body.acknowledgeNotAdvisor)
        complianceMissing.push("acknowledgeNotAdvisor");

      if (complianceMissing.length > 0) {
        return res.status(400).json({
          success: false,
          error: {
            message: `Missing required compliance fields: ${complianceMissing.join(", ")}`,
          },
        });
      }

      // Ensure User record exists
      let user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        try {
          user = await prisma.user.create({
            data: {
              id: userId,
              email: body.email || `${userId}@placeholder.com`,
              firstName: body.fullName?.split(" ")[0] || "Investor",
              lastName: body.fullName?.split(" ").slice(1).join(" ") || "",
              role: "INVESTOR",
              phone: body.phone || null,
              passwordHash: "managed",
            },
          });
          console.log(`Created missing User record for ${userId}`);
        } catch (createError) {
          console.error("Failed to create User record:", createError);
          return res.status(500).json({
            success: false,
            error: {
              message:
                "User account not found. Please log out and register again.",
            },
          });
        }
      }

      const profileData = {
        investorType: body.investorType,
        firmName: body.firmName || null,
        aum: body.aum || null,
        investmentFocus: body.investmentFocus || [],
        preferredLanes: body.preferredLanes || [],
        minimumCheckSize: body.minimumCheckSize || null,
        maximumCheckSize: body.maximumCheckSize || null,
        riskTolerance: body.riskTolerance || null,
        liquidityNeeds: body.liquidityNeeds || null,
        investmentHorizon: body.investmentHorizon || null,
        generalExperience: body.generalExperience || null,
        privateMarketExperience: body.privateMarketExperience || null,
        sourceOfFunds: body.sourceOfFunds || [],
        accreditationBasis: body.accreditationBasis || null,
        // New suitability fields
        taxResidency: body.taxResidency || null,
        investorTitle: body.investorTitle || null,
        yearsInvesting: body.yearsInvesting || null,
        illiquidityComfort: body.illiquidityComfort || null,
        canAbsorbTotalLoss: body.canAbsorbTotalLoss || null,
        politicallyExposed: body.politicallyExposed || false,
        politicallyExposedDetails: body.politicallyExposedDetails || null,
        regulatoryRestrictions: body.regulatoryRestrictions || false,
        regulatoryRestrictionsDetails:
          body.regulatoryRestrictionsDetails || null,
        holdingPeriod: body.holdingPeriod || null,
        acknowledgeNotAdvisor: body.acknowledgeNotAdvisor || false,
        accreditationCertified: body.accreditationCertified || false,
        brokerAffiliated: body.brokerAffiliated || false,
        brokerDetails: body.brokerDetails || null,
        seniorOfficer: body.seniorOfficer || false,
        seniorOfficerCompany: body.seniorOfficerCompany || null,
        trustedContactName: body.trustedContactName || null,
        trustedContactEmail: body.trustedContactEmail || null,
        trustedContactPhone: body.trustedContactPhone || null,
        trustedContactRelationship: body.trustedContactRelationship || null,
        countryOfResidence: body.countryOfResidence || null,
        fullName: body.fullName,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        citizenship: body.citizenship || null,
        phone: body.phone,
        residentialAddress: body.residentialAddress || null,
        city: body.city || null,
        stateProvince: body.stateProvince || null,
        postalCode: body.postalCode || null,
        nin: body.nin || null,
        bvn: body.bvn || null,
        ssn: body.ssn || null,
        niNumber: body.niNumber || null,
        passportNumber: body.passportNumber || null,
        idType: body.idType,
        idNumber: body.idNumber,
        riskAcknowledged: body.riskAcknowledged || false,
        acknowledgePrivatePlacement: body.acknowledgePrivatePlacement || false,
        acknowledgeIlliquidity: body.acknowledgeIlliquidity || false,
        acknowledgeLossRisk: body.acknowledgeLossRisk || false,
        acknowledgeNoGuarantee: body.acknowledgeNoGuarantee || false,
        acknowledgeAccreditedStatus: body.acknowledgeAccreditedStatus || false,
        verificationStatus: "PENDING",
      };

      const profile = await prisma.investorProfile.upsert({
        where: { userId },
        create: { userId, ...profileData },
        update: profileData,
      });

      if (body.phone) {
        await prisma.user
          .update({ where: { id: userId }, data: { phone: body.phone } })
          .catch(() => {});
      }

      return res.json({ success: true, data: profile });
    } catch (error) {
      console.error("Error saving investor profile:", error);
      return res.status(500).json({
        success: false,
        error: { message: "Failed to save investor profile" },
      });
    }
  },
);

export default router;
