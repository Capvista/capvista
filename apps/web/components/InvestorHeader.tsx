"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { ChevronDown, Search, BarChart3 } from "lucide-react";

export default function InvestorHeader() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [exploreOpen, setExploreOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const exploreRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  const userInitials =
    `${user?.firstName?.charAt(0) || ""}${user?.lastName?.charAt(0) || ""}`.toUpperCase() || "U";
  const userFullName =
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim();

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (exploreRef.current && !exploreRef.current.contains(e.target as Node)) {
        setExploreOpen(false);
      }
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div
              className="h-9 w-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#0A1F44" }}
            >
              <span className="font-bold text-base" style={{ color: "#0B1C2D" }}>
                CV
              </span>
            </div>
            <span className="text-xl font-bold" style={{ color: "#0B1C2D" }}>
              Capvista
            </span>
          </Link>

          <div className="flex items-center gap-8">
            <nav className="hidden md:flex items-center space-x-8">
              {/* Explore Dropdown */}
              <div className="relative" ref={exploreRef}>
                <button
                  onClick={() => setExploreOpen(!exploreOpen)}
                  className="flex items-center gap-1 font-medium text-gray-600 hover:text-gray-900 transition-colors text-sm"
                >
                  Explore
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${exploreOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {exploreOpen && (
                  <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                    <button
                      onClick={() => {
                        router.push("/dashboard/investor/companies");
                        setExploreOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-start gap-3"
                    >
                      <Search className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          Browse Companies
                        </p>
                        <p className="text-xs text-gray-500">
                          Explore our curated list of private companies
                        </p>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        router.push("/dashboard/investor?tab=portfolio");
                        setExploreOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-start gap-3"
                    >
                      <BarChart3 className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          Portfolio
                        </p>
                        <p className="text-xs text-gray-500">
                          Track your investments and returns
                        </p>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Dashboard */}
              <Link
                href="/dashboard/investor"
                className="font-medium text-gray-600 hover:text-gray-900 transition-colors text-sm"
              >
                Dashboard
              </Link>
            </nav>

            {/* Avatar Dropdown */}
            <div className="relative" ref={avatarRef}>
              <button
                onClick={() => setAvatarOpen(!avatarOpen)}
                className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#0B1C2D" }}
              >
                {userInitials}
              </button>
              {avatarOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="font-semibold text-gray-900 text-sm">
                      {userFullName}
                    </p>
                    <p className="text-xs text-gray-500">Investor</p>
                  </div>
                  <button
                    onClick={() => {
                      router.push("/dashboard/investor/profile/manage");
                      setAvatarOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 text-sm font-medium text-gray-700"
                  >
                    Manage Profile
                  </button>
                  <button
                    onClick={signOut}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 text-sm font-medium text-gray-700"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
