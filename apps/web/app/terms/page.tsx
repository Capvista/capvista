import LandingNav from "../components/LandingNav";
import Footer from "../components/Footer";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F6F8FA" }}>
      <LandingNav />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#0A1F44] to-[#1A3A6B] py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Terms of Service
          </h1>
          <p className="text-lg text-gray-300">Last updated: March 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-8 md:p-12">
            {/* Acceptance of Terms */}
            <div className="mb-10">
              <h2 className="text-lg font-bold text-[#0A1F44] mb-4">
                Acceptance of Terms
              </h2>
              <p className="text-base text-[#6B7280] leading-relaxed">
                By accessing or using Capvista&apos;s platform, you agree to be
                bound by these Terms of Service. If you do not agree, do not use
                the platform.
              </p>
            </div>

            {/* About Capvista */}
            <div className="mb-10">
              <h2 className="text-lg font-bold text-[#0A1F44] mb-4">
                About Capvista
              </h2>
              <p className="text-base text-[#6B7280] leading-relaxed">
                Capvista is a technology platform that connects verified
                companies with qualified investors. Capvista is not a
                broker-dealer, investment adviser, or financial institution. We
                do not provide investment advice, manage funds, or hold client
                assets. All investment decisions are made independently by
                investors.
              </p>
            </div>

            {/* Eligibility */}
            <div className="mb-10">
              <h2 className="text-lg font-bold text-[#0A1F44] mb-4">
                Eligibility
              </h2>
              <p className="text-base text-[#6B7280] leading-relaxed">
                To use Capvista as an investor, you must meet the qualification
                requirements for your jurisdiction as determined during our
                onboarding process. To list a company, you must be an authorized
                representative of the entity and provide accurate, complete
                information. You must be at least 18 years old to use the
                platform.
              </p>
            </div>

            {/* Account Responsibilities */}
            <div className="mb-10">
              <h2 className="text-lg font-bold text-[#0A1F44] mb-4">
                Account Responsibilities
              </h2>
              <p className="text-base text-[#6B7280] leading-relaxed mb-4">
                You are responsible for:
              </p>
              <ul className="list-disc list-inside text-base text-[#6B7280] leading-relaxed space-y-2 mb-4">
                <li>
                  Maintaining the confidentiality of your account credentials
                </li>
                <li>All activity that occurs under your account</li>
                <li>Providing accurate and current information</li>
                <li>Promptly updating your information if it changes</li>
              </ul>
              <p className="text-base text-[#6B7280] leading-relaxed">
                You must not share your account, create multiple accounts, or
                use another person&apos;s account.
              </p>
            </div>

            {/* Investment Risks */}
            <div className="mb-10">
              <h2 className="text-lg font-bold text-[#0A1F44] mb-4">
                Investment Risks
              </h2>
              <p className="text-base text-[#6B7280] leading-relaxed mb-4">
                All investments made through Capvista involve significant risk.
                You acknowledge that:
              </p>
              <ul className="list-disc list-inside text-base text-[#6B7280] leading-relaxed space-y-2">
                <li>
                  Private securities are illiquid and may not be readily sold or
                  transferred
                </li>
                <li>You may lose your entire investment</li>
                <li>Past performance does not guarantee future results</li>
                <li>Capvista does not guarantee any returns</li>
                <li>
                  Investment values may fluctuate and are not covered by deposit
                  protection schemes
                </li>
              </ul>
            </div>

            {/* Platform Use */}
            <div className="mb-10">
              <h2 className="text-lg font-bold text-[#0A1F44] mb-4">
                Platform Use
              </h2>
              <p className="text-base text-[#6B7280] leading-relaxed mb-4">
                You agree not to:
              </p>
              <ul className="list-disc list-inside text-base text-[#6B7280] leading-relaxed space-y-2">
                <li>Use the platform for any unlawful purpose</li>
                <li>
                  Misrepresent your identity, qualification status, or financial
                  condition
                </li>
                <li>
                  Manipulate or interfere with the platform&apos;s operation
                </li>
                <li>
                  Scrape, copy, or redistribute platform content without
                  permission
                </li>
                <li>
                  Circumvent any access restrictions or security measures
                </li>
              </ul>
            </div>

            {/* Company Listings */}
            <div className="mb-10">
              <h2 className="text-lg font-bold text-[#0A1F44] mb-4">
                Company Listings
              </h2>
              <p className="text-base text-[#6B7280] leading-relaxed mb-4">
                Founders represent and warrant that:
              </p>
              <ul className="list-disc list-inside text-base text-[#6B7280] leading-relaxed space-y-2">
                <li>All information submitted is accurate and complete</li>
                <li>
                  They are authorized to act on behalf of the listed company
                </li>
                <li>
                  They will promptly update information if material changes occur
                </li>
                <li>They will comply with all applicable securities laws</li>
              </ul>
            </div>

            {/* Fees */}
            <div className="mb-10">
              <h2 className="text-lg font-bold text-[#0A1F44] mb-4">Fees</h2>
              <p className="text-base text-[#6B7280] leading-relaxed">
                Capvista charges platform fees on completed investment
                transactions. Fee structures are disclosed during the investment
                process. Capvista Holdings receives a standardized 1% equity
                position from listed companies. We reserve the right to modify
                our fee structure with reasonable notice.
              </p>
            </div>

            {/* Intellectual Property */}
            <div className="mb-10">
              <h2 className="text-lg font-bold text-[#0A1F44] mb-4">
                Intellectual Property
              </h2>
              <p className="text-base text-[#6B7280] leading-relaxed">
                All platform content, design, trademarks, and technology are
                owned by Capvista. You may not copy, modify, or distribute our
                intellectual property without written consent.
              </p>
            </div>

            {/* Limitation of Liability */}
            <div className="mb-10">
              <h2 className="text-lg font-bold text-[#0A1F44] mb-4">
                Limitation of Liability
              </h2>
              <p className="text-base text-[#6B7280] leading-relaxed">
                To the maximum extent permitted by law, Capvista shall not be
                liable for any indirect, incidental, consequential, or punitive
                damages arising from your use of the platform or any investment
                made through it. Our total liability shall not exceed the fees
                you have paid to Capvista in the preceding 12 months.
              </p>
            </div>

            {/* Dispute Resolution */}
            <div className="mb-10">
              <h2 className="text-lg font-bold text-[#0A1F44] mb-4">
                Dispute Resolution
              </h2>
              <p className="text-base text-[#6B7280] leading-relaxed">
                Any disputes arising from these terms shall be resolved through
                binding arbitration in Lagos, Nigeria, unless otherwise required
                by your local jurisdiction. You agree to attempt informal
                resolution before initiating formal proceedings.
              </p>
            </div>

            {/* Termination */}
            <div className="mb-10">
              <h2 className="text-lg font-bold text-[#0A1F44] mb-4">
                Termination
              </h2>
              <p className="text-base text-[#6B7280] leading-relaxed mb-4">
                We may suspend or terminate your account if you:
              </p>
              <ul className="list-disc list-inside text-base text-[#6B7280] leading-relaxed space-y-2 mb-4">
                <li>Violate these terms</li>
                <li>Provide false or misleading information</li>
                <li>Fail to maintain qualification requirements</li>
                <li>
                  Engage in activity that poses a risk to the platform or other
                  users
                </li>
              </ul>
              <p className="text-base text-[#6B7280] leading-relaxed">
                You may close your account at any time through your profile
                settings.
              </p>
            </div>

            {/* Changes to Terms */}
            <div className="mb-10">
              <h2 className="text-lg font-bold text-[#0A1F44] mb-4">
                Changes to Terms
              </h2>
              <p className="text-base text-[#6B7280] leading-relaxed">
                We may update these terms from time to time. Material changes
                will be communicated via email or platform notification.
                Continued use of the platform after changes constitutes
                acceptance.
              </p>
            </div>

            {/* Contact */}
            <div>
              <h2 className="text-lg font-bold text-[#0A1F44] mb-4">
                Contact
              </h2>
              <p className="text-base text-[#6B7280] leading-relaxed">
                For questions about these terms, email{" "}
                <a
                  href="mailto:legal@capvista.com"
                  className="text-[#0A1F44] font-medium underline"
                >
                  legal@capvista.com
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
