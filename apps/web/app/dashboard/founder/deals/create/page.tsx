"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import CustomSelect from "@/components/CustomSelect";
import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@/lib/contexts/AuthContext";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// ============================================================================
// TYPES
// ============================================================================
type Company = {
  id: string;
  legalName: string;
  tradingName?: string;
  preferredLane?: string;
  approvalStatus: string;
  incorporationDate?: string;
  stage?: string;
  sector?: string;
  subsector?: string;
};

type FormData = {
  // Step 1: Overview
  companyId: string;
  dealName: string;
  lane: string;
  instrumentType: string;
  jurisdiction: string;
  entityType: string;
  offeringStructure: string;
  closingType: string;
  leadInvestor: string;

  // Step 2: Financials
  targetAmount: string;
  minimumInvestment: string;
  softCap: string;
  closeDate: string;
  rollingClose: boolean;
  useOfFunds: string;
  currentRevenue: string;
  previousCapitalRaised: string;
  // Yield-specific financials
  expectedReturnStructure: string;
  paymentFrequency: string;
  capitalProtection: string;
  maturityTerms: string;

  // Step 3: Terms — instrument-specific (existing)
  revenueSharePercentage: string;
  repaymentCap: string;
  assetDescription: string;
  expectedYield: string;
  collateralDetails: string;
  interestRate: string;
  maturityDate: string;
  conversionDiscount: string;
  valuationCap: string;
  safeValuationCap: string;
  safeDiscountRate: string;
  mfnClause: boolean;
  pricePerShare: string;
  equityPercentageOffered: string;
  // Terms — new universal fields
  premoneyOrPostmoney: string;
  proRataRights: boolean;
  conversionTriggerEvents: string;
  liquidityEventDefinition: string;
  governingLaw: string;
  investorRightsSummary: string;
  transferRestrictions: string;
  minimumHoldPeriod: string;
  distributionTerms: string;
  // SPV-specific terms
  spvJurisdiction: string;
  spvAdminFee: string;
  spvManager: string;
  carry: string;
  votingRightsStructure: string;

  // Step 4: Company Disclosure
  corporateStructureOverview: string;
  capTableSnapshot: string;
  keyShareholders: string;
  directorList: string;
  bankingRelationship: string;
  materialContracts: string;
  hasOutstandingDebt: boolean;
  outstandingDebtDetails: string;
  hasPendingLitigation: boolean;
  pendingLitigationDetails: string;

  // Step 5: Risks
  marketRisk: string;
  executionRisk: string;
  regulatoryRisk: string;
  currencyRisk: string;
  liquidityRisk: string;
  concentrationRisk: string;
  riskDisclosureAcknowledged: boolean;

  // Step 6: Documents
  incorporationDocsFile: File | null;
  instrumentTemplateFile: File | null;
  riskDisclosureDocFile: File | null;
  subscriptionAgreementFile: File | null;
  pitchDeckFile: File | null;
  capTableDocFile: File | null;
  financialStatementsFile: File | null;
  founderBackgroundDocsFile: File | null;
  customerContractsFile: File | null;
  bankStatementsFile: File | null;
};

// ============================================================================
// CONSTANTS
// ============================================================================
const STEPS = [
  "Overview",
  "Financials",
  "Terms",
  "Company Disclosure",
  "Risks",
  "Documents & Review",
];

const laneOptions = [
  { value: "", label: "Select lane" },
  { value: "YIELD", label: "Yield Lane" },
  { value: "VENTURES", label: "Ventures Lane" },
];

const yieldInstrumentOptions = [
  { value: "", label: "Select instrument" },
  { value: "REVENUE_SHARE_NOTE", label: "Revenue Share Note" },
  { value: "ASSET_BACKED_PARTICIPATION", label: "Asset-Backed Participation" },
];

const venturesInstrumentOptions = [
  { value: "", label: "Select instrument" },
  { value: "CONVERTIBLE_NOTE", label: "Convertible Note" },
  { value: "SAFE", label: "SAFE" },
  { value: "SPV_EQUITY", label: "SPV Equity" },
];

const instrumentLabels: Record<string, string> = {
  REVENUE_SHARE_NOTE: "Revenue Share Note",
  ASSET_BACKED_PARTICIPATION: "Asset-Backed Participation",
  CONVERTIBLE_NOTE: "Convertible Note",
  SAFE: "SAFE",
  SPV_EQUITY: "SPV Equity",
};

const entityTypeOptions = [
  { value: "", label: "Select entity type" },
  { value: "Ltd", label: "Ltd" },
  { value: "PLC", label: "PLC" },
  { value: "Inc.", label: "Inc." },
  { value: "LLC", label: "LLC" },
  { value: "LLP", label: "LLP" },
  { value: "Other", label: "Other" },
];

const offeringStructureOptions = [
  { value: "", label: "Select offering structure" },
  { value: "Direct", label: "Direct" },
  { value: "SPV", label: "SPV" },
  { value: "Structured Vehicle", label: "Structured Vehicle" },
];

const closingTypeOptions = [
  { value: "", label: "Select closing type" },
  { value: "Rolling Close", label: "Rolling Close" },
  { value: "Single Close", label: "Single Close" },
];

const paymentFrequencyOptions = [
  { value: "", label: "Select frequency" },
  { value: "Monthly", label: "Monthly" },
  { value: "Quarterly", label: "Quarterly" },
  { value: "Semi-Annually", label: "Semi-Annually" },
  { value: "Annually", label: "Annually" },
];

const premoneyOptions = [
  { value: "", label: "Select valuation basis" },
  { value: "Pre-money", label: "Pre-money" },
  { value: "Post-money", label: "Post-money" },
  { value: "N/A", label: "N/A" },
];

const countryOptions = [
  { value: "", label: "Select jurisdiction" },
  { value: "Nigeria", label: "Nigeria" },
  { value: "Kenya", label: "Kenya" },
  { value: "Ghana", label: "Ghana" },
  { value: "South Africa", label: "South Africa" },
  { value: "Egypt", label: "Egypt" },
  { value: "Morocco", label: "Morocco" },
  { value: "Algeria", label: "Algeria" },
  { value: "Tunisia", label: "Tunisia" },
  { value: "Libya", label: "Libya" },
  { value: "Sudan", label: "Sudan" },
  { value: "Ethiopia", label: "Ethiopia" },
  { value: "Eritrea", label: "Eritrea" },
  { value: "Djibouti", label: "Djibouti" },
  { value: "Somalia", label: "Somalia" },
  { value: "Tanzania", label: "Tanzania" },
  { value: "Uganda", label: "Uganda" },
  { value: "Rwanda", label: "Rwanda" },
  { value: "Burundi", label: "Burundi" },
  { value: "Zambia", label: "Zambia" },
  { value: "Zimbabwe", label: "Zimbabwe" },
  { value: "Malawi", label: "Malawi" },
  { value: "Mozambique", label: "Mozambique" },
  { value: "Botswana", label: "Botswana" },
  { value: "Namibia", label: "Namibia" },
  { value: "Angola", label: "Angola" },
  { value: "Lesotho", label: "Lesotho" },
  { value: "Eswatini", label: "Eswatini" },
  { value: "Mauritius", label: "Mauritius" },
  { value: "Seychelles", label: "Seychelles" },
  { value: "Madagascar", label: "Madagascar" },
  { value: "Comoros", label: "Comoros" },
  { value: "Senegal", label: "Senegal" },
  { value: "Gambia", label: "Gambia" },
  { value: "Guinea-Bissau", label: "Guinea-Bissau" },
  { value: "Guinea", label: "Guinea" },
  { value: "Sierra Leone", label: "Sierra Leone" },
  { value: "Liberia", label: "Liberia" },
  { value: "Ivory Coast", label: "Ivory Coast" },
  { value: "Burkina Faso", label: "Burkina Faso" },
  { value: "Mali", label: "Mali" },
  { value: "Mauritania", label: "Mauritania" },
  { value: "Niger", label: "Niger" },
  { value: "Chad", label: "Chad" },
  { value: "Cameroon", label: "Cameroon" },
  { value: "Central African Republic", label: "Central African Republic" },
  { value: "Equatorial Guinea", label: "Equatorial Guinea" },
  { value: "Gabon", label: "Gabon" },
  { value: "Republic of the Congo", label: "Republic of the Congo" },
  { value: "Democratic Republic of the Congo", label: "Democratic Republic of the Congo" },
  { value: "Benin", label: "Benin" },
  { value: "Togo", label: "Togo" },
  { value: "Cape Verde", label: "Cape Verde" },
  { value: "Sao Tome and Principe", label: "Sao Tome and Principe" },
];

const stageLabels: Record<string, string> = {
  PRE_REVENUE: "Pre-Revenue",
  EARLY_REVENUE: "Early Revenue",
  GROWTH: "Growth",
  PROFITABLE: "Profitable",
};

const sectorLabels: Record<string, string> = {
  TECHNOLOGY: "Technology",
  FINTECH: "Fintech",
  LOGISTICS: "Logistics",
  ENERGY: "Energy",
  CONSUMER_FMCG: "Consumer / FMCG",
  HEALTH: "Health",
  AGRI_FOOD: "Agri / Food",
  REAL_ESTATE: "Real Estate",
  INFRASTRUCTURE: "Infrastructure",
  SAAS_TECH: "SaaS / Tech",
  MANUFACTURING: "Manufacturing",
};

// ============================================================================
// VALIDATION
// ============================================================================
function validateStep(step: number, formData: FormData): string[] {
  const errors: string[] = [];

  switch (step) {
    case 0: // Overview
      if (!formData.companyId) errors.push("companyId");
      if (!formData.dealName.trim()) errors.push("dealName");
      if (!formData.lane) errors.push("lane");
      if (!formData.instrumentType) errors.push("instrumentType");
      if (!formData.jurisdiction) errors.push("jurisdiction");
      if (!formData.entityType) errors.push("entityType");
      if (!formData.offeringStructure) errors.push("offeringStructure");
      if (!formData.closingType) errors.push("closingType");
      break;

    case 1: // Financials
      if (!formData.targetAmount || parseFloat(formData.targetAmount) <= 0)
        errors.push("targetAmount");
      if (
        !formData.minimumInvestment ||
        parseFloat(formData.minimumInvestment) <= 0
      )
        errors.push("minimumInvestment");
      if (!formData.closeDate) errors.push("closeDate");
      if (!formData.useOfFunds.trim()) errors.push("useOfFunds");
      // Yield-specific required fields
      if (formData.lane === "YIELD") {
        if (!formData.expectedReturnStructure.trim())
          errors.push("expectedReturnStructure");
        if (!formData.paymentFrequency) errors.push("paymentFrequency");
        if (!formData.maturityTerms.trim()) errors.push("maturityTerms");
      }
      break;

    case 2: // Terms
      // Instrument-specific validation
      if (formData.instrumentType === "REVENUE_SHARE_NOTE") {
        if (!formData.revenueSharePercentage)
          errors.push("revenueSharePercentage");
        if (!formData.repaymentCap) errors.push("repaymentCap");
      }
      if (formData.instrumentType === "ASSET_BACKED_PARTICIPATION") {
        if (!formData.assetDescription.trim())
          errors.push("assetDescription");
        if (!formData.expectedYield) errors.push("expectedYield");
        if (!formData.collateralDetails.trim())
          errors.push("collateralDetails");
      }
      if (formData.instrumentType === "CONVERTIBLE_NOTE") {
        if (!formData.interestRate) errors.push("interestRate");
        if (!formData.maturityDate) errors.push("maturityDate");
        if (!formData.conversionDiscount) errors.push("conversionDiscount");
        if (!formData.valuationCap) errors.push("valuationCap");
      }
      if (formData.instrumentType === "SAFE") {
        if (!formData.safeValuationCap) errors.push("safeValuationCap");
        if (!formData.safeDiscountRate) errors.push("safeDiscountRate");
      }
      if (formData.instrumentType === "SPV_EQUITY") {
        if (!formData.pricePerShare) errors.push("pricePerShare");
        if (!formData.equityPercentageOffered)
          errors.push("equityPercentageOffered");
      }
      // Universal required terms
      if (!formData.governingLaw.trim()) errors.push("governingLaw");
      if (!formData.investorRightsSummary.trim())
        errors.push("investorRightsSummary");
      if (!formData.transferRestrictions.trim())
        errors.push("transferRestrictions");
      // SPV-specific required
      if (formData.offeringStructure === "SPV") {
        if (!formData.spvJurisdiction.trim()) errors.push("spvJurisdiction");
        if (!formData.spvAdminFee.trim()) errors.push("spvAdminFee");
        if (!formData.spvManager.trim()) errors.push("spvManager");
        if (!formData.votingRightsStructure.trim())
          errors.push("votingRightsStructure");
      }
      break;

    case 3: // Company Disclosure
      if (!formData.corporateStructureOverview.trim())
        errors.push("corporateStructureOverview");
      if (!formData.capTableSnapshot.trim()) errors.push("capTableSnapshot");
      if (!formData.keyShareholders.trim()) errors.push("keyShareholders");
      if (!formData.directorList.trim()) errors.push("directorList");
      if (formData.hasOutstandingDebt && !formData.outstandingDebtDetails.trim())
        errors.push("outstandingDebtDetails");
      if (formData.hasPendingLitigation && !formData.pendingLitigationDetails.trim())
        errors.push("pendingLitigationDetails");
      break;

    case 4: // Risks
      if (!formData.marketRisk.trim()) errors.push("marketRisk");
      if (!formData.executionRisk.trim()) errors.push("executionRisk");
      if (!formData.regulatoryRisk.trim()) errors.push("regulatoryRisk");
      if (!formData.currencyRisk.trim()) errors.push("currencyRisk");
      if (!formData.liquidityRisk.trim()) errors.push("liquidityRisk");
      if (!formData.riskDisclosureAcknowledged)
        errors.push("riskDisclosureAcknowledged");
      break;
  }

  return errors;
}

function inputClass(hasError: boolean) {
  return `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none ${
    hasError ? "border-red-400 bg-red-50" : "border-gray-300"
  }`;
}

function FieldError({ show, message }: { show: boolean; message: string }) {
  if (!show) return null;
  return <p className="text-xs text-red-600 mt-1">{message}</p>;
}

// ============================================================================
// MAIN PAGE
// ============================================================================
export default function CreateDealPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ backgroundColor: "#F6F8FA" }}
        >
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate">Loading...</p>
          </div>
        </div>
      }
    >
      <CreateDealContent />
    </Suspense>
  );
}

function CreateDealContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, accessToken, loading } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const preselectedCompanyId = searchParams.get("companyId") || "";
  const editDealId = searchParams.get("dealId") || "";
  const [savingDraft, setSavingDraft] = useState(false);
  const [loadingDeal, setLoadingDeal] = useState(!!searchParams.get("dealId"));

  const [formData, setFormData] = useState<FormData>({
    // Step 1: Overview
    companyId: "",
    dealName: "",
    lane: "",
    instrumentType: "",
    jurisdiction: "",
    entityType: "",
    offeringStructure: "",
    closingType: "",
    leadInvestor: "",
    // Step 2: Financials
    targetAmount: "",
    minimumInvestment: "",
    softCap: "",
    closeDate: "",
    rollingClose: false,
    useOfFunds: "",
    currentRevenue: "",
    previousCapitalRaised: "",
    expectedReturnStructure: "",
    paymentFrequency: "",
    capitalProtection: "",
    maturityTerms: "",
    // Step 3: Terms
    revenueSharePercentage: "",
    repaymentCap: "",
    assetDescription: "",
    expectedYield: "",
    collateralDetails: "",
    interestRate: "",
    maturityDate: "",
    conversionDiscount: "",
    valuationCap: "",
    safeValuationCap: "",
    safeDiscountRate: "",
    mfnClause: false,
    pricePerShare: "",
    equityPercentageOffered: "",
    premoneyOrPostmoney: "",
    proRataRights: false,
    conversionTriggerEvents: "",
    liquidityEventDefinition: "",
    governingLaw: "",
    investorRightsSummary: "",
    transferRestrictions: "",
    minimumHoldPeriod: "",
    distributionTerms: "",
    spvJurisdiction: "",
    spvAdminFee: "",
    spvManager: "",
    carry: "",
    votingRightsStructure: "",
    // Step 4: Company Disclosure
    corporateStructureOverview: "",
    capTableSnapshot: "",
    keyShareholders: "",
    directorList: "",
    bankingRelationship: "",
    materialContracts: "",
    hasOutstandingDebt: false,
    outstandingDebtDetails: "",
    hasPendingLitigation: false,
    pendingLitigationDetails: "",
    // Step 5: Risks
    marketRisk: "",
    executionRisk: "",
    regulatoryRisk: "",
    currencyRisk: "",
    liquidityRisk: "",
    concentrationRisk: "",
    riskDisclosureAcknowledged: false,
    // Step 6: Documents
    incorporationDocsFile: null,
    instrumentTemplateFile: null,
    riskDisclosureDocFile: null,
    subscriptionAgreementFile: null,
    pitchDeckFile: null,
    capTableDocFile: null,
    financialStatementsFile: null,
    founderBackgroundDocsFile: null,
    customerContractsFile: null,
    bankStatementsFile: null,
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  // Fetch approved companies with full details
  useEffect(() => {
    async function fetchCompanies() {
      if (!accessToken) return;
      try {
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        const res = await fetch(`${API_URL}/api/companies/my-companies`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await res.json();
        if (data.success) {
          const approved = (data.data as Company[]).filter(
            (c) => c.approvalStatus === "APPROVED",
          );
          setCompanies(approved);

          if (preselectedCompanyId) {
            const match = approved.find(
              (c) => c.id === preselectedCompanyId,
            );
            if (match) {
              setFormData((prev) => ({
                ...prev,
                companyId: match.id,
                lane: match.preferredLane || "",
              }));
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch companies:", err);
      } finally {
        setLoadingCompanies(false);
      }
    }

    if (!loading && user) {
      fetchCompanies();
    }
  }, [user, loading, accessToken, preselectedCompanyId]);

  // Fetch existing deal data when editing a draft
  useEffect(() => {
    async function fetchDeal() {
      if (!accessToken || !editDealId) return;
      try {
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        const res = await fetch(`${API_URL}/api/deals/${editDealId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await res.json();
        if (data.success && data.data) {
          const d = data.data;
          const terms = d.terms || {};
          const disclosure = d.companyDisclosure || {};
          const risks = d.dealRisks || {};
          setFormData((prev) => ({
            ...prev,
            companyId: d.companyId || prev.companyId,
            dealName: d.name || "",
            lane: d.lane || "",
            instrumentType: d.instrumentType || "",
            jurisdiction: d.jurisdiction || "",
            entityType: d.entityType || "",
            offeringStructure: d.offeringStructure || "",
            closingType: d.closingType || "",
            leadInvestor: d.leadInvestor || "",
            targetAmount: d.targetAmount ? String(d.targetAmount) : "",
            minimumInvestment: d.minimumInvestment ? String(d.minimumInvestment) : "",
            softCap: d.softCap ? String(d.softCap) : "",
            closeDate: d.closeDate ? d.closeDate.split("T")[0] : "",
            rollingClose: d.rollingClose || false,
            useOfFunds: d.useOfFunds || "",
            currentRevenue: d.currentRevenue || "",
            previousCapitalRaised: d.previousCapitalRaised || "",
            expectedReturnStructure: d.expectedReturnStructure || "",
            paymentFrequency: d.paymentFrequency || "",
            capitalProtection: d.capitalProtection || "",
            maturityTerms: d.maturityTerms || "",
            // Terms
            revenueSharePercentage: terms.revenueSharePercentage != null ? String(terms.revenueSharePercentage) : "",
            repaymentCap: terms.repaymentCap != null ? String(terms.repaymentCap) : "",
            assetDescription: terms.assetDescription || "",
            expectedYield: terms.expectedYield != null ? String(terms.expectedYield) : "",
            collateralDetails: terms.collateralDetails || "",
            interestRate: terms.interestRate != null ? String(terms.interestRate) : "",
            maturityDate: terms.maturityDate || "",
            conversionDiscount: terms.conversionDiscount != null ? String(terms.conversionDiscount) : "",
            valuationCap: terms.valuationCap != null ? String(terms.valuationCap) : "",
            safeValuationCap: terms.valuationCap != null && d.instrumentType === "SAFE" ? String(terms.valuationCap) : "",
            safeDiscountRate: terms.discountRate != null ? String(terms.discountRate) : "",
            mfnClause: terms.mfnClause || false,
            pricePerShare: terms.pricePerShare != null ? String(terms.pricePerShare) : "",
            equityPercentageOffered: terms.equityPercentageOffered != null ? String(terms.equityPercentageOffered) : "",
            premoneyOrPostmoney: terms.premoneyOrPostmoney || "",
            proRataRights: terms.proRataRights || false,
            conversionTriggerEvents: terms.conversionTriggerEvents || "",
            liquidityEventDefinition: terms.liquidityEventDefinition || "",
            governingLaw: terms.governingLaw || "",
            investorRightsSummary: terms.investorRightsSummary || "",
            transferRestrictions: terms.transferRestrictions || "",
            minimumHoldPeriod: terms.minimumHoldPeriod || "",
            distributionTerms: terms.distributionTerms || "",
            spvJurisdiction: terms.spvJurisdiction || "",
            spvAdminFee: terms.spvAdminFee || "",
            spvManager: terms.spvManager || "",
            carry: terms.carry || "",
            votingRightsStructure: terms.votingRightsStructure || "",
            // Company Disclosure
            corporateStructureOverview: disclosure.corporateStructureOverview || "",
            capTableSnapshot: disclosure.capTableSnapshot || "",
            keyShareholders: disclosure.keyShareholders || "",
            directorList: disclosure.directorList || "",
            bankingRelationship: disclosure.bankingRelationship || "",
            materialContracts: disclosure.materialContracts || "",
            hasOutstandingDebt: disclosure.hasOutstandingDebt || false,
            outstandingDebtDetails: disclosure.outstandingDebtDetails || "",
            hasPendingLitigation: disclosure.hasPendingLitigation || false,
            pendingLitigationDetails: disclosure.pendingLitigationDetails || "",
            // Risks
            marketRisk: risks.marketRisk || "",
            executionRisk: risks.executionRisk || "",
            regulatoryRisk: risks.regulatoryRisk || "",
            currencyRisk: risks.currencyRisk || "",
            liquidityRisk: risks.liquidityRisk || "",
            concentrationRisk: risks.concentrationRisk || "",
            riskDisclosureAcknowledged: risks.riskDisclosureAcknowledged || false,
          }));
        }
      } catch (err) {
        console.error("Failed to fetch deal:", err);
      } finally {
        setLoadingDeal(false);
      }
    }

    if (!loading && user && editDealId) {
      fetchDeal();
    }
  }, [user, loading, accessToken, editDealId]);

  const updateField = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLaneChange = (lane: string) => {
    setFormData((prev) => ({
      ...prev,
      lane,
      instrumentType: "",
    }));
  };

  const handleCompanyChange = (companyId: string) => {
    const selected = companies.find((c) => c.id === companyId);
    setFormData((prev) => ({
      ...prev,
      companyId,
      lane: selected?.preferredLane || prev.lane,
      instrumentType: "",
    }));
  };

  const nextStep = () => {
    const errors = validateStep(currentStep, formData);
    if (errors.length > 0) {
      setValidationErrors(errors);
      window.scrollTo(0, 0);
      return;
    }
    setValidationErrors([]);
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setValidationErrors([]);
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const buildTerms = () => {
    const terms: Record<string, any> = {};

    // Instrument-specific terms
    switch (formData.instrumentType) {
      case "REVENUE_SHARE_NOTE":
        terms.revenueSharePercentage = parseFloat(formData.revenueSharePercentage);
        terms.repaymentCap = parseFloat(formData.repaymentCap);
        break;
      case "ASSET_BACKED_PARTICIPATION":
        terms.assetDescription = formData.assetDescription;
        terms.expectedYield = parseFloat(formData.expectedYield);
        terms.collateralDetails = formData.collateralDetails;
        break;
      case "CONVERTIBLE_NOTE":
        terms.interestRate = parseFloat(formData.interestRate);
        terms.maturityDate = formData.maturityDate;
        terms.conversionDiscount = parseFloat(formData.conversionDiscount);
        terms.valuationCap = parseFloat(formData.valuationCap);
        break;
      case "SAFE":
        terms.valuationCap = parseFloat(formData.safeValuationCap);
        terms.discountRate = parseFloat(formData.safeDiscountRate);
        terms.mfnClause = formData.mfnClause;
        break;
      case "SPV_EQUITY":
        terms.pricePerShare = parseFloat(formData.pricePerShare);
        terms.equityPercentageOffered = parseFloat(formData.equityPercentageOffered);
        break;
    }

    // Universal terms
    if (formData.premoneyOrPostmoney) terms.premoneyOrPostmoney = formData.premoneyOrPostmoney;
    terms.proRataRights = formData.proRataRights;
    if (formData.conversionTriggerEvents) terms.conversionTriggerEvents = formData.conversionTriggerEvents;
    if (formData.liquidityEventDefinition) terms.liquidityEventDefinition = formData.liquidityEventDefinition;
    terms.governingLaw = formData.governingLaw;
    terms.investorRightsSummary = formData.investorRightsSummary;
    terms.transferRestrictions = formData.transferRestrictions;
    if (formData.minimumHoldPeriod) terms.minimumHoldPeriod = formData.minimumHoldPeriod;
    if (formData.distributionTerms) terms.distributionTerms = formData.distributionTerms;

    // SPV-specific terms
    if (formData.offeringStructure === "SPV") {
      terms.spvJurisdiction = formData.spvJurisdiction;
      terms.spvAdminFee = formData.spvAdminFee;
      terms.spvManager = formData.spvManager;
      if (formData.carry) terms.carry = formData.carry;
      terms.votingRightsStructure = formData.votingRightsStructure;
    }

    return terms;
  };

  const buildCompanyDisclosure = () => {
    return {
      corporateStructureOverview: formData.corporateStructureOverview,
      capTableSnapshot: formData.capTableSnapshot,
      keyShareholders: formData.keyShareholders,
      directorList: formData.directorList,
      bankingRelationship: formData.bankingRelationship || null,
      materialContracts: formData.materialContracts || null,
      hasOutstandingDebt: formData.hasOutstandingDebt,
      outstandingDebtDetails: formData.hasOutstandingDebt ? formData.outstandingDebtDetails : null,
      hasPendingLitigation: formData.hasPendingLitigation,
      pendingLitigationDetails: formData.hasPendingLitigation ? formData.pendingLitigationDetails : null,
    };
  };

  const buildDealRisks = () => {
    return {
      marketRisk: formData.marketRisk,
      executionRisk: formData.executionRisk,
      regulatoryRisk: formData.regulatoryRisk,
      currencyRisk: formData.currencyRisk,
      liquidityRisk: formData.liquidityRisk,
      concentrationRisk: formData.concentrationRisk || null,
      riskDisclosureAcknowledged: formData.riskDisclosureAcknowledged,
    };
  };

  const saveDraft = async () => {
    if (!formData.companyId) {
      alert("Please select a company before saving a draft.");
      return;
    }
    setSavingDraft(true);
    try {
      if (!accessToken) {
        alert("Your session has expired. Please log in again.");
        router.push("/");
        return;
      }

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

      const payload: Record<string, any> = {
        companyId: formData.companyId,
        name: formData.dealName || undefined,
        status: "DRAFT",
      };

      // Include whatever data has been filled so far
      if (formData.lane) payload.lane = formData.lane;
      if (formData.instrumentType) payload.instrumentType = formData.instrumentType;
      if (formData.targetAmount) payload.targetAmount = parseFloat(formData.targetAmount);
      if (formData.minimumInvestment) payload.minimumInvestment = parseFloat(formData.minimumInvestment);
      if (formData.jurisdiction) payload.jurisdiction = formData.jurisdiction;
      if (formData.entityType) payload.entityType = formData.entityType;
      if (formData.offeringStructure) payload.offeringStructure = formData.offeringStructure;
      if (formData.closingType) payload.closingType = formData.closingType;
      if (formData.leadInvestor) payload.leadInvestor = formData.leadInvestor;
      if (formData.softCap) payload.softCap = parseFloat(formData.softCap);
      if (formData.closeDate) payload.closeDate = formData.closeDate;
      payload.rollingClose = formData.rollingClose;
      if (formData.useOfFunds) payload.useOfFunds = formData.useOfFunds;
      if (formData.currentRevenue) payload.currentRevenue = formData.currentRevenue;
      if (formData.previousCapitalRaised) payload.previousCapitalRaised = formData.previousCapitalRaised;
      if (formData.expectedReturnStructure) payload.expectedReturnStructure = formData.expectedReturnStructure;
      if (formData.paymentFrequency) payload.paymentFrequency = formData.paymentFrequency;
      if (formData.capitalProtection) payload.capitalProtection = formData.capitalProtection;
      if (formData.maturityTerms) payload.maturityTerms = formData.maturityTerms;

      // Include terms if any instrument-specific data exists
      if (formData.instrumentType) {
        payload.terms = buildTerms();
      }

      // Include disclosure if any data exists
      if (formData.corporateStructureOverview || formData.capTableSnapshot) {
        payload.companyDisclosure = buildCompanyDisclosure();
      }

      // Include risks if any data exists
      if (formData.marketRisk || formData.executionRisk) {
        payload.dealRisks = buildDealRisks();
      }

      if (editDealId) {
        // Update existing draft — remove companyId (not allowed on PATCH)
        const { companyId: _, ...patchPayload } = payload;
        const response = await fetch(`${API_URL}/api/deals/${editDealId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(patchPayload),
        });
        const result = await response.json();
        if (result.success) {
          router.push("/dashboard/founder");
        } else {
          alert(`Error: ${result.error?.message || "Failed to save draft"}`);
        }
      } else {
        // Create new draft
        const response = await fetch(`${API_URL}/api/deals`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        });
        const result = await response.json();
        if (result.success) {
          router.push("/dashboard/founder");
        } else {
          alert(`Error: ${result.error?.message || "Failed to save draft"}`);
        }
      }
    } catch (error) {
      console.error("Save draft error:", error);
      alert("Failed to save draft. Please try again.");
    } finally {
      setSavingDraft(false);
    }
  };

  const uploadFile = async (file: File, prefix: string): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${formData.companyId}/${prefix}-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("deal_documents")
      .upload(fileName, file);

    if (uploadError) {
      throw new Error(`Failed to upload ${prefix}: ${uploadError.message}`);
    }

    const { data: urlData } = supabase.storage
      .from("deal_documents")
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (!accessToken) {
        alert("Your session has expired. Please log in again.");
        router.push("/");
        return;
      }

      // Upload documents
      const docUploads: Record<string, string | undefined> = {};

      const uploadEntries: [string, File | null, string][] = [
        ["incorporationDocsUrl", formData.incorporationDocsFile, "incorporation-docs"],
        ["instrumentTemplateUrl", formData.instrumentTemplateFile, "instrument-template"],
        ["riskDisclosureDocUrl", formData.riskDisclosureDocFile, "risk-disclosure"],
        ["subscriptionAgreementUrl", formData.subscriptionAgreementFile, "subscription-agreement"],
        ["pitchDeckUrl", formData.pitchDeckFile, "pitch-deck"],
        ["capTableDocUrl", formData.capTableDocFile, "cap-table"],
        ["financialStatementsUrl", formData.financialStatementsFile, "financial-statements"],
        ["founderBackgroundDocsUrl", formData.founderBackgroundDocsFile, "founder-background"],
        ["customerContractsUrl", formData.customerContractsFile, "customer-contracts"],
        ["bankStatementsUrl", formData.bankStatementsFile, "bank-statements"],
      ];

      for (const [key, file, prefix] of uploadEntries) {
        if (file) {
          docUploads[key] = await uploadFile(file, prefix);
        }
      }

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

      const payload: Record<string, any> = {
        companyId: formData.companyId,
        name: formData.dealName,
        lane: formData.lane,
        instrumentType: formData.instrumentType,
        targetAmount: parseFloat(formData.targetAmount),
        minimumInvestment: parseFloat(formData.minimumInvestment),
        terms: buildTerms(),
        status: "UNDER_REVIEW",

        // Overview
        jurisdiction: formData.jurisdiction,
        entityType: formData.entityType,
        offeringStructure: formData.offeringStructure,
        closingType: formData.closingType,
        leadInvestor: formData.leadInvestor || null,

        // Financials
        softCap: formData.softCap ? parseFloat(formData.softCap) : null,
        closeDate: formData.closeDate,
        rollingClose: formData.rollingClose,
        useOfFunds: formData.useOfFunds,
        currentRevenue: formData.currentRevenue || null,
        previousCapitalRaised: formData.previousCapitalRaised || null,

        // Yield-specific financials
        expectedReturnStructure: formData.lane === "YIELD" ? formData.expectedReturnStructure : null,
        paymentFrequency: formData.lane === "YIELD" ? formData.paymentFrequency : null,
        capitalProtection: formData.lane === "YIELD" ? (formData.capitalProtection || null) : null,
        maturityTerms: formData.lane === "YIELD" ? formData.maturityTerms : null,

        // Disclosure & Risks
        companyDisclosure: buildCompanyDisclosure(),
        dealRisks: buildDealRisks(),

        // Document URLs
        ...docUploads,
      };

      let response;
      if (editDealId) {
        // Update existing draft and submit for review — remove companyId (not allowed on PATCH)
        const { companyId: _, ...patchPayload } = payload;
        response = await fetch(`${API_URL}/api/deals/${editDealId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(patchPayload),
        });
      } else {
        // Create new deal directly as UNDER_REVIEW
        response = await fetch(`${API_URL}/api/deals`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        });
      }

      const result = await response.json();

      if (result.success) {
        router.push("/dashboard/founder");
      } else {
        alert(`Error: ${result.error?.message || "Failed to create deal"}`);
      }
    } catch (error) {
      console.error("Deal creation error:", error);
      alert("Failed to create deal. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#F6F8FA" }}
      >
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const companyOptions = [
    { value: "", label: "Select a company" },
    ...companies.map((c) => ({
      value: c.id,
      label: c.tradingName || c.legalName,
    })),
  ];

  const instrumentOptions =
    formData.lane === "YIELD"
      ? yieldInstrumentOptions
      : formData.lane === "VENTURES"
        ? venturesInstrumentOptions
        : [{ value: "", label: "Select a lane first" }];

  const selectedCompany = companies.find((c) => c.id === formData.companyId);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F6F8FA" }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container">
          <div className="flex items-center justify-between py-4">
            <Link
              href="/dashboard/founder"
              className="flex items-center space-x-2"
            >
              <div
                className="h-9 w-9 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "#C8A24D" }}
              >
                <span
                  className="font-bold text-base"
                  style={{ color: "#0B1C2D" }}
                >
                  CV
                </span>
              </div>
              <span className="text-xl font-bold text-primary-950">
                Capvista
              </span>
            </Link>
            <Link
              href="/dashboard/founder"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Cancel
            </Link>
          </div>
        </div>
      </header>

      {/* Step Indicator */}
      <div className="bg-white border-b border-gray-200">
        <div className="container py-6">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => (
              <div key={step} className="flex-1 relative">
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                      index <= currentStep
                        ? "bg-primary-950 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {index + 1}
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 transition-colors ${
                        index < currentStep
                          ? "bg-primary-950"
                          : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
                <p className="text-xs mt-2 text-gray-600 hidden md:block">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container py-8">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm font-medium mb-6">
              Please complete all required fields before proceeding.
            </div>
          )}

          {loadingCompanies || loadingDeal ? (
            <div className="text-center py-12">
              <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading your companies...</p>
            </div>
          ) : companies.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">
                You need at least one approved company to create a deal.
              </p>
              <Link
                href="/dashboard/founder"
                className="inline-block px-6 py-3 rounded-lg font-semibold transition-all"
                style={{ backgroundColor: "#C8A24D", color: "#0B1C2D" }}
              >
                Back to Dashboard
              </Link>
            </div>
          ) : (
            <>
              {currentStep === 0 && (
                <Step1Overview
                  formData={formData}
                  companyOptions={companyOptions}
                  instrumentOptions={instrumentOptions}
                  selectedCompany={selectedCompany}
                  onCompanyChange={handleCompanyChange}
                  onLaneChange={handleLaneChange}
                  updateField={updateField}
                  errors={validationErrors}
                />
              )}
              {currentStep === 1 && (
                <Step2Financials
                  formData={formData}
                  updateField={updateField}
                  errors={validationErrors}
                />
              )}
              {currentStep === 2 && (
                <Step3Terms
                  formData={formData}
                  updateField={updateField}
                  errors={validationErrors}
                />
              )}
              {currentStep === 3 && (
                <Step4Disclosure
                  formData={formData}
                  updateField={updateField}
                  errors={validationErrors}
                />
              )}
              {currentStep === 4 && (
                <Step5Risks
                  formData={formData}
                  updateField={updateField}
                  errors={validationErrors}
                />
              )}
              {currentStep === 5 && (
                <Step6DocumentsReview
                  formData={formData}
                  companies={companies}
                  updateField={updateField}
                />
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-8 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <button
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-gray-300 text-gray-700 hover:border-gray-400"
                  >
                    Previous
                  </button>
                  <button
                    onClick={saveDraft}
                    disabled={savingDraft || submitting}
                    className="px-5 py-3 rounded-lg font-medium transition-all disabled:opacity-50 border border-gray-300 text-gray-600 hover:bg-gray-50"
                  >
                    {savingDraft ? "Saving..." : "Save Draft"}
                  </button>
                </div>

                {currentStep < STEPS.length - 1 ? (
                  <button
                    onClick={nextStep}
                    className="px-6 py-3 rounded-lg font-semibold transition-all"
                    style={{ backgroundColor: "#C8A24D", color: "#0B1C2D" }}
                  >
                    Next Step
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || savingDraft}
                    className="px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50"
                    style={{ backgroundColor: "#C8A24D", color: "#0B1C2D" }}
                  >
                    {submitting ? "Submitting..." : "Submit for Review"}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// ============================================================================
// STEP 1: OVERVIEW
// ============================================================================
function Step1Overview({
  formData,
  companyOptions,
  instrumentOptions,
  selectedCompany,
  onCompanyChange,
  onLaneChange,
  updateField,
  errors,
}: {
  formData: FormData;
  companyOptions: { value: string; label: string }[];
  instrumentOptions: { value: string; label: string }[];
  selectedCompany: Company | undefined;
  onCompanyChange: (id: string) => void;
  onLaneChange: (lane: string) => void;
  updateField: (field: keyof FormData, value: any) => void;
  errors: string[];
}) {
  const hasErr = (field: string) => errors.includes(field);

  return (
    <div>
      <h2 className="text-2xl font-bold text-primary-950 mb-1">
        Deal Overview
      </h2>
      <p className="text-gray-600 mb-8">
        Define the core parameters of this investment offering.
      </p>

      {/* Company */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Issuing Company <span className="text-red-500">*</span>
        </label>
        <CustomSelect
          value={formData.companyId}
          onChange={onCompanyChange}
          options={companyOptions}
          placeholder="Select a company"
        />
        <FieldError
          show={hasErr("companyId")}
          message="Please select a company"
        />
      </div>

      {/* Company Snapshot */}
      {selectedCompany && (
        <div className="mb-6 bg-gray-50 rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Company Snapshot
            </h4>
            {selectedCompany.approvalStatus === "APPROVED" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verified by Capvista
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-y-3 text-sm">
            <span className="text-gray-600">Legal Name</span>
            <span className="font-medium text-gray-900">{selectedCompany.legalName}</span>
            {selectedCompany.incorporationDate && (
              <>
                <span className="text-gray-600">Founded</span>
                <span className="font-medium text-gray-900">
                  {new Date(selectedCompany.incorporationDate).getFullYear()}
                </span>
              </>
            )}
            {selectedCompany.stage && (
              <>
                <span className="text-gray-600">Stage</span>
                <span className="font-medium text-gray-900">
                  {stageLabels[selectedCompany.stage] || selectedCompany.stage}
                </span>
              </>
            )}
            {selectedCompany.sector && (
              <>
                <span className="text-gray-600">Sector</span>
                <span className="font-medium text-gray-900">
                  {sectorLabels[selectedCompany.sector] || selectedCompany.sector}
                </span>
              </>
            )}
            {selectedCompany.subsector && (
              <>
                <span className="text-gray-600">Subsector</span>
                <span className="font-medium text-gray-900">{selectedCompany.subsector}</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Deal Name */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Deal Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.dealName}
          onChange={(e) => updateField("dealName", e.target.value)}
          className={inputClass(hasErr("dealName"))}
          placeholder='e.g., "Series A", "Q2 Revenue Share"'
        />
        <FieldError
          show={hasErr("dealName")}
          message="Deal name is required"
        />
      </div>

      {/* Lane */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Investment Lane <span className="text-red-500">*</span>
        </label>
        <CustomSelect
          value={formData.lane}
          onChange={onLaneChange}
          options={laneOptions}
          placeholder="Select lane"
        />
        <p className="text-xs text-gray-500 mt-1">
          {formData.lane === "YIELD"
            ? "Yield Lane: Cash-flow, predictable investments for SMEs with real revenue."
            : formData.lane === "VENTURES"
              ? "Ventures Lane: High-growth, equity-driven investments for VC-style startups."
              : "Choose the investment lane that best fits your fundraising structure."}
        </p>
        <FieldError show={hasErr("lane")} message="Investment lane is required" />
      </div>

      {/* Instrument Type */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Instrument Type <span className="text-red-500">*</span>
        </label>
        <CustomSelect
          value={formData.instrumentType}
          onChange={(v) => updateField("instrumentType", v)}
          options={instrumentOptions}
          placeholder={
            formData.lane ? "Select instrument" : "Select a lane first"
          }
        />
        <FieldError
          show={hasErr("instrumentType")}
          message="Instrument type is required"
        />
      </div>

      {/* Jurisdiction */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Jurisdiction <span className="text-red-500">*</span>
        </label>
        <CustomSelect
          value={formData.jurisdiction}
          onChange={(v) => updateField("jurisdiction", v)}
          options={countryOptions}
          placeholder="Select jurisdiction"
        />
        <FieldError
          show={hasErr("jurisdiction")}
          message="Jurisdiction is required"
        />
      </div>

      {/* Entity Type & Offering Structure */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Entity Type <span className="text-red-500">*</span>
          </label>
          <CustomSelect
            value={formData.entityType}
            onChange={(v) => updateField("entityType", v)}
            options={entityTypeOptions}
            placeholder="Select entity type"
          />
          <FieldError
            show={hasErr("entityType")}
            message="Entity type is required"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Offering Structure <span className="text-red-500">*</span>
          </label>
          <CustomSelect
            value={formData.offeringStructure}
            onChange={(v) => updateField("offeringStructure", v)}
            options={offeringStructureOptions}
            placeholder="Select offering structure"
          />
          <FieldError
            show={hasErr("offeringStructure")}
            message="Offering structure is required"
          />
        </div>
      </div>

      {/* Closing Type */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Closing Type <span className="text-red-500">*</span>
        </label>
        <CustomSelect
          value={formData.closingType}
          onChange={(v) => updateField("closingType", v)}
          options={closingTypeOptions}
          placeholder="Select closing type"
        />
        <FieldError
          show={hasErr("closingType")}
          message="Closing type is required"
        />
      </div>

      {/* Lead Investor */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Lead Investor
        </label>
        <input
          type="text"
          value={formData.leadInvestor}
          onChange={(e) => updateField("leadInvestor", e.target.value)}
          className={inputClass(false)}
          placeholder="Name of lead investor (if any)"
        />
      </div>
    </div>
  );
}

// ============================================================================
// STEP 2: FINANCIALS
// ============================================================================
function Step2Financials({
  formData,
  updateField,
  errors,
}: {
  formData: FormData;
  updateField: (field: keyof FormData, value: any) => void;
  errors: string[];
}) {
  const hasErr = (field: string) => errors.includes(field);

  return (
    <div>
      <h2 className="text-2xl font-bold text-primary-950 mb-1">
        Financial Parameters
      </h2>
      <p className="text-gray-600 mb-8">
        Define the financial structure and capital targets for this offering.
      </p>

      {/* Hard Cap & Minimum */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Hard Cap ($) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.targetAmount}
            onChange={(e) => updateField("targetAmount", e.target.value)}
            className={inputClass(hasErr("targetAmount"))}
            placeholder="e.g., 500000"
            min="0"
          />
          <FieldError
            show={hasErr("targetAmount")}
            message="Hard cap is required"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Minimum Investment ($) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.minimumInvestment}
            onChange={(e) => updateField("minimumInvestment", e.target.value)}
            className={inputClass(hasErr("minimumInvestment"))}
            placeholder="e.g., 5000"
            min="0"
          />
          <FieldError
            show={hasErr("minimumInvestment")}
            message="Minimum investment is required"
          />
        </div>
      </div>

      {/* Soft Cap */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Soft Cap ($)
        </label>
        <input
          type="number"
          value={formData.softCap}
          onChange={(e) => updateField("softCap", e.target.value)}
          className={inputClass(false)}
          placeholder="e.g., 250000"
          min="0"
        />
      </div>

      {/* Close Date & Rolling Close */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Close Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.closeDate}
            onChange={(e) => updateField("closeDate", e.target.value)}
            className={inputClass(hasErr("closeDate"))}
          />
          <FieldError
            show={hasErr("closeDate")}
            message="Close date is required"
          />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.rollingClose}
              onChange={(e) => updateField("rollingClose", e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
            />
            <span className="text-sm font-medium text-gray-700">
              Rolling Close (accept investments before close date)
            </span>
          </label>
        </div>
      </div>

      {/* Use of Funds */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Use of Funds (structured summary) <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.useOfFunds}
          onChange={(e) => updateField("useOfFunds", e.target.value)}
          className={inputClass(hasErr("useOfFunds"))}
          placeholder="e.g., 40% product development, 30% market expansion, 20% operations, 10% reserve"
          rows={3}
        />
        <FieldError
          show={hasErr("useOfFunds")}
          message="Use of funds is required"
        />
      </div>

      {/* Revenue & Previous Capital */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Current Revenue (if permitted to disclose)
          </label>
          <input
            type="text"
            value={formData.currentRevenue}
            onChange={(e) => updateField("currentRevenue", e.target.value)}
            className={inputClass(false)}
            placeholder="e.g., $120,000 ARR"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Previous Capital Raised
          </label>
          <input
            type="text"
            value={formData.previousCapitalRaised}
            onChange={(e) => updateField("previousCapitalRaised", e.target.value)}
            className={inputClass(false)}
            placeholder="e.g., $200,000 pre-seed"
          />
        </div>
      </div>

      {/* Yield Lane-Specific Fields */}
      {formData.lane === "YIELD" && (
        <div className="border-t border-gray-200 pt-6 mt-6">
          <h3 className="text-lg font-semibold text-primary-950 mb-1">
            Yield-Specific Parameters
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Required for Yield lane offerings.
          </p>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Expected Return Structure <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.expectedReturnStructure}
              onChange={(e) =>
                updateField("expectedReturnStructure", e.target.value)
              }
              className={inputClass(hasErr("expectedReturnStructure"))}
              placeholder="Describe the expected return structure for investors"
              rows={3}
            />
            <FieldError
              show={hasErr("expectedReturnStructure")}
              message="Expected return structure is required for Yield lane deals"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Payment Frequency <span className="text-red-500">*</span>
            </label>
            <CustomSelect
              value={formData.paymentFrequency}
              onChange={(v) => updateField("paymentFrequency", v)}
              options={paymentFrequencyOptions}
              placeholder="Select frequency"
            />
            <FieldError
              show={hasErr("paymentFrequency")}
              message="Payment frequency is required for Yield lane deals"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Capital Protection (if any)
            </label>
            <textarea
              value={formData.capitalProtection}
              onChange={(e) => updateField("capitalProtection", e.target.value)}
              className={inputClass(false)}
              placeholder="Describe any capital protection mechanisms"
              rows={2}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Maturity Terms <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.maturityTerms}
              onChange={(e) => updateField("maturityTerms", e.target.value)}
              className={inputClass(hasErr("maturityTerms"))}
              placeholder="Describe the maturity terms and conditions"
              rows={3}
            />
            <FieldError
              show={hasErr("maturityTerms")}
              message="Maturity terms are required for Yield lane deals"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// STEP 3: TERMS
// ============================================================================
function Step3Terms({
  formData,
  updateField,
  errors,
}: {
  formData: FormData;
  updateField: (field: keyof FormData, value: any) => void;
  errors: string[];
}) {
  const hasErr = (field: string) => errors.includes(field);
  const showPremoneyField =
    formData.instrumentType === "SAFE" ||
    formData.instrumentType === "CONVERTIBLE_NOTE";
  const showConversionTrigger =
    formData.instrumentType === "SAFE" ||
    formData.instrumentType === "CONVERTIBLE_NOTE";

  return (
    <div>
      <h2 className="text-2xl font-bold text-primary-950 mb-1">
        Instrument Terms
      </h2>
      <p className="text-gray-600 mb-8">
        Specify the legal and structural terms governing this instrument.
      </p>

      {/* Instrument-Specific Terms */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-primary-950 mb-1">
          {instrumentLabels[formData.instrumentType] || "Instrument"}-Specific Terms
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Terms specific to the selected instrument type.
        </p>

        {formData.instrumentType === "REVENUE_SHARE_NOTE" && (
          <RevenueShareFields formData={formData} updateField={updateField} hasErr={hasErr} />
        )}
        {formData.instrumentType === "ASSET_BACKED_PARTICIPATION" && (
          <AssetBackedFields formData={formData} updateField={updateField} hasErr={hasErr} />
        )}
        {formData.instrumentType === "CONVERTIBLE_NOTE" && (
          <ConvertibleNoteFields formData={formData} updateField={updateField} hasErr={hasErr} />
        )}
        {formData.instrumentType === "SAFE" && (
          <SafeFields formData={formData} updateField={updateField} hasErr={hasErr} />
        )}
        {formData.instrumentType === "SPV_EQUITY" && (
          <SpvEquityFields formData={formData} updateField={updateField} hasErr={hasErr} />
        )}
      </div>

      {/* Universal Terms */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-primary-950 mb-1">
          General Terms
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Terms applicable to all instrument types.
        </p>

        {showPremoneyField && (
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Pre-money or Post-money
            </label>
            <CustomSelect
              value={formData.premoneyOrPostmoney}
              onChange={(v) => updateField("premoneyOrPostmoney", v)}
              options={premoneyOptions}
              placeholder="Select valuation basis"
            />
          </div>
        )}

        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.proRataRights}
              onChange={(e) => updateField("proRataRights", e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
            />
            <span className="text-sm font-medium text-gray-700">
              Investors receive pro rata rights
            </span>
          </label>
        </div>

        {showConversionTrigger && (
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Conversion Trigger Events
            </label>
            <textarea
              value={formData.conversionTriggerEvents}
              onChange={(e) =>
                updateField("conversionTriggerEvents", e.target.value)
              }
              className={inputClass(false)}
              placeholder="Define events that trigger conversion"
              rows={3}
            />
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Liquidity Event Definition
          </label>
          <textarea
            value={formData.liquidityEventDefinition}
            onChange={(e) =>
              updateField("liquidityEventDefinition", e.target.value)
            }
            className={inputClass(false)}
            placeholder="Define what constitutes a liquidity event"
            rows={3}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Governing Law <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.governingLaw}
            onChange={(e) => updateField("governingLaw", e.target.value)}
            className={inputClass(hasErr("governingLaw"))}
            placeholder="e.g., Laws of the Federal Republic of Nigeria"
          />
          <FieldError
            show={hasErr("governingLaw")}
            message="Governing law is required"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Investor Rights Summary <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.investorRightsSummary}
            onChange={(e) =>
              updateField("investorRightsSummary", e.target.value)
            }
            className={inputClass(hasErr("investorRightsSummary"))}
            placeholder="Summarize the rights granted to investors"
            rows={3}
          />
          <FieldError
            show={hasErr("investorRightsSummary")}
            message="Investor rights summary is required"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Transfer Restrictions <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.transferRestrictions}
            onChange={(e) =>
              updateField("transferRestrictions", e.target.value)
            }
            className={inputClass(hasErr("transferRestrictions"))}
            placeholder="Describe restrictions on transferring this instrument"
            rows={3}
          />
          <FieldError
            show={hasErr("transferRestrictions")}
            message="Transfer restrictions are required"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Minimum Hold Period
          </label>
          <input
            type="text"
            value={formData.minimumHoldPeriod}
            onChange={(e) => updateField("minimumHoldPeriod", e.target.value)}
            className={inputClass(false)}
            placeholder="e.g., 12 months"
          />
        </div>

        {formData.lane === "YIELD" && (
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Distribution Terms
            </label>
            <textarea
              value={formData.distributionTerms}
              onChange={(e) => updateField("distributionTerms", e.target.value)}
              className={inputClass(false)}
              placeholder="Describe how distributions will be made to investors"
              rows={3}
            />
          </div>
        )}
      </div>

      {/* SPV-Specific Terms */}
      {formData.offeringStructure === "SPV" && (
        <div className="border-t border-gray-200 pt-6 mt-6">
          <h3 className="text-lg font-semibold text-primary-950 mb-1">
            SPV Structure Terms
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Required for Special Purpose Vehicle offerings.
          </p>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              SPV Jurisdiction <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.spvJurisdiction}
              onChange={(e) => updateField("spvJurisdiction", e.target.value)}
              className={inputClass(hasErr("spvJurisdiction"))}
              placeholder="e.g., Delaware, USA or Mauritius"
            />
            <FieldError
              show={hasErr("spvJurisdiction")}
              message="SPV jurisdiction is required"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                SPV Admin Fee <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.spvAdminFee}
                onChange={(e) => updateField("spvAdminFee", e.target.value)}
                className={inputClass(hasErr("spvAdminFee"))}
                placeholder="e.g., 1% annually"
              />
              <FieldError
                show={hasErr("spvAdminFee")}
                message="SPV admin fee is required"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                SPV Manager <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.spvManager}
                onChange={(e) => updateField("spvManager", e.target.value)}
                className={inputClass(hasErr("spvManager"))}
                placeholder="Name of SPV manager"
              />
              <FieldError
                show={hasErr("spvManager")}
                message="SPV manager is required"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Carry
            </label>
            <input
              type="text"
              value={formData.carry}
              onChange={(e) => updateField("carry", e.target.value)}
              className={inputClass(false)}
              placeholder="e.g., 20% above 1x return"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Voting Rights Structure <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.votingRightsStructure}
              onChange={(e) =>
                updateField("votingRightsStructure", e.target.value)
              }
              className={inputClass(hasErr("votingRightsStructure"))}
              placeholder="Describe the voting rights structure within the SPV"
              rows={3}
            />
            <FieldError
              show={hasErr("votingRightsStructure")}
              message="Voting rights structure is required"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// INSTRUMENT TERM FIELD COMPONENTS
// ============================================================================
function RevenueShareFields({
  formData,
  updateField,
  hasErr,
}: {
  formData: FormData;
  updateField: (field: keyof FormData, value: any) => void;
  hasErr: (field: string) => boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Revenue Share Percentage (%) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.revenueSharePercentage}
            onChange={(e) => updateField("revenueSharePercentage", e.target.value)}
            className={inputClass(hasErr("revenueSharePercentage"))}
            placeholder="e.g., 5"
            min="0"
            max="100"
            step="0.1"
          />
          <FieldError
            show={hasErr("revenueSharePercentage")}
            message="Revenue share percentage is required"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Repayment Cap (e.g., 1.5x) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.repaymentCap}
            onChange={(e) => updateField("repaymentCap", e.target.value)}
            className={inputClass(hasErr("repaymentCap"))}
            placeholder="e.g., 1.5"
            min="1"
            step="0.1"
          />
          <FieldError
            show={hasErr("repaymentCap")}
            message="Repayment cap is required"
          />
        </div>
      </div>
    </div>
  );
}

function AssetBackedFields({
  formData,
  updateField,
  hasErr,
}: {
  formData: FormData;
  updateField: (field: keyof FormData, value: any) => void;
  hasErr: (field: string) => boolean;
}) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Asset Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.assetDescription}
          onChange={(e) => updateField("assetDescription", e.target.value)}
          className={inputClass(hasErr("assetDescription"))}
          placeholder="Describe the underlying asset"
          rows={3}
        />
        <FieldError
          show={hasErr("assetDescription")}
          message="Asset description is required"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Expected Yield (%) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.expectedYield}
            onChange={(e) => updateField("expectedYield", e.target.value)}
            className={inputClass(hasErr("expectedYield"))}
            placeholder="e.g., 12"
            min="0"
            step="0.1"
          />
          <FieldError
            show={hasErr("expectedYield")}
            message="Expected yield is required"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Collateral Details <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.collateralDetails}
          onChange={(e) => updateField("collateralDetails", e.target.value)}
          className={inputClass(hasErr("collateralDetails"))}
          placeholder="Describe the collateral backing this participation"
          rows={3}
        />
        <FieldError
          show={hasErr("collateralDetails")}
          message="Collateral details are required"
        />
      </div>
    </div>
  );
}

function ConvertibleNoteFields({
  formData,
  updateField,
  hasErr,
}: {
  formData: FormData;
  updateField: (field: keyof FormData, value: any) => void;
  hasErr: (field: string) => boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Interest Rate (%) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.interestRate}
            onChange={(e) => updateField("interestRate", e.target.value)}
            className={inputClass(hasErr("interestRate"))}
            placeholder="e.g., 8"
            min="0"
            step="0.1"
          />
          <FieldError show={hasErr("interestRate")} message="Interest rate is required" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Maturity Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.maturityDate}
            onChange={(e) => updateField("maturityDate", e.target.value)}
            className={inputClass(hasErr("maturityDate"))}
          />
          <FieldError show={hasErr("maturityDate")} message="Maturity date is required" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Conversion Discount (%) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.conversionDiscount}
            onChange={(e) => updateField("conversionDiscount", e.target.value)}
            className={inputClass(hasErr("conversionDiscount"))}
            placeholder="e.g., 20"
            min="0"
            max="100"
            step="0.1"
          />
          <FieldError show={hasErr("conversionDiscount")} message="Conversion discount is required" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Valuation Cap ($) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.valuationCap}
            onChange={(e) => updateField("valuationCap", e.target.value)}
            className={inputClass(hasErr("valuationCap"))}
            placeholder="e.g., 5000000"
            min="0"
          />
          <FieldError show={hasErr("valuationCap")} message="Valuation cap is required" />
        </div>
      </div>
    </div>
  );
}

function SafeFields({
  formData,
  updateField,
  hasErr,
}: {
  formData: FormData;
  updateField: (field: keyof FormData, value: any) => void;
  hasErr: (field: string) => boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Valuation Cap ($) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.safeValuationCap}
            onChange={(e) => updateField("safeValuationCap", e.target.value)}
            className={inputClass(hasErr("safeValuationCap"))}
            placeholder="e.g., 5000000"
            min="0"
          />
          <FieldError show={hasErr("safeValuationCap")} message="Valuation cap is required" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Discount Rate (%) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.safeDiscountRate}
            onChange={(e) => updateField("safeDiscountRate", e.target.value)}
            className={inputClass(hasErr("safeDiscountRate"))}
            placeholder="e.g., 20"
            min="0"
            max="100"
            step="0.1"
          />
          <FieldError show={hasErr("safeDiscountRate")} message="Discount rate is required" />
        </div>
      </div>
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.mfnClause}
            onChange={(e) => updateField("mfnClause", e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
          />
          <span className="text-sm font-medium text-gray-700">
            Most Favored Nation (MFN) clause
          </span>
        </label>
        <p className="text-xs text-gray-500 mt-1 ml-8">
          Grants the investor the right to receive the best terms offered to
          any future investor.
        </p>
      </div>
    </div>
  );
}

function SpvEquityFields({
  formData,
  updateField,
  hasErr,
}: {
  formData: FormData;
  updateField: (field: keyof FormData, value: any) => void;
  hasErr: (field: string) => boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Price Per Share/Unit ($) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.pricePerShare}
            onChange={(e) => updateField("pricePerShare", e.target.value)}
            className={inputClass(hasErr("pricePerShare"))}
            placeholder="e.g., 100"
            min="0"
            step="0.01"
          />
          <FieldError show={hasErr("pricePerShare")} message="Price per share is required" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Equity % Offered <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.equityPercentageOffered}
            onChange={(e) => updateField("equityPercentageOffered", e.target.value)}
            className={inputClass(hasErr("equityPercentageOffered"))}
            placeholder="e.g., 15"
            min="0"
            max="100"
            step="0.01"
          />
          <FieldError show={hasErr("equityPercentageOffered")} message="Equity percentage is required" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 4: COMPANY DISCLOSURE
// ============================================================================
function Step4Disclosure({
  formData,
  updateField,
  errors,
}: {
  formData: FormData;
  updateField: (field: keyof FormData, value: any) => void;
  errors: string[];
}) {
  const hasErr = (field: string) => errors.includes(field);

  return (
    <div>
      <h2 className="text-2xl font-bold text-primary-950 mb-1">
        Company Disclosure
      </h2>
      <p className="text-gray-600 mb-8">
        Provide deal-specific company disclosures for investor due diligence.
      </p>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Corporate Structure Overview <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.corporateStructureOverview}
          onChange={(e) =>
            updateField("corporateStructureOverview", e.target.value)
          }
          className={inputClass(hasErr("corporateStructureOverview"))}
          placeholder="Describe the corporate structure, subsidiaries, and holding relationships"
          rows={4}
        />
        <FieldError
          show={hasErr("corporateStructureOverview")}
          message="Corporate structure overview is required"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Cap Table Snapshot (summary view) <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.capTableSnapshot}
          onChange={(e) => updateField("capTableSnapshot", e.target.value)}
          className={inputClass(hasErr("capTableSnapshot"))}
          placeholder="e.g., Founders: 70%, Angels: 15%, ESOP: 10%, Available: 5%"
          rows={3}
        />
        <FieldError
          show={hasErr("capTableSnapshot")}
          message="Cap table snapshot is required"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Key Shareholders <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.keyShareholders}
          onChange={(e) => updateField("keyShareholders", e.target.value)}
          className={inputClass(hasErr("keyShareholders"))}
          placeholder="List key shareholders and their respective holdings"
          rows={3}
        />
        <FieldError
          show={hasErr("keyShareholders")}
          message="Key shareholders are required"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Director List <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.directorList}
          onChange={(e) => updateField("directorList", e.target.value)}
          className={inputClass(hasErr("directorList"))}
          placeholder="List all directors, their roles, and relevant background"
          rows={3}
        />
        <FieldError
          show={hasErr("directorList")}
          message="Director list is required"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Banking Relationship
        </label>
        <input
          type="text"
          value={formData.bankingRelationship}
          onChange={(e) => updateField("bankingRelationship", e.target.value)}
          className={inputClass(false)}
          placeholder="e.g., GTBank, First Bank of Nigeria"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Material Contracts (summary)
        </label>
        <textarea
          value={formData.materialContracts}
          onChange={(e) => updateField("materialContracts", e.target.value)}
          className={inputClass(false)}
          placeholder="Summarize any material contracts relevant to this offering"
          rows={3}
        />
      </div>

      {/* Outstanding Debt */}
      <div className="mb-6">
        <label className="flex items-center gap-3 cursor-pointer mb-3">
          <input
            type="checkbox"
            checked={formData.hasOutstandingDebt}
            onChange={(e) => updateField("hasOutstandingDebt", e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
          />
          <span className="text-sm font-semibold text-gray-700">
            Outstanding Debt
          </span>
        </label>
        {formData.hasOutstandingDebt && (
          <div className="ml-8">
            <textarea
              value={formData.outstandingDebtDetails}
              onChange={(e) =>
                updateField("outstandingDebtDetails", e.target.value)
              }
              className={inputClass(hasErr("outstandingDebtDetails"))}
              placeholder="Provide details of outstanding debt obligations"
              rows={3}
            />
            <FieldError
              show={hasErr("outstandingDebtDetails")}
              message="Outstanding debt details are required when debt is indicated"
            />
          </div>
        )}
      </div>

      {/* Pending Litigation */}
      <div className="mb-6">
        <label className="flex items-center gap-3 cursor-pointer mb-3">
          <input
            type="checkbox"
            checked={formData.hasPendingLitigation}
            onChange={(e) =>
              updateField("hasPendingLitigation", e.target.checked)
            }
            className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
          />
          <span className="text-sm font-semibold text-gray-700">
            Pending Litigation
          </span>
        </label>
        {formData.hasPendingLitigation && (
          <div className="ml-8">
            <textarea
              value={formData.pendingLitigationDetails}
              onChange={(e) =>
                updateField("pendingLitigationDetails", e.target.value)
              }
              className={inputClass(hasErr("pendingLitigationDetails"))}
              placeholder="Provide details of any pending or threatened litigation"
              rows={3}
            />
            <FieldError
              show={hasErr("pendingLitigationDetails")}
              message="Pending litigation details are required when litigation is indicated"
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// STEP 5: RISKS
// ============================================================================
function Step5Risks({
  formData,
  updateField,
  errors,
}: {
  formData: FormData;
  updateField: (field: keyof FormData, value: any) => void;
  errors: string[];
}) {
  const hasErr = (field: string) => errors.includes(field);

  return (
    <div>
      <h2 className="text-2xl font-bold text-primary-950 mb-1">
        Risk Assessment
      </h2>
      <p className="text-gray-600 mb-8">
        Provide a structured risk assessment. All material risks must be disclosed.
      </p>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Market Risk <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.marketRisk}
          onChange={(e) => updateField("marketRisk", e.target.value)}
          className={inputClass(hasErr("marketRisk"))}
          placeholder="Describe market-related risks including demand, competition, and macro conditions"
          rows={3}
        />
        <FieldError show={hasErr("marketRisk")} message="Market risk assessment is required" />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Execution Risk <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.executionRisk}
          onChange={(e) => updateField("executionRisk", e.target.value)}
          className={inputClass(hasErr("executionRisk"))}
          placeholder="Describe operational and execution risks including team, technology, and delivery"
          rows={3}
        />
        <FieldError show={hasErr("executionRisk")} message="Execution risk assessment is required" />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Regulatory Risk <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.regulatoryRisk}
          onChange={(e) => updateField("regulatoryRisk", e.target.value)}
          className={inputClass(hasErr("regulatoryRisk"))}
          placeholder="Describe regulatory and compliance risks in relevant jurisdictions"
          rows={3}
        />
        <FieldError show={hasErr("regulatoryRisk")} message="Regulatory risk assessment is required" />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Currency / FX Risk <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.currencyRisk}
          onChange={(e) => updateField("currencyRisk", e.target.value)}
          className={inputClass(hasErr("currencyRisk"))}
          placeholder="Describe currency and foreign exchange risks"
          rows={3}
        />
        <p className="text-xs text-gray-500 mt-1">
          Especially important for cross-border African investments.
        </p>
        <FieldError show={hasErr("currencyRisk")} message="Currency risk assessment is required" />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Liquidity Risk <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.liquidityRisk}
          onChange={(e) => updateField("liquidityRisk", e.target.value)}
          className={inputClass(hasErr("liquidityRisk"))}
          placeholder="Describe liquidity risks and limitations on exit"
          rows={3}
        />
        <FieldError show={hasErr("liquidityRisk")} message="Liquidity risk assessment is required" />
      </div>

      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Concentration Risk (if applicable)
        </label>
        <textarea
          value={formData.concentrationRisk}
          onChange={(e) => updateField("concentrationRisk", e.target.value)}
          className={inputClass(false)}
          placeholder="Describe any concentration risks (customer, geographic, supplier)"
          rows={3}
        />
      </div>

      {/* Risk Acknowledgement */}
      <div
        className="rounded-xl border p-5"
        style={{
          backgroundColor: hasErr("riskDisclosureAcknowledged")
            ? "rgba(239, 68, 68, 0.05)"
            : "rgba(200, 162, 77, 0.08)",
          borderColor: hasErr("riskDisclosureAcknowledged")
            ? "rgba(239, 68, 68, 0.3)"
            : "rgba(200, 162, 77, 0.3)",
        }}
      >
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.riskDisclosureAcknowledged}
            onChange={(e) =>
              updateField("riskDisclosureAcknowledged", e.target.checked)
            }
            className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-600 mt-0.5"
          />
          <span className="text-sm text-gray-700">
            I acknowledge that this investment involves substantial risk including
            potential total loss of capital, and that all material risks have been
            disclosed above. <span className="text-red-500">*</span>
          </span>
        </label>
        <FieldError
          show={hasErr("riskDisclosureAcknowledged")}
          message="Risk disclosure acknowledgement is required"
        />
      </div>
    </div>
  );
}

// ============================================================================
// STEP 6: DOCUMENTS & REVIEW
// ============================================================================
function Step6DocumentsReview({
  formData,
  companies,
  updateField,
}: {
  formData: FormData;
  companies: Company[];
  updateField: (field: keyof FormData, value: any) => void;
}) {
  const company = companies.find((c) => c.id === formData.companyId);
  const laneLabel = formData.lane === "YIELD" ? "Yield" : "Ventures";
  const instrumentLabel =
    instrumentLabels[formData.instrumentType] || formData.instrumentType;

  const formatCurrency = (val: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) return "\u2014";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-primary-950 mb-1">
        Documents & Review
      </h2>
      <p className="text-gray-600 mb-8">
        Upload required and supporting documents, then review all deal details before submission.
      </p>

      {/* Required Documents */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-primary-950 mb-4">
          Required Documents
        </h3>
        <div className="space-y-4">
          <FileUpload
            label="Incorporation Documents"
            file={formData.incorporationDocsFile}
            onChange={(f) => updateField("incorporationDocsFile", f)}
            accept=".pdf,.docx,.doc"
            required
          />
          <FileUpload
            label="Instrument Template (SAFE / Note / Revenue Share Agreement)"
            file={formData.instrumentTemplateFile}
            onChange={(f) => updateField("instrumentTemplateFile", f)}
            accept=".pdf,.docx,.doc"
            required
          />
          <FileUpload
            label="Risk Disclosure Document"
            file={formData.riskDisclosureDocFile}
            onChange={(f) => updateField("riskDisclosureDocFile", f)}
            accept=".pdf,.docx,.doc"
            required
          />
          <FileUpload
            label="Subscription Agreement Template"
            file={formData.subscriptionAgreementFile}
            onChange={(f) => updateField("subscriptionAgreementFile", f)}
            accept=".pdf,.docx,.doc"
            required
          />
        </div>
      </div>

      {/* Optional Documents */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-primary-950 mb-4">
          Supporting Documents
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Optional documents available to qualified investors during due diligence.
        </p>
        <div className="space-y-4">
          <FileUpload
            label="Pitch Deck"
            file={formData.pitchDeckFile}
            onChange={(f) => updateField("pitchDeckFile", f)}
            accept=".pdf,.pptx,.ppt"
          />
          <FileUpload
            label="Cap Table Summary Document"
            file={formData.capTableDocFile}
            onChange={(f) => updateField("capTableDocFile", f)}
            accept=".pdf,.xlsx,.xls,.csv"
          />
          <FileUpload
            label="Financial Statements"
            file={formData.financialStatementsFile}
            onChange={(f) => updateField("financialStatementsFile", f)}
            accept=".pdf,.xlsx,.xls,.csv"
          />
          <FileUpload
            label="Founder Background Docs"
            file={formData.founderBackgroundDocsFile}
            onChange={(f) => updateField("founderBackgroundDocsFile", f)}
            accept=".pdf,.docx,.doc"
          />
          <FileUpload
            label="Customer Contracts (redacted)"
            file={formData.customerContractsFile}
            onChange={(f) => updateField("customerContractsFile", f)}
            accept=".pdf,.docx,.doc"
          />
          <FileUpload
            label="Bank Statements (selectively)"
            file={formData.bankStatementsFile}
            onChange={(f) => updateField("bankStatementsFile", f)}
            accept=".pdf"
          />
        </div>
      </div>

      {/* Review Summary */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-primary-950 mb-4">
          Deal Summary
        </h3>

        {/* Overview */}
        <div className="bg-gray-50 rounded-xl p-5 mb-4">
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Overview
          </h4>
          <div className="grid grid-cols-2 gap-y-3 text-sm">
            <span className="text-gray-600">Company</span>
            <span className="font-medium text-gray-900">
              {company?.tradingName || company?.legalName || "\u2014"}
            </span>
            <span className="text-gray-600">Deal Name</span>
            <span className="font-medium text-gray-900">
              {formData.dealName || "\u2014"}
            </span>
            <span className="text-gray-600">Lane</span>
            <span className="font-medium text-gray-900">{laneLabel}</span>
            <span className="text-gray-600">Instrument</span>
            <span className="font-medium text-gray-900">{instrumentLabel}</span>
            <span className="text-gray-600">Jurisdiction</span>
            <span className="font-medium text-gray-900">{formData.jurisdiction || "\u2014"}</span>
            <span className="text-gray-600">Entity Type</span>
            <span className="font-medium text-gray-900">{formData.entityType || "\u2014"}</span>
            <span className="text-gray-600">Offering Structure</span>
            <span className="font-medium text-gray-900">{formData.offeringStructure || "\u2014"}</span>
            <span className="text-gray-600">Closing Type</span>
            <span className="font-medium text-gray-900">{formData.closingType || "\u2014"}</span>
            {formData.leadInvestor && (
              <>
                <span className="text-gray-600">Lead Investor</span>
                <span className="font-medium text-gray-900">{formData.leadInvestor}</span>
              </>
            )}
          </div>
        </div>

        {/* Financials */}
        <div className="bg-gray-50 rounded-xl p-5 mb-4">
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Financials
          </h4>
          <div className="grid grid-cols-2 gap-y-3 text-sm">
            <span className="text-gray-600">Hard Cap</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(formData.targetAmount)}
            </span>
            <span className="text-gray-600">Minimum Investment</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(formData.minimumInvestment)}
            </span>
            {formData.softCap && (
              <>
                <span className="text-gray-600">Soft Cap</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(formData.softCap)}
                </span>
              </>
            )}
            <span className="text-gray-600">Close Date</span>
            <span className="font-medium text-gray-900">
              {formData.closeDate || "\u2014"}
            </span>
            <span className="text-gray-600">Rolling Close</span>
            <span className="font-medium text-gray-900">
              {formData.rollingClose ? "Yes" : "No"}
            </span>
            <span className="text-gray-600">Use of Funds</span>
            <span className="font-medium text-gray-900">
              {formData.useOfFunds || "\u2014"}
            </span>
            {formData.currentRevenue && (
              <>
                <span className="text-gray-600">Current Revenue</span>
                <span className="font-medium text-gray-900">{formData.currentRevenue}</span>
              </>
            )}
            {formData.previousCapitalRaised && (
              <>
                <span className="text-gray-600">Previous Capital Raised</span>
                <span className="font-medium text-gray-900">{formData.previousCapitalRaised}</span>
              </>
            )}
            {formData.lane === "YIELD" && (
              <>
                <span className="text-gray-600">Expected Return Structure</span>
                <span className="font-medium text-gray-900">
                  {formData.expectedReturnStructure || "\u2014"}
                </span>
                <span className="text-gray-600">Payment Frequency</span>
                <span className="font-medium text-gray-900">
                  {formData.paymentFrequency || "\u2014"}
                </span>
                {formData.capitalProtection && (
                  <>
                    <span className="text-gray-600">Capital Protection</span>
                    <span className="font-medium text-gray-900">{formData.capitalProtection}</span>
                  </>
                )}
                <span className="text-gray-600">Maturity Terms</span>
                <span className="font-medium text-gray-900">
                  {formData.maturityTerms || "\u2014"}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Instrument Terms */}
        <div className="bg-gray-50 rounded-xl p-5 mb-4">
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            {instrumentLabel} Terms
          </h4>
          <div className="grid grid-cols-2 gap-y-3 text-sm">
            {formData.instrumentType === "REVENUE_SHARE_NOTE" && (
              <>
                <span className="text-gray-600">Revenue Share</span>
                <span className="font-medium text-gray-900">
                  {formData.revenueSharePercentage ? `${formData.revenueSharePercentage}%` : "\u2014"}
                </span>
                <span className="text-gray-600">Repayment Cap</span>
                <span className="font-medium text-gray-900">
                  {formData.repaymentCap ? `${formData.repaymentCap}x` : "\u2014"}
                </span>
              </>
            )}
            {formData.instrumentType === "ASSET_BACKED_PARTICIPATION" && (
              <>
                <span className="text-gray-600">Asset Description</span>
                <span className="font-medium text-gray-900">{formData.assetDescription || "\u2014"}</span>
                <span className="text-gray-600">Expected Yield</span>
                <span className="font-medium text-gray-900">
                  {formData.expectedYield ? `${formData.expectedYield}%` : "\u2014"}
                </span>
                <span className="text-gray-600">Collateral</span>
                <span className="font-medium text-gray-900">{formData.collateralDetails || "\u2014"}</span>
              </>
            )}
            {formData.instrumentType === "CONVERTIBLE_NOTE" && (
              <>
                <span className="text-gray-600">Interest Rate</span>
                <span className="font-medium text-gray-900">
                  {formData.interestRate ? `${formData.interestRate}%` : "\u2014"}
                </span>
                <span className="text-gray-600">Maturity Date</span>
                <span className="font-medium text-gray-900">{formData.maturityDate || "\u2014"}</span>
                <span className="text-gray-600">Conversion Discount</span>
                <span className="font-medium text-gray-900">
                  {formData.conversionDiscount ? `${formData.conversionDiscount}%` : "\u2014"}
                </span>
                <span className="text-gray-600">Valuation Cap</span>
                <span className="font-medium text-gray-900">{formatCurrency(formData.valuationCap)}</span>
              </>
            )}
            {formData.instrumentType === "SAFE" && (
              <>
                <span className="text-gray-600">Valuation Cap</span>
                <span className="font-medium text-gray-900">{formatCurrency(formData.safeValuationCap)}</span>
                <span className="text-gray-600">Discount Rate</span>
                <span className="font-medium text-gray-900">
                  {formData.safeDiscountRate ? `${formData.safeDiscountRate}%` : "\u2014"}
                </span>
                <span className="text-gray-600">MFN Clause</span>
                <span className="font-medium text-gray-900">{formData.mfnClause ? "Yes" : "No"}</span>
              </>
            )}
            {formData.instrumentType === "SPV_EQUITY" && (
              <>
                <span className="text-gray-600">Price Per Share</span>
                <span className="font-medium text-gray-900">{formatCurrency(formData.pricePerShare)}</span>
                <span className="text-gray-600">Equity Offered</span>
                <span className="font-medium text-gray-900">
                  {formData.equityPercentageOffered ? `${formData.equityPercentageOffered}%` : "\u2014"}
                </span>
              </>
            )}
            {/* Universal terms */}
            <span className="text-gray-600">Governing Law</span>
            <span className="font-medium text-gray-900">{formData.governingLaw || "\u2014"}</span>
            <span className="text-gray-600">Pro Rata Rights</span>
            <span className="font-medium text-gray-900">{formData.proRataRights ? "Yes" : "No"}</span>
            <span className="text-gray-600">Transfer Restrictions</span>
            <span className="font-medium text-gray-900">{formData.transferRestrictions || "\u2014"}</span>
            {formData.minimumHoldPeriod && (
              <>
                <span className="text-gray-600">Minimum Hold Period</span>
                <span className="font-medium text-gray-900">{formData.minimumHoldPeriod}</span>
              </>
            )}
          </div>
        </div>

        {/* Company Disclosure */}
        <div className="bg-gray-50 rounded-xl p-5 mb-4">
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Company Disclosure
          </h4>
          <div className="grid grid-cols-2 gap-y-3 text-sm">
            <span className="text-gray-600">Corporate Structure</span>
            <span className="font-medium text-gray-900">
              {formData.corporateStructureOverview ? "Provided" : "\u2014"}
            </span>
            <span className="text-gray-600">Cap Table Snapshot</span>
            <span className="font-medium text-gray-900">
              {formData.capTableSnapshot ? "Provided" : "\u2014"}
            </span>
            <span className="text-gray-600">Key Shareholders</span>
            <span className="font-medium text-gray-900">
              {formData.keyShareholders ? "Provided" : "\u2014"}
            </span>
            <span className="text-gray-600">Directors</span>
            <span className="font-medium text-gray-900">
              {formData.directorList ? "Provided" : "\u2014"}
            </span>
            <span className="text-gray-600">Outstanding Debt</span>
            <span className="font-medium text-gray-900">
              {formData.hasOutstandingDebt ? "Yes \u2014 disclosed" : "None reported"}
            </span>
            <span className="text-gray-600">Pending Litigation</span>
            <span className="font-medium text-gray-900">
              {formData.hasPendingLitigation ? "Yes \u2014 disclosed" : "None reported"}
            </span>
          </div>
        </div>

        {/* Risks */}
        <div className="bg-gray-50 rounded-xl p-5 mb-4">
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Risk Assessment
          </h4>
          <div className="grid grid-cols-2 gap-y-3 text-sm">
            <span className="text-gray-600">Market Risk</span>
            <span className="font-medium text-gray-900">
              {formData.marketRisk ? "Disclosed" : "\u2014"}
            </span>
            <span className="text-gray-600">Execution Risk</span>
            <span className="font-medium text-gray-900">
              {formData.executionRisk ? "Disclosed" : "\u2014"}
            </span>
            <span className="text-gray-600">Regulatory Risk</span>
            <span className="font-medium text-gray-900">
              {formData.regulatoryRisk ? "Disclosed" : "\u2014"}
            </span>
            <span className="text-gray-600">Currency / FX Risk</span>
            <span className="font-medium text-gray-900">
              {formData.currencyRisk ? "Disclosed" : "\u2014"}
            </span>
            <span className="text-gray-600">Liquidity Risk</span>
            <span className="font-medium text-gray-900">
              {formData.liquidityRisk ? "Disclosed" : "\u2014"}
            </span>
            <span className="text-gray-600">Risk Acknowledgement</span>
            <span className="font-medium text-green-700">
              {formData.riskDisclosureAcknowledged ? "Acknowledged" : "Pending"}
            </span>
          </div>
        </div>

        {/* Documents Summary */}
        <div className="bg-gray-50 rounded-xl p-5 mb-4">
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Documents
          </h4>
          <div className="grid grid-cols-2 gap-y-3 text-sm">
            <span className="text-gray-600">Incorporation Documents</span>
            <span className="font-medium text-gray-900">
              {formData.incorporationDocsFile?.name || "Not uploaded"}
            </span>
            <span className="text-gray-600">Instrument Template</span>
            <span className="font-medium text-gray-900">
              {formData.instrumentTemplateFile?.name || "Not uploaded"}
            </span>
            <span className="text-gray-600">Risk Disclosure Document</span>
            <span className="font-medium text-gray-900">
              {formData.riskDisclosureDocFile?.name || "Not uploaded"}
            </span>
            <span className="text-gray-600">Subscription Agreement</span>
            <span className="font-medium text-gray-900">
              {formData.subscriptionAgreementFile?.name || "Not uploaded"}
            </span>
            <span className="text-gray-600">Pitch Deck</span>
            <span className="font-medium text-gray-900">
              {formData.pitchDeckFile?.name || "Not uploaded"}
            </span>
            <span className="text-gray-600">Cap Table Document</span>
            <span className="font-medium text-gray-900">
              {formData.capTableDocFile?.name || "Not uploaded"}
            </span>
            <span className="text-gray-600">Financial Statements</span>
            <span className="font-medium text-gray-900">
              {formData.financialStatementsFile?.name || "Not uploaded"}
            </span>
            <span className="text-gray-600">Founder Background</span>
            <span className="font-medium text-gray-900">
              {formData.founderBackgroundDocsFile?.name || "Not uploaded"}
            </span>
            <span className="text-gray-600">Customer Contracts</span>
            <span className="font-medium text-gray-900">
              {formData.customerContractsFile?.name || "Not uploaded"}
            </span>
            <span className="text-gray-600">Bank Statements</span>
            <span className="font-medium text-gray-900">
              {formData.bankStatementsFile?.name || "Not uploaded"}
            </span>
          </div>
        </div>

        {/* Submission Notice */}
        <div
          className="mt-6 rounded-xl border p-4"
          style={{
            backgroundColor: "rgba(200, 162, 77, 0.08)",
            borderColor: "rgba(200, 162, 77, 0.3)",
          }}
        >
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 mt-0.5 flex-shrink-0"
              style={{ color: "#C8A24D" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p
                className="text-sm font-semibold"
                style={{ color: "#0B1C2D" }}
              >
                Your deal will be submitted for admin review
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Once submitted, our team will review your deal. You can save a
                draft at any time using the &quot;Save Draft&quot; button if you need to come
                back later.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// FILE UPLOAD COMPONENT
// ============================================================================
function FileUpload({
  label,
  file,
  onChange,
  accept,
  required = false,
}: {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
  accept: string;
  required?: boolean;
}) {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </p>
          {file ? (
            <p className="text-xs text-gray-500 mt-0.5">{file.name}</p>
          ) : (
            <p className="text-xs text-gray-400 mt-0.5">
              No file selected{!required && " (optional)"}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {file && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="text-xs text-red-600 hover:text-red-700 font-medium"
            >
              Remove
            </button>
          )}
          <label className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all border border-gray-300 text-gray-700 hover:border-gray-400">
            {file ? "Replace" : "Upload"}
            <input
              type="file"
              accept={accept}
              onChange={(e) => {
                const selected = e.target.files?.[0] || null;
                onChange(selected);
              }}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
