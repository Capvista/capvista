import Link from "next/link";

export default function RiskDisclosurePage() {
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
          Risk Disclosure
        </h1>
        <div className="space-y-6 text-gray-600 leading-relaxed">
          <p>
            Investing in private companies involves significant risk, including
            the potential loss of your entire investment. Securities offered
            through Capvista are illiquid, speculative, and suitable only for
            qualified investors who can bear the risk of loss.
          </p>
          <p>
            Past performance is not indicative of future results. The value of
            investments may fluctuate, and investors may not receive back the
            amount originally invested. Each investment opportunity carries its
            own risk profile, which should be carefully reviewed before making
            any commitment.
          </p>
          <p className="text-sm text-gray-400 pt-8 border-t border-gray-200">
            Full risk disclosure documentation is currently being finalized. For
            questions, contact{" "}
            <a
              href="mailto:legal@capvista.com"
              className="underline hover:text-gray-600"
            >
              legal@capvista.com
            </a>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
