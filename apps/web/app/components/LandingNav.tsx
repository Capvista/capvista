"use client";

import Link from "next/link";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useState, useRef, useEffect } from "react";

export default function LandingNav() {
  const { user, loading, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
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

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-md">
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

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center space-x-8">
          <a
            href="#how-it-works"
            className="text-gray-700 hover:text-gray-900 font-medium transition-colors text-sm"
          >
            How It Works
          </a>
          <Link
            href="/about"
            className="text-gray-700 hover:text-gray-900 font-medium transition-colors text-sm"
          >
            About Us
          </Link>

          {loading ? (
            <div className="w-20" />
          ) : user ? (
            <>
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors text-sm"
              >
                Dashboard
              </Link>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all hover:opacity-90"
                  style={{ backgroundColor: "#C8A24D", color: "#0B1C2D" }}
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
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors text-sm"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="inline-block px-6 py-2.5 rounded-lg font-semibold text-sm transition-all hover:opacity-90"
                style={{ backgroundColor: "#C8A24D", color: "#0B1C2D" }}
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>

        {/* Mobile nav */}
        <div className="md:hidden flex items-center space-x-4">
          {loading ? null : user ? (
            <>
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors text-sm"
              >
                Dashboard
              </Link>
              <button
                onClick={signOut}
                className="inline-block px-5 py-2 rounded-lg font-semibold text-sm transition-all hover:opacity-90"
                style={{ backgroundColor: "#C8A24D", color: "#0B1C2D" }}
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors text-sm"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="inline-block px-5 py-2 rounded-lg font-semibold text-sm transition-all hover:opacity-90"
                style={{ backgroundColor: "#C8A24D", color: "#0B1C2D" }}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
