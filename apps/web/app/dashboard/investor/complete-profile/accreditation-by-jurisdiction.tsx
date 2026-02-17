// ============================================================================
// JURISDICTION-BASED ACCREDITATION ENGINE
// ============================================================================
// Drop this into your complete-profile/page.tsx to replace the static
// accreditationOptions array. The accreditation step now adapts based on
// the investor's countryOfResidence selected in Step 4 (Identity).
//
// Usage:
//   1. Replace the old `accreditationOptions` constant
//   2. Replace the accreditation <select> in Step3Suitability with the
//      new <AccreditationSection /> component below
//   3. Add `accreditationEvidence` field to FormData
// ============================================================================

// ---------------------------------------------------------------------------
// 1. ADD THESE TO YOUR FormData TYPE
// ---------------------------------------------------------------------------
// accreditationBasis: string;        ← already exists
// accreditationEvidence: string[];   ← ADD THIS (for multi-select evidence)

// ---------------------------------------------------------------------------
// 2. JURISDICTION DEFINITIONS
// ---------------------------------------------------------------------------

export type JurisdictionKey =
  | "US"
  | "UK"
  | "NG" // Nigeria
  | "EU" // EU / MiFID II countries
  | "CA" // Canada
  | "AU" // Australia
  | "SG" // Singapore
  | "AE" // UAE
  | "ZA" // South Africa
  | "KE" // Kenya
  | "GH" // Ghana
  | "IN" // India
  | "HK" // Hong Kong
  | "NZ" // New Zealand
  | "BR" // Brazil
  | "IL" // Israel
  | "JP" // Japan
  | "OTHER";

// Map country names (from your countryOptions) → jurisdiction key
export const countryToJurisdiction: Record<string, JurisdictionKey> = {
  "United States": "US",
  "United Kingdom": "UK",
  Nigeria: "NG",
  Ghana: "GH",
  Kenya: "KE",
  "South Africa": "ZA",
  Rwanda: "NG", // Use Nigeria/Capvista standard for other African nations
  Egypt: "NG",
  Tanzania: "NG",
  Uganda: "NG",
  Ethiopia: "NG",
  Senegal: "NG",
  Morocco: "NG",
  Mauritius: "NG",
  Germany: "EU",
  France: "EU",
  Netherlands: "EU",
  Canada: "CA",
  UAE: "AE",
  Singapore: "SG",
  India: "IN",
  Australia: "AU",
  Other: "OTHER",
};

export function getJurisdiction(country: string): JurisdictionKey {
  return countryToJurisdiction[country] || "OTHER";
}

// ---------------------------------------------------------------------------
// 3. ACCREDITATION OPTIONS BY JURISDICTION
// ---------------------------------------------------------------------------

export interface AccreditationOption {
  value: string;
  label: string;
  description?: string;
}

export interface JurisdictionAccreditation {
  localTerm: string; // What the jurisdiction calls it
  regulator: string; // Governing body
  regulatoryBasis: string; // Law / regulation reference
  options: AccreditationOption[];
  evidenceTypes: AccreditationOption[]; // What docs they need to provide
  notes?: string; // Extra info shown to user
}

export const accreditationByJurisdiction: Record<
  JurisdictionKey,
  JurisdictionAccreditation
> = {
  // =========================================================================
  // UNITED STATES — SEC Rule 501(a) of Regulation D
  // =========================================================================
  US: {
    localTerm: "Accredited Investor",
    regulator: "Securities and Exchange Commission (SEC)",
    regulatoryBasis: "Rule 501(a) of Regulation D, Securities Act of 1933",
    options: [
      {
        value: "us_income_individual",
        label: "Individual income over $200,000",
        description:
          "Earned income exceeding $200,000 in each of the prior two years, with reasonable expectation of the same this year",
      },
      {
        value: "us_income_joint",
        label: "Joint income over $300,000",
        description:
          "Combined income with spouse/partner exceeding $300,000 in each of the prior two years, with reasonable expectation of the same this year",
      },
      {
        value: "us_net_worth",
        label: "Net worth over $1,000,000",
        description:
          "Individual or joint net worth (with spouse/partner) exceeds $1,000,000, excluding primary residence",
      },
      {
        value: "us_professional_license",
        label: "Licensed securities professional",
        description:
          "Hold in good standing a Series 7, Series 65, or Series 82 license",
      },
      {
        value: "us_entity_assets",
        label: "Entity with $5M+ in assets",
        description:
          "Corporation, LLC, partnership, or trust with total assets exceeding $5,000,000, not formed specifically to acquire the securities",
      },
      {
        value: "us_knowledgeable_employee",
        label: "Knowledgeable employee of a private fund",
        description:
          "Executive officer, director, trustee, general partner, or person serving in a similar capacity for the fund",
      },
      {
        value: "us_family_office",
        label: "Family office with $5M+ in AUM",
        description:
          "Family office with assets under management exceeding $5,000,000 and its family clients",
      },
      {
        value: "us_investment_adviser",
        label: "Registered investment adviser",
        description:
          "SEC-registered or state-registered investment adviser, or exempt reporting adviser",
      },
      {
        value: "us_not_accredited",
        label: "I do not meet accredited investor criteria",
        description: "I do not currently meet any of the above criteria",
      },
    ],
    evidenceTypes: [
      {
        value: "tax_returns",
        label: "Tax returns (W-2, 1099, 1040) for prior 2 years",
      },
      {
        value: "bank_statements",
        label: "Bank/brokerage statements (within 3 months)",
      },
      {
        value: "credit_report",
        label: "Credit report from a nationwide agency",
      },
      {
        value: "cpa_letter",
        label: "Written confirmation from CPA, attorney, or broker-dealer",
      },
      {
        value: "license_verification",
        label: "FINRA license verification (Series 7, 65, or 82)",
      },
      {
        value: "third_party_verification",
        label: "Third-party accreditation verification letter",
      },
    ],
    notes:
      "Under Rule 506(c), issuers must take 'reasonable steps to verify' accredited investor status. Self-certification alone is not sufficient for 506(c) offerings.",
  },

  // =========================================================================
  // UNITED KINGDOM — FCA Financial Promotion Order 2005
  // =========================================================================
  UK: {
    localTerm: "High Net Worth / Sophisticated Investor",
    regulator: "Financial Conduct Authority (FCA)",
    regulatoryBasis:
      "Financial Services and Markets Act 2000 (Financial Promotion) Order 2005, as amended March 2024",
    options: [
      {
        value: "uk_hnw_income",
        label: "High net worth — income of £100,000+",
        description:
          "Annual income of at least £100,000 in the last financial year",
      },
      {
        value: "uk_hnw_assets",
        label: "High net worth — net assets of £250,000+",
        description:
          "Net assets of at least £250,000 throughout the last financial year (excluding primary residence, pension, and insurance benefits)",
      },
      {
        value: "uk_self_certified_angel",
        label: "Self-certified sophisticated — angel investor",
        description:
          "Made 2+ investments in unlisted companies in the previous two years",
      },
      {
        value: "uk_self_certified_director",
        label: "Self-certified sophisticated — company director",
        description:
          "Director of a company with annual turnover of at least £1,000,000 in the last 2 years",
      },
      {
        value: "uk_self_certified_network",
        label: "Self-certified sophisticated — business angel network member",
        description:
          "Member of a network of business angels for at least 6 months",
      },
      {
        value: "uk_professional_mifid",
        label: "Professional client (MiFID)",
        description:
          "Meet MiFID II professional client criteria: portfolio >€500,000, 10+ significant trades/quarter, or 1+ year in financial sector",
      },
      {
        value: "uk_not_qualified",
        label: "I do not meet any of the above criteria",
        description: "I do not currently qualify under UK investor exemptions",
      },
    ],
    evidenceTypes: [
      {
        value: "signed_declaration",
        label: "Signed investor declaration (HNW or Sophisticated)",
      },
      {
        value: "income_confirmation",
        label: "Income confirmation (payslips, tax return)",
      },
      {
        value: "asset_confirmation",
        label: "Net asset confirmation (bank/investment statements)",
      },
      {
        value: "company_records",
        label: "Company records (for director criterion)",
      },
      {
        value: "angel_network_confirmation",
        label: "Business angel network membership confirmation",
      },
    ],
    notes:
      "The FCA reinstated the previous lower thresholds in March 2024. Investors must sign a prescribed statement acknowledging reduced protections.",
  },

  // =========================================================================
  // NIGERIA — Capvista Qualified Investor Policy
  // SEC Nigeria Rules 2013 + ISA 2025
  // =========================================================================
  NG: {
    localTerm: "Qualified Investor",
    regulator: "Securities and Exchange Commission Nigeria (SEC Nigeria)",
    regulatoryBasis:
      "SEC Rules 2013, Investments and Securities Act 2025, Capvista Qualified Investor Policy",
    options: [
      {
        value: "ng_institutional",
        label: "Institutional investor",
        description:
          "Bank, insurance company, pension fund, asset manager, or other licensed financial institution",
      },
      {
        value: "ng_hnw_assets",
        label: "High net worth — assets of ₦300M+",
        description:
          "Total assets (excluding primary residence) exceed ₦300,000,000",
      },
      {
        value: "ng_hnw_income",
        label: "High net worth — annual income of ₦30M+",
        description:
          "Annual income exceeds ₦30,000,000 in each of the last two years",
      },
      {
        value: "ng_experience_professional",
        label: "Professional experience in capital markets",
        description:
          "10+ years of experience in investments, fund management, or capital markets advisory",
      },
      {
        value: "ng_investment_experience",
        label: "Demonstrated private investment experience",
        description:
          "Made 3+ private investments (angel, PE, VC) totaling at least ₦50,000,000 in value",
      },
      {
        value: "ng_capvista_qualified",
        label: "Capvista Qualified Investor (self-assessed)",
        description:
          "I have sufficient financial capacity, investment experience, and risk understanding to participate in private placements",
      },
      {
        value: "ng_not_qualified",
        label: "I do not meet any of the above criteria",
        description: "I do not currently qualify as a qualified investor",
      },
    ],
    evidenceTypes: [
      { value: "bank_statements", label: "Bank statements (last 6 months)" },
      { value: "tax_assessment", label: "Tax assessment / FIRS returns" },
      { value: "bvn_verification", label: "BVN-linked asset verification" },
      {
        value: "employer_letter",
        label: "Employment verification / professional credentials",
      },
      {
        value: "investment_records",
        label: "Records of previous private investments",
      },
      {
        value: "signed_declaration",
        label: "Signed Capvista Qualified Investor declaration",
      },
    ],
    notes:
      "Nigeria does not have a statutory 'accredited investor' definition equivalent to the US. Capvista applies its own Qualified Investor Policy based on SEC Nigeria guidelines for private placements to institutional and high-net-worth individuals.",
  },

  // =========================================================================
  // EUROPEAN UNION — MiFID II Professional Client
  // =========================================================================
  EU: {
    localTerm: "Professional Client",
    regulator: "European Securities and Markets Authority (ESMA)",
    regulatoryBasis:
      "Markets in Financial Instruments Directive II (MiFID II), Annex II",
    options: [
      {
        value: "eu_portfolio_size",
        label: "Financial portfolio exceeds €500,000",
        description:
          "Portfolio (cash deposits + financial instruments) exceeds €500,000",
      },
      {
        value: "eu_transaction_frequency",
        label: "Frequent trader — 10+ transactions/quarter",
        description:
          "Carried out transactions of significant size (€50,000+) at avg frequency of 10/quarter over previous 4 quarters",
      },
      {
        value: "eu_financial_sector",
        label: "Financial sector professional",
        description:
          "Worked in the financial sector for 1+ year in a position requiring knowledge of the transactions envisaged",
      },
      {
        value: "eu_institutional",
        label: "Institutional investor",
        description:
          "Credit institution, investment firm, insurance company, pension fund, or other authorized financial entity",
      },
      {
        value: "eu_large_undertaking",
        label: "Large corporate undertaking",
        description:
          "Company meeting 2 of 3: balance sheet total €20M+, net turnover €40M+, own funds €2M+",
      },
      {
        value: "eu_not_qualified",
        label: "I do not meet any of the above criteria",
        description: "I am a retail client under MiFID II",
      },
    ],
    evidenceTypes: [
      {
        value: "portfolio_statements",
        label: "Portfolio/brokerage statements",
      },
      {
        value: "transaction_records",
        label: "Transaction records (last 12 months)",
      },
      {
        value: "employment_records",
        label: "Employment records in financial sector",
      },
      {
        value: "signed_declaration",
        label: "Written declaration of professional client status",
      },
    ],
    notes:
      "Under MiFID II, individuals must meet at least 2 of 3 quantitative criteria (portfolio, transactions, experience) to qualify as an 'elective professional client'. Professional status reduces regulatory protections.",
  },

  // =========================================================================
  // CANADA — National Instrument 45-106
  // =========================================================================
  CA: {
    localTerm: "Accredited Investor",
    regulator: "Canadian Securities Administrators (CSA)",
    regulatoryBasis: "National Instrument 45-106 Prospectus Exemptions",
    options: [
      {
        value: "ca_net_assets",
        label: "Net assets of CAD $1,000,000+",
        description:
          "Individual (alone or with spouse) with net financial assets exceeding CAD $1,000,000, net of related liabilities",
      },
      {
        value: "ca_income_individual",
        label: "Individual income of CAD $200,000+",
        description:
          "Net income before taxes exceeding CAD $200,000 in each of the 2 most recent calendar years, expecting the same this year",
      },
      {
        value: "ca_income_joint",
        label: "Joint income of CAD $300,000+",
        description:
          "Combined net income with spouse exceeding CAD $300,000 in each of the 2 most recent calendar years",
      },
      {
        value: "ca_net_assets_real",
        label: "Net assets of CAD $5,000,000+",
        description:
          "Individual (alone or with spouse) with net assets of at least CAD $5,000,000 (including real property)",
      },
      {
        value: "ca_registered_adviser",
        label: "Registered adviser or dealer",
        description:
          "Registered under securities legislation as an adviser or dealer",
      },
      {
        value: "ca_not_accredited",
        label: "I do not meet accredited investor criteria",
        description: "I do not currently meet any of the above criteria",
      },
    ],
    evidenceTypes: [
      {
        value: "tax_returns",
        label: "Tax returns / CRA Notice of Assessment (2 years)",
      },
      {
        value: "financial_statements",
        label: "Financial statements / bank records",
      },
      {
        value: "professional_letter",
        label: "Letter from CPA or lawyer confirming status",
      },
    ],
    notes:
      "Some Canadian provinces allow non-accredited investors to invest under the 'offering memorandum' exemption with investment limits.",
  },

  // =========================================================================
  // AUSTRALIA — Corporations Act 2001
  // =========================================================================
  AU: {
    localTerm: "Sophisticated / Wholesale Investor",
    regulator: "Australian Securities and Investments Commission (ASIC)",
    regulatoryBasis: "Corporations Act 2001, Sections 708(8) and 761GA",
    options: [
      {
        value: "au_net_assets",
        label: "Net assets of AUD $2,500,000+",
        description:
          "Certified by a qualified accountant as having net assets of at least AUD $2,500,000",
      },
      {
        value: "au_gross_income",
        label: "Gross income of AUD $250,000+",
        description:
          "Certified by a qualified accountant as having gross income of at least AUD $250,000 per year for each of the last 2 financial years",
      },
      {
        value: "au_professional_investor",
        label: "Professional investor — AUD $10,000,000+ in assets",
        description:
          "Hold an AFSL, or control gross assets of at least AUD $10,000,000",
      },
      {
        value: "au_not_qualified",
        label: "I do not meet sophisticated investor criteria",
        description: "I do not currently meet any of the above criteria",
      },
    ],
    evidenceTypes: [
      {
        value: "accountant_certificate",
        label: "Qualified accountant's certificate (within 6 months)",
      },
      {
        value: "afsl_license",
        label: "Australian Financial Services Licence (AFSL)",
      },
    ],
    notes:
      "Australia distinguishes between 'sophisticated investors' (s 708(8) — for fundraising exemptions) and 'wholesale clients' (s 761GA — for product access). An accountant's certificate is typically required.",
  },

  // =========================================================================
  // SINGAPORE — Securities and Futures Act (SFA)
  // =========================================================================
  SG: {
    localTerm: "Accredited Investor",
    regulator: "Monetary Authority of Singapore (MAS)",
    regulatoryBasis: "Securities and Futures Act (SFA), Section 4A(1)(a)",
    options: [
      {
        value: "sg_net_personal_assets",
        label: "Net personal assets exceeding SGD $2,000,000",
        description:
          "Net personal assets exceed SGD $2,000,000 (primary residence capped at SGD $1,000,000 contribution)",
      },
      {
        value: "sg_financial_assets",
        label: "Net financial assets exceeding SGD $1,000,000",
        description:
          "Financial assets (deposits, investments) net of liabilities exceed SGD $1,000,000",
      },
      {
        value: "sg_income",
        label: "Income of SGD $300,000+ in preceding 12 months",
        description:
          "Income in the preceding 12 months was not less than SGD $300,000 (or foreign currency equivalent)",
      },
      {
        value: "sg_entity",
        label: "Entity with net assets exceeding SGD $10,000,000",
        description:
          "Corporation or other entity with net assets exceeding SGD $10,000,000",
      },
      {
        value: "sg_not_accredited",
        label: "I do not meet accredited investor criteria",
        description: "I do not currently meet any of the above criteria",
      },
    ],
    evidenceTypes: [
      {
        value: "bank_confirmation",
        label: "Bank/financial institution verification letter",
      },
      { value: "singpass", label: "SingPass MyInfo verification" },
      {
        value: "income_documents",
        label: "Income documentation (IR8A, tax assessment)",
      },
    ],
    notes:
      "Singapore requires an active opt-in process. Accredited investors must consent to be treated as such and acknowledge reduced regulatory protections.",
  },

  // =========================================================================
  // UNITED ARAB EMIRATES — SCA / DFSA / ADGM
  // =========================================================================
  AE: {
    localTerm: "Professional Investor / Qualified Investor",
    regulator: "Securities and Commodities Authority (SCA) / DFSA / ADGM FSRA",
    regulatoryBasis:
      "SCA Board Decision No. 13/R.T. of 2021, DFSA Rules, ADGM FSMR",
    options: [
      {
        value: "ae_professional_net_worth",
        label: "Net worth of AED $4,000,000+ (approx USD $1.1M)",
        description:
          "Individual with total net worth (excluding primary residence) of at least AED $4,000,000",
      },
      {
        value: "ae_professional_income",
        label: "Annual income of AED $1,000,000+",
        description:
          "Annual income of at least AED $1,000,000 (approx USD $272,000)",
      },
      {
        value: "ae_institutional",
        label: "Institutional / licensed financial entity",
        description:
          "Licensed financial institution, government entity, or sovereign wealth fund",
      },
      {
        value: "ae_difc_professional",
        label: "DIFC Professional Client",
        description:
          "Meet DFSA professional client criteria within the Dubai International Financial Centre",
      },
      {
        value: "ae_not_qualified",
        label: "I do not meet professional investor criteria",
        description: "I do not currently meet any of the above criteria",
      },
    ],
    evidenceTypes: [
      {
        value: "bank_statements",
        label: "Bank statements / wealth verification",
      },
      {
        value: "income_certificate",
        label: "Income certificate / salary confirmation",
      },
      { value: "license_copy", label: "Financial institution license" },
    ],
    notes:
      "The UAE has multiple regulators (SCA onshore, DFSA in DIFC, FSRA in ADGM). Criteria may vary depending on the regulatory zone. Capvista applies the most widely recognized standard.",
  },

  // =========================================================================
  // SOUTH AFRICA — FSCA
  // =========================================================================
  ZA: {
    localTerm: "Qualified Investor / Sophisticated Investor",
    regulator: "Financial Sector Conduct Authority (FSCA)",
    regulatoryBasis:
      "Financial Markets Act 19 of 2012, Financial Advisory and Intermediary Services Act",
    options: [
      {
        value: "za_investment_minimum",
        label: "Can invest ZAR 1,000,000+ minimum",
        description:
          "Able to commit a minimum investment of ZAR 1,000,000 or more in a single offering",
      },
      {
        value: "za_net_assets",
        label: "Net assets exceeding ZAR 20,000,000",
        description:
          "Total net assets (excluding primary residence) exceed ZAR 20,000,000",
      },
      {
        value: "za_professional_experience",
        label: "Professional financial sector experience",
        description:
          "Work or have worked in financial services, fund management, or capital markets for 5+ years",
      },
      {
        value: "za_institutional",
        label: "Institutional / licensed entity",
        description:
          "Licensed FSP, bank, insurer, pension fund, or regulated collective investment scheme",
      },
      {
        value: "za_not_qualified",
        label: "I do not meet qualified investor criteria",
        description: "I do not currently meet any of the above criteria",
      },
    ],
    evidenceTypes: [
      { value: "bank_statements", label: "Bank/investment statements" },
      { value: "tax_returns", label: "SARS tax returns" },
      {
        value: "professional_credentials",
        label: "Professional credentials / FSP license",
      },
    ],
    notes:
      "South Africa's non-retail hedge fund and private offering access often requires minimum investment thresholds plus experience/capacity assessments.",
  },

  // =========================================================================
  // KENYA — CMA Kenya
  // =========================================================================
  KE: {
    localTerm: "Qualified Investor / Professional Investor",
    regulator: "Capital Markets Authority Kenya (CMA)",
    regulatoryBasis:
      "Capital Markets Act, CMA Guidelines on Collective Investment Schemes",
    options: [
      {
        value: "ke_investment_minimum",
        label: "Can invest KES 10,000,000+ minimum",
        description:
          "Able to commit a minimum investment of KES 10,000,000 or more",
      },
      {
        value: "ke_institutional",
        label: "Institutional investor",
        description:
          "Bank, insurance company, licensed fund manager, pension scheme, or SACCO",
      },
      {
        value: "ke_professional_experience",
        label: "Professional financial experience",
        description:
          "5+ years of professional experience in capital markets, banking, or investment management",
      },
      {
        value: "ke_not_qualified",
        label: "I do not meet qualified investor criteria",
        description: "I do not currently meet any of the above criteria",
      },
    ],
    evidenceTypes: [
      { value: "bank_statements", label: "Bank statements" },
      { value: "kra_pin", label: "KRA PIN / tax records" },
      { value: "professional_credentials", label: "Professional credentials" },
    ],
    notes:
      "Kenya's CMA regulates collective investment schemes and private offerings. Professional investor classification may vary by product type.",
  },

  // =========================================================================
  // GHANA — SEC Ghana
  // =========================================================================
  GH: {
    localTerm: "Qualified Investor",
    regulator: "Securities and Exchange Commission Ghana (SEC Ghana)",
    regulatoryBasis: "Securities Industry Act 2016 (Act 929)",
    options: [
      {
        value: "gh_institutional",
        label: "Institutional investor",
        description:
          "Licensed bank, insurance company, fund manager, pension fund, or other regulated financial institution",
      },
      {
        value: "gh_hnw",
        label: "High net worth individual",
        description:
          "Individual with demonstrable financial capacity and investment experience to participate in private placements",
      },
      {
        value: "gh_professional",
        label: "Professional investor",
        description:
          "Licensed capital market operator or person with substantial investment experience",
      },
      {
        value: "gh_not_qualified",
        label: "I do not meet qualified investor criteria",
        description: "I do not currently meet any of the above criteria",
      },
    ],
    evidenceTypes: [
      { value: "bank_statements", label: "Bank statements" },
      { value: "gra_tax", label: "GRA tax records" },
      {
        value: "professional_credentials",
        label: "Professional credentials / license",
      },
    ],
    notes:
      "Ghana's SEC requires private placements to be offered to qualified investors. Specific thresholds may be defined on a per-offering basis.",
  },

  // =========================================================================
  // INDIA — SEBI
  // =========================================================================
  IN: {
    localTerm: "Accredited Investor",
    regulator: "Securities and Exchange Board of India (SEBI)",
    regulatoryBasis:
      "SEBI (Alternative Investment Funds) Regulations 2012, SEBI Accredited Investor Framework 2021",
    options: [
      {
        value: "in_net_worth_individual",
        label: "Net worth of ₹7.5 crore+ (individual)",
        description:
          "Individual with annual income exceeding ₹2 crore, or net worth exceeding ₹7.5 crore, with at least ₹3.75 crore in financial assets",
      },
      {
        value: "in_income",
        label: "Annual income of ₹2 crore+",
        description:
          "Individual with annual gross income exceeding ₹2 crore (approx USD $240,000)",
      },
      {
        value: "in_combined",
        label: "Combined income + net worth threshold",
        description:
          "Annual income of ₹1 crore+ AND net worth of ₹5 crore+ (with ₹2.5 crore in financial assets)",
      },
      {
        value: "in_trust_entity",
        label: "Trust/entity with net worth ₹50 crore+",
        description: "Trust or entity with net worth exceeding ₹50 crore",
      },
      {
        value: "in_not_accredited",
        label: "I do not meet accredited investor criteria",
        description:
          "I do not currently meet SEBI accredited investor criteria",
      },
    ],
    evidenceTypes: [
      { value: "ca_certificate", label: "Chartered Accountant certificate" },
      { value: "itr", label: "Income Tax Returns (2 years)" },
      { value: "demat_statements", label: "Demat account statements" },
      {
        value: "accreditation_agency",
        label: "SEBI-recognized accreditation agency certificate",
      },
    ],
    notes:
      "SEBI introduced a formal accredited investor framework in 2021. Accreditation is obtained through SEBI-recognized agencies like BSE/NSE subsidiaries.",
  },

  // =========================================================================
  // HONG KONG — SFC
  // =========================================================================
  HK: {
    localTerm: "Professional Investor",
    regulator: "Securities and Futures Commission (SFC)",
    regulatoryBasis:
      "Securities and Futures Ordinance (SFO), Schedule 1, Part 1",
    options: [
      {
        value: "hk_portfolio",
        label: "Portfolio of HKD $8,000,000+",
        description:
          "Individual with a portfolio of not less than HKD $8,000,000 (approx USD $1M)",
      },
      {
        value: "hk_entity",
        label: "Entity with portfolio/assets of HKD $40,000,000+",
        description:
          "Corporation or trust with total assets of not less than HKD $40,000,000",
      },
      {
        value: "hk_institutional",
        label: "Institutional professional investor",
        description:
          "Authorized institution, licensed corporation, registered institution, or regulated CIS",
      },
      {
        value: "hk_not_professional",
        label: "I do not meet professional investor criteria",
        description: "I do not currently meet any of the above criteria",
      },
    ],
    evidenceTypes: [
      {
        value: "portfolio_statements",
        label: "Portfolio/brokerage statements",
      },
      { value: "bank_confirmation", label: "Bank confirmation letter" },
    ],
    notes:
      "Hong Kong defines professional investors primarily by portfolio value. The SFC focuses exclusively on financial asset size rather than income.",
  },

  // =========================================================================
  // NEW ZEALAND — Financial Markets Authority
  // =========================================================================
  NZ: {
    localTerm: "Wholesale / Eligible Investor",
    regulator: "Financial Markets Authority (FMA)",
    regulatoryBasis:
      "Financial Markets Conduct Act 2013, Securities Act 1978 s 5",
    options: [
      {
        value: "nz_net_assets",
        label: "Net assets of NZD $2,000,000+",
        description:
          "Certified by chartered accountant as having net assets of at least NZD $2,000,000",
      },
      {
        value: "nz_gross_income",
        label: "Gross income of NZD $200,000+ for each of last 2 years",
        description:
          "Certified as having annual gross income of at least NZD $200,000 for each of the last 2 financial years",
      },
      {
        value: "nz_eligible_experience",
        label: "Eligible investor by experience",
        description:
          "Investment activity or professional involvement in financial markets demonstrates sufficient experience and sophistication",
      },
      {
        value: "nz_not_qualified",
        label: "I do not meet eligible investor criteria",
        description: "I do not currently meet any of the above criteria",
      },
    ],
    evidenceTypes: [
      {
        value: "accountant_certificate",
        label: "Chartered accountant's certificate (within 12 months)",
      },
      {
        value: "signed_confirmation",
        label: "Signed eligible investor confirmation",
      },
    ],
    notes:
      "New Zealand requires chartered accountant certification for the wealth/income criteria. Eligible investor status requires a satisfactory assessment by the financial adviser.",
  },

  // =========================================================================
  // BRAZIL — CVM
  // =========================================================================
  BR: {
    localTerm: "Investidor Qualificado / Investidor Profissional",
    regulator: "Comissão de Valores Mobiliários (CVM)",
    regulatoryBasis: "CVM Instruction 539, Articles 9-A and 9-B",
    options: [
      {
        value: "br_professional",
        label:
          "Professional investor — BRL $10,000,000+ in financial investments",
        description:
          "Individual or entity with financial investments exceeding BRL $10,000,000",
      },
      {
        value: "br_qualified",
        label: "Qualified investor — BRL $1,000,000+ in financial investments",
        description:
          "Individual or entity with financial investments exceeding BRL $1,000,000",
      },
      {
        value: "br_professional_certification",
        label: "Professional certification holder",
        description:
          "Hold CVM-approved professional certification (CGA, CGE, or equivalent)",
      },
      {
        value: "br_not_qualified",
        label: "I do not meet qualified investor criteria",
        description: "I do not currently meet any of the above criteria",
      },
    ],
    evidenceTypes: [
      {
        value: "investment_statements",
        label: "Investment/brokerage statements",
      },
      { value: "certification_copy", label: "Professional certification copy" },
    ],
    notes:
      "Brazil has two tiers: 'investidor profissional' (higher threshold, equivalent to US accredited) and 'investidor qualificado' (lower threshold, broader access).",
  },

  // =========================================================================
  // ISRAEL — ISA
  // =========================================================================
  IL: {
    localTerm: "Qualified Investor",
    regulator: "Israel Securities Authority (ISA)",
    regulatoryBasis: "Israel Securities Act, First Schedule, Section 15A(b)(1)",
    options: [
      {
        value: "il_liquid_assets",
        label: "Liquid assets of ₪5,900,000+",
        description:
          "Cash, deposits, financial assets, and securities totaling more than ₪5,900,000",
      },
      {
        value: "il_income",
        label: "Annual income of ₪703,000+ (individual) or ₪900,000+ (joint)",
        description:
          "Annual income exceeding ₪703,000 individually or ₪900,000 with spouse for each of the past 2 years",
      },
      {
        value: "il_combined",
        label: "Combined assets + income threshold",
        description:
          "Liquid assets of ₪5,900,000+ AND annual income meeting the threshold above",
      },
      {
        value: "il_not_qualified",
        label: "I do not meet qualified investor criteria",
        description: "I do not currently meet any of the above criteria",
      },
    ],
    evidenceTypes: [
      { value: "bank_statements", label: "Bank/brokerage statements" },
      { value: "tax_returns", label: "Tax authority income verification" },
    ],
    notes:
      "Israel's qualified investor thresholds are periodically updated by the ISA.",
  },

  // =========================================================================
  // JAPAN — JFSA
  // =========================================================================
  JP: {
    localTerm: "Specified Investor (Tokutei Toshika)",
    regulator: "Japan Financial Services Agency (JFSA)",
    regulatoryBasis:
      "Financial Instruments and Exchange Act (FIEA), Article 34-2",
    options: [
      {
        value: "jp_net_assets",
        label: "Net assets of ¥300,000,000+ (approx USD $2M)",
        description: "Individual with net assets exceeding ¥300,000,000",
      },
      {
        value: "jp_financial_assets",
        label: "Financial assets of ¥300,000,000+",
        description:
          "Individual with financial assets (securities, deposits) exceeding ¥300,000,000",
      },
      {
        value: "jp_trading_experience",
        label: "1+ year of securities trading experience",
        description:
          "Account opened for securities trading for at least 1 year",
      },
      {
        value: "jp_institutional",
        label: "Institutional / qualified institutional investor",
        description:
          "Securities company, bank, insurance company, or registered qualified institutional investor",
      },
      {
        value: "jp_not_specified",
        label: "I do not meet specified investor criteria",
        description: "I do not currently meet any of the above criteria",
      },
    ],
    evidenceTypes: [
      {
        value: "financial_statements",
        label: "Financial statements / asset verification",
      },
      { value: "trading_records", label: "Securities account trading records" },
    ],
    notes:
      "Japan allows individuals to 'opt up' to specified investor status with financial assets of ¥300M+ and 1+ year of trading experience. The process requires application to the financial instruments firm.",
  },

  // =========================================================================
  // OTHER / GENERAL FALLBACK
  // =========================================================================
  OTHER: {
    localTerm: "Qualified Investor",
    regulator: "Applicable local securities regulator",
    regulatoryBasis: "Capvista Qualified Investor Policy",
    options: [
      {
        value: "other_hnw",
        label: "High net worth individual",
        description:
          "Net assets (excluding primary residence) exceed USD $1,000,000 or local currency equivalent",
      },
      {
        value: "other_income",
        label: "High income individual",
        description:
          "Annual income exceeds USD $200,000 (or local equivalent) in each of the last 2 years",
      },
      {
        value: "other_institutional",
        label: "Institutional / professional investor",
        description:
          "Licensed financial institution, fund manager, pension fund, or equivalent regulated entity",
      },
      {
        value: "other_professional_experience",
        label: "Professional financial experience",
        description:
          "5+ years of experience in investment management, capital markets, or financial advisory",
      },
      {
        value: "other_self_assessed",
        label: "Self-assessed qualified investor",
        description:
          "I have sufficient financial knowledge, investment experience, and capacity to participate in private placements and understand the associated risks",
      },
      {
        value: "other_not_qualified",
        label: "I do not meet any of the above criteria",
        description:
          "I do not currently meet any recognized investor qualification criteria",
      },
    ],
    evidenceTypes: [
      { value: "bank_statements", label: "Bank/financial statements" },
      { value: "tax_returns", label: "Tax returns / income verification" },
      {
        value: "professional_credentials",
        label: "Professional credentials or certifications",
      },
      { value: "signed_declaration", label: "Signed self-declaration" },
    ],
    notes:
      "Your jurisdiction may have specific investor qualification requirements. Capvista will assess your eligibility based on the information provided and applicable regulations.",
  },
};

// ---------------------------------------------------------------------------
// 4. HELPER FUNCTION
// ---------------------------------------------------------------------------

export function getAccreditationForCountry(
  countryOfResidence: string,
): JurisdictionAccreditation {
  const key = getJurisdiction(countryOfResidence);
  return accreditationByJurisdiction[key];
}

// ---------------------------------------------------------------------------
// 5. REACT COMPONENT — drop into Step 3
// ---------------------------------------------------------------------------
// Replace the static accreditation <select> in Step3Suitability with this:
//
// <AccreditationSection
//   countryOfResidence={formData.countryOfResidence}
//   accreditationBasis={formData.accreditationBasis}
//   onSelect={(value) => updateField("accreditationBasis", value)}
//   has={has}
// />

export function AccreditationSection({
  countryOfResidence,
  accreditationBasis,
  onSelect,
  has,
}: {
  countryOfResidence: string;
  accreditationBasis: string;
  onSelect: (value: string) => void;
  has: (f: string) => boolean;
}) {
  const accreditation = getAccreditationForCountry(countryOfResidence);

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-semibold text-gray-900">
            {accreditation.localTerm} Status
          </label>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {accreditation.regulator}
          </span>
        </div>
        <p className="text-xs text-gray-600 mb-3">
          Based on: {accreditation.regulatoryBasis}
        </p>
      </div>

      <div className="space-y-2">
        {accreditation.options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
              accreditationBasis === option.value
                ? "border-primary-950 bg-primary-950/5"
                : has("accreditationBasis")
                  ? "border-red-300 bg-red-50"
                  : "border-gray-200 bg-white hover:border-gray-400"
            }`}
          >
            <p
              className={`text-sm font-semibold ${
                accreditationBasis === option.value
                  ? "text-primary-950"
                  : "text-gray-900"
              }`}
            >
              {option.label}
            </p>
            {option.description && (
              <p className="text-xs text-gray-600 mt-1">{option.description}</p>
            )}
          </button>
        ))}
      </div>

      {accreditation.notes && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-900">
            <strong>Regulatory note:</strong> {accreditation.notes}
          </p>
        </div>
      )}
    </div>
  );
}
