"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/contexts/AuthContext";

type FormData = {
  // Step 1: Investor Profile
  investorType: string;
  firmName: string;
  aum: string;
  // Step 2: Investment Preferences
  investmentFocus: string[];
  preferredLanes: string[];
  minimumCheckSize: string;
  maximumCheckSize: string;
  // Step 3: Suitability & Experience
  riskTolerance: string;
  liquidityNeeds: string;
  investmentHorizon: string;
  generalExperience: string;
  privateMarketExperience: string;
  sourceOfFunds: string[];
  accreditationBasis: string;
  // Affiliations
  brokerAffiliated: boolean;
  brokerDetails: string;
  seniorOfficer: boolean;
  seniorOfficerCompany: string;
  // Trusted Contact
  trustedContactName: string;
  trustedContactEmail: string;
  trustedContactPhone: string;
  trustedContactRelationship: string;
  // Step 4: Identity Verification (country-aware)
  countryOfResidence: string;
  fullName: string;
  dateOfBirth: string;
  citizenship: string;
  email: string;
  phone: string;
  residentialAddress: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  // Country-specific IDs
  nin: string; // Nigeria
  bvn: string; // Nigeria
  ssn: string; // USA
  niNumber: string; // UK
  passportNumber: string; // Universal
  idType: string;
  idNumber: string;
  // Step 5: Risk Acknowledgement
  acknowledgePrivatePlacement: boolean;
  acknowledgeIlliquidity: boolean;
  acknowledgeLossRisk: boolean;
  acknowledgeNoGuarantee: boolean;
  acknowledgeAccreditedStatus: boolean;
};

const STEPS = [
  "Investor Profile",
  "Investment Preferences",
  "Suitability & Experience",
  "Identity Verification",
  "Risk Acknowledgement",
  "Review & Submit",
];

const investorTypeOptions = [
  { value: "", label: "Select investor type" },
  { value: "INDIVIDUAL", label: "Individual Investor" },
  { value: "ANGEL", label: "Angel Investor" },
  { value: "FAMILY_OFFICE", label: "Family Office" },
  { value: "INSTITUTIONAL", label: "Institutional Investor" },
  { value: "FUND", label: "Fund / VC" },
];

const sectorOptions = [
  { value: "FINTECH", label: "FinTech" },
  { value: "LOGISTICS", label: "Logistics & Mobility" },
  { value: "ENERGY", label: "Energy & Utilities" },
  { value: "CONSUMER_FMCG", label: "Consumer / FMCG" },
  { value: "HEALTH", label: "Health & Biotech" },
  { value: "AGRI_FOOD", label: "Agri / Food" },
  { value: "REAL_ESTATE", label: "Real Estate" },
  { value: "INFRASTRUCTURE", label: "Infrastructure" },
  { value: "SAAS_TECH", label: "SaaS / Tech" },
  { value: "TECHNOLOGY", label: "Technology" },
  { value: "MANUFACTURING", label: "Manufacturing" },
];

const laneOptions = [
  {
    value: "YIELD",
    label: "Revenue/asset-backed instruments with predictable returns",
  },
  { value: "VENTURES", label: "Equity-based instruments with growth upside" },
];

const aumOptions = [
  { value: "", label: "Select range" },
  { value: "under_100k", label: "Under $100,000" },
  { value: "100k_500k", label: "$100,000 – $500,000" },
  { value: "500k_1m", label: "$500,000 – $1,000,000" },
  { value: "1m_5m", label: "$1,000,000 – $5,000,000" },
  { value: "5m_10m", label: "$5,000,000 – $10,000,000" },
  { value: "10m_plus", label: "$10,000,000+" },
];

const checkSizeOptions = [
  { value: "", label: "Select amount" },
  { value: "5000", label: "$5,000" },
  { value: "10000", label: "$10,000" },
  { value: "25000", label: "$25,000" },
  { value: "50000", label: "$50,000" },
  { value: "100000", label: "$100,000" },
  { value: "250000", label: "$250,000" },
  { value: "500000", label: "$500,000" },
  { value: "1000000", label: "$1,000,000+" },
];

const riskToleranceOptions = [
  { value: "", label: "Select your risk tolerance" },
  {
    value: "conservative",
    label: "Conservative — I prioritize capital preservation over returns",
  },
  {
    value: "moderate",
    label: "Moderate — I seek balanced returns with manageable risk",
  },
  {
    value: "higher",
    label:
      "Higher — I want to maximize returns and am comfortable with volatility and loss of principal",
  },
  {
    value: "aggressive",
    label:
      "Aggressive — I pursue maximum growth and accept high risk, including total loss",
  },
];

const liquidityOptions = [
  { value: "", label: "Select liquidity needs" },
  {
    value: "yes_immediate",
    label: "Yes — I may need to access these funds within 12 months",
  },
  {
    value: "yes_medium",
    label: "Possibly — I might need partial liquidity in 1–3 years",
  },
  {
    value: "no",
    label:
      "No — I don't anticipate needing to quickly turn this investment into cash",
  },
];

const horizonOptions = [
  { value: "", label: "Select investment horizon" },
  { value: "short", label: "Short-term — Less than 2 years" },
  { value: "medium", label: "Medium-term — 2–5 years" },
  {
    value: "long",
    label: "Long-term — 5+ years, I can hold for multiple years",
  },
  {
    value: "no_preference",
    label: "No preference — Depends on the opportunity",
  },
];

const experienceOptions = [
  { value: "", label: "Select experience level" },
  { value: "none", label: "None — I'm new to investing" },
  {
    value: "limited",
    label: "Limited — I have some experience with public markets",
  },
  {
    value: "moderate",
    label: "Moderate — I actively invest and understand risk/return",
  },
  {
    value: "extensive",
    label:
      "Extensive — I have years of investment experience across multiple asset classes",
  },
];

const privateExperienceOptions = [
  { value: "", label: "Select private market experience" },
  {
    value: "none",
    label: "None — This would be my first private market investment",
  },
  {
    value: "some",
    label: "Some — I've made 1–3 private investments (LP, VC, angel)",
  },
  {
    value: "experienced",
    label: "Experienced — I've made 4–10 private investments",
  },
  {
    value: "very_experienced",
    label: "Very experienced — 10+ private investments",
  },
];

const sourceOfFundsOptions = [
  { value: "earnings", label: "Income from earnings / salary" },
  { value: "business", label: "Business ownership / profits" },
  { value: "investments", label: "Investment returns / dividends" },
  { value: "inheritance", label: "Inheritance" },
  { value: "savings", label: "Personal savings" },
  { value: "pension", label: "Pension / retirement funds" },
  { value: "property", label: "Property sale" },
  { value: "other", label: "Other" },
];

const accreditationOptions = [
  { value: "", label: "Select basis for accreditation" },
  {
    value: "income",
    label:
      "Annual income exceeds $200,000 (or $300,000 jointly) for the past 2 years",
  },
  {
    value: "net_worth",
    label: "Net worth exceeds $1,000,000 (excluding primary residence)",
  },
  {
    value: "professional",
    label: "Licensed securities professional (Series 7, 65, 82)",
  },
  { value: "entity", label: "Entity with $5M+ in assets" },
  { value: "knowledgeable", label: "Knowledgeable employee of a private fund" },
  {
    value: "not_accredited",
    label: "I do not meet accredited investor criteria",
  },
  {
    value: "non_us",
    label: "Non-US investor — accreditation criteria varies by jurisdiction",
  },
];

// Country groupings for KYC
type CountryRegion = "nigeria" | "us" | "uk" | "eu" | "africa_other" | "other";

const countryOptions = [
  { value: "Nigeria", region: "nigeria" as CountryRegion, label: "Nigeria" },
  {
    value: "United States",
    region: "us" as CountryRegion,
    label: "United States",
  },
  {
    value: "United Kingdom",
    region: "uk" as CountryRegion,
    label: "United Kingdom",
  },
  { value: "Ghana", region: "africa_other" as CountryRegion, label: "Ghana" },
  { value: "Kenya", region: "africa_other" as CountryRegion, label: "Kenya" },
  {
    value: "South Africa",
    region: "africa_other" as CountryRegion,
    label: "South Africa",
  },
  { value: "Rwanda", region: "africa_other" as CountryRegion, label: "Rwanda" },
  { value: "Egypt", region: "africa_other" as CountryRegion, label: "Egypt" },
  {
    value: "Tanzania",
    region: "africa_other" as CountryRegion,
    label: "Tanzania",
  },
  { value: "Uganda", region: "africa_other" as CountryRegion, label: "Uganda" },
  {
    value: "Ethiopia",
    region: "africa_other" as CountryRegion,
    label: "Ethiopia",
  },
  {
    value: "Senegal",
    region: "africa_other" as CountryRegion,
    label: "Senegal",
  },
  {
    value: "Morocco",
    region: "africa_other" as CountryRegion,
    label: "Morocco",
  },
  {
    value: "Mauritius",
    region: "africa_other" as CountryRegion,
    label: "Mauritius",
  },
  { value: "Germany", region: "eu" as CountryRegion, label: "Germany" },
  { value: "France", region: "eu" as CountryRegion, label: "France" },
  { value: "Netherlands", region: "eu" as CountryRegion, label: "Netherlands" },
  { value: "Canada", region: "other" as CountryRegion, label: "Canada" },
  {
    value: "UAE",
    region: "other" as CountryRegion,
    label: "United Arab Emirates",
  },
  { value: "Singapore", region: "other" as CountryRegion, label: "Singapore" },
  { value: "India", region: "other" as CountryRegion, label: "India" },
  { value: "Australia", region: "other" as CountryRegion, label: "Australia" },
  { value: "Other", region: "other" as CountryRegion, label: "Other" },
];

function getRegion(country: string): CountryRegion {
  const found = countryOptions.find((c) => c.value === country);
  return found?.region || "other";
}

const idTypesByRegion: Record<
  CountryRegion,
  { value: string; label: string }[]
> = {
  nigeria: [
    { value: "NATIONAL_ID", label: "National ID Card (NIMC)" },
    { value: "PASSPORT", label: "International Passport" },
    { value: "DRIVERS_LICENSE", label: "Driver's License" },
    { value: "VOTERS_CARD", label: "Voter's Card" },
  ],
  us: [
    { value: "DRIVERS_LICENSE", label: "Driver's License" },
    { value: "PASSPORT", label: "US Passport" },
    { value: "STATE_ID", label: "State ID Card" },
  ],
  uk: [
    { value: "PASSPORT", label: "UK Passport" },
    { value: "DRIVERS_LICENSE", label: "UK Driving Licence" },
    { value: "BRP", label: "Biometric Residence Permit" },
  ],
  eu: [
    { value: "NATIONAL_ID", label: "National ID Card" },
    { value: "PASSPORT", label: "Passport" },
    { value: "DRIVERS_LICENSE", label: "Driving Licence" },
  ],
  africa_other: [
    { value: "NATIONAL_ID", label: "National ID Card" },
    { value: "PASSPORT", label: "International Passport" },
    { value: "DRIVERS_LICENSE", label: "Driver's License" },
  ],
  other: [
    { value: "PASSPORT", label: "Passport" },
    { value: "NATIONAL_ID", label: "National ID Card" },
    { value: "DRIVERS_LICENSE", label: "Driver's License" },
  ],
};

export default function InvestorOnboarding() {
  const router = useRouter();
  const { user, accessToken, loading } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  const [formData, setFormData] = useState<FormData>({
    investorType: "",
    firmName: "",
    aum: "",
    investmentFocus: [],
    preferredLanes: [],
    minimumCheckSize: "",
    maximumCheckSize: "",
    riskTolerance: "",
    liquidityNeeds: "",
    investmentHorizon: "",
    generalExperience: "",
    privateMarketExperience: "",
    sourceOfFunds: [],
    accreditationBasis: "",
    brokerAffiliated: false,
    brokerDetails: "",
    seniorOfficer: false,
    seniorOfficerCompany: "",
    trustedContactName: "",
    trustedContactEmail: "",
    trustedContactPhone: "",
    trustedContactRelationship: "",
    countryOfResidence: "Nigeria",
    fullName: "",
    dateOfBirth: "",
    citizenship: "",
    email: "",
    phone: "",
    residentialAddress: "",
    city: "",
    stateProvince: "",
    postalCode: "",
    nin: "",
    bvn: "",
    ssn: "",
    niNumber: "",
    passportNumber: "",
    idType: "",
    idNumber: "",
    acknowledgePrivatePlacement: false,
    acknowledgeIlliquidity: false,
    acknowledgeLossRisk: false,
    acknowledgeNoGuarantee: false,
    acknowledgeAccreditedStatus: false,
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        email: user.email || "",
      }));
    }
  }, [user]);

  const updateField = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setValidationErrors([]);
  };

  const toggleArrayField = (
    field: "investmentFocus" | "preferredLanes" | "sourceOfFunds",
    value: string,
  ) => {
    setFormData((prev) => {
      const current = prev[field] as string[];
      return {
        ...prev,
        [field]: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      };
    });
  };

  const nextStep = () => {
    const missing: string[] = [];

    if (currentStep === 0) {
      if (!formData.investorType) missing.push("investorType");
      if (
        ["INSTITUTIONAL", "FAMILY_OFFICE", "FUND"].includes(
          formData.investorType,
        ) &&
        !formData.firmName
      )
        missing.push("firmName");
    }
    if (currentStep === 1) {
      if (formData.investmentFocus.length === 0)
        missing.push("investmentFocus");
      if (formData.preferredLanes.length === 0) missing.push("preferredLanes");
    }
    if (currentStep === 2) {
      if (!formData.riskTolerance) missing.push("riskTolerance");
      if (!formData.generalExperience) missing.push("generalExperience");
      if (formData.sourceOfFunds.length === 0) missing.push("sourceOfFunds");
    }
    if (currentStep === 3) {
      if (!formData.fullName) missing.push("fullName");
      if (!formData.phone) missing.push("phone");
      if (!formData.dateOfBirth) missing.push("dateOfBirth");
      if (!formData.residentialAddress) missing.push("residentialAddress");
      if (!formData.city) missing.push("city");
      if (!formData.idType) missing.push("idType");
      if (!formData.idNumber) missing.push("idNumber");
      const region = getRegion(formData.countryOfResidence);
      if (region === "nigeria" && !formData.nin) missing.push("nin");
      if (region === "us" && !formData.ssn) missing.push("ssn");
    }
    if (currentStep === 4) {
      if (!formData.acknowledgePrivatePlacement)
        missing.push("acknowledgePrivatePlacement");
      if (!formData.acknowledgeIlliquidity)
        missing.push("acknowledgeIlliquidity");
      if (!formData.acknowledgeLossRisk) missing.push("acknowledgeLossRisk");
      if (!formData.acknowledgeNoGuarantee)
        missing.push("acknowledgeNoGuarantee");
      if (!formData.acknowledgeAccreditedStatus)
        missing.push("acknowledgeAccreditedStatus");
    }

    if (missing.length > 0) {
      setValidationErrors(missing);
      return;
    }
    setValidationErrors([]);
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      if (!accessToken) {
        alert("Session expired. Please log in again.");
        router.push("/login");
        return;
      }

      const payload = {
        investorType: formData.investorType,
        firmName: formData.firmName || undefined,
        aum: formData.aum ? parseFloat(formData.aum) || undefined : undefined,
        investmentFocus: formData.investmentFocus,
        preferredLanes: formData.preferredLanes,
        minimumCheckSize: formData.minimumCheckSize
          ? parseFloat(formData.minimumCheckSize)
          : undefined,
        maximumCheckSize: formData.maximumCheckSize
          ? parseFloat(formData.maximumCheckSize)
          : undefined,
        phone: formData.phone,
        riskAcknowledged: true,
      };

      const response = await fetch(
        "http://localhost:4000/api/investors/profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();
      if (result.success) {
        router.push("/dashboard/investor");
      } else {
        alert(`Error: ${result.error?.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const has = (field: string) => validationErrors.includes(field);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#F6F8FA" }}
      >
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F6F8FA" }}>
      <header className="bg-white border-b border-gray-200">
        <div className="container">
          <div className="flex items-center justify-between py-4">
            <Link
              href="/dashboard/investor"
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
              href="/dashboard/investor"
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
          {currentStep === 0 && (
            <Step1Profile
              formData={formData}
              updateField={updateField}
              has={has}
            />
          )}
          {currentStep === 1 && (
            <Step2Preferences
              formData={formData}
              updateField={updateField}
              toggleArrayField={toggleArrayField}
              has={has}
            />
          )}
          {currentStep === 2 && (
            <Step3Suitability
              formData={formData}
              updateField={updateField}
              toggleArrayField={toggleArrayField}
              has={has}
            />
          )}
          {currentStep === 3 && (
            <Step4Identity
              formData={formData}
              updateField={updateField}
              has={has}
            />
          )}
          {currentStep === 4 && (
            <Step5Risk
              formData={formData}
              updateField={updateField}
              has={has}
              validationErrors={validationErrors}
            />
          )}
          {currentStep === 5 && <Step6Review formData={formData} />}

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
                disabled={submitting}
                className="px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50"
                style={{ backgroundColor: "#C8A24D", color: "#0B1C2D" }}
              >
                {submitting ? "Submitting..." : "Complete Onboarding"}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// ============================================================================
// STEP 1: INVESTOR PROFILE
// ============================================================================
function Step1Profile({
  formData,
  updateField,
  has,
}: {
  formData: FormData;
  updateField: (f: keyof FormData, v: any) => void;
  has: (f: string) => boolean;
}) {
  const needsFirm = ["INSTITUTIONAL", "FAMILY_OFFICE", "FUND"].includes(
    formData.investorType,
  );
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary-950 mb-2">
          Investor Profile
        </h2>
        <p className="text-gray-600">
          Tell us about yourself so we can tailor your experience
        </p>
      </div>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Investor Type <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.investorType}
            onChange={(e) => updateField("investorType", e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none ${has("investorType") ? "border-red-400 ring-2 ring-red-200" : "border-gray-300"}`}
          >
            {investorTypeOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {has("investorType") && (
            <p className="text-xs text-red-500 mt-1">
              Please select your investor type
            </p>
          )}
        </div>
        {needsFirm && (
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Firm / Organization Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.firmName}
              onChange={(e) => updateField("firmName", e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none ${has("firmName") ? "border-red-400 ring-2 ring-red-200" : "border-gray-300"}`}
              placeholder="Your firm or organization name"
            />
            {has("firmName") && (
              <p className="text-xs text-red-500 mt-1">Firm name is required</p>
            )}
          </div>
        )}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Assets Under Management (AUM)
          </label>
          <select
            value={formData.aum}
            onChange={(e) => updateField("aum", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
          >
            {aumOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            This helps us suggest appropriate deal sizes
          </p>
        </div>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Why we ask:</strong> Capvista is a private placement
            platform. We tailor deal flow and access based on your investor
            profile for regulatory compliance.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 2: INVESTMENT PREFERENCES
// ============================================================================
function Step2Preferences({
  formData,
  updateField,
  toggleArrayField,
  has,
}: {
  formData: FormData;
  updateField: (f: keyof FormData, v: any) => void;
  toggleArrayField: (
    f: "investmentFocus" | "preferredLanes" | "sourceOfFunds",
    v: string,
  ) => void;
  has: (f: string) => boolean;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary-950 mb-2">
          Investment Preferences
        </h2>
        <p className="text-gray-600">
          Select the sectors and deal types that interest you
        </p>
      </div>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Sectors of Interest <span className="text-red-500">*</span>
          </label>
          {has("investmentFocus") && (
            <p className="text-xs text-red-500 mb-2">
              Select at least one sector
            </p>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {sectorOptions.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => toggleArrayField("investmentFocus", s.value)}
                className={`px-4 py-3 rounded-lg border-2 text-sm font-medium text-left transition-all ${formData.investmentFocus.includes(s.value) ? "border-primary-950 bg-primary-950 text-white" : has("investmentFocus") ? "border-red-300 bg-red-50 text-gray-700" : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"}`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">Select all that apply</p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Preferred Investment Lanes <span className="text-red-500">*</span>
          </label>
          {has("preferredLanes") && (
            <p className="text-xs text-red-500 mb-2">
              Select at least one lane
            </p>
          )}
          <div className="space-y-3">
            {laneOptions.map((l) => (
              <button
                key={l.value}
                type="button"
                onClick={() => toggleArrayField("preferredLanes", l.value)}
                className={`w-full px-5 py-4 rounded-lg border-2 text-left transition-all ${formData.preferredLanes.includes(l.value) ? "border-primary-950 bg-primary-950/5" : has("preferredLanes") ? "border-red-300 bg-red-50" : "border-gray-200 bg-white hover:border-gray-400"}`}
              >
                <p
                  className={`font-semibold text-sm ${formData.preferredLanes.includes(l.value) ? "text-primary-950" : "text-gray-900"}`}
                >
                  {l.value === "YIELD" ? "Yield Lane" : "Ventures Lane"}
                </p>
                <p className="text-xs text-gray-600 mt-1">{l.label}</p>
              </button>
            ))}
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Minimum Check Size
            </label>
            <select
              value={formData.minimumCheckSize}
              onChange={(e) => updateField("minimumCheckSize", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
            >
              {checkSizeOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Maximum Check Size
            </label>
            <select
              value={formData.maximumCheckSize}
              onChange={(e) => updateField("maximumCheckSize", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
            >
              {checkSizeOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 3: SUITABILITY & EXPERIENCE
// ============================================================================
function Step3Suitability({
  formData,
  updateField,
  toggleArrayField,
  has,
}: {
  formData: FormData;
  updateField: (f: keyof FormData, v: any) => void;
  toggleArrayField: (
    f: "investmentFocus" | "preferredLanes" | "sourceOfFunds",
    v: string,
  ) => void;
  has: (f: string) => boolean;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary-950 mb-2">
          Suitability & Experience
        </h2>
        <p className="text-gray-600">
          Help us understand your investment experience and risk profile
        </p>
      </div>

      {/* Suitability */}
      <div className="space-y-5 p-6 bg-gray-50 rounded-lg">
        <p className="font-semibold text-gray-900">Suitability</p>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Risk Tolerance <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.riskTolerance}
            onChange={(e) => updateField("riskTolerance", e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none ${has("riskTolerance") ? "border-red-400 ring-2 ring-red-200" : "border-gray-300"}`}
          >
            {riskToleranceOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {has("riskTolerance") && (
            <p className="text-xs text-red-500 mt-1">Required</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Liquidity Needs
          </label>
          <select
            value={formData.liquidityNeeds}
            onChange={(e) => updateField("liquidityNeeds", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
          >
            {liquidityOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Investment Horizon
          </label>
          <select
            value={formData.investmentHorizon}
            onChange={(e) => updateField("investmentHorizon", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
          >
            {horizonOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            General Investment Experience{" "}
            <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.generalExperience}
            onChange={(e) => updateField("generalExperience", e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none ${has("generalExperience") ? "border-red-400 ring-2 ring-red-200" : "border-gray-300"}`}
          >
            {experienceOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {has("generalExperience") && (
            <p className="text-xs text-red-500 mt-1">Required</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Private Company Investments (LP, VC, angel)
          </label>
          <select
            value={formData.privateMarketExperience}
            onChange={(e) =>
              updateField("privateMarketExperience", e.target.value)
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
          >
            {privateExperienceOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Accreditation & Source of Funds */}
      <div className="space-y-5 p-6 bg-gray-50 rounded-lg">
        <p className="font-semibold text-gray-900">Accreditation</p>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Accreditation Basis
          </label>
          <select
            value={formData.accreditationBasis}
            onChange={(e) => updateField("accreditationBasis", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
          >
            {accreditationOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Source of Funds <span className="text-red-500">*</span>
          </label>
          {has("sourceOfFunds") && (
            <p className="text-xs text-red-500 mb-2">
              Select at least one source
            </p>
          )}
          <div className="grid grid-cols-2 gap-2">
            {sourceOfFundsOptions.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => toggleArrayField("sourceOfFunds", s.value)}
                className={`px-3 py-2.5 rounded-lg border text-xs font-medium text-left transition-all ${formData.sourceOfFunds.includes(s.value) ? "border-primary-950 bg-primary-950 text-white" : has("sourceOfFunds") ? "border-red-300 bg-red-50 text-gray-700" : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Affiliations */}
      <div className="space-y-5 p-6 bg-gray-50 rounded-lg">
        <p className="font-semibold text-gray-900">Affiliations</p>
        <div>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={formData.brokerAffiliated}
              onChange={(e) =>
                updateField("brokerAffiliated", e.target.checked)
              }
              className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-600 mt-0.5"
            />
            <div>
              <span className="text-sm font-semibold text-gray-900 block">
                Broker-dealer affiliation
              </span>
              <span className="text-xs text-gray-600">
                Are you or any immediate family member affiliated with a
                broker-dealer, stock exchange, or financial regulatory
                authority?
              </span>
            </div>
          </label>
          {formData.brokerAffiliated && (
            <input
              type="text"
              value={formData.brokerDetails}
              onChange={(e) => updateField("brokerDetails", e.target.value)}
              className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
              placeholder="Broker-dealer name and your relationship"
            />
          )}
        </div>
        <div>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={formData.seniorOfficer}
              onChange={(e) => updateField("seniorOfficer", e.target.checked)}
              className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-600 mt-0.5"
            />
            <div>
              <span className="text-sm font-semibold text-gray-900 block">
                Senior officer / director / 10%+ shareholder
              </span>
              <span className="text-xs text-gray-600">
                Are you a senior officer, director, or 10%+ shareholder of any
                private or public company?
              </span>
            </div>
          </label>
          {formData.seniorOfficer && (
            <input
              type="text"
              value={formData.seniorOfficerCompany}
              onChange={(e) =>
                updateField("seniorOfficerCompany", e.target.value)
              }
              className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
              placeholder="Company name"
            />
          )}
        </div>
      </div>

      {/* Trusted Contact */}
      <div className="space-y-4 p-6 bg-gray-50 rounded-lg">
        <div>
          <p className="font-semibold text-gray-900">Trusted Contact</p>
          <p className="text-xs text-gray-600 mt-1">
            A person we may contact in limited circumstances, such as concerns
            about your account activity. This person will not have authority
            over your account.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Name</label>
            <input
              type="text"
              value={formData.trustedContactName}
              onChange={(e) =>
                updateField("trustedContactName", e.target.value)
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
              placeholder="Full name"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Email</label>
            <input
              type="email"
              value={formData.trustedContactEmail}
              onChange={(e) =>
                updateField("trustedContactEmail", e.target.value)
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Phone</label>
            <input
              type="tel"
              value={formData.trustedContactPhone}
              onChange={(e) =>
                updateField("trustedContactPhone", e.target.value)
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
              placeholder="+234 xxx xxx xxxx"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Relationship
            </label>
            <input
              type="text"
              value={formData.trustedContactRelationship}
              onChange={(e) =>
                updateField("trustedContactRelationship", e.target.value)
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
              placeholder="e.g. Spouse, Parent, Sibling"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 4: IDENTITY VERIFICATION (Country-Aware)
// ============================================================================
function Step4Identity({
  formData,
  updateField,
  has,
}: {
  formData: FormData;
  updateField: (f: keyof FormData, v: any) => void;
  has: (f: string) => boolean;
}) {
  const region = getRegion(formData.countryOfResidence);
  const idTypes = idTypesByRegion[region];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary-950 mb-2">
          Identity Verification
        </h2>
        <p className="text-gray-600">
          Required for KYC compliance — fields adapt based on your country of
          residence
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Country selector — drives the rest */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Country of Residence <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.countryOfResidence}
            onChange={(e) => {
              updateField("countryOfResidence", e.target.value);
              updateField("idType", "");
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
          >
            {countryOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Personal Info */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Full Legal Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => updateField("fullName", e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none ${has("fullName") ? "border-red-400 ring-2 ring-red-200" : "border-gray-300"}`}
            placeholder="As it appears on your government ID"
          />
          {has("fullName") && (
            <p className="text-xs text-red-500 mt-1">Required</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => updateField("dateOfBirth", e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none ${has("dateOfBirth") ? "border-red-400 ring-2 ring-red-200" : "border-gray-300"}`}
          />
          {has("dateOfBirth") && (
            <p className="text-xs text-red-500 mt-1">Required</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Citizenship
          </label>
          <select
            value={formData.citizenship}
            onChange={(e) => updateField("citizenship", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
          >
            <option value="">Select citizenship</option>
            {countryOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            disabled
            className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none ${has("phone") ? "border-red-400 ring-2 ring-red-200" : "border-gray-300"}`}
            placeholder={
              region === "us"
                ? "(xxx) xxx-xxxx"
                : region === "uk"
                  ? "+44 xxx xxxx xxxx"
                  : "+234 xxx xxx xxxx"
            }
          />
          {has("phone") && (
            <p className="text-xs text-red-500 mt-1">Required</p>
          )}
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Residential Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.residentialAddress}
            onChange={(e) => updateField("residentialAddress", e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none ${has("residentialAddress") ? "border-red-400 ring-2 ring-red-200" : "border-gray-300"}`}
            placeholder="Street address"
          />
          {has("residentialAddress") && (
            <p className="text-xs text-red-500 mt-1">Required</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => updateField("city", e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none ${has("city") ? "border-red-400 ring-2 ring-red-200" : "border-gray-300"}`}
            placeholder="City"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            {region === "us"
              ? "State"
              : region === "uk"
                ? "County"
                : "State / Province"}
          </label>
          <input
            type="text"
            value={formData.stateProvince}
            onChange={(e) => updateField("stateProvince", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
            placeholder={
              region === "us"
                ? "e.g. California"
                : region === "uk"
                  ? "e.g. Greater London"
                  : region === "nigeria"
                    ? "e.g. Lagos"
                    : "State / Province"
            }
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            {region === "us" ? "ZIP Code" : "Postal Code"}
          </label>
          <input
            type="text"
            value={formData.postalCode}
            onChange={(e) => updateField("postalCode", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
            placeholder={
              region === "us"
                ? "e.g. 90210"
                : region === "uk"
                  ? "e.g. SW1A 1AA"
                  : "Postal code"
            }
          />
        </div>
      </div>

      {/* Country-Specific IDs */}
      <div className="space-y-4 p-6 bg-gray-50 rounded-lg">
        <p className="font-semibold text-gray-900">
          {region === "nigeria"
            ? "Nigerian Identity Documents"
            : region === "us"
              ? "US Identity Documents"
              : region === "uk"
                ? "UK Identity Documents"
                : "Identity Documents"}
        </p>

        {/* Nigeria: NIN + BVN */}
        {region === "nigeria" && (
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                National Identity Number (NIN){" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nin}
                onChange={(e) => updateField("nin", e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none ${has("nin") ? "border-red-400 ring-2 ring-red-200" : "border-gray-300"}`}
                placeholder="11-digit NIN"
                maxLength={11}
              />
              {has("nin") && (
                <p className="text-xs text-red-500 mt-1">
                  NIN is required for Nigerian residents
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Bank Verification Number (BVN)
              </label>
              <input
                type="text"
                value={formData.bvn}
                onChange={(e) => updateField("bvn", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
                placeholder="11-digit BVN"
                maxLength={11}
              />
            </div>
          </div>
        )}

        {/* USA: SSN */}
        {region === "us" && (
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Social Security Number (SSN){" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.ssn}
              onChange={(e) => updateField("ssn", e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none ${has("ssn") ? "border-red-400 ring-2 ring-red-200" : "border-gray-300"}`}
              placeholder="XXX-XX-XXXX"
              maxLength={11}
            />
            {has("ssn") && (
              <p className="text-xs text-red-500 mt-1">
                SSN is required for US residents
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Your SSN is encrypted and stored securely for tax reporting (IRS
              W-9)
            </p>
          </div>
        )}

        {/* UK: National Insurance Number */}
        {region === "uk" && (
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              National Insurance Number
            </label>
            <input
              type="text"
              value={formData.niNumber}
              onChange={(e) => updateField("niNumber", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
              placeholder="e.g. QQ 12 34 56 C"
            />
          </div>
        )}

        {/* Passport (shown for non-Nigeria/non-US as optional) */}
        {!["nigeria", "us"].includes(region) && (
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Passport Number
            </label>
            <input
              type="text"
              value={formData.passportNumber}
              onChange={(e) => updateField("passportNumber", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
              placeholder="Passport number"
            />
          </div>
        )}

        {/* Government ID (universal) */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Government ID Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.idType}
              onChange={(e) => updateField("idType", e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none ${has("idType") ? "border-red-400 ring-2 ring-red-200" : "border-gray-300"}`}
            >
              <option value="">Select ID type</option>
              {idTypes.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            {has("idType") && (
              <p className="text-xs text-red-500 mt-1">Required</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              ID Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.idNumber}
              onChange={(e) => updateField("idNumber", e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none ${has("idNumber") ? "border-red-400 ring-2 ring-red-200" : "border-gray-300"}`}
              placeholder="ID document number"
            />
            {has("idNumber") && (
              <p className="text-xs text-red-500 mt-1">Required</p>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>Privacy & Security:</strong> All identity information is
          encrypted at rest and in transit. We use this data solely for KYC/AML
          compliance and will never sell or share it with unauthorized third
          parties.
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 5: RISK ACKNOWLEDGEMENT
// ============================================================================
function Step5Risk({
  formData,
  updateField,
  has,
  validationErrors,
}: {
  formData: FormData;
  updateField: (f: keyof FormData, v: any) => void;
  has: (f: string) => boolean;
  validationErrors: string[];
}) {
  const items = [
    {
      field: "acknowledgePrivatePlacement" as keyof FormData,
      title: "Private placement investments",
      desc: "I understand that investments on Capvista are private placements and are not registered with any securities regulatory authority.",
    },
    {
      field: "acknowledgeIlliquidity" as keyof FormData,
      title: "Illiquidity risk",
      desc: "I understand that private market investments are illiquid. I may not be able to sell or transfer my investment for an extended period.",
    },
    {
      field: "acknowledgeLossRisk" as keyof FormData,
      title: "Risk of total loss",
      desc: "I understand that investing in private companies carries significant risk, including the potential for total loss of invested capital.",
    },
    {
      field: "acknowledgeNoGuarantee" as keyof FormData,
      title: "No guaranteed returns",
      desc: "I understand that Capvista does not guarantee any returns. All projected returns are estimates and actual performance may differ materially.",
    },
    {
      field: "acknowledgeAccreditedStatus" as keyof FormData,
      title: "Investor qualification",
      desc: "I confirm that I meet the qualifications of a sophisticated/accredited investor as defined by applicable securities regulations in my jurisdiction.",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary-950 mb-2">
          Risk Acknowledgement
        </h2>
        <p className="text-gray-600">
          Please read and acknowledge each statement before proceeding
        </p>
      </div>
      <div className="space-y-4 p-6 bg-gray-50 rounded-lg">
        {validationErrors.length > 0 && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
            You must accept all acknowledgements to proceed
          </div>
        )}
        {items.map(({ field, title, desc }) => (
          <div
            key={field}
            className={`flex items-start gap-3 p-4 rounded-lg transition-all ${has(field) ? "bg-red-50 border border-red-300" : formData[field] ? "bg-green-50 border border-green-200" : "bg-white border border-gray-200"}`}
          >
            <input
              type="checkbox"
              checked={formData[field] as boolean}
              onChange={(e) => updateField(field, e.target.checked)}
              className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-600 mt-1 shrink-0"
            />
            <div>
              <p className="text-sm font-semibold text-gray-900">{title}</p>
              <p className="text-xs text-gray-600 mt-1">{desc}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-900">
          <strong>Important:</strong> Your accreditation status will be reviewed
          by our compliance team. You can browse companies immediately while
          review is pending.
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 6: REVIEW & SUBMIT
// ============================================================================
function Step6Review({ formData }: { formData: FormData }) {
  const labels: Record<string, string> = {
    INDIVIDUAL: "Individual Investor",
    ANGEL: "Angel Investor",
    FAMILY_OFFICE: "Family Office",
    INSTITUTIONAL: "Institutional",
    FUND: "Fund / VC",
    FINTECH: "FinTech",
    LOGISTICS: "Logistics",
    ENERGY: "Energy",
    CONSUMER_FMCG: "Consumer/FMCG",
    HEALTH: "Health",
    AGRI_FOOD: "Agri/Food",
    REAL_ESTATE: "Real Estate",
    INFRASTRUCTURE: "Infrastructure",
    SAAS_TECH: "SaaS/Tech",
    TECHNOLOGY: "Technology",
    MANUFACTURING: "Manufacturing",
    conservative: "Conservative",
    moderate: "Moderate",
    higher: "Higher",
    aggressive: "Aggressive",
    none: "None",
    limited: "Limited",
    extensive: "Extensive",
    some: "Some",
    experienced: "Experienced",
    very_experienced: "Very experienced",
  };
  const region = getRegion(formData.countryOfResidence);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary-950 mb-2">
          Review & Submit
        </h2>
        <p className="text-gray-600">
          Review your information before completing onboarding
        </p>
      </div>

      <div className="p-6 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-3">Investor Profile</h3>
        <dl className="grid md:grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-gray-600">Type</dt>
            <dd className="font-medium text-gray-900">
              {labels[formData.investorType] || "-"}
            </dd>
          </div>
          {formData.firmName && (
            <div>
              <dt className="text-gray-600">Firm</dt>
              <dd className="font-medium text-gray-900">{formData.firmName}</dd>
            </div>
          )}
          <div>
            <dt className="text-gray-600">Risk Tolerance</dt>
            <dd className="font-medium text-gray-900">
              {labels[formData.riskTolerance] || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-gray-600">Experience</dt>
            <dd className="font-medium text-gray-900">
              {labels[formData.generalExperience] || "-"}
            </dd>
          </div>
        </dl>
      </div>

      <div className="p-6 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-3">
          Investment Preferences
        </h3>
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-gray-600">Sectors</dt>
            <dd className="flex flex-wrap gap-2 mt-1">
              {formData.investmentFocus.map((s) => (
                <span
                  key={s}
                  className="px-2 py-1 bg-white border border-gray-200 rounded text-xs"
                >
                  {labels[s] || s}
                </span>
              ))}
            </dd>
          </div>
          <div>
            <dt className="text-gray-600">Lanes</dt>
            <dd className="flex flex-wrap gap-2 mt-1">
              {formData.preferredLanes.map((l) => (
                <span
                  key={l}
                  className="px-2 py-1 bg-white border border-gray-200 rounded text-xs"
                >
                  {l === "YIELD" ? "Yield" : "Ventures"}
                </span>
              ))}
            </dd>
          </div>
          {(formData.minimumCheckSize || formData.maximumCheckSize) && (
            <div>
              <dt className="text-gray-600">Check Size</dt>
              <dd className="font-medium text-gray-900">
                {formData.minimumCheckSize
                  ? `$${Number(formData.minimumCheckSize).toLocaleString()}`
                  : "—"}{" "}
                –{" "}
                {formData.maximumCheckSize
                  ? `$${Number(formData.maximumCheckSize).toLocaleString()}`
                  : "—"}
              </dd>
            </div>
          )}
        </dl>
      </div>

      <div className="p-6 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-3">
          Identity ({formData.countryOfResidence})
        </h3>
        <dl className="grid md:grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-gray-600">Name</dt>
            <dd className="font-medium text-gray-900">
              {formData.fullName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-gray-600">Date of Birth</dt>
            <dd className="font-medium text-gray-900">
              {formData.dateOfBirth || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-gray-600">Phone</dt>
            <dd className="font-medium text-gray-900">
              {formData.phone || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-gray-600">City</dt>
            <dd className="font-medium text-gray-900">
              {formData.city || "-"}
            </dd>
          </div>
          {region === "nigeria" && (
            <div>
              <dt className="text-gray-600">NIN</dt>
              <dd className="font-medium text-gray-900">
                {formData.nin ? "***" + formData.nin.slice(-4) : "-"}
              </dd>
            </div>
          )}
          {region === "us" && (
            <div>
              <dt className="text-gray-600">SSN</dt>
              <dd className="font-medium text-gray-900">
                {formData.ssn ? "***-**-" + formData.ssn.slice(-4) : "-"}
              </dd>
            </div>
          )}
          {region === "uk" && formData.niNumber && (
            <div>
              <dt className="text-gray-600">NI Number</dt>
              <dd className="font-medium text-gray-900">
                {formData.niNumber ? "**" + formData.niNumber.slice(-4) : "-"}
              </dd>
            </div>
          )}
          <div>
            <dt className="text-gray-600">ID Type</dt>
            <dd className="font-medium text-gray-900">
              {formData.idType || "-"}
            </dd>
          </div>
        </dl>
      </div>

      <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-green-600 text-xl mt-0.5">✓</span>
          <div>
            <p className="text-sm font-semibold text-green-900">
              All risk acknowledgements accepted
            </p>
            <p className="text-xs text-green-700 mt-1">
              Your accreditation will be reviewed by compliance. You can browse
              companies immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
