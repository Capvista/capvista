import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F6F8FA" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-md">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center space-x-2">
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
            <span className="text-xl font-bold text-primary-950">Capvista</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="#how-it-works"
              className="text-gray-900 hover:text-primary-950 font-medium transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/dashboard/investor/companies"
              className="text-gray-900 hover:text-primary-950 font-medium transition-colors"
            >
              Browse Companies
            </Link>
            <Link
              href="/login"
              className="text-gray-900 hover:text-primary-950 font-medium transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="inline-block px-6 py-2.5 rounded-lg font-bold text-sm transition-all hover:opacity-90"
              style={{ backgroundColor: "#C8A24D", color: "#0B1C2D" }}
            >
              Sign Up
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section - Centered */}
      <section
        className="relative overflow-hidden py-32"
        style={{
          background:
            "linear-gradient(135deg, #0B1C2D 0%, #142B4F 50%, #1e3a5f 100%)",
        }}
      >
        <div className="container relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Institutional Access
              <br />
              <span className="inline-block border-b-4 border-gold pb-2">
                to African Private Markets
              </span>
            </h1>

            <p className="text-xl text-white mb-10 leading-relaxed max-w-3xl mx-auto">
              Capvista provides structured, verified investment opportunities
              into Africa's most promising private companies, accessible to
              qualified investors worldwide.
            </p>

            <div className="flex items-center justify-center gap-4 mb-4">
              <Link
                href="/signup"
                className="inline-block px-10 py-4 rounded-lg font-bold text-lg transition-all hover:opacity-90"
                style={{ backgroundColor: "#C8A24D", color: "#0B1C2D" }}
              >
                Get Started
              </Link>
              <Link
                href="/dashboard/investor/companies"
                className="inline-block px-10 py-4 rounded-lg font-bold text-lg border-2 border-white text-white transition-all hover:bg-white/10"
              >
                Browse Companies
              </Link>
            </div>
            <p className="text-sm text-gray-400">
              Qualified investors only. Deal details visible after verification.
            </p>
          </div>
        </div>
      </section>

      {/* Two Lanes Explained */}
      <section className="py-24" style={{ backgroundColor: "#0B1C2D" }}>
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Two Investment Lanes
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Choose the risk profile and duration that matches your investment
              strategy
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Yield Lane */}
            <div className="group bg-white/5 rounded-2xl p-8 border border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.02] cursor-pointer">
              <div
                className="inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-6 group-hover:scale-110 transition-transform duration-300"
                style={{
                  backgroundColor: "#3B82F6",
                  color: "white",
                }}
              >
                YIELD
              </div>

              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-gold transition-colors duration-300">
                Predictable Returns
              </h3>

              <p className="text-gray-400 mb-6 leading-relaxed">
                Cash-flow and asset-backed participation with defined structures
                and regular distributions.
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                  <svg
                    className="w-5 h-5 text-emerald"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Revenue Share Notes
                </div>
                <div className="flex items-center gap-2 text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                  <svg
                    className="w-5 h-5 text-emerald"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Asset-Backed Participation
                </div>
                <div className="flex items-center gap-2 text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                  <svg
                    className="w-5 h-5 text-emerald"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Monthly Reporting
                </div>
              </div>

              <div className="pt-6 border-t border-white/10">
                <div className="text-sm text-gray-400 mb-1">
                  Typical Duration
                </div>
                <div className="text-2xl font-bold text-white">
                  12-36 months
                </div>
              </div>
            </div>

            {/* Ventures Lane */}
            <div className="group bg-white/5 rounded-2xl p-8 border border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.02] cursor-pointer">
              <div
                className="inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-6 group-hover:scale-110 transition-transform duration-300"
                style={{
                  backgroundColor: "#8B5CF6",
                  color: "white",
                }}
              >
                VENTURES
              </div>

              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-gold transition-colors duration-300">
                High Growth Potential
              </h3>

              <p className="text-gray-400 mb-6 leading-relaxed">
                Long-duration equity and convertible investments targeting
                outsized returns through exits.
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                  <svg
                    className="w-5 h-5 text-emerald"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Convertible Notes & SAFEs
                </div>
                <div className="flex items-center gap-2 text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                  <svg
                    className="w-5 h-5 text-emerald"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  SPV Equity Participation
                </div>
                <div className="flex items-center gap-2 text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                  <svg
                    className="w-5 h-5 text-emerald"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Quarterly Reporting
                </div>
              </div>

              <div className="pt-6 border-t border-white/10">
                <div className="text-sm text-gray-400 mb-1">
                  Typical Duration
                </div>
                <div className="text-2xl font-bold text-white">3-7 years</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24" style={{ backgroundColor: "#F6F8FA" }}>
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-primary-950 mb-4">
              Built on Trust & Transparency
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Multi-layer verification ensures legitimacy at every step
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="text-center">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 transform hover:scale-110 transition-transform"
                style={{
                  background:
                    "linear-gradient(to bottom right, rgba(200, 162, 77, 0.1), rgba(200, 162, 77, 0.2))",
                }}
              >
                <svg
                  className="w-10 h-10"
                  style={{ color: "#C8A24D" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-primary-950 mb-3">
                Identity Verification
              </h3>
              <p className="text-gray-600 leading-relaxed">
                CAC, NIN, BVN, and bank account verification for all founders.
              </p>
            </div>

            <div className="text-center">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 transform hover:scale-110 transition-transform"
                style={{
                  background:
                    "linear-gradient(to bottom right, rgba(200, 162, 77, 0.1), rgba(200, 162, 77, 0.2))",
                }}
              >
                <svg
                  className="w-10 h-10"
                  style={{ color: "#C8A24D" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-primary-950 mb-3">
                Deal Structure Review
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Admin approval ensures proper lane/instrument fit.
              </p>
            </div>

            <div className="text-center">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 transform hover:scale-110 transition-transform"
                style={{
                  background:
                    "linear-gradient(to bottom right, rgba(200, 162, 77, 0.1), rgba(200, 162, 77, 0.2))",
                }}
              >
                <svg
                  className="w-10 h-10"
                  style={{ color: "#C8A24D" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-primary-950 mb-3">
                Ongoing Monitoring
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Transparent status modes with clear escalation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Forge-style layout */}
      <footer className="py-12" style={{ backgroundColor: "#0B1C2D" }}>
        <div className="container">
          <div className="grid md:grid-cols-6 gap-8 mb-12">
            {/* Brand Column */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <div
                  className="h-10 w-10 rounded flex items-center justify-center"
                  style={{ backgroundColor: "#C8A24D" }}
                >
                  <span
                    className="font-bold text-lg"
                    style={{ color: "#0B1C2D" }}
                  >
                    CV
                  </span>
                </div>
                <span className="text-lg font-bold text-white tracking-tight">
                  CAPVISTA
                </span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed mb-6">
                Private markets infrastructure connecting verified African
                companies with qualified global investors.
              </p>
            </div>

            {/* Investors */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
                Investors
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/learn"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Learn
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/help"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
              </ul>
            </div>

            {/* Companies */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
                Companies
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/about"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/careers"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="/engineering"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Engineering
                  </Link>
                </li>
              </ul>
            </div>

            {/* Compliance */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
                Compliance
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/terms"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Terms
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/disclosures"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Disclosures
                  </Link>
                </li>
              </ul>
            </div>

            {/* Stay Informed */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
                Stay Informed
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="https://twitter.com"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Twitter
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://linkedin.com"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    LinkedIn
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/10 pt-8">
            <p className="text-xs text-gray-500 text-center">
              © 2026 Capvista. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
