"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CustomSelect from "@/components/CustomSelect";
import { useAuth } from "@/lib/contexts/AuthContext";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

type FormData = {
  logoFile: File | null;
  logoPreview: string;
  legalName: string;
  tradingName: string;
  incorporationNumber: string;
  incorporationDate: string;
  countryOfIncorporation: string;
  operatingCountries: string[];
  companyAddress: string;
  website: string;
  officialEmailDomain: string;
  regulatoryLicenses: string;
  teamSize: string;
  oneLineDescription: string;
  detailedDescription: string;
  sector: string;
  subsector: string;
  businessModel: string;
  stage: string;
  founderLinkedIn: string;
  yearsExperience: string;
  keyExecutives: string;
  founderFullName: string;
  founderEmail: string;
  founderPhone: string;
  founderNIN: string;
  founderBVN: string;
  founderIDType: string;
  founderIDNumber: string;
  revenueStatus: string;
  revenueRange: string;
  revenueType: string;
  topMetric1: string;
  topMetric2: string;
  topMetric3: string;
  majorCustomers: string;
  geographicFootprint: string;
  hasRaisedBefore: boolean;
  previousRaises: string;
  founderOwnedPercent: string;
  externalInvestorsPercent: string;
  esopPercent: string;
  existingDebt: string;
  convertibleInstruments: string;
  investorSideLetters: string;
  topRisk1: string;
  topRisk2: string;
  topRisk3: string;
  regulationDependent: boolean;
  regulatoryDependencies: string;
  fxExposure: boolean;
  singleSupplier: boolean;
  keyConcentrationRisk: string;
  preferredLane: string;
  preferredInstrument: string;
  targetRaiseMin: string;
  targetRaiseMax: string;
  primaryUseOfFunds: string;
  proposedValuation: string;
  proposedRevenueShare: string;
  deploymentTimeline: string;
  acknowledgePlacement: boolean;
  acknowledgeNoSolicitation: boolean;
  acknowledgeAccuracy: boolean;
  acknowledgeEquity: boolean;
  acknowledgeNoGuarantee: boolean;
  participationAcknowledged: boolean;
};

const STEPS = [
  "Company Identity",
  "Team & Overview",
  "Founder Verification",
  "Traction",
  "Capital & History",
  "Risks",
  "Fundraising Intent",
  "Legal Representations",
  "Platform Participation",
  "Review & Submit",
];

const countryOptions = [
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
  {
    value: "Democratic Republic of the Congo",
    label: "Democratic Republic of the Congo",
  },
  { value: "Benin", label: "Benin" },
  { value: "Togo", label: "Togo" },
  { value: "Cape Verde", label: "Cape Verde" },
  { value: "Sao Tome and Principe", label: "Sao Tome and Principe" },
];

const teamSizeOptions = [
  { value: "", label: "Select team size" },
  { value: "founders_only", label: "Founders only" },
  { value: "1-5", label: "1-5 employees" },
  { value: "6-20", label: "6-20 employees" },
  { value: "21-50", label: "21-50 employees" },
  { value: "50+", label: "50+ employees" },
];

const stageOptions = [
  { value: "", label: "Select stage" },
  { value: "PRE_REVENUE", label: "Pre-revenue" },
  { value: "EARLY_REVENUE", label: "Early revenue" },
  { value: "GROWTH", label: "Growth" },
  { value: "PROFITABLE", label: "Profitable" },
];

const sectorOptions = [
  { value: "", label: "Select sector" },
  { value: "FINTECH", label: "Financial Services" },
  { value: "ENERGY", label: "Energy & Climate" },
  { value: "LOGISTICS", label: "Logistics & Mobility" },
  { value: "AGRI_FOOD", label: "Agriculture & Food" },
  { value: "TECHNOLOGY", label: "Technology & Software" },
  { value: "SAAS_TECH", label: "SaaS / Tech" },
  { value: "HEALTH", label: "Healthcare & Life Sciences" },
  { value: "CONSUMER_FMCG", label: "Consumer & Retail" },
  { value: "REAL_ESTATE", label: "Real Estate" },
  { value: "INFRASTRUCTURE", label: "Infrastructure & Real Assets" },
  { value: "MANUFACTURING", label: "Manufacturing & Industrial" },
];

const businessModelOptions = [
  { value: "", label: "Select business model" },
  { value: "B2B", label: "B2B" },
  { value: "B2C", label: "B2C" },
  { value: "B2B2C", label: "B2B2C" },
  { value: "B2G", label: "B2G" },
  { value: "Marketplace", label: "Marketplace" },
];

const subsectorMap: Record<string, { value: string; label: string }[]> = {
  FINTECH: [
    { value: "PAYMENTS_REMITTANCE", label: "Payments & Remittance" },
    { value: "LENDING_CREDIT", label: "Lending & Credit" },
    { value: "INSURTECH", label: "Insurtech" },
    { value: "WEALTH_ASSET_MGMT", label: "Wealth & Asset Management" },
    { value: "DIGITAL_BANKING", label: "Digital Banking" },
    { value: "EMBEDDED_FINANCE", label: "Embedded Finance" },
    { value: "FX_CROSS_BORDER", label: "FX & Cross-Border Infrastructure" },
    { value: "CAPITAL_MARKETS", label: "Capital Markets Infrastructure" },
  ],
  ENERGY: [
    { value: "SOLAR_DISTRIBUTED", label: "Solar & Distributed Energy" },
    { value: "MINI_GRID", label: "Mini-Grid Systems" },
    { value: "ENERGY_STORAGE", label: "Energy Storage" },
    { value: "OIL_GAS_SERVICES", label: "Oil & Gas Services" },
    { value: "CLEAN_ENERGY_INFRA", label: "Clean Energy Infrastructure" },
    { value: "CLIMATE_TECH", label: "Climate Technology" },
    { value: "CARBON_MARKETS", label: "Carbon & Environmental Markets" },
  ],
  LOGISTICS: [
    { value: "FREIGHT_SUPPLY_CHAIN", label: "Freight & Supply Chain" },
    { value: "COLD_CHAIN", label: "Cold Chain Infrastructure" },
    { value: "FLEET_MGMT", label: "Fleet Management" },
    { value: "LAST_MILE", label: "Last-Mile Delivery" },
    { value: "MARITIME_PORT", label: "Maritime & Port Services" },
    { value: "AVIATION", label: "Aviation Services" },
    { value: "MOBILITY_PLATFORMS", label: "Mobility Platforms" },
  ],
  AGRI_FOOD: [
    { value: "PRIMARY_AGRICULTURE", label: "Primary Agriculture" },
    { value: "AGRI_PROCESSING", label: "Agri-Processing" },
    { value: "FARM_INPUTS", label: "Farm Inputs & Distribution" },
    { value: "COLD_STORAGE", label: "Cold Storage" },
    { value: "EXPORT_COMMODITIES", label: "Export Commodities" },
    { value: "LIVESTOCK_PROTEIN", label: "Livestock & Protein" },
    { value: "FOOD_DISTRIBUTION", label: "Food Distribution Infrastructure" },
  ],
  TECHNOLOGY: [
    { value: "ENTERPRISE_SAAS", label: "Enterprise SaaS" },
    { value: "AI_ML", label: "AI & Machine Learning" },
    { value: "DEVELOPER_TOOLS", label: "Developer Tools" },
    { value: "CYBERSECURITY", label: "Cybersecurity" },
    { value: "CLOUD_INFRA", label: "Cloud & Infrastructure Software" },
    { value: "DATA_ANALYTICS", label: "Data & Analytics" },
    { value: "VERTICAL_PLATFORMS", label: "Vertical Software Platforms" },
  ],
  SAAS_TECH: [
    { value: "ENTERPRISE_SAAS", label: "Enterprise SaaS" },
    { value: "AI_ML", label: "AI & Machine Learning" },
    { value: "DEVELOPER_TOOLS", label: "Developer Tools" },
    { value: "CYBERSECURITY", label: "Cybersecurity" },
    { value: "CLOUD_INFRA", label: "Cloud & Infrastructure Software" },
    { value: "DATA_ANALYTICS", label: "Data & Analytics" },
    { value: "VERTICAL_PLATFORMS", label: "Vertical Software Platforms" },
  ],
  HEALTH: [
    { value: "DIAGNOSTICS", label: "Diagnostics" },
    { value: "TELEMEDICINE", label: "Telemedicine" },
    { value: "PHARMA_DISTRIBUTION", label: "Pharmaceutical Distribution" },
    { value: "MEDICAL_DEVICES", label: "Medical Devices" },
    { value: "BIOTECH", label: "Biotech" },
    { value: "HEALTHCARE_INFRA", label: "Healthcare Infrastructure" },
  ],
  CONSUMER_FMCG: [
    { value: "FMCG", label: "FMCG" },
    { value: "ECOMMERCE", label: "E-commerce" },
    { value: "DTC_BRANDS", label: "Direct-to-Consumer Brands" },
    { value: "RETAIL_INFRA", label: "Retail Infrastructure" },
    { value: "MARKETPLACES", label: "Marketplaces" },
    { value: "CONSUMER_SERVICES", label: "Consumer Services" },
  ],
  REAL_ESTATE: [
    { value: "RE_DEVELOPMENT", label: "Real Estate Development" },
    { value: "INDUSTRIAL_WAREHOUSING", label: "Industrial Warehousing" },
    { value: "DATA_CENTERS", label: "Data Centers" },
    { value: "TELECOM_INFRA", label: "Telecommunications Infrastructure" },
    { value: "UTILITIES", label: "Utilities" },
    { value: "TRANSPORT_INFRA", label: "Transportation Infrastructure" },
  ],
  INFRASTRUCTURE: [
    { value: "RE_DEVELOPMENT", label: "Real Estate Development" },
    { value: "INDUSTRIAL_WAREHOUSING", label: "Industrial Warehousing" },
    { value: "DATA_CENTERS", label: "Data Centers" },
    { value: "TELECOM_INFRA", label: "Telecommunications Infrastructure" },
    { value: "UTILITIES", label: "Utilities" },
    { value: "TRANSPORT_INFRA", label: "Transportation Infrastructure" },
  ],
  MANUFACTURING: [
    { value: "LIGHT_MANUFACTURING", label: "Light Manufacturing" },
    { value: "HEAVY_INDUSTRY", label: "Heavy Industry" },
    { value: "PACKAGING_MATERIALS", label: "Packaging & Materials" },
    { value: "CONSTRUCTION_SUPPLY", label: "Construction Supply" },
    { value: "EQUIPMENT_LEASING", label: "Equipment Leasing" },
    { value: "INDUSTRIAL_PROCESSING", label: "Industrial Processing" },
  ],
};

const idTypeOptions = [
  { value: "", label: "Select ID type" },
  { value: "DRIVERS_LICENSE", label: "Driver's License" },
  { value: "PASSPORT", label: "Passport" },
];

const revenueStatusOptions = [
  { value: "", label: "Select revenue status" },
  { value: "no_revenue", label: "No revenue" },
  { value: "monthly", label: "Monthly revenue" },
  { value: "annual", label: "Annual revenue" },
];

const revenueRangeOptions = [
  { value: "", label: "Select range" },
  { value: "0-50k", label: "$0 - $50k" },
  { value: "50k-200k", label: "$50k - $200k" },
  { value: "200k-500k", label: "$200k - $500k" },
  { value: "500k-1m", label: "$500k - $1M" },
  { value: "1m-5m", label: "$1M - $5M" },
  { value: "5m+", label: "$5M+" },
];

const revenueTypeOptions = [
  { value: "", label: "Select revenue type" },
  { value: "contracts", label: "Contracts" },
  { value: "consumers", label: "Consumers" },
  { value: "assets", label: "Assets" },
  { value: "subscription", label: "Subscription" },
  { value: "enterprise", label: "Enterprise" },
];

const laneOptions = [
  { value: "", label: "Select lane" },
  { value: "YIELD", label: "Yield (Revenue/Asset-based)" },
  { value: "VENTURES", label: "Ventures (Equity)" },
];

const instrumentOptions = [
  { value: "", label: "Select instrument" },
  { value: "REVENUE_SHARE_NOTE", label: "Revenue Share Note" },
  { value: "ASSET_BACKED_PARTICIPATION", label: "Asset-Backed Participation" },
  { value: "CONVERTIBLE_NOTE", label: "Convertible Note" },
  { value: "SAFE", label: "SAFE" },
  { value: "SPV_EQUITY", label: "SPV Equity" },
];

const deploymentTimelineOptions = [
  { value: "", label: "Select timeline" },
  { value: "immediate", label: "Immediate (1-3 months)" },
  { value: "short", label: "Short-term (3-6 months)" },
  { value: "medium", label: "Medium-term (6-12 months)" },
  { value: "long", label: "Long-term (12+ months)" },
];

// ============================================================================
// VALIDATION LOGIC PER STEP
// ============================================================================
function validateStep(step: number, formData: FormData): string[] {
  const errors: string[] = [];

  switch (step) {
    case 0: // Company Identity
      if (!formData.logoFile) errors.push("logoFile");
      if (!formData.legalName.trim()) errors.push("legalName");
      if (!formData.incorporationNumber.trim())
        errors.push("incorporationNumber");
      if (!formData.incorporationDate) errors.push("incorporationDate");
      if (!formData.countryOfIncorporation)
        errors.push("countryOfIncorporation");
      if (
        !formData.operatingCountries.length ||
        !formData.operatingCountries[0]?.trim()
      )
        errors.push("operatingCountries");
      if (!formData.companyAddress.trim()) errors.push("companyAddress");
      if (!formData.officialEmailDomain.trim())
        errors.push("officialEmailDomain");
      break;

    case 1: // Team & Overview
      if (!formData.teamSize) errors.push("teamSize");
      if (!formData.stage) errors.push("stage");
      if (
        !formData.oneLineDescription.trim() ||
        formData.oneLineDescription.trim().length < 10
      )
        errors.push("oneLineDescription");
      if (
        !formData.detailedDescription.trim() ||
        formData.detailedDescription.trim().length < 50
      )
        errors.push("detailedDescription");
      if (!formData.sector) errors.push("sector");
      if (!formData.subsector) errors.push("subsector");
      if (!formData.businessModel) errors.push("businessModel");
      if (!formData.founderLinkedIn.trim()) errors.push("founderLinkedIn");
      if (!formData.yearsExperience.trim()) errors.push("yearsExperience");
      break;

    case 2: // Founder Verification
      if (!formData.founderFullName.trim()) errors.push("founderFullName");
      if (!formData.founderEmail.trim()) errors.push("founderEmail");
      if (!formData.founderPhone.trim()) errors.push("founderPhone");
      if (!formData.founderNIN.trim()) errors.push("founderNIN");
      if (!formData.founderBVN.trim()) errors.push("founderBVN");
      if (!formData.founderIDType) errors.push("founderIDType");
      if (!formData.founderIDNumber.trim()) errors.push("founderIDNumber");
      break;

    case 3: // Traction
      if (!formData.revenueStatus) errors.push("revenueStatus");
      if (!formData.topMetric1.trim()) errors.push("topMetric1");
      if (!formData.topMetric2.trim()) errors.push("topMetric2");
      if (!formData.topMetric3.trim()) errors.push("topMetric3");
      break;

    case 4: // Capital & History
      if (!formData.founderOwnedPercent) errors.push("founderOwnedPercent");
      if (!formData.externalInvestorsPercent)
        errors.push("externalInvestorsPercent");
      break;

    case 5: // Risks
      if (!formData.topRisk1.trim()) errors.push("topRisk1");
      if (!formData.topRisk2.trim()) errors.push("topRisk2");
      if (!formData.topRisk3.trim()) errors.push("topRisk3");
      break;

    case 6: // Fundraising Intent
      if (!formData.preferredLane) errors.push("preferredLane");
      if (!formData.preferredInstrument) errors.push("preferredInstrument");
      if (!formData.targetRaiseMin) errors.push("targetRaiseMin");
      if (!formData.targetRaiseMax) errors.push("targetRaiseMax");
      if (!formData.primaryUseOfFunds.trim()) errors.push("primaryUseOfFunds");
      break;

    case 7: // Legal Representations
      if (!formData.acknowledgePlacement) errors.push("acknowledgePlacement");
      if (!formData.acknowledgeNoSolicitation)
        errors.push("acknowledgeNoSolicitation");
      if (!formData.acknowledgeAccuracy) errors.push("acknowledgeAccuracy");
      if (!formData.acknowledgeEquity) errors.push("acknowledgeEquity");
      if (!formData.acknowledgeNoGuarantee)
        errors.push("acknowledgeNoGuarantee");
      break;

    case 8: // Platform Participation Agreement
      if (!formData.participationAcknowledged)
        errors.push("participationAcknowledged");
      break;
  }

  return errors;
}

// Helper: input border class based on error
function inputClass(hasError: boolean) {
  return `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none ${
    hasError ? "border-red-400 bg-red-50" : "border-gray-300"
  }`;
}

// Helper: error message
function FieldError({ show, message }: { show: boolean; message: string }) {
  if (!show) return null;
  return <p className="text-xs text-red-600 mt-1">{message}</p>;
}

export default function CompanyOnboarding() {
  const router = useRouter();
  const { user, accessToken, loading } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      console.error("No user found, redirecting to login");
      router.push("/login");
    }
  }, [user, loading, router]);

  const [formData, setFormData] = useState<FormData>({
    logoFile: null,
    logoPreview: "",
    legalName: "",
    tradingName: "",
    incorporationNumber: "",
    incorporationDate: "",
    countryOfIncorporation: "Nigeria",
    operatingCountries: [],
    companyAddress: "",
    website: "",
    officialEmailDomain: "",
    regulatoryLicenses: "",
    teamSize: "",
    oneLineDescription: "",
    detailedDescription: "",
    sector: "",
    subsector: "",
    businessModel: "",
    stage: "",
    founderLinkedIn: "",
    yearsExperience: "",
    keyExecutives: "",
    founderFullName: "",
    founderEmail: "",
    founderPhone: "",
    founderNIN: "",
    founderBVN: "",
    founderIDType: "",
    founderIDNumber: "",
    revenueStatus: "",
    revenueRange: "",
    revenueType: "",
    topMetric1: "",
    topMetric2: "",
    topMetric3: "",
    majorCustomers: "",
    geographicFootprint: "",
    hasRaisedBefore: false,
    previousRaises: "",
    founderOwnedPercent: "",
    externalInvestorsPercent: "",
    esopPercent: "",
    existingDebt: "",
    convertibleInstruments: "",
    investorSideLetters: "",
    topRisk1: "",
    topRisk2: "",
    topRisk3: "",
    regulationDependent: false,
    regulatoryDependencies: "",
    fxExposure: false,
    singleSupplier: false,
    keyConcentrationRisk: "",
    preferredLane: "",
    preferredInstrument: "",
    targetRaiseMin: "",
    targetRaiseMax: "",
    primaryUseOfFunds: "",
    proposedValuation: "",
    proposedRevenueShare: "",
    deploymentTimeline: "",
    acknowledgePlacement: false,
    acknowledgeNoSolicitation: false,
    acknowledgeAccuracy: false,
    acknowledgeEquity: false,
    acknowledgeNoGuarantee: false,
    participationAcknowledged: false,
  });

  const updateField = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

  const handleSubmit = async () => {
    try {
      if (!accessToken) {
        alert("Your session has expired. Please log in again.");
        router.push("/login");
        return;
      }

      console.log("✅ Submitting for user:", user?.email);

      // Upload logo to Supabase Storage
      let logoUrl = "";
      if (formData.logoFile) {
        const fileExt = formData.logoFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("company_logo")
          .upload(fileName, formData.logoFile);

        if (uploadError) {
          console.error("❌ Logo upload error:", uploadError);
          alert("Failed to upload logo. Please try again.");
          return;
        }

        const { data: urlData } = supabase.storage
          .from("company_logo")
          .getPublicUrl(fileName);

        logoUrl = urlData.publicUrl;
        console.log("✅ Logo uploaded:", logoUrl);
      }

      const payload = {
        logoUrl,
        legalName: formData.legalName,
        tradingName: formData.tradingName || undefined,
        incorporationNumber: formData.incorporationNumber,
        incorporationDate: new Date(formData.incorporationDate).toISOString(),
        countryOfIncorporation: formData.countryOfIncorporation,
        operatingCountries: formData.operatingCountries,
        companyAddress: formData.companyAddress,
        website: formData.website || undefined,
        officialEmailDomain: formData.officialEmailDomain,
        teamSize: formData.teamSize,
        oneLineDescription: formData.oneLineDescription,
        detailedDescription: formData.detailedDescription,
        sector: formData.sector,
        subsector: formData.subsector,
        businessModel: formData.businessModel,
        revenueModel: "TRANSACTIONAL",
        stage: formData.stage,
        revenueStatus: formData.revenueStatus,
        revenueRange: formData.revenueRange,
        primaryRevenueSource: formData.revenueType,
        keyMetrics: {
          metric1: formData.topMetric1,
          metric2: formData.topMetric2,
          metric3: formData.topMetric3,
        },
        majorCustomers: formData.majorCustomers
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        geographicFootprint: formData.geographicFootprint,
        hasRaisedBefore: formData.hasRaisedBefore,
        previousRaises: formData.previousRaises || undefined,
        founderOwnedPercent:
          parseFloat(formData.founderOwnedPercent) || undefined,
        externalInvestorsPercent:
          parseFloat(formData.externalInvestorsPercent) || undefined,
        notableInvestors: [],
        topRisks: [formData.topRisk1, formData.topRisk2, formData.topRisk3],
        materialThreats: `${formData.existingDebt ? "Debt: " + formData.existingDebt + ". " : ""}${formData.convertibleInstruments ? "Convertibles: " + formData.convertibleInstruments : ""}`,
        singleSupplier: formData.singleSupplier,
        fxExposure: formData.fxExposure,
        regulationDependent: formData.regulationDependent,
        regulatoryDependencies: formData.regulatoryDependencies || undefined,
        infrastructureDependent: false,
        preferredLane: formData.preferredLane,
        preferredInstrument: formData.preferredInstrument,
        targetRaiseRange: `$${formData.targetRaiseMin} - $${formData.targetRaiseMax}`,
        primaryUseOfFunds: formData.primaryUseOfFunds,
        founderLinkedIn: formData.founderLinkedIn || undefined,
        yearsExperience: formData.yearsExperience || undefined,
        founderNIN: formData.founderNIN || undefined,
        founderBVN: formData.founderBVN || undefined,
        participationAcknowledged: formData.participationAcknowledged,
      };

      console.log("📤 Sending payload to API...");

      const response = await fetch("http://localhost:4000/api/companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      console.log("📥 API response status:", response.status);
      const result = await response.json();
      console.log("📥 API response body:", result);

      if (result.success) {
        router.push("/dashboard/founder/submission-success");
      } else {
        console.error("❌ API error:", result.error);
        alert(`Error: ${result.error?.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("❌ Submission error:", error);
      alert("Failed to submit company. Please try again.");
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

  const hasErr = (field: string) => validationErrors.includes(field);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F6F8FA" }}>
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
              Save & Exit
            </Link>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-gray-200">
        <div className="container py-6">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => (
              <div key={step} className="flex-1 relative">
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${index <= currentStep ? "bg-primary-950 text-white" : "bg-gray-200 text-gray-500"}`}
                  >
                    {index + 1}
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 transition-colors ${index < currentStep ? "bg-primary-950" : "bg-gray-200"}`}
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

      <main className="container py-8">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm font-medium mb-6">
              ⚠ Please fill in all required fields before proceeding
            </div>
          )}

          {currentStep === 0 && (
            <Step1Identity
              formData={formData}
              updateField={updateField}
              errors={validationErrors}
            />
          )}
          {currentStep === 1 && (
            <Step2Team
              formData={formData}
              updateField={updateField}
              errors={validationErrors}
            />
          )}
          {currentStep === 2 && (
            <Step3FounderVerification
              formData={formData}
              updateField={updateField}
              errors={validationErrors}
            />
          )}
          {currentStep === 3 && (
            <Step4Traction
              formData={formData}
              updateField={updateField}
              errors={validationErrors}
            />
          )}
          {currentStep === 4 && (
            <Step5Capital
              formData={formData}
              updateField={updateField}
              errors={validationErrors}
            />
          )}
          {currentStep === 5 && (
            <Step6Risks
              formData={formData}
              updateField={updateField}
              errors={validationErrors}
            />
          )}
          {currentStep === 6 && (
            <Step7Fundraising
              formData={formData}
              updateField={updateField}
              errors={validationErrors}
            />
          )}
          {currentStep === 7 && (
            <Step8Legal
              formData={formData}
              updateField={updateField}
              errors={validationErrors}
            />
          )}
          {currentStep === 8 && (
            <Step9Participation
              formData={formData}
              updateField={updateField}
              errors={validationErrors}
            />
          )}
          {currentStep === 9 && <Step10Review formData={formData} />}

          <div className="flex items-center justify-between mt-8 pt-8 border-t border-gray-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-gray-300 text-gray-700 hover:border-gray-400"
            >
              Previous
            </button>

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
                className="px-6 py-3 rounded-lg font-semibold transition-all"
                style={{ backgroundColor: "#C8A24D", color: "#0B1C2D" }}
              >
                Submit Company
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// ============================================================================
// Shared prop type for steps with validation
// ============================================================================
type StepProps = {
  formData: FormData;
  updateField: (field: keyof FormData, value: any) => void;
  errors: string[];
};

// ============================================================================
// STEP 1: COMPANY IDENTITY
// ============================================================================
function Step1Identity({ formData, updateField, errors }: StepProps) {
  const has = (f: string) => errors.includes(f);
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary-950 mb-2">
          Company Identity
        </h2>
        <p className="text-gray-600">Basic information about your company</p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Company Logo <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
              {formData.logoPreview ? (
                <img
                  src={formData.logoPreview}
                  alt="Logo preview"
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              )}
            </div>
            <div>
              <label className="inline-block px-4 py-2 rounded-lg font-semibold text-sm cursor-pointer transition-all border-2 border-gray-300 text-gray-700 hover:border-gray-400">
                {formData.logoPreview ? "Change Logo" : "Upload Logo"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 2 * 1024 * 1024) {
                        alert("Logo must be under 2MB");
                        return;
                      }
                      updateField("logoFile", file);
                      updateField("logoPreview", URL.createObjectURL(file));
                    }
                  }}
                />
              </label>
              <p className="text-xs text-gray-500 mt-2">
                PNG, JPG, or WebP. Max 2MB.
              </p>
              {has("logoFile") && (
                <p className="text-xs text-red-600 mt-1">
                  Company logo is required
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Legal Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.legalName}
            onChange={(e) => updateField("legalName", e.target.value)}
            className={inputClass(has("legalName"))}
            placeholder="As registered with CAC"
          />
          <FieldError
            show={has("legalName")}
            message="Legal name is required"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Trading Name (if different)
          </label>
          <input
            type="text"
            value={formData.tradingName}
            onChange={(e) => updateField("tradingName", e.target.value)}
            className={inputClass(false)}
            placeholder="DBA or brand name"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            CAC Registration Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.incorporationNumber}
            onChange={(e) => updateField("incorporationNumber", e.target.value)}
            className={inputClass(has("incorporationNumber"))}
            placeholder="RC123456"
          />
          <FieldError
            show={has("incorporationNumber")}
            message="CAC number is required"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Incorporation Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.incorporationDate}
            onChange={(e) => updateField("incorporationDate", e.target.value)}
            className={inputClass(has("incorporationDate"))}
          />
          <FieldError
            show={has("incorporationDate")}
            message="Incorporation date is required"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Country of Incorporation <span className="text-red-500">*</span>
          </label>
          <CustomSelect
            value={formData.countryOfIncorporation}
            onChange={(value) => updateField("countryOfIncorporation", value)}
            options={countryOptions}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Operating Countries <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.operatingCountries.join(", ")}
            onChange={(e) =>
              updateField(
                "operatingCountries",
                e.target.value.split(",").map((s) => s.trim()),
              )
            }
            className={inputClass(has("operatingCountries"))}
            placeholder="Nigeria, Ghana, Kenya"
          />
          <FieldError
            show={has("operatingCountries")}
            message="At least one operating country is required"
          />
          {!has("operatingCountries") && (
            <p className="text-xs text-gray-500 mt-1">
              Separate multiple countries with commas
            </p>
          )}
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Company Address <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.companyAddress}
            onChange={(e) => updateField("companyAddress", e.target.value)}
            rows={3}
            className={inputClass(has("companyAddress"))}
            placeholder="Full registered address"
          />
          <FieldError
            show={has("companyAddress")}
            message="Company address is required"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Website
          </label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => updateField("website", e.target.value)}
            className={inputClass(false)}
            placeholder="https://yourcompany.com"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Official Email Domain <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.officialEmailDomain}
            onChange={(e) => updateField("officialEmailDomain", e.target.value)}
            className={inputClass(has("officialEmailDomain"))}
            placeholder="company.com"
          />
          <FieldError
            show={has("officialEmailDomain")}
            message="Email domain is required"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Regulatory Licenses (if applicable)
          </label>
          <textarea
            value={formData.regulatoryLicenses}
            onChange={(e) => updateField("regulatoryLicenses", e.target.value)}
            rows={2}
            className={inputClass(false)}
            placeholder="e.g., CBN banking license, FCCPC approval, etc."
          />
        </div>
      </div>
    </div>
  );
}
// ============================================================================
// STEP 2: TEAM & OVERVIEW
// ============================================================================
function Step2Team({ formData, updateField, errors }: StepProps) {
  const has = (f: string) => errors.includes(f);
  const descLen = formData.detailedDescription.length;
  const descTooShort = descLen > 0 && descLen < 50;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary-950 mb-2">
          Team & Overview
        </h2>
        <p className="text-gray-600">Tell us about your team and what you do</p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Team Size <span className="text-red-500">*</span>
          </label>
          <div
            className={has("teamSize") ? "ring-2 ring-red-400 rounded-lg" : ""}
          >
            <CustomSelect
              value={formData.teamSize}
              onChange={(value) => updateField("teamSize", value)}
              options={teamSizeOptions}
            />
          </div>
          <FieldError show={has("teamSize")} message="Team size is required" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Stage <span className="text-red-500">*</span>
          </label>
          <div className={has("stage") ? "ring-2 ring-red-400 rounded-lg" : ""}>
            <CustomSelect
              value={formData.stage}
              onChange={(value) => updateField("stage", value)}
              options={stageOptions}
            />
          </div>
          <FieldError show={has("stage")} message="Stage is required" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            One-Line Description <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            maxLength={200}
            value={formData.oneLineDescription}
            onChange={(e) => updateField("oneLineDescription", e.target.value)}
            className={inputClass(has("oneLineDescription"))}
            placeholder="Describe your company in one sentence (max 200 characters)"
          />
          <div className="flex justify-between mt-1">
            <FieldError
              show={has("oneLineDescription")}
              message="At least 10 characters required"
            />
            <p className="text-xs text-gray-500">
              {formData.oneLineDescription.length}/200 characters
            </p>
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Detailed Description <span className="text-red-500">*</span>
          </label>
          <textarea
            maxLength={1000}
            value={formData.detailedDescription}
            onChange={(e) => updateField("detailedDescription", e.target.value)}
            rows={4}
            className={inputClass(has("detailedDescription"))}
            placeholder="What does your company do? What problem do you solve? (max 1000 characters)"
          />
          <div className="flex justify-between mt-1">
            {has("detailedDescription") ? (
              <p className="text-xs text-red-600">
                Minimum 50 characters required
              </p>
            ) : descTooShort ? (
              <p className="text-xs text-amber-600">
                Minimum 50 characters required ({50 - descLen} more needed)
              </p>
            ) : descLen >= 50 ? (
              <p className="text-xs text-green-600">✓ Minimum met</p>
            ) : (
              <p className="text-xs text-gray-500">Minimum 50 characters</p>
            )}
            <p className="text-xs text-gray-500">{descLen}/1000 characters</p>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Sector <span className="text-red-500">*</span>
          </label>
          <div
            className={has("sector") ? "ring-2 ring-red-400 rounded-lg" : ""}
          >
            <CustomSelect
              value={formData.sector}
              onChange={(value) => {
                updateField("sector", value);
                updateField("subsector", "");
              }}
              options={sectorOptions}
            />
          </div>
          <FieldError show={has("sector")} message="Sector is required" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Subsector <span className="text-red-500">*</span>
          </label>
          <div
            className={has("subsector") ? "ring-2 ring-red-400 rounded-lg" : ""}
          >
            <CustomSelect
              value={formData.subsector}
              onChange={(value) => updateField("subsector", value)}
              options={
                formData.sector && subsectorMap[formData.sector]
                  ? [
                      { value: "", label: "Select subsector" },
                      ...subsectorMap[formData.sector],
                    ]
                  : [{ value: "", label: "Select a sector first" }]
              }
            />
          </div>
          <FieldError show={has("subsector")} message="Subsector is required" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Business Model <span className="text-red-500">*</span>
          </label>
          <div
            className={
              has("businessModel") ? "ring-2 ring-red-400 rounded-lg" : ""
            }
          >
            <CustomSelect
              value={formData.businessModel}
              onChange={(value) => updateField("businessModel", value)}
              options={businessModelOptions}
            />
          </div>
          <FieldError
            show={has("businessModel")}
            message="Business model is required"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Founder LinkedIn <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            value={formData.founderLinkedIn}
            onChange={(e) => updateField("founderLinkedIn", e.target.value)}
            className={inputClass(has("founderLinkedIn"))}
            placeholder="https://linkedin.com/in/yourprofile"
          />
          <FieldError show={has("founderLinkedIn")} message="Founder LinkedIn is required" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Years of Relevant Experience <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            value={formData.yearsExperience}
            onChange={(e) => updateField("yearsExperience", e.target.value)}
            className={inputClass(has("yearsExperience"))}
            placeholder="Years in this industry"
          />
          <FieldError show={has("yearsExperience")} message="Years of experience is required" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Key Executive Roles (if any)
          </label>
          <input
            type="text"
            value={formData.keyExecutives}
            onChange={(e) => updateField("keyExecutives", e.target.value)}
            className={inputClass(false)}
            placeholder="e.g., CTO from Google, CFO from Stripe"
          />
        </div>
      </div>
    </div>
  );
}
// ============================================================================
// STEP 3: FOUNDER VERIFICATION
// ============================================================================
function Step3FounderVerification({
  formData,
  updateField,
  errors,
}: StepProps) {
  const has = (f: string) => errors.includes(f);
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary-950 mb-2">
          Founder Verification
        </h2>
        <p className="text-gray-600">
          For compliance and verification purposes, we need the primary
          founder's details
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.founderFullName}
            onChange={(e) => updateField("founderFullName", e.target.value)}
            className={inputClass(has("founderFullName"))}
            placeholder="As it appears on government ID"
          />
          <FieldError
            show={has("founderFullName")}
            message="Full name is required"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={formData.founderEmail}
            onChange={(e) => updateField("founderEmail", e.target.value)}
            className={inputClass(has("founderEmail"))}
            placeholder="founder@company.com"
          />
          <FieldError show={has("founderEmail")} message="Email is required" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={formData.founderPhone}
            onChange={(e) => updateField("founderPhone", e.target.value)}
            className={inputClass(has("founderPhone"))}
            placeholder="+234 xxx xxx xxxx"
          />
          <FieldError
            show={has("founderPhone")}
            message="Phone number is required"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            National Identity Number (NIN){" "}
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.founderNIN}
            onChange={(e) => updateField("founderNIN", e.target.value)}
            className={inputClass(has("founderNIN"))}
            placeholder="11-digit NIN"
            maxLength={11}
          />
          <FieldError show={has("founderNIN")} message="NIN is required" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Bank Verification Number (BVN){" "}
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.founderBVN}
            onChange={(e) => updateField("founderBVN", e.target.value)}
            className={inputClass(has("founderBVN"))}
            placeholder="11-digit BVN"
            maxLength={11}
          />
          <FieldError show={has("founderBVN")} message="BVN is required" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            ID Type <span className="text-red-500">*</span>
          </label>
          <div
            className={
              has("founderIDType") ? "ring-2 ring-red-400 rounded-lg" : ""
            }
          >
            <CustomSelect
              value={formData.founderIDType}
              onChange={(value) => updateField("founderIDType", value)}
              options={idTypeOptions}
            />
          </div>
          <FieldError
            show={has("founderIDType")}
            message="ID type is required"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            ID Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.founderIDNumber}
            onChange={(e) => updateField("founderIDNumber", e.target.value)}
            className={inputClass(has("founderIDNumber"))}
            placeholder="ID number"
          />
          <FieldError
            show={has("founderIDNumber")}
            message="ID number is required"
          />
        </div>
        <div className="md:col-span-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Privacy Note:</strong> Your personal information is
            encrypted and stored securely. We use this information solely for
            identity verification and compliance purposes.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 4: TRACTION
// ============================================================================
function Step4Traction({ formData, updateField, errors }: StepProps) {
  const has = (f: string) => errors.includes(f);
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary-950 mb-2">Traction</h2>
        <p className="text-gray-600">Show us your business performance</p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Revenue Status <span className="text-red-500">*</span>
          </label>
          <div
            className={
              has("revenueStatus") ? "ring-2 ring-red-400 rounded-lg" : ""
            }
          >
            <CustomSelect
              value={formData.revenueStatus}
              onChange={(value) => updateField("revenueStatus", value)}
              options={revenueStatusOptions}
            />
          </div>
          <FieldError
            show={has("revenueStatus")}
            message="Revenue status is required"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Revenue Range (if applicable)
          </label>
          <CustomSelect
            value={formData.revenueRange}
            onChange={(value) => updateField("revenueRange", value)}
            options={revenueRangeOptions}
            className={
              formData.revenueStatus === "no_revenue"
                ? "opacity-50 pointer-events-none"
                : ""
            }
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Revenue Type
          </label>
          <CustomSelect
            value={formData.revenueType}
            onChange={(value) => updateField("revenueType", value)}
            options={revenueTypeOptions}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Top 3 Metrics <span className="text-red-500">*</span>
          </label>
          <p className="text-sm text-gray-600 mb-3">
            What are your key performance indicators?
          </p>
          <div className="space-y-3">
            <div>
              <input
                type="text"
                value={formData.topMetric1}
                onChange={(e) => updateField("topMetric1", e.target.value)}
                className={inputClass(has("topMetric1"))}
                placeholder="Metric 1: e.g., 10,000 active users"
              />
              <FieldError
                show={has("topMetric1")}
                message="Metric 1 is required"
              />
            </div>
            <div>
              <input
                type="text"
                value={formData.topMetric2}
                onChange={(e) => updateField("topMetric2", e.target.value)}
                className={inputClass(has("topMetric2"))}
                placeholder="Metric 2: e.g., 25% MoM growth"
              />
              <FieldError
                show={has("topMetric2")}
                message="Metric 2 is required"
              />
            </div>
            <div>
              <input
                type="text"
                value={formData.topMetric3}
                onChange={(e) => updateField("topMetric3", e.target.value)}
                className={inputClass(has("topMetric3"))}
                placeholder="Metric 3: e.g., $500k ARR"
              />
              <FieldError
                show={has("topMetric3")}
                message="Metric 3 is required"
              />
            </div>
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Major Customers
          </label>
          <textarea
            value={formData.majorCustomers}
            onChange={(e) => updateField("majorCustomers", e.target.value)}
            rows={2}
            className={inputClass(false)}
            placeholder="List key customers or customer types (comma-separated)"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Geographic Footprint
          </label>
          <input
            type="text"
            value={formData.geographicFootprint}
            onChange={(e) => updateField("geographicFootprint", e.target.value)}
            className={inputClass(false)}
            placeholder="e.g., Lagos, Abuja, Accra"
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 5: CAPITAL & HISTORY
// ============================================================================
function Step5Capital({ formData, updateField, errors }: StepProps) {
  const has = (f: string) => errors.includes(f);
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary-950 mb-2">
          Capital & History
        </h2>
        <p className="text-gray-600">
          Tell us about your funding history and cap table
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.hasRaisedBefore}
              onChange={(e) => updateField("hasRaisedBefore", e.target.checked)}
              className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-600"
            />
            <span className="text-sm font-semibold text-gray-900">
              We have raised capital before
            </span>
          </label>
        </div>
        {formData.hasRaisedBefore && (
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Previous Raises
            </label>
            <textarea
              value={formData.previousRaises}
              onChange={(e) => updateField("previousRaises", e.target.value)}
              rows={3}
              className={inputClass(false)}
              placeholder="e.g., $500k seed in 2022 via SAFE, $1M Series A in 2023"
            />
          </div>
        )}
        <div className="md:col-span-2">
          <p className="text-sm font-semibold text-gray-900 mb-3">
            Cap Table Summary <span className="text-red-500">*</span>
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Founder Owned %
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.founderOwnedPercent}
                onChange={(e) =>
                  updateField("founderOwnedPercent", e.target.value)
                }
                className={inputClass(has("founderOwnedPercent"))}
                placeholder="75"
              />
              <FieldError
                show={has("founderOwnedPercent")}
                message="Required"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                External Investors %
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.externalInvestorsPercent}
                onChange={(e) =>
                  updateField("externalInvestorsPercent", e.target.value)
                }
                className={inputClass(has("externalInvestorsPercent"))}
                placeholder="20"
              />
              <FieldError
                show={has("externalInvestorsPercent")}
                message="Required"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">ESOP %</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.esopPercent}
                onChange={(e) => updateField("esopPercent", e.target.value)}
                className={inputClass(false)}
                placeholder="5"
              />
            </div>
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Existing Debt Obligations
          </label>
          <textarea
            value={formData.existingDebt}
            onChange={(e) => updateField("existingDebt", e.target.value)}
            rows={2}
            className={inputClass(false)}
            placeholder="Any outstanding loans, credit lines, or debt? Leave blank if none."
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Convertible Instruments Outstanding
          </label>
          <textarea
            value={formData.convertibleInstruments}
            onChange={(e) =>
              updateField("convertibleInstruments", e.target.value)
            }
            rows={2}
            className={inputClass(false)}
            placeholder="Any SAFEs, convertible notes, or other convertible instruments? Leave blank if none."
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Investor Side Letters
          </label>
          <textarea
            value={formData.investorSideLetters}
            onChange={(e) => updateField("investorSideLetters", e.target.value)}
            rows={2}
            className={inputClass(false)}
            placeholder="Any special agreements with existing investors? Leave blank if none."
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 6: RISKS
// ============================================================================
function Step6Risks({ formData, updateField, errors }: StepProps) {
  const has = (f: string) => errors.includes(f);
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary-950 mb-2">Risks</h2>
        <p className="text-gray-600">
          Be honest about the challenges and risks
        </p>
      </div>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Top 3 Risks <span className="text-red-500">*</span>
          </label>
          <p className="text-sm text-gray-600 mb-3">
            What are the biggest risks to your business?
          </p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Risk 1</label>
              <textarea
                value={formData.topRisk1}
                onChange={(e) => updateField("topRisk1", e.target.value)}
                rows={2}
                className={inputClass(has("topRisk1"))}
                placeholder="Describe your biggest risk"
              />
              <FieldError show={has("topRisk1")} message="Risk 1 is required" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Risk 2</label>
              <textarea
                value={formData.topRisk2}
                onChange={(e) => updateField("topRisk2", e.target.value)}
                rows={2}
                className={inputClass(has("topRisk2"))}
                placeholder="Describe your second biggest risk"
              />
              <FieldError show={has("topRisk2")} message="Risk 2 is required" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Risk 3</label>
              <textarea
                value={formData.topRisk3}
                onChange={(e) => updateField("topRisk3", e.target.value)}
                rows={2}
                className={inputClass(has("topRisk3"))}
                placeholder="Describe your third biggest risk"
              />
              <FieldError show={has("topRisk3")} message="Risk 3 is required" />
            </div>
          </div>
        </div>
        <div className="space-y-4 p-6 bg-gray-50 rounded-lg">
          <p className="font-semibold text-gray-900">Key Risk Factors</p>
          <div>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={formData.regulationDependent}
                onChange={(e) =>
                  updateField("regulationDependent", e.target.checked)
                }
                className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-600 mt-0.5"
              />
              <div className="flex-1">
                <span className="text-sm font-semibold text-gray-900 block">
                  Regulatory Dependencies
                </span>
                <span className="text-xs text-gray-600">
                  Does your business depend on regulatory approval or licenses?
                </span>
              </div>
            </label>
            {formData.regulationDependent && (
              <textarea
                value={formData.regulatoryDependencies}
                onChange={(e) =>
                  updateField("regulatoryDependencies", e.target.value)
                }
                rows={2}
                className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
                placeholder="Explain your regulatory dependencies"
              />
            )}
          </div>
          <div>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={formData.fxExposure}
                onChange={(e) => updateField("fxExposure", e.target.checked)}
                className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-600 mt-0.5"
              />
              <div className="flex-1">
                <span className="text-sm font-semibold text-gray-900 block">
                  FX Exposure
                </span>
                <span className="text-xs text-gray-600">
                  Do you have significant foreign exchange risk?
                </span>
              </div>
            </label>
          </div>
          <div>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={formData.singleSupplier}
                onChange={(e) =>
                  updateField("singleSupplier", e.target.checked)
                }
                className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-600 mt-0.5"
              />
              <div className="flex-1">
                <span className="text-sm font-semibold text-gray-900 block">
                  Single Supplier Dependency
                </span>
                <span className="text-xs text-gray-600">
                  Do you rely on a single supplier for critical operations?
                </span>
              </div>
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Key Concentration Risk
          </label>
          <p className="text-sm text-gray-600 mb-2">
            Does any single client represent more than 30% of revenue?
          </p>
          <textarea
            value={formData.keyConcentrationRisk}
            onChange={(e) =>
              updateField("keyConcentrationRisk", e.target.value)
            }
            rows={2}
            className={inputClass(false)}
            placeholder="If yes, explain. If no, write 'No concentration risk'."
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 7: FUNDRAISING INTENT
// ============================================================================
function Step7Fundraising({ formData, updateField, errors }: StepProps) {
  const has = (f: string) => errors.includes(f);
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary-950 mb-2">
          Fundraising Intent
        </h2>
        <p className="text-gray-600">What are you looking to raise?</p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Preferred Lane <span className="text-red-500">*</span>
          </label>
          <div
            className={
              has("preferredLane") ? "ring-2 ring-red-400 rounded-lg" : ""
            }
          >
            <CustomSelect
              value={formData.preferredLane}
              onChange={(value) => updateField("preferredLane", value)}
              options={laneOptions}
            />
          </div>
          <FieldError
            show={has("preferredLane")}
            message="Preferred lane is required"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Preferred Instrument <span className="text-red-500">*</span>
          </label>
          <div
            className={
              has("preferredInstrument") ? "ring-2 ring-red-400 rounded-lg" : ""
            }
          >
            <CustomSelect
              value={formData.preferredInstrument}
              onChange={(value) => updateField("preferredInstrument", value)}
              options={instrumentOptions}
            />
          </div>
          <FieldError
            show={has("preferredInstrument")}
            message="Preferred instrument is required"
          />
        </div>
        <div className="md:col-span-2">
          <p className="text-sm font-semibold text-gray-900 mb-3">
            Target Raise Range <span className="text-red-500">*</span>
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Minimum ($)
              </label>
              <input
                type="number"
                min="0"
                value={formData.targetRaiseMin}
                onChange={(e) => updateField("targetRaiseMin", e.target.value)}
                className={inputClass(has("targetRaiseMin"))}
                placeholder="100000"
              />
              <FieldError
                show={has("targetRaiseMin")}
                message="Minimum amount is required"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Maximum ($)
              </label>
              <input
                type="number"
                min="0"
                value={formData.targetRaiseMax}
                onChange={(e) => updateField("targetRaiseMax", e.target.value)}
                className={inputClass(has("targetRaiseMax"))}
                placeholder="500000"
              />
              <FieldError
                show={has("targetRaiseMax")}
                message="Maximum amount is required"
              />
            </div>
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Primary Use of Funds <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.primaryUseOfFunds}
            onChange={(e) => updateField("primaryUseOfFunds", e.target.value)}
            rows={3}
            className={inputClass(has("primaryUseOfFunds"))}
            placeholder="How will you deploy the capital? Be specific."
          />
          <FieldError
            show={has("primaryUseOfFunds")}
            message="Use of funds is required"
          />
        </div>
        {formData.preferredLane === "VENTURES" && (
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Proposed Valuation or Cap
            </label>
            <input
              type="text"
              value={formData.proposedValuation}
              onChange={(e) => updateField("proposedValuation", e.target.value)}
              className={inputClass(false)}
              placeholder="e.g., $5M post-money or $10M cap"
            />
          </div>
        )}
        {formData.preferredLane === "YIELD" && (
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Proposed Revenue Share %
            </label>
            <input
              type="text"
              value={formData.proposedRevenueShare}
              onChange={(e) =>
                updateField("proposedRevenueShare", e.target.value)
              }
              className={inputClass(false)}
              placeholder="e.g., 5% of monthly revenue until 2x return"
            />
          </div>
        )}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Expected Timeline to Deploy Funds
          </label>
          <CustomSelect
            value={formData.deploymentTimeline}
            onChange={(value) => updateField("deploymentTimeline", value)}
            options={deploymentTimelineOptions}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 8: LEGAL REPRESENTATIONS
// ============================================================================
function Step8Legal({ formData, updateField, errors }: StepProps) {
  const has = (f: string) => errors.includes(f);
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary-950 mb-2">
          Legal Representations
        </h2>
        <p className="text-gray-600">
          Please acknowledge the following before submission
        </p>
      </div>

      <div className="space-y-4 p-6 bg-gray-50 rounded-lg">
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
            ⚠ You must accept all acknowledgements to proceed
          </div>
        )}

        <div
          className={`flex items-start gap-3 p-3 rounded-lg ${has("acknowledgePlacement") ? "bg-red-50 border border-red-300" : ""}`}
        >
          <input
            type="checkbox"
            checked={formData.acknowledgePlacement}
            onChange={(e) =>
              updateField("acknowledgePlacement", e.target.checked)
            }
            className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-600 mt-1"
          />
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">
              This is a private placement
            </p>
            <p className="text-xs text-gray-600 mt-1">
              I understand that this is a private placement exempt from general
              public offering requirements.
            </p>
          </div>
        </div>

        <div
          className={`flex items-start gap-3 p-3 rounded-lg ${has("acknowledgeNoSolicitation") ? "bg-red-50 border border-red-300" : ""}`}
        >
          <input
            type="checkbox"
            checked={formData.acknowledgeNoSolicitation}
            onChange={(e) =>
              updateField("acknowledgeNoSolicitation", e.target.checked)
            }
            className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-600 mt-1"
          />
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">
              No general solicitation
            </p>
            <p className="text-xs text-gray-600 mt-1">
              I will not engage in general solicitation or advertising outside
              of Capvista's platform.
            </p>
          </div>
        </div>

        <div
          className={`flex items-start gap-3 p-3 rounded-lg ${has("acknowledgeAccuracy") ? "bg-red-50 border border-red-300" : ""}`}
        >
          <input
            type="checkbox"
            checked={formData.acknowledgeAccuracy}
            onChange={(e) =>
              updateField("acknowledgeAccuracy", e.target.checked)
            }
            className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-600 mt-1"
          />
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">
              Information accuracy
            </p>
            <p className="text-xs text-gray-600 mt-1">
              All information provided is accurate, complete, and truthful to
              the best of my knowledge.
            </p>
          </div>
        </div>

        <div
          className={`flex items-start gap-3 p-3 rounded-lg ${has("acknowledgeEquity") ? "bg-red-50 border border-red-300" : ""}`}
        >
          <input
            type="checkbox"
            checked={formData.acknowledgeEquity}
            onChange={(e) => updateField("acknowledgeEquity", e.target.checked)}
            className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-600 mt-1"
          />
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">
              1% equity to Capvista Holdings
            </p>
            <p className="text-xs text-gray-600 mt-1">
              I acknowledge that 1% non-preferential equity will be issued to
              Capvista Holdings as a condition of platform access.
            </p>
          </div>
        </div>

        <div
          className={`flex items-start gap-3 p-3 rounded-lg ${has("acknowledgeNoGuarantee") ? "bg-red-50 border border-red-300" : ""}`}
        >
          <input
            type="checkbox"
            checked={formData.acknowledgeNoGuarantee}
            onChange={(e) =>
              updateField("acknowledgeNoGuarantee", e.target.checked)
            }
            className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-600 mt-1"
          />
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">
              No funding guarantee
            </p>
            <p className="text-xs text-gray-600 mt-1">
              I understand that Capvista does not guarantee funding and that
              acceptance to the platform does not constitute a commitment to
              invest.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> By submitting this application, you agree to
          undergo additional verification including director identity
          verification (NIN) and BVN for signatories as part of our compliance
          process.
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 9: PLATFORM PARTICIPATION AGREEMENT
// ============================================================================
function Step9Participation({ formData, updateField, errors }: StepProps) {
  const has = (f: string) => errors.includes(f);
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary-950 mb-2">
          Capvista Platform Participation Agreement
        </h2>
        <p className="text-gray-600">
          Please review and acknowledge the following agreement
        </p>
      </div>

      <div className="p-6 bg-gray-50 rounded-lg space-y-4">
        <p className="text-sm text-gray-800 leading-relaxed">
          As a condition of accessing Capvista&apos;s capital infrastructure, listing services,
          and qualified investor network, the Company agrees to issue 1% of its fully
          diluted equity to Capvista Holdings.
        </p>
        <p className="text-sm text-gray-800 leading-relaxed">
          This issuance is consideration for platform access and is required prior to
          deal publication.
        </p>

        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Key Terms:</h4>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1.5">
            <li>Capvista Holdings receives 1% of fully diluted equity</li>
            <li>Equity is issued as ordinary shares (or warrant, as agreed)</li>
            <li>Issuance must be duly authorized by the Company&apos;s board of directors</li>
            <li>
              The Company must provide documentary proof of issuance before any deal
              can be published
            </li>
          </ul>
        </div>

        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Required Documents (after approval):</h4>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1.5">
            <li>Board Resolution</li>
            <li>Share Certificate or Warrant Agreement</li>
            <li>Updated Shareholder Register</li>
            <li>Updated Cap Table</li>
          </ul>
        </div>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-900 mb-1">Representation</h4>
          <p className="text-sm text-blue-800">
            &ldquo;The Company represents that it has the authority to issue equity and
            that any issuance to Capvista Holdings will be duly authorized and
            recorded in accordance with applicable corporate law.&rdquo;
          </p>
        </div>
      </div>

      <div className="mt-4">
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm font-medium mb-4">
            You must accept the Platform Participation Agreement to proceed
          </div>
        )}
        <div
          className={`flex items-start gap-3 p-4 rounded-lg border-2 ${
            has("participationAcknowledged")
              ? "bg-red-50 border-red-300"
              : formData.participationAcknowledged
                ? "bg-green-50 border-green-300"
                : "bg-white border-gray-200"
          }`}
        >
          <input
            type="checkbox"
            checked={formData.participationAcknowledged}
            onChange={(e) =>
              updateField("participationAcknowledged", e.target.checked)
            }
            className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-600 mt-0.5"
          />
          <p className="text-sm text-gray-800 leading-relaxed">
            <strong>I acknowledge and agree</strong> to the Capvista Platform
            Participation Agreement, including the issuance of 1% fully diluted
            equity to Capvista Holdings as consideration for platform access.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 10: REVIEW & SUBMIT
// ============================================================================
function Step10Review({ formData }: { formData: FormData }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary-950 mb-2">
          Review & Submit
        </h2>
        <p className="text-gray-600">
          Please review your information before submitting
        </p>
      </div>
      <div className="space-y-6">
        <div className="p-6 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">Company Identity</h3>
          <dl className="grid md:grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-gray-600">Legal Name</dt>
              <dd className="font-medium text-gray-900">
                {formData.legalName || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-600">CAC Number</dt>
              <dd className="font-medium text-gray-900">
                {formData.incorporationNumber || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-600">Country</dt>
              <dd className="font-medium text-gray-900">
                {formData.countryOfIncorporation || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-600">Incorporation Date</dt>
              <dd className="font-medium text-gray-900">
                {formData.incorporationDate || "-"}
              </dd>
            </div>
          </dl>
        </div>
        <div className="p-6 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">Team & Overview</h3>
          <dl className="grid md:grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-gray-600">Sector</dt>
              <dd className="font-medium text-gray-900">
                {formData.sector || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-600">Subsector</dt>
              <dd className="font-medium text-gray-900">
                {formData.subsector || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-600">Stage</dt>
              <dd className="font-medium text-gray-900">
                {formData.stage || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-600">Business Model</dt>
              <dd className="font-medium text-gray-900">
                {formData.businessModel || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-600">Team Size</dt>
              <dd className="font-medium text-gray-900">
                {formData.teamSize || "-"}
              </dd>
            </div>
            <div className="md:col-span-2">
              <dt className="text-gray-600">One-Line Description</dt>
              <dd className="font-medium text-gray-900">
                {formData.oneLineDescription || "-"}
              </dd>
            </div>
          </dl>
        </div>
        <div className="p-6 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">
            Fundraising Intent
          </h3>
          <dl className="grid md:grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-gray-600">Lane</dt>
              <dd className="font-medium text-gray-900">
                {formData.preferredLane || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-600">Instrument</dt>
              <dd className="font-medium text-gray-900">
                {formData.preferredInstrument || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-600">Target Raise</dt>
              <dd className="font-medium text-gray-900">
                ${formData.targetRaiseMin || "0"} - $
                {formData.targetRaiseMax || "0"}
              </dd>
            </div>
          </dl>
        </div>
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-900">
            <strong>Next Steps:</strong> After submission, our team will review
            your application. You'll receive an email with next steps.
          </p>
        </div>
      </div>
    </div>
  );
}
