"use client";

import { useAuth } from "@/lib/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function InvestorDashboard() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(
    "overview" as "overview" | "opportunities" | "watchlist" | "portfolio",
  );

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

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

  const userInitial = user.firstName?.charAt(0).toUpperCase() || "U";
  const userFullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F6F8FA" }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
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

            {/* Navigation & Profile - grouped together on the right */}
            <div className="flex items-center gap-8">
              <nav className="hidden md:flex items-center space-x-8">
                {/* Explore Dropdown - FIRST */}
                <div className="relative group">
                  <button className="flex items-center gap-1 font-medium text-gray-600 hover:text-primary-950 transition-colors">
                    Explore
                    <svg
                      className="w-4 h-4 group-hover:rotate-180 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Dropdown Menu - RIGHT ALIGNED */}
                  <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <button
                      onClick={() =>
                        router.push("/dashboard/investor/companies")
                      }
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-start gap-3"
                    >
                      <svg
                        className="w-5 h-5 text-gray-600 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      <div>
                        <p className="font-semibold text-gray-900">
                          Browse Companies
                        </p>
                        <p className="text-sm text-gray-600">
                          Explore our curated list of private companies
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab("opportunities")}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-start gap-3"
                    >
                      <svg
                        className="w-5 h-5 text-gray-600 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                      <div>
                        <p className="font-semibold text-gray-900">
                          Market Opportunities
                        </p>
                        <p className="text-sm text-gray-600">
                          Find active opportunities to invest in
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab("watchlist")}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-start gap-3"
                    >
                      <svg
                        className="w-5 h-5 text-gray-600 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                        />
                      </svg>
                      <div>
                        <p className="font-semibold text-gray-900">Watchlist</p>
                        <p className="text-sm text-gray-600">
                          Track the private companies that matter to you
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Dashboard - SECOND */}
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`font-medium transition-colors ${
                    activeTab === "overview"
                      ? "text-primary-950"
                      : "text-gray-600 hover:text-primary-950"
                  }`}
                >
                  Dashboard
                </button>
              </nav>

              {/* Profile Button */}
              <div className="relative group">
                <div className="w-10 h-10 rounded-full bg-primary-950 text-white font-semibold flex items-center justify-center hover:bg-primary-900 transition-colors cursor-pointer">
                  {userInitial}
                </div>

                {/* Profile Dropdown - appears on hover */}
                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="font-semibold text-gray-900">
                      {userFullName}
                    </p>
                    <p className="text-sm text-gray-600">Investor</p>
                  </div>

                  <button
                    onClick={() => {
                      // Navigate to profile page
                    }}
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
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span className="font-medium text-gray-900">
                      Manage Profile
                    </span>
                  </button>

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
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {activeTab === "overview" && (
          <OverviewTab user={user} router={router} />
        )}
        {activeTab === "opportunities" && <OpportunitiesTab />}
        {activeTab === "watchlist" && <WatchlistTab />}
        {activeTab === "portfolio" && <PortfolioTab router={router} />}
      </main>
    </div>
  );
}

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type InvestmentDeal = {
  id: string;
  name: string;
  lane: string;
  instrumentType: string;
  targetAmount: number;
  raisedAmount: number;
  status: string;
  company: {
    id: string;
    legalName: string;
    tradingName?: string;
    sector?: string;
    logoUrl?: string;
  };
};

type Investment = {
  id: string;
  status: string;
  commitmentAmount: number;
  fundedAmount: number;
  currentValue: number;
  totalReturned: number;
  fundingMethod?: string;
  fundingReference?: string;
  fundingDeadline?: string;
  interestedAt: string;
  committedAt?: string;
  fundedAt?: string;
  completedAt?: string;
  deal: InvestmentDeal;
};

type PortfolioSummary = {
  totalCommitted: number;
  totalFunded: number;
  totalCurrentValue: number;
  totalReturned: number;
  investmentCount: number;
  activeCount: number;
};

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  INTERESTED: { label: "Interested", bg: "#F1F5F9", text: "#64748B" },
  COMMITTED: { label: "Committed", bg: "#DBEAFE", text: "#1D4ED8" },
  PENDING_FUNDING: { label: "Pending Funding", bg: "#FEF3C7", text: "#B45309" },
  FUNDED: { label: "Funded", bg: "#D1FAE5", text: "#047857" },
  ACTIVE: { label: "Active", bg: "#D1FAE5", text: "#047857" },
  COMPLETED: { label: "Completed", bg: "#F1F5F9", text: "#64748B" },
  WAITLISTED: { label: "Waitlisted", bg: "#FFEDD5", text: "#C2410C" },
  CANCELLED: { label: "Cancelled", bg: "#FEE2E2", text: "#DC2626" },
};

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

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Overview Tab Component
function OverviewTab({ user, router }: { user: any; router: any }) {
  const { accessToken } = useAuth();
  const [profileStatus, setProfileStatus] = useState<
    "loading" | "incomplete" | "PENDING" | "VERIFIED" | "REJECTED" | "INFO_REQUESTED"
  >("loading");
  const [adminReason, setAdminReason] = useState<string | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [investmentsLoading, setInvestmentsLoading] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      try {
        // First check if profile exists
        const profileRes = await fetch(`${API_URL}/api/investors/profile`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const profileResult = await profileRes.json();

        if (!profileResult.success || !profileResult.data || !profileResult.data.investorType) {
          setProfileStatus("incomplete");
          return;
        }

        // Profile exists — fetch verification status with admin action
        const statusRes = await fetch(`${API_URL}/api/investors/profile/status`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const statusResult = await statusRes.json();

        if (statusResult.success && statusResult.data) {
          const { verificationStatus, latestAction } = statusResult.data;

          // Check if there's an INFO_REQUESTED admin action (even if verificationStatus is still PENDING)
          if (latestAction?.actionType === "INVESTOR_INFO_REQUESTED") {
            setProfileStatus("INFO_REQUESTED");
            setAdminReason(latestAction.reason || null);
          } else if (verificationStatus === "VERIFIED") {
            setProfileStatus("VERIFIED");
          } else if (verificationStatus === "REJECTED") {
            setProfileStatus("REJECTED");
            setAdminReason(latestAction?.reason || null);
          } else {
            setProfileStatus("PENDING");
          }
        } else {
          setProfileStatus("PENDING");
        }
      } catch {
        setProfileStatus("incomplete");
      }
    };
    if (accessToken) checkProfile();
  }, [accessToken]);

  // Fetch investments
  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        const res = await fetch(`${API_URL}/api/investments/my-investments`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const result = await res.json();
        if (result.success && result.data) {
          setInvestments(result.data.investments);
          setSummary(result.data.summary);
        }
      } catch {
        // Silently fail — stats stay at defaults
      } finally {
        setInvestmentsLoading(false);
      }
    };
    if (accessToken) fetchInvestments();
  }, [accessToken]);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-3xl font-bold text-primary-950 mb-2">
          Welcome back, {user.firstName}{" "}
        </h1>
        <p className="text-slate-light">Here's your investment overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Total Committed */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Total Committed
            </h3>
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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-primary-950 mb-1">
            {investmentsLoading ? "..." : formatCurrency(summary?.totalCommitted || 0)}
          </p>
          <p className="text-sm text-gray-500">
            Across {summary?.investmentCount || 0} deal{summary?.investmentCount !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Active Investments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Active Investments
            </h3>
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "rgba(28, 140, 94, 0.1)" }}
            >
              <svg
                className="w-5 h-5 text-emerald"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-primary-950 mb-1">
            {investmentsLoading ? "..." : summary?.activeCount || 0}
          </p>
          <p className="text-sm text-gray-500">
            {summary?.activeCount ? "Active positions" : "No active positions"}
          </p>
        </div>

        {/* Total Returns */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Total Returns
            </h3>
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "rgba(28, 140, 94, 0.1)" }}
            >
              <svg
                className="w-5 h-5 text-emerald"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-primary-950 mb-1">
            {investmentsLoading ? "..." : formatCurrency(summary?.totalReturned || 0)}
          </p>
          <p className="text-sm text-emerald">
            {summary?.totalCurrentValue && summary.totalFunded
              ? `${((summary.totalCurrentValue / summary.totalFunded - 1) * 100).toFixed(1)}% return`
              : "+0% IRR"}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-xl font-bold text-primary-950 mb-6">
          Quick Actions
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={() => router.push("/dashboard/investor/companies")}
            className="flex items-center gap-4 p-6 rounded-xl border-2 border-gray-200 hover:border-primary-900 transition-all group"
          >
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "rgba(200, 162, 77, 0.1)" }}
            >
              <svg
                className="w-6 h-6"
                style={{ color: "#C8A24D" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-primary-950 group-hover:text-primary-900 transition-colors">
                Browse Companies
              </h3>
              <p className="text-sm text-gray-600">
                Explore verified opportunities
              </p>
            </div>
          </button>

          {profileStatus === "loading" ? (
            <div className="flex items-center gap-4 p-6 rounded-xl border-2 border-gray-200">
              <div className="w-12 h-12 rounded-lg bg-gray-100 animate-pulse" />
              <div>
                <div className="h-4 w-32 bg-gray-100 rounded animate-pulse mb-2" />
                <div className="h-3 w-48 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          ) : profileStatus === "incomplete" ? (
            <button
              onClick={() =>
                router.push("/dashboard/investor/complete-profile")
              }
              className="flex items-center gap-4 p-6 rounded-xl border-2 border-amber-300 bg-amber-50 hover:border-amber-400 transition-all group"
            >
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-amber-100">
                <svg
                  className="w-6 h-6 text-amber-600"
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
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-amber-900">
                  Complete Profile
                </h3>
                <p className="text-sm text-amber-700">
                  Required before you can invest
                </p>
              </div>
            </button>
          ) : profileStatus === "PENDING" ? (
            <div className="flex items-center gap-4 p-6 rounded-xl border-2 border-blue-200 bg-blue-50">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-100">
                <svg
                  className="w-6 h-6 text-blue-600"
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
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-blue-900">Profile Pending</h3>
                <p className="text-sm text-blue-700">
                  Your investor profile is being reviewed
                </p>
              </div>
            </div>
          ) : profileStatus === "VERIFIED" ? (
            <div className="flex items-center gap-4 p-6 rounded-xl border-2 border-green-200 bg-green-50">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-100">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-green-900">
                  Profile Verified
                </h3>
                <p className="text-sm text-green-700">
                  You're verified and ready to invest
                </p>
              </div>
            </div>
          ) : profileStatus === "REJECTED" ? (
            <div className="flex items-start gap-4 p-6 rounded-xl border-2 border-red-200 bg-red-50">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-red-100 shrink-0">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-red-900">
                  Profile Rejected
                </h3>
                {adminReason && (
                  <p className="text-sm text-red-700 mt-1">
                    {adminReason}
                  </p>
                )}
              </div>
            </div>
          ) : profileStatus === "INFO_REQUESTED" ? (
            <button
              onClick={() =>
                router.push("/dashboard/investor/complete-profile")
              }
              className="flex items-start gap-4 p-6 rounded-xl border-2 border-orange-300 bg-orange-50 hover:border-orange-400 transition-all group text-left"
            >
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-orange-100 shrink-0">
                <svg
                  className="w-6 h-6 text-orange-600"
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
              </div>
              <div>
                <h3 className="font-semibold text-orange-900">
                  Additional Information Required
                </h3>
                {adminReason && (
                  <p className="text-sm text-orange-700 mt-1">
                    {adminReason}
                  </p>
                )}
                <p className="text-sm text-orange-600 mt-2 font-medium group-hover:underline">
                  Update your profile &rarr;
                </p>
              </div>
            </button>
          ) : null}
        </div>
      </div>

      {/* My Investments Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-primary-950">My Investments</h2>
          {investments.length > 0 && (
            <button
              onClick={() => router.push("/dashboard/investor/companies")}
              className="text-sm font-medium transition-colors"
              style={{ color: "#C8A24D" }}
            >
              Browse more deals
            </button>
          )}
        </div>

        {investmentsLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="p-5 rounded-xl border border-gray-200 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gray-100" />
                  <div className="flex-1">
                    <div className="h-4 w-48 bg-gray-100 rounded mb-2" />
                    <div className="h-3 w-32 bg-gray-100 rounded" />
                  </div>
                  <div className="h-6 w-20 bg-gray-100 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : investments.length === 0 ? (
          <div className="text-center py-12">
            <div
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: "rgba(107, 124, 147, 0.1)" }}
            >
              <svg
                className="w-8 h-8 text-slate-light"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-primary-950 mb-2">
              No active investments
            </h3>
            <p className="text-gray-600 mb-6">
              Browse companies to discover opportunities.
            </p>
            <Link
              href="/dashboard/investor/companies"
              className="inline-block px-6 py-3 rounded-lg font-semibold transition-all"
              style={{ backgroundColor: "#C8A24D", color: "#0B1C2D" }}
            >
              Browse Companies
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {investments.map((inv) => {
              const status = statusConfig[inv.status] || statusConfig.INTERESTED;
              const companyName = inv.deal.company.tradingName || inv.deal.company.legalName;
              const laneLabel = laneLabels[inv.deal.lane] || inv.deal.lane;
              const instrumentLabel = instrumentLabels[inv.deal.instrumentType] || inv.deal.instrumentType;

              return (
                <button
                  key={inv.id}
                  onClick={() => router.push(`/dashboard/investor/investments/${inv.id}`)}
                  className="w-full text-left p-5 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: Company info */}
                    <div className="flex items-start gap-4 min-w-0">
                      {/* Company logo / initial */}
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold"
                        style={{ backgroundColor: "rgba(200, 162, 77, 0.1)", color: "#C8A24D" }}
                      >
                        {inv.deal.company.logoUrl ? (
                          <img
                            src={inv.deal.company.logoUrl}
                            alt={companyName}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          companyName.charAt(0).toUpperCase()
                        )}
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-semibold text-primary-950 group-hover:text-primary-900 truncate">
                          {inv.deal.name}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">{companyName}</p>

                        {/* Instrument type + Lane badge */}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500">{instrumentLabel}</span>
                          <span
                            className="inline-block px-2 py-0.5 rounded text-xs font-medium"
                            style={{
                              backgroundColor: inv.deal.lane === "YIELD" ? "#EFF6FF" : "#F5F3FF",
                              color: inv.deal.lane === "YIELD" ? "#1D4ED8" : "#7C3AED",
                            }}
                          >
                            {laneLabel}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Amount + Status */}
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-primary-950">
                        {formatCurrency(Number(inv.commitmentAmount))}
                      </p>

                      {/* Status badge */}
                      <span
                        className="inline-block px-2.5 py-1 rounded-full text-xs font-medium mt-1"
                        style={{ backgroundColor: status.bg, color: status.text }}
                      >
                        {status.label}
                      </span>

                      {/* Status-specific details */}
                      {inv.status === "PENDING_FUNDING" && (
                        <div className="mt-2 text-xs text-gray-500 space-y-0.5">
                          {inv.fundingReference && (
                            <p>Ref: <span className="font-mono">{inv.fundingReference}</span></p>
                          )}
                          {inv.fundingDeadline && (
                            <p>Due: {formatDate(inv.fundingDeadline)}</p>
                          )}
                        </div>
                      )}

                      {(inv.status === "FUNDED" || inv.status === "ACTIVE") && (
                        <div className="mt-2 text-xs space-y-0.5">
                          <p className="text-gray-500">
                            Value: <span className="font-medium text-primary-950">{formatCurrency(Number(inv.currentValue))}</span>
                          </p>
                          {Number(inv.totalReturned) > 0 && (
                            <p className="text-emerald">
                              +{formatCurrency(Number(inv.totalReturned))} returned
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Market Opportunities Tab
function OpportunitiesTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-primary-950 mb-4">
          Market Opportunities
        </h2>
        <p className="text-slate-light mb-8">
          Find active opportunities to invest in
        </p>

        <div className="text-center py-12">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: "rgba(107, 124, 147, 0.1)" }}
          >
            <svg
              className="w-8 h-8 text-slate-light"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-primary-950 mb-2">
            No Live Opportunities
          </h3>
          <p className="text-gray-600">
            Active investment opportunities will appear here
          </p>
        </div>
      </div>
    </div>
  );
}

// Watchlist Tab
function WatchlistTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-primary-950 mb-4">
          Your Watchlist
        </h2>
        <p className="text-slate-light mb-8">
          Track the private companies that matter to you
        </p>

        <div className="text-center py-12">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: "rgba(107, 124, 147, 0.1)" }}
          >
            <svg
              className="w-8 h-8 text-slate-light"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-primary-950 mb-2">
            No Companies Saved
          </h3>
          <p className="text-gray-600">
            Companies you're interested in will appear here
          </p>
        </div>
      </div>
    </div>
  );
}

// Portfolio Tab Component
function PortfolioTab({ router }: { router: any }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-primary-950 mb-4">
          Your Portfolio
        </h2>
        <p className="text-slate-light mb-8">
          Track your investments and returns
        </p>

        {/* Empty State */}
        <div className="text-center py-12">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: "rgba(107, 124, 147, 0.1)" }}
          >
            <svg
              className="w-8 h-8 text-slate-light"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-primary-950 mb-2">
            No Investments Yet
          </h3>
          <p className="text-gray-600 mb-6">
            Start investing to build your portfolio
          </p>
          <button
            onClick={() => router.push("/dashboard/investor/companies")}
            className="inline-block px-6 py-3 rounded-lg font-semibold transition-all"
            style={{
              backgroundColor: "#C8A24D",
              color: "#0B1C2D",
            }}
          >
            Browse Companies
          </button>
        </div>
      </div>
    </div>
  );
}
