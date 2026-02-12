"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

type FormData = {
  // 1️⃣ Company Identity
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

  // 2️⃣ Team & Overview
  teamSize: string;
  oneLineDescription: string;
  detailedDescription: string;
  sector: string;
  businessModel: string;
  stage: string;
  founderLinkedIn: string;
  yearsExperience: string;
  keyExecutives: string;

  // 3️⃣ Traction
  revenueStatus: string;
  revenueRange: string;
  revenueType: string;
  topMetric1: string;
  topMetric2: string;
  topMetric3: string;
  majorCustomers: string;
  geographicFootprint: string;

  // 4️⃣ Capital & History
  hasRaisedBefore: boolean;
  previousRaises: string;
  founderOwnedPercent: string;
  externalInvestorsPercent: string;
  esopPercent: string;
  existingDebt: string;
  convertibleInstruments: string;
  investorSideLetters: string;

  // 5️⃣ Risks
  topRisk1: string;
  topRisk2: string;
  topRisk3: string;
  regulationDependent: boolean;
  regulatoryDependencies: string;
  fxExposure: boolean;
  singleSupplier: boolean;
  keyConcentrationRisk: string;

  // 6️⃣ Fundraising Intent
  preferredLane: string;
  preferredInstrument: string;
  targetRaiseMin: string;
  targetRaiseMax: string;
  primaryUseOfFunds: string;
  proposedValuation: string;
  proposedRevenueShare: string;
  deploymentTimeline: string;

  // 7️⃣ Legal Representations
  acknowledgePlacement: boolean;
  acknowledgeNoSolicitation: boolean;
  acknowledgeAccuracy: boolean;
  acknowledgeEquity: boolean;
  acknowledgeNoGuarantee: boolean;
};

const STEPS = [
  "Company Identity",
  "Team & Overview",
  "Traction",
  "Capital & History",
  "Risks",
  "Fundraising Intent",
  "Legal Representations",
  "Review & Submit",
];

export default function CompanyOnboarding() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
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
    businessModel: "",
    stage: "",
    founderLinkedIn: "",
    yearsExperience: "",
    keyExecutives: "",
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
  });

  const updateField = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
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
      // Get auth token
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        alert("You must be logged in to submit");
        return;
      }

      // Format data for API
      const payload = {
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
      };

      const response = await fetch("http://localhost:4000/api/companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        alert("Company submitted successfully! 🎉");
        router.push("/dashboard/founder");
      } else {
        alert(`Error: ${result.error.message}`);
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to submit company. Please try again.");
    }
  };

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
              Save & Exit
            </Link>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
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
                        index < currentStep ? "bg-primary-950" : "bg-gray-200"
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

      {/* Form Content */}
      <main className="container py-8">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {currentStep === 0 && (
            <Step1Identity formData={formData} updateField={updateField} />
          )}
          {currentStep === 1 && (
            <Step2Team formData={formData} updateField={updateField} />
          )}
          {currentStep === 2 && (
            <Step3Traction formData={formData} updateField={updateField} />
          )}
          {currentStep === 3 && (
            <Step4Capital formData={formData} updateField={updateField} />
          )}
          {currentStep === 4 && (
            <Step5Risks formData={formData} updateField={updateField} />
          )}
          {currentStep === 5 && (
            <Step6Fundraising formData={formData} updateField={updateField} />
          )}
          {currentStep === 6 && (
            <Step7Legal formData={formData} updateField={updateField} />
          )}
          {currentStep === 7 && <Step8Review formData={formData} />}

          {/* Navigation Buttons */}
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
// STEP 1: COMPANY IDENTITY
// ============================================================================
function Step1Identity({
  formData,
  updateField,
}: {
  formData: FormData;
  updateField: (field: keyof FormData, value: any) => void;
}) {
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
            Legal Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.legalName}
            onChange={(e) => updateField("legalName", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
            placeholder="As registered with CAC"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
            placeholder="DBA or brand name"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            CAC Registration Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.incorporationNumber}
            onChange={(e) => updateField("incorporationNumber", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
            placeholder="RC123456"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Incorporation Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            required
            value={formData.incorporationDate}
            onChange={(e) => updateField("incorporationDate", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Country of Incorporation <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={formData.countryOfIncorporation}
            onChange={(e) =>
              updateField("countryOfIncorporation", e.target.value)
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
          >
            <option value="Nigeria">Nigeria</option>
            <option value="Kenya">Kenya</option>
            <option value="Ghana">Ghana</option>
            <option value="South Africa">South Africa</option>
            <option value="Egypt">Egypt</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Operating Countries <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.operatingCountries.join(", ")}
            onChange={(e) =>
              updateField(
                "operatingCountries",
                e.target.value.split(",").map((s) => s.trim()),
              )
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
            placeholder="Nigeria, Ghana, Kenya"
          />
          <p className="text-xs text-gray-500 mt-1">
            Separate multiple countries with commas
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Company Address <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            value={formData.companyAddress}
            onChange={(e) => updateField("companyAddress", e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
            placeholder="Full registered address"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
            placeholder="https://yourcompany.com"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Official Email Domain <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.officialEmailDomain}
            onChange={(e) => updateField("officialEmailDomain", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
            placeholder="company.com"
          />
          <p className="text-xs text-gray-500 mt-1">
            Domain for official communications
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Regulatory Licenses (if applicable)
          </label>
          <textarea
            value={formData.regulatoryLicenses}
            onChange={(e) => updateField("regulatoryLicenses", e.target.value)}
            rows={2}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
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
function Step2Team({
  formData,
  updateField,
}: {
  formData: FormData;
  updateField: (field: keyof FormData, value: any) => void;
}) {
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
          <select
            required
            value={formData.teamSize}
            onChange={(e) => updateField("teamSize", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
          >
            <option value="">Select team size</option>
            <option value="founders_only">Founders only</option>
            <option value="1-5">1-5 employees</option>
            <option value="6-20">6-20 employees</option>
            <option value="21-50">21-50 employees</option>
            <option value="50+">50+ employees</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Stage <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={formData.stage}
            onChange={(e) => updateField("stage", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
          >
            <option value="">Select stage</option>
            <option value="PRE_REVENUE">Pre-revenue</option>
            <option value="EARLY_REVENUE">Early revenue</option>
            <option value="GROWTH">Growth</option>
            <option value="PROFITABLE">Profitable</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            One-Line Description <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={200}
            value={formData.oneLineDescription}
            onChange={(e) => updateField("oneLineDescription", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
            placeholder="Describe your company in one sentence (max 200 characters)"
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.oneLineDescription.length}/200 characters
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Detailed Description <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            maxLength={1000}
            value={formData.detailedDescription}
            onChange={(e) => updateField("detailedDescription", e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
            placeholder="What does your company do? What problem do you solve? (max 1000 characters)"
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.detailedDescription.length}/1000 characters
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Sector <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={formData.sector}
            onChange={(e) => updateField("sector", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
          >
            <option value="">Select sector</option>
            <option value="FINTECH">Fintech</option>
            <option value="LOGISTICS">Logistics</option>
            <option value="ENERGY">Energy</option>
            <option value="CONSUMER_FMCG">Consumer / FMCG</option>
            <option value="HEALTH">Health</option>
            <option value="AGRI_FOOD">Agri / Food</option>
            <option value="REAL_ESTATE">Real Estate</option>
            <option value="INFRASTRUCTURE">Infrastructure</option>
            <option value="SAAS_TECH">SaaS / Tech</option>
            <option value="MANUFACTURING">Manufacturing</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Business Model <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={formData.businessModel}
            onChange={(e) => updateField("businessModel", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
          >
            <option value="">Select business model</option>
            <option value="B2B">B2B</option>
            <option value="B2C">B2C</option>
            <option value="B2B2C">B2B2C</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Founder LinkedIn
          </label>
          <input
            type="url"
            value={formData.founderLinkedIn}
            onChange={(e) => updateField("founderLinkedIn", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
            placeholder="https://linkedin.com/in/yourprofile"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Years of Relevant Experience
          </label>
          <input
            type="number"
            min="0"
            value={formData.yearsExperience}
            onChange={(e) => updateField("yearsExperience", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
            placeholder="Years in this industry"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Key Executive Roles (if any)
          </label>
          <input
            type="text"
            value={formData.keyExecutives}
            onChange={(e) => updateField("keyExecutives", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
            placeholder="e.g., CTO from Google, CFO from Stripe"
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 3: TRACTION
// ============================================================================
function Step3Traction({
  formData,
  updateField,
}: {
  formData: FormData;
  updateField: (field: keyof FormData, value: any) => void;
}) {
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
          <select
            required
            value={formData.revenueStatus}
            onChange={(e) => updateField("revenueStatus", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
          >
            <option value="">Select revenue status</option>
            <option value="no_revenue">No revenue</option>
            <option value="monthly">Monthly revenue</option>
            <option value="annual">Annual revenue</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Revenue Range (if applicable)
          </label>
          <select
            value={formData.revenueRange}
            onChange={(e) => updateField("revenueRange", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
            disabled={formData.revenueStatus === "no_revenue"}
          >
            <option value="">Select range</option>
            <option value="0-50k">$0 - $50k</option>
            <option value="50k-200k">$50k - $200k</option>
            <option value="200k-500k">$200k - $500k</option>
            <option value="500k-1m">$500k - $1M</option>
            <option value="1m-5m">$1M - $5M</option>
            <option value="5m+">$5M+</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Revenue Type
          </label>
          <select
            value={formData.revenueType}
            onChange={(e) => updateField("revenueType", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
          >
            <option value="">Select revenue type</option>
            <option value="contracts">Contracts</option>
            <option value="consumers">Consumers</option>
            <option value="assets">Assets</option>
            <option value="subscription">Subscription</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Top 3 Metrics <span className="text-red-500">*</span>
          </label>
          <p className="text-sm text-gray-600 mb-3">
            What are your key performance indicators?
          </p>

          <div className="space-y-3">
            <input
              type="text"
              required
              value={formData.topMetric1}
              onChange={(e) => updateField("topMetric1", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
              placeholder="Metric 1: e.g., 10,000 active users"
            />
            <input
              type="text"
              required
              value={formData.topMetric2}
              onChange={(e) => updateField("topMetric2", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
              placeholder="Metric 2: e.g., 25% MoM growth"
            />
            <input
              type="text"
              required
              value={formData.topMetric3}
              onChange={(e) => updateField("topMetric3", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
              placeholder="Metric 3: e.g., $500k ARR"
            />
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
            placeholder="e.g., Lagos, Abuja, Accra"
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 4: CAPITAL & HISTORY
// ============================================================================
function Step4Capital({
  formData,
  updateField,
}: {
  formData: FormData;
  updateField: (field: keyof FormData, value: any) => void;
}) {
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
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
                required
                min="0"
                max="100"
                step="0.01"
                value={formData.founderOwnedPercent}
                onChange={(e) =>
                  updateField("founderOwnedPercent", e.target.value)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
                placeholder="75"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                External Investors %
              </label>
              <input
                type="number"
                required
                min="0"
                max="100"
                step="0.01"
                value={formData.externalInvestorsPercent}
                onChange={(e) =>
                  updateField("externalInvestorsPercent", e.target.value)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
                placeholder="20"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
            placeholder="Any special agreements with existing investors? Leave blank if none."
          />
        </div>
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
}: {
  formData: FormData;
  updateField: (field: keyof FormData, value: any) => void;
}) {
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
                required
                value={formData.topRisk1}
                onChange={(e) => updateField("topRisk1", e.target.value)}
                rows={2}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
                placeholder="Describe your biggest risk"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Risk 2</label>
              <textarea
                required
                value={formData.topRisk2}
                onChange={(e) => updateField("topRisk2", e.target.value)}
                rows={2}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
                placeholder="Describe your second biggest risk"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Risk 3</label>
              <textarea
                required
                value={formData.topRisk3}
                onChange={(e) => updateField("topRisk3", e.target.value)}
                rows={2}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
                placeholder="Describe your third biggest risk"
              />
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
            placeholder="If yes, explain. If no, write 'No concentration risk'."
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 6: FUNDRAISING INTENT
// ============================================================================
function Step6Fundraising({
  formData,
  updateField,
}: {
  formData: FormData;
  updateField: (field: keyof FormData, value: any) => void;
}) {
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
          <select
            required
            value={formData.preferredLane}
            onChange={(e) => updateField("preferredLane", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
          >
            <option value="">Select lane</option>
            <option value="YIELD">Yield (Revenue/Asset-based)</option>
            <option value="VENTURES">Ventures (Equity)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Preferred Instrument <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={formData.preferredInstrument}
            onChange={(e) => updateField("preferredInstrument", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
          >
            <option value="">Select instrument</option>
            <optgroup label="Yield Lane">
              <option value="REVENUE_SHARE_NOTE">Revenue Share Note</option>
              <option value="ASSET_BACKED_PARTICIPATION">
                Asset-Backed Participation
              </option>
            </optgroup>
            <optgroup label="Ventures Lane">
              <option value="CONVERTIBLE_NOTE">Convertible Note</option>
              <option value="SAFE">SAFE</option>
              <option value="SPV_EQUITY">SPV Equity</option>
            </optgroup>
          </select>
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
                required
                min="0"
                value={formData.targetRaiseMin}
                onChange={(e) => updateField("targetRaiseMin", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
                placeholder="100000"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Maximum ($)
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.targetRaiseMax}
                onChange={(e) => updateField("targetRaiseMax", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
                placeholder="500000"
              />
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Primary Use of Funds <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            value={formData.primaryUseOfFunds}
            onChange={(e) => updateField("primaryUseOfFunds", e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
            placeholder="How will you deploy the capital? Be specific."
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
              placeholder="e.g., 5% of monthly revenue until 2x return"
            />
          </div>
        )}

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Expected Timeline to Deploy Funds
          </label>
          <select
            value={formData.deploymentTimeline}
            onChange={(e) => updateField("deploymentTimeline", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
          >
            <option value="">Select timeline</option>
            <option value="immediate">Immediate (1-3 months)</option>
            <option value="short">Short-term (3-6 months)</option>
            <option value="medium">Medium-term (6-12 months)</option>
            <option value="long">Long-term (12+ months)</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 7: LEGAL REPRESENTATIONS
// ============================================================================
function Step7Legal({
  formData,
  updateField,
}: {
  formData: FormData;
  updateField: (field: keyof FormData, value: any) => void;
}) {
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
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            required
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

        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            required
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

        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            required
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

        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            required
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

        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            required
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
// STEP 8: REVIEW & SUBMIT
// ============================================================================
function Step8Review({ formData }: { formData: FormData }) {
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
        {/* Company Identity */}
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

        {/* Team & Overview */}
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

        {/* Fundraising */}
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
            your application. You'll receive an email within 5-7 business days
            with next steps.
          </p>
        </div>
      </div>
    </div>
  );
}
