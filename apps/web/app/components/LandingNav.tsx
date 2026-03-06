"use client";

import Link from "next/link";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useState, useRef, useEffect } from "react";

export default function LandingNav() {
  const { user, loading, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = user ? `${user.firstName} ${user.lastName}` : "";

  const navLinks = [
    { label: "For Founders", href: "/for-founders" },
    { label: "For Investors", href: "/for-investors" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "About", href: "/about" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0A1F44] to-[#10B981]" />
          <span className="text-xl font-semibold text-[#0A1F44]">
            Capvista
          </span>
        </Link>

        {/* Center: Nav links (desktop) */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium transition-colors hover:text-[#10B981]"
              style={{ color: "#0A1F44" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: Auth actions (desktop) */}
        <div className="hidden md:flex items-center space-x-4">
          {loading ? (
            <div className="w-20" />
          ) : user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium transition-colors hover:text-[#10B981]"
                style={{ color: "#0A1F44" }}
              >
                Dashboard
              </Link>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 bg-[#10B981] text-white px-6 py-2 rounded-full text-sm font-semibold transition-colors hover:bg-[#059669]"
                >
                  {displayName}
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={dropdownOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
                    />
                  </svg>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      My Profile
                    </Link>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        signOut();
                      }}
                      className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium transition-colors hover:text-[#10B981]"
                style={{ color: "#0A1F44" }}
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="bg-[#10B981] text-white px-6 py-2 rounded-full text-sm font-semibold transition-colors hover:bg-[#059669]"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile: Hamburger + actions */}
        <div className="md:hidden flex items-center space-x-3">
          {loading ? null : user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium transition-colors hover:text-[#10B981]"
                style={{ color: "#0A1F44" }}
              >
                Dashboard
              </Link>
              <button
                onClick={signOut}
                className="bg-[#10B981] text-white px-5 py-2 rounded-full text-sm font-semibold transition-colors hover:bg-[#059669]"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium transition-colors hover:text-[#10B981]"
                style={{ color: "#0A1F44" }}
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="bg-[#10B981] text-white px-5 py-2 rounded-full text-sm font-semibold transition-colors hover:bg-[#059669]"
              >
                Get Started
              </Link>
            </>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-5 h-5"
              style={{ color: "#0A1F44" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium py-2 transition-colors hover:text-[#10B981]"
              style={{ color: "#0A1F44" }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
