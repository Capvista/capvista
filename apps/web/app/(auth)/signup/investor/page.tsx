"use client";

import { useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Lock, TrendingUp, CheckCircle, ChevronDown } from "lucide-react";

const accreditationOptions = [
  "Accredited by Income ($200k+ individual, $300k+ joint)",
  "Accredited by Net Worth ($1M+ excluding primary residence)",
  "Professional Certification (Series 7, 65, or 82)",
  "Entity (Corporation, LLC, Trust with $5M+ assets)",
];

export default function InvestorSignupPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    accreditationStatus: "",
    agreeToTerms: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectOpen, setSelectOpen] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (!formData.agreeToTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy");
      return;
    }

    setLoading(true);

    const { error } = await signUp({
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      role: "INVESTOR",
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard/investor");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0A1F44] to-[#10B981]" />
          <span className="text-2xl font-semibold text-[#0A1F44]">Capvista</span>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 mb-4">
            <TrendingUp className="w-4 h-4 text-[#10B981]" />
            <span className="text-sm font-medium text-[#10B981]">Investor Account</span>
          </div>
          <h1 className="text-3xl font-bold text-[#0A1F44] mb-2">Create your investor account</h1>
          <p className="text-gray-600">Join a curated community of accredited investors</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* First Name + Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-semibold text-gray-900 mb-2">
                First Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent outline-none transition-all"
                  placeholder="John"
                />
              </div>
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-semibold text-gray-900 mb-2">
                Last Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent outline-none transition-all"
                  placeholder="Doe"
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent outline-none transition-all"
                placeholder="you@company.com"
              />
            </div>
          </div>

          {/* Accreditation Status */}
          <div>
            <label htmlFor="accreditationStatus" className="block text-sm font-semibold text-gray-900 mb-2">
              Accreditation Status
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setSelectOpen(!selectOpen)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left focus:ring-2 focus:ring-[#10B981] focus:border-transparent outline-none transition-all flex items-center justify-between"
              >
                <span className={formData.accreditationStatus ? "text-gray-900" : "text-gray-400"}>
                  {formData.accreditationStatus || "Select your accreditation status"}
                </span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${selectOpen ? "rotate-180" : ""}`} />
              </button>
              {selectOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  {accreditationOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, accreditationStatus: option });
                        setSelectOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-[#10B981]/5 hover:text-[#10B981] transition-colors"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="mt-1.5 text-xs text-gray-500">
              Verification will be required before making investments
            </p>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-900 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start gap-3">
            <input
              id="agreeToTerms"
              type="checkbox"
              checked={formData.agreeToTerms}
              onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-[#10B981] focus:ring-[#10B981]"
            />
            <label htmlFor="agreeToTerms" className="text-sm text-gray-600">
              I agree to the{" "}
              <Link href="/terms" className="text-[#10B981] hover:text-[#059669] underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-[#10B981] hover:text-[#059669] underline">
                Privacy Policy
              </Link>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold text-lg text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#10B981" }}
          >
            {loading ? (
              "Creating account..."
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Create Account
              </>
            )}
          </button>
        </form>

        {/* Footer link */}
        <p className="text-center text-gray-600 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-[#10B981] hover:text-[#059669] font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
