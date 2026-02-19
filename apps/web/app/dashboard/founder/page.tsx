"use client";

import { useAuth } from "@/lib/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

type AdminAction = {
  id: string;
  actionType: string;
  reason: string | null;
  createdAt: string;
};

type Deal = {
  id: string;
  name: string;
  lane: string;
  instrumentType: string;
  status: string;
  targetAmount: string;
  raisedAmount: string;
  createdAt: string;
};

type Company = {
  id: string;
  legalName: string;
  tradingName?: string;
  sector: string;
  stage: string;
  preferredLane?: string;
  preferredInstrument?: string;
  targetRaiseRange?: string;
  currentMonitoringStatus: string;
  approvalStatus: string;
  createdAt: string;
  countryOfIncorporation?: string;
  participationStatus?: string;
  participationAcknowledged?: boolean;
  participationExecutedAt?: string;
  participationExecutorSignature?: string;
  boardResolutionUrl?: string;
  shareCertificateUrl?: string;
  shareholderRegisterUrl?: string;
  capTableConfirmationUrl?: string;
};

export default function FounderDashboard() {
  const { user, accessToken, loading, signOut } = useAuth();
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [adminActions, setAdminActions] = useState<
    Record<string, AdminAction | null>
  >({});
  const [companyDeals, setCompanyDeals] = useState<Record<string, Deal[]>>({});

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  const fetchCompanies = async () => {
    if (!accessToken) return;

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const res = await fetch(`${API_URL}/api/companies/my-companies`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (data.success) {
        setCompanies(data.data);

        // Fetch deals for approved companies
        const approvedCompanies = (data.data as Company[]).filter(
          (c: Company) => c.approvalStatus === "APPROVED",
        );
        if (approvedCompanies.length > 0) {
          const dealsResults: Record<string, Deal[]> = {};
          await Promise.all(
            approvedCompanies.map(async (c: Company) => {
              try {
                const dealsRes = await fetch(
                  `${API_URL}/api/deals?companyId=${c.id}&status=ALL`,
                  { headers: { Authorization: `Bearer ${accessToken}` } },
                );
                const dealsData = await dealsRes.json();
                if (dealsData.success) {
                  dealsResults[c.id] = dealsData.data;
                }
              } catch {
                // Silently fail for individual deal fetches
              }
            }),
          );
          setCompanyDeals(dealsResults);
        }

        // Fetch admin actions for companies that are REJECTED or INFO_REQUESTED
        const needsAction = (data.data as Company[]).filter(
          (c: Company) =>
            c.approvalStatus === "REJECTED" ||
            c.approvalStatus === "INFO_REQUESTED",
        );
        if (needsAction.length > 0) {
          const actionResults: Record<string, AdminAction | null> = {};
          await Promise.all(
            needsAction.map(async (c: Company) => {
              try {
                const statusRes = await fetch(
                  `${API_URL}/api/companies/${c.id}/status`,
                  { headers: { Authorization: `Bearer ${accessToken}` } },
                );
                const statusData = await statusRes.json();
                if (statusData.success) {
                  actionResults[c.id] = statusData.data.latestAction;
                }
              } catch {
                // Silently fail for individual status fetches
              }
            }),
          );
          setAdminActions(actionResults);
        }
      }
    } catch (err) {
      console.error("Failed to fetch companies:", err);
    } finally {
      setLoadingCompanies(false);
    }
  };

  // Fetch founder's companies
  useEffect(() => {
    if (!loading && user) {
      fetchCompanies();
    }
  }, [user, loading, accessToken]);

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

  const firstName = user.firstName || "";
  const lastName = user.lastName || "";
  const userInitial = firstName.charAt(0).toUpperCase() || "U";
  const userFullName = `${firstName} ${lastName}`.trim();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F6F8FA" }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container">
          <div className="flex items-center justify-between py-4">
            <Link href="/" className="flex items-center space-x-2">
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

            <div className="relative group">
              <div className="w-10 h-10 rounded-full bg-primary-950 text-white font-semibold flex items-center justify-center hover:bg-primary-900 transition-colors cursor-pointer">
                {userInitial}
              </div>
              <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="font-semibold text-gray-900">{userFullName}</p>
                  <p className="text-sm text-gray-600">Founder</p>
                </div>
                <button
                  onClick={signOut}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
                >
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span className="font-medium text-gray-900">Log Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
          <h1 className="text-3xl font-bold text-primary-950 mb-2">
            Welcome, {firstName}!
          </h1>
          <p className="text-slate-light">
            {companies.length > 0
              ? "Here's the status of your company applications"
              : "Let's get your company listed on Capvista"}
          </p>
        </div>

        {/* Loading */}
        {loadingCompanies ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading your companies...</p>
          </div>
        ) : companies.length > 0 ? (
          /* Company Cards */
          <div className="space-y-4">
            {companies.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                adminAction={adminActions[company.id] || null}
                deals={companyDeals[company.id] || []}
                accessToken={accessToken}
                onRefresh={fetchCompanies}
              />
            ))}

            {/* Add Another (optional future feature) */}
            <div className="bg-white rounded-2xl shadow-sm border border-dashed border-gray-300 p-6 text-center">
              <p className="text-sm text-gray-500">
                Need to submit another company?{" "}
                <Link
                  href="/dashboard/founder/onboarding"
                  className="font-semibold hover:underline"
                  style={{ color: "#0B1C2D" }}
                >
                  Start New Application
                </Link>
              </p>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: "rgba(200, 162, 77, 0.1)" }}
            >
              <svg
                className="w-8 h-8"
                style={{ color: "#C8A24D" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-primary-950 mb-2">
              No Company Profile Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Complete your company onboarding to get listed and connect with
              investors
            </p>
            <Link
              href="/dashboard/founder/onboarding"
              className="inline-block px-6 py-3 rounded-lg font-semibold transition-all"
              style={{ backgroundColor: "#C8A24D", color: "#0B1C2D" }}
            >
              Start Onboarding
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

// ============================================================================
// COMPANY CARD COMPONENT
// ============================================================================
function CompanyCard({
  company,
  adminAction,
  deals,
  accessToken,
  onRefresh,
}: {
  company: Company;
  adminAction: AdminAction | null;
  deals: Deal[];
  accessToken: string | null;
  onRefresh: () => void;
}) {
  const [showSignModal, setShowSignModal] = useState(false);
  const [signingName, setSigningName] = useState("");
  const [signingConfirmed, setSigningConfirmed] = useState(false);
  const [signingLoading, setSigningLoading] = useState(false);
  const [uploadingDocs, setUploadingDocs] = useState(false);
  const [docFiles, setDocFiles] = useState<{
    boardResolution: File | null;
    shareCertificate: File | null;
    shareholderRegister: File | null;
    capTable: File | null;
  }>({ boardResolution: null, shareCertificate: null, shareholderRegister: null, capTable: null });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const handleSignAgreement = async () => {
    if (!signingName.trim() || !signingConfirmed || !accessToken) return;
    setSigningLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/companies/${company.id}/sign-participation`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ signature: signingName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setShowSignModal(false);
        setSigningName("");
        setSigningConfirmed(false);
        onRefresh();
      } else {
        alert(data.error?.message || "Failed to sign agreement");
      }
    } catch {
      alert("Failed to sign agreement. Please try again.");
    } finally {
      setSigningLoading(false);
    }
  };

  const uploadDocToSupabase = async (file: File, docType: string): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${company.id}/${docType}-${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage
      .from("participation_documents")
      .upload(fileName, file);
    if (error) throw error;
    const { data: urlData } = supabase.storage
      .from("participation_documents")
      .getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  const handleUploadDocs = async () => {
    if (!docFiles.boardResolution || !docFiles.shareCertificate || !docFiles.shareholderRegister || !docFiles.capTable || !accessToken) return;
    setUploadingDocs(true);
    try {
      const [boardResolutionUrl, shareCertificateUrl, shareholderRegisterUrl, capTableConfirmationUrl] = await Promise.all([
        uploadDocToSupabase(docFiles.boardResolution, "board-resolution"),
        uploadDocToSupabase(docFiles.shareCertificate, "share-certificate"),
        uploadDocToSupabase(docFiles.shareholderRegister, "shareholder-register"),
        uploadDocToSupabase(docFiles.capTable, "cap-table"),
      ]);
      const res = await fetch(`${API_URL}/api/companies/${company.id}/upload-issuance-docs`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ boardResolutionUrl, shareCertificateUrl, shareholderRegisterUrl, capTableConfirmationUrl }),
      });
      const data = await res.json();
      if (data.success) {
        onRefresh();
      } else {
        alert(data.error?.message || "Failed to upload documents");
      }
    } catch (err) {
      console.error("Upload docs error:", err);
      alert("Failed to upload documents. Please try again.");
    } finally {
      setUploadingDocs(false);
    }
  };

  const statusConfig: Record<
    string,
    { label: string; color: string; bg: string }
  > = {
    PENDING_REVIEW: {
      label: "Pending Review",
      color: "text-amber-700",
      bg: "bg-amber-50 border-amber-200",
    },
    IN_REVIEW: {
      label: "In Review",
      color: "text-blue-700",
      bg: "bg-blue-50 border-blue-200",
    },
    APPROVED: {
      label: "Approved",
      color: "text-green-700",
      bg: "bg-green-50 border-green-200",
    },
    REJECTED: {
      label: "Rejected",
      color: "text-red-700",
      bg: "bg-red-50 border-red-200",
    },
    INFO_REQUESTED: {
      label: "More Info Requested",
      color: "text-orange-700",
      bg: "bg-orange-50 border-orange-200",
    },
    ACTIVE: {
      label: "Active",
      color: "text-green-700",
      bg: "bg-green-50 border-green-200",
    },
  };

  const status =
    statusConfig[company.approvalStatus] || statusConfig.PENDING_REVIEW;
  const submittedDate = new Date(company.createdAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  const sectorLabels: Record<string, string> = {
    FINTECH: "Fintech",
    LOGISTICS: "Logistics",
    ENERGY: "Energy",
    CONSUMER_FMCG: "Consumer / FMCG",
    HEALTH: "Health",
    AGRI_FOOD: "Agri / Food",
    REAL_ESTATE: "Real Estate",
    INFRASTRUCTURE: "Infrastructure",
    SAAS_TECH: "SaaS / Tech",
    AI: "AI / ML",
    MANUFACTURING: "Manufacturing",
  };

  const stageLabels: Record<string, string> = {
    PRE_REVENUE: "Pre-revenue",
    EARLY_REVENUE: "Early Revenue",
    GROWTH: "Growth",
    PROFITABLE: "Profitable",
  };

  const laneLabels: Record<string, string> = {
    YIELD: "Yield",
    VENTURES: "Ventures",
  };

  const showAdminMessage =
    adminAction?.reason &&
    (company.approvalStatus === "REJECTED" ||
      company.approvalStatus === "INFO_REQUESTED");

  return (
    <div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          {/* Left: Company Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "rgba(200, 162, 77, 0.1)" }}
              >
                <svg
                  className="w-5 h-5"
                  style={{ color: "#C8A24D" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-primary-950">
                  {company.tradingName || company.legalName}
                </h3>
                {company.tradingName && (
                  <p className="text-xs text-gray-500">{company.legalName}</p>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                {sectorLabels[company.sector] || company.sector}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                {stageLabels[company.stage] || company.stage}
              </span>
              {company.preferredLane && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  {laneLabels[company.preferredLane] || company.preferredLane}
                </span>
              )}
              {company.targetRaiseRange && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  {company.targetRaiseRange}
                </span>
              )}
            </div>

            {/* Submitted Date */}
            <p className="text-sm text-gray-500">
              <svg
                className="w-4 h-4 inline mr-1 -mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Submitted {submittedDate}
            </p>
          </div>

          {/* Right: Status Badge + Deal Action */}
          <div className="flex-shrink-0 flex flex-col items-end gap-3">
            <span
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border ${status.bg} ${status.color}`}
            >
              <span className="w-2 h-2 rounded-full bg-current"></span>
              {status.label}
            </span>

            {/* Deal Creation Action */}
            {company.approvalStatus === "APPROVED" && (
              <div className="flex flex-col items-end gap-2">
                <Link
                  href={`/dashboard/founder/deals/create?companyId=${company.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
                  style={{ backgroundColor: "#C8A24D", color: "#0B1C2D" }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Create Deal
                </Link>
                {company.participationStatus !== "VERIFIED" && (
                  <p className="text-xs text-amber-600 text-right max-w-[220px]">
                    Deals cannot be published until platform participation is verified.
                  </p>
                )}
              </div>
            )}
            {company.approvalStatus === "PENDING_REVIEW" && (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-400 bg-gray-100 cursor-not-allowed">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Awaiting Approval
              </span>
            )}
            {company.approvalStatus === "REJECTED" && (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-400">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Application Rejected
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Sign Participation Agreement — ACKNOWLEDGED state */}
      {company.approvalStatus === "APPROVED" && company.participationStatus === "ACKNOWLEDGED" && (
        <div className="mt-2 bg-amber-50 border border-amber-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-amber-900 mb-1">Action Required: Sign Participation Agreement</h4>
              <p className="text-sm text-amber-800 mb-3">
                Your company has been approved. Before creating a deal, you must execute the Platform Participation Agreement.
              </p>
              <button
                onClick={() => setShowSignModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
                style={{ backgroundColor: "#C8A24D", color: "#0B1C2D" }}
              >
                Sign Agreement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Participation Agreement Executed — show status */}
      {company.approvalStatus === "APPROVED" && company.participationStatus === "EXECUTED" && (
        <div className="mt-2 bg-green-50 border border-green-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h4 className="text-sm font-bold text-green-800">Participation Agreement Executed</h4>
          </div>
          <p className="text-sm text-green-700 mb-1">
            Signed by {company.participationExecutorSignature} on {company.participationExecutedAt ? new Date(company.participationExecutedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : ""}
          </p>
          <p className="text-xs text-green-600">Upload issuance documentation to publish deals.</p>
        </div>
      )}

      {/* Participation VERIFIED — show full status */}
      {company.approvalStatus === "APPROVED" && company.participationStatus === "VERIFIED" && (
        <div className="mt-2 bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-sm font-semibold text-green-800">Platform Participation Verified</span>
          </div>
        </div>
      )}

      {/* Upload Issuance Documents — EXECUTED state */}
      {company.approvalStatus === "APPROVED" && company.participationStatus === "EXECUTED" && (
        <div className="mt-2 bg-white rounded-xl border border-gray-200 p-5">
          <h4 className="text-sm font-bold text-primary-950 mb-1">Upload Issuance Documentation</h4>
          <p className="text-xs text-gray-500 mb-4">The following documents are required before your deal can be published.</p>

          {/* Check if docs already uploaded */}
          {company.boardResolutionUrl && company.shareCertificateUrl && company.shareholderRegisterUrl && company.capTableConfirmationUrl ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-green-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Board Resolution
              </div>
              <div className="flex items-center gap-2 text-sm text-green-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Share Certificate / Warrant Agreement
              </div>
              <div className="flex items-center gap-2 text-sm text-green-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Updated Shareholder Register
              </div>
              <div className="flex items-center gap-2 text-sm text-green-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Updated Cap Table
              </div>
              <p className="text-xs text-amber-600 mt-3 font-medium">Documents submitted. Pending admin verification.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { key: "boardResolution" as const, label: "Board Resolution", desc: "Board resolution approving issuance of equity to Capvista Holdings" },
                { key: "shareCertificate" as const, label: "Share Certificate or Warrant Agreement", desc: "Evidence of equity issuance" },
                { key: "shareholderRegister" as const, label: "Updated Shareholder Register", desc: "Official register showing Capvista Holdings as shareholder" },
                { key: "capTable" as const, label: "Updated Cap Table", desc: "Current capitalization table reflecting the issuance" },
              ].map((doc) => (
                <div key={doc.key} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{doc.label}</p>
                    <p className="text-xs text-gray-500">{doc.desc}</p>
                    {docFiles[doc.key] && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-green-700 font-medium">{docFiles[doc.key]!.name}</span>
                        <button onClick={() => setDocFiles(prev => ({ ...prev, [doc.key]: null }))} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                      </div>
                    )}
                  </div>
                  <label className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer">
                    {docFiles[doc.key] ? "Replace" : "Upload"}
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setDocFiles(prev => ({ ...prev, [doc.key]: file }));
                      }}
                    />
                  </label>
                </div>
              ))}

              <button
                onClick={handleUploadDocs}
                disabled={uploadingDocs || !docFiles.boardResolution || !docFiles.shareCertificate || !docFiles.shareholderRegister || !docFiles.capTable}
                className="w-full mt-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#C8A24D", color: "#0B1C2D" }}
              >
                {uploadingDocs ? "Uploading..." : "Submit Documents"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Deals Section — only for approved companies */}
      {company.approvalStatus === "APPROVED" && (
        <div className="mt-2 bg-white rounded-xl border border-gray-200 p-4">
          {deals.length > 0 ? (
            <>
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Deals ({deals.length})
              </h4>
              <div className="space-y-2">
                {deals.map((deal) => (
                  <DealRow
                    key={deal.id}
                    deal={deal}
                    companyId={company.id}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-400 mb-3">No deals yet</p>
              <Link
                href={`/dashboard/founder/deals/create?companyId=${company.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
                style={{ backgroundColor: "#C8A24D", color: "#0B1C2D" }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Deal
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Admin Message Banner */}
      {showAdminMessage && (
        <div
          className={`mt-2 rounded-xl border p-4 ${
            company.approvalStatus === "REJECTED"
              ? "bg-red-50 border-red-200"
              : "bg-orange-50 border-orange-200"
          }`}
        >
          <div className="flex items-start gap-3">
            <svg
              className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                company.approvalStatus === "REJECTED"
                  ? "text-red-600"
                  : "text-orange-600"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <div>
              <p
                className={`text-sm font-semibold ${
                  company.approvalStatus === "REJECTED"
                    ? "text-red-800"
                    : "text-orange-800"
                }`}
              >
                {company.approvalStatus === "REJECTED"
                  ? "Rejection Reason"
                  : "Admin Message"}
              </p>
              <p
                className={`text-sm mt-1 ${
                  company.approvalStatus === "REJECTED"
                    ? "text-red-700"
                    : "text-orange-700"
                }`}
              >
                {adminAction.reason}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sign Participation Agreement Modal */}
      {showSignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-primary-950">Platform Participation Agreement</h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                This agreement is entered into between <strong>{company.legalName}</strong> (&ldquo;the Company&rdquo;) and <strong>Capvista Holdings</strong> (&ldquo;Capvista&rdquo;).
              </p>

              <div className="space-y-3 text-sm text-gray-700">
                <div>
                  <p className="font-semibold text-gray-900">1. Equity Issuance</p>
                  <p>The Company shall issue to Capvista Holdings equity representing 1% of its fully diluted capitalization.</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">2. Consideration</p>
                  <p>This issuance is in consideration for access to Capvista&apos;s capital infrastructure platform, including but not limited to: company listing, qualified investor access, deal structuring tools, escrow facilitation, and ongoing monitoring services.</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">3. Timing</p>
                  <p>The equity issuance must be completed and documented prior to the publication of any investment offering on the Capvista platform.</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">4. Documentation Required</p>
                  <p>The Company shall provide the following within 30 days of executing this agreement:</p>
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-0.5">
                    <li>Board resolution approving the issuance</li>
                    <li>Share certificate or warrant agreement</li>
                    <li>Updated shareholder register reflecting Capvista Holdings</li>
                    <li>Updated cap table</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">5. Representations</p>
                  <p>The Company represents that:</p>
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-0.5">
                    <li>It has the corporate authority to issue the equity described herein</li>
                    <li>The issuance has been or will be duly authorized by its board of directors</li>
                    <li>The equity will be recorded in the Company&apos;s official register of members</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">6. Governing Law</p>
                  <p>This agreement shall be governed by the laws of {company.countryOfIncorporation || "the Company&apos;s jurisdiction of incorporation"}.</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Date</p>
                    <p className="font-medium text-gray-900">{new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Company</p>
                    <p className="font-medium text-gray-900">{company.legalName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Jurisdiction</p>
                    <p className="font-medium text-gray-900">{company.countryOfIncorporation || "—"}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type your full legal name as electronic signature
                  </label>
                  <input
                    type="text"
                    value={signingName}
                    onChange={(e) => setSigningName(e.target.value)}
                    placeholder="Full legal name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
                  />
                </div>

                <label className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                  <input
                    type="checkbox"
                    checked={signingConfirmed}
                    onChange={(e) => setSigningConfirmed(e.target.checked)}
                    className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-600 mt-0.5"
                  />
                  <span className="text-sm text-gray-700">
                    I confirm that I am authorized to enter into this agreement on behalf of <strong>{company.legalName}</strong>
                  </span>
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => { setShowSignModal(false); setSigningName(""); setSigningConfirmed(false); }}
                className="px-5 py-2.5 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSignAgreement}
                disabled={signingLoading || !signingName.trim() || !signingConfirmed}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#C8A24D", color: "#0B1C2D" }}
              >
                {signingLoading ? "Executing..." : "Execute Agreement"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// DEAL ROW COMPONENT
// ============================================================================
function DealRow({
  deal,
  companyId,
}: {
  deal: Deal;
  companyId: string;
}) {
  const dealStatusConfig: Record<
    string,
    { label: string; color: string; bg: string }
  > = {
    DRAFT: {
      label: "Draft",
      color: "text-gray-600",
      bg: "bg-gray-100",
    },
    UNDER_REVIEW: {
      label: "Under Review",
      color: "text-amber-700",
      bg: "bg-amber-50",
    },
    APPROVED: {
      label: "Approved",
      color: "text-green-700",
      bg: "bg-green-50",
    },
    LIVE: {
      label: "Live",
      color: "text-green-700",
      bg: "bg-green-50",
    },
    CLOSED: {
      label: "Closed",
      color: "text-gray-600",
      bg: "bg-gray-100",
    },
    DEFAULTED: {
      label: "Defaulted",
      color: "text-red-700",
      bg: "bg-red-50",
    },
  };

  const instrumentLabels: Record<string, string> = {
    REVENUE_SHARE_NOTE: "Revenue Share Note",
    ASSET_BACKED_PARTICIPATION: "Asset-Backed Participation",
    CONVERTIBLE_NOTE: "Convertible Note",
    SAFE: "SAFE",
    SPV_EQUITY: "SPV Equity",
  };

  const laneConfig: Record<string, { label: string; color: string; bg: string }> = {
    YIELD: { label: "Yield", color: "text-emerald-700", bg: "bg-emerald-50" },
    VENTURES: { label: "Ventures", color: "text-blue-700", bg: "bg-blue-50" },
  };

  const status = dealStatusConfig[deal.status] || dealStatusConfig.DRAFT;
  const lane = laneConfig[deal.lane] || { label: deal.lane, color: "text-gray-600", bg: "bg-gray-100" };
  const targetAmount = parseFloat(deal.targetAmount);
  const formattedTarget = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(targetAmount);

  return (
    <div className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: "rgba(11, 28, 45, 0.06)" }}
        >
          <svg
            className="w-4 h-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-gray-900">{deal.name}</p>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${lane.bg} ${lane.color}`}
            >
              {lane.label}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {instrumentLabels[deal.instrumentType] || deal.instrumentType} &middot;{" "}
            {formattedTarget}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
        {deal.status === "DRAFT" && (
          <Link
            href={`/dashboard/founder/deals/create?dealId=${deal.id}&companyId=${companyId}`}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Edit
          </Link>
        )}
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}
        >
          {status.label}
        </span>
      </div>
    </div>
  );
}
