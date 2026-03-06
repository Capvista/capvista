import LandingNav from "../components/LandingNav";
import Footer from "../components/Footer";

export default function CompliancePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F6F8FA" }}>
      <LandingNav />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#0A1F44] to-[#1A3A6B] py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Compliance
          </h1>
          <p className="text-lg text-gray-300">
            Our approach to regulatory compliance and investor protection
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-8 md:p-12">
            {/* Our Compliance Framework */}
            <div className="mb-10">
              <h2 className="text-lg font-bold text-[#0A1F44] mb-4">
                Our Compliance Framework
              </h2>
              <p className="text-base text-[#6B7280] leading-relaxed">
                Capvista operates as a private placement platform. We are
                committed to maintaining the highest standards of regulatory
                compliance across all jurisdictions in which we operate. Our
                platform is designed to facilitate private securities
                transactions between verified companies and qualified investors
                in accordance with applicable securities laws.
              </p>
            </div>

            {/* Know Your Customer (KYC) */}
            <div className="mb-10">
              <h2 className="text-lg font-bold text-[#0A1F44] mb-4">
                Know Your Customer (KYC)
              </h2>
              <p className="text-base text-[#6B7280] leading-relaxed">
                Every user on Capvista undergoes identity verification. For
                Nigerian users, we verify National Identification Numbers (NIN)
                and Bank Verification Numbers (BVN). For US-based users, we
                collect Social Security Numbers and verify through authorized
                third-party services. For UK-based users, we verify National
                Insurance Numbers. For users in other jurisdictions, we apply
                equivalent verification standards based on local requirements.
              </p>
            </div>

            {/* Investor Qualification */}
            <div className="mb-10">
              <h2 className="text-lg font-bold text-[#0A1F44] mb-4">
                Investor Qualification
              </h2>
              <p className="text-base text-[#6B7280] leading-relaxed">
                We apply jurisdiction-specific qualification standards to all
                investors. US investors must meet SEC accredited investor
                criteria. UK investors must qualify as High Net Worth or
                Sophisticated Investors under FCA standards. Nigerian investors
                are assessed under our Capvista Qualified Investor Policy, which
                evaluates financial capacity, investment experience, and risk
                understanding. Investors from other jurisdictions are assessed
                under the most relevant applicable standard.
              </p>
            </div>

            {/* Anti-Money Laundering (AML) */}
            <div className="mb-10">
              <h2 className="text-lg font-bold text-[#0A1F44] mb-4">
                Anti-Money Laundering (AML)
              </h2>
              <p className="text-base text-[#6B7280] leading-relaxed mb-4">
                Capvista maintains an AML compliance program that includes:
              </p>
              <ul className="list-disc list-inside text-base text-[#6B7280] leading-relaxed space-y-2 mb-4">
                <li>Screening against global sanctions lists</li>
                <li>Monitoring transactions for suspicious activity</li>
                <li>Reporting obligations to relevant authorities</li>
                <li>Ongoing due diligence on platform participants</li>
              </ul>
              <p className="text-base text-[#6B7280] leading-relaxed">
                We cooperate fully with regulatory and law enforcement
                authorities.
              </p>
            </div>

            {/* Company Verification */}
            <div className="mb-10">
              <h2 className="text-lg font-bold text-[#0A1F44] mb-4">
                Company Verification
              </h2>
              <p className="text-base text-[#6B7280] leading-relaxed mb-4">
                Companies listed on Capvista undergo multi-layer verification
                including:
              </p>
              <ul className="list-disc list-inside text-base text-[#6B7280] leading-relaxed space-y-2 mb-4">
                <li>
                  Corporate registration verification through the Corporate
                  Affairs Commission (CAC) for Nigerian entities
                </li>
                <li>Director and founder identity verification</li>
                <li>Bank account ownership confirmation</li>
                <li>Tax identification verification</li>
                <li>Review of financial documentation</li>
              </ul>
              <p className="text-base text-[#6B7280] leading-relaxed">
                Verification does not constitute an endorsement or guarantee of
                any company&apos;s financial performance.
              </p>
            </div>

            {/* Private Placement Posture */}
            <div className="mb-10">
              <h2 className="text-lg font-bold text-[#0A1F44] mb-4">
                Private Placement Posture
              </h2>
              <p className="text-base text-[#6B7280] leading-relaxed">
                All offerings on Capvista are structured as private placements.
                We do not engage in public solicitation of securities. Access to
                deal details is restricted to qualified investors. Our platform
                operates under exemptions from public offering registration
                requirements in applicable jurisdictions.
              </p>
            </div>

            {/* Ongoing Monitoring */}
            <div className="mb-10">
              <h2 className="text-lg font-bold text-[#0A1F44] mb-4">
                Ongoing Monitoring
              </h2>
              <p className="text-base text-[#6B7280] leading-relaxed mb-4">
                Approved companies are subject to ongoing monitoring. Our system
                tracks company status signals across three categories:
              </p>
              <ul className="list-disc list-inside text-base text-[#6B7280] leading-relaxed space-y-2 mb-4">
                <li>
                  <span className="font-semibold text-[#374151]">Normal</span>{" "}
                  — operating as expected
                </li>
                <li>
                  <span className="font-semibold text-[#374151]">Watch</span> —
                  potential concerns identified
                </li>
                <li>
                  <span className="font-semibold text-[#374151]">
                    Intervention
                  </span>{" "}
                  — material issues requiring attention
                </li>
              </ul>
              <p className="text-base text-[#6B7280] leading-relaxed">
                Investors receive notifications of status changes for companies
                in their portfolio.
              </p>
            </div>

            {/* Accreditation Reconfirmation */}
            <div className="mb-10">
              <h2 className="text-lg font-bold text-[#0A1F44] mb-4">
                Accreditation Reconfirmation
              </h2>
              <p className="text-base text-[#6B7280] leading-relaxed">
                Investor accreditation expires after 12 months. Investors must
                reconfirm their qualification status annually to continue making
                new investments. This ensures ongoing compliance with
                qualification requirements.
              </p>
            </div>

            {/* Contact */}
            <div>
              <h2 className="text-lg font-bold text-[#0A1F44] mb-4">
                Contact
              </h2>
              <p className="text-base text-[#6B7280] leading-relaxed">
                For compliance-related inquiries, email{" "}
                <a
                  href="mailto:compliance@capvista.com"
                  className="text-[#0A1F44] font-medium underline"
                >
                  compliance@capvista.com
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
