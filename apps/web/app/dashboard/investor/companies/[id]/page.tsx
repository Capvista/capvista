"use client";

import { useAuth } from "@/lib/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Star, CheckCircle2, ExternalLink, Linkedin } from "lucide-react";

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
  teamMembers?: Array<{
    id: string;
    fullName: string;
    role: string;
    bio?: string | null;
    linkedinUrl?: string | null;
    photoUrl?: string | null;
    email?: string | null;
    equityPercent?: number | null;
    sortOrder: number;
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
      <div className="min-h-screen flex items-center justify-center bg-[#F6F8FA]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#0A1F44] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#6B7280]">Loading...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F8FA]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#0A1F44] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#6B7280]">Loading company...</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-[#F6F8FA]">
        <div
          className="py-6 px-6"
          style={{ background: "linear-gradient(to bottom right, #0A1F44, #1A3A6B)" }}
        >
          <div className="max-w-7xl mx-auto">
            <Link
              href="/dashboard/investor/companies"
              className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Companies
            </Link>
          </div>
        </div>
        <main className="max-w-7xl mx-auto px-6 py-16 text-center">
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
          <h2 className="text-xl font-bold text-[#111827] mb-2">
            Company Not Found
          </h2>
          <p className="text-[#6B7280] mb-6">
            {error || "This company doesn't exist or has been removed."}
          </p>
          <Link
            href="/dashboard/investor/companies"
            className="inline-block px-6 py-3 rounded-lg font-semibold bg-[#0A1F44] text-white transition-all hover:opacity-90"
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
    <div className="min-h-screen bg-[#F6F8FA]">
      {/* Hero Section */}
      <div style={{ background: "linear-gradient(to bottom right, #0A1F44, #1A3A6B)" }}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Back Link */}
          <Link
            href="/dashboard/investor/companies"
            className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Companies
          </Link>

          <div className="flex items-start justify-between gap-6">
            <div className="flex items-start gap-5">
              {/* Logo */}
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
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
                <h1 className="text-3xl font-bold text-white mb-1">
                  {displayName}
                </h1>
                <p className="text-white/80 mb-3">
                  {company.oneLineDescription}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-block px-3 py-1 rounded-full text-sm text-white bg-white/10 backdrop-blur-sm border border-white/20">
                    {stageLabels[company.stage] || company.stage}
                  </span>
                  <span className="inline-block px-3 py-1 rounded-full text-sm text-white bg-white/10 backdrop-blur-sm border border-white/20">
                    {sectorLabels[company.sector] || company.sector}
                  </span>
                  {company.preferredLane && (
                    <span className="inline-block px-3 py-1 rounded-full text-sm text-white bg-white/10 backdrop-blur-sm border border-white/20">
                      {laneLabels[company.preferredLane]} Lane
                    </span>
                  )}
                  {company.preferredInstrument && (
                    <span className="inline-block px-3 py-1 rounded-full text-sm text-white bg-white/10 backdrop-blur-sm border border-white/20">
                      {instrumentLabels[company.preferredInstrument] ||
                        company.preferredInstrument}
                    </span>
                  )}
                  {company.verificationRecords?.length > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {company.verificationRecords.length} Verified
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {liveDeals.length > 0 && (
                <button
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-white text-[#0A1F44] transition-all hover:opacity-90"
                  onClick={() => setActiveTab("deals")}
                >
                  View Deals
                </button>
              )}
              <button
                onClick={() => setIsWatchlisted(!isWatchlisted)}
                className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center transition-all hover:bg-white/20"
              >
                <Star
                  className={`w-5 h-5 ${isWatchlisted ? "fill-[#C8A24D] text-[#C8A24D]" : "text-white"}`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="bg-[#F6F8FA] border-b border-[#E5E7EB] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-[#0A1F44] text-[#0A1F44]"
                    : "border-transparent text-[#6B7280] hover:text-[#0A1F44]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content — Left 2/3 */}
          <div className="flex-1 lg:w-2/3 space-y-8">
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
          <div className="lg:w-1/3 space-y-6 lg:sticky lg:top-24 lg:self-start">
            {/* Key Facts */}
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-sm">
              <h3 className="text-sm font-bold text-[#111827] mb-4 uppercase tracking-wide">
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
              <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-sm">
                <h3 className="text-sm font-bold text-[#111827] mb-4 uppercase tracking-wide">
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
              <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-sm">
                <h3 className="text-sm font-bold text-[#111827] mb-4 uppercase tracking-wide">
                  Verified
                </h3>
                <div className="space-y-3">
                  {company.verificationRecords.map((v, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-green-600" />
                      </div>
                      <span className="text-sm text-[#111827]">
                        {verificationLabels[v.type] || v.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Website */}
            {company.website && (
              <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-sm">
                <h3 className="text-sm font-bold text-[#111827] mb-3 uppercase tracking-wide">
                  Links
                </h3>
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-[#0A1F44] hover:text-[#1A3A6B] font-medium transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
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
      <p className="text-[#9CA3AF] text-xs mb-1">{label}</p>
      <p className="text-sm text-[#111827]">{value}</p>
    </div>
  );
}

// ============================================================================
// OVERVIEW TAB
// ============================================================================
function OverviewTab({ company, liveDeals, onViewDeals }: { company: Company; liveDeals: Company["deals"]; onViewDeals: () => void }) {
  return (
    <div className="space-y-8">
      {/* About */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-sm">
        <h3 className="text-xl font-bold text-[#111827] mb-4">About</h3>
        <p className="font-medium text-[#111827] mb-3">
          {company.oneLineDescription}
        </p>
        <p className="text-[#6B7280] leading-relaxed whitespace-pre-line">
          {company.detailedDescription}
        </p>

        {/* Active Offering Banner */}
        {liveDeals.length > 0 && (
          <div className="mt-6 p-4 rounded-lg border border-amber-200 bg-amber-50/50">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <p className="text-sm font-semibold text-[#111827]">Active Offering Available</p>
                </div>
                <p className="text-xs text-[#6B7280]">
                  {liveDeals[0].name} · {instrumentLabels[liveDeals[0].instrumentType] || liveDeals[0].instrumentType} · ${Number(liveDeals[0].targetAmount).toLocaleString()} target
                </p>
              </div>
              <button
                onClick={onViewDeals}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#0A1F44] text-white transition-all hover:opacity-90"
              >
                View Deal →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
          <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-sm">
            <h3 className="text-xl font-bold text-[#111827] mb-4">
              Key Metrics
            </h3>
            <div className="space-y-4">
              {company.keyMetrics.metric1 && (
                <div className="flex items-start gap-3 p-4 bg-[#F6F8FA] rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-[#0A1F44] flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-white">1</span>
                  </div>
                  <p className="text-sm text-[#111827] font-mono pt-1">
                    {company.keyMetrics.metric1}
                  </p>
                </div>
              )}
              {company.keyMetrics.metric2 && (
                <div className="flex items-start gap-3 p-4 bg-[#F6F8FA] rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-[#0A1F44] flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-white">2</span>
                  </div>
                  <p className="text-sm text-[#111827] font-mono pt-1">
                    {company.keyMetrics.metric2}
                  </p>
                </div>
              )}
              {company.keyMetrics.metric3 && (
                <div className="flex items-start gap-3 p-4 bg-[#F6F8FA] rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-[#0A1F44] flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-white">3</span>
                  </div>
                  <p className="text-sm text-[#111827] font-mono pt-1">
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
    <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-sm">
      <p className="text-[#9CA3AF] text-sm mb-1">{label}</p>
      <p className="text-[#111827] font-bold font-mono text-lg">{value}</p>
    </div>
  );
}

// ============================================================================
// TRACTION TAB
// ============================================================================
function TractionTab({ company }: { company: Company }) {
  const metrics = [
    company.keyMetrics?.metric1,
    company.keyMetrics?.metric2,
    company.keyMetrics?.metric3,
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-8">
      {/* Revenue */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-sm">
        <h3 className="text-xl font-bold text-[#111827] mb-4">Revenue</h3>
        <div className="grid sm:grid-cols-3 gap-6">
          <div>
            <p className="text-[#9CA3AF] text-sm mb-1">Status</p>
            <p className="text-sm text-[#111827] font-medium capitalize">
              {company.revenueStatus?.replace(/_/g, " ") || "Not provided"}
            </p>
          </div>
          {company.revenueRange && (
            <div>
              <p className="text-[#9CA3AF] text-sm mb-1">Range</p>
              <p className="text-sm text-[#111827] font-medium font-mono">
                {company.revenueRange}
              </p>
            </div>
          )}
          {company.primaryRevenueSource && (
            <div>
              <p className="text-[#9CA3AF] text-sm mb-1">Type</p>
              <p className="text-sm text-[#111827] font-medium capitalize">
                {company.primaryRevenueSource}
              </p>
            </div>
          )}
        </div>

        {/* KPIs under divider */}
        {metrics.length > 0 && (
          <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
            <p className="text-[#9CA3AF] text-sm font-medium mb-4">Top Performance Indicators</p>
            <div className="space-y-3">
              {metrics.map((m, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-[#F9FAFB] rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-[#0A1F44] flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-white">{i + 1}</span>
                  </div>
                  <p className="text-sm text-[#111827] font-mono pt-1">{m}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Market */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-sm">
        <h3 className="text-xl font-bold text-[#111827] mb-4">Market</h3>
        <div className="space-y-4">
          {company.majorCustomers?.length > 0 && company.majorCustomers[0] && (
            <div>
              <p className="text-[#9CA3AF] text-sm mb-2">Major Customers</p>
              <div className="flex flex-wrap gap-2">
                {company.majorCustomers.filter(Boolean).map((c, i) => (
                  <span
                    key={i}
                    className="px-4 py-2 bg-[#F9FAFB] text-[#111827] rounded-full text-sm border border-[#E5E7EB]"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
          {company.geographicFootprint && (
            <div>
              <p className="text-[#9CA3AF] text-sm mb-1">Geographic Footprint</p>
              <p className="text-sm text-[#111827]">
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
      {/* Founders */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-sm">
        <h3 className="text-xl font-bold text-[#111827] mb-6">
          Founders
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
                className="bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] p-6 relative"
              >
                {f.linkedinUrl && (
                  <a
                    href={f.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-6 right-6 text-[#0A1F44] hover:text-[#1A3A6B] transition-colors"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#0A1F44] flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-white">
                      {initials || name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-lg font-bold text-[#111827]">{name}</p>
                      {f.isPrimary && (
                        <span className="px-2 py-0.5 bg-[#C8A24D]/20 text-[#C8A24D] rounded text-xs font-medium">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#6B7280] mb-3">{f.role}</p>
                    <p className="text-sm text-[#6B7280] leading-relaxed">{f.bio}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Key Team Members */}
      {company.teamMembers && company.teamMembers.length > 0 && (
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-sm">
          <h3 className="text-xl font-bold text-[#111827] mb-6">
            Key Team
          </h3>
          <div className="space-y-4">
            {company.teamMembers.map((m) => {
              const initials = m.fullName
                .split(" ")
                .map((n) => n.charAt(0))
                .join("")
                .toUpperCase()
                .slice(0, 2);
              return (
                <div
                  key={m.id}
                  className="bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] p-6 relative"
                >
                  {m.linkedinUrl && (
                    <a
                      href={m.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-6 right-6 text-[#0A1F44] hover:text-[#1A3A6B] transition-colors"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                  <div className="flex items-start gap-4">
                    {m.photoUrl ? (
                      <img
                        src={m.photoUrl}
                        alt={m.fullName}
                        className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-[#0A1F44] flex items-center justify-center flex-shrink-0">
                        <span className="text-xl font-bold text-white">{initials}</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-lg font-bold text-[#111827]">{m.fullName}</p>
                        {m.equityPercent != null && (
                          <span className="px-2 py-0.5 bg-[#C8A24D]/20 text-[#C8A24D] rounded text-xs font-medium">
                            {m.equityPercent}% equity
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[#6B7280] mb-3">{m.role}</p>
                      {m.bio && (
                        <p className="text-sm text-[#6B7280] leading-relaxed">{m.bio}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Team Size */}
      {company.teamSize && (
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-sm">
          <div>
            <p className="text-[#9CA3AF] text-xs mb-1">Total Team Size</p>
            <p className="text-sm font-semibold text-[#111827]">
              {teamSizeLabels[company.teamSize] || company.teamSize}
            </p>
          </div>
        </div>
      )}
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
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-sm">
        <h3 className="text-xl font-bold text-[#111827] mb-4">
          Cap Table Summary
        </h3>
        {(company.founderOwnedPercent || company.externalInvestorsPercent) && (
          <>
            <div className="h-12 flex rounded-lg overflow-hidden mb-3">
              {company.founderOwnedPercent != null && company.founderOwnedPercent > 0 && (
                <div
                  className="bg-[#0A1F44] h-full flex items-center justify-center"
                  style={{ width: `${company.founderOwnedPercent}%` }}
                >
                  <span className="text-white text-sm font-bold">
                    {company.founderOwnedPercent}%
                  </span>
                </div>
              )}
              {company.externalInvestorsPercent != null && company.externalInvestorsPercent > 0 && (
                <div
                  className="bg-[#10B981] h-full flex items-center justify-center"
                  style={{ width: `${company.externalInvestorsPercent}%` }}
                >
                  <span className="text-white text-sm font-bold">
                    {company.externalInvestorsPercent}%
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#0A1F44]"></div>
                <span className="text-xs text-[#6B7280]">Founders</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#10B981]"></div>
                <span className="text-xs text-[#6B7280]">External Investors</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Fundraising History */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-sm">
        <h3 className="text-xl font-bold text-[#111827] mb-4">
          Fundraising History
        </h3>
        <div className="space-y-3">
          <div>
            <p className="text-[#9CA3AF] text-sm mb-1">Has Raised Before</p>
            <p className="text-sm text-[#111827]">
              {company.hasRaisedBefore ? "Yes" : "No"}
            </p>
          </div>
          {company.hasRaisedBefore && company.previousRaises && (
            <div>
              <p className="text-[#9CA3AF] text-sm mb-1">Details</p>
              <p className="text-sm text-[#111827]">
                {typeof company.previousRaises === "string"
                  ? company.previousRaises
                  : JSON.stringify(company.previousRaises)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Notable Investors */}
      {company.notableInvestors?.length > 0 && company.notableInvestors[0] && (
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-sm">
          <h3 className="text-xl font-bold text-[#111827] mb-4">
            Notable Investors
          </h3>
          <div className="flex flex-wrap gap-2">
            {company.notableInvestors.filter(Boolean).map((inv, i) => (
              <span
                key={i}
                className="px-4 py-2 bg-[#F9FAFB] text-[#111827] rounded-full text-sm border border-[#E5E7EB]"
              >
                {inv}
              </span>
            ))}
          </div>
        </div>
      )}
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
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-sm">
        <h3 className="text-xl font-bold text-[#111827] mb-4">Top Risks</h3>
        <div className="space-y-3">
          {company.topRisks?.map((risk, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-4 bg-[#F9FAFB] rounded-lg"
            >
              <div className="w-8 h-8 rounded-full bg-[#0A1F44] flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-white">{i + 1}</span>
              </div>
              <p className="text-sm text-[#111827] leading-relaxed pt-1">{risk}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Flags */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-sm">
        <h3 className="text-xl font-bold text-[#111827] mb-4">Risk Flags</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-sm">
          <h3 className="text-xl font-bold text-[#111827] mb-4">
            Material Threats & Obligations
          </h3>
          <p className="text-sm text-[#6B7280] leading-relaxed">
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
      className={`p-4 rounded-lg border ${active ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}
    >
      <p className="text-sm text-[#6B7280] mb-1">{label}</p>
      <p className={`text-sm font-medium ${active ? "text-red-700" : "text-green-700"}`}>
        {active ? "Yes" : "No"}
      </p>
      {active && detail && (
        <p className="text-xs text-[#6B7280] mt-1">{detail}</p>
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
    <div className="mt-3 pt-3 border-t border-[#E5E7EB]">
      <p className="text-xs text-[#9CA3AF] mb-1.5">Key Terms</p>
      <ul className="space-y-1">
        {bullets.slice(0, 3).map((b, i) => (
          <li key={i} className="text-xs text-[#6B7280] flex items-start gap-1.5">
            <span className="text-[#9CA3AF] mt-0.5">·</span>
            <span className="font-mono">{b}</span>
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
  return (
    <div className="space-y-8">
      {/* Live Deals */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-sm">
        <h3 className="text-xl font-bold text-[#111827] mb-6">Live Deals</h3>
        {liveDeals.length === 0 ? (
          <p className="text-sm text-[#6B7280]">No live deals at this time.</p>
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
                  className="p-5 border border-[#E5E7EB] rounded-lg hover:border-[#0A1F44]/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-xl font-bold text-[#111827]">
                        {deal.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span
                          className={`px-2.5 py-0.5 rounded text-xs font-semibold ${deal.lane === "YIELD" ? "bg-blue-100 text-blue-700 border border-blue-200" : "bg-purple-100 text-purple-700 border border-purple-200"}`}
                        >
                          {laneLabels[deal.lane] || deal.lane}
                        </span>
                        <span className="px-2.5 py-0.5 bg-[#F9FAFB] text-[#6B7280] rounded text-xs font-medium border border-[#E5E7EB]">
                          {instrumentLabels[deal.instrumentType] ||
                            deal.instrumentType}
                        </span>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-[#10B981] text-white rounded-full text-xs font-semibold">
                      Live
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#6B7280]">Round filled</span>
                      <span className="font-medium font-mono text-[#111827]">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <div className="h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#10B981] rounded-full transition-all"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-[#9CA3AF]">Hard Cap</p>
                      <p className="font-semibold text-[#111827] font-mono">
                        ${Number(deal.targetAmount).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#9CA3AF]">Raised</p>
                      <p className="font-semibold text-[#111827] font-mono">
                        ${Number(deal.raisedAmount).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#9CA3AF]">Min Investment</p>
                      <p className="font-semibold text-[#111827] font-mono">
                        ${Number(deal.minimumInvestment).toLocaleString()}
                      </p>
                    </div>
                    {deal.closeDate && (
                      <div>
                        <p className="text-xs text-[#9CA3AF]">Close Date</p>
                        <p className="font-semibold text-[#111827]">
                          {new Date(deal.closeDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                    )}
                  </div>

                  <DealKeyTerms terms={deal.terms} instrumentType={deal.instrumentType} />

                  {/* View Deal Link */}
                  <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
                    <Link
                      href={`/dashboard/investor/invest/${deal.id}`}
                      className="text-sm font-medium text-[#0A1F44] hover:text-[#1A3A6B] transition-colors"
                    >
                      View Deal →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Past Deals */}
      {pastDeals.length > 0 && (
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-sm">
          <h3 className="text-xl font-bold text-[#111827] mb-6">Past Deals</h3>
          <div className="space-y-4">
            {pastDeals.map((deal) => {
              const progress =
                deal.targetAmount > 0
                  ? (deal.raisedAmount / deal.targetAmount) * 100
                  : 0;
              return (
                <div
                  key={deal.id}
                  className="p-5 border border-[#E5E7EB] rounded-lg bg-[#F9FAFB]/50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-xl font-bold text-[#111827]">
                        {deal.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span
                          className={`px-2.5 py-0.5 rounded text-xs font-semibold ${deal.lane === "YIELD" ? "bg-blue-100 text-blue-700 border border-blue-200" : "bg-purple-100 text-purple-700 border border-purple-200"}`}
                        >
                          {laneLabels[deal.lane] || deal.lane}
                        </span>
                        <span className="px-2.5 py-0.5 bg-[#F9FAFB] text-[#6B7280] rounded text-xs font-medium border border-[#E5E7EB]">
                          {instrumentLabels[deal.instrumentType] ||
                            deal.instrumentType}
                        </span>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-[#E5E7EB] text-[#6B7280] rounded-full text-xs font-semibold">
                      {deal.status === "COMPLETED" ? "Completed" : "Closed"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-[#9CA3AF]">Target</p>
                      <p className="font-semibold text-[#111827] font-mono">
                        ${Number(deal.targetAmount).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#9CA3AF]">Final Raised</p>
                      <p className="font-semibold text-[#111827] font-mono">
                        ${Number(deal.raisedAmount).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#9CA3AF]">Filled</p>
                      <p className="font-semibold text-[#111827] font-mono">
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
