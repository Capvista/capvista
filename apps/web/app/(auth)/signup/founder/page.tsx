"use client";

import { useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Lock, Building2, CheckCircle } from "lucide-react";

export default function FounderSignupPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    agreeToTerms: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.agreeToTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    const { error } = await signUp({
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      role: "FOUNDER",
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard/founder");
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0A1F44]/5 border border-[#0A1F44]/10 mb-4">
            <Building2 className="w-4 h-4 text-[#0A1F44]" />
            <span className="text-sm text-[#0A1F44]">Founder Account</span>
          </div>
          <h1 className="text-3xl text-[#0A1F44] mb-2">
            Create your founder account
          </h1>
          <p className="text-gray-600">
            You&apos;re one step away from raising capital for your startup
          </p>
        </div>

        {/* Signup Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6"
        >
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* First Name + Last Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                First name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0A1F44]/20 focus:border-[#0A1F44] outline-none transition-all text-gray-900 placeholder:text-gray-400"
                  placeholder="Jane"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Last name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0A1F44]/20 focus:border-[#0A1F44] outline-none transition-all text-gray-900 placeholder:text-gray-400"
                  placeholder="Smith"
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0A1F44]/20 focus:border-[#0A1F44] outline-none transition-all text-gray-900 placeholder:text-gray-400"
                placeholder="jane@startup.com"
              />
            </div>
          </div>

          {/* Company Name (Optional) */}
          <div>
            <label
              htmlFor="companyName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Company name{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="companyName"
                type="text"
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0A1F44]/20 focus:border-[#0A1F44] outline-none transition-all text-gray-900 placeholder:text-gray-400"
                placeholder="Acme Inc."
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0A1F44]/20 focus:border-[#0A1F44] outline-none transition-all text-gray-900 placeholder:text-gray-400"
                placeholder="••••••••"
              />
            </div>
            <p className="mt-1.5 text-xs text-gray-500">
              Must be at least 8 characters
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Confirm password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    confirmPassword: e.target.value,
                  })
                }
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0A1F44]/20 focus:border-[#0A1F44] outline-none transition-all text-gray-900 placeholder:text-gray-400"
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
              onChange={(e) =>
                setFormData({ ...formData, agreeToTerms: e.target.checked })
              }
              className="mt-1 w-4 h-4 rounded border-gray-300 text-[#0A1F44] focus:ring-[#0A1F44]/20"
            />
            <label htmlFor="agreeToTerms" className="text-sm text-gray-600">
              I agree to the{" "}
              <Link
                href="/terms"
                className="text-[#0A1F44] hover:underline font-medium"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-[#0A1F44] hover:underline font-medium"
              >
                Privacy Policy
              </Link>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-white bg-[#0A1F44] hover:bg-[#0A1F44]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* Sign in link */}
        <p className="text-center text-gray-600 mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-[#10B981] hover:text-[#059669] font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
