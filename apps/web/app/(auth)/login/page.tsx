"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ArrowRight } from "lucide-react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  // If already logged in, redirect immediately
  useEffect(() => {
    if (!authLoading && user) {
      router.push(redirectTo);
    }
  }, [user, authLoading, redirectTo, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push(redirectTo);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left — Form Panel */}
      <div className="flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md space-y-8">
          {/* Logo & Header */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0A1F44] to-[#10B981]" />
              <span className="text-2xl font-semibold text-[#0A1F44]">Capvista</span>
            </Link>
            <h1 className="text-3xl text-[#0A1F44] mb-2">Welcome back</h1>
            <p className="text-gray-600">Sign in to your account to continue</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm mb-2 text-gray-700">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent outline-none transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm mb-2 text-gray-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-[#10B981] border-gray-300 rounded focus:ring-[#10B981]"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-[#10B981] hover:text-[#059669]"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#0A1F44] hover:bg-[#1A3A6B] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{loading ? "Signing in..." : "Sign in"}</span>
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">New to Capvista?</span>
            </div>
          </div>

          {/* Signup Links */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/signup/founder"
              className="flex-1 px-6 py-3 border-2 border-[#0A1F44] text-[#0A1F44] hover:bg-[#0A1F44] hover:text-white rounded-lg transition-colors text-center"
            >
              Sign up as Founder
            </Link>
            <Link
              href="/signup/investor"
              className="flex-1 px-6 py-3 border-2 border-[#10B981] text-[#10B981] hover:bg-[#10B981] hover:text-white rounded-lg transition-colors text-center"
            >
              Sign up as Investor
            </Link>
          </div>
        </div>
      </div>

      {/* Right — Decorative Panel */}
      <div className="hidden lg:flex relative bg-gradient-to-br from-[#0A1F44] to-[#1A3A6B] text-white p-16 items-center justify-center">
        {/* Dot pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="relative max-w-lg space-y-8">
          <h2 className="text-4xl">
            Access the future of private market investing
          </h2>
          <p className="text-lg text-gray-300">
            Join thousands of founders and investors building the next generation
            of successful companies.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#10B981] flex items-center justify-center flex-shrink-0">
                <span className="text-sm">&#10003;</span>
              </div>
              <div>
                <div className="mb-1">Bank-level security</div>
                <div className="text-sm text-gray-400">
                  Your data is protected with enterprise-grade encryption
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#10B981] flex items-center justify-center flex-shrink-0">
                <span className="text-sm">&#10003;</span>
              </div>
              <div>
                <div className="mb-1">Fully compliant</div>
                <div className="text-sm text-gray-400">
                  SEC compliant and accreditation verified
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#10B981] flex items-center justify-center flex-shrink-0">
                <span className="text-sm">&#10003;</span>
              </div>
              <div>
                <div className="mb-1">Trusted by thousands</div>
                <div className="text-sm text-gray-400">
                  500+ companies and 2,000+ investors
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
