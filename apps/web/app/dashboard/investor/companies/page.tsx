"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, Star, TrendingUp, ArrowRight, MapPin, Building2, ChevronDown, LayoutGrid, List } from "lucide-react";
import CustomSelect from "@/components/CustomSelect";
import { useAuth } from "@/lib/contexts/AuthContext";

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
  incorporationCountry?: string;
  deals: Array<{
    id: string;
    name: string;
    lane: string;
    targetAmount: number;
    raisedAmount: number;
    minimumInvestment?: number;
    valuation?: number;
  }>;
};

// ============================================================================
// SECTOR & SUBSECTOR DATA
// ============================================================================

const sectorFilterOptions = [
  { value: "all", label: "All Industries" },
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
  { value: "all", label: "All Stages" },
  { value: "PRE_REVENUE", label: "Pre-revenue" },
  { value: "EARLY_REVENUE", label: "Early Revenue" },
  { value: "GROWTH", label: "Growth" },
  { value: "PROFITABLE", label: "Profitable" },
];

const laneFilterOptions = [
  { value: "all", label: "All Lanes" },
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

// Gradient colors for company logo placeholders
const logoGradients = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
  "linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)",
  "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
  "linear-gradient(135deg, #f5576c 0%, #ff6f3c 100%)",
  "linear-gradient(135deg, #0ba360 0%, #3cba92 100%)",
];

function getGradient(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return logoGradients[Math.abs(hash) % logoGradients.length];
}

function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount.toLocaleString()}`;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function BrowseCompanies() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const isLoggedIn = !!user;
  const userInitial = user?.firstName?.charAt(0).toUpperCase() || "U";
  const userFullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();

  const [quickFilter, setQuickFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sectorFilter, setSectorFilter] = useState<string>("all");
  const [subsectorFilter, setSubsectorFilter] = useState<string>("all");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [laneFilter, setLaneFilter] = useState<string>("all");

  // View mode: grid or list (persisted in localStorage)
  const [viewMode, setViewMode] = useState<"grid" | "list">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("capvista_browse_view") as "grid" | "list") || "grid";
    }
    return "grid";
  });

  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewMode(mode);
    localStorage.setItem("capvista_browse_view", mode);
  };

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
    if (isLoggedIn) {
      fetchWatchlist();
    }
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
        process.env.NEXT_PUBLIC_API_URL;
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

  const fetchWatchlist = async () => {
    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL;
      const token = localStorage.getItem("capvista_token");
      if (!token) return;
      const response = await fetch(`${API_URL}/api/watchlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.success) {
        setWatchlist(new Set(result.data));
      }
    } catch (err) {
      console.error("Error fetching watchlist:", err);
    }
  };

  const toggleWatchlist = async (companyId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) return;

    const isWatchlisted = watchlist.has(companyId);

    // Optimistic update
    setWatchlist((prev) => {
      const next = new Set(prev);
      if (isWatchlisted) {
        next.delete(companyId);
      } else {
        next.add(companyId);
      }
      return next;
    });

    // Persist to backend
    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL;
      const token = localStorage.getItem("capvista_token");
      if (!token) return;

      const response = await fetch(`${API_URL}/api/watchlist/${companyId}`, {
        method: isWatchlisted ? "DELETE" : "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        // Revert on failure
        setWatchlist((prev) => {
          const next = new Set(prev);
          if (isWatchlisted) {
            next.add(companyId);
          } else {
            next.delete(companyId);
          }
          return next;
        });
      }
    } catch (err) {
      console.error("Error updating watchlist:", err);
      // Revert on error
      setWatchlist((prev) => {
        const next = new Set(prev);
        if (isWatchlisted) {
          next.add(companyId);
        } else {
          next.delete(companyId);
        }
        return next;
      });
    }
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
    setShowMoreFilters(false);
  };

  const hasActiveFilters =
    sectorFilter !== "all" ||
    subsectorFilter !== "all" ||
    stageFilter !== "all" ||
    laneFilter !== "all" ||
    searchQuery !== "";

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F6F8FA" }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div
                className="h-9 w-9 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "#0A1F44" }}
              >
                <span
                  className="font-bold text-base"
                  style={{ color: "#0B1C2D" }}
                >
                  CV
                </span>
              </div>
              <span className="text-xl font-bold" style={{ color: "#0B1C2D" }}>
                Capvista
              </span>
            </Link>

            {isLoggedIn ? (
              <div className="flex items-center gap-8">
                <nav className="hidden md:flex items-center space-x-8">
                  <div className="relative group">
                    <button className="flex items-center gap-1 font-medium text-gray-600 hover:text-gray-900 transition-colors text-sm">
                      Explore
                      <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform" />
                    </button>

                    <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <button
                        onClick={() => router.push("/dashboard/investor/companies")}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-start gap-3"
                      >
                        <Search className="w-5 h-5 text-gray-500 mt-0.5" />
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">Browse Companies</p>
                          <p className="text-xs text-gray-500">Explore our curated list of private companies</p>
                        </div>
                      </button>
                      <button
                        onClick={() => router.push("/dashboard/investor")}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-start gap-3"
                      >
                        <TrendingUp className="w-5 h-5 text-gray-500 mt-0.5" />
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">Market Opportunities</p>
                          <p className="text-xs text-gray-500">Find active opportunities to invest in</p>
                        </div>
                      </button>
                      <button
                        onClick={() => { setQuickFilter("watchlist"); }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-start gap-3"
                      >
                        <Star className="w-5 h-5 text-gray-500 mt-0.5" />
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">Watchlist</p>
                          <p className="text-xs text-gray-500">Track companies that matter to you</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => router.push("/dashboard/investor")}
                    className="font-medium text-gray-600 hover:text-gray-900 transition-colors text-sm"
                  >
                    Dashboard
                  </button>
                </nav>

                {/* Profile */}
                <div className="relative group">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity" style={{ backgroundColor: "#0B1C2D" }}>
                    {userInitial}
                  </div>
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="font-semibold text-gray-900 text-sm">{userFullName}</p>
                      <p className="text-xs text-gray-500">Investor</p>
                    </div>
                    <button
                      onClick={() => router.push("/dashboard/investor/profile/manage")}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 text-sm font-medium text-gray-700"
                    >
                      Manage Profile
                    </button>
                    <button
                      onClick={signOut}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 text-sm font-medium text-gray-700"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <nav className="hidden md:flex items-center space-x-8">
                  <a href="/#how-it-works" className="text-gray-700 hover:text-gray-900 font-medium transition-colors text-sm">How It Works</a>
                  <Link href="/about" className="text-gray-700 hover:text-gray-900 font-medium transition-colors text-sm">About Us</Link>
                  <Link href="/login" className="text-gray-700 hover:text-gray-900 font-medium transition-colors text-sm">Log In</Link>
                  <Link
                    href="/signup"
                    className="inline-block px-6 py-2.5 rounded-lg font-semibold text-sm transition-all hover:opacity-90"
                    style={{ backgroundColor: "#0A1F44", color: "#FFFFFF" }}
                  >
                    Sign Up
                  </Link>
                </nav>
                <div className="md:hidden flex items-center space-x-4">
                  <Link href="/login" className="text-gray-700 hover:text-gray-900 font-medium transition-colors text-sm">Log In</Link>
                  <Link
                    href="/signup"
                    className="inline-block px-5 py-2 rounded-lg font-semibold text-sm transition-all hover:opacity-90"
                    style={{ backgroundColor: "#0A1F44", color: "#FFFFFF" }}
                  >
                    Sign Up
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Page Hero Header */}
      <div style={{ background: "linear-gradient(135deg, #0B1C2D 0%, #1a3a5c 50%, #0B1C2D 100%)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(200, 162, 77, 0.15)" }}>
              <TrendingUp className="w-5 h-5" style={{ color: "#0A1F44" }} />
            </div>
            <span className="text-sm font-medium tracking-wide uppercase" style={{ color: "#0A1F44" }}>
              Investment Opportunities
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Discover Investment Opportunities
          </h1>
          <p className="text-lg max-w-2xl" style={{ color: "rgba(255,255,255,0.6)" }}>
            Browse verified African companies raising capital through structured, standardized instruments. Filter by industry, stage, and investment lane.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="sticky top-[73px] z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[260px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search companies by name or description..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white outline-none text-sm transition-all"
              />
            </div>

            {/* Industry Filter */}
            <CustomSelect
              value={sectorFilter}
              onChange={setSectorFilter}
              options={sectorFilterOptions}
              className="min-w-[170px]"
            />

            {/* Stage Filter */}
            <CustomSelect
              value={stageFilter}
              onChange={setStageFilter}
              options={stageFilterOptions}
              className="min-w-[140px]"
            />

            {/* More Filters Button */}
            <button
              onClick={() => setShowMoreFilters(!showMoreFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all h-11 border ${
                showMoreFilters || laneFilter !== "all" || subsectorFilter !== "all"
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              More Filters
              {(laneFilter !== "all" || subsectorFilter !== "all") && (
                <span className="w-5 h-5 rounded-full bg-white text-gray-900 text-xs font-bold flex items-center justify-center">
                  {(laneFilter !== "all" ? 1 : 0) + (subsectorFilter !== "all" ? 1 : 0)}
                </span>
              )}
            </button>

            {/* Results Count */}
            {!isLoading && !error && (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-gray-500">
                  <span className="font-semibold text-gray-900">{filteredCompanies.length}</span>{" "}
                  {filteredCompanies.length === 1 ? "result" : "results"}
                </span>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium ml-2"
                  >
                    Clear all
                  </button>
                )}
              </div>
            )}

            {/* View Toggle — hidden on mobile */}
            <div className="hidden md:flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => handleViewModeChange("grid")}
                className={`p-2 transition-colors ${
                  viewMode === "grid"
                    ? "bg-[#0A1F44] text-white"
                    : "bg-white text-gray-400 hover:text-gray-600"
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleViewModeChange("list")}
                className={`p-2 transition-colors ${
                  viewMode === "list"
                    ? "bg-[#0A1F44] text-white"
                    : "bg-white text-gray-400 hover:text-gray-600"
                }`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Expanded Filters */}
          {showMoreFilters && (
            <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-gray-100">
              <CustomSelect
                value={laneFilter}
                onChange={setLaneFilter}
                options={laneFilterOptions}
                className="min-w-[150px]"
              />
              <CustomSelect
                value={subsectorFilter}
                onChange={setSubsectorFilter}
                options={subsectorFilterOptions}
                className="min-w-[200px]"
              />
              <div className="flex gap-2 ml-auto">
                {(["all", "recent", "watchlist"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setQuickFilter(filter)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                      quickFilter === filter
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {filter === "all" ? "All" : filter === "recent" ? "Recently Added" : `Watchlist${watchlist.size > 0 ? ` (${watchlist.size})` : ""}`}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-3 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4" style={{ borderWidth: "3px" }}></div>
            <p className="text-sm text-gray-500">Loading opportunities...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
            <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center bg-red-50">
              <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Companies</h3>
            <p className="text-sm text-gray-500 mb-6">{error}</p>
            <button
              onClick={fetchCompanies}
              className="px-6 py-2.5 rounded-lg font-semibold text-sm transition-all hover:opacity-90"
              style={{ backgroundColor: "#0A1F44", color: "#FFFFFF" }}
            >
              Try Again
            </button>
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
            <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: "rgba(11,28,45,0.05)" }}>
              <Building2 className="w-7 h-7" style={{ color: "#0B1C2D" }} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {quickFilter === "watchlist"
                ? "No Saved Companies"
                : companies.length === 0
                  ? "No Companies Listed Yet"
                  : "No Companies Match Your Filters"}
            </h3>
            <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
              {quickFilter === "watchlist"
                ? "Star companies to add them to your watchlist and track them here."
                : companies.length === 0
                  ? "Check back soon for verified investment opportunities."
                  : "Try adjusting your search or filter criteria to see more results."}
            </p>
            {(companies.length > 0 || quickFilter === "watchlist") && (
              <button
                onClick={clearFilters}
                className="px-6 py-2.5 rounded-lg font-medium text-sm transition-all border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                {quickFilter === "watchlist" ? "Browse All Companies" : "Clear Filters"}
              </button>
            )}
          </div>
        ) : (
          viewMode === "list" ? (
            /* ============ TABLE / LIST VIEW ============ */
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sector & Subsector</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lane</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Raising</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valuation</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active Deals</th>
                      <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCompanies.map((company) => {
                      const activeDeal = company.deals?.[0];
                      const raising = activeDeal?.targetAmount;
                      const valuation = activeDeal?.valuation;
                      return (
                        <tr
                          key={company.id}
                          className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => router.push(`/dashboard/investor/companies/${company.id}`)}
                        >
                          {/* Company */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden"
                                style={{
                                  background: company.logoUrl ? undefined : getGradient(company.id),
                                }}
                              >
                                {company.logoUrl ? (
                                  <img src={company.logoUrl} alt={company.legalName} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-xs font-bold text-white">
                                    {(company.tradingName || company.legalName).charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">
                                  {company.tradingName || company.legalName}
                                </p>
                                <p className="text-xs text-gray-500 truncate max-w-[200px]">
                                  {company.oneLineDescription}
                                </p>
                              </div>
                            </div>
                          </td>
                          {/* Sector & Subsector */}
                          <td className="px-5 py-4">
                            <p className="text-sm text-gray-900">{sectorLabels[company.sector] || company.sector}</p>
                            {company.subsector && (
                              <p className="text-xs text-gray-500">{subsectorLabels[company.subsector] || company.subsector}</p>
                            )}
                          </td>
                          {/* Stage */}
                          <td className="px-5 py-4">
                            <span className="text-sm text-gray-900">{stageLabels[company.stage] || company.stage}</span>
                          </td>
                          {/* Lane */}
                          <td className="px-5 py-4">
                            {company.preferredLane && (
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                                  company.preferredLane === "YIELD"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-purple-50 text-purple-700"
                                }`}
                              >
                                {laneLabels[company.preferredLane] || company.preferredLane} Lane
                              </span>
                            )}
                          </td>
                          {/* Raising */}
                          <td className="px-5 py-4">
                            <span className="text-sm font-medium text-gray-900">
                              {raising ? formatCurrency(raising) : company.targetRaiseRange || "—"}
                            </span>
                          </td>
                          {/* Valuation */}
                          <td className="px-5 py-4">
                            <span className="text-sm font-medium text-gray-900">
                              {valuation ? formatCurrency(valuation) : "—"}
                            </span>
                          </td>
                          {/* Active Deals */}
                          <td className="px-5 py-4">
                            <span className="text-sm text-gray-900">{company.deals?.length || 0}</span>
                          </td>
                          {/* Action */}
                          <td className="px-5 py-4 text-right">
                            <Link
                              href={`/dashboard/investor/companies/${company.id}`}
                              className="text-sm font-medium hover:underline inline-flex items-center gap-1"
                              style={{ color: "#0A1F44" }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              View Details
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* ============ 3-COLUMN CARD GRID ============ */
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompanies.map((company) => (
                <CompanyCard
                  key={company.id}
                  company={company}
                  isWatchlisted={watchlist.has(company.id)}
                  toggleWatchlist={toggleWatchlist}
                  isLoggedIn={isLoggedIn}
                />
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
}

// ============================================================================
// Company Card Component — Figma Design
// ============================================================================
function CompanyCard({
  company,
  isWatchlisted,
  toggleWatchlist,
  isLoggedIn,
}: {
  company: Company;
  isWatchlisted: boolean;
  toggleWatchlist: (id: string, e: React.MouseEvent) => void;
  isLoggedIn: boolean;
}) {
  const activeDeal = company.deals?.[0];
  const raising = activeDeal?.targetAmount;
  const valuation = activeDeal?.valuation;
  const minInvestment = activeDeal?.minimumInvestment;

  return (
    <Link href={`/dashboard/investor/companies/${company.id}`}>
      <div
        className="bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer group relative flex flex-col h-full"
        style={{
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.12)";
          e.currentTarget.style.borderColor = "#d1d5db";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
          e.currentTarget.style.borderColor = "#e5e7eb";
        }}
      >
        {/* Card Top — Gradient Logo Area */}
        <div className="relative px-5 pt-5 pb-4">
          <div className="flex items-start justify-between">
            {/* Logo + Company Info */}
            <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-2">
              <div
                className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden"
                style={{
                  background: company.logoUrl ? undefined : getGradient(company.id),
                }}
              >
                {company.logoUrl ? (
                  <img
                    src={company.logoUrl}
                    alt={company.legalName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-bold text-white">
                    {(company.tradingName || company.legalName).charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                  {company.tradingName || company.legalName}
                </h3>
                <p className="text-sm text-gray-500 truncate mt-0.5">
                  {company.oneLineDescription}
                </p>
              </div>
            </div>

            {/* Star / Bookmark */}
            {isLoggedIn && (
              <button
                onClick={(e) => toggleWatchlist(company.id, e)}
                className="flex-shrink-0 p-1.5 rounded-lg hover:bg-gray-100 transition-colors mt-0.5"
              >
                <Star
                  className={`w-5 h-5 transition-colors ${
                    isWatchlisted
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300 group-hover:text-gray-400"
                  }`}
                />
              </button>
            )}
          </div>

          {/* Location */}
          {company.incorporationCountry && (
            <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-400">
              <MapPin className="w-3.5 h-3.5" />
              <span>{company.incorporationCountry}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="px-5 pb-4 flex flex-wrap gap-2">
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium"
            style={{ backgroundColor: "#f0f4ff", color: "#3b5998" }}
          >
            {sectorLabels[company.sector] || company.sector}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
            {stageLabels[company.stage] || company.stage}
          </span>
          {company.preferredLane && (
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                company.preferredLane === "YIELD"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-purple-50 text-purple-700"
              }`}
            >
              {laneLabels[company.preferredLane] || company.preferredLane} Lane
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="mx-5 border-t border-gray-100"></div>

        {/* Metrics */}
        <div className="px-5 py-4 grid grid-cols-3 gap-3 flex-1">
          <div>
            <p className="text-xs text-gray-400 mb-1">Raising</p>
            <p className="text-sm font-semibold text-gray-900">
              {raising ? formatCurrency(raising) : company.targetRaiseRange || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Valuation</p>
            <p className="text-sm font-semibold text-gray-900">
              {valuation ? formatCurrency(valuation) : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Active Deals</p>
            <p className="text-sm font-semibold text-gray-900">
              {company.deals?.length || 0}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between" style={{ backgroundColor: "#fafbfc" }}>
          {minInvestment ? (
            <p className="text-xs text-gray-500">
              Min. <span className="font-semibold text-gray-700">{formatCurrency(minInvestment)}</span>
            </p>
          ) : (
            <p className="text-xs text-gray-400">—</p>
          )}
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 group-hover:text-blue-700 transition-colors">
            View Details
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
}
