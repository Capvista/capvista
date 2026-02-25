import Link from "next/link";
import LandingNav from "./components/LandingNav";
import HowCapvistaWorks from "./components/HowCapvistaWorks";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Navigation */}
      <LandingNav />

      {/* Hero Section */}
      <section className="bg-[#0A1F44] w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column */}
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full text-sm text-white bg-white/10 border border-white/20 mb-8">
                Connecting Capital with Innovation
              </span>

              <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Private Market Investing,
                <br />
                <span className="text-[#10B981]">Simplified</span>
              </h1>

              <p className="text-lg text-gray-300 mb-10 leading-relaxed">
                Capvista brings together ambitious founders and accredited
                investors on one platform—streamlining deal flow, transparency,
                and opportunity in early-stage investing.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/signup/founder"
                  className="inline-block px-8 py-4 rounded-lg font-semibold text-white bg-[#10B981] hover:bg-[#059669] transition-colors text-center"
                >
                  I&apos;m a Founder &rarr;
                </Link>
                <Link
                  href="/signup/investor"
                  className="inline-block px-8 py-4 rounded-lg font-semibold text-white border border-white/30 hover:bg-white/5 transition-colors text-center"
                >
                  I&apos;m an Investor &rarr;
                </Link>
              </div>
            </div>

            {/* Right Column */}
            <div>
              <img
                src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=400&fit=crop"
                alt="Person analyzing trading charts"
                className="rounded-xl shadow-2xl w-full"
              />
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-20 pt-12 border-t border-white/10">
            <div className="text-center">
              <div className="text-4xl font-bold text-[#10B981]">$2.5B+</div>
              <div className="text-gray-400 mt-1">Capital Deployed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#10B981]">500+</div>
              <div className="text-gray-400 mt-1">Active Startups</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#10B981]">2,000+</div>
              <div className="text-gray-400 mt-1">Investors</div>
            </div>
          </div>
        </div>
      </section>

      {/* How Capvista Works */}
      <HowCapvistaWorks />

      {/* Two Structured Investment Lanes */}
      <section className="py-24 bg-[#0A1F44]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Two Structured Investment Lanes
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
            {/* Yield Lane */}
            <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
              <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-wider mb-6 uppercase bg-blue-500/15 text-blue-400 border border-blue-500/30">
                Yield Lane
              </div>

              <h3 className="text-xl font-bold text-white mb-2">
                Structured Cash-Flow Participation
              </h3>

              <p className="text-gray-400 mb-6 leading-relaxed text-sm">
                Revenue share notes and asset-backed instruments with defined
                return structures and periodic distributions.
              </p>

              <div className="space-y-3 mb-8">
                {[
                  "Revenue Share Notes",
                  "Asset-Backed Participation",
                  "Periodic Distributions",
                  "Defined Maturity Terms",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-gray-300 text-sm"
                  >
                    <svg
                      className="w-4 h-4 flex-shrink-0 text-[#10B981]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {item}
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-white/10">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Typical Duration
                </div>
                <div className="text-xl font-bold text-white">6 – 24 months</div>
              </div>
            </div>

            {/* Ventures Lane */}
            <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
              <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-wider mb-6 uppercase bg-purple-500/15 text-purple-400 border border-purple-500/30">
                Ventures Lane
              </div>

              <h3 className="text-xl font-bold text-white mb-2">
                Long-Duration Equity & Convertible Instruments
              </h3>

              <p className="text-gray-400 mb-6 leading-relaxed text-sm">
                Convertible notes, SAFEs, and SPV equity positions in
                high-growth African companies.
              </p>

              <div className="space-y-3 mb-8">
                {[
                  "Convertible Notes & SAFEs",
                  "SPV Equity Participation",
                  "Long-Duration Capital Deployment",
                  "Quarterly Reporting",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-gray-300 text-sm"
                  >
                    <svg
                      className="w-4 h-4 flex-shrink-0 text-[#10B981]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {item}
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-white/10">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Typical Duration
                </div>
                <div className="text-xl font-bold text-white">3 – 7 years</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Capital Governance Framework */}
      <section className="py-24 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#0A1F44]">
              Capital Governance Framework
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Each offering undergoes structured review, issuer verification, and
              compliance screening before becoming accessible to qualified
              investors.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
            {/* Pillar 1 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-gradient-to-br from-[#10B981]/10 to-[#10B981]/20 border border-[#10B981]/15">
                <svg
                  className="w-8 h-8 text-[#10B981]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#0A1F44]">
                Issuer Verification
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Corporate identity, registration, and beneficial ownership
                confirmed through multi-source validation.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-gradient-to-br from-[#10B981]/10 to-[#10B981]/20 border border-[#10B981]/15">
                <svg
                  className="w-8 h-8 text-[#10B981]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#0A1F44]">
                Deal Structure Review
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Each instrument is reviewed for regulatory alignment, risk
                disclosure, and investor protection provisions.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-gradient-to-br from-[#10B981]/10 to-[#10B981]/20 border border-[#10B981]/15">
                <svg
                  className="w-8 h-8 text-[#10B981]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#0A1F44]">
                Ongoing Monitoring
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Post-investment reporting, covenant tracking, and escalation
                protocols maintain oversight throughout the investment lifecycle.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Everything You Need to Invest Smarter */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#0A1F44]">
              Everything You Need to Invest Smarter
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Powerful tools and verified data to help you make informed
              investment decisions with confidence.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Curated Deal Flow */}
            <div className="p-8 rounded-2xl border border-gray-100 hover:shadow-md transition">
              <div className="bg-[#0A1F44] w-14 h-14 flex items-center justify-center rounded-xl mb-5">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#0A1F44] mb-2">Curated Deal Flow</h3>
              <p className="text-gray-600 leading-relaxed">
                Access a vetted pipeline of high-quality startups across sectors
                and stages—pre-filtered for quality and compliance.
              </p>
            </div>

            {/* Portfolio Tracking */}
            <div className="p-8 rounded-2xl border border-gray-100 hover:shadow-md transition">
              <div className="bg-[#0A1F44] w-14 h-14 flex items-center justify-center rounded-xl mb-5">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#0A1F44] mb-2">Portfolio Tracking</h3>
              <p className="text-gray-600 leading-relaxed">
                Monitor your investments in real-time with comprehensive
                dashboards, metrics, and performance analytics.
              </p>
            </div>

            {/* Due Diligence Tools */}
            <div className="p-8 rounded-2xl border border-gray-100 hover:shadow-md transition">
              <div className="bg-[#0A1F44] w-14 h-14 flex items-center justify-center rounded-xl mb-5">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#0A1F44] mb-2">Due Diligence Tools</h3>
              <p className="text-gray-600 leading-relaxed">
                Review detailed company profiles, financials, cap tables, and
                documentation in one secure location.
              </p>
            </div>

            {/* Verified Companies */}
            <div className="p-8 rounded-2xl border border-gray-100 hover:shadow-md transition">
              <div className="bg-[#0A1F44] w-14 h-14 flex items-center justify-center rounded-xl mb-5">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#0A1F44] mb-2">Verified Companies</h3>
              <p className="text-gray-600 leading-relaxed">
                Every startup undergoes admin review and verification to ensure
                legitimacy and quality standards.
              </p>
            </div>

            {/* Smart Notifications */}
            <div className="p-8 rounded-2xl border border-gray-100 hover:shadow-md transition">
              <div className="bg-[#0A1F44] w-14 h-14 flex items-center justify-center rounded-xl mb-5">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#0A1F44] mb-2">Smart Notifications</h3>
              <p className="text-gray-600 leading-relaxed">
                Stay updated on new deals, company milestones, and portfolio
                updates with intelligent alerts.
              </p>
            </div>

            {/* Bank-Level Security */}
            <div className="p-8 rounded-2xl border border-gray-100 hover:shadow-md transition">
              <div className="bg-[#0A1F44] w-14 h-14 flex items-center justify-center rounded-xl mb-5">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#0A1F44] mb-2">Bank-Level Security</h3>
              <p className="text-gray-600 leading-relaxed">
                Your data and investments are protected with enterprise-grade
                encryption and security protocols.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-[#0A1F44]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
            {/* Brand Column */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-2 mb-5">
                <div
                  className="h-9 w-9 rounded-lg flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #10B981 0%, #0A1F44 100%)",
                  }}
                >
                  <span className="font-bold text-sm text-white">CV</span>
                </div>
                <span className="text-lg font-bold text-white tracking-tight">
                  Capvista
                </span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Institutional capital infrastructure for African private markets.
              </p>
            </div>

            {/* Platform */}
            <div>
              <h3 className="text-xs font-semibold text-white mb-4 uppercase tracking-widest">
                Platform
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/dashboard/investor/companies"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Browse Companies
                  </Link>
                </li>
                <li>
                  <Link
                    href="/signup"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    For Investors
                  </Link>
                </li>
                <li>
                  <Link
                    href="/signup"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    For Companies
                  </Link>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    How It Works
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-xs font-semibold text-white mb-4 uppercase tracking-widest">
                Company
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/about"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <a
                    href="mailto:info@capvista.com"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <span className="text-sm text-gray-500">
                    Careers — Coming Soon
                  </span>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-xs font-semibold text-white mb-4 uppercase tracking-widest">
                Legal
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/terms"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/risk-disclosure"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Risk Disclosure
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/10 pt-8">
            <p className="text-xs text-gray-500 text-center mb-3">
              &copy; 2026 Capvista Holdings. All rights reserved.
            </p>
            <p className="text-xs text-gray-600 text-center max-w-3xl mx-auto leading-relaxed">
              Capvista is not a registered broker-dealer or investment adviser.
              Securities offered through the platform are subject to
              restrictions and available only to qualified investors.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
