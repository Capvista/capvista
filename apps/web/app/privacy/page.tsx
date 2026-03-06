import LandingNav from "../components/LandingNav";
import Footer from "../components/Footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F6F8FA" }}>
      <LandingNav />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#0A1F44] to-[#1A3A6B] py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-300">Last updated: March 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-8 md:p-12">
            {/* Introduction */}
            <div className="mb-10">
              <h2 className="text-lg font-bold text-[#0A1F44] mb-4">
                Introduction
              </h2>
              <p className="text-base text-[#6B7280] leading-relaxed">
                Capvista Ltd (&quot;Capvista,&quot; &quot;we,&quot;
                &quot;us,&quot; or &quot;our&quot;) is committed to protecting
                your privacy. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information when you use our
                platform at capvista.com and related services.
              </p>
            </div>

            {/* Information We Collect */}
            <div className="mb-10">
              <h2 className="text-lg font-bold text-[#0A1F44] mb-4">
                Information We Collect
              </h2>
              <p className="text-base text-[#6B7280] leading-relaxed mb-4">
                We collect information you provide directly when creating an
                account and using our platform.
              </p>
              <p className="text-base text-[#6B7280] leading-relaxed mb-4">
                <span className="font-semibold text-[#374151]">
                  For investors,
                </span>{" "}
                this includes personal identification information (full name,
                date of birth, address, phone number), government-issued
                identification numbers (NIN, BVN, SSN, NI Number, or equivalent
                based on your jurisdiction), financial information (accreditation
                basis, AUM range, source of funds), and investment preferences.
              </p>
              <p className="text-base text-[#6B7280] leading-relaxed mb-4">
                <span className="font-semibold text-[#374151]">
                  For founders,
                </span>{" "}
                this includes personal identification, company registration
                details (CAC number, TIN), business information, financial
                statements, and team member details.
              </p>
              <p className="text-base text-[#6B7280] leading-relaxed">
                We also collect usage data including IP addresses, browser type,
                pages visited, and interaction patterns through standard
                analytics tools.
              </p>
            </div>

            {/* How We Use Your Information */}
            <div className="mb-10">
              <h2 className="text-lg font-bold text-[#0A1F44] mb-4">
                How We Use Your Information
              </h2>
              <p className="text-base text-[#6B7280] leading-relaxed mb-4">
                We use your information to:
              </p>
              <ul className="list-disc list-inside text-base text-[#6B7280] leading-relaxed space-y-2">
                <li>Verify your identity and qualification status</li>
                <li>Facilitate investment transactions</li>
                <li>
                  Comply with applicable securities regulations and anti-money
                  laundering requirements
                </li>
                <li>
                  Communicate with you about your account and investments
                </li>
                <li>Improve our platform and services</li>
                <li>Detect and prevent fraud</li>
              </ul>
            </div>

            {/* Information Sharing */}
            <div className="mb-10">
              <h2 className="text-lg font-bold text-[#0A1F44] mb-4">
                Information Sharing
              </h2>
              <p className="text-base text-[#6B7280] leading-relaxed mb-4">
                We do not sell your personal information. We may share your
                information with:
              </p>
              <ul className="list-disc list-inside text-base text-[#6B7280] leading-relaxed space-y-2">
                <li>Regulatory authorities when required by law</li>
                <li>
                  Identity verification service providers who assist with
                  KYC/AML checks
                </li>
                <li>Payment processors for transaction execution</li>
                <li>
                  Professional advisors (legal, accounting) as needed for
                  business operations
                </li>
              </ul>
              <p className="text-base text-[#6B7280] leading-relaxed mt-4">
                Investor information is shared with founders only to the extent
                necessary to complete investment transactions.
              </p>
            </div>

            {/* Data Security */}
            <div className="mb-10">
              <h2 className="text-lg font-bold text-[#0A1F44] mb-4">
                Data Security
              </h2>
              <p className="text-base text-[#6B7280] leading-relaxed mb-4">
                We implement industry-standard security measures including:
              </p>
              <ul className="list-disc list-inside text-base text-[#6B7280] leading-relaxed space-y-2">
                <li>Encryption of sensitive data in transit and at rest</li>
                <li>Secure storage of identity verification documents</li>
                <li>Role-based access controls</li>
                <li>Regular security assessments</li>
              </ul>
              <p className="text-base text-[#6B7280] leading-relaxed mt-4">
                No system is completely secure and we cannot guarantee absolute
                security of your data.
              </p>
            </div>

            {/* Data Retention */}
            <div className="mb-10">
              <h2 className="text-lg font-bold text-[#0A1F44] mb-4">
                Data Retention
              </h2>
              <p className="text-base text-[#6B7280] leading-relaxed">
                We retain your personal information for as long as your account
                is active and as required by applicable regulations. Investment
                records are retained for a minimum of 7 years after account
                closure for regulatory compliance purposes.
              </p>
            </div>

            {/* Your Rights */}
            <div className="mb-10">
              <h2 className="text-lg font-bold text-[#0A1F44] mb-4">
                Your Rights
              </h2>
              <p className="text-base text-[#6B7280] leading-relaxed mb-4">
                Depending on your jurisdiction, you may have rights to:
              </p>
              <ul className="list-disc list-inside text-base text-[#6B7280] leading-relaxed space-y-2">
                <li>Access, correct, or delete your personal information</li>
                <li>Object to certain processing</li>
                <li>Request data portability</li>
                <li>Withdraw consent</li>
              </ul>
              <p className="text-base text-[#6B7280] leading-relaxed mt-4">
                To exercise these rights, contact us at{" "}
                <a
                  href="mailto:privacy@capvista.com"
                  className="text-[#0A1F44] font-medium underline"
                >
                  privacy@capvista.com
                </a>
                .
              </p>
            </div>

            {/* International Data Transfers */}
            <div className="mb-10">
              <h2 className="text-lg font-bold text-[#0A1F44] mb-4">
                International Data Transfers
              </h2>
              <p className="text-base text-[#6B7280] leading-relaxed">
                Your information may be transferred to and processed in
                countries other than your country of residence. We ensure
                appropriate safeguards are in place for such transfers.
              </p>
            </div>

            {/* Changes to This Policy */}
            <div className="mb-10">
              <h2 className="text-lg font-bold text-[#0A1F44] mb-4">
                Changes to This Policy
              </h2>
              <p className="text-base text-[#6B7280] leading-relaxed">
                We may update this Privacy Policy from time to time. We will
                notify you of material changes via email or through the
                platform.
              </p>
            </div>

            {/* Contact */}
            <div>
              <h2 className="text-lg font-bold text-[#0A1F44] mb-4">
                Contact
              </h2>
              <p className="text-base text-[#6B7280] leading-relaxed">
                For privacy-related inquiries, email{" "}
                <a
                  href="mailto:privacy@capvista.com"
                  className="text-[#0A1F44] font-medium underline"
                >
                  privacy@capvista.com
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
