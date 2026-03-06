"use client";

import { useState, useRef, useEffect, useMemo } from "react";

interface Country {
  flag: string;
  name: string;
  code: string;
}

const COUNTRIES: Country[] = [
  { flag: "\u{1F1F3}\u{1F1EC}", name: "Nigeria", code: "+234" },
  { flag: "\u{1F1FA}\u{1F1F8}", name: "United States", code: "+1" },
  { flag: "\u{1F1EC}\u{1F1E7}", name: "United Kingdom", code: "+44" },
  { flag: "\u{1F1E6}\u{1F1F4}", name: "Angola", code: "+244" },
  { flag: "\u{1F1E6}\u{1F1F7}", name: "Argentina", code: "+54" },
  { flag: "\u{1F1E6}\u{1F1FA}", name: "Australia", code: "+61" },
  { flag: "\u{1F1E6}\u{1F1F9}", name: "Austria", code: "+43" },
  { flag: "\u{1F1E7}\u{1F1ED}", name: "Bahrain", code: "+973" },
  { flag: "\u{1F1E7}\u{1F1E9}", name: "Bangladesh", code: "+880" },
  { flag: "\u{1F1E7}\u{1F1EA}", name: "Belgium", code: "+32" },
  { flag: "\u{1F1E7}\u{1F1EF}", name: "Benin", code: "+229" },
  { flag: "\u{1F1E7}\u{1F1FC}", name: "Botswana", code: "+267" },
  { flag: "\u{1F1E7}\u{1F1F7}", name: "Brazil", code: "+55" },
  { flag: "\u{1F1E7}\u{1F1EB}", name: "Burkina Faso", code: "+226" },
  { flag: "\u{1F1E7}\u{1F1EE}", name: "Burundi", code: "+257" },
  { flag: "\u{1F1E8}\u{1F1F2}", name: "Cameroon", code: "+237" },
  { flag: "\u{1F1E8}\u{1F1E6}", name: "Canada", code: "+1" },
  { flag: "\u{1F1F9}\u{1F1E9}", name: "Chad", code: "+235" },
  { flag: "\u{1F1E8}\u{1F1F3}", name: "China", code: "+86" },
  { flag: "\u{1F1E8}\u{1F1E9}", name: "Congo (DRC)", code: "+243" },
  { flag: "\u{1F1E8}\u{1F1EC}", name: "Congo (Republic)", code: "+242" },
  { flag: "\u{1F1E8}\u{1F1EE}", name: "C\u00f4te d\u2019Ivoire", code: "+225" },
  { flag: "\u{1F1E9}\u{1F1F0}", name: "Denmark", code: "+45" },
  { flag: "\u{1F1E9}\u{1F1EF}", name: "Djibouti", code: "+253" },
  { flag: "\u{1F1EA}\u{1F1EC}", name: "Egypt", code: "+20" },
  { flag: "\u{1F1EC}\u{1F1F6}", name: "Equatorial Guinea", code: "+240" },
  { flag: "\u{1F1EA}\u{1F1F7}", name: "Eritrea", code: "+291" },
  { flag: "\u{1F1EA}\u{1F1F9}", name: "Ethiopia", code: "+251" },
  { flag: "\u{1F1EB}\u{1F1EE}", name: "Finland", code: "+358" },
  { flag: "\u{1F1EB}\u{1F1F7}", name: "France", code: "+33" },
  { flag: "\u{1F1EC}\u{1F1E6}", name: "Gabon", code: "+241" },
  { flag: "\u{1F1EC}\u{1F1F2}", name: "Gambia", code: "+220" },
  { flag: "\u{1F1E9}\u{1F1EA}", name: "Germany", code: "+49" },
  { flag: "\u{1F1EC}\u{1F1ED}", name: "Ghana", code: "+233" },
  { flag: "\u{1F1EC}\u{1F1F3}", name: "Guinea", code: "+224" },
  { flag: "\u{1F1ED}\u{1F1F0}", name: "Hong Kong", code: "+852" },
  { flag: "\u{1F1EE}\u{1F1F3}", name: "India", code: "+91" },
  { flag: "\u{1F1EE}\u{1F1E9}", name: "Indonesia", code: "+62" },
  { flag: "\u{1F1EE}\u{1F1EA}", name: "Ireland", code: "+353" },
  { flag: "\u{1F1EE}\u{1F1F1}", name: "Israel", code: "+972" },
  { flag: "\u{1F1EE}\u{1F1F9}", name: "Italy", code: "+39" },
  { flag: "\u{1F1EF}\u{1F1F5}", name: "Japan", code: "+81" },
  { flag: "\u{1F1EF}\u{1F1F4}", name: "Jordan", code: "+962" },
  { flag: "\u{1F1F0}\u{1F1EA}", name: "Kenya", code: "+254" },
  { flag: "\u{1F1F0}\u{1F1FC}", name: "Kuwait", code: "+965" },
  { flag: "\u{1F1F1}\u{1F1F7}", name: "Liberia", code: "+231" },
  { flag: "\u{1F1F1}\u{1F1FE}", name: "Libya", code: "+218" },
  { flag: "\u{1F1F2}\u{1F1EC}", name: "Madagascar", code: "+261" },
  { flag: "\u{1F1F2}\u{1F1FC}", name: "Malawi", code: "+265" },
  { flag: "\u{1F1F2}\u{1F1FE}", name: "Malaysia", code: "+60" },
  { flag: "\u{1F1F2}\u{1F1F1}", name: "Mali", code: "+223" },
  { flag: "\u{1F1F2}\u{1F1F7}", name: "Mauritania", code: "+222" },
  { flag: "\u{1F1F2}\u{1F1FA}", name: "Mauritius", code: "+230" },
  { flag: "\u{1F1F2}\u{1F1FD}", name: "Mexico", code: "+52" },
  { flag: "\u{1F1F2}\u{1F1E6}", name: "Morocco", code: "+212" },
  { flag: "\u{1F1F2}\u{1F1FF}", name: "Mozambique", code: "+258" },
  { flag: "\u{1F1F3}\u{1F1E6}", name: "Namibia", code: "+264" },
  { flag: "\u{1F1F3}\u{1F1F1}", name: "Netherlands", code: "+31" },
  { flag: "\u{1F1F3}\u{1F1FF}", name: "New Zealand", code: "+64" },
  { flag: "\u{1F1F3}\u{1F1EA}", name: "Niger", code: "+227" },
  { flag: "\u{1F1F3}\u{1F1F4}", name: "Norway", code: "+47" },
  { flag: "\u{1F1F4}\u{1F1F2}", name: "Oman", code: "+968" },
  { flag: "\u{1F1F5}\u{1F1F0}", name: "Pakistan", code: "+92" },
  { flag: "\u{1F1F5}\u{1F1ED}", name: "Philippines", code: "+63" },
  { flag: "\u{1F1F5}\u{1F1F1}", name: "Poland", code: "+48" },
  { flag: "\u{1F1F5}\u{1F1F9}", name: "Portugal", code: "+351" },
  { flag: "\u{1F1F6}\u{1F1E6}", name: "Qatar", code: "+974" },
  { flag: "\u{1F1F7}\u{1F1FC}", name: "Rwanda", code: "+250" },
  { flag: "\u{1F1F8}\u{1F1E6}", name: "Saudi Arabia", code: "+966" },
  { flag: "\u{1F1F8}\u{1F1F3}", name: "Senegal", code: "+221" },
  { flag: "\u{1F1F8}\u{1F1EC}", name: "Singapore", code: "+65" },
  { flag: "\u{1F1F8}\u{1F1F1}", name: "Sierra Leone", code: "+232" },
  { flag: "\u{1F1F8}\u{1F1F4}", name: "Somalia", code: "+252" },
  { flag: "\u{1F1FF}\u{1F1E6}", name: "South Africa", code: "+27" },
  { flag: "\u{1F1F0}\u{1F1F7}", name: "South Korea", code: "+82" },
  { flag: "\u{1F1EA}\u{1F1F8}", name: "Spain", code: "+34" },
  { flag: "\u{1F1F8}\u{1F1E9}", name: "Sudan", code: "+249" },
  { flag: "\u{1F1F8}\u{1F1EA}", name: "Sweden", code: "+46" },
  { flag: "\u{1F1E8}\u{1F1ED}", name: "Switzerland", code: "+41" },
  { flag: "\u{1F1F9}\u{1F1FF}", name: "Tanzania", code: "+255" },
  { flag: "\u{1F1F9}\u{1F1ED}", name: "Thailand", code: "+66" },
  { flag: "\u{1F1F9}\u{1F1EC}", name: "Togo", code: "+228" },
  { flag: "\u{1F1F9}\u{1F1F3}", name: "Tunisia", code: "+216" },
  { flag: "\u{1F1F9}\u{1F1F7}", name: "Turkey", code: "+90" },
  { flag: "\u{1F1FA}\u{1F1EC}", name: "Uganda", code: "+256" },
  { flag: "\u{1F1E6}\u{1F1EA}", name: "UAE", code: "+971" },
  { flag: "\u{1F1FB}\u{1F1EA}", name: "Venezuela", code: "+58" },
  { flag: "\u{1F1FB}\u{1F1F3}", name: "Vietnam", code: "+84" },
  { flag: "\u{1F1FF}\u{1F1F2}", name: "Zambia", code: "+260" },
  { flag: "\u{1F1FF}\u{1F1FC}", name: "Zimbabwe", code: "+263" },
];

function parsePhoneValue(value: string, defaultCode: string): { countryCode: string; localNumber: string } {
  if (!value) return { countryCode: defaultCode, localNumber: "" };

  const trimmed = value.trim();
  if (!trimmed.startsWith("+")) return { countryCode: defaultCode, localNumber: trimmed };

  // Try to match the longest country code first (up to 4 digits)
  for (let len = 4; len >= 1; len--) {
    const potentialCode = trimmed.slice(0, trimmed.indexOf(" ") > 0 ? trimmed.indexOf(" ") : undefined);
    const match = COUNTRIES.find((c) => c.code === potentialCode);
    if (match) {
      const rest = trimmed.slice(potentialCode.length).trim();
      return { countryCode: match.code, localNumber: rest };
    }
    // Also try with a space after the code
    if (len < trimmed.length) {
      const codeCandidate = "+" + trimmed.slice(1, 1 + len);
      const matchByLen = COUNTRIES.find((c) => c.code === codeCandidate);
      if (matchByLen) {
        const rest = trimmed.slice(1 + len).trim();
        return { countryCode: matchByLen.code, localNumber: rest };
      }
    }
  }

  return { countryCode: defaultCode, localNumber: trimmed.replace(/^\+\d+\s*/, "") };
}

interface PhoneInputProps {
  value: string;
  onChange: (fullNumber: string) => void;
  defaultCountryCode?: string;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
}

export default function PhoneInput({
  value,
  onChange,
  defaultCountryCode = "+234",
  required = false,
  disabled = false,
  error = false,
}: PhoneInputProps) {
  const parsed = parsePhoneValue(value, defaultCountryCode);
  const [countryCode, setCountryCode] = useState(parsed.countryCode);
  const [localNumber, setLocalNumber] = useState(parsed.localNumber);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync from external value changes
  useEffect(() => {
    const p = parsePhoneValue(value, defaultCountryCode);
    setCountryCode(p.countryCode);
    setLocalNumber(p.localNumber);
  }, [value, defaultCountryCode]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Focus search when dropdown opens
  useEffect(() => {
    if (open) searchInputRef.current?.focus();
  }, [open]);

  const selectedCountry = COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0];

  const filtered = useMemo(() => {
    if (!search) return COUNTRIES;
    const q = search.toLowerCase();
    return COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.includes(q)
    );
  }, [search]);

  function emitChange(code: string, local: string) {
    const combined = local ? `${code} ${local}` : code;
    onChange(combined);
  }

  function selectCountry(c: Country) {
    setCountryCode(c.code);
    setOpen(false);
    setSearch("");
    emitChange(c.code, localNumber);
  }

  function handleLocalChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/[^\d]/g, "");
    setLocalNumber(digits);
    emitChange(countryCode, digits);
  }

  const borderColor = error
    ? "border-red-400 ring-2 ring-red-200"
    : "border-gray-300";

  return (
    <div className="flex" ref={dropdownRef}>
      {/* Country code dropdown */}
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen(!open)}
          className={`flex items-center gap-1 px-3 py-2.5 border ${borderColor} rounded-l-lg bg-white text-[#111827] text-sm h-full min-w-[110px] focus:border-[#0A1F44] focus:ring-1 focus:ring-[#0A1F44] outline-none transition-colors ${
            disabled ? "bg-gray-50 text-gray-500 cursor-not-allowed" : "cursor-pointer hover:bg-gray-50"
          }`}
        >
          <span className="text-base">{selectedCountry.flag}</span>
          <span className="font-medium">{selectedCountry.code}</span>
          <svg className="w-4 h-4 ml-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="p-2 border-b border-gray-100">
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country..."
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md outline-none focus:border-[#0A1F44] focus:ring-1 focus:ring-[#0A1F44]"
              />
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {filtered.length === 0 && (
                <div className="px-3 py-4 text-sm text-gray-500 text-center">No results</div>
              )}
              {filtered.map((c, i) => (
                <button
                  key={`${c.code}-${c.name}-${i}`}
                  type="button"
                  onClick={() => selectCountry(c)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left hover:bg-[#F9FAFB] transition-colors ${
                    c.code === countryCode && c.name === selectedCountry.name ? "bg-[#F9FAFB] font-medium" : ""
                  }`}
                >
                  <span className="text-base">{c.flag}</span>
                  <span className="flex-1 text-[#111827]">{c.name}</span>
                  <span className="text-gray-500">{c.code}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Phone number input */}
      <input
        type="tel"
        value={localNumber}
        onChange={handleLocalChange}
        disabled={disabled}
        required={required}
        placeholder="xxx xxx xxxx"
        className={`flex-1 px-4 py-2.5 border ${borderColor} border-l-0 rounded-r-lg text-[#111827] text-sm outline-none focus:border-[#0A1F44] focus:ring-1 focus:ring-[#0A1F44] transition-colors ${
          disabled ? "bg-gray-50 text-gray-500 cursor-not-allowed" : ""
        }`}
      />
    </div>
  );
}
