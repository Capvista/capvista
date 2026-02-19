"use client";

import { useAuth } from "@/lib/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// ============================================================================
// TYPES
// ============================================================================

type Deal = {
  id: string;
  name: string;
  lane: string;
  instrumentType: string;
  targetAmount: number;
  raisedAmount: number;
  minimumInvestment: number;
  terms: any;
  closeDate?: string;
  company: {
    legalName: string;
    tradingName?: string;
  };
};

type Investment = {
  id: string;
  status: string;
  commitmentAmount: number;
  fundedAmount: number;
  fundingMethod?: string;
  fundingReference?: string;
  fundingDeadline?: string;
  wireInstructions?: any;
  deal: Deal;
};

type InvestmentSummary = {
  commitmentAmount: number;
  platformFee: number;
  platformFeeRate: string;
  netInvestment: number;
  ownershipEstimate?: string;
  valuationCap?: number;
  discount?: number;
  conversionEstimate?: string;
  interestRate?: number;
  maturityDate?: string;
  preMoneyValuation?: number;
  revenueSharePercentage?: number;
  expectedReturn?: number;
  repaymentCap?: string;
  paymentFrequency?: string;
};

// ============================================================================
// LABEL MAPS
// ============================================================================

const laneLabels: Record<string, string> = {
  YIELD: "Yield",
  VENTURES: "Ventures",
};

const instrumentLabels: Record<string, string> = {
  REVENUE_SHARE_NOTE: "Revenue Share Note",
  ASSET_BACKED_PARTICIPATION: "Asset-Backed Participation",
  CONVERTIBLE_NOTE: "Convertible Note",
  SAFE: "SAFE",
  SPV_EQUITY: "SPV Equity",
};

// ============================================================================
// STEPS
// ============================================================================

const STEPS = [
  { id: 1, label: "Commitment" },
  { id: 2, label: "Subscription" },
  { id: 3, label: "Funding" },
  { id: 4, label: "Confirmation" },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function InvestCommitmentFlow() {
  const { user, accessToken, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const dealId = params.dealId as string;

  const [currentStep, setCurrentStep] = useState(1);
  const [deal, setDeal] = useState<Deal | null>(null);
  const [investment, setInvestment] = useState<Investment | null>(null);
  const [investmentSummary, setInvestmentSummary] =
    useState<InvestmentSummary | null>(null);
  const [wireInstructions, setWireInstructions] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Commitment
  const [commitmentAmount, setCommitmentAmount] = useState("");

  // Step 2: Subscription
  const [confirmedQualifiedInvestor, setConfirmedQualifiedInvestor] =
    useState(false);
  const [confirmedUnderstandsRisks, setConfirmedUnderstandsRisks] =
    useState(false);
  const [confirmedOwnAccount, setConfirmedOwnAccount] = useState(false);
  const [confirmedNoLiquidityExpectation, setConfirmedNoLiquidityExpectation] =
    useState(false);
  const [eSignature, setESignature] = useState("");

  // Step 3: Funding
  const [fundingMethod, setFundingMethod] = useState<string>("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Express interest on page load
  const expressInterest = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${API_URL}/api/investments/express-interest`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ dealId }),
        },
      );

      const result = await response.json();

      if (result.success) {
        setInvestment(result.data);
        setDeal(result.data.deal);
        setCurrentStep(1);
      } else if (result.error?.code === "DUPLICATE_INTEREST") {
        // Already expressed interest — load the existing investment
        const inv = result.data;
        if (inv) {
          // Fetch full investment details
          const detailRes = await fetch(
            `${API_URL}/api/investments/${inv.id}`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            },
          );
          const detailResult = await detailRes.json();
          if (detailResult.success) {
            setInvestment(detailResult.data);
            setDeal(detailResult.data.deal);
            // Resume at the correct step based on status
            const status = detailResult.data.status;
            if (status === "INTERESTED") setCurrentStep(1);
            else if (status === "COMMITTED") setCurrentStep(2);
            else if (status === "PENDING_FUNDING") {
              if (detailResult.data.fundingMethod) setCurrentStep(4);
              else setCurrentStep(3);
            } else if (status === "FUNDED" || status === "ACTIVE") {
              setCurrentStep(4);
            }
          }
        }
      } else {
        setError(result.error?.message || "Failed to express interest");
      }
    } catch (err) {
      console.error("Express interest error:", err);
      setError("Failed to connect to server");
    } finally {
      setIsLoading(false);
    }
  }, [dealId, accessToken]);

  useEffect(() => {
    if (user && dealId && accessToken) {
      expressInterest();
    }
  }, [user, dealId, accessToken, expressInterest]);

  // Step 1: Submit commitment
  const handleCommit = async () => {
    if (!investment) return;
    const amount = parseFloat(commitmentAmount.replace(/,/g, ""));
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid commitment amount");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch(
        `${API_URL}/api/investments/${investment.id}/commit`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ commitmentAmount: amount }),
        },
      );

      const result = await response.json();

      if (result.success) {
        setInvestment(result.data);
        setInvestmentSummary(result.investmentSummary);
        setCurrentStep(2);
      } else {
        setError(result.error?.message || "Failed to commit");
      }
    } catch (err) {
      console.error("Commit error:", err);
      setError("Failed to connect to server");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Submit subscription
  const handleSubscribe = async () => {
    if (!investment) return;

    if (
      !confirmedQualifiedInvestor ||
      !confirmedUnderstandsRisks ||
      !confirmedOwnAccount ||
      !confirmedNoLiquidityExpectation
    ) {
      setError("All representations must be confirmed");
      return;
    }

    if (!eSignature.trim()) {
      setError("Electronic signature is required");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch(
        `${API_URL}/api/investments/${investment.id}/subscribe`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            confirmedQualifiedInvestor,
            confirmedUnderstandsRisks,
            confirmedOwnAccount,
            confirmedNoLiquidityExpectation,
            eSignature: eSignature.trim(),
          }),
        },
      );

      const result = await response.json();

      if (result.success) {
        setInvestment(result.data);
        setCurrentStep(3);
      } else {
        setError(result.error?.message || "Failed to sign subscription");
      }
    } catch (err) {
      console.error("Subscribe error:", err);
      setError("Failed to connect to server");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 3: Submit funding method
  const handleFundingMethod = async () => {
    if (!investment || !fundingMethod) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch(
        `${API_URL}/api/investments/${investment.id}/funding-method`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fundingMethod }),
        },
      );

      const result = await response.json();

      if (result.success) {
        setInvestment(result.data);
        setWireInstructions(result.wireInstructions);
        setCurrentStep(4);
      } else {
        setError(result.error?.message || "Failed to select funding method");
      }
    } catch (err) {
      console.error("Funding method error:", err);
      setError("Failed to connect to server");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel investment
  const handleCancel = async () => {
    if (!investment) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(
        `${API_URL}/api/investments/${investment.id}/cancel`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      const result = await response.json();
      if (result.success) {
        router.back();
      } else {
        setError(result.error?.message || "Failed to cancel");
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================================
  // LOADING / ERROR STATES
  // ============================================================================

  if (loading || !user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#F6F8FA" }}
      >
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#F6F8FA" }}
      >
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Initializing commitment flow...</p>
        </div>
      </div>
    );
  }

  if (error && !deal) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#F6F8FA" }}>
        <PageHeader />
        <main className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-red-100">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Unable to Proceed
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 rounded-lg font-semibold text-sm"
            style={{ backgroundColor: "#C8A24D", color: "#0B1C2D" }}
          >
            Go Back
          </button>
        </main>
      </div>
    );
  }

  if (!deal || !investment) return null;

  const displayName = deal.company.tradingName || deal.company.legalName;

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F6F8FA" }}>
      <PageHeader />

      {/* Deal Summary Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">
                Capital Subscription
              </p>
              <h1 className="text-lg font-bold text-gray-900">{deal.name}</h1>
              <p className="text-sm text-gray-500">{displayName}</p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-1 rounded text-xs font-semibold ${deal.lane === "YIELD" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"}`}
              >
                {laneLabels[deal.lane] || deal.lane}
              </span>
              <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                {instrumentLabels[deal.instrumentType] || deal.instrumentType}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Step Progress */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {STEPS.map((step, i) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      currentStep > step.id
                        ? "bg-green-500 text-white"
                        : currentStep === step.id
                          ? "text-white"
                          : "bg-gray-200 text-gray-500"
                    }`}
                    style={
                      currentStep === step.id
                        ? { backgroundColor: "#0B1C2D" }
                        : undefined
                    }
                  >
                    {currentStep > step.id ? (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      step.id
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium hidden sm:block ${currentStep >= step.id ? "text-gray-900" : "text-gray-400"}`}
                  >
                    {step.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-3 ${currentStep > step.id ? "bg-green-500" : "bg-gray-200"}`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {currentStep === 1 && (
          <Step1Commitment
            deal={deal}
            commitmentAmount={commitmentAmount}
            setCommitmentAmount={setCommitmentAmount}
            onSubmit={handleCommit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        )}

        {currentStep === 2 && (
          <Step2Subscription
            deal={deal}
            investment={investment}
            investmentSummary={investmentSummary}
            confirmedQualifiedInvestor={confirmedQualifiedInvestor}
            setConfirmedQualifiedInvestor={setConfirmedQualifiedInvestor}
            confirmedUnderstandsRisks={confirmedUnderstandsRisks}
            setConfirmedUnderstandsRisks={setConfirmedUnderstandsRisks}
            confirmedOwnAccount={confirmedOwnAccount}
            setConfirmedOwnAccount={setConfirmedOwnAccount}
            confirmedNoLiquidityExpectation={confirmedNoLiquidityExpectation}
            setConfirmedNoLiquidityExpectation={
              setConfirmedNoLiquidityExpectation
            }
            eSignature={eSignature}
            setESignature={setESignature}
            onSubmit={handleSubscribe}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        )}

        {currentStep === 3 && (
          <Step3Funding
            deal={deal}
            investment={investment}
            fundingMethod={fundingMethod}
            setFundingMethod={setFundingMethod}
            onSubmit={handleFundingMethod}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        )}

        {currentStep === 4 && (
          <Step4Confirmation
            deal={deal}
            investment={investment}
            wireInstructions={wireInstructions || investment.wireInstructions}
          />
        )}
      </main>
    </div>
  );
}

// ============================================================================
// PAGE HEADER
// ============================================================================

function PageHeader() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-3xl mx-auto px-4">
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
            href="/dashboard/investor/companies"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back to Companies
          </Link>
        </div>
      </div>
    </header>
  );
}

// ============================================================================
// STEP 1: COMMITMENT
// ============================================================================

function Step1Commitment({
  deal,
  commitmentAmount,
  setCommitmentAmount,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  deal: Deal;
  commitmentAmount: string;
  setCommitmentAmount: (v: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const minInvestment = Number(deal.minimumInvestment || 0);
  const targetAmount = Number(deal.targetAmount || 0);
  const raisedAmount = Number(deal.raisedAmount || 0);
  const remaining = targetAmount - raisedAmount;
  const progress =
    targetAmount > 0 ? (raisedAmount / targetAmount) * 100 : 0;
  const displayName = deal.company.tradingName || deal.company.legalName;

  // Parse amount for dynamic calculations
  const parsedAmount = parseFloat(commitmentAmount.replace(/,/g, "")) || 0;
  const isValidAmount =
    parsedAmount >= minInvestment &&
    (targetAmount === 0 || parsedAmount <= remaining);
  const isBelowMin = parsedAmount > 0 && parsedAmount < minInvestment;
  const isAboveMax =
    parsedAmount > 0 && targetAmount > 0 && parsedAmount > remaining;

  // Dynamic calculations
  const dynamicCalc = useMemo(() => {
    if (parsedAmount <= 0) return null;

    const platformFeeRate = 0.02;
    const platformFee = parsedAmount * platformFeeRate;
    const netInvestment = parsedAmount - platformFee;
    const terms = deal.terms || {};

    const result: {
      platformFee: number;
      netInvestment: number;
      totalCommitment: number;
      details: { label: string; value: string }[];
    } = {
      platformFee,
      netInvestment,
      totalCommitment: parsedAmount,
      details: [],
    };

    if (deal.lane === "VENTURES") {
      if (
        deal.instrumentType === "SAFE" ||
        deal.instrumentType === "CONVERTIBLE_NOTE"
      ) {
        const valuationCap = Number(
          terms.valuationCap || terms.valuation_cap || 0,
        );
        if (valuationCap > 0) {
          const ownership = (netInvestment / valuationCap) * 100;
          result.details.push({
            label:
              deal.instrumentType === "SAFE"
                ? "Estimated Ownership"
                : "Estimated Conversion",
            value: `${ownership.toFixed(4)}%`,
          });
          result.details.push({
            label: "Valuation Cap",
            value: `$${valuationCap.toLocaleString()}`,
          });
        }
        if (terms.discount) {
          result.details.push({
            label: "Discount Rate",
            value: `${terms.discount}%`,
          });
        }
        if (terms.interestRate) {
          result.details.push({
            label: "Interest Rate",
            value: `${terms.interestRate}%`,
          });
        }
      } else if (deal.instrumentType === "SPV_EQUITY") {
        const preMoneyVal = Number(
          terms.preMoneyValuation || terms.valuation || 0,
        );
        if (preMoneyVal > 0) {
          const ownership =
            (netInvestment / (preMoneyVal + targetAmount)) * 100;
          result.details.push({
            label: "Estimated Ownership",
            value: `${ownership.toFixed(4)}%`,
          });
          result.details.push({
            label: "Pre-money Valuation",
            value: `$${preMoneyVal.toLocaleString()}`,
          });
        }
      }
    } else if (deal.lane === "YIELD") {
      const revenueSharePct = Number(
        terms.revenueSharePercentage || terms.revenueShare || 0,
      );
      const repaymentCap = Number(terms.repaymentCap || terms.returnCap || 0);

      if (revenueSharePct > 0) {
        result.details.push({
          label: "Revenue Share",
          value: `${revenueSharePct}%`,
        });
      }
      if (repaymentCap > 0) {
        const expectedReturn = netInvestment * repaymentCap;
        result.details.push({
          label: "Expected Total Return",
          value: `$${expectedReturn.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
        });
        result.details.push({
          label: "Repayment Cap",
          value: `${repaymentCap}x`,
        });
      }
      if (terms.paymentFrequency) {
        result.details.push({
          label: "Payment Frequency",
          value: terms.paymentFrequency,
        });
      }
    }

    return result;
  }, [parsedAmount, deal]);

  return (
    <div className="space-y-6">
      {/* Deal Summary Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">
          Step 1: Commitment
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Specify the amount of capital you wish to commit to this offering.
        </p>

        {/* Deal Info Summary Card */}
        <div className="p-4 bg-gray-50 rounded-lg mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <p className="text-xs text-gray-400">Deal</p>
              <p className="font-semibold text-gray-900">{deal.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Company</p>
              <p className="font-semibold text-gray-900">{displayName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Instrument</p>
              <p className="font-semibold text-gray-900">
                {instrumentLabels[deal.instrumentType] || deal.instrumentType}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Minimum Investment</p>
              <p className="font-semibold text-gray-900">
                ${minInvestment.toLocaleString()}
              </p>
            </div>
            {deal.closeDate && (
              <div>
                <p className="text-xs text-gray-400">Close Date</p>
                <p className="font-semibold text-gray-900">
                  {new Date(deal.closeDate).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Allocation Progress */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-400">Hard Cap</p>
              <p className="font-semibold text-gray-900">
                ${targetAmount.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Raised to Date</p>
              <p className="font-semibold text-gray-900">
                ${raisedAmount.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Remaining</p>
              <p className="font-semibold text-gray-900">
                ${remaining.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Minimum</p>
              <p className="font-semibold text-gray-900">
                ${minInvestment.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">Round filled</span>
              <span className="font-medium text-gray-600">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Risk Disclaimer */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-6">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <p className="text-sm text-amber-800">
              Investment involves substantial risk including potential total loss
              of capital. Private market investments are speculative, illiquid,
              and may not generate returns. Only invest capital you can afford to
              lose entirely.
            </p>
          </div>
        </div>

        {/* Amount Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Commitment Amount ($)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-medium">
              $
            </span>
            <input
              type="text"
              value={commitmentAmount}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9.,]/g, "");
                setCommitmentAmount(val);
              }}
              placeholder={minInvestment.toLocaleString()}
              className={`w-full pl-8 pr-4 py-3.5 border rounded-lg text-lg font-semibold text-gray-900 focus:ring-1 outline-none ${
                isBelowMin || isAboveMax
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-gray-500 focus:ring-gray-500"
              }`}
            />
          </div>
          {isBelowMin && (
            <p className="text-xs text-red-600 mt-2">
              Minimum commitment is ${minInvestment.toLocaleString()}
            </p>
          )}
          {isAboveMax && (
            <p className="text-xs text-red-600 mt-2">
              Maximum available allocation is ${remaining.toLocaleString()}
            </p>
          )}
          {!isBelowMin && !isAboveMax && (
            <p className="text-xs text-gray-400 mt-2">
              Minimum commitment: ${minInvestment.toLocaleString()}
            </p>
          )}
        </div>

        {/* Dynamic Calculations */}
        {dynamicCalc && parsedAmount > 0 && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg mb-6">
            <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">
              Investment Breakdown
            </p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Commitment Amount
                </span>
                <span className="text-sm font-medium text-gray-900">
                  ${parsedAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Platform Fee (2%)
                </span>
                <span className="text-sm font-medium text-gray-900">
                  $
                  {dynamicCalc.platformFee.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">
                    Net Investment
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    $
                    {dynamicCalc.netInvestment.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
              {dynamicCalc.details.length > 0 && (
                <div className="border-t border-gray-200 pt-2.5 space-y-2">
                  {dynamicCalc.details.map((d, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-gray-500">{d.label}</span>
                      <span className="text-sm font-semibold text-green-700">
                        {d.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Key Terms */}
        {deal.terms && (
          <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-lg">
            <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
              Instrument Terms
            </p>
            <TermsSummary
              terms={deal.terms}
              instrumentType={deal.instrumentType}
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitting || !commitmentAmount || !isValidAmount}
          className="px-8 py-3 rounded-lg text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#0B1C2D", color: "#fff" }}
        >
          {isSubmitting ? "Processing..." : "Proceed to Subscription"}
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 2: SUBSCRIPTION
// ============================================================================

function Step2Subscription({
  deal,
  investment,
  investmentSummary,
  confirmedQualifiedInvestor,
  setConfirmedQualifiedInvestor,
  confirmedUnderstandsRisks,
  setConfirmedUnderstandsRisks,
  confirmedOwnAccount,
  setConfirmedOwnAccount,
  confirmedNoLiquidityExpectation,
  setConfirmedNoLiquidityExpectation,
  eSignature,
  setESignature,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  deal: Deal;
  investment: Investment;
  investmentSummary: InvestmentSummary | null;
  confirmedQualifiedInvestor: boolean;
  setConfirmedQualifiedInvestor: (v: boolean) => void;
  confirmedUnderstandsRisks: boolean;
  setConfirmedUnderstandsRisks: (v: boolean) => void;
  confirmedOwnAccount: boolean;
  setConfirmedOwnAccount: (v: boolean) => void;
  confirmedNoLiquidityExpectation: boolean;
  setConfirmedNoLiquidityExpectation: (v: boolean) => void;
  eSignature: string;
  setESignature: (v: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const allConfirmed =
    confirmedQualifiedInvestor &&
    confirmedUnderstandsRisks &&
    confirmedOwnAccount &&
    confirmedNoLiquidityExpectation &&
    eSignature.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* Subscription Agreement Text */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">
          Step 2: Subscription Agreement
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Review the subscription agreement, confirm your representations, and
          execute with your electronic signature.
        </p>

        {/* Agreement Text */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg mb-6 max-h-64 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">
            Subscription Agreement
          </p>
          <div className="text-xs text-gray-600 leading-relaxed space-y-3">
            <p>
              This Subscription Agreement (&ldquo;Agreement&rdquo;) is entered
              into between the undersigned investor (&ldquo;Subscriber&rdquo;)
              and Capvista Holdings Ltd., acting as the platform intermediary for
              the offering described herein.
            </p>
            <p>
              <strong>1. Subscription.</strong> The Subscriber hereby subscribes
              for participation in the offering designated as &ldquo;
              {deal.name}&rdquo; (the &ldquo;Offering&rdquo;) through the{" "}
              {instrumentLabels[deal.instrumentType] || deal.instrumentType}{" "}
              instrument, subject to the terms and conditions set forth herein
              and in the associated term sheet.
            </p>
            <p>
              <strong>2. Investment Amount.</strong> The Subscriber commits to
              invest the amount specified in Step 1 of this subscription
              process. The Subscriber acknowledges that a platform fee of 2% is
              deducted from the gross commitment amount.
            </p>
            <p>
              <strong>3. Representations.</strong> The Subscriber represents and
              warrants that: (a) the Subscriber is a qualified investor under
              applicable securities regulations; (b) the Subscriber has
              sufficient knowledge and experience to evaluate the merits and
              risks of this investment; (c) the Subscriber can bear the economic
              risk of total loss of the invested capital; and (d) the funds used
              for this investment are from legitimate sources.
            </p>
            <p>
              <strong>4. Risk Acknowledgement.</strong> The Subscriber
              acknowledges that: (a) private market investments carry
              substantial risk; (b) there is no guarantee of return on
              investment; (c) the investment may be illiquid for an extended or
              indefinite period; and (d) past performance of similar investments
              does not guarantee future results.
            </p>
            <p>
              <strong>5. Governing Law.</strong> This Agreement shall be
              governed by and construed in accordance with the laws of the
              jurisdiction in which Capvista Holdings Ltd. is incorporated. Any
              disputes arising from this Agreement shall be resolved through
              binding arbitration.
            </p>
          </div>
        </div>

        {/* Instrument Summary */}
        <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-lg mb-6">
          <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
            Instrument Summary
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Instrument</span>
              <span className="font-medium text-gray-900">
                {instrumentLabels[deal.instrumentType] || deal.instrumentType}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Lane</span>
              <span className="font-medium text-gray-900">
                {laneLabels[deal.lane] || deal.lane}
              </span>
            </div>
            {deal.terms && (
              <TermsSummary
                terms={deal.terms}
                instrumentType={deal.instrumentType}
              />
            )}
          </div>
        </div>
      </div>

      {/* Investment Summary */}
      {investmentSummary && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
            Investment Summary
          </h3>
          <div className="space-y-3">
            <SummaryRow
              label="Commitment Amount"
              value={`$${investmentSummary.commitmentAmount.toLocaleString()}`}
            />
            <SummaryRow
              label={`Platform Fee (${investmentSummary.platformFeeRate})`}
              value={`$${investmentSummary.platformFee.toLocaleString()}`}
            />
            <div className="border-t border-gray-200 pt-3">
              <SummaryRow
                label="Net Investment"
                value={`$${investmentSummary.netInvestment.toLocaleString()}`}
                bold
              />
            </div>
            {investmentSummary.ownershipEstimate && (
              <SummaryRow
                label="Estimated Ownership"
                value={investmentSummary.ownershipEstimate}
                highlight
              />
            )}
            {investmentSummary.conversionEstimate && (
              <SummaryRow
                label="Estimated Conversion"
                value={investmentSummary.conversionEstimate}
                highlight
              />
            )}
            {investmentSummary.expectedReturn && (
              <SummaryRow
                label="Expected Total Return"
                value={`$${investmentSummary.expectedReturn.toLocaleString()}`}
                highlight
              />
            )}
            {investmentSummary.repaymentCap && (
              <SummaryRow
                label="Repayment Cap"
                value={investmentSummary.repaymentCap}
              />
            )}
            {investmentSummary.revenueSharePercentage && (
              <SummaryRow
                label="Revenue Share %"
                value={`${investmentSummary.revenueSharePercentage}%`}
              />
            )}
          </div>
        </div>
      )}

      {/* Investor Representations */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-4">
          Investor Representations
        </p>

        <div className="space-y-4 mb-8">
          <RepresentationCheckbox
            checked={confirmedQualifiedInvestor}
            onChange={setConfirmedQualifiedInvestor}
            label="I am a qualified investor as defined by applicable securities regulations"
          />

          <RepresentationCheckbox
            checked={confirmedUnderstandsRisks}
            onChange={setConfirmedUnderstandsRisks}
            label="I understand the risks involved including potential total loss of capital"
          />

          <RepresentationCheckbox
            checked={confirmedOwnAccount}
            onChange={setConfirmedOwnAccount}
            label="I am investing for my own account and not on behalf of another party"
          />

          <RepresentationCheckbox
            checked={confirmedNoLiquidityExpectation}
            onChange={setConfirmedNoLiquidityExpectation}
            label="I have no expectation of liquidity and understand this investment may be held for an extended period"
          />
        </div>

        {/* Electronic Signature */}
        <div className="border-t border-gray-200 pt-6">
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Electronic Signature
          </p>
          <p className="text-xs text-gray-500 mb-3">
            By signing below, you are electronically signing the subscription
            agreement. This signature carries the same legal force as a
            handwritten signature.
          </p>
          <input
            type="text"
            value={eSignature}
            onChange={(e) => setESignature(e.target.value)}
            placeholder="Type your full legal name"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base text-gray-900 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none"
            style={{
              fontFamily: "'Brush Script MT', 'Segoe Script', cursive",
            }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          Cancel Subscription
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitting || !allConfirmed}
          className="px-8 py-3 rounded-lg text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#0B1C2D", color: "#fff" }}
        >
          {isSubmitting ? "Executing..." : "Execute Subscription"}
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 3: FUNDING
// ============================================================================

function Step3Funding({
  deal,
  investment,
  fundingMethod,
  setFundingMethod,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  deal: Deal;
  investment: Investment;
  fundingMethod: string;
  setFundingMethod: (v: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const fundingMethods = [
    {
      id: "wire",
      label: "Wire Transfer",
      description:
        "International or domestic wire transfer to the designated escrow account. Recommended for amounts over $25,000.",
      timeline: "2-3 business days",
    },
    {
      id: "ach",
      label: "ACH Transfer",
      description:
        "Automated clearing house transfer from a U.S. bank account. Lower fees, suitable for domestic transfers.",
      timeline: "3-5 business days",
    },
    {
      id: "escrow",
      label: "Escrow Transfer",
      description:
        "Third-party escrow agent holds funds until closing conditions are met. Additional escrow fees may apply.",
      timeline: "1-2 business days after escrow setup",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">
          Step 3: Funding
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Select how you will transfer your committed capital of{" "}
          <strong>
            ${Number(investment.commitmentAmount).toLocaleString()}
          </strong>{" "}
          to the escrow account. You will receive detailed transfer instructions
          after selection.
        </p>

        <div className="space-y-3 mb-6">
          {fundingMethods.map((method) => (
            <label
              key={method.id}
              className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                fundingMethod === method.id
                  ? "border-gray-900 bg-gray-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    fundingMethod === method.id
                      ? "border-gray-900"
                      : "border-gray-300"
                  }`}
                >
                  {fundingMethod === method.id && (
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-900"></div>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="radio"
                    name="fundingMethod"
                    value={method.id}
                    checked={fundingMethod === method.id}
                    onChange={() => setFundingMethod(method.id)}
                    className="sr-only"
                  />
                  <p className="text-sm font-semibold text-gray-900">
                    {method.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {method.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Expected settlement: {method.timeline}
                  </p>
                </div>
              </div>
            </label>
          ))}
        </div>

        {/* Escrow Notice */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <p className="text-sm text-amber-800">
              Funds must be sent to the escrow account. Do not send funds
              directly to the company.
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitting || !fundingMethod}
          className="px-8 py-3 rounded-lg text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#0B1C2D", color: "#fff" }}
        >
          {isSubmitting ? "Processing..." : "I Have Initiated the Transfer"}
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 4: CONFIRMATION
// ============================================================================

function Step4Confirmation({
  deal,
  investment,
  wireInstructions,
}: {
  deal: Deal;
  investment: Investment;
  wireInstructions: any;
}) {
  const router = useRouter();
  const isFunded =
    investment.status === "FUNDED" || investment.status === "ACTIVE";
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (value: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // Fallback for older browsers
      const el = document.createElement("textarea");
      el.value = value;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Status */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
        <div
          className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${isFunded ? "bg-green-100" : "bg-green-100"}`}
        >
          <svg
            className={`w-8 h-8 ${isFunded ? "text-green-600" : "text-green-600"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {isFunded ? "Investment Confirmed" : "Subscription Submitted"}
        </h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          {isFunded
            ? "Your funds have been received and verified. Your investment is now active."
            : "Your subscription has been executed successfully. Please transfer funds using the instructions below to complete your investment."}
        </p>
      </div>

      {/* Wire Instructions */}
      {wireInstructions && !isFunded && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
            Transfer Instructions
          </h3>
          <div className="space-y-3 mb-4">
            <InstructionRow
              label="Bank Name"
              value={wireInstructions.bankName}
              onCopy={() =>
                handleCopy(wireInstructions.bankName, "bankName")
              }
              copied={copiedField === "bankName"}
            />
            <InstructionRow
              label="Account Name"
              value={wireInstructions.accountName}
              onCopy={() =>
                handleCopy(wireInstructions.accountName, "accountName")
              }
              copied={copiedField === "accountName"}
            />
            <InstructionRow
              label="Account Number"
              value={wireInstructions.accountNumber}
              onCopy={() =>
                handleCopy(wireInstructions.accountNumber, "accountNumber")
              }
              copied={copiedField === "accountNumber"}
            />
            <InstructionRow
              label="Routing Number"
              value={wireInstructions.routingNumber}
              onCopy={() =>
                handleCopy(wireInstructions.routingNumber, "routingNumber")
              }
              copied={copiedField === "routingNumber"}
            />
            {wireInstructions.swiftCode && (
              <InstructionRow
                label="SWIFT/BIC"
                value={wireInstructions.swiftCode}
                onCopy={() =>
                  handleCopy(wireInstructions.swiftCode, "swiftCode")
                }
                copied={copiedField === "swiftCode"}
              />
            )}
            <div className="border-t border-gray-200 pt-3">
              <InstructionRow
                label="Reference Code"
                value={wireInstructions.reference}
                highlight
                onCopy={() =>
                  handleCopy(wireInstructions.reference, "reference")
                }
                copied={copiedField === "reference"}
              />
            </div>
            <InstructionRow
              label="Amount"
              value={`$${Number(wireInstructions.amount).toLocaleString()} USD`}
              onCopy={() =>
                handleCopy(
                  `${Number(wireInstructions.amount).toLocaleString()}`,
                  "amount",
                )
              }
              copied={copiedField === "amount"}
            />
            <InstructionRow
              label="Funding Deadline"
              value={new Date(wireInstructions.deadline).toLocaleDateString(
                "en-US",
                { year: "numeric", month: "long", day: "numeric" },
              )}
            />
          </div>

          {/* Deadline Warning */}
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
            <p className="text-xs text-red-800 font-medium">
              Funds must be received by{" "}
              {new Date(wireInstructions.deadline).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              . Failure to fund by the deadline may result in cancellation of
              your commitment.
            </p>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-800">
              {wireInstructions.instructions}
            </p>
          </div>
        </div>
      )}

      {/* Investment Details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
          Investment Details
        </h3>
        <div className="space-y-3">
          <SummaryRow label="Deal" value={deal.name} />
          <SummaryRow
            label="Company"
            value={deal.company.tradingName || deal.company.legalName}
          />
          <SummaryRow
            label="Instrument"
            value={
              instrumentLabels[deal.instrumentType] || deal.instrumentType
            }
          />
          <SummaryRow
            label="Commitment"
            value={`$${Number(investment.commitmentAmount).toLocaleString()}`}
            bold
          />
          <SummaryRow
            label="Status"
            value={
              isFunded
                ? "Active"
                : investment.status === "PENDING_FUNDING"
                  ? "Pending Funding"
                  : investment.status.replace(/_/g, " ")
            }
          />
          {investment.fundingReference && (
            <SummaryRow
              label="Funding Reference"
              value={investment.fundingReference}
            />
          )}
          {investment.fundingMethod && (
            <SummaryRow
              label="Funding Method"
              value={
                investment.fundingMethod === "wire"
                  ? "Wire Transfer"
                  : investment.fundingMethod === "ach"
                    ? "ACH Transfer"
                    : "Escrow Transfer"
              }
            />
          )}
        </div>
      </div>

      {/* What Happens Next */}
      {!isFunded && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
            What Happens Next
          </h3>
          <div className="space-y-4">
            {investment.fundingReference && (
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-gray-600">1</span>
                </div>
                <p className="text-sm text-gray-700">
                  Your funding reference is{" "}
                  <span className="font-mono font-bold bg-yellow-100 px-1.5 py-0.5 rounded">
                    {investment.fundingReference}
                  </span>
                  . Include this in your wire transfer.
                </p>
              </div>
            )}
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-gray-600">
                  {investment.fundingReference ? "2" : "1"}
                </span>
              </div>
              <p className="text-sm text-gray-700">
                Once funds are received and verified, your investment will be
                confirmed.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-gray-600">
                  {investment.fundingReference ? "3" : "2"}
                </span>
              </div>
              <p className="text-sm text-gray-700">
                You will receive a notification when your investment is active.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => router.push("/dashboard/investor/companies")}
          className="px-6 py-3 rounded-lg text-sm font-semibold border-2 border-gray-300 text-gray-700 hover:border-gray-400 transition-all"
        >
          Browse Companies
        </button>
        <button
          onClick={() => router.push("/dashboard/investor")}
          className="px-6 py-3 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
          style={{ backgroundColor: "#C8A24D", color: "#0B1C2D" }}
        >
          View My Investments
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function RepresentationCheckbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div
        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
          checked
            ? "bg-gray-900 border-gray-900"
            : "border-gray-300 group-hover:border-gray-400"
        }`}
      >
        {checked && (
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span className="text-sm text-gray-700 leading-relaxed">{label}</span>
    </label>
  );
}

function SummaryRow({
  label,
  value,
  bold,
  highlight,
}: {
  label: string;
  value: string;
  bold?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-gray-500">{label}</p>
      <p
        className={`text-sm ${bold ? "font-bold text-gray-900" : highlight ? "font-semibold text-green-700" : "font-medium text-gray-900"}`}
      >
        {value}
      </p>
    </div>
  );
}

function InstructionRow({
  label,
  value,
  highlight,
  onCopy,
  copied,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  onCopy?: () => void;
  copied?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <p className="text-xs text-gray-400 flex-shrink-0">{label}</p>
      <div className="flex items-center gap-2">
        <p
          className={`text-sm font-mono ${highlight ? "font-bold text-gray-900 bg-yellow-100 px-2 py-0.5 rounded" : "font-medium text-gray-900"}`}
        >
          {value}
        </p>
        {onCopy && (
          <button
            onClick={onCopy}
            className="flex-shrink-0 p-1 rounded hover:bg-gray-100 transition-colors"
            title="Copy to clipboard"
          >
            {copied ? (
              <svg
                className="w-3.5 h-3.5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-3.5 h-3.5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function TermsSummary({
  terms,
  instrumentType,
}: {
  terms: any;
  instrumentType: string;
}) {
  if (!terms) return null;

  const rows: { label: string; value: string }[] = [];

  if (instrumentType === "SAFE" || instrumentType === "CONVERTIBLE_NOTE") {
    if (terms.valuationCap || terms.valuation_cap)
      rows.push({
        label: "Valuation Cap",
        value: `$${Number(terms.valuationCap || terms.valuation_cap).toLocaleString()}`,
      });
    if (terms.discount)
      rows.push({ label: "Discount", value: `${terms.discount}%` });
    if (terms.interestRate)
      rows.push({
        label: "Interest Rate",
        value: `${terms.interestRate}%`,
      });
    if (terms.maturityDate)
      rows.push({ label: "Maturity", value: terms.maturityDate });
  } else if (instrumentType === "SPV_EQUITY") {
    if (terms.preMoneyValuation || terms.valuation)
      rows.push({
        label: "Pre-money Valuation",
        value: `$${Number(terms.preMoneyValuation || terms.valuation).toLocaleString()}`,
      });
    if (terms.shareClass)
      rows.push({ label: "Share Class", value: terms.shareClass });
  } else if (
    instrumentType === "REVENUE_SHARE_NOTE" ||
    instrumentType === "ASSET_BACKED_PARTICIPATION"
  ) {
    if (terms.revenueSharePercentage || terms.revenueShare)
      rows.push({
        label: "Revenue Share",
        value: `${terms.revenueSharePercentage || terms.revenueShare}%`,
      });
    if (terms.repaymentCap || terms.returnCap)
      rows.push({
        label: "Repayment Cap",
        value: `${terms.repaymentCap || terms.returnCap}x`,
      });
    if (terms.paymentFrequency)
      rows.push({
        label: "Payment Frequency",
        value: terms.paymentFrequency,
      });
  }

  if (rows.length === 0)
    return (
      <p className="text-xs text-gray-400">Terms details not available</p>
    );

  return (
    <div className="space-y-2">
      {rows.map((row, i) => (
        <div key={i} className="flex items-center justify-between">
          <span className="text-xs text-gray-500">{row.label}</span>
          <span className="text-xs font-semibold text-gray-800">
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
}
