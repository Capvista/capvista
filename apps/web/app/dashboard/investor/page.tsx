"use client";

import { useAuth } from "@/lib/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function InvestorDashboard() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState;
  "overview" | "opportunities" | "watchlist" | ("portfolio" > "overview");

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

// Overview Tab Component
function OverviewTab({ user, router }: { user: any; router: any }) {
  const { accessToken } = useAuth();
  const [profileStatus, setProfileStatus] = useState(
    "loading" as "loading" | "incomplete" | "pending" | "approved",
  );

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        const res = await fetch(`${API_URL}/api/investors/profile`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const result = await res.json();
        if (result.success && result.data) {
          setProfileStatus(
            result.data.verificationStatus === "APPROVED"
              ? "approved"
              : "pending",
          );
        } else {
          setProfileStatus("incomplete");
        }
      } catch {
        setProfileStatus("incomplete");
      }
    };
    if (accessToken) checkProfile();
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
        {/* Total Invested */}
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
          <p className="text-3xl font-bold text-primary-950 mb-1">$0</p>
          <p className="text-sm text-gray-500">Across 0 deals</p>
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
          <p className="text-3xl font-bold text-primary-950 mb-1">0</p>
          <p className="text-sm text-gray-500">No active positions</p>
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
          <p className="text-3xl font-bold text-primary-950 mb-1">$0</p>
          <p className="text-sm text-emerald">+0% IRR</p>
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
          ) : profileStatus === "pending" ? (
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
          ) : (
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
                  Profile Complete
                </h3>
                <p className="text-sm text-green-700">
                  You're verified and ready to invest
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Empty State - Recent Activity */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
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
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-primary-950 mb-2">
          No Recent Activity
        </h3>
        <p className="text-gray-600 mb-6">
          Start exploring companies to see your activity here
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
