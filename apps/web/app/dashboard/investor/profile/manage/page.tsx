"use client";

import { useAuth } from "@/lib/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import InvestorHeader from "@/components/InvestorHeader";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Tab = "personal" | "investor" | "preferences" | "account";

const TABS: { id: Tab; label: string }[] = [
  { id: "personal", label: "Personal Info" },
  { id: "investor", label: "Investor Profile" },
  { id: "preferences", label: "Preferences" },
  { id: "account", label: "Account Settings" },
];

// ============================================================================
// OPTIONS DATA (mirrors onboarding)
// ============================================================================

const countryOptions = [
  { value: "Nigeria", label: "Nigeria" },
  { value: "United States", label: "United States" },
  { value: "United Kingdom", label: "United Kingdom" },
  { value: "Algeria", label: "Algeria" },
  { value: "Angola", label: "Angola" },
  { value: "Benin", label: "Benin" },
  { value: "Botswana", label: "Botswana" },
  { value: "Burkina Faso", label: "Burkina Faso" },
  { value: "Burundi", label: "Burundi" },
  { value: "Cabo Verde", label: "Cabo Verde" },
  { value: "Cameroon", label: "Cameroon" },
  { value: "Central African Republic", label: "Central African Republic" },
  { value: "Chad", label: "Chad" },
  { value: "Comoros", label: "Comoros" },
  { value: "Congo", label: "Congo" },
  { value: "DR Congo", label: "DR Congo" },
  { value: "Djibouti", label: "Djibouti" },
  { value: "Egypt", label: "Egypt" },
  { value: "Equatorial Guinea", label: "Equatorial Guinea" },
  { value: "Eritrea", label: "Eritrea" },
  { value: "Eswatini", label: "Eswatini" },
  { value: "Ethiopia", label: "Ethiopia" },
  { value: "Gabon", label: "Gabon" },
  { value: "Gambia", label: "Gambia" },
  { value: "Ghana", label: "Ghana" },
  { value: "Guinea", label: "Guinea" },
  { value: "Guinea-Bissau", label: "Guinea-Bissau" },
  { value: "Ivory Coast", label: "Ivory Coast" },
  { value: "Kenya", label: "Kenya" },
  { value: "Lesotho", label: "Lesotho" },
  { value: "Liberia", label: "Liberia" },
  { value: "Libya", label: "Libya" },
  { value: "Madagascar", label: "Madagascar" },
  { value: "Malawi", label: "Malawi" },
  { value: "Mali", label: "Mali" },
  { value: "Mauritania", label: "Mauritania" },
  { value: "Mauritius", label: "Mauritius" },
  { value: "Morocco", label: "Morocco" },
  { value: "Mozambique", label: "Mozambique" },
  { value: "Namibia", label: "Namibia" },
  { value: "Niger", label: "Niger" },
  { value: "Rwanda", label: "Rwanda" },
  { value: "São Tomé and Príncipe", label: "São Tomé and Príncipe" },
  { value: "Senegal", label: "Senegal" },
  { value: "Seychelles", label: "Seychelles" },
  { value: "Sierra Leone", label: "Sierra Leone" },
  { value: "Somalia", label: "Somalia" },
  { value: "South Africa", label: "South Africa" },
  { value: "South Sudan", label: "South Sudan" },
  { value: "Sudan", label: "Sudan" },
  { value: "Tanzania", label: "Tanzania" },
  { value: "Togo", label: "Togo" },
  { value: "Tunisia", label: "Tunisia" },
  { value: "Uganda", label: "Uganda" },
  { value: "Zambia", label: "Zambia" },
  { value: "Zimbabwe", label: "Zimbabwe" },
  { value: "Austria", label: "Austria" },
  { value: "Belgium", label: "Belgium" },
  { value: "Bulgaria", label: "Bulgaria" },
  { value: "Croatia", label: "Croatia" },
  { value: "Cyprus", label: "Cyprus" },
  { value: "Czech Republic", label: "Czech Republic" },
  { value: "Denmark", label: "Denmark" },
  { value: "Estonia", label: "Estonia" },
  { value: "Finland", label: "Finland" },
  { value: "France", label: "France" },
  { value: "Germany", label: "Germany" },
  { value: "Greece", label: "Greece" },
  { value: "Hungary", label: "Hungary" },
  { value: "Iceland", label: "Iceland" },
  { value: "Ireland", label: "Ireland" },
  { value: "Italy", label: "Italy" },
  { value: "Latvia", label: "Latvia" },
  { value: "Liechtenstein", label: "Liechtenstein" },
  { value: "Lithuania", label: "Lithuania" },
  { value: "Luxembourg", label: "Luxembourg" },
  { value: "Malta", label: "Malta" },
  { value: "Netherlands", label: "Netherlands" },
  { value: "Norway", label: "Norway" },
  { value: "Poland", label: "Poland" },
  { value: "Portugal", label: "Portugal" },
  { value: "Romania", label: "Romania" },
  { value: "Slovakia", label: "Slovakia" },
  { value: "Slovenia", label: "Slovenia" },
  { value: "Spain", label: "Spain" },
  { value: "Sweden", label: "Sweden" },
  { value: "Switzerland", label: "Switzerland" },
  { value: "Albania", label: "Albania" },
  { value: "Andorra", label: "Andorra" },
  { value: "Armenia", label: "Armenia" },
  { value: "Azerbaijan", label: "Azerbaijan" },
  { value: "Belarus", label: "Belarus" },
  { value: "Bosnia and Herzegovina", label: "Bosnia and Herzegovina" },
  { value: "Georgia", label: "Georgia" },
  { value: "Kosovo", label: "Kosovo" },
  { value: "Moldova", label: "Moldova" },
  { value: "Monaco", label: "Monaco" },
  { value: "Montenegro", label: "Montenegro" },
  { value: "North Macedonia", label: "North Macedonia" },
  { value: "Russia", label: "Russia" },
  { value: "San Marino", label: "San Marino" },
  { value: "Serbia", label: "Serbia" },
  { value: "Turkey", label: "Turkey" },
  { value: "Ukraine", label: "Ukraine" },
  { value: "Vatican City", label: "Vatican City" },
  { value: "Antigua and Barbuda", label: "Antigua and Barbuda" },
  { value: "Argentina", label: "Argentina" },
  { value: "Bahamas", label: "Bahamas" },
  { value: "Barbados", label: "Barbados" },
  { value: "Belize", label: "Belize" },
  { value: "Bolivia", label: "Bolivia" },
  { value: "Brazil", label: "Brazil" },
  { value: "Canada", label: "Canada" },
  { value: "Chile", label: "Chile" },
  { value: "Colombia", label: "Colombia" },
  { value: "Costa Rica", label: "Costa Rica" },
  { value: "Cuba", label: "Cuba" },
  { value: "Dominica", label: "Dominica" },
  { value: "Dominican Republic", label: "Dominican Republic" },
  { value: "Ecuador", label: "Ecuador" },
  { value: "El Salvador", label: "El Salvador" },
  { value: "Grenada", label: "Grenada" },
  { value: "Guatemala", label: "Guatemala" },
  { value: "Guyana", label: "Guyana" },
  { value: "Haiti", label: "Haiti" },
  { value: "Honduras", label: "Honduras" },
  { value: "Jamaica", label: "Jamaica" },
  { value: "Mexico", label: "Mexico" },
  { value: "Nicaragua", label: "Nicaragua" },
  { value: "Panama", label: "Panama" },
  { value: "Paraguay", label: "Paraguay" },
  { value: "Peru", label: "Peru" },
  { value: "Saint Kitts and Nevis", label: "Saint Kitts and Nevis" },
  { value: "Saint Lucia", label: "Saint Lucia" },
  { value: "Saint Vincent and the Grenadines", label: "Saint Vincent and the Grenadines" },
  { value: "Suriname", label: "Suriname" },
  { value: "Trinidad and Tobago", label: "Trinidad and Tobago" },
  { value: "Uruguay", label: "Uruguay" },
  { value: "Venezuela", label: "Venezuela" },
  { value: "Bahrain", label: "Bahrain" },
  { value: "Iran", label: "Iran" },
  { value: "Iraq", label: "Iraq" },
  { value: "Israel", label: "Israel" },
  { value: "Jordan", label: "Jordan" },
  { value: "Kuwait", label: "Kuwait" },
  { value: "Lebanon", label: "Lebanon" },
  { value: "Oman", label: "Oman" },
  { value: "Palestine", label: "Palestine" },
  { value: "Qatar", label: "Qatar" },
  { value: "Saudi Arabia", label: "Saudi Arabia" },
  { value: "Syria", label: "Syria" },
  { value: "UAE", label: "United Arab Emirates" },
  { value: "Yemen", label: "Yemen" },
  { value: "Afghanistan", label: "Afghanistan" },
  { value: "Bangladesh", label: "Bangladesh" },
  { value: "Bhutan", label: "Bhutan" },
  { value: "Brunei", label: "Brunei" },
  { value: "Cambodia", label: "Cambodia" },
  { value: "China", label: "China" },
  { value: "Hong Kong", label: "Hong Kong" },
  { value: "India", label: "India" },
  { value: "Indonesia", label: "Indonesia" },
  { value: "Japan", label: "Japan" },
  { value: "Kazakhstan", label: "Kazakhstan" },
  { value: "Kyrgyzstan", label: "Kyrgyzstan" },
  { value: "Laos", label: "Laos" },
  { value: "Macau", label: "Macau" },
  { value: "Malaysia", label: "Malaysia" },
  { value: "Maldives", label: "Maldives" },
  { value: "Mongolia", label: "Mongolia" },
  { value: "Myanmar", label: "Myanmar" },
  { value: "Nepal", label: "Nepal" },
  { value: "North Korea", label: "North Korea" },
  { value: "Pakistan", label: "Pakistan" },
  { value: "Philippines", label: "Philippines" },
  { value: "Singapore", label: "Singapore" },
  { value: "South Korea", label: "South Korea" },
  { value: "Sri Lanka", label: "Sri Lanka" },
  { value: "Taiwan", label: "Taiwan" },
  { value: "Tajikistan", label: "Tajikistan" },
  { value: "Thailand", label: "Thailand" },
  { value: "Timor-Leste", label: "Timor-Leste" },
  { value: "Turkmenistan", label: "Turkmenistan" },
  { value: "Uzbekistan", label: "Uzbekistan" },
  { value: "Vietnam", label: "Vietnam" },
  { value: "Australia", label: "Australia" },
  { value: "Fiji", label: "Fiji" },
  { value: "Kiribati", label: "Kiribati" },
  { value: "Marshall Islands", label: "Marshall Islands" },
  { value: "Micronesia", label: "Micronesia" },
  { value: "Nauru", label: "Nauru" },
  { value: "New Zealand", label: "New Zealand" },
  { value: "Palau", label: "Palau" },
  { value: "Papua New Guinea", label: "Papua New Guinea" },
  { value: "Samoa", label: "Samoa" },
  { value: "Solomon Islands", label: "Solomon Islands" },
  { value: "Tonga", label: "Tonga" },
  { value: "Tuvalu", label: "Tuvalu" },
  { value: "Vanuatu", label: "Vanuatu" },
];

const investorTypeOptions = [
  { value: "INDIVIDUAL", label: "Individual Investor" },
  { value: "ANGEL", label: "Angel Investor" },
  { value: "FAMILY_OFFICE", label: "Family Office" },
  { value: "VC_FUND", label: "VC Fund" },
  { value: "CORPORATE", label: "Corporate" },
  { value: "INSTITUTIONAL", label: "Institutional Investor" },
];

const aumOptions = [
  { value: "under_100k", label: "Under $100,000" },
  { value: "100k_500k", label: "$100,000 – $500,000" },
  { value: "500k_1m", label: "$500,000 – $1,000,000" },
  { value: "1m_5m", label: "$1,000,000 – $5,000,000" },
  { value: "5m_25m", label: "$5,000,000 – $25,000,000" },
  { value: "25m_100m", label: "$25,000,000 – $100,000,000" },
  { value: "100m_plus", label: "$100,000,000+" },
];

const yearsOptions = [
  { value: "0", label: "No prior experience" },
  { value: "1-2", label: "1–2 years" },
  { value: "3-5", label: "3–5 years" },
  { value: "6-10", label: "6–10 years" },
  { value: "10+", label: "10+ years" },
];

const sectorOptions = [
  { value: "FINTECH", label: "FinTech" },
  { value: "LOGISTICS", label: "Logistics & Mobility" },
  { value: "ENERGY", label: "Energy & Climate" },
  { value: "CONSUMER_FMCG", label: "Consumer" },
  { value: "HEALTH", label: "Healthcare" },
  { value: "AGRI_FOOD", label: "Agriculture" },
  { value: "REAL_ESTATE", label: "Real Estate" },
  { value: "INFRASTRUCTURE", label: "Infrastructure" },
  { value: "SAAS_TECH", label: "SaaS" },
  { value: "TECHNOLOGY", label: "Technology" },
  { value: "AI", label: "AI" },
  { value: "EDUCATION", label: "Education" },
  { value: "FINANCIAL_SERVICES", label: "Financial Services" },
  { value: "MANUFACTURING", label: "Manufacturing" },
];

const laneOptions = [
  { value: "YIELD", label: "Yield Lane" },
  { value: "VENTURES", label: "Ventures Lane" },
];

const holdingPeriodOptions = [
  { value: "less_1yr", label: "Less than 1 year" },
  { value: "1_2yr", label: "1–2 years" },
  { value: "2_3yr", label: "2–3 years" },
  { value: "3_5yr", label: "3–5 years" },
  { value: "5plus", label: "5+ years" },
];

const ID_TYPE_LABELS: Record<string, string> = {
  NATIONAL_ID: "National ID",
  PASSPORT: "Passport",
  DRIVERS_LICENSE: "Driver's License",
  VOTERS_CARD: "Voter's Card",
  STATE_ID: "State ID",
  BRP: "Biometric Residence Permit",
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ManageProfilePage() {
  const { user, loading, accessToken, signOut } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>("personal");
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Personal info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [residentialAddress, setResidentialAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateProvince, setStateProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [countryOfResidence, setCountryOfResidence] = useState("");
  const [citizenship, setCitizenship] = useState("");
  const [taxResidency, setTaxResidency] = useState("");

  // Snapshot for dirty-checking personal info
  const [personalSnapshot, setPersonalSnapshot] = useState("");

  // Masked IDs
  const [maskedIds, setMaskedIds] = useState<Record<string, string | null>>({});

  // Investor profile
  const [investorType, setInvestorType] = useState("");
  const [firmName, setFirmName] = useState("");
  const [title, setTitle] = useState("");
  const [aum, setAum] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [investorSnapshot, setInvestorSnapshot] = useState("");

  // Preferences
  const [preferredSectors, setPreferredSectors] = useState<string[]>([]);
  const [preferredLanes, setPreferredLanes] = useState<string[]>([]);
  const [minimumCheckSize, setMinimumCheckSize] = useState("");
  const [maximumCheckSize, setMaximumCheckSize] = useState("");
  const [holdingPeriod, setHoldingPeriod] = useState("");
  const [prefsSnapshot, setPrefsSnapshot] = useState("");

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Notifications
  const [notifNewDeals, setNotifNewDeals] = useState(true);
  const [notifPortfolio, setNotifPortfolio] = useState(true);
  const [notifPlatform, setNotifPlatform] = useState(true);

  // Delete account
  const [confirmEmail, setConfirmEmail] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Verification status
  const [verificationStatus, setVerificationStatus] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!accessToken) return;
    fetchProfileData();
  }, [accessToken]);

  function buildPersonalKey() {
    return JSON.stringify({ firstName, lastName, phone, dateOfBirth, residentialAddress, city, stateProvince, postalCode, countryOfResidence, citizenship, taxResidency });
  }
  function buildInvestorKey() {
    return JSON.stringify({ investorType, firmName, title, aum, yearsExperience });
  }
  function buildPrefsKey() {
    return JSON.stringify({ preferredSectors, preferredLanes, minimumCheckSize, maximumCheckSize, holdingPeriod });
  }

  const personalDirty = personalSnapshot !== "" && buildPersonalKey() !== personalSnapshot;
  const investorDirty = investorSnapshot !== "" && buildInvestorKey() !== investorSnapshot;
  const prefsDirty = prefsSnapshot !== "" && buildPrefsKey() !== prefsSnapshot;

  async function fetchProfileData() {
    try {
      const res = await fetch(`${API_URL}/api/investors/profile/manage`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const result = await res.json();
      if (result.success && result.data) {
        const { user: u, profile: p, maskedIds: ids } = result.data;

        setFirstName(u.firstName || "");
        setLastName(u.lastName || "");
        setEmail(u.email || "");
        setPhone(u.phone || p?.phone || "");

        if (p) {
          setDateOfBirth(p.dateOfBirth ? new Date(p.dateOfBirth).toISOString().split("T")[0] : "");
          setResidentialAddress(p.residentialAddress || "");
          setCity(p.city || "");
          setStateProvince(p.stateProvince || "");
          setPostalCode(p.postalCode || "");
          setCountryOfResidence(p.countryOfResidence || "");
          setCitizenship(p.citizenship || "");
          setTaxResidency(p.taxResidency || "");

          setInvestorType(p.investorType || "");
          setFirmName(p.firmName || "");
          setTitle(p.investorTitle || "");
          setAum(p.aum || "");
          setYearsExperience(p.yearsInvesting || "");

          setPreferredSectors(p.investmentFocus || []);
          setPreferredLanes(p.preferredLanes || []);
          setMinimumCheckSize(p.minimumCheckSize != null ? String(p.minimumCheckSize) : "");
          setMaximumCheckSize(p.maximumCheckSize != null ? String(p.maximumCheckSize) : "");
          setHoldingPeriod(p.holdingPeriod || "");

          setVerificationStatus(p.verificationStatus || "");

          // Notification prefs
          const np = p.notificationPreferences as Record<string, boolean> | null;
          if (np) {
            setNotifNewDeals(np.newDeals !== false);
            setNotifPortfolio(np.portfolio !== false);
            setNotifPlatform(np.platform !== false);
          }
        }

        if (ids) setMaskedIds(ids);

        // Set snapshots after state is populated (next tick)
        setTimeout(() => {
          const pKey = JSON.stringify({
            firstName: u.firstName || "", lastName: u.lastName || "",
            phone: u.phone || p?.phone || "",
            dateOfBirth: p?.dateOfBirth ? new Date(p.dateOfBirth).toISOString().split("T")[0] : "",
            residentialAddress: p?.residentialAddress || "", city: p?.city || "",
            stateProvince: p?.stateProvince || "", postalCode: p?.postalCode || "",
            countryOfResidence: p?.countryOfResidence || "", citizenship: p?.citizenship || "",
            taxResidency: p?.taxResidency || "",
          });
          setPersonalSnapshot(pKey);

          const iKey = JSON.stringify({
            investorType: p?.investorType || "", firmName: p?.firmName || "",
            title: p?.investorTitle || "", aum: p?.aum || "",
            yearsExperience: p?.yearsInvesting || "",
          });
          setInvestorSnapshot(iKey);

          const prKey = JSON.stringify({
            preferredSectors: p?.investmentFocus || [], preferredLanes: p?.preferredLanes || [],
            minimumCheckSize: p?.minimumCheckSize != null ? String(p.minimumCheckSize) : "",
            maximumCheckSize: p?.maximumCheckSize != null ? String(p.maximumCheckSize) : "",
            holdingPeriod: p?.holdingPeriod || "",
          });
          setPrefsSnapshot(prKey);
        }, 0);
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setFetching(false);
    }
  }

  function clearMessages() {
    setSuccessMsg("");
    setErrorMsg("");
  }

  async function handleSavePersonal() {
    clearMessages();
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/investors/profile/personal`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          firstName, lastName, phone,
          dateOfBirth: dateOfBirth || null,
          residentialAddress, city, stateProvince, postalCode,
          countryOfResidence, citizenship, taxResidency,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setSuccessMsg("Personal information saved.");
        setPersonalSnapshot(buildPersonalKey());
      } else {
        setErrorMsg(result.error?.message || "Failed to save.");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveInvestor() {
    clearMessages();
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/investors/profile/investor`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ investorType, firmName, title, aum, yearsExperience }),
      });
      const result = await res.json();
      if (result.success) {
        setSuccessMsg("Investor profile saved.");
        setInvestorSnapshot(buildInvestorKey());
      } else {
        setErrorMsg(result.error?.message || "Failed to save.");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSavePreferences() {
    clearMessages();
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/investors/profile/preferences`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ preferredSectors, preferredLanes, minimumCheckSize: minimumCheckSize || null, maximumCheckSize: maximumCheckSize || null, holdingPeriod }),
      });
      const result = await res.json();
      if (result.success) {
        setSuccessMsg("Investment preferences saved.");
        setPrefsSnapshot(buildPrefsKey());
      } else {
        setErrorMsg(result.error?.message || "Failed to save.");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const saveNotificationPrefs = useCallback(
    async (prefs: { newDeals: boolean; portfolio: boolean; platform: boolean }) => {
      try {
        await fetch(`${API_URL}/api/investors/profile/notifications`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify({ notificationPreferences: prefs }),
        });
      } catch {
        // silent — notification prefs are non-critical
      }
    },
    [accessToken],
  );

  function handleToggleNotif(key: "newDeals" | "portfolio" | "platform") {
    const updated = { newDeals: notifNewDeals, portfolio: notifPortfolio, platform: notifPlatform };
    updated[key] = !updated[key];
    if (key === "newDeals") setNotifNewDeals(updated.newDeals);
    if (key === "portfolio") setNotifPortfolio(updated.portfolio);
    if (key === "platform") setNotifPlatform(updated.platform);
    saveNotificationPrefs(updated);
  }

  async function handleChangePassword() {
    clearMessages();
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/investors/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const result = await res.json();
      if (result.success) {
        setSuccessMsg("Password changed successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setErrorMsg(result.error?.message || "Failed to change password.");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    clearMessages();
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/investors/account`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ confirmEmail }),
      });
      const result = await res.json();
      if (result.success) {
        signOut();
      } else {
        setErrorMsg(result.error?.message || "Failed to deactivate account.");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function toggleArrayItem(arr: string[], setter: (v: string[]) => void, item: string) {
    setter(arr.includes(item) ? arr.filter((v) => v !== item) : [...arr, item]);
  }

  // Password strength
  function getPasswordStrength(pw: string): { label: string; color: string; width: string } {
    if (!pw) return { label: "", color: "", width: "0%" };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 2) return { label: "Weak", color: "#EF4444", width: "33%" };
    if (score <= 3) return { label: "Fair", color: "#F59E0B", width: "66%" };
    return { label: "Strong", color: "#10B981", width: "100%" };
  }

  if (loading || fetching) {
    return (
      <div style={{ background: "#F6F8FA" }} className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#6B7280]">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{ background: "#F6F8FA" }} className="min-h-screen">
      <InvestorHeader />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back link + title */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/dashboard/investor")}
            className="text-sm text-[#0A1F44] hover:text-[#0A1F44]/70 mb-3 flex items-center gap-1.5 font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#0A1F44]">Manage Profile</h1>
            {verificationStatus && (
              <span
                className={`text-xs font-medium px-3 py-1 rounded-full ${
                  verificationStatus === "VERIFIED"
                    ? "bg-green-100 text-green-700"
                    : verificationStatus === "REJECTED"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {verificationStatus === "VERIFIED" ? "Verified" : verificationStatus === "REJECTED" ? "Rejected" : "Pending Review"}
              </span>
            )}
          </div>
        </div>

        {/* Success / Error banners */}
        {successMsg && (
          <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              {successMsg}
            </div>
            <button onClick={() => setSuccessMsg("")} className="text-green-500 hover:text-green-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {errorMsg}
            </div>
            <button onClick={() => setErrorMsg("")} className="text-red-500 hover:text-red-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-[#E5E7EB] mb-8">
          <nav className="flex gap-8">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); clearMessages(); }}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-[#0A1F44] text-[#0A1F44]"
                    : "border-transparent text-[#6B7280] hover:text-[#111827]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "personal" && (
          <div className="space-y-6">
            {/* Personal Info Form */}
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#0A1F44] mb-1">Personal Information</h2>
              <p className="text-sm text-[#6B7280] mb-6">Update your personal details. Email cannot be changed.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="First Name *" value={firstName} onChange={setFirstName} />
                <InputField label="Last Name *" value={lastName} onChange={setLastName} />
                <InputField label="Email" value={email} disabled />
                <InputField label="Phone" value={phone} onChange={setPhone} />
                <InputField label="Date of Birth" value={dateOfBirth} onChange={setDateOfBirth} type="date" />
                <CountrySelect label="Citizenship" value={citizenship} onChange={setCitizenship} />
                <CountrySelect label="Country of Residence" value={countryOfResidence} onChange={setCountryOfResidence} />
                <CountrySelect label="Tax Residency" value={taxResidency} onChange={setTaxResidency} />
              </div>

              <div className="mt-4">
                <InputField label="Residential Address" value={residentialAddress} onChange={setResidentialAddress} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <InputField label="City" value={city} onChange={setCity} />
                <InputField label="State / Province" value={stateProvince} onChange={setStateProvince} />
                <InputField label="Postal Code" value={postalCode} onChange={setPostalCode} />
              </div>

              <div className="mt-6 flex justify-end">
                <SaveButton saving={saving} onClick={handleSavePersonal} disabled={!personalDirty} />
              </div>
            </div>

            {/* Government ID (view-only) */}
            {(maskedIds.idNumber || maskedIds.nin || maskedIds.ssn || maskedIds.niNumber || maskedIds.passportNumber) && (
              <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-[#0A1F44] mb-1">Government ID</h2>
                <p className="text-sm text-[#6B7280] mb-4">Your verified identity documents. To update, please contact support.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {maskedIds.idType && maskedIds.idNumber && (
                    <div className="flex items-center gap-3 p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                      <svg className="w-5 h-5 text-[#6B7280] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <div>
                        <p className="text-xs text-[#6B7280]">{ID_TYPE_LABELS[maskedIds.idType] || maskedIds.idType}</p>
                        <p className="text-sm font-mono text-[#111827]">{maskedIds.idNumber}</p>
                      </div>
                    </div>
                  )}
                  {maskedIds.nin && (
                    <div className="flex items-center gap-3 p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                      <svg className="w-5 h-5 text-[#6B7280] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <div>
                        <p className="text-xs text-[#6B7280]">NIN</p>
                        <p className="text-sm font-mono text-[#111827]">{maskedIds.nin}</p>
                      </div>
                    </div>
                  )}
                  {maskedIds.ssn && (
                    <div className="flex items-center gap-3 p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                      <svg className="w-5 h-5 text-[#6B7280] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <div>
                        <p className="text-xs text-[#6B7280]">SSN</p>
                        <p className="text-sm font-mono text-[#111827]">***-**-{maskedIds.ssn?.slice(-4)}</p>
                      </div>
                    </div>
                  )}
                  {maskedIds.niNumber && (
                    <div className="flex items-center gap-3 p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                      <svg className="w-5 h-5 text-[#6B7280] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <div>
                        <p className="text-xs text-[#6B7280]">NI Number</p>
                        <p className="text-sm font-mono text-[#111827]">{maskedIds.niNumber}</p>
                      </div>
                    </div>
                  )}
                  {maskedIds.passportNumber && (
                    <div className="flex items-center gap-3 p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                      <svg className="w-5 h-5 text-[#6B7280] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <div>
                        <p className="text-xs text-[#6B7280]">Passport</p>
                        <p className="text-sm font-mono text-[#111827]">{maskedIds.passportNumber}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "investor" && (
          <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#0A1F44] mb-1">Investor Profile</h2>
            <p className="text-sm text-[#6B7280] mb-6">Describe your investor profile and experience.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField label="Investor Type *" value={investorType} onChange={setInvestorType} options={investorTypeOptions} />
              {!["", "INDIVIDUAL"].includes(investorType) && (
                <InputField label="Firm / Organization Name" value={firmName} onChange={setFirmName} />
              )}
              <InputField label="Title / Role" value={title} onChange={setTitle} />
              <SelectField label="AUM Range" value={aum} onChange={setAum} options={aumOptions} />
              <SelectField label="Years of Investing Experience" value={yearsExperience} onChange={setYearsExperience} options={yearsOptions} />
            </div>

            <div className="mt-6 flex justify-end">
              <SaveButton saving={saving} onClick={handleSaveInvestor} disabled={!investorDirty} />
            </div>
          </div>
        )}

        {activeTab === "preferences" && (
          <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#0A1F44] mb-1">Investment Preferences</h2>
            <p className="text-sm text-[#6B7280] mb-6">Define your investment criteria to see better-matched opportunities.</p>

            {/* Sectors */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#6B7280] mb-3">Preferred Sectors</label>
              <div className="flex flex-wrap gap-2">
                {sectorOptions.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => toggleArrayItem(preferredSectors, setPreferredSectors, s.value)}
                    className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                      preferredSectors.includes(s.value)
                        ? "bg-[#0A1F44] text-white border-[#0A1F44]"
                        : "bg-[#F9FAFB] text-[#111827] border-[#E5E7EB] hover:border-[#9CA3AF]"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Lanes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#6B7280] mb-3">Preferred Investment Lanes</label>
              <div className="flex gap-3">
                {laneOptions.map((l) => (
                  <button
                    key={l.value}
                    onClick={() => toggleArrayItem(preferredLanes, setPreferredLanes, l.value)}
                    className={`px-5 py-2.5 text-sm rounded-lg border transition-colors ${
                      preferredLanes.includes(l.value)
                        ? "bg-[#0A1F44] text-white border-[#0A1F44]"
                        : "bg-[#F9FAFB] text-[#111827] border-[#E5E7EB] hover:border-[#9CA3AF]"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Check sizes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-[#6B7280] mb-1">Minimum Check Size</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280] font-mono text-sm">$</span>
                  <input
                    type="number"
                    value={minimumCheckSize}
                    onChange={(e) => setMinimumCheckSize(e.target.value)}
                    placeholder="5,000"
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm text-[#111827] font-mono focus:border-[#0A1F44] focus:ring-1 focus:ring-[#0A1F44] outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#6B7280] mb-1">Maximum Check Size</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280] font-mono text-sm">$</span>
                  <input
                    type="number"
                    value={maximumCheckSize}
                    onChange={(e) => setMaximumCheckSize(e.target.value)}
                    placeholder="100,000"
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm text-[#111827] font-mono focus:border-[#0A1F44] focus:ring-1 focus:ring-[#0A1F44] outline-none"
                  />
                </div>
              </div>
            </div>

            <SelectField label="Desired Holding Period" value={holdingPeriod} onChange={setHoldingPeriod} options={holdingPeriodOptions} />

            <div className="mt-6 flex justify-end">
              <SaveButton saving={saving} onClick={handleSavePreferences} disabled={!prefsDirty} />
            </div>
          </div>
        )}

        {activeTab === "account" && (
          <div className="space-y-6">
            {/* Card 1: Email */}
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#0A1F44] mb-1">Email Address</h2>
              <p className="text-sm text-[#6B7280] mb-4">Your account email address.</p>
              <div className="flex items-center gap-3 p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                <svg className="w-5 h-5 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-[#111827] font-medium">{email}</span>
              </div>
              <p className="text-xs text-[#6B7280] mt-2">To change your email, please contact support.</p>
            </div>

            {/* Card 2: Change Password */}
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#0A1F44] mb-1">Change Password</h2>
              <p className="text-sm text-[#6B7280] mb-6">Password must be at least 8 characters with uppercase, lowercase, and a number.</p>

              <div className="space-y-4 max-w-md">
                <InputField label="Current Password" value={currentPassword} onChange={setCurrentPassword} type="password" />
                <div>
                  <InputField label="New Password" value={newPassword} onChange={setNewPassword} type="password" />
                  {newPassword && (
                    <div className="mt-2">
                      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{ width: getPasswordStrength(newPassword).width, backgroundColor: getPasswordStrength(newPassword).color }}
                        />
                      </div>
                      <p className="text-xs mt-1" style={{ color: getPasswordStrength(newPassword).color }}>
                        {getPasswordStrength(newPassword).label}
                      </p>
                    </div>
                  )}
                </div>
                <InputField label="Confirm New Password" value={confirmPassword} onChange={setConfirmPassword} type="password" />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-500">Passwords do not match</p>
                )}
              </div>

              <div className="mt-6">
                <button
                  onClick={handleChangePassword}
                  disabled={saving || !currentPassword || !newPassword || newPassword !== confirmPassword}
                  className="px-6 py-2.5 bg-[#0A1F44] hover:bg-[#1A3A6B] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>

            {/* Card 3: Notification Preferences */}
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#0A1F44] mb-1">Notification Preferences</h2>
              <p className="text-sm text-[#6B7280] mb-6">Choose which notifications you receive. Changes save automatically.</p>

              <div className="space-y-4">
                <ToggleRow
                  label="New deals matching my preferences"
                  enabled={notifNewDeals}
                  onToggle={() => handleToggleNotif("newDeals")}
                />
                <ToggleRow
                  label="Portfolio updates and monitoring alerts"
                  enabled={notifPortfolio}
                  onToggle={() => handleToggleNotif("portfolio")}
                />
                <ToggleRow
                  label="Platform news and announcements"
                  enabled={notifPlatform}
                  onToggle={() => handleToggleNotif("platform")}
                />
              </div>
            </div>

            {/* Card 4: Danger Zone */}
            <div className="bg-red-50 rounded-lg border border-red-200 p-6">
              <h2 className="text-lg font-semibold text-red-600 mb-1">Danger Zone</h2>
              <p className="text-sm text-[#6B7280] mb-4">
                This will deactivate your account and remove your access to the platform.
                Your investment records will be preserved.
              </p>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Deactivate Account
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-[#0A1F44] mb-2">Deactivate Account</h3>
            <p className="text-sm text-[#6B7280] mb-4">
              Type your email (<strong className="text-[#111827]">{email}</strong>) to confirm deactivation. This action can be reversed by contacting support.
            </p>
            <input
              type="email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              placeholder="Enter your email to confirm"
              className="w-full px-4 py-2.5 border border-red-300 rounded-lg text-sm text-[#111827] focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setShowDeleteModal(false); setConfirmEmail(""); clearMessages(); }}
                className="px-5 py-2.5 text-sm font-medium text-[#6B7280] border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={saving || confirmEmail.toLowerCase() !== email.toLowerCase()}
                className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Deactivating..." : "Confirm Deactivation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Shared Form Components
// ============================================================================

function InputField({
  label, value, onChange, type = "text", disabled = false, placeholder = "",
}: {
  label: string; value: string; onChange?: (v: string) => void;
  type?: string; disabled?: boolean; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#6B7280] mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-[#111827] focus:border-[#0A1F44] focus:ring-1 focus:ring-[#0A1F44] outline-none transition-colors ${
          disabled ? "bg-[#F9FAFB] text-[#6B7280] cursor-not-allowed" : "bg-white"
        }`}
      />
    </div>
  );
}

function SelectField({
  label, value, onChange, options, placeholder = "Select...",
}: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#6B7280] mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-[#111827] focus:border-[#0A1F44] focus:ring-1 focus:ring-[#0A1F44] outline-none bg-white"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

function CountrySelect({
  label, value, onChange,
}: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <SelectField
      label={label}
      value={value}
      onChange={onChange}
      options={countryOptions}
      placeholder="Select country..."
    />
  );
}

function SaveButton({ saving, onClick, disabled = false, label = "Save Changes" }: {
  saving: boolean; onClick: () => void; disabled?: boolean; label?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={saving || disabled}
      className="px-6 py-2.5 bg-[#0A1F44] hover:bg-[#1A3A6B] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {saving ? "Saving..." : label}
    </button>
  );
}

function ToggleRow({ label, enabled, onToggle }: {
  label: string; enabled: boolean; onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-[#111827]">{label}</span>
      <button
        onClick={onToggle}
        className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? "bg-[#10B981]" : "bg-gray-300"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${enabled ? "translate-x-5" : "translate-x-0"}`}
        />
      </button>
    </div>
  );
}
