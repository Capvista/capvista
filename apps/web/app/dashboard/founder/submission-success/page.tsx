"use client";

import { useAuth } from "@/lib/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function SubmissionSuccess() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

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

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#F6F8FA" }}
    >
      <div className="max-w-lg w-full mx-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 text-center">
          {/* Success Icon */}
          <div
            className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ backgroundColor: "rgba(34, 197, 94, 0.1)" }}
          >
            <svg
              className="w-10 h-10 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-primary-950 mb-3">
            Congratulations! 🎉
          </h1>

          {/* Message */}
          <p className="text-gray-700 text-lg mb-4">
            Your company application has been successfully submitted.
          </p>

          <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left space-y-3">
            <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
              What happens next?
            </h3>

            <div className="flex items-start gap-3">
              <div
                className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white mt-0.5"
                style={{ backgroundColor: "#C8A24D" }}
              >
                1
              </div>
              <p className="text-sm text-gray-700">
                <strong>Review</strong> — Our team will review your application
                and get back to you as soon as possible.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div
                className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white mt-0.5"
                style={{ backgroundColor: "#C8A24D" }}
              >
                2
              </div>
              <p className="text-sm text-gray-700">
                <strong>Verification</strong> — We'll verify your company
                documents, CAC registration, and founder identity (NIN/BVN).
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div
                className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white mt-0.5"
                style={{ backgroundColor: "#C8A24D" }}
              >
                3
              </div>
              <p className="text-sm text-gray-700">
                <strong>Listing</strong> — Once approved, your company will be
                listed on the platform and visible to accredited investors.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div
                className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white mt-0.5"
                style={{ backgroundColor: "#C8A24D" }}
              >
                4
              </div>
              <p className="text-sm text-gray-700">
                <strong>Fundraise</strong> — You'll be able to create deals and
                start receiving investment interest.
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-8">
            You'll receive email updates as your application progresses. In the
            meantime, you can track your status from your dashboard.
          </p>

          {/* Back to Dashboard */}
          <Link
            href="/dashboard/founder"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-lg font-semibold transition-all text-lg"
            style={{ backgroundColor: "#C8A24D", color: "#0B1C2D" }}
          >
            Go to Dashboard
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
