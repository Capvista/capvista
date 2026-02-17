-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('FOUNDER', 'INVESTOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "CompanyStage" AS ENUM ('PRE_REVENUE', 'EARLY_REVENUE', 'GROWTH', 'PROFITABLE');

-- CreateEnum
CREATE TYPE "BusinessModel" AS ENUM ('B2B', 'B2C', 'B2B2C', 'B2G', 'Marketplace');

-- CreateEnum
CREATE TYPE "RevenueModel" AS ENUM ('TRANSACTIONAL', 'SUBSCRIPTION', 'ASSET_BACKED');

-- CreateEnum
CREATE TYPE "Sector" AS ENUM ('TECHNOLOGY', 'FINTECH', 'LOGISTICS', 'ENERGY', 'CONSUMER_FMCG', 'HEALTH', 'AGRI_FOOD', 'REAL_ESTATE', 'INFRASTRUCTURE', 'SAAS_TECH', 'MANUFACTURING');

-- CreateEnum
CREATE TYPE "DealLane" AS ENUM ('YIELD', 'VENTURES');

-- CreateEnum
CREATE TYPE "InstrumentType" AS ENUM ('REVENUE_SHARE_NOTE', 'ASSET_BACKED_PARTICIPATION', 'CONVERTIBLE_NOTE', 'SAFE', 'SPV_EQUITY');

-- CreateEnum
CREATE TYPE "DealStatus" AS ENUM ('DRAFT', 'UNDER_REVIEW', 'APPROVED', 'LIVE', 'CLOSED', 'DEFAULTED');

-- CreateEnum
CREATE TYPE "InvestmentStatus" AS ENUM ('COMMITTED', 'FUNDED', 'ACTIVE', 'EXITED', 'DEFAULTED');

-- CreateEnum
CREATE TYPE "VerificationType" AS ENUM ('CAC', 'NIN', 'BVN', 'BANK_ACCOUNT', 'REVENUE', 'ASSET', 'IDENTITY');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "TransactionDirection" AS ENUM ('INVESTOR_TO_ESCROW', 'ESCROW_TO_COMPANY', 'COMPANY_TO_INVESTOR', 'ESCROW_TO_INVESTOR');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REVERSED');

-- CreateEnum
CREATE TYPE "OwnershipType" AS ENUM ('EQUITY_PERCENTAGE', 'REVENUE_SHARE_PERCENTAGE', 'CONVERTIBLE_RIGHTS', 'ASSET_PARTICIPATION');

-- CreateEnum
CREATE TYPE "MonitoringMode" AS ENUM ('NORMAL', 'WATCH', 'INTERVENTION');

-- CreateEnum
CREATE TYPE "AdminActionType" AS ENUM ('APPROVE_VERIFICATION', 'REJECT_VERIFICATION', 'APPROVE_DEAL', 'REJECT_DEAL', 'CHANGE_MONITORING_STATUS', 'SUSPEND_COMPANY', 'SUSPEND_USER', 'MANUAL_INTERVENTION');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FounderProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bio" TEXT,
    "linkedinUrl" TEXT,
    "yearsExperience" INTEGER,
    "title" TEXT,
    "nin" TEXT,
    "bvn" TEXT,
    "ninVerified" BOOLEAN NOT NULL DEFAULT false,
    "bvnVerified" BOOLEAN NOT NULL DEFAULT false,
    "identityVerifiedAt" TIMESTAMP(3),
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "onboardingCompletedAt" TIMESTAMP(3),

    CONSTRAINT "FounderProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "investorType" TEXT,
    "firmName" TEXT,
    "aum" TEXT,
    "investmentFocus" TEXT[],
    "preferredLanes" TEXT[],
    "minimumCheckSize" DOUBLE PRECISION,
    "maximumCheckSize" DOUBLE PRECISION,
    "riskTolerance" TEXT,
    "liquidityNeeds" TEXT,
    "investmentHorizon" TEXT,
    "generalExperience" TEXT,
    "privateMarketExperience" TEXT,
    "sourceOfFunds" TEXT[],
    "accreditationBasis" TEXT,
    "brokerAffiliated" BOOLEAN NOT NULL DEFAULT false,
    "brokerDetails" TEXT,
    "seniorOfficer" BOOLEAN NOT NULL DEFAULT false,
    "seniorOfficerCompany" TEXT,
    "trustedContactName" TEXT,
    "trustedContactEmail" TEXT,
    "trustedContactPhone" TEXT,
    "trustedContactRelationship" TEXT,
    "countryOfResidence" TEXT,
    "fullName" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "citizenship" TEXT,
    "phone" TEXT,
    "residentialAddress" TEXT,
    "city" TEXT,
    "stateProvince" TEXT,
    "postalCode" TEXT,
    "nin" TEXT,
    "bvn" TEXT,
    "ssn" TEXT,
    "niNumber" TEXT,
    "passportNumber" TEXT,
    "idType" TEXT,
    "idNumber" TEXT,
    "riskAcknowledged" BOOLEAN NOT NULL DEFAULT false,
    "acknowledgePrivatePlacement" BOOLEAN NOT NULL DEFAULT false,
    "acknowledgeIlliquidity" BOOLEAN NOT NULL DEFAULT false,
    "acknowledgeLossRisk" BOOLEAN NOT NULL DEFAULT false,
    "acknowledgeNoGuarantee" BOOLEAN NOT NULL DEFAULT false,
    "acknowledgeAccreditedStatus" BOOLEAN NOT NULL DEFAULT false,
    "riskAcknowledgedAt" TIMESTAMP(3),
    "riskAcknowledgedIp" TEXT,
    "kycDocumentUrl" TEXT,
    "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "InvestorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "tradingName" TEXT,
    "countryOfIncorporation" TEXT NOT NULL DEFAULT 'Nigeria',
    "incorporationNumber" TEXT NOT NULL,
    "incorporationDate" TIMESTAMP(3) NOT NULL,
    "companyAddress" TEXT NOT NULL,
    "operatingCountries" TEXT[],
    "website" TEXT,
    "logoUrl" TEXT,
    "officialEmailDomain" TEXT NOT NULL,
    "cacVerificationStatus" TEXT,
    "sanctionsWatchlistCheck" TEXT,
    "teamSize" TEXT,
    "oneLineDescription" TEXT NOT NULL,
    "detailedDescription" TEXT NOT NULL,
    "sector" "Sector" NOT NULL,
    "subsector" TEXT,
    "businessModel" "BusinessModel" NOT NULL,
    "revenueModel" "RevenueModel" NOT NULL,
    "stage" "CompanyStage" NOT NULL,
    "revenueStatus" TEXT,
    "revenueRange" TEXT,
    "primaryRevenueSource" TEXT,
    "keyMetrics" JSONB,
    "majorCustomers" TEXT[],
    "geographicFootprint" TEXT,
    "regulatoryDependencies" TEXT,
    "bankAccountVerified" BOOLEAN NOT NULL DEFAULT false,
    "revenueVerificationMethod" TEXT,
    "hasRaisedBefore" BOOLEAN NOT NULL DEFAULT false,
    "previousRaises" JSONB,
    "founderOwnedPercent" DECIMAL(5,2),
    "externalInvestorsPercent" DECIMAL(5,2),
    "notableInvestors" TEXT[],
    "topRisks" TEXT[],
    "materialThreats" TEXT,
    "singleSupplier" BOOLEAN NOT NULL DEFAULT false,
    "fxExposure" BOOLEAN NOT NULL DEFAULT false,
    "regulationDependent" BOOLEAN NOT NULL DEFAULT false,
    "infrastructureDependent" BOOLEAN NOT NULL DEFAULT false,
    "preferredLane" "DealLane",
    "preferredInstrument" "InstrumentType",
    "targetRaiseRange" TEXT,
    "primaryUseOfFunds" TEXT,
    "equityAcknowledgementAccepted" BOOLEAN NOT NULL DEFAULT false,
    "equityAcknowledgementTimestamp" TIMESTAMP(3),
    "equityAcknowledgementIp" TEXT,
    "equityIssuedToCapvistaHoldings" BOOLEAN NOT NULL DEFAULT false,
    "currentMonitoringStatus" "MonitoringMode" NOT NULL DEFAULT 'NORMAL',

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyFounder" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "founderId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "linkedinUrl" TEXT,
    "yearsExperience" INTEGER,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nin" TEXT,
    "bvn" TEXT,

    CONSTRAINT "CompanyFounder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deal" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "lane" "DealLane" NOT NULL,
    "instrumentType" "InstrumentType" NOT NULL,
    "status" "DealStatus" NOT NULL DEFAULT 'DRAFT',
    "targetAmount" DECIMAL(12,2) NOT NULL,
    "minimumInvestment" DECIMAL(12,2) NOT NULL,
    "raisedAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "terms" JSONB NOT NULL,
    "openedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "pitchDeckUrl" TEXT,
    "financialDocsUrl" TEXT,
    "termsSheetUrl" TEXT,
    "currentMonitoringStatus" "MonitoringMode" NOT NULL DEFAULT 'NORMAL',

    CONSTRAINT "Deal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Investment" (
    "id" TEXT NOT NULL,
    "investorId" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "commitmentAmount" DECIMAL(12,2) NOT NULL,
    "fundedAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" "InvestmentStatus" NOT NULL DEFAULT 'COMMITTED',
    "committedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fundedAt" TIMESTAMP(3),
    "totalReturned" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "currentValue" DECIMAL(12,2) NOT NULL DEFAULT 0,

    CONSTRAINT "Investment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationRecord" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,
    "companyId" TEXT,
    "type" "VerificationType" NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "documentUrl" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "rejectionReason" TEXT,
    "metadata" JSONB,
    "supersededBy" TEXT,

    CONSTRAINT "VerificationRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EscrowTransaction" (
    "id" TEXT NOT NULL,
    "investmentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "direction" "TransactionDirection" NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "externalRef" TEXT,
    "metadata" JSONB,

    CONSTRAINT "EscrowTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OwnershipRecord" (
    "id" TEXT NOT NULL,
    "investmentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownershipType" "OwnershipType" NOT NULL,
    "terms" JSONB NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OwnershipRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonitoringStatus" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT,
    "dealId" TEXT,
    "mode" "MonitoringMode" NOT NULL,
    "triggeredBy" TEXT NOT NULL,
    "notes" TEXT,
    "escalationHistory" JSONB,
    "resolvedAt" TIMESTAMP(3),
    "resolution" TEXT,

    CONSTRAINT "MonitoringStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAction" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actionType" "AdminActionType" NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "dealId" TEXT,
    "reason" TEXT,
    "metadata" JSONB,

    CONSTRAINT "AdminAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CapvistaHoldingsEquity" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "investorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "equityPercentage" DECIMAL(5,4) NOT NULL DEFAULT 1.0000,
    "isNonPreferential" BOOLEAN NOT NULL DEFAULT true,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shareholderAgreementUrl" TEXT,

    CONSTRAINT "CapvistaHoldingsEquity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "FounderProfile_userId_key" ON "FounderProfile"("userId");

-- CreateIndex
CREATE INDEX "FounderProfile_userId_idx" ON "FounderProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "InvestorProfile_userId_key" ON "InvestorProfile"("userId");

-- CreateIndex
CREATE INDEX "InvestorProfile_userId_idx" ON "InvestorProfile"("userId");

-- CreateIndex
CREATE INDEX "InvestorProfile_investorType_idx" ON "InvestorProfile"("investorType");

-- CreateIndex
CREATE INDEX "InvestorProfile_verificationStatus_idx" ON "InvestorProfile"("verificationStatus");

-- CreateIndex
CREATE UNIQUE INDEX "Company_incorporationNumber_key" ON "Company"("incorporationNumber");

-- CreateIndex
CREATE INDEX "Company_incorporationNumber_idx" ON "Company"("incorporationNumber");

-- CreateIndex
CREATE INDEX "Company_sector_idx" ON "Company"("sector");

-- CreateIndex
CREATE INDEX "Company_stage_idx" ON "Company"("stage");

-- CreateIndex
CREATE INDEX "Company_ownerId_idx" ON "Company"("ownerId");

-- CreateIndex
CREATE INDEX "CompanyFounder_companyId_idx" ON "CompanyFounder"("companyId");

-- CreateIndex
CREATE INDEX "CompanyFounder_founderId_idx" ON "CompanyFounder"("founderId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyFounder_companyId_founderId_key" ON "CompanyFounder"("companyId", "founderId");

-- CreateIndex
CREATE INDEX "Deal_companyId_idx" ON "Deal"("companyId");

-- CreateIndex
CREATE INDEX "Deal_status_idx" ON "Deal"("status");

-- CreateIndex
CREATE INDEX "Deal_lane_idx" ON "Deal"("lane");

-- CreateIndex
CREATE INDEX "Investment_investorId_idx" ON "Investment"("investorId");

-- CreateIndex
CREATE INDEX "Investment_dealId_idx" ON "Investment"("dealId");

-- CreateIndex
CREATE INDEX "Investment_status_idx" ON "Investment"("status");

-- CreateIndex
CREATE INDEX "VerificationRecord_userId_idx" ON "VerificationRecord"("userId");

-- CreateIndex
CREATE INDEX "VerificationRecord_companyId_idx" ON "VerificationRecord"("companyId");

-- CreateIndex
CREATE INDEX "VerificationRecord_type_idx" ON "VerificationRecord"("type");

-- CreateIndex
CREATE INDEX "VerificationRecord_status_idx" ON "VerificationRecord"("status");

-- CreateIndex
CREATE INDEX "EscrowTransaction_investmentId_idx" ON "EscrowTransaction"("investmentId");

-- CreateIndex
CREATE INDEX "EscrowTransaction_status_idx" ON "EscrowTransaction"("status");

-- CreateIndex
CREATE INDEX "OwnershipRecord_investmentId_idx" ON "OwnershipRecord"("investmentId");

-- CreateIndex
CREATE INDEX "MonitoringStatus_companyId_idx" ON "MonitoringStatus"("companyId");

-- CreateIndex
CREATE INDEX "MonitoringStatus_dealId_idx" ON "MonitoringStatus"("dealId");

-- CreateIndex
CREATE INDEX "MonitoringStatus_mode_idx" ON "MonitoringStatus"("mode");

-- CreateIndex
CREATE INDEX "AdminAction_adminId_idx" ON "AdminAction"("adminId");

-- CreateIndex
CREATE INDEX "AdminAction_targetType_targetId_idx" ON "AdminAction"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "AdminAction_actionType_idx" ON "AdminAction"("actionType");

-- CreateIndex
CREATE UNIQUE INDEX "CapvistaHoldingsEquity_companyId_key" ON "CapvistaHoldingsEquity"("companyId");

-- CreateIndex
CREATE INDEX "CapvistaHoldingsEquity_companyId_idx" ON "CapvistaHoldingsEquity"("companyId");

-- CreateIndex
CREATE INDEX "CapvistaHoldingsEquity_investorId_idx" ON "CapvistaHoldingsEquity"("investorId");

-- AddForeignKey
ALTER TABLE "FounderProfile" ADD CONSTRAINT "FounderProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestorProfile" ADD CONSTRAINT "InvestorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "FounderProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyFounder" ADD CONSTRAINT "CompanyFounder_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyFounder" ADD CONSTRAINT "CompanyFounder_founderId_fkey" FOREIGN KEY ("founderId") REFERENCES "FounderProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Investment" ADD CONSTRAINT "Investment_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES "InvestorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Investment" ADD CONSTRAINT "Investment_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationRecord" ADD CONSTRAINT "VerificationRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationRecord" ADD CONSTRAINT "VerificationRecord_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EscrowTransaction" ADD CONSTRAINT "EscrowTransaction_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "Investment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnershipRecord" ADD CONSTRAINT "OwnershipRecord_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "Investment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonitoringStatus" ADD CONSTRAINT "MonitoringStatus_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonitoringStatus" ADD CONSTRAINT "MonitoringStatus_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminAction" ADD CONSTRAINT "AdminAction_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminAction" ADD CONSTRAINT "AdminAction_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapvistaHoldingsEquity" ADD CONSTRAINT "CapvistaHoldingsEquity_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapvistaHoldingsEquity" ADD CONSTRAINT "CapvistaHoldingsEquity_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES "InvestorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
