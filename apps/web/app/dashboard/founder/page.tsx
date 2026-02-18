"use client";

import { useAuth } from "@/lib/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

type AdminAction = {
  id: string;
  actionType: string;
  reason: string | null;
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
};

export default function FounderDashboard() {
  const { user, accessToken, loading, signOut } = useAuth();
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [adminActions, setAdminActions] = useState<
    Record<string, AdminAction | null>
  >({});

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  // Fetch founder's companies
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
          setCompanies(data.data);

          // Fetch admin actions for companies that are REJECTED or INFO_REQUESTED
          const needsAction = (data.data as Company[]).filter(
            (c) =>
              c.approvalStatus === "REJECTED" ||
              c.approvalStatus === "INFO_REQUESTED",
          );
          if (needsAction.length > 0) {
            const actionResults: Record<string, AdminAction | null> = {};
            await Promise.all(
              needsAction.map(async (c) => {
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
    }

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
}: {
  company: Company;
  adminAction: AdminAction | null;
}) {
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

          {/* Right: Status Badge */}
          <div className="flex-shrink-0">
            <span
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border ${status.bg} ${status.color}`}
            >
              <span className="w-2 h-2 rounded-full bg-current"></span>
              {status.label}
            </span>
          </div>
        </div>
      </div>

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
    </div>
  );
}
