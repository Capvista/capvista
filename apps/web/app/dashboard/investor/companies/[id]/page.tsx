"use client";

import { useAuth } from "@/lib/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

type Company = {
  id: string;
  legalName: string;
  tradingName?: string;
  oneLineDescription: string;
  detailedDescription: string;
  sector: string;
  subsector?: string;
  businessModel: string;
  revenueModel: string;
  stage: string;
  teamSize?: string;
  countryOfIncorporation: string;
  operatingCountries: string[];
  companyAddress: string;
  website?: string;
  officialEmailDomain: string;
  incorporationNumber: string;
  incorporationDate: string;
  logoUrl?: string;
  revenueStatus?: string;
  revenueRange?: string;
  primaryRevenueSource?: string;
  keyMetrics?: { metric1?: string; metric2?: string; metric3?: string };
  majorCustomers: string[];
  geographicFootprint?: string;
  hasRaisedBefore: boolean;
  previousRaises?: any;
  founderOwnedPercent?: number;
  externalInvestorsPercent?: number;
  notableInvestors: string[];
  topRisks: string[];
  materialThreats?: string;
  singleSupplier: boolean;
  fxExposure: boolean;
  regulationDependent: boolean;
  regulatoryDependencies?: string;
  infrastructureDependent: boolean;
  preferredLane?: string;
  preferredInstrument?: string;
  targetRaiseRange?: string;
  primaryUseOfFunds?: string;
  currentMonitoringStatus: string;
  createdAt: string;
  owner: {
    id: string;
    user: { id: string; email: string; firstName?: string; lastName?: string };
  };
  founders: Array<{
    id: string;
    role: string;
    bio: string;
    linkedinUrl?: string;
    yearsExperience?: number;
    isPrimary: boolean;
    founder: {
      id: string;
      user: {
        id: string;
        email: string;
        firstName?: string;
        lastName?: string;
      };
    };
  }>;
  deals: Array<{
    id: string;
    name: string;
    lane: string;
    instrumentType: string;
    status: string;
    targetAmount: number;
    raisedAmount: number;
    minimumInvestment: number;
    terms: any;
    openedAt?: string;
    closedAt?: string;
    closeDate?: string;
    investorCount?: number;
  }>;
  verificationRecords: Array<{
    type: string;
    verifiedAt: string;
  }>;
};

// ============================================================================
// LABEL MAPS
// ============================================================================

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

const subsectorLabels: Record<string, string> = {
  PAYMENTS_REMITTANCE: "Payments & Remittance",
  LENDING_CREDIT: "Lending & Credit",
  INSURTECH: "Insurtech",
  WEALTH_ASSET_MGMT: "Wealth & Asset Management",
  DIGITAL_BANKING: "Digital Banking",
  EMBEDDED_FINANCE: "Embedded Finance",
  FX_CROSS_BORDER: "FX & Cross-Border Infrastructure",
  CAPITAL_MARKETS: "Capital Markets Infrastructure",
  SOLAR_DISTRIBUTED: "Solar & Distributed Energy",
  MINI_GRID: "Mini-Grid Systems",
  ENERGY_STORAGE: "Energy Storage",
  OIL_GAS_SERVICES: "Oil & Gas Services",
  CLEAN_ENERGY_INFRA: "Clean Energy Infrastructure",
  CLIMATE_TECH: "Climate Technology",
  CARBON_MARKETS: "Carbon & Environmental Markets",
  FREIGHT_SUPPLY_CHAIN: "Freight & Supply Chain",
  COLD_CHAIN: "Cold Chain Infrastructure",
  FLEET_MGMT: "Fleet Management",
  LAST_MILE: "Last-Mile Delivery",
  MARITIME_PORT: "Maritime & Port Services",
  AVIATION: "Aviation Services",
  MOBILITY_PLATFORMS: "Mobility Platforms",
  PRIMARY_AGRICULTURE: "Primary Agriculture",
  AGRI_PROCESSING: "Agri-Processing",
  FARM_INPUTS: "Farm Inputs & Distribution",
  COLD_STORAGE: "Cold Storage",
  EXPORT_COMMODITIES: "Export Commodities",
  LIVESTOCK_PROTEIN: "Livestock & Protein",
  FOOD_DISTRIBUTION: "Food Distribution Infrastructure",
  ENTERPRISE_SAAS: "Enterprise SaaS",
  AI_ML: "AI & Machine Learning",
  DEVELOPER_TOOLS: "Developer Tools",
  CYBERSECURITY: "Cybersecurity",
  CLOUD_INFRA: "Cloud & Infrastructure Software",
  DATA_ANALYTICS: "Data & Analytics",
  VERTICAL_PLATFORMS: "Vertical Software Platforms",
  DIAGNOSTICS: "Diagnostics",
  TELEMEDICINE: "Telemedicine",
  PHARMA_DISTRIBUTION: "Pharmaceutical Distribution",
  MEDICAL_DEVICES: "Medical Devices",
  BIOTECH: "Biotech",
  HEALTHCARE_INFRA: "Healthcare Infrastructure",
  FMCG: "FMCG",
  ECOMMERCE: "E-commerce",
  DTC_BRANDS: "Direct-to-Consumer Brands",
  RETAIL_INFRA: "Retail Infrastructure",
  MARKETPLACES: "Marketplaces",
  CONSUMER_SERVICES: "Consumer Services",
  RE_DEVELOPMENT: "Real Estate Development",
  INDUSTRIAL_WAREHOUSING: "Industrial Warehousing",
  DATA_CENTERS: "Data Centers",
  TELECOM_INFRA: "Telecommunications Infrastructure",
  UTILITIES: "Utilities",
  TRANSPORT_INFRA: "Transportation Infrastructure",
  LIGHT_MANUFACTURING: "Light Manufacturing",
  HEAVY_INDUSTRY: "Heavy Industry",
  PACKAGING_MATERIALS: "Packaging & Materials",
  CONSTRUCTION_SUPPLY: "Construction Supply",
  EQUIPMENT_LEASING: "Equipment Leasing",
  INDUSTRIAL_PROCESSING: "Industrial Processing",
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

const instrumentLabels: Record<string, string> = {
  REVENUE_SHARE_NOTE: "Revenue Share Note",
  ASSET_BACKED_PARTICIPATION: "Asset-Backed Participation",
  CONVERTIBLE_NOTE: "Convertible Note",
  SAFE: "SAFE",
  SPV_EQUITY: "SPV Equity",
};

const businessModelLabels: Record<string, string> = {
  B2B: "B2B",
  B2C: "B2C",
  B2B2C: "B2B2C",
  B2G: "B2G",
  Marketplace: "Marketplace",
};

const teamSizeLabels: Record<string, string> = {
  founders_only: "Founders only",
  "1-5": "1–5 employees",
  "6-20": "6–20 employees",
  "21-50": "21–50 employees",
  "50+": "50+ employees",
};

const verificationLabels: Record<string, string> = {
  CAC: "CAC Registration",
  NIN: "National Identity",
  BVN: "Bank Verification",
  BANK_ACCOUNT: "Bank Account",
  REVENUE: "Revenue",
  ASSET: "Asset",
  IDENTITY: "Identity",
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CompanyDetailPage() {
  const { user, accessToken, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const companyId = params.id as string;

  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isWatchlisted, setIsWatchlisted] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && companyId) fetchCompany();
  }, [user, companyId]);

  const fetchCompany = async () => {
    try {
      setIsLoading(true);
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_URL}/api/companies/${companyId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const result = await response.json();
      if (result.success) {
        setCompany(result.data);
      } else {
        setError(result.error?.message || "Failed to fetch company");
      }
    } catch (err) {
      console.error("Error fetching company:", err);
      setError("Failed to load company");
    } finally {
      setIsLoading(false);
    }
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

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#F6F8FA" }}
      >
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate">Loading company...</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#F6F8FA" }}>
        <header className="bg-white border-b border-gray-200">
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
            </div>
          </div>
        </header>
        <main className="container py-16 text-center">
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
            Company Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "This company doesn't exist or has been removed."}
          </p>
          <Link
            href="/dashboard/investor/companies"
            className="px-6 py-3 rounded-lg font-semibold transition-all"
            style={{ backgroundColor: "#C8A24D", color: "#0B1C2D" }}
          >
            Browse Companies
          </Link>
        </main>
      </div>
    );
  }

  const displayName = company.tradingName || company.legalName;
  const liveDeals = company.deals?.filter((d) => d.status === "LIVE") || [];
  const hasMetrics =
    company.keyMetrics &&
    (company.keyMetrics.metric1 ||
      company.keyMetrics.metric2 ||
      company.keyMetrics.metric3);

  const allDeals = company.deals || [];
  const pastDeals = allDeals.filter((d) => d.status === "CLOSED" || d.status === "COMPLETED");

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "traction", label: "Traction & Metrics" },
    { id: "team", label: "Team" },
    { id: "capital", label: "Capital History" },
    { id: "risks", label: "Risks" },
    { id: "deals", label: `Deals${allDeals.length > 0 ? ` (${allDeals.length})` : ""}` },
  ];

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
              href="/dashboard/investor/companies"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Back to Companies
            </Link>
          </div>
        </div>
      </header>

      {/* Company Hero */}
      <div className="bg-white border-b border-gray-200">
        <div className="container py-8">
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-start gap-5">
              {/* Logo */}
              <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-900 border border-gray-200 flex items-center justify-center">
                {company.logoUrl ? (
                  <img
                    src={company.logoUrl}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-white">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Name & Meta */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {displayName}
                </h1>
                <p className="text-sm text-gray-500 mb-3">
                  {sectorLabels[company.sector] || company.sector}
                  {company.subsector && (
                    <>
                      {" "}
                      ·{" "}
                      {subsectorLabels[company.subsector] || company.subsector}
                    </>
                  )}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    {stageLabels[company.stage] || company.stage}
                  </span>
                  {company.preferredLane && (
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${company.preferredLane === "YIELD" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"}`}
                    >
                      {laneLabels[company.preferredLane]} Lane
                    </span>
                  )}
                  {company.preferredInstrument && (
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600">
                      {instrumentLabels[company.preferredInstrument] ||
                        company.preferredInstrument}
                    </span>
                  )}
                  {company.verificationRecords?.length > 0 && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {company.verificationRecords.length} Verified
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() => setIsWatchlisted(!isWatchlisted)}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all border-2 ${isWatchlisted ? "border-yellow-400 bg-yellow-50 text-yellow-700" : "border-gray-300 text-gray-700 hover:border-gray-400"}`}
              >
                <svg
                  className={`w-4 h-4 inline mr-1.5 -mt-0.5 ${isWatchlisted ? "fill-yellow-500" : ""}`}
                  fill={isWatchlisted ? "currentColor" : "none"}
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
                {isWatchlisted ? "Saved" : "Save"}
              </button>
              {liveDeals.length > 0 && (
                <button
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
                  style={{ backgroundColor: "#C8A24D", color: "#0B1C2D" }}
                  onClick={() => setActiveTab("deals")}
                >
                  View Deals
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="container">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="container py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content — Left 2/3 */}
          <div className="lg:col-span-2 space-y-8">
            {activeTab === "overview" && <OverviewTab company={company} liveDeals={liveDeals} onViewDeals={() => setActiveTab("deals")} />}
            {activeTab === "traction" && <TractionTab company={company} />}
            {activeTab === "team" && <TeamTab company={company} />}
            {activeTab === "capital" && <CapitalTab company={company} />}
            {activeTab === "risks" && <RisksTab company={company} />}
            {activeTab === "deals" && (
              <DealsTab company={company} liveDeals={liveDeals} pastDeals={pastDeals} />
            )}
          </div>

          {/* Sidebar — Right 1/3 */}
          <div className="space-y-6">
            {/* Key Facts */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                Key Facts
              </h3>
              <div className="space-y-4">
                <SidebarRow
                  label="Sector"
                  value={sectorLabels[company.sector] || company.sector}
                />
                {company.subsector && (
                  <SidebarRow
                    label="Subsector"
                    value={
                      subsectorLabels[company.subsector] || company.subsector
                    }
                  />
                )}
                <SidebarRow
                  label="Stage"
                  value={stageLabels[company.stage] || company.stage}
                />
                <SidebarRow
                  label="Business Model"
                  value={
                    businessModelLabels[company.businessModel] ||
                    company.businessModel
                  }
                />
                {company.teamSize && (
                  <SidebarRow
                    label="Team Size"
                    value={teamSizeLabels[company.teamSize] || company.teamSize}
                  />
                )}
                <SidebarRow
                  label="Country"
                  value={company.countryOfIncorporation}
                />
                {company.operatingCountries?.length > 0 && (
                  <SidebarRow
                    label="Operating In"
                    value={company.operatingCountries.join(", ")}
                  />
                )}
              </div>
            </div>

            {/* Fundraising */}
            {(company.targetRaiseRange || company.preferredLane) && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                  Fundraising
                </h3>
                <div className="space-y-4">
                  {company.targetRaiseRange && (
                    <SidebarRow
                      label="Target Raise"
                      value={company.targetRaiseRange}
                    />
                  )}
                  {company.preferredLane && (
                    <SidebarRow
                      label="Lane"
                      value={`${laneLabels[company.preferredLane]} Lane`}
                    />
                  )}
                  {company.preferredInstrument && (
                    <SidebarRow
                      label="Instrument"
                      value={
                        instrumentLabels[company.preferredInstrument] ||
                        company.preferredInstrument
                      }
                    />
                  )}
                  {company.primaryUseOfFunds && (
                    <SidebarRow
                      label="Use of Funds"
                      value={company.primaryUseOfFunds}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Verification */}
            {company.verificationRecords?.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                  Verified
                </h3>
                <div className="space-y-3">
                  {company.verificationRecords.map((v, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-3 h-3 text-green-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700">
                        {verificationLabels[v.type] || v.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Website */}
            {company.website && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                  Links
                </h3>
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
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
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  Company Website
                </a>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// ============================================================================
// SIDEBAR ROW
// ============================================================================
function SidebarRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
  );
}

// ============================================================================
// OVERVIEW TAB
// ============================================================================
function OverviewTab({ company, liveDeals, onViewDeals }: { company: Company; liveDeals: Company["deals"]; onViewDeals: () => void }) {
  return (
    <div className="space-y-8">
      {/* Description */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">About</h3>
        <p className="text-base text-gray-700 font-medium mb-4">
          {company.oneLineDescription}
        </p>
        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
          {company.detailedDescription}
        </p>

        {/* Active Offering Banner */}
        {liveDeals.length > 0 && (
          <div className="mt-6 p-4 rounded-lg border border-amber-200 bg-amber-50/50">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <p className="text-sm font-semibold text-gray-900">Active Offering Available</p>
                </div>
                <p className="text-xs text-gray-600">
                  {liveDeals[0].name} · {instrumentLabels[liveDeals[0].instrumentType] || liveDeals[0].instrumentType} · ${Number(liveDeals[0].targetAmount).toLocaleString()} target
                </p>
              </div>
              <button
                onClick={onViewDeals}
                className="px-4 py-2 text-xs font-semibold rounded-lg transition-all hover:opacity-90"
                style={{ backgroundColor: "#C8A24D", color: "#0B1C2D" }}
              >
                View Deal →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {company.revenueStatus &&
          company.revenueStatus !== "no_revenue" &&
          company.revenueRange && (
            <StatCard label="Revenue" value={company.revenueRange} />
          )}
        {company.targetRaiseRange && (
          <StatCard label="Target Raise" value={company.targetRaiseRange} />
        )}
        {company.geographicFootprint && (
          <StatCard label="Geography" value={company.geographicFootprint} />
        )}
        {company.teamSize && (
          <StatCard
            label="Team"
            value={teamSizeLabels[company.teamSize] || company.teamSize}
          />
        )}
        {company.founderOwnedPercent && (
          <StatCard
            label="Founder Ownership"
            value={`${company.founderOwnedPercent}%`}
          />
        )}
        {company.hasRaisedBefore && (
          <StatCard label="Previous Raises" value="Yes" />
        )}
      </div>

      {/* Key Metrics */}
      {company.keyMetrics &&
        (company.keyMetrics.metric1 ||
          company.keyMetrics.metric2 ||
          company.keyMetrics.metric3) && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Key Metrics
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {company.keyMetrics.metric1 && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Metric 1</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {company.keyMetrics.metric1}
                  </p>
                </div>
              )}
              {company.keyMetrics.metric2 && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Metric 2</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {company.keyMetrics.metric2}
                  </p>
                </div>
              )}
              {company.keyMetrics.metric3 && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Metric 3</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {company.keyMetrics.metric3}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
    </div>
  );
}

// ============================================================================
// STAT CARD
// ============================================================================
function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-lg font-bold text-gray-900">{value}</p>
    </div>
  );
}

// ============================================================================
// TRACTION TAB
// ============================================================================
function TractionTab({ company }: { company: Company }) {
  return (
    <div className="space-y-8">
      {/* Revenue */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue</h3>
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-gray-400 mb-1">Status</p>
            <p className="text-sm font-medium text-gray-900 capitalize">
              {company.revenueStatus?.replace(/_/g, " ") || "Not provided"}
            </p>
          </div>
          {company.revenueRange && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Range</p>
              <p className="text-sm font-medium text-gray-900">
                {company.revenueRange}
              </p>
            </div>
          )}
          {company.primaryRevenueSource && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Primary Source</p>
              <p className="text-sm font-medium text-gray-900 capitalize">
                {company.primaryRevenueSource}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      {company.keyMetrics && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Key Performance Indicators
          </h3>
          <div className="space-y-4">
            {company.keyMetrics.metric1 && (
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary-700">1</span>
                </div>
                <p className="text-sm text-gray-900 font-medium">
                  {company.keyMetrics.metric1}
                </p>
              </div>
            )}
            {company.keyMetrics.metric2 && (
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary-700">2</span>
                </div>
                <p className="text-sm text-gray-900 font-medium">
                  {company.keyMetrics.metric2}
                </p>
              </div>
            )}
            {company.keyMetrics.metric3 && (
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary-700">3</span>
                </div>
                <p className="text-sm text-gray-900 font-medium">
                  {company.keyMetrics.metric3}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Customers & Geography */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Market</h3>
        <div className="space-y-4">
          {company.majorCustomers?.length > 0 && company.majorCustomers[0] && (
            <div>
              <p className="text-xs text-gray-400 mb-2">Major Customers</p>
              <div className="flex flex-wrap gap-2">
                {company.majorCustomers.filter(Boolean).map((c, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
          {company.geographicFootprint && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Geographic Footprint</p>
              <p className="text-sm font-medium text-gray-900">
                {company.geographicFootprint}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TEAM TAB
// ============================================================================
function TeamTab({ company }: { company: Company }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">
          Founders & Team
        </h3>
        <div className="space-y-4">
          {company.founders?.map((f) => {
            const name =
              [f.founder.user.firstName, f.founder.user.lastName]
                .filter(Boolean)
                .join(" ") || f.founder.user.email;
            const initials =
              (f.founder.user.firstName?.charAt(0) || "") +
              (f.founder.user.lastName?.charAt(0) || "");
            return (
              <div
                key={f.id}
                className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-white">
                    {initials || name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold text-gray-900">{name}</p>
                    {f.isPrimary && (
                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                        Primary
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{f.role}</p>
                  <p className="text-sm text-gray-600">{f.bio}</p>
                  {f.linkedinUrl && (
                    <a
                      href={f.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {company.teamSize && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-400 mb-1">Total Team Size</p>
            <p className="text-sm font-semibold text-gray-900">
              {teamSizeLabels[company.teamSize] || company.teamSize}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// CAPITAL TAB
// ============================================================================
function CapitalTab({ company }: { company: Company }) {
  return (
    <div className="space-y-8">
      {/* Cap Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Cap Table Summary
        </h3>
        <div className="grid sm:grid-cols-2 gap-6">
          {company.founderOwnedPercent !== undefined &&
            company.founderOwnedPercent !== null && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Founder Ownership</p>
                <p className="text-2xl font-bold text-gray-900">
                  {company.founderOwnedPercent}%
                </p>
              </div>
            )}
          {company.externalInvestorsPercent !== undefined &&
            company.externalInvestorsPercent !== null && (
              <div>
                <p className="text-xs text-gray-400 mb-1">External Investors</p>
                <p className="text-2xl font-bold text-gray-900">
                  {company.externalInvestorsPercent}%
                </p>
              </div>
            )}
        </div>
        {(company.founderOwnedPercent || company.externalInvestorsPercent) && (
          <div className="mt-4 h-3 bg-gray-100 rounded-full overflow-hidden flex">
            {company.founderOwnedPercent && (
              <div
                className="bg-gray-900 h-full rounded-l-full"
                style={{ width: `${company.founderOwnedPercent}%` }}
              ></div>
            )}
            {company.externalInvestorsPercent && (
              <div
                className="bg-primary-400 h-full"
                style={{ width: `${company.externalInvestorsPercent}%` }}
              ></div>
            )}
          </div>
        )}
        {(company.founderOwnedPercent || company.externalInvestorsPercent) && (
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-gray-900"></div>
              <span className="text-xs text-gray-500">Founders</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-primary-400"></div>
              <span className="text-xs text-gray-500">External Investors</span>
            </div>
          </div>
        )}
      </div>

      {/* Previous Raises */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Fundraising History
        </h3>
        {company.hasRaisedBefore ? (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <p className="text-sm font-medium text-gray-900">
                Has raised previously
              </p>
            </div>
            {company.previousRaises && (
              <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                {typeof company.previousRaises === "string"
                  ? company.previousRaises
                  : JSON.stringify(company.previousRaises)}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No previous raises reported</p>
        )}
        {company.notableInvestors?.length > 0 &&
          company.notableInvestors[0] && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-400 mb-2">Notable Investors</p>
              <div className="flex flex-wrap gap-2">
                {company.notableInvestors.filter(Boolean).map((inv, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                  >
                    {inv}
                  </span>
                ))}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}

// ============================================================================
// RISKS TAB
// ============================================================================
function RisksTab({ company }: { company: Company }) {
  return (
    <div className="space-y-8">
      {/* Top Risks */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Top Risks</h3>
        <div className="space-y-3">
          {company.topRisks?.map((risk, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-100"
            >
              <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-red-700">{i + 1}</span>
              </div>
              <p className="text-sm text-gray-800">{risk}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Flags */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Risk Flags</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <RiskFlag
            label="Regulation Dependent"
            active={company.regulationDependent}
            detail={company.regulatoryDependencies}
          />
          <RiskFlag label="FX Exposure" active={company.fxExposure} />
          <RiskFlag label="Single Supplier" active={company.singleSupplier} />
          <RiskFlag
            label="Infrastructure Dependent"
            active={company.infrastructureDependent}
          />
        </div>
      </div>

      {/* Material Threats */}
      {company.materialThreats && company.materialThreats.trim() && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Material Threats & Obligations
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {company.materialThreats}
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// RISK FLAG
// ============================================================================
function RiskFlag({
  label,
  active,
  detail,
}: {
  label: string;
  active: boolean;
  detail?: string;
}) {
  return (
    <div
      className={`p-4 rounded-lg border ${active ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-gray-200"}`}
    >
      <div className="flex items-center gap-2 mb-1">
        <div
          className={`w-2 h-2 rounded-full ${active ? "bg-amber-500" : "bg-green-500"}`}
        ></div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
      </div>
      <p className={`text-xs ${active ? "text-amber-700" : "text-green-700"}`}>
        {active ? "Yes" : "No"}
      </p>
      {active && detail && (
        <p className="text-xs text-gray-600 mt-1">{detail}</p>
      )}
    </div>
  );
}

// ============================================================================
// DEALS TAB
// ============================================================================
function DealKeyTerms({ terms, instrumentType }: { terms: any; instrumentType: string }) {
  if (!terms) return null;
  const bullets: string[] = [];

  if (instrumentType === "SAFE" || instrumentType === "CONVERTIBLE_NOTE") {
    if (terms.valuationCap || terms.valuation_cap) bullets.push(`Valuation cap: $${Number(terms.valuationCap || terms.valuation_cap).toLocaleString()}`);
    if (terms.discount) bullets.push(`Discount: ${terms.discount}%`);
    if (terms.interestRate) bullets.push(`Interest rate: ${terms.interestRate}%`);
  } else if (instrumentType === "SPV_EQUITY") {
    if (terms.preMoneyValuation || terms.valuation) bullets.push(`Pre-money valuation: $${Number(terms.preMoneyValuation || terms.valuation).toLocaleString()}`);
    if (terms.shareClass) bullets.push(`Share class: ${terms.shareClass}`);
  } else if (instrumentType === "REVENUE_SHARE_NOTE" || instrumentType === "ASSET_BACKED_PARTICIPATION") {
    if (terms.revenueSharePercentage || terms.revenueShare) bullets.push(`Revenue share: ${terms.revenueSharePercentage || terms.revenueShare}%`);
    if (terms.repaymentCap || terms.returnCap) bullets.push(`Repayment cap: ${terms.repaymentCap || terms.returnCap}x`);
    if (terms.paymentFrequency) bullets.push(`Payment frequency: ${terms.paymentFrequency}`);
  }

  if (bullets.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <p className="text-xs text-gray-400 mb-1.5">Key Terms</p>
      <ul className="space-y-1">
        {bullets.slice(0, 3).map((b, i) => (
          <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
            <span className="text-gray-300 mt-0.5">·</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DealsTab({
  company,
  liveDeals,
  pastDeals,
}: {
  company: Company;
  liveDeals: Company["deals"];
  pastDeals: Company["deals"];
}) {
  const router = useRouter();

  const handleExpressInterest = (dealId: string) => {
    router.push(`/dashboard/investor/invest/${dealId}`);
  };

  return (
    <div className="space-y-8">
      {/* Live Deals */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Live Deals</h3>
        {liveDeals.length === 0 ? (
          <p className="text-sm text-gray-500">No live deals at this time.</p>
        ) : (
          <div className="space-y-4">
            {liveDeals.map((deal) => {
              const progress =
                deal.targetAmount > 0
                  ? (deal.raisedAmount / deal.targetAmount) * 100
                  : 0;
              return (
                <div
                  key={deal.id}
                  className="p-5 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-base font-bold text-gray-900">
                        {deal.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-semibold ${deal.lane === "YIELD" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"}`}
                        >
                          {laneLabels[deal.lane] || deal.lane}
                        </span>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                          {instrumentLabels[deal.instrumentType] ||
                            deal.instrumentType}
                        </span>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      Live
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Round filled</span>
                      <span className="font-medium text-gray-900">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-gray-400">Hard Cap</p>
                      <p className="font-semibold text-gray-900">
                        ${Number(deal.targetAmount).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Raised</p>
                      <p className="font-semibold text-gray-900">
                        ${Number(deal.raisedAmount).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Min Investment</p>
                      <p className="font-semibold text-gray-900">
                        ${Number(deal.minimumInvestment).toLocaleString()}
                      </p>
                    </div>
                    {deal.closeDate && (
                      <div>
                        <p className="text-xs text-gray-400">Close Date</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(deal.closeDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                    )}
                  </div>

                  <DealKeyTerms terms={deal.terms} instrumentType={deal.instrumentType} />

                  {/* Express Interest Button */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleExpressInterest(deal.id)}
                      className="w-full py-3 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
                      style={{ backgroundColor: "#C8A24D", color: "#0B1C2D" }}
                    >
                      Express Interest
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Past Deals */}
      {pastDeals.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Past Deals</h3>
          <div className="space-y-4">
            {pastDeals.map((deal) => {
              const progress =
                deal.targetAmount > 0
                  ? (deal.raisedAmount / deal.targetAmount) * 100
                  : 0;
              return (
                <div
                  key={deal.id}
                  className="p-5 border border-gray-200 rounded-lg bg-gray-50/50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-base font-bold text-gray-900">
                        {deal.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-semibold ${deal.lane === "YIELD" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"}`}
                        >
                          {laneLabels[deal.lane] || deal.lane}
                        </span>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                          {instrumentLabels[deal.instrumentType] ||
                            deal.instrumentType}
                        </span>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-xs font-semibold">
                      {deal.status === "COMPLETED" ? "Completed" : "Closed"}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-gray-400">Target</p>
                      <p className="font-semibold text-gray-900">
                        ${Number(deal.targetAmount).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Final Raised</p>
                      <p className="font-semibold text-gray-900">
                        ${Number(deal.raisedAmount).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Filled</p>
                      <p className="font-semibold text-gray-900">
                        {Math.round(progress)}%
                      </p>
                    </div>
                  </div>

                  <DealKeyTerms terms={deal.terms} instrumentType={deal.instrumentType} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
