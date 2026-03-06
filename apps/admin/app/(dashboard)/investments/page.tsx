"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import Link from "next/link";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://capvista-api.onrender.com";

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    INTERESTED: { bg: "rgba(148, 163, 184, 0.1)", text: "#94A3B8" },
    COMMITTED: { bg: "rgba(139, 92, 246, 0.1)", text: "#8B5CF6" },
    PENDING_FUNDING: { bg: "rgba(245, 158, 11, 0.1)", text: "#F59E0B" },
    FUNDED: { bg: "rgba(16, 185, 129, 0.1)", text: "#10B981" },
    ACTIVE: { bg: "rgba(59, 130, 246, 0.1)", text: "#3B82F6" },
    COMPLETED: { bg: "rgba(16, 185, 129, 0.1)", text: "#10B981" },
    DEFAULTED: { bg: "rgba(239, 68, 68, 0.1)", text: "#EF4444" },
    CANCELLED: { bg: "rgba(107, 114, 128, 0.1)", text: "#6B7280" },
    WAITLISTED: { bg: "rgba(245, 158, 11, 0.1)", text: "#F59E0B" },
  };
  const c = colors[status] || colors.INTERESTED;
  return (
    <span style={{ padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500, backgroundColor: c.bg, color: c.text }}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

export default function InvestmentsPage() {
  const { accessToken } = useAuth();
  const [investments, setInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });

  const fetchInvestments = async (page = 1) => {
    if (!accessToken) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (search) params.set("search", search);
    params.set("page", String(page));

    try {
      const res = await fetch(`${API_URL}/api/admin/investments?${params}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (data.success) {
        setInvestments(data.data);
        setMeta(data.meta);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, [accessToken, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInvestments(1);
  };

  const selectStyle: React.CSSProperties = {
    padding: "8px 12px",
    backgroundColor: "#FFFFFF",
    border: "1px solid #E5E7EB",
    borderRadius: 6,
    color: "#111827",
    fontSize: 13,
  };

  const formatCurrency = (value: any) => {
    if (!value) return "—";
    return `$${Number(value).toLocaleString()}`;
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, color: "#0A1F44" }}>Investments</h1>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
          <option value="">All Statuses</option>
          <option value="INTERESTED">Interested</option>
          <option value="COMMITTED">Committed</option>
          <option value="PENDING_FUNDING">Pending Funding</option>
          <option value="FUNDED">Funded</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
          <option value="DEFAULTED">Defaulted</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="WAITLISTED">Waitlisted</option>
        </select>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 8 }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by investor name, email, or deal..."
            style={{ ...selectStyle, width: 300 }}
          />
          <button
            type="submit"
            style={{ padding: "8px 16px", backgroundColor: "#0A1F44", color: "#FFFFFF", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #E5E7EB", backgroundColor: "#F9FAFB" }}>
                {["Investor", "Deal", "Company", "Amount", "Status", "Date"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontSize: 12, fontWeight: 500, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: 24, textAlign: "center", color: "#6B7280" }}>Loading...</td></tr>
              ) : investments.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 24, textAlign: "center", color: "#6B7280" }}>No investments found</td></tr>
              ) : (
                investments.map((inv) => (
                  <tr key={inv.id} style={{ borderBottom: "1px solid #E5E7EB", cursor: "pointer" }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F9FAFB")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>
                    <td style={{ padding: "12px 16px" }}>
                      <Link href={`/investments/${inv.id}`} style={{ textDecoration: "none" }}>
                        <div style={{ fontSize: 14, fontWeight: 500, color: "#111827" }}>
                          {inv.investor?.fullName || `${inv.investor?.user?.firstName || ""} ${inv.investor?.user?.lastName || ""}`.trim() || "—"}
                        </div>
                        <div style={{ fontSize: 12, color: "#6B7280" }}>{inv.investor?.user?.email}</div>
                      </Link>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Link href={`/deals/${inv.deal?.id}`} style={{ fontSize: 14, color: "#0A1F44", textDecoration: "none", fontWeight: 500 }}>
                        {inv.deal?.name || "—"}
                      </Link>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 14, color: "#6B7280" }}>
                      {inv.deal?.company?.legalName || "—"}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 14, color: "#111827", fontWeight: 500 }}>
                      {formatCurrency(inv.commitmentAmount)}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <StatusBadge status={inv.status} />
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#6B7280" }}>
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: 16, borderTop: "1px solid #E5E7EB" }}>
            {Array.from({ length: meta.totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => fetchInvestments(i + 1)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: "1px solid #E5E7EB",
                  backgroundColor: meta.page === i + 1 ? "#0A1F44" : "transparent",
                  color: meta.page === i + 1 ? "#FFFFFF" : "#6B7280",
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
