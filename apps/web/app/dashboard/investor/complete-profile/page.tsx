"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/contexts/AuthContext";
import {
  AccreditationSection,
  getAccreditationForCountry,
} from "./accreditation-by-jurisdiction";

// ============================================================================
// TYPES
// ============================================================================

type FormData = {
  // Step 1: Identity & Jurisdiction
  countryOfResidence: string;
  citizenship: string;
  taxResidency: string;
  fullName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  residentialAddress: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  nin: string;
  bvn: string;
  ssn: string;
  niNumber: string;
  passportNumber: string;
  idType: string;
  idNumber: string;

  // Step 2: Investor Profile
  investorType: string;
  firmName: string;
  investorTitle: string;
  aum: string;
  yearsInvesting: string;

  // Step 3: Qualification / Accreditation
  accreditationBasis: string;
  accreditationCertified: boolean;

  // Step 4: Suitability & Risk Assessment
  riskTolerance: string;
  generalExperience: string;
  privateMarketExperience: string;
  illiquidityComfort: number;
  canAbsorbTotalLoss: string;
  sourceOfFunds: string[];
  politicallyExposed: boolean;
  politicallyExposedDetails: string;
  regulatoryRestrictions: boolean;
  regulatoryRestrictionsDetails: string;
  brokerAffiliated: boolean;
  brokerDetails: string;
  seniorOfficer: boolean;
  seniorOfficerCompany: string;
  trustedContactName: string;
  trustedContactEmail: string;
  trustedContactPhone: string;
  trustedContactRelationship: string;

  // Step 5: Investment Preferences
  investmentFocus: string[];
  preferredLanes: string[];
  minimumCheckSize: string;
  maximumCheckSize: string;
  holdingPeriod: string;
  liquidityNeeds: string;
  investmentHorizon: string;

  // Step 6: Risk Acknowledgement
  acknowledgePrivatePlacement: boolean;
  acknowledgeIlliquidity: boolean;
  acknowledgeLossRisk: boolean;
  acknowledgeNotAdvisor: boolean;
  acknowledgeNoGuarantee: boolean;
  acknowledgeAccreditedStatus: boolean;
};

// ============================================================================
// STEP LABELS
// ============================================================================

const STEPS = [
  "Identity & Jurisdiction",
  "Investor Profile",
  "Accreditation",
  "Suitability",
  "Preferences",
  "Risk Acknowledgement",
  "Review & Submit",
];

// ============================================================================
// OPTIONS DATA
// ============================================================================

const countryOptions = [
  // --- Nigeria (special KYC) ---
  { value: "Nigeria", region: "nigeria" as const, label: "Nigeria" },
  // --- United States (special KYC) ---
  { value: "United States", region: "us" as const, label: "United States" },
  // --- United Kingdom (special KYC) ---
  { value: "United Kingdom", region: "uk" as const, label: "United Kingdom" },
  // --- Africa ---
  { value: "Algeria", region: "africa_other" as const, label: "Algeria" },
  { value: "Angola", region: "africa_other" as const, label: "Angola" },
  { value: "Benin", region: "africa_other" as const, label: "Benin" },
  { value: "Botswana", region: "africa_other" as const, label: "Botswana" },
  {
    value: "Burkina Faso",
    region: "africa_other" as const,
    label: "Burkina Faso",
  },
  { value: "Burundi", region: "africa_other" as const, label: "Burundi" },
  { value: "Cabo Verde", region: "africa_other" as const, label: "Cabo Verde" },
  { value: "Cameroon", region: "africa_other" as const, label: "Cameroon" },
  {
    value: "Central African Republic",
    region: "africa_other" as const,
    label: "Central African Republic",
  },
  { value: "Chad", region: "africa_other" as const, label: "Chad" },
  { value: "Comoros", region: "africa_other" as const, label: "Comoros" },
  { value: "Congo", region: "africa_other" as const, label: "Congo" },
  { value: "DR Congo", region: "africa_other" as const, label: "DR Congo" },
  { value: "Djibouti", region: "africa_other" as const, label: "Djibouti" },
  { value: "Egypt", region: "africa_other" as const, label: "Egypt" },
  {
    value: "Equatorial Guinea",
    region: "africa_other" as const,
    label: "Equatorial Guinea",
  },
  { value: "Eritrea", region: "africa_other" as const, label: "Eritrea" },
  { value: "Eswatini", region: "africa_other" as const, label: "Eswatini" },
  { value: "Ethiopia", region: "africa_other" as const, label: "Ethiopia" },
  { value: "Gabon", region: "africa_other" as const, label: "Gabon" },
  { value: "Gambia", region: "africa_other" as const, label: "Gambia" },
  { value: "Ghana", region: "africa_other" as const, label: "Ghana" },
  { value: "Guinea", region: "africa_other" as const, label: "Guinea" },
  {
    value: "Guinea-Bissau",
    region: "africa_other" as const,
    label: "Guinea-Bissau",
  },
  {
    value: "Ivory Coast",
    region: "africa_other" as const,
    label: "Ivory Coast",
  },
  { value: "Kenya", region: "africa_other" as const, label: "Kenya" },
  { value: "Lesotho", region: "africa_other" as const, label: "Lesotho" },
  { value: "Liberia", region: "africa_other" as const, label: "Liberia" },
  { value: "Libya", region: "africa_other" as const, label: "Libya" },
  { value: "Madagascar", region: "africa_other" as const, label: "Madagascar" },
  { value: "Malawi", region: "africa_other" as const, label: "Malawi" },
  { value: "Mali", region: "africa_other" as const, label: "Mali" },
  { value: "Mauritania", region: "africa_other" as const, label: "Mauritania" },
  { value: "Mauritius", region: "africa_other" as const, label: "Mauritius" },
  { value: "Morocco", region: "africa_other" as const, label: "Morocco" },
  { value: "Mozambique", region: "africa_other" as const, label: "Mozambique" },
  { value: "Namibia", region: "africa_other" as const, label: "Namibia" },
  { value: "Niger", region: "africa_other" as const, label: "Niger" },
  { value: "Rwanda", region: "africa_other" as const, label: "Rwanda" },
  {
    value: "São Tomé and Príncipe",
    region: "africa_other" as const,
    label: "São Tomé and Príncipe",
  },
  { value: "Senegal", region: "africa_other" as const, label: "Senegal" },
  { value: "Seychelles", region: "africa_other" as const, label: "Seychelles" },
  {
    value: "Sierra Leone",
    region: "africa_other" as const,
    label: "Sierra Leone",
  },
  { value: "Somalia", region: "africa_other" as const, label: "Somalia" },
  {
    value: "South Africa",
    region: "africa_other" as const,
    label: "South Africa",
  },
  {
    value: "South Sudan",
    region: "africa_other" as const,
    label: "South Sudan",
  },
  { value: "Sudan", region: "africa_other" as const, label: "Sudan" },
  { value: "Tanzania", region: "africa_other" as const, label: "Tanzania" },
  { value: "Togo", region: "africa_other" as const, label: "Togo" },
  { value: "Tunisia", region: "africa_other" as const, label: "Tunisia" },
  { value: "Uganda", region: "africa_other" as const, label: "Uganda" },
  { value: "Zambia", region: "africa_other" as const, label: "Zambia" },
  { value: "Zimbabwe", region: "africa_other" as const, label: "Zimbabwe" },
  // --- Europe (EU / EEA / MiFID II) ---
  { value: "Austria", region: "eu" as const, label: "Austria" },
  { value: "Belgium", region: "eu" as const, label: "Belgium" },
  { value: "Bulgaria", region: "eu" as const, label: "Bulgaria" },
  { value: "Croatia", region: "eu" as const, label: "Croatia" },
  { value: "Cyprus", region: "eu" as const, label: "Cyprus" },
  { value: "Czech Republic", region: "eu" as const, label: "Czech Republic" },
  { value: "Denmark", region: "eu" as const, label: "Denmark" },
  { value: "Estonia", region: "eu" as const, label: "Estonia" },
  { value: "Finland", region: "eu" as const, label: "Finland" },
  { value: "France", region: "eu" as const, label: "France" },
  { value: "Germany", region: "eu" as const, label: "Germany" },
  { value: "Greece", region: "eu" as const, label: "Greece" },
  { value: "Hungary", region: "eu" as const, label: "Hungary" },
  { value: "Iceland", region: "eu" as const, label: "Iceland" },
  { value: "Ireland", region: "eu" as const, label: "Ireland" },
  { value: "Italy", region: "eu" as const, label: "Italy" },
  { value: "Latvia", region: "eu" as const, label: "Latvia" },
  { value: "Liechtenstein", region: "eu" as const, label: "Liechtenstein" },
  { value: "Lithuania", region: "eu" as const, label: "Lithuania" },
  { value: "Luxembourg", region: "eu" as const, label: "Luxembourg" },
  { value: "Malta", region: "eu" as const, label: "Malta" },
  { value: "Netherlands", region: "eu" as const, label: "Netherlands" },
  { value: "Norway", region: "eu" as const, label: "Norway" },
  { value: "Poland", region: "eu" as const, label: "Poland" },
  { value: "Portugal", region: "eu" as const, label: "Portugal" },
  { value: "Romania", region: "eu" as const, label: "Romania" },
  { value: "Slovakia", region: "eu" as const, label: "Slovakia" },
  { value: "Slovenia", region: "eu" as const, label: "Slovenia" },
  { value: "Spain", region: "eu" as const, label: "Spain" },
  { value: "Sweden", region: "eu" as const, label: "Sweden" },
  { value: "Switzerland", region: "eu" as const, label: "Switzerland" },
  // --- Europe (non-EU) ---
  { value: "Albania", region: "other" as const, label: "Albania" },
  { value: "Andorra", region: "other" as const, label: "Andorra" },
  { value: "Armenia", region: "other" as const, label: "Armenia" },
  { value: "Azerbaijan", region: "other" as const, label: "Azerbaijan" },
  { value: "Belarus", region: "other" as const, label: "Belarus" },
  {
    value: "Bosnia and Herzegovina",
    region: "other" as const,
    label: "Bosnia and Herzegovina",
  },
  { value: "Georgia", region: "other" as const, label: "Georgia" },
  { value: "Kosovo", region: "other" as const, label: "Kosovo" },
  { value: "Moldova", region: "other" as const, label: "Moldova" },
  { value: "Monaco", region: "other" as const, label: "Monaco" },
  { value: "Montenegro", region: "other" as const, label: "Montenegro" },
  {
    value: "North Macedonia",
    region: "other" as const,
    label: "North Macedonia",
  },
  { value: "Russia", region: "other" as const, label: "Russia" },
  { value: "San Marino", region: "other" as const, label: "San Marino" },
  { value: "Serbia", region: "other" as const, label: "Serbia" },
  { value: "Turkey", region: "other" as const, label: "Turkey" },
  { value: "Ukraine", region: "other" as const, label: "Ukraine" },
  { value: "Vatican City", region: "other" as const, label: "Vatican City" },
  // --- Americas ---
  {
    value: "Antigua and Barbuda",
    region: "other" as const,
    label: "Antigua and Barbuda",
  },
  { value: "Argentina", region: "other" as const, label: "Argentina" },
  { value: "Bahamas", region: "other" as const, label: "Bahamas" },
  { value: "Barbados", region: "other" as const, label: "Barbados" },
  { value: "Belize", region: "other" as const, label: "Belize" },
  { value: "Bolivia", region: "other" as const, label: "Bolivia" },
  { value: "Brazil", region: "other" as const, label: "Brazil" },
  { value: "Canada", region: "other" as const, label: "Canada" },
  { value: "Chile", region: "other" as const, label: "Chile" },
  { value: "Colombia", region: "other" as const, label: "Colombia" },
  { value: "Costa Rica", region: "other" as const, label: "Costa Rica" },
  { value: "Cuba", region: "other" as const, label: "Cuba" },
  { value: "Dominica", region: "other" as const, label: "Dominica" },
  {
    value: "Dominican Republic",
    region: "other" as const,
    label: "Dominican Republic",
  },
  { value: "Ecuador", region: "other" as const, label: "Ecuador" },
  { value: "El Salvador", region: "other" as const, label: "El Salvador" },
  { value: "Grenada", region: "other" as const, label: "Grenada" },
  { value: "Guatemala", region: "other" as const, label: "Guatemala" },
  { value: "Guyana", region: "other" as const, label: "Guyana" },
  { value: "Haiti", region: "other" as const, label: "Haiti" },
  { value: "Honduras", region: "other" as const, label: "Honduras" },
  { value: "Jamaica", region: "other" as const, label: "Jamaica" },
  { value: "Mexico", region: "other" as const, label: "Mexico" },
  { value: "Nicaragua", region: "other" as const, label: "Nicaragua" },
  { value: "Panama", region: "other" as const, label: "Panama" },
  { value: "Paraguay", region: "other" as const, label: "Paraguay" },
  { value: "Peru", region: "other" as const, label: "Peru" },
  {
    value: "Saint Kitts and Nevis",
    region: "other" as const,
    label: "Saint Kitts and Nevis",
  },
  { value: "Saint Lucia", region: "other" as const, label: "Saint Lucia" },
  {
    value: "Saint Vincent and the Grenadines",
    region: "other" as const,
    label: "Saint Vincent and the Grenadines",
  },
  { value: "Suriname", region: "other" as const, label: "Suriname" },
  {
    value: "Trinidad and Tobago",
    region: "other" as const,
    label: "Trinidad and Tobago",
  },
  { value: "Uruguay", region: "other" as const, label: "Uruguay" },
  { value: "Venezuela", region: "other" as const, label: "Venezuela" },
  // --- Middle East ---
  { value: "Bahrain", region: "other" as const, label: "Bahrain" },
  { value: "Iran", region: "other" as const, label: "Iran" },
  { value: "Iraq", region: "other" as const, label: "Iraq" },
  { value: "Israel", region: "other" as const, label: "Israel" },
  { value: "Jordan", region: "other" as const, label: "Jordan" },
  { value: "Kuwait", region: "other" as const, label: "Kuwait" },
  { value: "Lebanon", region: "other" as const, label: "Lebanon" },
  { value: "Oman", region: "other" as const, label: "Oman" },
  { value: "Palestine", region: "other" as const, label: "Palestine" },
  { value: "Qatar", region: "other" as const, label: "Qatar" },
  { value: "Saudi Arabia", region: "other" as const, label: "Saudi Arabia" },
  { value: "Syria", region: "other" as const, label: "Syria" },
  { value: "UAE", region: "other" as const, label: "United Arab Emirates" },
  { value: "Yemen", region: "other" as const, label: "Yemen" },
  // --- Asia ---
  { value: "Afghanistan", region: "other" as const, label: "Afghanistan" },
  { value: "Bangladesh", region: "other" as const, label: "Bangladesh" },
  { value: "Bhutan", region: "other" as const, label: "Bhutan" },
  { value: "Brunei", region: "other" as const, label: "Brunei" },
  { value: "Cambodia", region: "other" as const, label: "Cambodia" },
  { value: "China", region: "other" as const, label: "China" },
  { value: "Hong Kong", region: "other" as const, label: "Hong Kong" },
  { value: "India", region: "other" as const, label: "India" },
  { value: "Indonesia", region: "other" as const, label: "Indonesia" },
  { value: "Japan", region: "other" as const, label: "Japan" },
  { value: "Kazakhstan", region: "other" as const, label: "Kazakhstan" },
  { value: "Kyrgyzstan", region: "other" as const, label: "Kyrgyzstan" },
  { value: "Laos", region: "other" as const, label: "Laos" },
  { value: "Macau", region: "other" as const, label: "Macau" },
  { value: "Malaysia", region: "other" as const, label: "Malaysia" },
  { value: "Maldives", region: "other" as const, label: "Maldives" },
  { value: "Mongolia", region: "other" as const, label: "Mongolia" },
  { value: "Myanmar", region: "other" as const, label: "Myanmar" },
  { value: "Nepal", region: "other" as const, label: "Nepal" },
  { value: "North Korea", region: "other" as const, label: "North Korea" },
  { value: "Pakistan", region: "other" as const, label: "Pakistan" },
  { value: "Philippines", region: "other" as const, label: "Philippines" },
  { value: "Singapore", region: "other" as const, label: "Singapore" },
  { value: "South Korea", region: "other" as const, label: "South Korea" },
  { value: "Sri Lanka", region: "other" as const, label: "Sri Lanka" },
  { value: "Taiwan", region: "other" as const, label: "Taiwan" },
  { value: "Tajikistan", region: "other" as const, label: "Tajikistan" },
  { value: "Thailand", region: "other" as const, label: "Thailand" },
  { value: "Timor-Leste", region: "other" as const, label: "Timor-Leste" },
  { value: "Turkmenistan", region: "other" as const, label: "Turkmenistan" },
  { value: "Uzbekistan", region: "other" as const, label: "Uzbekistan" },
  { value: "Vietnam", region: "other" as const, label: "Vietnam" },
  // --- Oceania ---
  { value: "Australia", region: "other" as const, label: "Australia" },
  { value: "Fiji", region: "other" as const, label: "Fiji" },
  { value: "Kiribati", region: "other" as const, label: "Kiribati" },
  {
    value: "Marshall Islands",
    region: "other" as const,
    label: "Marshall Islands",
  },
  { value: "Micronesia", region: "other" as const, label: "Micronesia" },
  { value: "Nauru", region: "other" as const, label: "Nauru" },
  { value: "New Zealand", region: "other" as const, label: "New Zealand" },
  { value: "Palau", region: "other" as const, label: "Palau" },
  {
    value: "Papua New Guinea",
    region: "other" as const,
    label: "Papua New Guinea",
  },
  { value: "Samoa", region: "other" as const, label: "Samoa" },
  {
    value: "Solomon Islands",
    region: "other" as const,
    label: "Solomon Islands",
  },
  { value: "Tonga", region: "other" as const, label: "Tonga" },
  { value: "Tuvalu", region: "other" as const, label: "Tuvalu" },
  { value: "Vanuatu", region: "other" as const, label: "Vanuatu" },
];

type CountryRegion = "nigeria" | "us" | "uk" | "eu" | "africa_other" | "other";

function getRegion(country: string): CountryRegion {
  const found = countryOptions.find((c) => c.value === country);
  return found?.region || "other";
}

const idTypesByRegion: Record<
  CountryRegion,
  { value: string; label: string }[]
> = {
  nigeria: [
    { value: "NATIONAL_ID", label: "National ID Card (NIMC)" },
    { value: "PASSPORT", label: "International Passport" },
    { value: "DRIVERS_LICENSE", label: "Driver's License" },
    { value: "VOTERS_CARD", label: "Voter's Card" },
  ],
  us: [
    { value: "DRIVERS_LICENSE", label: "Driver's License" },
    { value: "PASSPORT", label: "US Passport" },
    { value: "STATE_ID", label: "State ID Card" },
  ],
  uk: [
    { value: "PASSPORT", label: "UK Passport" },
    { value: "DRIVERS_LICENSE", label: "UK Driving Licence" },
    { value: "BRP", label: "Biometric Residence Permit" },
  ],
  eu: [
    { value: "NATIONAL_ID", label: "National ID Card" },
    { value: "PASSPORT", label: "Passport" },
    { value: "DRIVERS_LICENSE", label: "Driving Licence" },
  ],
  africa_other: [
    { value: "NATIONAL_ID", label: "National ID Card" },
    { value: "PASSPORT", label: "International Passport" },
    { value: "DRIVERS_LICENSE", label: "Driver's License" },
  ],
  other: [
    { value: "PASSPORT", label: "Passport" },
    { value: "NATIONAL_ID", label: "National ID Card" },
    { value: "DRIVERS_LICENSE", label: "Driver's License" },
  ],
};

const investorTypeOptions = [
  { value: "", label: "Select investor type" },
  { value: "INDIVIDUAL", label: "Individual Investor" },
  { value: "ANGEL", label: "Angel Investor" },
  { value: "FAMILY_OFFICE", label: "Family Office" },
  { value: "VC_FUND", label: "VC Fund" },
  { value: "CORPORATE", label: "Corporate" },
  { value: "INSTITUTIONAL", label: "Institutional Investor" },
];

const aumOptions = [
  { value: "", label: "Select range" },
  { value: "under_100k", label: "Under $100,000" },
  { value: "100k_500k", label: "$100,000 – $500,000" },
  { value: "500k_1m", label: "$500,000 – $1,000,000" },
  { value: "1m_5m", label: "$1,000,000 – $5,000,000" },
  { value: "5m_10m", label: "$5,000,000 – $10,000,000" },
  { value: "10m_plus", label: "$10,000,000+" },
];

const yearsInvestingOptions = [
  { value: "", label: "Select experience" },
  { value: "0", label: "No prior experience" },
  { value: "1-2", label: "1–2 years" },
  { value: "3-5", label: "3–5 years" },
  { value: "6-10", label: "6–10 years" },
  { value: "10+", label: "10+ years" },
];

const riskToleranceOptions = [
  { value: "", label: "Select your risk tolerance" },
  {
    value: "conservative",
    label: "Conservative — I prioritize capital preservation over returns",
  },
  {
    value: "moderate",
    label: "Moderate — I seek balanced returns with manageable risk",
  },
  {
    value: "higher",
    label:
      "Higher — I want to maximize returns and am comfortable with volatility",
  },
  {
    value: "aggressive",
    label:
      "Aggressive — I pursue maximum growth and accept high risk, including total loss",
  },
];

const experienceOptions = [
  { value: "", label: "Select experience level" },
  { value: "none", label: "None — I'm new to investing" },
  { value: "limited", label: "Limited — Some experience with public markets" },
  {
    value: "moderate",
    label: "Moderate — Active investor, understand risk/return",
  },
  {
    value: "extensive",
    label: "Extensive — Years of experience across asset classes",
  },
];

const privateExperienceOptions = [
  { value: "", label: "Select private market experience" },
  { value: "none", label: "None — First private market investment" },
  { value: "some", label: "Some — 1–3 private investments" },
  { value: "experienced", label: "Experienced — 4–10 private investments" },
  {
    value: "very_experienced",
    label: "Very experienced — 10+ private investments",
  },
];

const sourceOfFundsOptions = [
  { value: "earnings", label: "Income / salary" },
  { value: "business", label: "Business profits" },
  { value: "investments", label: "Investment returns" },
  { value: "inheritance", label: "Inheritance" },
  { value: "savings", label: "Personal savings" },
  { value: "pension", label: "Pension / retirement" },
  { value: "property", label: "Property sale" },
  { value: "other", label: "Other" },
];

const sectorOptions = [
  { value: "FINTECH", label: "FinTech" },
  { value: "LOGISTICS", label: "Logistics & Mobility" },
  { value: "ENERGY", label: "Energy & Utilities" },
  { value: "CONSUMER_FMCG", label: "Consumer / FMCG" },
  { value: "HEALTH", label: "Health & Biotech" },
  { value: "AGRI_FOOD", label: "Agri / Food" },
  { value: "REAL_ESTATE", label: "Real Estate" },
  { value: "INFRASTRUCTURE", label: "Infrastructure" },
  { value: "SAAS_TECH", label: "SaaS / Tech" },
  { value: "TECHNOLOGY", label: "Technology" },
  { value: "MANUFACTURING", label: "Manufacturing" },
];

const laneOptions = [
  {
    value: "YIELD",
    label: "Yield Lane",
    desc: "Revenue/asset-backed instruments with predictable returns",
  },
  {
    value: "VENTURES",
    label: "Ventures Lane",
    desc: "Equity-based instruments with growth upside",
  },
];

const checkSizeOptions = [
  { value: "", label: "Select amount" },
  { value: "5000", label: "$5,000" },
  { value: "10000", label: "$10,000" },
  { value: "25000", label: "$25,000" },
  { value: "50000", label: "$50,000" },
  { value: "100000", label: "$100,000" },
  { value: "250000", label: "$250,000" },
  { value: "500000", label: "$500,000" },
  { value: "1000000", label: "$1,000,000+" },
];

const holdingPeriodOptions = [
  { value: "", label: "Select holding period" },
  { value: "short", label: "Short-term — Less than 2 years" },
  { value: "medium", label: "Medium-term — 2–5 years" },
  { value: "long", label: "Long-term — 5+ years" },
  { value: "no_preference", label: "No preference" },
];

const liquidityOptions = [
  { value: "", label: "Select liquidity needs" },
  { value: "yes_immediate", label: "Yes — May need funds within 12 months" },
  {
    value: "yes_medium",
    label: "Possibly — Might need partial liquidity in 1–3 years",
  },
  { value: "no", label: "No — Don't anticipate needing quick access" },
];

const investmentHorizonOptions = [
  { value: "", label: "Select investment horizon" },
  { value: "short", label: "Short-term — Under 2 years" },
  { value: "medium", label: "Medium-term — 2–5 years" },
  { value: "long", label: "Long-term — 5+ years" },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CompleteInvestorProfile() {
  const router = useRouter();
  const { user, accessToken, loading } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  const [formData, setFormData] = useState<FormData>({
    // Step 1
    countryOfResidence: "Nigeria",
    citizenship: "",
    taxResidency: "",
    fullName: "",
    dateOfBirth: "",
    email: "",
    phone: "",
    residentialAddress: "",
    city: "",
    stateProvince: "",
    postalCode: "",
    nin: "",
    bvn: "",
    ssn: "",
    niNumber: "",
    passportNumber: "",
    idType: "",
    idNumber: "",
    // Step 2
    investorType: "",
    firmName: "",
    investorTitle: "",
    aum: "",
    yearsInvesting: "",
    // Step 3
    accreditationBasis: "",
    accreditationCertified: false,
    // Step 4
    riskTolerance: "",
    generalExperience: "",
    privateMarketExperience: "",
    illiquidityComfort: 0,
    canAbsorbTotalLoss: "",
    sourceOfFunds: [],
    politicallyExposed: false,
    politicallyExposedDetails: "",
    regulatoryRestrictions: false,
    regulatoryRestrictionsDetails: "",
    brokerAffiliated: false,
    brokerDetails: "",
    seniorOfficer: false,
    seniorOfficerCompany: "",
    trustedContactName: "",
    trustedContactEmail: "",
    trustedContactPhone: "",
    trustedContactRelationship: "",
    // Step 5
    investmentFocus: [],
    preferredLanes: [],
    minimumCheckSize: "",
    maximumCheckSize: "",
    holdingPeriod: "",
    liquidityNeeds: "",
    investmentHorizon: "",
    // Step 6
    acknowledgePrivatePlacement: false,
    acknowledgeIlliquidity: false,
    acknowledgeLossRisk: false,
    acknowledgeNotAdvisor: false,
    acknowledgeNoGuarantee: false,
    acknowledgeAccreditedStatus: false,
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        email: user.email || "",
      }));
    }
  }, [user]);

  const updateField = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setValidationErrors([]);
  };

  const toggleArrayField = (
    field: "investmentFocus" | "preferredLanes" | "sourceOfFunds",
    value: string,
  ) => {
    setFormData((prev) => {
      const current = prev[field] as string[];
      return {
        ...prev,
        [field]: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      };
    });
  };

  // ============================================================================
  // VALIDATION
  // ============================================================================

  const nextStep = () => {
    const missing: string[] = [];

    if (currentStep === 0) {
      if (!formData.fullName) missing.push("fullName");
      if (!formData.phone) missing.push("phone");
      if (!formData.dateOfBirth) missing.push("dateOfBirth");
      if (!formData.residentialAddress) missing.push("residentialAddress");
      if (!formData.city) missing.push("city");
      if (!formData.taxResidency) missing.push("taxResidency");
      if (!formData.idType) missing.push("idType");
      if (!formData.idNumber) missing.push("idNumber");
      const region = getRegion(formData.countryOfResidence);
      if (region === "nigeria" && !formData.nin) missing.push("nin");
      if (region === "us" && !formData.ssn) missing.push("ssn");
    }
    if (currentStep === 1) {
      if (!formData.investorType) missing.push("investorType");
      if (
        ["INSTITUTIONAL", "FAMILY_OFFICE", "VC_FUND", "CORPORATE"].includes(
          formData.investorType,
        ) &&
        !formData.firmName
      )
        missing.push("firmName");
      if (!formData.yearsInvesting) missing.push("yearsInvesting");
      if (!formData.investorTitle) missing.push("investorTitle");
    }
    if (currentStep === 2) {
      if (!formData.accreditationBasis) missing.push("accreditationBasis");
      if (!formData.accreditationCertified)
        missing.push("accreditationCertified");
    }
    if (currentStep === 3) {
      if (!formData.riskTolerance) missing.push("riskTolerance");
      if (!formData.generalExperience) missing.push("generalExperience");
      if (formData.illiquidityComfort === 0) missing.push("illiquidityComfort");
      if (!formData.canAbsorbTotalLoss) missing.push("canAbsorbTotalLoss");
      if (formData.sourceOfFunds.length === 0) missing.push("sourceOfFunds");
    }
    if (currentStep === 4) {
      if (formData.investmentFocus.length === 0)
        missing.push("investmentFocus");
      if (formData.preferredLanes.length === 0) missing.push("preferredLanes");
      if (!formData.holdingPeriod) missing.push("holdingPeriod");
      if (!formData.liquidityNeeds) missing.push("liquidityNeeds");
      if (!formData.investmentHorizon) missing.push("investmentHorizon");
    }
    if (currentStep === 5) {
      if (!formData.acknowledgePrivatePlacement)
        missing.push("acknowledgePrivatePlacement");
      if (!formData.acknowledgeIlliquidity)
        missing.push("acknowledgeIlliquidity");
      if (!formData.acknowledgeLossRisk) missing.push("acknowledgeLossRisk");
      if (!formData.acknowledgeNotAdvisor)
        missing.push("acknowledgeNotAdvisor");
      if (!formData.acknowledgeNoGuarantee)
        missing.push("acknowledgeNoGuarantee");
      if (!formData.acknowledgeAccreditedStatus)
        missing.push("acknowledgeAccreditedStatus");
    }

    if (missing.length > 0) {
      setValidationErrors(missing);
      return;
    }
    setValidationErrors([]);
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  // ============================================================================
  // SUBMIT
  // ============================================================================

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      if (!accessToken) {
        alert("Session expired. Please log in again.");
        router.push("/login");
        return;
      }

      const region = getRegion(formData.countryOfResidence);

      const payload = {
        // Identity
        countryOfResidence: formData.countryOfResidence,
        citizenship: formData.citizenship || undefined,
        taxResidency: formData.taxResidency,
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth,
        phone: formData.phone,
        residentialAddress: formData.residentialAddress,
        city: formData.city,
        stateProvince: formData.stateProvince || undefined,
        postalCode: formData.postalCode || undefined,
        nin: region === "nigeria" ? formData.nin : undefined,
        bvn: region === "nigeria" ? formData.bvn || undefined : undefined,
        ssn: region === "us" ? formData.ssn : undefined,
        niNumber: region === "uk" ? formData.niNumber || undefined : undefined,
        passportNumber: formData.passportNumber || undefined,
        idType: formData.idType,
        idNumber: formData.idNumber,

        // Investor Profile
        investorType: formData.investorType,
        firmName: formData.firmName || undefined,
        investorTitle: formData.investorTitle,
        aum: formData.aum || undefined,
        yearsInvesting: formData.yearsInvesting,

        // Accreditation
        accreditationBasis: formData.accreditationBasis,

        // Suitability
        riskTolerance: formData.riskTolerance,
        generalExperience: formData.generalExperience,
        privateMarketExperience: formData.privateMarketExperience || undefined,
        illiquidityComfort: formData.illiquidityComfort,
        canAbsorbTotalLoss: formData.canAbsorbTotalLoss,
        sourceOfFunds: formData.sourceOfFunds,
        politicallyExposed: formData.politicallyExposed,
        politicallyExposedDetails: formData.politicallyExposed
          ? formData.politicallyExposedDetails
          : undefined,
        regulatoryRestrictions: formData.regulatoryRestrictions,
        regulatoryRestrictionsDetails: formData.regulatoryRestrictions
          ? formData.regulatoryRestrictionsDetails
          : undefined,
        brokerAffiliated: formData.brokerAffiliated,
        brokerDetails: formData.brokerAffiliated
          ? formData.brokerDetails
          : undefined,
        seniorOfficer: formData.seniorOfficer,
        seniorOfficerCompany: formData.seniorOfficer
          ? formData.seniorOfficerCompany
          : undefined,
        trustedContactName: formData.trustedContactName || undefined,
        trustedContactEmail: formData.trustedContactEmail || undefined,
        trustedContactPhone: formData.trustedContactPhone || undefined,
        trustedContactRelationship:
          formData.trustedContactRelationship || undefined,

        // Investment Preferences
        investmentFocus: formData.investmentFocus,
        preferredLanes: formData.preferredLanes,
        minimumCheckSize: formData.minimumCheckSize
          ? parseFloat(formData.minimumCheckSize)
          : undefined,
        maximumCheckSize: formData.maximumCheckSize
          ? parseFloat(formData.maximumCheckSize)
          : undefined,
        holdingPeriod: formData.holdingPeriod,
        liquidityNeeds: formData.liquidityNeeds,
        investmentHorizon: formData.investmentHorizon,

        // Accreditation
        accreditationCertified: formData.accreditationCertified,

        // Risk Acknowledgement
        riskAcknowledged: true,
        acknowledgePrivatePlacement: formData.acknowledgePrivatePlacement,
        acknowledgeIlliquidity: formData.acknowledgeIlliquidity,
        acknowledgeLossRisk: formData.acknowledgeLossRisk,
        acknowledgeNotAdvisor: formData.acknowledgeNotAdvisor,
        acknowledgeNoGuarantee: formData.acknowledgeNoGuarantee,
        acknowledgeAccreditedStatus: formData.acknowledgeAccreditedStatus,
      };

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(`${API_URL}/api/investors/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success) {
        router.push("/dashboard/investor/submission-success");
      } else {
        alert(`Error: ${result.error?.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const has = (field: string) => validationErrors.includes(field);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#F6F8FA" }}
      >
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  if (!user) return null;

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F6F8FA" }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4">
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
              Save &amp; Exit
            </Link>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => (
              <div key={step} className="flex-1 relative">
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                      index <= currentStep
                        ? "bg-primary-950 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {index < currentStep ? "✓" : index + 1}
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 transition-colors ${index < currentStep ? "bg-primary-950" : "bg-gray-200"}`}
                    />
                  )}
                </div>
                <p className="text-xs mt-2 text-gray-600 hidden md:block">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {currentStep === 0 && (
            <Step1Identity
              formData={formData}
              updateField={updateField}
              has={has}
            />
          )}
          {currentStep === 1 && (
            <Step2InvestorProfile
              formData={formData}
              updateField={updateField}
              has={has}
            />
          )}
          {currentStep === 2 && (
            <Step3Accreditation
              formData={formData}
              updateField={updateField}
              has={has}
            />
          )}
          {currentStep === 3 && (
            <Step4Suitability
              formData={formData}
              updateField={updateField}
              toggleArrayField={toggleArrayField}
              has={has}
            />
          )}
          {currentStep === 4 && (
            <Step5Preferences
              formData={formData}
              updateField={updateField}
              toggleArrayField={toggleArrayField}
              has={has}
            />
          )}
          {currentStep === 5 && (
            <Step6RiskAck
              formData={formData}
              updateField={updateField}
              has={has}
              validationErrors={validationErrors}
            />
          )}
          {currentStep === 6 && <Step7Review formData={formData} />}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-8 border-t border-gray-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-gray-300 text-gray-700 hover:border-gray-400"
            >
              Previous
            </button>
            {currentStep < STEPS.length - 1 ? (
              <button
                onClick={nextStep}
                className="px-6 py-3 rounded-lg font-semibold transition-all"
                style={{ backgroundColor: "#C8A24D", color: "#0B1C2D" }}
              >
                Next Step
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50"
                style={{ backgroundColor: "#C8A24D", color: "#0B1C2D" }}
              >
                {submitting ? "Submitting..." : "Complete Profile"}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// ============================================================================
// STEP 1: IDENTITY & JURISDICTION
// ============================================================================

function Step1Identity({
  formData,
  updateField,
  has,
}: {
  formData: FormData;
  updateField: (f: keyof FormData, v: any) => void;
  has: (f: string) => boolean;
}) {
  const region = getRegion(formData.countryOfResidence);
  const idTypes = idTypesByRegion[region];
  const [showSsn, setShowSsn] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary-950 mb-2">
          Identity &amp; Jurisdiction
        </h2>
        <p className="text-gray-600">
          This determines your regulatory jurisdiction and accreditation
          requirements
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Country of Residence */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Country of Residence <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.countryOfResidence}
            onChange={(e) => {
              updateField("countryOfResidence", e.target.value);
              updateField("idType", "");
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
          >
            {countryOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            This determines which accreditation standards apply to you
          </p>
        </div>

        {/* Citizenship */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Citizenship
          </label>
          <select
            value={formData.citizenship}
            onChange={(e) => updateField("citizenship", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
          >
            <option value="">Select citizenship</option>
            {countryOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Tax Residency */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Tax Residency <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.taxResidency}
            onChange={(e) => updateField("taxResidency", e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none ${has("taxResidency") ? "border-red-400 ring-2 ring-red-200" : "border-gray-300"}`}
          >
            <option value="">Select tax residency</option>
            {countryOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {has("taxResidency") && (
            <p className="text-xs text-red-500 mt-1">Required</p>
          )}
        </div>

        {/* Full Name */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Full Legal Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => updateField("fullName", e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none ${has("fullName") ? "border-red-400 ring-2 ring-red-200" : "border-gray-300"}`}
            placeholder="As it appears on your government ID"
          />
          {has("fullName") && (
            <p className="text-xs text-red-500 mt-1">Required</p>
          )}
        </div>

        {/* DOB */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => updateField("dateOfBirth", e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none ${has("dateOfBirth") ? "border-red-400 ring-2 ring-red-200" : "border-gray-300"}`}
          />
          {has("dateOfBirth") && (
            <p className="text-xs text-red-500 mt-1">Required</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            disabled
            className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 outline-none"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none ${has("phone") ? "border-red-400 ring-2 ring-red-200" : "border-gray-300"}`}
            placeholder={
              region === "us"
                ? "(xxx) xxx-xxxx"
                : region === "uk"
                  ? "+44 xxx xxxx xxxx"
                  : "+234 xxx xxx xxxx"
            }
          />
          {has("phone") && (
            <p className="text-xs text-red-500 mt-1">Required</p>
          )}
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Residential Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.residentialAddress}
            onChange={(e) => updateField("residentialAddress", e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none ${has("residentialAddress") ? "border-red-400 ring-2 ring-red-200" : "border-gray-300"}`}
            placeholder="Street address"
          />
          {has("residentialAddress") && (
            <p className="text-xs text-red-500 mt-1">Required</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => updateField("city", e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none ${has("city") ? "border-red-400 ring-2 ring-red-200" : "border-gray-300"}`}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            {region === "us"
              ? "State"
              : region === "uk"
                ? "County"
                : "State / Province"}
          </label>
          <input
            type="text"
            value={formData.stateProvince}
            onChange={(e) => updateField("stateProvince", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
            placeholder={
              region === "us"
                ? "e.g. California"
                : region === "uk"
                  ? "e.g. Greater London"
                  : region === "nigeria"
                    ? "e.g. Lagos"
                    : "State / Province"
            }
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            {region === "us" ? "ZIP Code" : "Postal Code"}
          </label>
          <input
            type="text"
            value={formData.postalCode}
            onChange={(e) => updateField("postalCode", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Country-Specific IDs */}
      <div className="space-y-4 p-6 bg-gray-50 rounded-lg">
        <p className="font-semibold text-gray-900">
          {region === "nigeria"
            ? "Nigerian Identity Documents"
            : region === "us"
              ? "US Identity Documents"
              : region === "uk"
                ? "UK Identity Documents"
                : "Identity Documents"}
        </p>

        {region === "nigeria" && (
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                NIN <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nin}
                onChange={(e) => updateField("nin", e.target.value)}
                maxLength={11}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none ${has("nin") ? "border-red-400 ring-2 ring-red-200" : "border-gray-300"}`}
                placeholder="11-digit NIN"
              />
              {has("nin") && (
                <p className="text-xs text-red-500 mt-1">
                  Required for Nigerian residents
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                BVN
              </label>
              <input
                type="text"
                value={formData.bvn}
                onChange={(e) => updateField("bvn", e.target.value)}
                maxLength={11}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
                placeholder="11-digit BVN"
              />
            </div>
          </div>
        )}

        {region === "us" && (
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              SSN <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showSsn ? "text" : "password"}
                value={formData.ssn}
                onChange={(e) => updateField("ssn", e.target.value)}
                maxLength={11}
                className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none ${has("ssn") ? "border-red-400 ring-2 ring-red-200" : "border-gray-300"}`}
                placeholder="XXX-XX-XXXX"
              />
              <button
                type="button"
                onClick={() => setShowSsn(!showSsn)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showSsn ? "Hide SSN" : "Show SSN"}
              >
                {showSsn ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {has("ssn") && (
              <p className="text-xs text-red-500 mt-1">
                Required for US residents
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Encrypted and stored securely for tax reporting (IRS W-9)
            </p>
          </div>
        )}

        {region === "uk" && (
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              National Insurance Number
            </label>
            <input
              type="text"
              value={formData.niNumber}
              onChange={(e) => updateField("niNumber", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
              placeholder="e.g. QQ 12 34 56 C"
            />
          </div>
        )}

        {!["nigeria", "us"].includes(region) && (
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Passport Number
            </label>
            <input
              type="text"
              value={formData.passportNumber}
              onChange={(e) => updateField("passportNumber", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
            />
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Government ID Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.idType}
              onChange={(e) => updateField("idType", e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none ${has("idType") ? "border-red-400 ring-2 ring-red-200" : "border-gray-300"}`}
            >
              <option value="">Select ID type</option>
              {idTypes.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            {has("idType") && (
              <p className="text-xs text-red-500 mt-1">Required</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              ID Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.idNumber}
              onChange={(e) => updateField("idNumber", e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none ${has("idNumber") ? "border-red-400 ring-2 ring-red-200" : "border-gray-300"}`}
            />
            {has("idNumber") && (
              <p className="text-xs text-red-500 mt-1">Required</p>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>Privacy &amp; Security:</strong> All identity information is
          encrypted at rest and in transit. Used solely for KYC/AML compliance.
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 2: INVESTOR PROFILE
// ============================================================================

function Step2InvestorProfile({
  formData,
  updateField,
  has,
}: {
  formData: FormData;
  updateField: (f: keyof FormData, v: any) => void;
  has: (f: string) => boolean;
}) {
  const needsFirm = [
    "INSTITUTIONAL",
    "FAMILY_OFFICE",
    "VC_FUND",
    "CORPORATE",
  ].includes(formData.investorType);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary-950 mb-2">
          Investor Profile
        </h2>
        <p className="text-gray-600">
          Tell us about your investment background
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Investor Type <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.investorType}
            onChange={(e) => updateField("investorType", e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none ${has("investorType") ? "border-red-400 ring-2 ring-red-200" : "border-gray-300"}`}
          >
            {investorTypeOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {has("investorType") && (
            <p className="text-xs text-red-500 mt-1">
              Please select your investor type
            </p>
          )}
        </div>

        {needsFirm && (
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Firm / Organization Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.firmName}
              onChange={(e) => updateField("firmName", e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none ${has("firmName") ? "border-red-400 ring-2 ring-red-200" : "border-gray-300"}`}
              placeholder="Your firm or organization name"
            />
            {has("firmName") && (
              <p className="text-xs text-red-500 mt-1">Firm name is required</p>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Title / Role <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.investorTitle}
            onChange={(e) => updateField("investorTitle", e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none ${has("investorTitle") ? "border-red-400 ring-2 ring-red-200" : "border-gray-300"}`}
            placeholder="e.g. Managing Partner, CEO, Individual"
          />
          {has("investorTitle") && (
            <p className="text-xs text-red-500 mt-1">Required</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Assets Under Management (AUM)
          </label>
          <select
            value={formData.aum}
            onChange={(e) => updateField("aum", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
          >
            {aumOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Years of Investing Experience{" "}
            <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.yearsInvesting}
            onChange={(e) => updateField("yearsInvesting", e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none ${has("yearsInvesting") ? "border-red-400 ring-2 ring-red-200" : "border-gray-300"}`}
          >
            {yearsInvestingOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {has("yearsInvesting") && (
            <p className="text-xs text-red-500 mt-1">Required</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 3: QUALIFICATION / ACCREDITATION (Jurisdiction-Aware)
// ============================================================================

function Step3Accreditation({
  formData,
  updateField,
  has,
}: {
  formData: FormData;
  updateField: (f: keyof FormData, v: any) => void;
  has: (f: string) => boolean;
}) {
  const accreditation = getAccreditationForCountry(formData.countryOfResidence);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary-950 mb-2">
          Investor Qualification
        </h2>
        <p className="text-gray-600">
          Based on your residence in{" "}
          <strong>{formData.countryOfResidence}</strong>, the following
          qualification standards apply
        </p>
      </div>

      <div className="p-4 bg-gray-100 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Jurisdiction
          </span>
        </div>
        <p className="text-sm font-semibold text-gray-900">
          {accreditation.localTerm}
        </p>
        <p className="text-xs text-gray-600 mt-1">
          Regulator: {accreditation.regulator}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          Basis: {accreditation.regulatoryBasis}
        </p>
      </div>

      {has("accreditationBasis") && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
          Please select your qualification basis
        </div>
      )}

      <AccreditationSection
        countryOfResidence={formData.countryOfResidence}
        accreditationBasis={formData.accreditationBasis}
        onSelect={(value) => updateField("accreditationBasis", value)}
        has={has}
      />

      {/* E-Signature Certification */}
      <div
        className={`p-5 rounded-lg border-2 transition-all ${has("accreditationCertified") ? "border-red-300 bg-red-50" : formData.accreditationCertified ? "border-green-300 bg-green-50" : "border-gray-200 bg-gray-50"}`}
      >
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.accreditationCertified}
            onChange={(e) =>
              updateField("accreditationCertified", e.target.checked)
            }
            className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-600 mt-0.5 shrink-0"
          />
          <div>
            <p className="text-sm font-semibold text-gray-900">
              I certify that the above qualification is accurate
            </p>
            <p className="text-xs text-gray-600 mt-1">
              I hereby certify that the qualification basis I have selected
              above is true and accurate to the best of my knowledge. I
              understand that Capvista may request supporting documentation to
              verify my status, and that providing false information may result
              in account termination and legal consequences.
            </p>
          </div>
        </label>
        {has("accreditationCertified") && (
          <p className="text-xs text-red-500 mt-2 ml-8">
            You must certify your qualification status
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// STEP 4: SUITABILITY & RISK ASSESSMENT
// ============================================================================

function Step4Suitability({
  formData,
  updateField,
  toggleArrayField,
  has,
}: {
  formData: FormData;
  updateField: (f: keyof FormData, v: any) => void;
  toggleArrayField: (
    f: "investmentFocus" | "preferredLanes" | "sourceOfFunds",
    v: string,
  ) => void;
  has: (f: string) => boolean;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary-950 mb-2">
          Suitability &amp; Risk Assessment
        </h2>
        <p className="text-gray-600">
          Accredited ≠ suitable. This assesses your risk tolerance and
          regulatory posture.
        </p>
      </div>

      {/* Risk Profile */}
      <div className="space-y-5 p-6 bg-gray-50 rounded-lg">
        <p className="font-semibold text-gray-900">Risk Profile</p>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Risk Tolerance <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.riskTolerance}
            onChange={(e) => updateField("riskTolerance", e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none ${has("riskTolerance") ? "border-red-400 ring-2 ring-red-200" : "border-gray-300"}`}
          >
            {riskToleranceOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {has("riskTolerance") && (
            <p className="text-xs text-red-500 mt-1">Required</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            General Investment Experience{" "}
            <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.generalExperience}
            onChange={(e) => updateField("generalExperience", e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none ${has("generalExperience") ? "border-red-400 ring-2 ring-red-200" : "border-gray-300"}`}
          >
            {experienceOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {has("generalExperience") && (
            <p className="text-xs text-red-500 mt-1">Required</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Private Market Experience
          </label>
          <select
            value={formData.privateMarketExperience}
            onChange={(e) =>
              updateField("privateMarketExperience", e.target.value)
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
          >
            {privateExperienceOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Illiquidity Comfort 1-5 */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Illiquidity Comfort <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-600 mb-3">
            How comfortable are you with investments that cannot be easily sold
            for 3-7+ years?
          </p>
          {has("illiquidityComfort") && (
            <p className="text-xs text-red-500 mb-2">Please select a rating</p>
          )}
          <div className="flex gap-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => updateField("illiquidityComfort", n)}
                className={`flex-1 py-3 rounded-lg border-2 font-semibold text-sm transition-all ${
                  formData.illiquidityComfort === n
                    ? "border-primary-950 bg-primary-950 text-white"
                    : has("illiquidityComfort")
                      ? "border-red-300 bg-red-50 text-gray-700"
                      : "border-gray-200 text-gray-700 hover:border-gray-400"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-500">Very uncomfortable</span>
            <span className="text-xs text-gray-500">Very comfortable</span>
          </div>
        </div>

        {/* Total Loss */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Can you absorb a total loss of your investment?{" "}
            <span className="text-red-500">*</span>
          </label>
          {has("canAbsorbTotalLoss") && (
            <p className="text-xs text-red-500 mb-2">Required</p>
          )}
          <div className="flex gap-3">
            {["yes", "no"].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => updateField("canAbsorbTotalLoss", v)}
                className={`flex-1 py-3 rounded-lg border-2 font-semibold text-sm transition-all capitalize ${
                  formData.canAbsorbTotalLoss === v
                    ? "border-primary-950 bg-primary-950 text-white"
                    : has("canAbsorbTotalLoss")
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200 hover:border-gray-400"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Source of Funds & AML */}
      <div className="space-y-5 p-6 bg-gray-50 rounded-lg">
        <p className="font-semibold text-gray-900">Source of Funds &amp; AML</p>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Source of Funds <span className="text-red-500">*</span>
          </label>
          {has("sourceOfFunds") && (
            <p className="text-xs text-red-500 mb-2">Select at least one</p>
          )}
          <div className="grid grid-cols-2 gap-2">
            {sourceOfFundsOptions.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => toggleArrayField("sourceOfFunds", s.value)}
                className={`px-3 py-2.5 rounded-lg border text-xs font-medium text-left transition-all ${
                  formData.sourceOfFunds.includes(s.value)
                    ? "border-primary-950 bg-primary-950 text-white"
                    : has("sourceOfFunds")
                      ? "border-red-300 bg-red-50 text-gray-700"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* PEP */}
        <div>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={formData.politicallyExposed}
              onChange={(e) =>
                updateField("politicallyExposed", e.target.checked)
              }
              className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-600 mt-0.5"
            />
            <div>
              <span className="text-sm font-semibold text-gray-900 block">
                Politically Exposed Person (PEP)
              </span>
              <span className="text-xs text-gray-600">
                Are you or any close family member a senior political figure,
                government official, or state-enterprise executive?
              </span>
            </div>
          </label>
          {formData.politicallyExposed && (
            <input
              type="text"
              value={formData.politicallyExposedDetails}
              onChange={(e) =>
                updateField("politicallyExposedDetails", e.target.value)
              }
              className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
              placeholder="Please provide details (role, country, relationship)"
            />
          )}
        </div>

        {/* Regulatory Restrictions */}
        <div>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={formData.regulatoryRestrictions}
              onChange={(e) =>
                updateField("regulatoryRestrictions", e.target.checked)
              }
              className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-600 mt-0.5"
            />
            <div>
              <span className="text-sm font-semibold text-gray-900 block">
                Regulatory restrictions
              </span>
              <span className="text-xs text-gray-600">
                Are you subject to any regulatory restrictions that would limit
                your ability to invest in private securities?
              </span>
            </div>
          </label>
          {formData.regulatoryRestrictions && (
            <input
              type="text"
              value={formData.regulatoryRestrictionsDetails}
              onChange={(e) =>
                updateField("regulatoryRestrictionsDetails", e.target.value)
              }
              className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
              placeholder="Please describe the restrictions"
            />
          )}
        </div>
      </div>

      {/* Affiliations */}
      <div className="space-y-5 p-6 bg-gray-50 rounded-lg">
        <p className="font-semibold text-gray-900">Affiliations</p>

        <div>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={formData.brokerAffiliated}
              onChange={(e) =>
                updateField("brokerAffiliated", e.target.checked)
              }
              className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-600 mt-0.5"
            />
            <div>
              <span className="text-sm font-semibold text-gray-900 block">
                Broker-dealer affiliation
              </span>
              <span className="text-xs text-gray-600">
                Are you affiliated with a broker-dealer, exchange, or financial
                regulatory authority?
              </span>
            </div>
          </label>
          {formData.brokerAffiliated && (
            <input
              type="text"
              value={formData.brokerDetails}
              onChange={(e) => updateField("brokerDetails", e.target.value)}
              className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
              placeholder="Broker-dealer name and relationship"
            />
          )}
        </div>

        <div>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={formData.seniorOfficer}
              onChange={(e) => updateField("seniorOfficer", e.target.checked)}
              className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-600 mt-0.5"
            />
            <div>
              <span className="text-sm font-semibold text-gray-900 block">
                Senior officer / director / 10%+ shareholder
              </span>
              <span className="text-xs text-gray-600">
                Of any private or public company?
              </span>
            </div>
          </label>
          {formData.seniorOfficer && (
            <input
              type="text"
              value={formData.seniorOfficerCompany}
              onChange={(e) =>
                updateField("seniorOfficerCompany", e.target.value)
              }
              className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
              placeholder="Company name"
            />
          )}
        </div>
      </div>

      {/* Trusted Contact */}
      <div className="space-y-4 p-6 bg-gray-50 rounded-lg">
        <div>
          <p className="font-semibold text-gray-900">Trusted Contact</p>
          <p className="text-xs text-gray-600 mt-1">
            A person we may contact in limited circumstances regarding your
            account. They will not have authority over your account.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Name</label>
            <input
              type="text"
              value={formData.trustedContactName}
              onChange={(e) =>
                updateField("trustedContactName", e.target.value)
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
              placeholder="Full name"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Email</label>
            <input
              type="email"
              value={formData.trustedContactEmail}
              onChange={(e) =>
                updateField("trustedContactEmail", e.target.value)
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Phone</label>
            <input
              type="tel"
              value={formData.trustedContactPhone}
              onChange={(e) =>
                updateField("trustedContactPhone", e.target.value)
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Relationship
            </label>
            <input
              type="text"
              value={formData.trustedContactRelationship}
              onChange={(e) =>
                updateField("trustedContactRelationship", e.target.value)
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
              placeholder="e.g. Spouse, Parent"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 5: INVESTMENT PREFERENCES
// ============================================================================

function Step5Preferences({
  formData,
  updateField,
  toggleArrayField,
  has,
}: {
  formData: FormData;
  updateField: (f: keyof FormData, v: any) => void;
  toggleArrayField: (
    f: "investmentFocus" | "preferredLanes" | "sourceOfFunds",
    v: string,
  ) => void;
  has: (f: string) => boolean;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary-950 mb-2">
          Investment Preferences
        </h2>
        <p className="text-gray-600">
          Now that you're qualified — what are you looking for?
        </p>
      </div>

      {/* Sectors */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Sectors of Interest <span className="text-red-500">*</span>
        </label>
        {has("investmentFocus") && (
          <p className="text-xs text-red-500 mb-2">Select at least one</p>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {sectorOptions.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => toggleArrayField("investmentFocus", s.value)}
              className={`px-4 py-3 rounded-lg border-2 text-sm font-medium text-left transition-all ${
                formData.investmentFocus.includes(s.value)
                  ? "border-primary-950 bg-primary-950 text-white"
                  : has("investmentFocus")
                    ? "border-red-300 bg-red-50 text-gray-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lanes */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Preferred Investment Lanes <span className="text-red-500">*</span>
        </label>
        {has("preferredLanes") && (
          <p className="text-xs text-red-500 mb-2">Select at least one</p>
        )}
        <div className="space-y-3">
          {laneOptions.map((l) => (
            <button
              key={l.value}
              type="button"
              onClick={() => toggleArrayField("preferredLanes", l.value)}
              className={`w-full px-5 py-4 rounded-lg border-2 text-left transition-all ${
                formData.preferredLanes.includes(l.value)
                  ? "border-primary-950 bg-primary-950/5"
                  : has("preferredLanes")
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200 bg-white hover:border-gray-400"
              }`}
            >
              <p
                className={`font-semibold text-sm ${formData.preferredLanes.includes(l.value) ? "text-primary-950" : "text-gray-900"}`}
              >
                {l.label}
              </p>
              <p className="text-xs text-gray-600 mt-1">{l.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Check Sizes */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Minimum Check Size
          </label>
          <select
            value={formData.minimumCheckSize}
            onChange={(e) => updateField("minimumCheckSize", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
          >
            {checkSizeOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Maximum Check Size
          </label>
          <select
            value={formData.maximumCheckSize}
            onChange={(e) => updateField("maximumCheckSize", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
          >
            {checkSizeOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Holding Period */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Desired Holding Period <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.holdingPeriod}
          onChange={(e) => updateField("holdingPeriod", e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none ${has("holdingPeriod") ? "border-red-400 ring-2 ring-red-200" : "border-gray-300"}`}
        >
          {holdingPeriodOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {has("holdingPeriod") && (
          <p className="text-xs text-red-500 mt-1">Required</p>
        )}
      </div>

      {/* Liquidity */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Liquidity Needs <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.liquidityNeeds}
          onChange={(e) => updateField("liquidityNeeds", e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none ${has("liquidityNeeds") ? "border-red-400 ring-2 ring-red-200" : "border-gray-300"}`}
        >
          {liquidityOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {has("liquidityNeeds") && (
          <p className="text-xs text-red-500 mt-1">Required</p>
        )}
      </div>

      {/* Investment Horizon */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Investment Horizon <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.investmentHorizon}
          onChange={(e) => updateField("investmentHorizon", e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none ${has("investmentHorizon") ? "border-red-400 ring-2 ring-red-200" : "border-gray-300"}`}
        >
          {investmentHorizonOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {has("investmentHorizon") && (
          <p className="text-xs text-red-500 mt-1">Required</p>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// STEP 6: RISK ACKNOWLEDGEMENT
// ============================================================================

function Step6RiskAck({
  formData,
  updateField,
  has,
  validationErrors,
}: {
  formData: FormData;
  updateField: (f: keyof FormData, v: any) => void;
  has: (f: string) => boolean;
  validationErrors: string[];
}) {
  const items = [
    {
      field: "acknowledgePrivatePlacement" as keyof FormData,
      title: "Private securities",
      desc: "I understand that investments on Capvista are private placements and are not registered with any securities regulatory authority.",
    },
    {
      field: "acknowledgeIlliquidity" as keyof FormData,
      title: "Illiquidity risk",
      desc: "I understand that private market investments are illiquid. I may not be able to sell or transfer my investment for an extended period.",
    },
    {
      field: "acknowledgeLossRisk" as keyof FormData,
      title: "Risk of total loss",
      desc: "I understand that investing in private companies carries significant risk, including the potential for total loss of invested capital.",
    },
    {
      field: "acknowledgeNotAdvisor" as keyof FormData,
      title: "Capvista is not an advisor",
      desc: "I understand that Capvista does not provide investment advice. All investment decisions are my own and made at my own risk.",
    },
    {
      field: "acknowledgeNoGuarantee" as keyof FormData,
      title: "No guaranteed returns",
      desc: "I understand that Capvista does not guarantee any returns. All projected returns are estimates and actual performance may differ materially.",
    },
    {
      field: "acknowledgeAccreditedStatus" as keyof FormData,
      title: "Investor qualification",
      desc: "I confirm that I meet the qualifications of a qualified/accredited/sophisticated investor as defined by applicable securities regulations in my jurisdiction.",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary-950 mb-2">
          Risk Acknowledgement
        </h2>
        <p className="text-gray-600">
          Please read and acknowledge each statement. This is required before
          you can invest.
        </p>
      </div>

      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
          You must accept all acknowledgements to proceed
        </div>
      )}

      <div className="space-y-3">
        {items.map(({ field, title, desc }) => (
          <div
            key={field}
            className={`flex items-start gap-3 p-4 rounded-lg transition-all ${
              has(field)
                ? "bg-red-50 border border-red-300"
                : formData[field]
                  ? "bg-green-50 border border-green-200"
                  : "bg-white border border-gray-200"
            }`}
          >
            <input
              type="checkbox"
              checked={formData[field] as boolean}
              onChange={(e) => updateField(field, e.target.checked)}
              className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-600 mt-1 shrink-0"
            />
            <div>
              <p className="text-sm font-semibold text-gray-900">{title}</p>
              <p className="text-xs text-gray-600 mt-1">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-900">
          <strong>Electronic Signature:</strong> By checking the boxes above and
          clicking "Complete Profile", you are electronically signing this
          agreement. Your signature will be recorded with a timestamp and your
          IP address.
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 7: REVIEW & SUBMIT
// ============================================================================

function Step7Review({ formData }: { formData: FormData }) {
  const accreditation = getAccreditationForCountry(formData.countryOfResidence);
  const selectedOption = accreditation.options.find(
    (o) => o.value === formData.accreditationBasis,
  );
  const region = getRegion(formData.countryOfResidence);

  const labels: Record<string, string> = {
    INDIVIDUAL: "Individual Investor",
    ANGEL: "Angel Investor",
    FAMILY_OFFICE: "Family Office",
    VC_FUND: "VC Fund",
    CORPORATE: "Corporate",
    INSTITUTIONAL: "Institutional",
    conservative: "Conservative",
    moderate: "Moderate",
    higher: "Higher",
    aggressive: "Aggressive",
    none: "None",
    limited: "Limited",
    extensive: "Extensive",
    some: "Some",
    experienced: "Experienced",
    very_experienced: "Very experienced",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary-950 mb-2">
          Review &amp; Submit
        </h2>
        <p className="text-gray-600">
          Please review your information before completing your profile
        </p>
      </div>

      {/* Identity */}
      <div className="p-6 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-3">
          Identity &amp; Jurisdiction
        </h3>
        <dl className="grid md:grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-gray-600">Country</dt>
            <dd className="font-medium text-gray-900">
              {formData.countryOfResidence}
            </dd>
          </div>
          <div>
            <dt className="text-gray-600">Name</dt>
            <dd className="font-medium text-gray-900">
              {formData.fullName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-gray-600">Date of Birth</dt>
            <dd className="font-medium text-gray-900">
              {formData.dateOfBirth || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-gray-600">Phone</dt>
            <dd className="font-medium text-gray-900">
              {formData.phone || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-gray-600">City</dt>
            <dd className="font-medium text-gray-900">
              {formData.city || "-"}
            </dd>
          </div>
          {region === "nigeria" && (
            <div>
              <dt className="text-gray-600">NIN</dt>
              <dd className="font-medium text-gray-900">
                {formData.nin ? "***" + formData.nin.slice(-4) : "-"}
              </dd>
            </div>
          )}
          {region === "us" && (
            <div>
              <dt className="text-gray-600">SSN</dt>
              <dd className="font-medium text-gray-900">
                {formData.ssn ? "***-**-" + formData.ssn.slice(-4) : "-"}
              </dd>
            </div>
          )}
          <div>
            <dt className="text-gray-600">ID Type</dt>
            <dd className="font-medium text-gray-900">
              {formData.idType || "-"}
            </dd>
          </div>
        </dl>
      </div>

      {/* Investor Profile */}
      <div className="p-6 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-3">Investor Profile</h3>
        <dl className="grid md:grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-gray-600">Type</dt>
            <dd className="font-medium text-gray-900">
              {labels[formData.investorType] || "-"}
            </dd>
          </div>
          {formData.firmName && (
            <div>
              <dt className="text-gray-600">Firm</dt>
              <dd className="font-medium text-gray-900">{formData.firmName}</dd>
            </div>
          )}
          {formData.investorTitle && (
            <div>
              <dt className="text-gray-600">Title</dt>
              <dd className="font-medium text-gray-900">
                {formData.investorTitle}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Qualification */}
      <div className="p-6 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-3">
          Qualification — {accreditation.localTerm}
        </h3>
        <p className="text-sm text-gray-900 font-medium">
          {selectedOption?.label || "-"}
        </p>
        <p className="text-xs text-gray-600 mt-1">
          Regulator: {accreditation.regulator}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-green-600">✓</span>
          <span className="text-xs text-green-900 font-semibold">
            Self-certified
          </span>
        </div>
      </div>

      {/* Suitability */}
      <div className="p-6 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-3">Suitability</h3>
        <dl className="grid md:grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-gray-600">Risk Tolerance</dt>
            <dd className="font-medium text-gray-900">
              {labels[formData.riskTolerance] || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-gray-600">Experience</dt>
            <dd className="font-medium text-gray-900">
              {labels[formData.generalExperience] || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-gray-600">Illiquidity Comfort</dt>
            <dd className="font-medium text-gray-900">
              {formData.illiquidityComfort}/5
            </dd>
          </div>
          <div>
            <dt className="text-gray-600">Can Absorb Total Loss</dt>
            <dd className="font-medium text-gray-900 capitalize">
              {formData.canAbsorbTotalLoss || "-"}
            </dd>
          </div>
          {formData.politicallyExposed && (
            <div>
              <dt className="text-gray-600">PEP Status</dt>
              <dd className="font-medium text-red-600">
                Yes — {formData.politicallyExposedDetails}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Preferences */}
      <div className="p-6 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-3">
          Investment Preferences
        </h3>
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-gray-600">Sectors</dt>
            <dd className="flex flex-wrap gap-2 mt-1">
              {formData.investmentFocus.map((s) => (
                <span
                  key={s}
                  className="px-2 py-1 bg-white border border-gray-200 rounded text-xs"
                >
                  {s}
                </span>
              ))}
            </dd>
          </div>
          <div>
            <dt className="text-gray-600">Lanes</dt>
            <dd className="flex gap-2 mt-1">
              {formData.preferredLanes.map((l) => (
                <span
                  key={l}
                  className="px-2 py-1 bg-white border border-gray-200 rounded text-xs"
                >
                  {l === "YIELD" ? "Yield" : "Ventures"}
                </span>
              ))}
            </dd>
          </div>
        </dl>
      </div>

      {/* Risk Ack Summary */}
      <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-green-600 text-xl mt-0.5">✓</span>
          <div>
            <p className="text-sm font-semibold text-green-900">
              All risk acknowledgements accepted
            </p>
            <p className="text-xs text-green-700 mt-1">
              Your profile will be reviewed by compliance. Status:{" "}
              <strong>Pending Review</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
