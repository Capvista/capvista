import Link from "next/link";
import { Linkedin, Twitter, Mail } from "lucide-react";
import LandingNav from "../components/LandingNav";

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F6F8FA" }}>
      <LandingNav />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#0A1F44] to-[#1A3A6B] py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Building the Infrastructure for African Private Capital
          </h1>
          <p className="text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto">
            Capvista is a private markets platform connecting verified African
            startups with qualified global investors through structured,
            transparent investment instruments.
          </p>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#0A1F44] mb-6">
            Our Mission
          </h2>
          <p className="text-base text-[#6B7280] leading-relaxed mb-6">
            Africa&apos;s startup ecosystem is producing world-class companies,
            but access to private capital remains broken. Founders spend months
            chasing introductions. Investors can&apos;t find verified deal flow.
            And when both sides do connect, there&apos;s no standardized
            infrastructure to execute and monitor investments.
          </p>
          <p className="text-lg font-semibold text-[#111827] mb-6">
            Capvista exists to fix this.
          </p>
          <p className="text-base text-[#6B7280] leading-relaxed">
            We are building the trust and execution layer for cross-border
            private investment into African companies. Our platform verifies
            companies, standardizes deal structures, and gives qualified
            investors worldwide a clear, compliant path to participate in
            Africa&apos;s most promising private markets.
          </p>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#0A1F44] mb-10 text-center">
            What We Do
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-sm">
              <h3 className="text-lg font-bold text-[#0A1F44] mb-3">
                For Investors
              </h3>
              <p className="text-base text-[#6B7280] leading-relaxed">
                Access verified, structured investment opportunities across
                African private markets. Browse companies, review standardized
                deal terms, and invest through compliant instruments — whether
                you&apos;re in Lagos, London, or Los Angeles.
              </p>
            </div>
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-sm">
              <h3 className="text-lg font-bold text-[#0A1F44] mb-3">
                For Founders
              </h3>
              <p className="text-base text-[#6B7280] leading-relaxed">
                Get your company in front of qualified global investors without
                the gatekeepers. Our verification process builds credibility,
                and our standardized instruments make fundraising faster and
                more transparent.
              </p>
            </div>
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-sm">
              <h3 className="text-lg font-bold text-[#0A1F44] mb-3">
                For the Ecosystem
              </h3>
              <p className="text-base text-[#6B7280] leading-relaxed">
                Every deal on Capvista raises the bar for how private capital
                flows into Africa. Standardized terms, verified participants,
                and transparent monitoring create a foundation the entire
                ecosystem can build on.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How We're Different */}
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#0A1F44] mb-6">
            How We&apos;re Different
          </h2>
          <p className="text-base text-[#6B7280] leading-relaxed mb-6">
            Capvista is not a crowdfunding platform. We are not a venture fund.
            We don&apos;t provide investment advice or guarantee returns.
          </p>
          <p className="text-lg font-semibold text-[#111827] mb-6">
            We are infrastructure.
          </p>
          <p className="text-base text-[#6B7280] leading-relaxed mb-6">
            We verify companies through multi-layer checks — corporate
            registration, identity verification, financial documentation, and
            ongoing monitoring. We standardize investment instruments into two
            clear lanes: Yield for cash-flow backed deals, and Ventures for
            equity opportunities. And we give both sides the tools to execute
            with confidence.
          </p>
          <p className="text-base text-[#6B7280] leading-relaxed">
            Every company on our platform has been verified. Every investor has
            been qualified. Every deal follows a standardized structure.
            That&apos;s what makes Capvista different.
          </p>
        </div>
      </section>

      {/* Our Two Investment Lanes */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#0A1F44] mb-10 text-center">
            Our Two Investment Lanes
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Yield Lane */}
            <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm overflow-hidden">
              <div className="h-1 bg-blue-500" />
              <div className="p-6">
                <div className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-blue-50 text-blue-600 border border-blue-200 mb-4">
                  Yield Lane
                </div>
                <h3 className="text-lg font-bold text-[#0A1F44] mb-3">
                  Cash-Flow Backed Investments
                </h3>
                <p className="text-base text-[#6B7280] leading-relaxed">
                  Cash-flow backed investments for companies generating revenue.
                  Instruments include Revenue Share Notes and Asset-Backed
                  Participation. Designed for investors seeking structured
                  returns tied to real business performance.
                </p>
              </div>
            </div>

            {/* Ventures Lane */}
            <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm overflow-hidden">
              <div className="h-1 bg-purple-500" />
              <div className="p-6">
                <div className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-purple-50 text-purple-600 border border-purple-200 mb-4">
                  Ventures Lane
                </div>
                <h3 className="text-lg font-bold text-[#0A1F44] mb-3">
                  Equity-Oriented Investments
                </h3>
                <p className="text-base text-[#6B7280] leading-relaxed">
                  Equity-oriented investments for high-growth startups.
                  Instruments include Convertible Notes, SAFEs, and SPV Equity.
                  Designed for investors with higher risk tolerance seeking
                  venture-scale returns.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#0A1F44] mb-10 text-center">
            Our Values
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-sm">
              <h3 className="text-lg font-bold text-[#0A1F44] mb-2">
                Verification Over Curation
              </h3>
              <p className="text-base text-[#6B7280] leading-relaxed">
                We don&apos;t pick winners. We verify that companies are real,
                compliant, and transparent — then let qualified investors make
                their own decisions.
              </p>
            </div>
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-sm">
              <h3 className="text-lg font-bold text-[#0A1F44] mb-2">
                Standardization Over Complexity
              </h3>
              <p className="text-base text-[#6B7280] leading-relaxed">
                Every deal follows a clear structure. No bespoke terms, no
                hidden clauses. Investors always know what they&apos;re getting
                into.
              </p>
            </div>
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-sm">
              <h3 className="text-lg font-bold text-[#0A1F44] mb-2">
                Transparency Over Hype
              </h3>
              <p className="text-base text-[#6B7280] leading-relaxed">
                We show real data, real risks, and real metrics. If a company
                has red flags, our risk disclosures surface them. No inflated
                projections.
              </p>
            </div>
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-sm">
              <h3 className="text-lg font-bold text-[#0A1F44] mb-2">
                Access Over Exclusivity
              </h3>
              <p className="text-base text-[#6B7280] leading-relaxed">
                Qualified investors anywhere in the world can participate.
                Nigerian startups shouldn&apos;t be limited to who their
                founders know personally.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Where We're Headed */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#0A1F44] mb-6">
            Where We&apos;re Headed
          </h2>
          <p className="text-base text-[#6B7280] leading-relaxed mb-6">
            We&apos;re starting with Nigeria — the largest startup ecosystem in
            Africa — and expanding across the continent. Our long-term vision is
            to become the default infrastructure layer for private capital
            flowing into African businesses.
          </p>
          <p className="text-base text-[#6B7280] leading-relaxed">
            This means deeper verification, more instrument types, secondary
            trading capabilities, and integration with the broader financial
            ecosystem. Every feature we build moves us closer to a world where
            investing in African private markets is as structured, transparent,
            and accessible as investing anywhere else.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-[#0A1F44]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
            Ready to get started?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-block px-8 py-4 rounded-lg font-semibold text-[#0A1F44] bg-white hover:bg-gray-100 transition-colors text-center"
            >
              Sign Up
            </Link>
            <Link
              href="/dashboard/investor/companies"
              className="inline-block px-8 py-4 rounded-lg font-semibold text-white border border-white hover:bg-white/10 transition-colors text-center"
            >
              Browse Companies
            </Link>
          </div>
        </div>
      </section>

      {/* Footer (same as landing page) */}
      <footer className="py-16 bg-[#0A1F44]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 mb-14">
            <div className="col-span-2 md:col-span-1">
              <span className="text-lg font-bold text-white tracking-tight">
                Capvista
              </span>
              <p className="text-sm text-gray-400 leading-relaxed mt-4 mb-5">
                Connecting capital with innovation. The modern platform for
                private market investing.
              </p>
              <div className="flex items-center space-x-3">
                <a
                  href="#"
                  className="h-9 w-9 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition-colors"
                >
                  <Linkedin className="h-4 w-4 text-gray-300" />
                </a>
                <a
                  href="#"
                  className="h-9 w-9 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition-colors"
                >
                  <Twitter className="h-4 w-4 text-gray-300" />
                </a>
                <a
                  href="mailto:info@capvista.com"
                  className="h-9 w-9 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition-colors"
                >
                  <Mail className="h-4 w-4 text-gray-300" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-white mb-4 uppercase tracking-widest">
                Product
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/signup" className="text-sm text-gray-400 hover:text-white transition-colors">
                    For Founders
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="text-sm text-gray-400 hover:text-white transition-colors">
                    For Investors
                  </Link>
                </li>
                <li>
                  <a href="/#how-it-works" className="text-sm text-gray-400 hover:text-white transition-colors">
                    How It Works
                  </a>
                </li>
                <li>
                  <Link href="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-white mb-4 uppercase tracking-widest">
                Company
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/about" className="text-sm text-gray-400 hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/press" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Press
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-white mb-4 uppercase tracking-widest">
                Resources
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/help" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/api-reference" className="text-sm text-gray-400 hover:text-white transition-colors">
                    API Reference
                  </Link>
                </li>
                <li>
                  <Link href="/community" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Community
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-white mb-4 uppercase tracking-widest">
                Legal
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/compliance" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Compliance
                  </Link>
                </li>
                <li>
                  <Link href="/security" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Security
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              &copy; 2026 Capvista. All rights reserved.
            </p>
            <p className="text-sm text-gray-400">
              Securities offered through registered broker-dealer. Member
              FINRA/SIPC.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
