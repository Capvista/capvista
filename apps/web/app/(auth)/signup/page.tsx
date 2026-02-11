import Link from "next/link";

export default function SignupPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center py-12"
      style={{ backgroundColor: "#F6F8FA" }}
    >
      <div className="max-w-4xl w-full mx-4">
        {/* Logo */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div
              className="h-12 w-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#C8A24D" }}
            >
              <span className="font-bold text-xl" style={{ color: "#0B1C2D" }}>
                CV
              </span>
            </div>
            <span className="text-2xl font-bold text-primary-950">
              Capvista
            </span>
          </Link>
          <h1 className="mt-6 text-4xl font-bold text-primary-950">
            Get Started
          </h1>
          <p className="mt-2 text-xl text-slate-light">
            Choose how you'd like to join Capvista
          </p>
        </div>

        {/* Role Selection */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Investor Card */}
          <Link
            href="/signup/investor"
            className="group bg-white rounded-2xl shadow-sm border-2 border-gray-200 p-8 hover:shadow-xl hover:border-primary-900 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "rgba(200, 162, 77, 0.1)" }}
              >
                <svg
                  className="w-6 h-6"
                  style={{ color: "#C8A24D" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <span className="text-sm uppercase tracking-wider font-semibold text-slate">
                Investors
              </span>
            </div>

            <h3 className="text-2xl font-bold text-primary-950 mb-3 group-hover:text-primary-900 transition-colors">
              Sign up as Investor
            </h3>

            <p className="text-slate-light leading-relaxed mb-6">
              Access exclusive, verified investment opportunities in Africa's
              top private companies.
            </p>

            <div
              className="flex items-center gap-2 font-semibold"
              style={{ color: "#0B1C2D" }}
            >
              Continue as Investor
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>

          {/* Founder Card */}
          <Link
            href="/signup/founder"
            className="group bg-white rounded-2xl shadow-sm border-2 border-gray-200 p-8 hover:shadow-xl hover:border-primary-900 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "rgba(200, 162, 77, 0.1)" }}
              >
                <svg
                  className="w-6 h-6"
                  style={{ color: "#C8A24D" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <span className="text-sm uppercase tracking-wider font-semibold text-slate">
                Companies
              </span>
            </div>

            <h3 className="text-2xl font-bold text-primary-950 mb-3 group-hover:text-primary-900 transition-colors">
              Sign up as Founder
            </h3>

            <p className="text-slate-light leading-relaxed mb-6">
              Connect with qualified investors and raise capital through
              structured investment vehicles.
            </p>

            <div
              className="flex items-center gap-2 font-semibold"
              style={{ color: "#0B1C2D" }}
            >
              Continue as Founder
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>
        </div>

        {/* Login Link */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold hover:underline"
              style={{ color: "#0B1C2D" }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
