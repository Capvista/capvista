"use client";

import { useAuth } from "@/lib/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import CustomSelect from "@/components/CustomSelect";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

type Company = {
  id: string;
  legalName: string;
  tradingName: string;
  oneLineDescription: string;
  sector: string;
  stage: string;
  preferredLane: string;
  preferredInstrument: string;
  targetRaiseRange: string;
  currentMonitoringStatus: string;
  createdAt: string;
  deals: Array<{
    id: string;
    name: string;
    lane: string;
    targetAmount: number;
    raisedAmount: number;
  }>;
};

// Filter options
const sectorOptions = [
  { value: "all", label: "Sector" },
  { value: "FINTECH", label: "Fintech" },
  { value: "LOGISTICS", label: "Logistics" },
  { value: "ENERGY", label: "Energy" },
  { value: "CONSUMER_FMCG", label: "Consumer / FMCG" },
  { value: "HEALTH", label: "Health" },
  { value: "AGRI_FOOD", label: "Agri / Food" },
  { value: "REAL_ESTATE", label: "Real Estate" },
  { value: "INFRASTRUCTURE", label: "Infrastructure" },
  { value: "SAAS_TECH", label: "SaaS / Tech" },
  { value: "MANUFACTURING", label: "Manufacturing" },
];

const subsectorOptions = [
  { value: "all", label: "Subsector" },
  { value: "PAYMENTS", label: "Payments" },
  { value: "LENDING", label: "Lending" },
  { value: "INSURTECH", label: "Insurtech" },
  { value: "WEALTHTECH", label: "Wealthtech" },
  { value: "BLOCKCHAIN", label: "Blockchain" },
];

const stageOptions = [
  { value: "all", label: "Stage" },
  { value: "PRE_REVENUE", label: "Pre-revenue" },
  { value: "EARLY_REVENUE", label: "Early Revenue" },
  { value: "GROWTH", label: "Growth" },
  { value: "PROFITABLE", label: "Profitable" },
];

const laneOptions = [
  { value: "all", label: "Lane" },
  { value: "YIELD", label: "Yield Lane" },
  { value: "VENTURES", label: "Ventures Lane" },
];

export default function BrowseCompanies() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"card" | "list">("card");

  // Quick Filters
  const [quickFilter, setQuickFilter] = useState<string>("all");

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sectorFilter, setSectorFilter] = useState<string>("all");
  const [subsectorFilter, setSubsectorFilter] = useState<string>("all");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [laneFilter, setLaneFilter] = useState<string>("all");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchCompanies();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [
    searchQuery,
    sectorFilter,
    subsectorFilter,
    stageFilter,
    laneFilter,
    quickFilter,
    companies,
  ]);

  const fetchCompanies = async () => {
    try {
      setIsLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError("Not authenticated");
        return;
      }

      const response = await fetch("http://localhost:4000/api/companies", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        setCompanies(result.data);
        setFilteredCompanies(result.data);
      } else {
        setError(result.error?.message || "Failed to fetch companies");
      }
    } catch (err) {
      console.error("Error fetching companies:", err);
      setError("Failed to load companies");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...companies];

    // Quick filters
    if (quickFilter === "recent") {
      filtered.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.legalName.toLowerCase().includes(query) ||
          c.tradingName?.toLowerCase().includes(query) ||
          c.oneLineDescription?.toLowerCase().includes(query),
      );
    }

    if (sectorFilter !== "all") {
      filtered = filtered.filter((c) => c.sector === sectorFilter);
    }

    if (subsectorFilter !== "all") {
      // Subsector logic can be added when we have subsector data
    }

    if (stageFilter !== "all") {
      filtered = filtered.filter((c) => c.stage === stageFilter);
    }

    if (laneFilter !== "all") {
      filtered = filtered.filter((c) => c.preferredLane === laneFilter);
    }

    setFilteredCompanies(filtered);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSectorFilter("all");
    setSubsectorFilter("all");
    setStageFilter("all");
    setLaneFilter("all");
    setQuickFilter("all");
  };

  if (loading || !user) {
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F6F8FA" }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
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
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary-950 mb-2">
            Browse Companies
          </h1>
        </div>

        {/* Quick Filter Pills */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setQuickFilter("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              quickFilter === "all"
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:border-gray-400"
            }`}
          >
            <svg
              className="w-4 h-4 inline mr-1.5 -mt-0.5"
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
            Watchlist
          </button>
          <button
            onClick={() => setQuickFilter("recent")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              quickFilter === "recent"
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:border-gray-400"
            }`}
          >
            Recently Added
          </button>
          <button
            onClick={() => setQuickFilter("most_viewed")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              quickFilter === "most_viewed"
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:border-gray-400"
            }`}
          >
            Most Viewed
          </button>
        </div>

        {/* Search & Filters - Borderless */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search Bar */}
            <div className="relative flex-1 min-w-[200px]">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
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
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for company"
                className="w-full pl-12 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none h-11"
              />
            </div>

            {/* Sector Dropdown */}
            <CustomSelect
              value={sectorFilter}
              onChange={setSectorFilter}
              options={sectorOptions}
              className="min-w-[140px]"
            />

            {/* Subsector Dropdown */}
            <CustomSelect
              value={subsectorFilter}
              onChange={setSubsectorFilter}
              options={subsectorOptions}
              className="min-w-[140px]"
            />

            {/* Stage Dropdown */}
            <CustomSelect
              value={stageFilter}
              onChange={setStageFilter}
              options={stageOptions}
              className="min-w-[140px]"
            />

            {/* Lane Dropdown */}
            <CustomSelect
              value={laneFilter}
              onChange={setLaneFilter}
              options={laneOptions}
              className="min-w-[140px]"
            />

            {/* Reset Button */}
            <button
              onClick={clearFilters}
              className="px-6 py-2.5 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:border-gray-400 transition-all h-11"
            >
              Reset
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded transition-all ${
                  viewMode === "list"
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("card")}
                className={`p-2 rounded transition-all ${
                  viewMode === "card"
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        {!isLoading && !error && (
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              Showing {filteredCompanies.length}{" "}
              {filteredCompanies.length === 1 ? "company" : "companies"}
            </p>
          </div>
        )}

        {/* Companies Grid/List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate">Loading companies...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error Loading Companies
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchCompanies}
              className="px-6 py-3 rounded-lg font-semibold transition-all"
              style={{ backgroundColor: "#C8A24D", color: "#0B1C2D" }}
            >
              Try Again
            </button>
          </div>
        ) : filteredCompanies.length === 0 ? (
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-primary-950 mb-2">
              {companies.length === 0
                ? "No Companies Listed Yet"
                : "No Companies Match Your Filters"}
            </h3>
            <p className="text-gray-600 mb-6">
              {companies.length === 0
                ? "Check back soon for verified investment opportunities"
                : "Try adjusting your filters to see more companies"}
            </p>
            {filteredCompanies.length === 0 && companies.length > 0 && (
              <button
                onClick={clearFilters}
                className="px-6 py-3 rounded-lg font-semibold transition-all border-2 border-gray-300 text-gray-700 hover:border-gray-400"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {viewMode === "card" ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCompanies.map((company) => (
                  <CompanyCard key={company.id} company={company} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCompanies.map((company) => (
                  <CompanyListItem key={company.id} company={company} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

// Company Card Component (Grid View)
function CompanyCard({ company }: { company: Company }) {
  const formatSector = (sector: string) => {
    return sector
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatStage = (stage: string) => {
    return stage
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getLaneBadgeColor = (lane: string) => {
    if (lane === "YIELD") return "bg-blue-100 text-blue-700";
    if (lane === "VENTURES") return "bg-purple-100 text-purple-700";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <Link href={`/dashboard/investor/companies/${company.id}`}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-primary-300 transition-all cursor-pointer group">
        {/* Lane Badge */}
        {company.preferredLane && (
          <div className="mb-4">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getLaneBadgeColor(company.preferredLane)}`}
            >
              {company.preferredLane === "YIELD"
                ? "Yield Lane"
                : "Ventures Lane"}
            </span>
          </div>
        )}

        {/* Company Name */}
        <h3 className="text-xl font-bold text-primary-950 mb-2 group-hover:text-primary-900 transition-colors">
          {company.tradingName || company.legalName}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {company.oneLineDescription}
        </p>

        {/* Meta Info */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
            {formatSector(company.sector)}
          </span>
          <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
            {formatStage(company.stage)}
          </span>
        </div>

        {/* Target Raise */}
        {company.targetRaiseRange && (
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Target Raise</p>
            <p className="text-sm font-semibold text-gray-900">
              {company.targetRaiseRange}
            </p>
          </div>
        )}

        {/* Active Deals */}
        {company.deals && company.deals.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <p className="text-xs font-semibold text-green-700">
                {company.deals.length} active{" "}
                {company.deals.length === 1 ? "deal" : "deals"}
              </p>
            </div>
          </div>
        )}

        {/* View Details Link */}
        <div className="mt-4">
          <div className="flex items-center text-primary-600 group-hover:text-primary-700 text-sm font-semibold">
            View Details
            <svg
              className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Company List Item Component (List View)
function CompanyListItem({ company }: { company: Company }) {
  const formatSector = (sector: string) => {
    return sector
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatStage = (stage: string) => {
    return stage
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getLaneBadgeColor = (lane: string) => {
    if (lane === "YIELD") return "bg-blue-100 text-blue-700";
    if (lane === "VENTURES") return "bg-purple-100 text-purple-700";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <Link href={`/dashboard/investor/companies/${company.id}`}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-primary-300 transition-all cursor-pointer group">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              {/* Lane Badge */}
              {company.preferredLane && (
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getLaneBadgeColor(company.preferredLane)}`}
                >
                  {company.preferredLane === "YIELD"
                    ? "Yield Lane"
                    : "Ventures Lane"}
                </span>
              )}

              {/* Meta Info */}
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                {formatSector(company.sector)}
              </span>
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                {formatStage(company.stage)}
              </span>
            </div>

            {/* Company Name */}
            <h3 className="text-xl font-bold text-primary-950 mb-2 group-hover:text-primary-900 transition-colors">
              {company.tradingName || company.legalName}
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-4">
              {company.oneLineDescription}
            </p>

            {/* Active Deals */}
            {company.deals && company.deals.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <p className="text-xs font-semibold text-green-700">
                  {company.deals.length} active{" "}
                  {company.deals.length === 1 ? "deal" : "deals"}
                </p>
              </div>
            )}
          </div>

          {/* Target Raise */}
          <div className="text-right">
            {company.targetRaiseRange && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Target Raise</p>
                <p className="text-lg font-semibold text-gray-900">
                  {company.targetRaiseRange}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
