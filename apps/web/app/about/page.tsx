import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F6F8FA" }}>
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-md">
        <div className="container flex items-center justify-between py-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0A1F44] to-[#10B981]" />
            <span className="text-xl font-semibold text-[#0A1F44]">
              Capvista
            </span>
          </Link>
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/about"
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors text-sm"
            >
              About Us
            </Link>
            <Link
              href="/login"
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors text-sm"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="inline-block px-6 py-2.5 rounded-lg font-semibold text-sm transition-all hover:opacity-90"
              style={{ backgroundColor: "#0A1F44", color: "#FFFFFF" }}
            >
              Sign Up
            </Link>
          </nav>
          <div className="md:hidden flex items-center space-x-4">
            <Link
              href="/login"
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors text-sm"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="inline-block px-5 py-2 rounded-lg font-semibold text-sm transition-all hover:opacity-90"
              style={{ backgroundColor: "#0A1F44", color: "#FFFFFF" }}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center py-24 px-6">
        <div className="text-center max-w-xl">
          <h1
            className="text-4xl md:text-5xl font-bold mb-6"
            style={{ color: "#0B1C2D" }}
          >
            About Capvista
          </h1>
          <p className="text-lg text-gray-500 mb-10 leading-relaxed">
            Capvista Holdings is building institutional capital infrastructure
            for African private markets. More information coming soon.
          </p>
          <p className="text-sm text-gray-400">
            &copy; 2026 Capvista Holdings. All rights reserved.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-16" style={{ backgroundColor: "#0B1C2D" }}>
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-2 mb-5">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0A1F44] to-[#10B981]" />
                <span className="text-lg font-semibold text-white tracking-tight">
                  Capvista
                </span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Institutional capital infrastructure for African private markets.
              </p>
            </div>
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
              </ul>
            </div>
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
