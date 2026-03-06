import LandingNav from "../components/LandingNav";
import Footer from "../components/Footer";

export default function SecurityPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F6F8FA" }}>
      <LandingNav />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#0A1F44] to-[#1A3A6B] py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Security
          </h1>
          <p className="text-lg text-gray-300">
            How we protect your data and your investments
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-8 md:p-12">
            {/* Our Commitment */}
            <div className="mb-10">
              <h2 className="text-lg font-bold text-[#0A1F44] mb-4">
                Our Commitment
              </h2>
              <p className="text-base text-[#6B7280] leading-relaxed">
                Security is foundational to everything we build at Capvista. We
                handle sensitive personal, financial, and identity data, and we
                take that responsibility seriously.
              </p>
            </div>

            {/* Data Encryption */}
            <div className="mb-10">
              <h2 className="text-lg font-bold text-[#0A1F44] mb-4">
                Data Encryption
              </h2>
              <p className="text-base text-[#6B7280] leading-relaxed">
                All data transmitted between your browser and our servers is
                encrypted using TLS 1.3. Sensitive data including identity
                verification numbers, financial information, and authentication
                credentials is encrypted at rest using AES-256 encryption.
              </p>
            </div>

            {/* Authentication & Access */}
            <div className="mb-10">
              <h2 className="text-lg font-bold text-[#0A1F44] mb-4">
                Authentication &amp; Access
              </h2>
              <p className="text-base text-[#6B7280] leading-relaxed">
                User accounts are protected by secure password hashing, session
                management with automatic expiration, and role-based access
                controls that limit data visibility based on user type. Admin
                access to sensitive data requires additional authentication and
                is logged for audit purposes.
              </p>
            </div>

            {/* Infrastructure */}
            <div className="mb-10">
              <h2 className="text-lg font-bold text-[#0A1F44] mb-4">
                Infrastructure
              </h2>
              <p className="text-base text-[#6B7280] leading-relaxed">
                Our platform is hosted on enterprise-grade cloud infrastructure
                with automated backups, geographic redundancy, and 24/7
                monitoring. We use Supabase for authentication and database
                services, which provides built-in security features including
                row-level security policies.
              </p>
            </div>

            {/* Identity Data Handling */}
            <div className="mb-10">
              <h2 className="text-lg font-bold text-[#0A1F44] mb-4">
                Identity Data Handling
              </h2>
              <p className="text-base text-[#6B7280] leading-relaxed mb-4">
                Government-issued identification numbers (NIN, BVN, SSN, NI
                Number) are among the most sensitive data we handle. These are:
              </p>
              <ul className="list-disc list-inside text-base text-[#6B7280] leading-relaxed space-y-2">
                <li>Encrypted immediately upon submission</li>
                <li>Accessible only to authorized compliance personnel</li>
                <li>
                  Never displayed in full on the platform (masked as ****1234)
                </li>
                <li>Stored separately from general account data</li>
              </ul>
            </div>

            {/* Incident Response */}
            <div className="mb-10">
              <h2 className="text-lg font-bold text-[#0A1F44] mb-4">
                Incident Response
              </h2>
              <p className="text-base text-[#6B7280] leading-relaxed">
                We maintain an incident response plan for potential security
                events. In the event of a data breach, we will promptly notify
                affected users and relevant authorities as required by applicable
                regulations.
              </p>
            </div>

            {/* Responsible Disclosure */}
            <div className="mb-10">
              <h2 className="text-lg font-bold text-[#0A1F44] mb-4">
                Responsible Disclosure
              </h2>
              <p className="text-base text-[#6B7280] leading-relaxed">
                If you discover a security vulnerability on our platform, please
                report it to{" "}
                <a
                  href="mailto:security@capvista.com"
                  className="text-[#0A1F44] font-medium underline"
                >
                  security@capvista.com
                </a>
                . We appreciate responsible disclosure and will work with you to
                address any legitimate security concerns.
              </p>
            </div>

            {/* Contact */}
            <div>
              <h2 className="text-lg font-bold text-[#0A1F44] mb-4">
                Contact
              </h2>
              <p className="text-base text-[#6B7280] leading-relaxed">
                For security-related inquiries or to report a concern, email{" "}
                <a
                  href="mailto:security@capvista.com"
                  className="text-[#0A1F44] font-medium underline"
                >
                  security@capvista.com
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
