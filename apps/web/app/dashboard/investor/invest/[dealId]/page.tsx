"use client";

import { useAuth } from "@/lib/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
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
  const [investmentSummary, setInvestmentSummary] = useState<InvestmentSummary | null>(null);
  const [wireInstructions, setWireInstructions] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Commitment
  const [commitmentAmount, setCommitmentAmount] = useState("");

  // Step 2: Subscription
  const [confirmedQualifiedInvestor, setConfirmedQualifiedInvestor] = useState(false);
  const [confirmedUnderstandsRisks, setConfirmedUnderstandsRisks] = useState(false);
  const [confirmedOwnAccount, setConfirmedOwnAccount] = useState(false);
  const [confirmedNoLiquidityExpectation, setConfirmedNoLiquidityExpectation] = useState(false);
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

      const response = await fetch(`${API_URL}/api/investments/express-interest`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dealId }),
      });

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
          const detailRes = await fetch(`${API_URL}/api/investments/${inv.id}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
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

      const response = await fetch(`${API_URL}/api/investments/${investment.id}/commit`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ commitmentAmount: amount }),
      });

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

    if (!confirmedQualifiedInvestor || !confirmedUnderstandsRisks || !confirmedOwnAccount || !confirmedNoLiquidityExpectation) {
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

      const response = await fetch(`${API_URL}/api/investments/${investment.id}/subscribe`, {
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
      });

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

      const response = await fetch(`${API_URL}/api/investments/${investment.id}/funding-method`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fundingMethod }),
      });

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
      const response = await fetch(`${API_URL}/api/investments/${investment.id}/cancel`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F6F8FA" }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F6F8FA" }}>
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
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Proceed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={() => router.back()} className="px-6 py-3 rounded-lg font-semibold text-sm" style={{ backgroundColor: "#C8A24D", color: "#0B1C2D" }}>
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
              <p className="text-xs text-gray-400 mb-0.5">Capital Subscription</p>
              <h1 className="text-lg font-bold text-gray-900">{deal.name}</h1>
              <p className="text-sm text-gray-500">{displayName}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded text-xs font-semibold ${deal.lane === "YIELD" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"}`}>
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
                    style={currentStep === step.id ? { backgroundColor: "#0B1C2D" } : undefined}
                  >
                    {currentStep > step.id ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      step.id
                    )}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${currentStep >= step.id ? "text-gray-900" : "text-gray-400"}`}>
                    {step.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-3 ${currentStep > step.id ? "bg-green-500" : "bg-gray-200"}`}></div>
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
            setConfirmedNoLiquidityExpectation={setConfirmedNoLiquidityExpectation}
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
          <Link href="/dashboard/investor" className="flex items-center space-x-2">
            <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#C8A24D" }}>
              <span className="font-bold text-base" style={{ color: "#0B1C2D" }}>CV</span>
            </div>
            <span className="text-xl font-bold text-primary-950">Capvista</span>
          </Link>
          <Link href="/dashboard/investor/companies" className="text-sm text-gray-600 hover:text-gray-900">
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
  const progress = targetAmount > 0 ? (raisedAmount / targetAmount) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Step 1: Commitment Amount</h2>
        <p className="text-sm text-gray-500 mb-6">
          Specify the amount of capital you wish to commit to this offering. This is a non-binding indication of interest that will be formalized in the subscription agreement.
        </p>

        {/* Deal Summary */}
        <div className="p-4 bg-gray-50 rounded-lg mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-400">Hard Cap</p>
              <p className="font-semibold text-gray-900">${targetAmount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Raised to Date</p>
              <p className="font-semibold text-gray-900">${raisedAmount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Remaining</p>
              <p className="font-semibold text-gray-900">${remaining.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Minimum</p>
              <p className="font-semibold text-gray-900">${minInvestment.toLocaleString()}</p>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">Round filled</span>
              <span className="font-medium text-gray-600">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }}></div>
            </div>
          </div>
        </div>

        {/* Amount Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Commitment Amount (USD)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-medium">$</span>
            <input
              type="text"
              value={commitmentAmount}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9.,]/g, "");
                setCommitmentAmount(val);
              }}
              placeholder={minInvestment.toLocaleString()}
              className="w-full pl-8 pr-4 py-3.5 border border-gray-300 rounded-lg text-lg font-semibold text-gray-900 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none"
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">Minimum commitment: ${minInvestment.toLocaleString()}</p>
        </div>

        {/* Key Terms */}
        {deal.terms && (
          <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-lg mb-6">
            <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Instrument Terms</p>
            <TermsSummary terms={deal.terms} instrumentType={deal.instrumentType} />
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
          disabled={isSubmitting || !commitmentAmount}
          className="px-8 py-3 rounded-lg text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#0B1C2D", color: "#fff" }}
        >
          {isSubmitting ? "Processing..." : "Continue to Subscription"}
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
  const allConfirmed = confirmedQualifiedInvestor && confirmedUnderstandsRisks && confirmedOwnAccount && confirmedNoLiquidityExpectation && eSignature.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* Investment Summary */}
      {investmentSummary && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Investment Summary</h3>
          <div className="space-y-3">
            <SummaryRow label="Commitment Amount" value={`$${investmentSummary.commitmentAmount.toLocaleString()}`} />
            <SummaryRow label={`Platform Fee (${investmentSummary.platformFeeRate})`} value={`$${investmentSummary.platformFee.toLocaleString()}`} />
            <div className="border-t border-gray-200 pt-3">
              <SummaryRow label="Net Investment" value={`$${investmentSummary.netInvestment.toLocaleString()}`} bold />
            </div>
            {investmentSummary.ownershipEstimate && (
              <SummaryRow label="Estimated Ownership" value={investmentSummary.ownershipEstimate} highlight />
            )}
            {investmentSummary.conversionEstimate && (
              <SummaryRow label="Estimated Conversion" value={investmentSummary.conversionEstimate} highlight />
            )}
            {investmentSummary.expectedReturn && (
              <SummaryRow label="Expected Total Return" value={`$${investmentSummary.expectedReturn.toLocaleString()}`} highlight />
            )}
            {investmentSummary.repaymentCap && (
              <SummaryRow label="Repayment Cap" value={investmentSummary.repaymentCap} />
            )}
            {investmentSummary.revenueSharePercentage && (
              <SummaryRow label="Revenue Share %" value={`${investmentSummary.revenueSharePercentage}%`} />
            )}
          </div>
        </div>
      )}

      {/* Subscription Agreement */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Step 2: Subscription Agreement</h2>
        <p className="text-sm text-gray-500 mb-6">
          By subscribing, you confirm that you meet the eligibility requirements and acknowledge the risks associated with this private market investment.
        </p>

        {/* Investor Representations */}
        <div className="space-y-4 mb-8">
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Investor Representations</p>

          <RepresentationCheckbox
            checked={confirmedQualifiedInvestor}
            onChange={setConfirmedQualifiedInvestor}
            label="I am a qualified investor as defined under the applicable securities regulations of my jurisdiction, and I meet the minimum financial thresholds required to participate in this offering."
          />

          <RepresentationCheckbox
            checked={confirmedUnderstandsRisks}
            onChange={setConfirmedUnderstandsRisks}
            label="I understand that this investment involves substantial risk, including the potential loss of the entire invested amount. Private market investments are speculative and may not generate returns."
          />

          <RepresentationCheckbox
            checked={confirmedOwnAccount}
            onChange={setConfirmedOwnAccount}
            label="I am investing for my own account (or for an account over which I exercise sole investment discretion) and not with a view to resale or distribution."
          />

          <RepresentationCheckbox
            checked={confirmedNoLiquidityExpectation}
            onChange={setConfirmedNoLiquidityExpectation}
            label="I understand that there is no public market for this investment and that I should not expect liquidity. I am prepared to hold this investment for an indefinite period."
          />
        </div>

        {/* Electronic Signature */}
        <div className="border-t border-gray-200 pt-6">
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">Electronic Signature</p>
          <p className="text-xs text-gray-500 mb-3">
            By typing your full legal name below, you are executing this subscription agreement electronically. This signature carries the same legal force as a handwritten signature.
          </p>
          <input
            type="text"
            value={eSignature}
            onChange={(e) => setESignature(e.target.value)}
            placeholder="Type your full legal name"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base text-gray-900 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none"
            style={{ fontFamily: "'Brush Script MT', 'Segoe Script', cursive" }}
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
          {isSubmitting ? "Executing..." : "Execute Subscription Agreement"}
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
      description: "International or domestic wire transfer to our escrow account. Recommended for amounts over $25,000.",
      timeline: "2-3 business days",
    },
    {
      id: "ach",
      label: "ACH Transfer",
      description: "Automated clearing house transfer from a U.S. bank account. Lower fees, suitable for domestic transfers.",
      timeline: "3-5 business days",
    },
    {
      id: "escrow",
      label: "Escrow Service",
      description: "Third-party escrow agent holds funds until closing conditions are met. Additional escrow fees may apply.",
      timeline: "1-2 business days after escrow setup",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Step 3: Funding Method</h2>
        <p className="text-sm text-gray-500 mb-6">
          Select how you will transfer your committed capital of <strong>${Number(investment.commitmentAmount).toLocaleString()}</strong> to the escrow account. You will receive detailed transfer instructions after selection.
        </p>

        <div className="space-y-3">
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
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  fundingMethod === method.id ? "border-gray-900" : "border-gray-300"
                }`}>
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
                  <p className="text-sm font-semibold text-gray-900">{method.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{method.description}</p>
                  <p className="text-xs text-gray-400 mt-1">Expected settlement: {method.timeline}</p>
                </div>
              </div>
            </label>
          ))}
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
          {isSubmitting ? "Processing..." : "Get Transfer Instructions"}
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
  const isFunded = investment.status === "FUNDED" || investment.status === "ACTIVE";

  return (
    <div className="space-y-6">
      {/* Status */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
        <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${isFunded ? "bg-green-100" : "bg-amber-100"}`}>
          {isFunded ? (
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {isFunded ? "Investment Confirmed" : "Awaiting Fund Transfer"}
        </h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          {isFunded
            ? "Your funds have been received and verified. Your investment is now active."
            : "Your subscription has been executed. Please transfer funds using the instructions below. An administrator will confirm receipt."}
        </p>
      </div>

      {/* Wire Instructions */}
      {wireInstructions && !isFunded && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Transfer Instructions</h3>
          <div className="space-y-3 mb-4">
            <InstructionRow label="Bank Name" value={wireInstructions.bankName} />
            <InstructionRow label="Account Name" value={wireInstructions.accountName} />
            <InstructionRow label="Account Number" value={wireInstructions.accountNumber} />
            <InstructionRow label="Routing Number" value={wireInstructions.routingNumber} />
            {wireInstructions.swiftCode && <InstructionRow label="SWIFT/BIC" value={wireInstructions.swiftCode} />}
            <div className="border-t border-gray-200 pt-3">
              <InstructionRow label="Reference Code" value={wireInstructions.reference} highlight />
            </div>
            <InstructionRow label="Amount" value={`$${Number(wireInstructions.amount).toLocaleString()} USD`} />
            <InstructionRow
              label="Deadline"
              value={new Date(wireInstructions.deadline).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            />
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
        <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Investment Details</h3>
        <div className="space-y-3">
          <SummaryRow label="Deal" value={deal.name} />
          <SummaryRow label="Company" value={deal.company.tradingName || deal.company.legalName} />
          <SummaryRow label="Instrument" value={instrumentLabels[deal.instrumentType] || deal.instrumentType} />
          <SummaryRow label="Commitment" value={`$${Number(investment.commitmentAmount).toLocaleString()}`} bold />
          <SummaryRow label="Status" value={investment.status.replace(/_/g, " ")} />
          {investment.fundingReference && <SummaryRow label="Reference" value={investment.fundingReference} />}
          {investment.fundingMethod && <SummaryRow label="Funding Method" value={investment.fundingMethod.toUpperCase()} />}
        </div>
      </div>

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
          Return to Dashboard
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
      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
        checked ? "bg-gray-900 border-gray-900" : "border-gray-300 group-hover:border-gray-400"
      }`}>
        {checked && (
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
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

function SummaryRow({ label, value, bold, highlight }: { label: string; value: string; bold?: boolean; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-sm ${bold ? "font-bold text-gray-900" : highlight ? "font-semibold text-green-700" : "font-medium text-gray-900"}`}>{value}</p>
    </div>
  );
}

function InstructionRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`text-sm font-mono ${highlight ? "font-bold text-gray-900 bg-yellow-100 px-2 py-0.5 rounded" : "font-medium text-gray-900"}`}>
        {value}
      </p>
    </div>
  );
}

function TermsSummary({ terms, instrumentType }: { terms: any; instrumentType: string }) {
  if (!terms) return null;

  const rows: { label: string; value: string }[] = [];

  if (instrumentType === "SAFE" || instrumentType === "CONVERTIBLE_NOTE") {
    if (terms.valuationCap || terms.valuation_cap) rows.push({ label: "Valuation Cap", value: `$${Number(terms.valuationCap || terms.valuation_cap).toLocaleString()}` });
    if (terms.discount) rows.push({ label: "Discount", value: `${terms.discount}%` });
    if (terms.interestRate) rows.push({ label: "Interest Rate", value: `${terms.interestRate}%` });
    if (terms.maturityDate) rows.push({ label: "Maturity", value: terms.maturityDate });
  } else if (instrumentType === "SPV_EQUITY") {
    if (terms.preMoneyValuation || terms.valuation) rows.push({ label: "Pre-money Valuation", value: `$${Number(terms.preMoneyValuation || terms.valuation).toLocaleString()}` });
    if (terms.shareClass) rows.push({ label: "Share Class", value: terms.shareClass });
  } else if (instrumentType === "REVENUE_SHARE_NOTE" || instrumentType === "ASSET_BACKED_PARTICIPATION") {
    if (terms.revenueSharePercentage || terms.revenueShare) rows.push({ label: "Revenue Share", value: `${terms.revenueSharePercentage || terms.revenueShare}%` });
    if (terms.repaymentCap || terms.returnCap) rows.push({ label: "Repayment Cap", value: `${terms.repaymentCap || terms.returnCap}x` });
    if (terms.paymentFrequency) rows.push({ label: "Payment Frequency", value: terms.paymentFrequency });
  }

  if (rows.length === 0) return <p className="text-xs text-gray-400">Terms details not available</p>;

  return (
    <div className="space-y-2">
      {rows.map((row, i) => (
        <div key={i} className="flex items-center justify-between">
          <span className="text-xs text-gray-500">{row.label}</span>
          <span className="text-xs font-semibold text-gray-800">{row.value}</span>
        </div>
      ))}
    </div>
  );
}
