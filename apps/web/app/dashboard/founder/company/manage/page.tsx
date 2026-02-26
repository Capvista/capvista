"use client";

import { useAuth } from "@/lib/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import CustomSelect from "@/components/CustomSelect";
import {
  ArrowLeft,
  Save,
  Plus,
  Pencil,
  Trash2,
  X,
  ChevronUp,
  ChevronDown,
  Linkedin,
  Upload,
  LogOut,
  Check,
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ============================================================================
// OPTION DATA (mirrors onboarding)
// ============================================================================

const teamSizeOptions = [
  { value: "", label: "Select team size" },
  { value: "founders_only", label: "Founders only" },
  { value: "1-5", label: "1-5 employees" },
  { value: "6-20", label: "6-20 employees" },
  { value: "21-50", label: "21-50 employees" },
  { value: "50+", label: "50+ employees" },
];

const stageOptions = [
  { value: "", label: "Select stage" },
  { value: "PRE_REVENUE", label: "Pre-revenue" },
  { value: "EARLY_REVENUE", label: "Early revenue" },
  { value: "GROWTH", label: "Growth" },
  { value: "PROFITABLE", label: "Profitable" },
];

const sectorOptions = [
  { value: "", label: "Select sector" },
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

const businessModelOptions = [
  { value: "", label: "Select business model" },
  { value: "B2B", label: "B2B" },
  { value: "B2C", label: "B2C" },
  { value: "B2B2C", label: "B2B2C" },
  { value: "B2G", label: "B2G" },
  { value: "Marketplace", label: "Marketplace" },
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

// ============================================================================
// TYPES
// ============================================================================

type CompanyData = {
  id: string;
  legalName: string;
  tradingName: string;
  oneLineDescription: string;
  detailedDescription: string;
  website: string;
  sector: string;
  subsector: string;
  stage: string;
  businessModel: string;
  teamSize: string;
  operatingCountries: string[];
  logoUrl: string;
};

type TeamMember = {
  id: string;
  fullName: string;
  role: string;
  bio: string | null;
  linkedinUrl: string | null;
  photoUrl: string | null;
  email: string | null;
  equityPercent: number | null;
  sortOrder: number;
};

type TeamMemberForm = {
  fullName: string;
  role: string;
  bio: string;
  linkedinUrl: string;
  photoUrl: string;
  email: string;
  equityPercent: string;
  photoFile: File | null;
  photoPreview: string;
};

const emptyMemberForm: TeamMemberForm = {
  fullName: "",
  role: "",
  bio: "",
  linkedinUrl: "",
  photoUrl: "",
  email: "",
  equityPercent: "",
  photoFile: null,
  photoPreview: "",
};

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function ManageCompanyPage() {
  const { user, accessToken, loading, signOut } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"info" | "team">("info");
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  // Company Info state
  const [companyForm, setCompanyForm] = useState<CompanyData | null>(null);
  const [originalCompany, setOriginalCompany] = useState<CompanyData | null>(null);
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoToast, setInfoToast] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");

  // Team state
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamLoading, setTeamLoading] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [memberForm, setMemberForm] = useState<TeamMemberForm>(emptyMemberForm);
  const [savingMember, setSavingMember] = useState(false);

  // Delete confirmation
  const [deletingMember, setDeletingMember] = useState<TeamMember | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  // Fetch company data
  useEffect(() => {
    if (!loading && user && accessToken) {
      fetchCompany();
    }
  }, [user, loading, accessToken]);

  const fetchCompany = async () => {
    try {
      const res = await fetch(`${API_URL}/api/companies/my-companies`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        const c = data.data[0];
        setCompanyId(c.id);
        // Fetch full company details
        const detailRes = await fetch(`${API_URL}/api/companies/${c.id}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const detailData = await detailRes.json();
        if (detailData.success) {
          const d = detailData.data;
          const formData: CompanyData = {
            id: d.id,
            legalName: d.legalName || "",
            tradingName: d.tradingName || "",
            oneLineDescription: d.oneLineDescription || "",
            detailedDescription: d.detailedDescription || "",
            website: d.website || "",
            sector: d.sector || "",
            subsector: d.subsector || "",
            stage: d.stage || "",
            businessModel: d.businessModel || "",
            teamSize: d.teamSize || "",
            operatingCountries: d.operatingCountries || [],
            logoUrl: d.logoUrl || "",
          };
          setCompanyForm(formData);
          setOriginalCompany(formData);
          setLogoPreview(d.logoUrl || "");
        }
      } else {
        // No company, redirect to onboarding
        router.push("/dashboard/founder/onboarding");
        return;
      }
    } catch (err) {
      console.error("Failed to fetch company:", err);
    } finally {
      setPageLoading(false);
    }
  };

  // Fetch team members when tab switches or companyId loads
  useEffect(() => {
    if (companyId && accessToken && activeTab === "team") {
      fetchTeam();
    }
  }, [companyId, accessToken, activeTab]);

  const fetchTeam = async () => {
    if (!companyId) return;
    setTeamLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/companies/${companyId}/team`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (data.success) {
        setTeamMembers(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch team:", err);
    } finally {
      setTeamLoading(false);
    }
  };

  // ============================================================================
  // COMPANY INFO HANDLERS
  // ============================================================================

  const hasInfoChanges = () => {
    if (!companyForm || !originalCompany) return false;
    if (logoFile) return true;
    return JSON.stringify(companyForm) !== JSON.stringify(originalCompany);
  };

  const handleSaveInfo = async () => {
    if (!companyId || !companyForm || !accessToken) return;
    setSavingInfo(true);
    try {
      let logoUrl = companyForm.logoUrl;

      // Upload new logo if changed
      if (logoFile) {
        const fileExt = logoFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("company_logo")
          .upload(fileName, logoFile);
        if (uploadError) {
          alert("Failed to upload logo. Please try again.");
          setSavingInfo(false);
          return;
        }
        const { data: urlData } = supabase.storage
          .from("company_logo")
          .getPublicUrl(fileName);
        logoUrl = urlData.publicUrl;
      }

      const res = await fetch(`${API_URL}/api/companies/${companyId}/info`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...companyForm, logoUrl }),
      });
      const data = await res.json();
      if (data.success) {
        const updated = { ...companyForm, logoUrl };
        setCompanyForm(updated);
        setOriginalCompany(updated);
        setLogoFile(null);
        setLogoPreview(logoUrl);
        setInfoToast("Changes saved successfully");
        setTimeout(() => setInfoToast(null), 3000);
      } else {
        alert(data.error?.message || "Failed to save changes");
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save changes. Please try again.");
    } finally {
      setSavingInfo(false);
    }
  };

  const updateForm = (field: keyof CompanyData, value: any) => {
    setCompanyForm((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  // ============================================================================
  // TEAM MEMBER HANDLERS
  // ============================================================================

  const openAddModal = () => {
    setEditingMember(null);
    setMemberForm(emptyMemberForm);
    setShowModal(true);
  };

  const openEditModal = (member: TeamMember) => {
    setEditingMember(member);
    setMemberForm({
      fullName: member.fullName,
      role: member.role,
      bio: member.bio || "",
      linkedinUrl: member.linkedinUrl || "",
      photoUrl: member.photoUrl || "",
      email: member.email || "",
      equityPercent: member.equityPercent != null ? String(member.equityPercent) : "",
      photoFile: null,
      photoPreview: member.photoUrl || "",
    });
    setShowModal(true);
  };

  const handleSaveMember = async () => {
    if (!companyId || !accessToken) return;
    if (!memberForm.fullName.trim() || !memberForm.role.trim()) return;
    setSavingMember(true);

    try {
      let photoUrl = memberForm.photoUrl;

      // Upload photo if new file selected
      if (memberForm.photoFile) {
        const fileExt = memberForm.photoFile.name.split(".").pop();
        const fileName = `team/${companyId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("company_logo")
          .upload(fileName, memberForm.photoFile);
        if (uploadError) {
          alert("Failed to upload photo.");
          setSavingMember(false);
          return;
        }
        const { data: urlData } = supabase.storage
          .from("company_logo")
          .getPublicUrl(fileName);
        photoUrl = urlData.publicUrl;
      }

      const body = {
        fullName: memberForm.fullName.trim(),
        role: memberForm.role.trim(),
        bio: memberForm.bio.trim() || undefined,
        linkedinUrl: memberForm.linkedinUrl.trim() || "",
        photoUrl: photoUrl || "",
        email: memberForm.email.trim() || "",
        equityPercent: memberForm.equityPercent ? parseFloat(memberForm.equityPercent) : null,
      };

      const url = editingMember
        ? `${API_URL}/api/companies/${companyId}/team/${editingMember.id}`
        : `${API_URL}/api/companies/${companyId}/team`;

      const res = await fetch(url, {
        method: editingMember ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchTeam();
      } else {
        alert(data.error?.message || "Failed to save team member");
      }
    } catch (err) {
      console.error("Save member error:", err);
      alert("Failed to save team member.");
    } finally {
      setSavingMember(false);
    }
  };

  const handleDeleteMember = async () => {
    if (!deletingMember || !companyId || !accessToken) return;
    try {
      const res = await fetch(
        `${API_URL}/api/companies/${companyId}/team/${deletingMember.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      const data = await res.json();
      if (data.success) {
        setDeletingMember(null);
        fetchTeam();
      }
    } catch (err) {
      console.error("Delete member error:", err);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0 || !companyId || !accessToken) return;
    const newOrder = [...teamMembers];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    setTeamMembers(newOrder);
    await fetch(`${API_URL}/api/companies/${companyId}/team/reorder`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ memberIds: newOrder.map((m) => m.id) }),
    });
  };

  const handleMoveDown = async (index: number) => {
    if (index >= teamMembers.length - 1 || !companyId || !accessToken) return;
    const newOrder = [...teamMembers];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setTeamMembers(newOrder);
    await fetch(`${API_URL}/api/companies/${companyId}/team/reorder`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ memberIds: newOrder.map((m) => m.id) }),
    });
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading || pageLoading) {
    return (
      <div className="min-h-screen bg-[#F6F8FA] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#0A1F44] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !companyForm) return null;

  const firstName = user.firstName || "";
  const lastName = user.lastName || "";
  const userInitial = firstName.charAt(0).toUpperCase() || "U";
  const userFullName = `${firstName} ${lastName}`.trim();

  return (
    <div className="min-h-screen bg-[#F6F8FA]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0A1F44] to-[#10B981]" />
              <span className="text-xl font-semibold text-[#0A1F44]">Capvista</span>
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/dashboard/founder" className="text-gray-600 hover:text-[#0A1F44] transition-colors">
                Dashboard
              </Link>
              <Link href="/dashboard/founder/company/manage" className="text-[#0A1F44] font-medium">
                Company
              </Link>
              <Link href="/dashboard/founder" className="text-gray-600 hover:text-[#0A1F44] transition-colors">
                Deals
              </Link>
              <div className="relative group">
                <div className="w-10 h-10 rounded-full bg-[#0A1F44] flex items-center justify-center text-white font-semibold cursor-pointer">
                  {userInitial}
                </div>
                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="font-semibold text-gray-900">{userFullName}</p>
                    <p className="text-sm text-gray-600">Founder</p>
                  </div>
                  <button
                    onClick={signOut}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
                  >
                    <LogOut className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-900">Log Out</span>
                  </button>
                </div>
              </div>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back link */}
        <Link
          href="/dashboard/founder"
          className="inline-flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#0A1F44] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <h1 className="text-2xl font-bold text-[#111827] mb-6">Manage Company</h1>

        {/* Tab Bar */}
        <div className="flex border-b border-[#E5E7EB] mb-8">
          <button
            onClick={() => setActiveTab("info")}
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === "info"
                ? "text-[#0A1F44] border-[#0A1F44]"
                : "text-[#6B7280] border-transparent hover:text-[#0A1F44]"
            }`}
          >
            Company Info
          </button>
          <button
            onClick={() => setActiveTab("team")}
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === "team"
                ? "text-[#0A1F44] border-[#0A1F44]"
                : "text-[#6B7280] border-transparent hover:text-[#0A1F44]"
            }`}
          >
            Team Members
          </button>
        </div>

        {/* Success toast */}
        {infoToast && (
          <div className="fixed top-6 right-6 z-50 bg-green-50 border border-green-200 text-green-800 px-5 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium">{infoToast}</span>
          </div>
        )}

        {/* TAB CONTENT */}
        {activeTab === "info" ? (
          <CompanyInfoTab
            form={companyForm}
            updateForm={updateForm}
            logoPreview={logoPreview}
            logoFile={logoFile}
            onLogoChange={(file) => {
              if (file.size > 2 * 1024 * 1024) {
                alert("Logo must be under 2MB");
                return;
              }
              setLogoFile(file);
              setLogoPreview(URL.createObjectURL(file));
            }}
            hasChanges={hasInfoChanges()}
            saving={savingInfo}
            onSave={handleSaveInfo}
          />
        ) : (
          <TeamMembersTab
            members={teamMembers}
            loading={teamLoading}
            onAdd={openAddModal}
            onEdit={openEditModal}
            onDelete={(m) => setDeletingMember(m)}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
          />
        )}
      </div>

      {/* Add/Edit Team Member Modal */}
      {showModal && (
        <TeamMemberModal
          editing={!!editingMember}
          form={memberForm}
          setForm={setMemberForm}
          saving={savingMember}
          onSave={handleSaveMember}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deletingMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-[#111827] mb-2">Remove Team Member</h3>
            <p className="text-sm text-[#6B7280] mb-6">
              Remove <strong>{deletingMember.fullName}</strong> from your team? This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingMember(null)}
                className="px-4 py-2 text-sm font-medium border border-gray-300 text-[#0A1F44] hover:bg-gray-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteMember}
                className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// COMPANY INFO TAB
// ============================================================================

function CompanyInfoTab({
  form,
  updateForm,
  logoPreview,
  logoFile,
  onLogoChange,
  hasChanges,
  saving,
  onSave,
}: {
  form: CompanyData;
  updateForm: (field: keyof CompanyData, value: any) => void;
  logoPreview: string;
  logoFile: File | null;
  onLogoChange: (file: File) => void;
  hasChanges: boolean;
  saving: boolean;
  onSave: () => void;
}) {
  const logoInputRef = useRef<HTMLInputElement>(null);

  const inputClass =
    "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent outline-none text-[#111827]";

  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-sm">
      <div className="space-y-6">
        {/* Logo */}
        <div>
          <label className="block text-sm font-medium text-[#6B7280] mb-2">Company Logo</label>
          <div className="flex items-center gap-4">
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Logo"
                className="w-16 h-16 rounded-lg object-cover border border-[#E5E7EB]"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-[#0A1F44] flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {form.legalName?.charAt(0)?.toUpperCase() || "C"}
                </span>
              </div>
            )}
            <button
              onClick={() => logoInputRef.current?.click()}
              className="px-4 py-2 text-sm font-medium border border-gray-300 text-[#0A1F44] hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Change Logo
            </button>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onLogoChange(file);
              }}
            />
          </div>
        </div>

        {/* Legal Name + Trading Name */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-2">Legal Name</label>
            <input
              type="text"
              value={form.legalName}
              onChange={(e) => updateForm("legalName", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-2">Trading Name</label>
            <input
              type="text"
              value={form.tradingName}
              onChange={(e) => updateForm("tradingName", e.target.value)}
              className={inputClass}
              placeholder="Optional"
            />
          </div>
        </div>

        {/* One-Line Description */}
        <div>
          <label className="block text-sm font-medium text-[#6B7280] mb-2">One-Line Description</label>
          <input
            type="text"
            maxLength={200}
            value={form.oneLineDescription}
            onChange={(e) => updateForm("oneLineDescription", e.target.value)}
            className={inputClass}
          />
          <p className="text-xs text-[#6B7280] mt-1 text-right">
            {form.oneLineDescription.length}/200 characters
          </p>
        </div>

        {/* Detailed Description */}
        <div>
          <label className="block text-sm font-medium text-[#6B7280] mb-2">Detailed Description</label>
          <textarea
            rows={5}
            value={form.detailedDescription}
            onChange={(e) => updateForm("detailedDescription", e.target.value)}
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-medium text-[#6B7280] mb-2">Website</label>
          <input
            type="url"
            value={form.website}
            onChange={(e) => updateForm("website", e.target.value)}
            className={inputClass}
            placeholder="https://"
          />
        </div>

        {/* Sector + Subsector */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-2">Sector</label>
            <CustomSelect
              value={form.sector}
              onChange={(value) => {
                updateForm("sector", value);
                updateForm("subsector", "");
              }}
              options={sectorOptions}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-2">Subsector</label>
            <CustomSelect
              value={form.subsector}
              onChange={(value) => updateForm("subsector", value)}
              options={
                form.sector && subsectorMap[form.sector]
                  ? [{ value: "", label: "Select subsector" }, ...subsectorMap[form.sector]]
                  : [{ value: "", label: "Select a sector first" }]
              }
            />
          </div>
        </div>

        {/* Stage + Business Model */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-2">Stage</label>
            <CustomSelect
              value={form.stage}
              onChange={(value) => updateForm("stage", value)}
              options={stageOptions}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-2">Business Model</label>
            <CustomSelect
              value={form.businessModel}
              onChange={(value) => updateForm("businessModel", value)}
              options={businessModelOptions}
            />
          </div>
        </div>

        {/* Team Size */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-2">Team Size</label>
            <CustomSelect
              value={form.teamSize}
              onChange={(value) => updateForm("teamSize", value)}
              options={teamSizeOptions}
            />
          </div>
        </div>

        {/* Operating Countries */}
        <div>
          <label className="block text-sm font-medium text-[#6B7280] mb-2">
            Operating Countries
          </label>
          <input
            type="text"
            value={form.operatingCountries.join(", ")}
            onChange={(e) =>
              updateForm(
                "operatingCountries",
                e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              )
            }
            className={inputClass}
            placeholder="Nigeria, Kenya, South Africa"
          />
          <p className="text-xs text-[#6B7280] mt-1">Comma-separated list of countries</p>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-[#E5E7EB]">
          <button
            onClick={onSave}
            disabled={!hasChanges || saving}
            className="px-6 py-2.5 bg-[#0A1F44] hover:bg-[#1A3A6B] text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TEAM MEMBERS TAB
// ============================================================================

function TeamMembersTab({
  members,
  loading,
  onAdd,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  members: TeamMember[];
  loading: boolean;
  onAdd: () => void;
  onEdit: (m: TeamMember) => void;
  onDelete: (m: TeamMember) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-12 text-center shadow-sm">
        <div className="w-10 h-10 border-4 border-[#0A1F44] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#6B7280]">Loading team members...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#111827]">Team Members</h2>
        <button
          onClick={onAdd}
          className="px-4 py-2 bg-[#0A1F44] hover:bg-[#1A3A6B] text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Member
        </button>
      </div>

      {/* Members List */}
      {members.length === 0 ? (
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#F6F8FA] flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-[#6B7280]" />
          </div>
          <p className="text-[#111827] font-medium mb-2">No team members added yet</p>
          <p className="text-sm text-[#6B7280] max-w-md mx-auto mb-6">
            Add your co-founders, executives, and key team members to strengthen your company
            profile.
          </p>
          <button
            onClick={onAdd}
            className="px-5 py-2.5 bg-[#0A1F44] hover:bg-[#1A3A6B] text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Add First Member
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {members.map((member, index) => {
            const initials = member.fullName
              .split(" ")
              .map((n) => n.charAt(0))
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <div
                key={member.id}
                className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  {/* Photo / Initials */}
                  {member.photoUrl ? (
                    <img
                      src={member.photoUrl}
                      alt={member.fullName}
                      className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-[#0A1F44] flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-white">{initials}</span>
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-base font-bold text-[#111827]">{member.fullName}</p>
                      {member.equityPercent != null && (
                        <span className="px-2 py-0.5 bg-[#C8A24D]/20 text-[#C8A24D] rounded text-xs font-medium">
                          {member.equityPercent}% equity
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#6B7280] mb-2">{member.role}</p>
                    {member.bio && (
                      <p className="text-sm text-[#6B7280] leading-relaxed line-clamp-2">
                        {member.bio}
                      </p>
                    )}
                    {member.linkedinUrl && (
                      <a
                        href={member.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-[#0A1F44] hover:text-[#1A3A6B] mt-2 transition-colors"
                      >
                        <Linkedin className="w-4 h-4" />
                        LinkedIn
                      </a>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => onMoveUp(index)}
                      disabled={index === 0}
                      className="p-1.5 rounded hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move up"
                    >
                      <ChevronUp className="w-4 h-4 text-[#6B7280]" />
                    </button>
                    <button
                      onClick={() => onMoveDown(index)}
                      disabled={index === members.length - 1}
                      className="p-1.5 rounded hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move down"
                    >
                      <ChevronDown className="w-4 h-4 text-[#6B7280]" />
                    </button>
                    <button
                      onClick={() => onEdit(member)}
                      className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4 text-[#6B7280]" />
                    </button>
                    <button
                      onClick={() => onDelete(member)}
                      className="p-1.5 rounded hover:bg-red-50 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TEAM MEMBER MODAL
// ============================================================================

function TeamMemberModal({
  editing,
  form,
  setForm,
  saving,
  onSave,
  onClose,
}: {
  editing: boolean;
  form: TeamMemberForm;
  setForm: (fn: (prev: TeamMemberForm) => TeamMemberForm) => void;
  saving: boolean;
  onSave: () => void;
  onClose: () => void;
}) {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const inputClass =
    "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent outline-none text-[#111827]";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#111827]">
            {editing ? "Edit Team Member" : "Add Team Member"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-[#6B7280]" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Photo */}
          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-2">Photo</label>
            <div className="flex items-center gap-4">
              {form.photoPreview ? (
                <img
                  src={form.photoPreview}
                  alt="Preview"
                  className="w-14 h-14 rounded-full object-cover border border-[#E5E7EB]"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-[#F6F8FA] border border-[#E5E7EB] flex items-center justify-center">
                  <Upload className="w-5 h-5 text-[#6B7280]" />
                </div>
              )}
              <button
                onClick={() => photoInputRef.current?.click()}
                className="px-3 py-1.5 text-sm font-medium border border-gray-300 text-[#0A1F44] hover:bg-gray-50 rounded-lg transition-colors"
              >
                {form.photoPreview ? "Change Photo" : "Upload Photo"}
              </button>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 2 * 1024 * 1024) {
                      alert("Photo must be under 2MB");
                      return;
                    }
                    setForm((prev) => ({
                      ...prev,
                      photoFile: file,
                      photoPreview: URL.createObjectURL(file),
                    }));
                  }
                }}
              />
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
              className={inputClass}
              placeholder="John Doe"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-2">
              Title / Role <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.role}
              onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
              className={inputClass}
              placeholder="CTO, Head of Engineering, etc."
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-2">Bio</label>
            <textarea
              rows={3}
              value={form.bio}
              onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
              className={`${inputClass} resize-none`}
              placeholder="Brief background and expertise..."
            />
          </div>

          {/* LinkedIn */}
          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-2">LinkedIn URL</label>
            <input
              type="url"
              value={form.linkedinUrl}
              onChange={(e) => setForm((prev) => ({ ...prev, linkedinUrl: e.target.value }))}
              className={inputClass}
              placeholder="https://linkedin.com/in/..."
            />
          </div>

          {/* Email + Equity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-2">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                className={inputClass}
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-2">
                Equity Ownership %
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={form.equityPercent}
                onChange={(e) => setForm((prev) => ({ ...prev, equityPercent: e.target.value }))}
                className={inputClass}
                placeholder="Optional"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#E5E7EB] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium border border-gray-300 text-[#0A1F44] hover:bg-gray-50 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving || !form.fullName.trim() || !form.role.trim()}
            className="px-5 py-2.5 bg-[#0A1F44] hover:bg-[#1A3A6B] text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
