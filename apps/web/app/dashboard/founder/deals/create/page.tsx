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

type Company = {
  id: string;
  legalName: string;
  tradingName?: string;
  preferredLane?: string;
  approvalStatus: string;
};

type FormData = {
  companyId: string;
  dealName: string;
  lane: string;
  instrumentType: string;
  targetAmount: string;
  minimumInvestment: string;
  duration: string;
  // Revenue Share Note
  revenueSharePercentage: string;
  repaymentCap: string;
  paymentFrequency: string;
  // Asset-Backed Participation
  assetDescription: string;
  expectedYield: string;
  collateralDetails: string;
  // Convertible Note
  interestRate: string;
  maturityDate: string;
  conversionDiscount: string;
  valuationCap: string;
  // SAFE
  safeValuationCap: string;
  safeDiscountRate: string;
  mfnClause: boolean;
  // SPV Equity
  pricePerShare: string;
  equityPercentageOffered: string;
  spvJurisdiction: string;
  // Documents
  pitchDeckFile: File | null;
  financialDocsFile: File | null;
  termSheetFile: File | null;
};

const STEPS = ["Deal Basics", "Terms & Financials", "Documents & Review"];

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

const paymentFrequencyOptions = [
  { value: "", label: "Select frequency" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
];

const instrumentLabels: Record<string, string> = {
  REVENUE_SHARE_NOTE: "Revenue Share Note",
  ASSET_BACKED_PARTICIPATION: "Asset-Backed Participation",
  CONVERTIBLE_NOTE: "Convertible Note",
  SAFE: "SAFE",
  SPV_EQUITY: "SPV Equity",
};

// ============================================================================
// VALIDATION
// ============================================================================
function validateStep(step: number, formData: FormData): string[] {
  const errors: string[] = [];

  switch (step) {
    case 0: // Deal Basics
      if (!formData.companyId) errors.push("companyId");
      if (!formData.dealName.trim()) errors.push("dealName");
      if (!formData.lane) errors.push("lane");
      if (!formData.instrumentType) errors.push("instrumentType");
      break;

    case 1: // Terms & Financials
      if (!formData.targetAmount || parseFloat(formData.targetAmount) <= 0)
        errors.push("targetAmount");
      if (
        !formData.minimumInvestment ||
        parseFloat(formData.minimumInvestment) <= 0
      )
        errors.push("minimumInvestment");
      if (!formData.duration || parseInt(formData.duration) <= 0)
        errors.push("duration");

      // Instrument-specific validation
      if (formData.instrumentType === "REVENUE_SHARE_NOTE") {
        if (!formData.revenueSharePercentage)
          errors.push("revenueSharePercentage");
        if (!formData.repaymentCap) errors.push("repaymentCap");
        if (!formData.paymentFrequency) errors.push("paymentFrequency");
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
        if (!formData.spvJurisdiction.trim()) errors.push("spvJurisdiction");
      }
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

  const [formData, setFormData] = useState<FormData>({
    companyId: "",
    dealName: "",
    lane: "",
    instrumentType: "",
    targetAmount: "",
    minimumInvestment: "",
    duration: "",
    revenueSharePercentage: "",
    repaymentCap: "",
    paymentFrequency: "",
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
    spvJurisdiction: "",
    pitchDeckFile: null,
    financialDocsFile: null,
    termSheetFile: null,
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  // Fetch approved companies
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

          // Pre-select company if companyId is in URL
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

  const updateField = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // When lane changes, clear instrument type
  const handleLaneChange = (lane: string) => {
    setFormData((prev) => ({
      ...prev,
      lane,
      instrumentType: "",
    }));
  };

  // When company changes, set lane from preferredLane
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

    switch (formData.instrumentType) {
      case "REVENUE_SHARE_NOTE":
        terms.revenueSharePercentage = parseFloat(
          formData.revenueSharePercentage,
        );
        terms.repaymentCap = parseFloat(formData.repaymentCap);
        terms.paymentFrequency = formData.paymentFrequency;
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
        terms.equityPercentageOffered = parseFloat(
          formData.equityPercentageOffered,
        );
        terms.spvJurisdiction = formData.spvJurisdiction;
        break;
    }

    return terms;
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

      // Upload documents to Supabase Storage
      let pitchDeckUrl: string | undefined;
      let financialDocsUrl: string | undefined;
      let termsSheetUrl: string | undefined;

      if (formData.pitchDeckFile) {
        pitchDeckUrl = await uploadFile(formData.pitchDeckFile, "pitch-deck");
      }
      if (formData.financialDocsFile) {
        financialDocsUrl = await uploadFile(formData.financialDocsFile, "financials");
      }
      if (formData.termSheetFile) {
        termsSheetUrl = await uploadFile(formData.termSheetFile, "term-sheet");
      }

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

      const payload = {
        companyId: formData.companyId,
        name: formData.dealName,
        lane: formData.lane,
        instrumentType: formData.instrumentType,
        targetAmount: parseFloat(formData.targetAmount),
        minimumInvestment: parseFloat(formData.minimumInvestment),
        duration: parseInt(formData.duration),
        terms: buildTerms(),
        pitchDeckUrl,
        financialDocsUrl,
        termsSheetUrl,
      };

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

  const hasErr = (field: string) => validationErrors.includes(field);

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
              Please fill in all required fields before proceeding
            </div>
          )}

          {loadingCompanies ? (
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
                <Step1Basics
                  formData={formData}
                  companyOptions={companyOptions}
                  instrumentOptions={instrumentOptions}
                  onCompanyChange={handleCompanyChange}
                  onLaneChange={handleLaneChange}
                  updateField={updateField}
                  errors={validationErrors}
                />
              )}
              {currentStep === 1 && (
                <Step2Terms
                  formData={formData}
                  updateField={updateField}
                  errors={validationErrors}
                />
              )}
              {currentStep === 2 && (
                <Step3Review
                  formData={formData}
                  companies={companies}
                  updateField={updateField}
                />
              )}

              {/* Navigation */}
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
                    {submitting ? "Creating Deal..." : "Create Deal"}
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
// STEP 1: DEAL BASICS
// ============================================================================
function Step1Basics({
  formData,
  companyOptions,
  instrumentOptions,
  onCompanyChange,
  onLaneChange,
  updateField,
  errors,
}: {
  formData: FormData;
  companyOptions: { value: string; label: string }[];
  instrumentOptions: { value: string; label: string }[];
  onCompanyChange: (id: string) => void;
  onLaneChange: (lane: string) => void;
  updateField: (field: keyof FormData, value: any) => void;
  errors: string[];
}) {
  const hasErr = (field: string) => errors.includes(field);

  return (
    <div>
      <h2 className="text-2xl font-bold text-primary-950 mb-1">
        Deal Basics
      </h2>
      <p className="text-gray-600 mb-8">
        Define the core details of your investment deal.
      </p>

      {/* Company */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Company <span className="text-red-500">*</span>
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
        <FieldError show={hasErr("lane")} message="Please select a lane" />
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
          message="Please select an instrument type"
        />
      </div>
    </div>
  );
}

// ============================================================================
// STEP 2: TERMS & FINANCIALS
// ============================================================================
function Step2Terms({
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
        Terms & Financials
      </h2>
      <p className="text-gray-600 mb-8">
        Set the financial parameters and instrument-specific terms.
      </p>

      {/* Common Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Target Raise Amount ($) <span className="text-red-500">*</span>
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
            message="Target amount is required"
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
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Duration (months) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.duration}
            onChange={(e) => updateField("duration", e.target.value)}
            className={inputClass(hasErr("duration"))}
            placeholder="e.g., 12"
            min="1"
          />
          <FieldError
            show={hasErr("duration")}
            message="Duration is required"
          />
        </div>
      </div>

      {/* Instrument-Specific Terms */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-primary-950 mb-1">
          {instrumentLabels[formData.instrumentType] || "Instrument"} Terms
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Provide the specific terms for your selected instrument.
        </p>

        {formData.instrumentType === "REVENUE_SHARE_NOTE" && (
          <RevenueShareFields
            formData={formData}
            updateField={updateField}
            hasErr={hasErr}
          />
        )}
        {formData.instrumentType === "ASSET_BACKED_PARTICIPATION" && (
          <AssetBackedFields
            formData={formData}
            updateField={updateField}
            hasErr={hasErr}
          />
        )}
        {formData.instrumentType === "CONVERTIBLE_NOTE" && (
          <ConvertibleNoteFields
            formData={formData}
            updateField={updateField}
            hasErr={hasErr}
          />
        )}
        {formData.instrumentType === "SAFE" && (
          <SafeFields
            formData={formData}
            updateField={updateField}
            hasErr={hasErr}
          />
        )}
        {formData.instrumentType === "SPV_EQUITY" && (
          <SpvEquityFields
            formData={formData}
            updateField={updateField}
            hasErr={hasErr}
          />
        )}
      </div>
    </div>
  );
}

// Instrument term field components
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
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Revenue Share Percentage (%) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={formData.revenueSharePercentage}
          onChange={(e) =>
            updateField("revenueSharePercentage", e.target.value)
          }
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
      <div>
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
          message="Payment frequency is required"
        />
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
          <FieldError
            show={hasErr("interestRate")}
            message="Interest rate is required"
          />
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
          <FieldError
            show={hasErr("maturityDate")}
            message="Maturity date is required"
          />
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
            onChange={(e) =>
              updateField("conversionDiscount", e.target.value)
            }
            className={inputClass(hasErr("conversionDiscount"))}
            placeholder="e.g., 20"
            min="0"
            max="100"
            step="0.1"
          />
          <FieldError
            show={hasErr("conversionDiscount")}
            message="Conversion discount is required"
          />
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
          <FieldError
            show={hasErr("valuationCap")}
            message="Valuation cap is required"
          />
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
            onChange={(e) =>
              updateField("safeValuationCap", e.target.value)
            }
            className={inputClass(hasErr("safeValuationCap"))}
            placeholder="e.g., 5000000"
            min="0"
          />
          <FieldError
            show={hasErr("safeValuationCap")}
            message="Valuation cap is required"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Discount Rate (%) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.safeDiscountRate}
            onChange={(e) =>
              updateField("safeDiscountRate", e.target.value)
            }
            className={inputClass(hasErr("safeDiscountRate"))}
            placeholder="e.g., 20"
            min="0"
            max="100"
            step="0.1"
          />
          <FieldError
            show={hasErr("safeDiscountRate")}
            message="Discount rate is required"
          />
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
          <FieldError
            show={hasErr("pricePerShare")}
            message="Price per share is required"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Equity % Offered <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.equityPercentageOffered}
            onChange={(e) =>
              updateField("equityPercentageOffered", e.target.value)
            }
            className={inputClass(hasErr("equityPercentageOffered"))}
            placeholder="e.g., 15"
            min="0"
            max="100"
            step="0.01"
          />
          <FieldError
            show={hasErr("equityPercentageOffered")}
            message="Equity percentage is required"
          />
        </div>
      </div>
      <div>
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
    </div>
  );
}

// ============================================================================
// STEP 3: DOCUMENTS & REVIEW
// ============================================================================
function Step3Review({
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
    if (isNaN(num)) return "—";
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
        Upload supporting documents and review your deal details before
        submission.
      </p>

      {/* Document Uploads */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-primary-950 mb-4">
          Supporting Documents
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Upload optional documents to support your deal. These will be
          available to qualified investors.
        </p>

        <div className="space-y-4">
          <FileUpload
            label="Pitch Deck"
            file={formData.pitchDeckFile}
            onChange={(f) => updateField("pitchDeckFile", f)}
            accept=".pdf,.pptx,.ppt"
          />
          <FileUpload
            label="Financial Documents"
            file={formData.financialDocsFile}
            onChange={(f) => updateField("financialDocsFile", f)}
            accept=".pdf,.xlsx,.xls,.csv"
          />
          <FileUpload
            label="Term Sheet"
            file={formData.termSheetFile}
            onChange={(f) => updateField("termSheetFile", f)}
            accept=".pdf,.docx,.doc"
          />
        </div>
      </div>

      {/* Review Summary */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-primary-950 mb-4">
          Deal Summary
        </h3>

        {/* Deal Basics */}
        <div className="bg-gray-50 rounded-xl p-5 mb-4">
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Deal Basics
          </h4>
          <div className="grid grid-cols-2 gap-y-3 text-sm">
            <span className="text-gray-600">Company</span>
            <span className="font-medium text-gray-900">
              {company?.tradingName || company?.legalName || "—"}
            </span>
            <span className="text-gray-600">Deal Name</span>
            <span className="font-medium text-gray-900">
              {formData.dealName || "—"}
            </span>
            <span className="text-gray-600">Lane</span>
            <span className="font-medium text-gray-900">{laneLabel}</span>
            <span className="text-gray-600">Instrument</span>
            <span className="font-medium text-gray-900">
              {instrumentLabel}
            </span>
          </div>
        </div>

        {/* Financials */}
        <div className="bg-gray-50 rounded-xl p-5 mb-4">
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Financials
          </h4>
          <div className="grid grid-cols-2 gap-y-3 text-sm">
            <span className="text-gray-600">Target Raise</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(formData.targetAmount)}
            </span>
            <span className="text-gray-600">Minimum Investment</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(formData.minimumInvestment)}
            </span>
            <span className="text-gray-600">Duration</span>
            <span className="font-medium text-gray-900">
              {formData.duration ? `${formData.duration} months` : "—"}
            </span>
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
                  {formData.revenueSharePercentage
                    ? `${formData.revenueSharePercentage}%`
                    : "—"}
                </span>
                <span className="text-gray-600">Repayment Cap</span>
                <span className="font-medium text-gray-900">
                  {formData.repaymentCap
                    ? `${formData.repaymentCap}x`
                    : "—"}
                </span>
                <span className="text-gray-600">Payment Frequency</span>
                <span className="font-medium text-gray-900 capitalize">
                  {formData.paymentFrequency || "—"}
                </span>
              </>
            )}
            {formData.instrumentType === "ASSET_BACKED_PARTICIPATION" && (
              <>
                <span className="text-gray-600">Asset Description</span>
                <span className="font-medium text-gray-900">
                  {formData.assetDescription || "—"}
                </span>
                <span className="text-gray-600">Expected Yield</span>
                <span className="font-medium text-gray-900">
                  {formData.expectedYield
                    ? `${formData.expectedYield}%`
                    : "—"}
                </span>
                <span className="text-gray-600">Collateral</span>
                <span className="font-medium text-gray-900">
                  {formData.collateralDetails || "—"}
                </span>
              </>
            )}
            {formData.instrumentType === "CONVERTIBLE_NOTE" && (
              <>
                <span className="text-gray-600">Interest Rate</span>
                <span className="font-medium text-gray-900">
                  {formData.interestRate
                    ? `${formData.interestRate}%`
                    : "—"}
                </span>
                <span className="text-gray-600">Maturity Date</span>
                <span className="font-medium text-gray-900">
                  {formData.maturityDate || "—"}
                </span>
                <span className="text-gray-600">Conversion Discount</span>
                <span className="font-medium text-gray-900">
                  {formData.conversionDiscount
                    ? `${formData.conversionDiscount}%`
                    : "—"}
                </span>
                <span className="text-gray-600">Valuation Cap</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(formData.valuationCap)}
                </span>
              </>
            )}
            {formData.instrumentType === "SAFE" && (
              <>
                <span className="text-gray-600">Valuation Cap</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(formData.safeValuationCap)}
                </span>
                <span className="text-gray-600">Discount Rate</span>
                <span className="font-medium text-gray-900">
                  {formData.safeDiscountRate
                    ? `${formData.safeDiscountRate}%`
                    : "—"}
                </span>
                <span className="text-gray-600">MFN Clause</span>
                <span className="font-medium text-gray-900">
                  {formData.mfnClause ? "Yes" : "No"}
                </span>
              </>
            )}
            {formData.instrumentType === "SPV_EQUITY" && (
              <>
                <span className="text-gray-600">Price Per Share</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(formData.pricePerShare)}
                </span>
                <span className="text-gray-600">Equity Offered</span>
                <span className="font-medium text-gray-900">
                  {formData.equityPercentageOffered
                    ? `${formData.equityPercentageOffered}%`
                    : "—"}
                </span>
                <span className="text-gray-600">SPV Jurisdiction</span>
                <span className="font-medium text-gray-900">
                  {formData.spvJurisdiction || "—"}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Documents */}
        <div className="bg-gray-50 rounded-xl p-5">
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Documents
          </h4>
          <div className="grid grid-cols-2 gap-y-3 text-sm">
            <span className="text-gray-600">Pitch Deck</span>
            <span className="font-medium text-gray-900">
              {formData.pitchDeckFile?.name || "Not uploaded"}
            </span>
            <span className="text-gray-600">Financial Documents</span>
            <span className="font-medium text-gray-900">
              {formData.financialDocsFile?.name || "Not uploaded"}
            </span>
            <span className="text-gray-600">Term Sheet</span>
            <span className="font-medium text-gray-900">
              {formData.termSheetFile?.name || "Not uploaded"}
            </span>
          </div>
        </div>

        {/* Draft Notice */}
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
                Deal will be saved as Draft
              </p>
              <p className="text-sm text-gray-600 mt-1">
                After creation, your deal will be saved as a draft. You can
                submit it for admin review from your dashboard when ready.
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
}: {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
  accept: string;
}) {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700">{label}</p>
          {file ? (
            <p className="text-xs text-gray-500 mt-0.5">{file.name}</p>
          ) : (
            <p className="text-xs text-gray-400 mt-0.5">
              No file selected (optional)
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
          <label
            className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all border border-gray-300 text-gray-700 hover:border-gray-400"
          >
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
