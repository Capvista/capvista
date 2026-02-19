import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F6F8FA" }}>
      <header className="border-b border-gray-200 bg-white">
        <div className="container flex items-center justify-between py-4">
          <Link href="/" className="flex items-center space-x-2">
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
            <span className="text-xl font-bold" style={{ color: "#0B1C2D" }}>
              Capvista
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </header>

      <main className="container py-20 max-w-3xl mx-auto">
        <h1
          className="text-4xl font-bold mb-6"
          style={{ color: "#0B1C2D" }}
        >
          About Capvista
        </h1>
        <div className="space-y-6 text-gray-600 leading-relaxed">
          <p>
            Capvista is institutional capital infrastructure for African private
            markets. We provide the trust, structure, and execution layer that
            enables qualified global investors to participate in verified private
            placements across the continent.
          </p>
          <p>
            Our platform standardizes the investment process — from issuer
            verification and deal structuring to subscription management and
            post-investment monitoring — removing the opacity and friction that
            has historically limited cross-border private capital flows into
            African companies.
          </p>
          <p>
            Capvista operates two structured investment lanes: the Yield Lane
            for cash-flow participation instruments, and the Ventures Lane for
            equity and convertible positions. Each offering undergoes rigorous
            review before becoming accessible to verified investors.
          </p>
          <p className="text-sm text-gray-400 pt-8 border-t border-gray-200">
            This page is under development. For inquiries, contact{" "}
            <a
              href="mailto:info@capvista.com"
              className="underline hover:text-gray-600"
            >
              info@capvista.com
            </a>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
