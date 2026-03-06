import Link from "next/link";
import LandingNav from "../components/LandingNav";
import Footer from "../components/Footer";

export default function PricingPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F6F8FA" }}>
      <LandingNav />

      <section className="bg-gradient-to-br from-[#0A1F44] to-[#1A3A6B] py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Pricing
          </h1>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg border border-[#E5E7EB] p-10 shadow-sm text-center">
            <p className="text-lg text-[#0A1F44] mb-6">
              This page is coming soon. We&apos;re working on it.
            </p>
            <Link
              href="/"
              className="text-sm font-medium text-[#0A1F44] hover:underline"
            >
              &larr; Back to Home
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
