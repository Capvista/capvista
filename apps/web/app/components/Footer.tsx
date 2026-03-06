import Link from "next/link";
import { Linkedin, Twitter, Mail } from "lucide-react";

export default function Footer() {
  return (
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
                <Link href="/for-founders" className="text-sm text-gray-400 hover:text-white transition-colors">
                  For Founders
                </Link>
              </li>
              <li>
                <Link href="/for-investors" className="text-sm text-gray-400 hover:text-white transition-colors">
                  For Investors
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-sm text-gray-400 hover:text-white transition-colors">
                  How It Works
                </Link>
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
  );
}
