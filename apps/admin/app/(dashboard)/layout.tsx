"use client";

import { useAuth } from "@/lib/contexts/AuthContext";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/", icon: "home" },
  { label: "Companies", href: "/companies", icon: "building" },
  { label: "Deals", href: "/deals", icon: "deals" },
  { label: "Investors", href: "/investors", icon: "users" },
  { label: "Investments", href: "/investments", icon: "investments" },
  { label: "Users", href: "/users", icon: "people" },
  { label: "Activity Log", href: "/activity", icon: "clock" },
  { label: "Monitoring", href: "/monitoring", icon: "pulse" },
];

function NavIcon({ icon, size = 20 }: { icon: string; size?: number }) {
  const s = { width: size, height: size, strokeWidth: 1.5 };
  switch (icon) {
    case "home":
      return (
        <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case "building":
      return (
        <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
          <path d="M9 22v-4h6v4" />
          <path d="M8 6h.01" /><path d="M16 6h.01" />
          <path d="M8 10h.01" /><path d="M16 10h.01" />
          <path d="M8 14h.01" /><path d="M16 14h.01" />
        </svg>
      );
    case "users":
      return (
        <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "people":
      return (
        <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case "deals":
      return (
        <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      );
    case "investments":
      return (
        <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      );
    case "clock":
      return (
        <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case "pulse":
      return (
        <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      );
    default:
      return null;
  }
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#F6F8FA" }}>
        <div style={{ color: "#6B7280" }}>Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F6F8FA" }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.3)", zIndex: 40 }}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          width: 240,
          backgroundColor: "#FFFFFF",
          borderRight: "1px solid #E5E7EB",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: sidebarOpen ? 0 : -240,
          bottom: 0,
          zIndex: 50,
          transition: "left 0.2s",
        }}
        className="sidebar-desktop"
      >
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #E5E7EB", display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              backgroundColor: "#0A1F44",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 700,
              color: "#FFFFFF",
            }}
          >
            CV
          </div>
          <span style={{ fontSize: 16, fontWeight: 600, color: "#0A1F44" }}>Capvista Admin</span>
        </div>

        <nav style={{ flex: 1, padding: "16px 12px" }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                  borderRadius: 8,
                  marginBottom: 4,
                  color: isActive ? "#FFFFFF" : "#4B5563",
                  backgroundColor: isActive ? "#0A1F44" : "transparent",
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 400,
                  transition: "all 0.15s",
                }}
              >
                <NavIcon icon={item.icon} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, marginLeft: 240 }} className="main-content">
        {/* Header */}
        <header
          style={{
            height: 64,
            backgroundColor: "#FFFFFF",
            borderBottom: "1px solid #E5E7EB",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            position: "sticky",
            top: 0,
            zIndex: 30,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mobile-menu-btn"
              style={{
                display: "none",
                background: "none",
                border: "none",
                color: "#6B7280",
                cursor: "pointer",
                padding: 4,
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ color: "#6B7280", fontSize: 14 }}>
              {user.firstName} {user.lastName}
            </span>
            <button
              onClick={signOut}
              style={{
                padding: "6px 16px",
                backgroundColor: "transparent",
                border: "1px solid #E5E7EB",
                borderRadius: 6,
                color: "#6B7280",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </div>
        </header>

        {/* Page content */}
        <main style={{ padding: 24 }}>{children}</main>
      </div>

      <style jsx global>{`
        @media (min-width: 769px) {
          .sidebar-desktop {
            left: 0 !important;
          }
        }
        @media (max-width: 768px) {
          .main-content {
            margin-left: 0 !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}
