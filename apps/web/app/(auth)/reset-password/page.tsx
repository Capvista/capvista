"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || "Something went wrong");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#F6F8FA" }}
      >
        <div className="max-w-md w-full mx-4">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center space-x-2">
              <div
                className="h-12 w-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "#0A1F44" }}
              >
                <span
                  className="font-bold text-xl"
                  style={{ color: "#0B1C2D" }}
                >
                  CV
                </span>
              </div>
              <span
                className="text-2xl font-bold"
                style={{ color: "#0B1C2D" }}
              >
                Capvista
              </span>
            </Link>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-600 mb-6">
              Invalid or missing reset token. Please request a new password
              reset.
            </p>
            <Link
              href="/forgot-password"
              className="inline-block py-3 px-6 rounded-lg font-semibold transition-all"
              style={{ backgroundColor: "#0A1F44", color: "#FFFFFF" }}
            >
              Request New Reset
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#F6F8FA" }}
    >
      <div className="max-w-md w-full mx-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div
              className="h-12 w-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#0A1F44" }}
            >
              <span className="font-bold text-xl" style={{ color: "#0B1C2D" }}>
                CV
              </span>
            </div>
            <span className="text-2xl font-bold" style={{ color: "#0B1C2D" }}>
              Capvista
            </span>
          </Link>
          <h1 className="mt-6 text-3xl font-bold" style={{ color: "#0B1C2D" }}>
            Set new password
          </h1>
          <p className="mt-2 text-gray-500">
            Enter your new password below.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {success ? (
            <div>
              <div
                className="rounded-lg px-4 py-3 text-sm mb-6"
                style={{ backgroundColor: "#F0F9F4", color: "#166534" }}
              >
                Your password has been reset successfully. Redirecting to sign
                in...
              </div>
              <Link
                href="/login"
                className="block w-full py-3 px-4 rounded-lg font-semibold text-lg text-center transition-all"
                style={{ backgroundColor: "#0A1F44", color: "#FFFFFF" }}
              >
                Sign In Now
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-all"
                  placeholder="At least 8 characters"
                  minLength={8}
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-all"
                  placeholder="Re-enter your new password"
                  minLength={8}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-lg font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#0A1F44", color: "#FFFFFF" }}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm font-semibold hover:underline"
              style={{ color: "#0B1C2D" }}
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
