"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type Stats = {
  companies: { total: number; pending: number; approved: number; rejected: number };
  investors: { total: number; pending: number; verified: number; rejected: number };
  users: number;
  deals: { total: number; underReview: number; approved: number; live: number };
};

type FeedItem = {
  type: "Company" | "Investor";
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
};

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    PENDING_REVIEW: { bg: "rgba(245, 158, 11, 0.15)", text: "#F59E0B" },
    PENDING: { bg: "rgba(245, 158, 11, 0.15)", text: "#F59E0B" },
    APPROVED: { bg: "rgba(16, 185, 129, 0.15)", text: "#10B981" },
    VERIFIED: { bg: "rgba(16, 185, 129, 0.15)", text: "#10B981" },
    REJECTED: { bg: "rgba(239, 68, 68, 0.15)", text: "#EF4444" },
    INFO_REQUESTED: { bg: "rgba(59, 130, 246, 0.15)", text: "#3B82F6" },
  };
  const c = colors[status] || colors.PENDING;
  return (
    <span
      style={{
        padding: "4px 10px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 500,
        backgroundColor: c.bg,
        color: c.text,
      }}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

export default function DashboardPage() {
  const { accessToken } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;

    const headers = { Authorization: `Bearer ${accessToken}` };

    Promise.all([
      fetch(`${API_URL}/api/admin/stats`, { headers }).then((r) => r.json()),
      fetch(`${API_URL}/api/admin/activity/recent`, { headers }).then((r) => r.json()),
    ])
      .then(([statsRes, feedRes]) => {
        if (statsRes.success) setStats(statsRes.data);
        if (feedRes.success) setFeed(feedRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [accessToken]);

  if (loading) {
    return <div style={{ color: "#94A3B8", padding: 40, textAlign: "center" }}>Loading dashboard...</div>;
  }

  const statCards = stats
    ? [
        {
          title: "Companies",
          total: stats.companies.total,
          subs: [
            { label: "Pending", value: stats.companies.pending, color: "#F59E0B" },
            { label: "Approved", value: stats.companies.approved, color: "#10B981" },
            { label: "Rejected", value: stats.companies.rejected, color: "#EF4444" },
          ],
          href: "/companies",
        },
        {
          title: "Investors",
          total: stats.investors.total,
          subs: [
            { label: "Pending", value: stats.investors.pending, color: "#F59E0B" },
            { label: "Verified", value: stats.investors.verified, color: "#10B981" },
            { label: "Rejected", value: stats.investors.rejected, color: "#EF4444" },
          ],
          href: "/investors",
        },
        {
          title: "Users",
          total: stats.users,
          subs: [],
          href: "/users",
        },
        {
          title: "Deals",
          total: stats.deals.total,
          subs: [
            { label: "Review", value: stats.deals.underReview, color: "#F59E0B" },
            { label: "Approved", value: stats.deals.approved, color: "#10B981" },
            { label: "Live", value: stats.deals.live, color: "#3B82F6" },
          ],
          href: "/deals",
        },
      ]
    : [];

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Dashboard</h1>

      {/* Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        {statCards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            style={{
              backgroundColor: "#1A2332",
              border: "1px solid #2A3444",
              borderRadius: 12,
              padding: 24,
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div style={{ fontSize: 14, color: "#94A3B8", marginBottom: 8 }}>{card.title}</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#FFFFFF", marginBottom: 12 }}>
              {card.total}
            </div>
            {card.subs.length > 0 && (
              <div style={{ display: "flex", gap: 16 }}>
                {card.subs.map((s) => (
                  <div key={s.label}>
                    <div style={{ fontSize: 12, color: "#94A3B8" }}>{s.label}</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div
        style={{
          backgroundColor: "#1A2332",
          border: "1px solid #2A3444",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #2A3444" }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Recent Submissions</h2>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #2A3444" }}>
                {["Type", "Name", "Email", "Status", "Date"].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "12px 16px",
                      fontSize: 12,
                      fontWeight: 500,
                      color: "#94A3B8",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {feed.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 24, textAlign: "center", color: "#94A3B8" }}>
                    No recent submissions
                  </td>
                </tr>
              ) : (
                feed.map((item) => (
                  <tr key={`${item.type}-${item.id}`} style={{ borderBottom: "1px solid #2A3444" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 500,
                          backgroundColor: item.type === "Company" ? "rgba(200, 162, 77, 0.15)" : "rgba(59, 130, 246, 0.15)",
                          color: item.type === "Company" ? "#C8A24D" : "#3B82F6",
                        }}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 14, color: "#FFFFFF" }}>
                      <Link
                        href={item.type === "Company" ? `/companies/${item.id}` : `/investors/${item.id}`}
                        style={{ color: "#FFFFFF", textDecoration: "none" }}
                      >
                        {item.name || "—"}
                      </Link>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 14, color: "#94A3B8" }}>{item.email}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <StatusBadge status={item.status} />
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 14, color: "#94A3B8" }}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
