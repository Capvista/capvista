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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const userInitials = `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase() || "U";
  const userFullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0A1F44] to-[#10B981]" />
              <span className="text-xl font-semibold text-[#0A1F44]">Capvista</span>
            </Link>
            <nav className="flex items-center gap-6">
              <button
                onClick={() => setActiveTab("overview")}
                className={`text-sm font-medium transition-colors ${
                  activeTab === "overview"
                    ? "text-[#0A1F44]"
                    : "text-gray-600 hover:text-[#0A1F44]"
                }`}
              >
                Dashboard
              </button>
              <Link
                href="/dashboard/investor/companies"
                className="text-sm font-medium text-gray-600 hover:text-[#0A1F44] transition-colors"
              >
                Browse
              </Link>
              <button
                onClick={() => setActiveTab("portfolio")}
                className={`text-sm font-medium transition-colors ${
                  activeTab === "portfolio"
                    ? "text-[#0A1F44]"
                    : "text-gray-600 hover:text-[#0A1F44]"
                }`}
              >
                Portfolio
              </button>

              {/* Profile avatar with dropdown */}
              <div className="relative group">
                <div className="w-10 h-10 rounded-full bg-[#10B981] flex items-center justify-center text-white text-sm font-semibold cursor-pointer">
                  {userInitials}
                </div>
                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="font-semibold text-gray-900">{userFullName}</p>
                    <p className="text-sm text-gray-500">Investor</p>
                  </div>
                  <button
                    onClick={() => router.push("/dashboard/investor/complete-profile")}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-sm text-gray-700">Manage Profile</span>
                  </button>
                  <button
                    onClick={signOut}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="text-sm text-gray-700">Log Out</span>
                  </button>
                </div>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" && (
          <OverviewTab user={user} router={router} />
        )}
        {activeTab === "opportunities" && <OpportunitiesTab />}
        {activeTab === "watchlist" && <WatchlistTab />}
        {activeTab === "portfolio" && <PortfolioTab router={router} />}
      </div>
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

  const stats = [
    {
      label: "Total Invested",
      value: investmentsLoading ? "..." : formatCurrency(summary?.totalCommitted || 0),
      subtitle: `Across ${summary?.investmentCount || 0} deal${summary?.investmentCount !== 1 ? "s" : ""}`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "text-[#10B981]",
      bg: "bg-emerald-50",
    },
    {
      label: "Active Commitments",
      value: investmentsLoading ? "..." : String(summary?.activeCount || 0),
      subtitle: summary?.activeCount ? "Active positions" : "No active positions",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Portfolio Companies",
      value: investmentsLoading ? "..." : String(summary?.investmentCount || 0),
      subtitle: "Unique companies",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: "text-[#0A1F44]",
      bg: "bg-slate-50",
    },
    {
      label: "Avg. Return",
      value: investmentsLoading
        ? "..."
        : summary?.totalCurrentValue && summary.totalFunded
          ? `${((summary.totalCurrentValue / summary.totalFunded - 1) * 100).toFixed(1)}%`
          : "N/A",
      subtitle: summary?.totalReturned ? formatCurrency(summary.totalReturned) + " returned" : "No returns yet",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner — green gradient */}
      <div className="bg-gradient-to-r from-[#10B981] to-[#059669] rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user.firstName}!
        </h1>
        <p className="text-emerald-100 text-lg">
          Discover your next investment opportunity
        </p>
      </div>

      {/* Stats Grid — 4 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500">{stat.label}</span>
              <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
            <p className="text-2xl font-bold text-[#0A1F44] mb-1">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Search Bar + Browse All */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search companies, deals, sectors..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                router.push("/dashboard/investor/companies");
              }
            }}
          />
        </div>
        <button
          onClick={() => router.push("/dashboard/investor/companies")}
          className="px-6 py-3 bg-[#0A1F44] text-white rounded-xl text-sm font-medium hover:bg-[#0A1F44]/90 transition-colors whitespace-nowrap"
        >
          Browse All
        </button>
      </div>

      {/* Profile Status + Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Profile Status Card */}
        {profileStatus === "loading" ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gray-100" />
              <div className="flex-1">
                <div className="h-4 w-32 bg-gray-100 rounded mb-2" />
                <div className="h-3 w-48 bg-gray-100 rounded" />
              </div>
            </div>
          </div>
        ) : profileStatus === "incomplete" ? (
          <button
            onClick={() => router.push("/dashboard/investor/complete-profile")}
            className="bg-amber-50 rounded-xl border-2 border-amber-200 p-6 hover:border-amber-300 transition-all group text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-amber-900">Complete Your Profile</h3>
                <p className="text-sm text-amber-700 mt-0.5">Required before you can invest</p>
              </div>
            </div>
          </button>
        ) : profileStatus === "PENDING" ? (
          <div className="bg-blue-50 rounded-xl border-2 border-blue-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Profile Under Review</h3>
                <p className="text-sm text-blue-700 mt-0.5">Your investor profile is being reviewed</p>
              </div>
            </div>
          </div>
        ) : profileStatus === "VERIFIED" ? (
          <div className="bg-green-50 rounded-xl border-2 border-green-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-green-900">Profile Verified</h3>
                <p className="text-sm text-green-700 mt-0.5">You're verified and ready to invest</p>
              </div>
            </div>
          </div>
        ) : profileStatus === "REJECTED" ? (
          <div className="bg-red-50 rounded-xl border-2 border-red-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-red-900">Profile Rejected</h3>
                {adminReason && (
                  <p className="text-sm text-red-700 mt-1">{adminReason}</p>
                )}
              </div>
            </div>
          </div>
        ) : profileStatus === "INFO_REQUESTED" ? (
          <button
            onClick={() => router.push("/dashboard/investor/complete-profile")}
            className="bg-orange-50 rounded-xl border-2 border-orange-200 p-6 hover:border-orange-300 transition-all group text-left"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-orange-900">Additional Information Required</h3>
                {adminReason && (
                  <p className="text-sm text-orange-700 mt-1">{adminReason}</p>
                )}
                <p className="text-sm text-orange-600 mt-2 font-medium group-hover:underline">
                  Update your profile &rarr;
                </p>
              </div>
            </div>
          </button>
        ) : null}

        {/* Browse Companies Quick Action */}
        <button
          onClick={() => router.push("/dashboard/investor/companies")}
          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md hover:border-gray-300 transition-all group text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-[#0A1F44] group-hover:text-[#10B981] transition-colors">Browse Companies</h3>
              <p className="text-sm text-gray-500 mt-0.5">Explore verified opportunities</p>
            </div>
            <svg className="w-5 h-5 text-gray-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>

      {/* Featured Deals / My Investments */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#0A1F44]">
            {investments.length > 0 ? "Active Investments" : "Featured Deals"}
          </h2>
          {investments.length > 0 && (
            <button
              onClick={() => router.push("/dashboard/investor/companies")}
              className="text-sm font-medium text-[#10B981] hover:text-[#059669] transition-colors"
            >
              Browse more deals &rarr;
            </button>
          )}
        </div>

        {investmentsLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gray-100" />
                  <div className="flex-1">
                    <div className="h-4 w-32 bg-gray-100 rounded mb-2" />
                    <div className="h-3 w-20 bg-gray-100 rounded" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-3 w-full bg-gray-100 rounded" />
                  <div className="h-3 w-2/3 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : investments.length === 0 ? (
          /* Empty State — styled like Featured Deals placeholders */
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#0A1F44] mb-2">No active investments yet</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Browse companies to discover your next investment opportunity.
            </p>
            <Link
              href="/dashboard/investor/companies"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#10B981] text-white rounded-xl text-sm font-medium hover:bg-[#059669] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Browse Companies
            </Link>
          </div>
        ) : (
          /* Investment Cards — Figma card layout */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {investments.map((inv) => {
              const status = statusConfig[inv.status] || statusConfig.INTERESTED;
              const companyName = inv.deal.company.tradingName || inv.deal.company.legalName;
              const laneLabel = laneLabels[inv.deal.lane] || inv.deal.lane;
              const instrumentLabel = instrumentLabels[inv.deal.instrumentType] || inv.deal.instrumentType;
              const progress = inv.deal.targetAmount > 0
                ? Math.min((inv.deal.raisedAmount / inv.deal.targetAmount) * 100, 100)
                : 0;

              return (
                <button
                  key={inv.id}
                  onClick={() => router.push(`/dashboard/investor/investments/${inv.id}`)}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all group text-left"
                >
                  {/* Company header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0A1F44] to-[#10B981] flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {inv.deal.company.logoUrl ? (
                        <img
                          src={inv.deal.company.logoUrl}
                          alt={companyName}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        companyName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-[#0A1F44] truncate group-hover:text-[#10B981] transition-colors">
                        {companyName}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">{inv.deal.name}</p>
                    </div>
                    <span
                      className="inline-block px-2.5 py-1 rounded-full text-xs font-medium shrink-0"
                      style={{ backgroundColor: status.bg, color: status.text }}
                    >
                      {status.label}
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="flex items-center gap-2 mb-4">
                    {inv.deal.company.sector && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">{inv.deal.company.sector}</span>
                    )}
                    <span
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{
                        backgroundColor: inv.deal.lane === "YIELD" ? "#EFF6FF" : "#F5F3FF",
                        color: inv.deal.lane === "YIELD" ? "#1D4ED8" : "#7C3AED",
                      }}
                    >
                      {laneLabel}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">{instrumentLabel}</span>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Committed</p>
                      <p className="text-sm font-semibold text-[#0A1F44]">{formatCurrency(Number(inv.commitmentAmount))}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Current Value</p>
                      <p className="text-sm font-semibold text-[#0A1F44]">{formatCurrency(Number(inv.currentValue))}</p>
                    </div>
                  </div>

                  {/* Status-specific details */}
                  {inv.status === "PENDING_FUNDING" && (
                    <div className="text-xs text-gray-500 space-y-0.5 mb-4">
                      {inv.fundingReference && (
                        <p>Ref: <span className="font-mono">{inv.fundingReference}</span></p>
                      )}
                      {inv.fundingDeadline && (
                        <p>Due: {formatDate(inv.fundingDeadline)}</p>
                      )}
                    </div>
                  )}

                  {(inv.status === "FUNDED" || inv.status === "ACTIVE") && Number(inv.totalReturned) > 0 && (
                    <p className="text-xs text-[#10B981] font-medium mb-4">
                      +{formatCurrency(Number(inv.totalReturned))} returned
                    </p>
                  )}

                  {/* Deal progress bar */}
                  {inv.deal.targetAmount > 0 && (
                    <div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>{formatCurrency(inv.deal.raisedAmount)} raised</span>
                        <span>{formatCurrency(inv.deal.targetAmount)} target</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="bg-[#10B981] h-1.5 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* View Details link */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <span className="text-sm font-medium text-[#10B981] group-hover:text-[#059669] transition-colors">
                      View Details &rarr;
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Investments Empty State (bottom section) */}
      {!investmentsLoading && investments.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#0A1F44]">Active Investments</h2>
          </div>
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-gray-100 mx-auto mb-3 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">Your active investments will appear here once you commit to a deal.</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Market Opportunities Tab
function OpportunitiesTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-[#0A1F44] mb-2">
          Market Opportunities
        </h2>
        <p className="text-gray-500 mb-8">
          Find active opportunities to invest in
        </p>

        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[#0A1F44] mb-2">
            No Live Opportunities
          </h3>
          <p className="text-gray-500">
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
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-[#0A1F44] mb-2">
          Your Watchlist
        </h2>
        <p className="text-gray-500 mb-8">
          Track the private companies that matter to you
        </p>

        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[#0A1F44] mb-2">
            No Companies Saved
          </h3>
          <p className="text-gray-500">
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
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-[#0A1F44] mb-2">
          Your Portfolio
        </h2>
        <p className="text-gray-500 mb-8">
          Track your investments and returns
        </p>

        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[#0A1F44] mb-2">
            No Investments Yet
          </h3>
          <p className="text-gray-500 mb-6">
            Start investing to build your portfolio
          </p>
          <button
            onClick={() => router.push("/dashboard/investor/companies")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#10B981] text-white rounded-xl text-sm font-medium hover:bg-[#059669] transition-colors"
          >
            Browse Companies
          </button>
        </div>
      </div>
    </div>
  );
}
