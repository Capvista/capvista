import Link from "next/link";
import { Building2, TrendingUp, ArrowRight, CheckCircle } from "lucide-react";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mb-12">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0A1F44] to-[#10B981]" />
          <span className="text-2xl font-semibold text-[#0A1F44]">Capvista</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl text-[#0A1F44] mb-4">
            Join Capvista
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose your role to get started. Whether you&apos;re raising capital
            or deploying it, we&apos;ve built the right experience for you.
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Founder Card */}
          <Link
            href="/signup/founder"
            className="group relative p-8 rounded-2xl border-2 border-gray-200 hover:border-[#0A1F44] bg-white hover:shadow-xl transition-all duration-200"
          >
            <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="w-6 h-6 text-[#0A1F44]" />
            </div>
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#0A1F44] to-[#1A3A6B] flex items-center justify-center mb-6">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl text-[#0A1F44] mb-3">I&apos;m a Founder</h2>
            <p className="text-gray-600 mb-6">
              Raise capital for your startup. Create your company profile,
              showcase your metrics, and connect with accredited investors.
            </p>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <CheckCircle className="w-5 h-5 text-[#10B981] flex-shrink-0" />
                <span>Access to 2,000+ accredited investors</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <CheckCircle className="w-5 h-5 text-[#10B981] flex-shrink-0" />
                <span>Streamlined fundraising process</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <CheckCircle className="w-5 h-5 text-[#10B981] flex-shrink-0" />
                <span>Track investor interest and commitments</span>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 text-[#0A1F44] group-hover:gap-3 transition-all">
              <span>Continue as Founder</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </Link>

          {/* Investor Card */}
          <Link
            href="/signup/investor"
            className="group relative p-8 rounded-2xl border-2 border-gray-200 hover:border-[#10B981] bg-white hover:shadow-xl transition-all duration-200"
          >
            <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="w-6 h-6 text-[#10B981]" />
            </div>
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center mb-6">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl text-[#0A1F44] mb-3">
              I&apos;m an Investor
            </h2>
            <p className="text-gray-600 mb-6">
              Discover investment opportunities. Browse vetted startups, evaluate
              detailed metrics, and build your portfolio.
            </p>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <CheckCircle className="w-5 h-5 text-[#10B981] flex-shrink-0" />
                <span>500+ vetted startup opportunities</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <CheckCircle className="w-5 h-5 text-[#10B981] flex-shrink-0" />
                <span>Detailed financials and due diligence</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <CheckCircle className="w-5 h-5 text-[#10B981] flex-shrink-0" />
                <span>Portfolio tracking and analytics</span>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 text-[#10B981] group-hover:gap-3 transition-all">
              <span>Continue as Investor</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </Link>
        </div>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#10B981] hover:text-[#059669]"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
