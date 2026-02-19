"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    DRAFT: { bg: "rgba(148, 163, 184, 0.15)", text: "#94A3B8" },
    UNDER_REVIEW: { bg: "rgba(245, 158, 11, 0.15)", text: "#F59E0B" },
    APPROVED: { bg: "rgba(16, 185, 129, 0.15)", text: "#10B981" },
    LIVE: { bg: "rgba(59, 130, 246, 0.15)", text: "#3B82F6" },
    CLOSED: { bg: "rgba(107, 114, 128, 0.15)", text: "#6B7280" },
    DEFAULTED: { bg: "rgba(239, 68, 68, 0.15)", text: "#EF4444" },
  };
  const c = colors[status] || colors.DRAFT;
  return (
    <span style={{ padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500, backgroundColor: c.bg, color: c.text }}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

function LaneBadge({ lane }: { lane: string }) {
  const isYield = lane === "YIELD";
  return (
    <span
      style={{
        padding: "4px 8px",
        borderRadius: 4,
        fontSize: 12,
        fontWeight: 500,
        backgroundColor: isYield ? "rgba(200, 162, 77, 0.15)" : "rgba(139, 92, 246, 0.15)",
        color: isYield ? "#C8A24D" : "#8B5CF6",
      }}
    >
      {lane}
    </span>
  );
}

export default function DealsPage() {
  const { accessToken } = useAuth();
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [laneFilter, setLaneFilter] = useState("");
  const [search, setSearch] = useState("");
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });

  const fetchDeals = async (page = 1) => {
    if (!accessToken) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (laneFilter) params.set("lane", laneFilter);
    if (search) params.set("search", search);
    params.set("page", String(page));

    try {
      const res = await fetch(`${API_URL}/api/admin/deals?${params}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (data.success) {
        setDeals(data.data);
        setMeta(data.meta);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, [accessToken, statusFilter, laneFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDeals(1);
  };

  const selectStyle: React.CSSProperties = {
    padding: "8px 12px",
    backgroundColor: "#0F1729",
    border: "1px solid #2A3444",
    borderRadius: 6,
    color: "#FFFFFF",
    fontSize: 13,
  };

  const formatCurrency = (value: any) => {
    if (!value) return "—";
    return `$${Number(value).toLocaleString()}`;
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Deals</h1>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="APPROVED">Approved</option>
          <option value="LIVE">Live</option>
          <option value="CLOSED">Closed</option>
          <option value="DEFAULTED">Defaulted</option>
        </select>
        <select value={laneFilter} onChange={(e) => setLaneFilter(e.target.value)} style={selectStyle}>
          <option value="">All Lanes</option>
          <option value="YIELD">Yield</option>
          <option value="VENTURES">Ventures</option>
        </select>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 8 }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by deal or company name..."
            style={{ ...selectStyle, width: 260 }}
          />
          <button
            type="submit"
            style={{ padding: "8px 16px", backgroundColor: "#C8A24D", color: "#0B1220", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: "#1A2332", border: "1px solid #2A3444", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #2A3444" }}>
                {["Deal", "Company", "Lane", "Instrument", "Target", "Status", "Created"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontSize: 12, fontWeight: 500, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: 24, textAlign: "center", color: "#94A3B8" }}>Loading...</td></tr>
              ) : deals.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 24, textAlign: "center", color: "#94A3B8" }}>No deals found</td></tr>
              ) : (
                deals.map((d) => (
                  <tr key={d.id} style={{ borderBottom: "1px solid #2A3444", cursor: "pointer" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <Link href={`/deals/${d.id}`} style={{ textDecoration: "none", color: "#FFFFFF", fontSize: 14, fontWeight: 500 }}>
                        {d.name}
                      </Link>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {d.company?.logoUrl ? (
                          <img src={d.company.logoUrl} alt="" style={{ width: 24, height: 24, borderRadius: 4, objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: 24, height: 24, borderRadius: 4, backgroundColor: "#2A3444", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#94A3B8" }}>
                            {d.company?.legalName?.charAt(0)}
                          </div>
                        )}
                        <span style={{ fontSize: 14, color: "#94A3B8" }}>{d.company?.legalName}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}><LaneBadge lane={d.lane} /></td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#94A3B8" }}>{d.instrumentType?.replace(/_/g, " ")}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#94A3B8" }}>{formatCurrency(d.targetAmount)}</td>
                    <td style={{ padding: "12px 16px" }}><StatusBadge status={d.status} /></td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#94A3B8" }}>{new Date(d.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: 16, borderTop: "1px solid #2A3444" }}>
            {Array.from({ length: meta.totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => fetchDeals(i + 1)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: "1px solid #2A3444",
                  backgroundColor: meta.page === i + 1 ? "#C8A24D" : "transparent",
                  color: meta.page === i + 1 ? "#0B1220" : "#94A3B8",
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
