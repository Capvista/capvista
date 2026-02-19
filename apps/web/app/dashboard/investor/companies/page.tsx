"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CustomSelect from "@/components/CustomSelect";

type Company = {
  id: string;
  legalName: string;
  tradingName: string;
  oneLineDescription: string;
  sector: string;
  subsector?: string;
  stage: string;
  preferredLane: string;
  preferredInstrument: string;
  targetRaiseRange: string;
  currentMonitoringStatus: string;
  createdAt: string;
  logoUrl?: string;
  deals: Array<{
    id: string;
    name: string;
    lane: string;
    targetAmount: number;
    raisedAmount: number;
  }>;
};

// ============================================================================
// SECTOR & SUBSECTOR DATA
// ============================================================================

const sectorFilterOptions = [
  { value: "all", label: "Sector" },
  { value: "FINTECH", label: "Financial Services" },
  { value: "ENERGY", label: "Energy & Climate" },
  { value: "LOGISTICS", label: "Logistics & Mobility" },
  { value: "AGRI_FOOD", label: "Agriculture & Food" },
  { value: "TECHNOLOGY", label: "Technology & Software" },
  { value: "SAAS_TECH", label: "SaaS / Tech" },
  { value: "HEALTH", label: "Healthcare & Life Sciences" },
  { value: "CONSUMER_FMCG", label: "Consumer & Retail" },
  { value: "REAL_ESTATE", label: "Real Estate" },
  { value: "INFRASTRUCTURE", label: "Infrastructure & Real Assets" },
  { value: "MANUFACTURING", label: "Manufacturing & Industrial" },
];

const subsectorMap: Record<string, { value: string; label: string }[]> = {
  FINTECH: [
    { value: "PAYMENTS_REMITTANCE", label: "Payments & Remittance" },
    { value: "LENDING_CREDIT", label: "Lending & Credit" },
    { value: "INSURTECH", label: "Insurtech" },
    { value: "WEALTH_ASSET_MGMT", label: "Wealth & Asset Management" },
    { value: "DIGITAL_BANKING", label: "Digital Banking" },
    { value: "EMBEDDED_FINANCE", label: "Embedded Finance" },
    { value: "FX_CROSS_BORDER", label: "FX & Cross-Border Infrastructure" },
    { value: "CAPITAL_MARKETS", label: "Capital Markets Infrastructure" },
  ],
  ENERGY: [
    { value: "SOLAR_DISTRIBUTED", label: "Solar & Distributed Energy" },
    { value: "MINI_GRID", label: "Mini-Grid Systems" },
    { value: "ENERGY_STORAGE", label: "Energy Storage" },
    { value: "OIL_GAS_SERVICES", label: "Oil & Gas Services" },
    { value: "CLEAN_ENERGY_INFRA", label: "Clean Energy Infrastructure" },
    { value: "CLIMATE_TECH", label: "Climate Technology" },
    { value: "CARBON_MARKETS", label: "Carbon & Environmental Markets" },
  ],
  LOGISTICS: [
    { value: "FREIGHT_SUPPLY_CHAIN", label: "Freight & Supply Chain" },
    { value: "COLD_CHAIN", label: "Cold Chain Infrastructure" },
    { value: "FLEET_MGMT", label: "Fleet Management" },
    { value: "LAST_MILE", label: "Last-Mile Delivery" },
    { value: "MARITIME_PORT", label: "Maritime & Port Services" },
    { value: "AVIATION", label: "Aviation Services" },
    { value: "MOBILITY_PLATFORMS", label: "Mobility Platforms" },
  ],
  AGRI_FOOD: [
    { value: "PRIMARY_AGRICULTURE", label: "Primary Agriculture" },
    { value: "AGRI_PROCESSING", label: "Agri-Processing" },
    { value: "FARM_INPUTS", label: "Farm Inputs & Distribution" },
    { value: "COLD_STORAGE", label: "Cold Storage" },
    { value: "EXPORT_COMMODITIES", label: "Export Commodities" },
    { value: "LIVESTOCK_PROTEIN", label: "Livestock & Protein" },
    { value: "FOOD_DISTRIBUTION", label: "Food Distribution Infrastructure" },
  ],
  TECHNOLOGY: [
    { value: "ENTERPRISE_SAAS", label: "Enterprise SaaS" },
    { value: "AI_ML", label: "AI & Machine Learning" },
    { value: "DEVELOPER_TOOLS", label: "Developer Tools" },
    { value: "CYBERSECURITY", label: "Cybersecurity" },
    { value: "CLOUD_INFRA", label: "Cloud & Infrastructure Software" },
    { value: "DATA_ANALYTICS", label: "Data & Analytics" },
    { value: "VERTICAL_PLATFORMS", label: "Vertical Software Platforms" },
  ],
  SAAS_TECH: [
    { value: "ENTERPRISE_SAAS", label: "Enterprise SaaS" },
    { value: "AI_ML", label: "AI & Machine Learning" },
    { value: "DEVELOPER_TOOLS", label: "Developer Tools" },
    { value: "CYBERSECURITY", label: "Cybersecurity" },
    { value: "CLOUD_INFRA", label: "Cloud & Infrastructure Software" },
    { value: "DATA_ANALYTICS", label: "Data & Analytics" },
    { value: "VERTICAL_PLATFORMS", label: "Vertical Software Platforms" },
  ],
  HEALTH: [
    { value: "DIAGNOSTICS", label: "Diagnostics" },
    { value: "TELEMEDICINE", label: "Telemedicine" },
    { value: "PHARMA_DISTRIBUTION", label: "Pharmaceutical Distribution" },
    { value: "MEDICAL_DEVICES", label: "Medical Devices" },
    { value: "BIOTECH", label: "Biotech" },
    { value: "HEALTHCARE_INFRA", label: "Healthcare Infrastructure" },
  ],
  CONSUMER_FMCG: [
    { value: "FMCG", label: "FMCG" },
    { value: "ECOMMERCE", label: "E-commerce" },
    { value: "DTC_BRANDS", label: "Direct-to-Consumer Brands" },
    { value: "RETAIL_INFRA", label: "Retail Infrastructure" },
    { value: "MARKETPLACES", label: "Marketplaces" },
    { value: "CONSUMER_SERVICES", label: "Consumer Services" },
  ],
  REAL_ESTATE: [
    { value: "RE_DEVELOPMENT", label: "Real Estate Development" },
    { value: "INDUSTRIAL_WAREHOUSING", label: "Industrial Warehousing" },
    { value: "DATA_CENTERS", label: "Data Centers" },
    { value: "TELECOM_INFRA", label: "Telecommunications Infrastructure" },
    { value: "UTILITIES", label: "Utilities" },
    { value: "TRANSPORT_INFRA", label: "Transportation Infrastructure" },
  ],
  INFRASTRUCTURE: [
    { value: "RE_DEVELOPMENT", label: "Real Estate Development" },
    { value: "INDUSTRIAL_WAREHOUSING", label: "Industrial Warehousing" },
    { value: "DATA_CENTERS", label: "Data Centers" },
    { value: "TELECOM_INFRA", label: "Telecommunications Infrastructure" },
    { value: "UTILITIES", label: "Utilities" },
    { value: "TRANSPORT_INFRA", label: "Transportation Infrastructure" },
  ],
  MANUFACTURING: [
    { value: "LIGHT_MANUFACTURING", label: "Light Manufacturing" },
    { value: "HEAVY_INDUSTRY", label: "Heavy Industry" },
    { value: "PACKAGING_MATERIALS", label: "Packaging & Materials" },
    { value: "CONSTRUCTION_SUPPLY", label: "Construction Supply" },
    { value: "EQUIPMENT_LEASING", label: "Equipment Leasing" },
    { value: "INDUSTRIAL_PROCESSING", label: "Industrial Processing" },
  ],
};

// All subsectors flattened for the "all sectors" filter
const allSubsectorOptions = Object.values(subsectorMap)
  .flat()
  .filter((v, i, a) => a.findIndex((t) => t.value === v.value) === i);

const sectorLabels: Record<string, string> = {
  FINTECH: "Financial Services",
  ENERGY: "Energy & Climate",
  LOGISTICS: "Logistics & Mobility",
  AGRI_FOOD: "Agriculture & Food",
  TECHNOLOGY: "Technology & Software",
  SAAS_TECH: "SaaS / Tech",
  HEALTH: "Healthcare & Life Sciences",
  CONSUMER_FMCG: "Consumer & Retail",
  REAL_ESTATE: "Real Estate",
  INFRASTRUCTURE: "Infrastructure & Real Assets",
  MANUFACTURING: "Manufacturing & Industrial",
};

const subsectorLabels: Record<string, string> = Object.fromEntries(
  allSubsectorOptions.map((o) => [o.value, o.label]),
);

const stageFilterOptions = [
  { value: "all", label: "Stage" },
  { value: "PRE_REVENUE", label: "Pre-revenue" },
  { value: "EARLY_REVENUE", label: "Early Revenue" },
  { value: "GROWTH", label: "Growth" },
  { value: "PROFITABLE", label: "Profitable" },
];

const laneFilterOptions = [
  { value: "all", label: "Lane" },
  { value: "YIELD", label: "Yield Lane" },
  { value: "VENTURES", label: "Ventures Lane" },
];

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

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function BrowseCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"card" | "list">("list");
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());

  const [quickFilter, setQuickFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sectorFilter, setSectorFilter] = useState<string>("all");
  const [subsectorFilter, setSubsectorFilter] = useState<string>("all");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [laneFilter, setLaneFilter] = useState<string>("all");

  // Build dynamic subsector options based on sector filter
  const subsectorFilterOptions = (() => {
    if (sectorFilter !== "all" && subsectorMap[sectorFilter]) {
      return [
        { value: "all", label: "Subsector" },
        ...subsectorMap[sectorFilter],
      ];
    }
    return [{ value: "all", label: "Select a sector first" }];
  })();

  // Reset subsector when sector changes
  useEffect(() => {
    setSubsectorFilter("all");
  }, [sectorFilter]);

  useEffect(() => {
    fetchCompanies();
  }, []);

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
    watchlist,
  ]);

  const fetchCompanies = async () => {
    try {
      setIsLoading(true);
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(`${API_URL}/api/companies`);
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

  const toggleWatchlist = (companyId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWatchlist((prev) => {
      const next = new Set(prev);
      if (next.has(companyId)) {
        next.delete(companyId);
      } else {
        next.add(companyId);
      }
      return next;
    });
  };

  const applyFilters = () => {
    let filtered = [...companies];

    if (quickFilter === "recent") {
      filtered.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }
    if (quickFilter === "watchlist") {
      filtered = filtered.filter((c) => watchlist.has(c.id));
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.legalName.toLowerCase().includes(query) ||
          c.tradingName?.toLowerCase().includes(query) ||
          c.oneLineDescription?.toLowerCase().includes(query),
      );
    }

    if (sectorFilter !== "all")
      filtered = filtered.filter((c) => c.sector === sectorFilter);
    if (subsectorFilter !== "all")
      filtered = filtered.filter((c) => c.subsector === subsectorFilter);
    if (stageFilter !== "all")
      filtered = filtered.filter((c) => c.stage === stageFilter);
    if (laneFilter !== "all")
      filtered = filtered.filter((c) => c.preferredLane === laneFilter);

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

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F6F8FA" }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container">
          <div className="flex items-center justify-between py-4">
            <Link
              href="/"
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
            <nav className="hidden md:flex items-center space-x-8">
              <a
                href="/#how-it-works"
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors text-sm"
              >
                How It Works
              </a>
              <Link
                href="/about"
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors text-sm"
              >
                About Us
              </Link>
              <Link
                href="/login"
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors text-sm"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="inline-block px-6 py-2.5 rounded-lg font-semibold text-sm transition-all hover:opacity-90"
                style={{ backgroundColor: "#C8A24D", color: "#0B1C2D" }}
              >
                Sign Up
              </Link>
            </nav>

            {/* Mobile menu */}
            <div className="md:hidden flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors text-sm"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="inline-block px-5 py-2 rounded-lg font-semibold text-sm transition-all hover:opacity-90"
                style={{ backgroundColor: "#C8A24D", color: "#0B1C2D" }}
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary-950 mb-2">
            Browse Companies
          </h1>
        </div>

        {/* Quick Filter Pills */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setQuickFilter("watchlist")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${quickFilter === "watchlist" ? "bg-gray-900 text-white" : "bg-white text-gray-700 border border-gray-300 hover:border-gray-400"}`}
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
            Watchlist{watchlist.size > 0 ? ` (${watchlist.size})` : ""}
          </button>
          <button
            onClick={() => setQuickFilter("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${quickFilter === "all" ? "bg-gray-900 text-white" : "bg-white text-gray-700 border border-gray-300 hover:border-gray-400"}`}
          >
            All Companies
          </button>
          <button
            onClick={() => setQuickFilter("recent")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${quickFilter === "recent" ? "bg-gray-900 text-white" : "bg-white text-gray-700 border border-gray-300 hover:border-gray-400"}`}
          >
            Recently Added
          </button>
        </div>

        {/* Search & Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-3 items-center">
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
            <CustomSelect
              value={sectorFilter}
              onChange={setSectorFilter}
              options={sectorFilterOptions}
              className="min-w-[160px]"
            />
            <CustomSelect
              value={subsectorFilter}
              onChange={setSubsectorFilter}
              options={subsectorFilterOptions}
              className="min-w-[180px]"
            />
            <CustomSelect
              value={stageFilter}
              onChange={setStageFilter}
              options={stageFilterOptions}
              className="min-w-[130px]"
            />
            <CustomSelect
              value={laneFilter}
              onChange={setLaneFilter}
              options={laneFilterOptions}
              className="min-w-[130px]"
            />
            <button
              onClick={clearFilters}
              className="px-6 py-2.5 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:border-gray-400 transition-all h-11"
            >
              Reset
            </button>
            <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded transition-all ${viewMode === "list" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"}`}
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
                className={`p-2 rounded transition-all ${viewMode === "card" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"}`}
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

        {/* Content */}
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
              {quickFilter === "watchlist"
                ? "No Saved Companies"
                : companies.length === 0
                  ? "No Companies Listed Yet"
                  : "No Companies Match Your Filters"}
            </h3>
            <p className="text-gray-600 mb-6">
              {quickFilter === "watchlist"
                ? "Save companies to your watchlist by clicking the bookmark icon"
                : companies.length === 0
                  ? "Check back soon for verified investment opportunities"
                  : "Try adjusting your filters to see more companies"}
            </p>
            {(companies.length > 0 || quickFilter === "watchlist") && (
              <button
                onClick={clearFilters}
                className="px-6 py-3 rounded-lg font-semibold transition-all border-2 border-gray-300 text-gray-700 hover:border-gray-400"
              >
                {quickFilter === "watchlist"
                  ? "Browse All Companies"
                  : "Clear Filters"}
              </button>
            )}
          </div>
        ) : viewMode === "list" ? (
          /* ============ TABLE VIEW ============ */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="col-span-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide"></p>
              </div>
              <div className="col-span-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Company
                </p>
              </div>
              <div className="col-span-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Sector & Subsector
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Round
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Lane
                </p>
              </div>
              <div className="col-span-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide"></p>
              </div>
            </div>

            {filteredCompanies.map((company, index) => (
              <Link
                key={company.id}
                href={`/dashboard/investor/companies/${company.id}`}
              >
                <div
                  className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors cursor-pointer group ${index < filteredCompanies.length - 1 ? "border-b border-gray-100" : ""}`}
                >
                  {/* Watchlist Bookmark */}
                  <div className="col-span-1">
                    <button
                      onClick={(e) => toggleWatchlist(company.id, e)}
                      className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      {watchlist.has(company.id) ? (
                        <svg
                          className="w-5 h-5 text-yellow-500"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5 text-gray-300 hover:text-gray-500"
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
                      )}
                    </button>
                  </div>

                  {/* Company: Logo + Name */}
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200 flex items-center justify-center">
                      {company.logoUrl ? (
                        <img
                          src={company.logoUrl}
                          alt={company.legalName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-bold text-gray-400">
                          {(company.tradingName || company.legalName)
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 group-hover:text-primary-900 transition-colors truncate">
                        {company.tradingName || company.legalName}
                      </p>
                    </div>
                  </div>

                  {/* Sector & Subsector */}
                  <div className="col-span-3">
                    <p className="text-sm font-medium text-gray-900">
                      {sectorLabels[company.sector] || company.sector}
                    </p>
                    {company.subsector && (
                      <p className="text-xs text-gray-500">
                        {subsectorLabels[company.subsector] ||
                          company.subsector}
                      </p>
                    )}
                  </div>

                  {/* Round */}
                  <div className="col-span-2">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {stageLabels[company.stage] || company.stage}
                    </span>
                  </div>

                  {/* Lane */}
                  <div className="col-span-2">
                    {company.preferredLane ? (
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${company.preferredLane === "YIELD" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"}`}
                      >
                        {laneLabels[company.preferredLane] ||
                          company.preferredLane}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </div>

                  {/* Arrow */}
                  <div className="col-span-1 text-right">
                    <svg
                      className="w-5 h-5 text-gray-300 group-hover:text-gray-600 transition-colors inline"
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
              </Link>
            ))}
          </div>
        ) : (
          /* ============ CARD VIEW ============ */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                watchlist={watchlist}
                toggleWatchlist={toggleWatchlist}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// ============================================================================
// Company Card Component
// ============================================================================
function CompanyCard({
  company,
  watchlist,
  toggleWatchlist,
}: {
  company: Company;
  watchlist: Set<string>;
  toggleWatchlist: (id: string, e: React.MouseEvent) => void;
}) {
  return (
    <Link href={`/dashboard/investor/companies/${company.id}`}>
      <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group relative flex flex-col h-full">
        {/* Bookmark - top right */}
        <button
          onClick={(e) => toggleWatchlist(company.id, e)}
          className="absolute top-4 right-4 p-1 rounded hover:bg-gray-100 transition-colors z-10"
        >
          {watchlist.has(company.id) ? (
            <svg
              className="w-5 h-5 text-yellow-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 text-gray-300 group-hover:text-gray-400"
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
          )}
        </button>

        {/* Logo + Name */}
        <div className="flex items-center gap-3 mb-1 pr-8">
          <div className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 bg-gray-900 border border-gray-200 flex items-center justify-center">
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={company.legalName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-base font-bold text-white">
                {(company.tradingName || company.legalName)
                  .charAt(0)
                  .toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-gray-900 group-hover:text-primary-900 transition-colors truncate">
              {company.tradingName || company.legalName}
            </h3>
            <p className="text-xs text-gray-500">
              {sectorLabels[company.sector] || company.sector}
              {company.subsector && (
                <>
                  {" "}
                  / {subsectorLabels[company.subsector] || company.subsector}
                </>
              )}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 my-3"></div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
          {company.oneLineDescription}
        </p>

        {/* Info rows */}
        <div className="space-y-3 flex-1">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Round</p>
            <p className="text-sm font-semibold text-gray-900">
              {stageLabels[company.stage] || company.stage}
            </p>
          </div>

          {company.targetRaiseRange && (
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Target Raise</p>
              <p className="text-sm font-semibold text-gray-900">
                {company.targetRaiseRange}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          {company.preferredLane ? (
            <span
              className={`inline-block px-2.5 py-1 rounded text-xs font-semibold ${company.preferredLane === "YIELD" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"}`}
            >
              {laneLabels[company.preferredLane] || company.preferredLane}
            </span>
          ) : (
            <span />
          )}

          {company.deals && company.deals.length > 0 ? (
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <p className="text-xs font-medium text-green-700">
                {company.deals.length} active{" "}
                {company.deals.length === 1 ? "deal" : "deals"}
              </p>
            </div>
          ) : (
            <span />
          )}
        </div>
      </div>
    </Link>
  );
}
