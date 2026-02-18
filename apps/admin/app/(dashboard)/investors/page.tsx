"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    PENDING: { bg: "rgba(245, 158, 11, 0.15)", text: "#F59E0B" },
    VERIFIED: { bg: "rgba(16, 185, 129, 0.15)", text: "#10B981" },
    REJECTED: { bg: "rgba(239, 68, 68, 0.15)", text: "#EF4444" },
  };
  const c = colors[status] || colors.PENDING;
  return (
    <span style={{ padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500, backgroundColor: c.bg, color: c.text }}>
      {status}
    </span>
  );
}

export default function InvestorsPage() {
  const { accessToken } = useAuth();
  const [investors, setInvestors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [search, setSearch] = useState("");
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });

  const fetchInvestors = async (page = 1) => {
    if (!accessToken) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("verificationStatus", statusFilter);
    if (countryFilter) params.set("country", countryFilter);
    if (search) params.set("search", search);
    params.set("page", String(page));

    try {
      const res = await fetch(`${API_URL}/api/admin/investors?${params}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (data.success) {
        setInvestors(data.data);
        setMeta(data.meta);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestors();
  }, [accessToken, statusFilter, countryFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInvestors(1);
  };

  const selectStyle: React.CSSProperties = {
    padding: "8px 12px",
    backgroundColor: "#0F1729",
    border: "1px solid #2A3444",
    borderRadius: 6,
    color: "#FFFFFF",
    fontSize: 13,
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Investors</h1>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="VERIFIED">Verified</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <input
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
          placeholder="Filter by country..."
          style={{ ...selectStyle, width: 180 }}
          onKeyDown={(e) => e.key === "Enter" && fetchInvestors(1)}
        />
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 8 }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            style={{ ...selectStyle, width: 240 }}
          />
          <button type="submit" style={{ padding: "8px 16px", backgroundColor: "#C8A24D", color: "#0B1220", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
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
                {["Full Name", "Email", "Country", "Investor Type", "Accreditation", "Status", "Submitted"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontSize: 12, fontWeight: 500, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: 24, textAlign: "center", color: "#94A3B8" }}>Loading...</td></tr>
              ) : investors.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 24, textAlign: "center", color: "#94A3B8" }}>No investors found</td></tr>
              ) : (
                investors.map((inv) => (
                  <tr key={inv.id} style={{ borderBottom: "1px solid #2A3444", cursor: "pointer" }}>
                    <td style={{ padding: "12px 16px", fontSize: 14 }}>
                      <Link href={`/investors/${inv.id}`} style={{ color: "#FFFFFF", textDecoration: "none" }}>
                        {inv.fullName || `${inv.user?.firstName || ""} ${inv.user?.lastName || ""}`}
                      </Link>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 14, color: "#94A3B8" }}>{inv.user?.email}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#94A3B8" }}>{inv.countryOfResidence || "—"}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#94A3B8" }}>{inv.investorType || "—"}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#94A3B8" }}>{inv.accreditationBasis || "—"}</td>
                    <td style={{ padding: "12px 16px" }}><StatusBadge status={inv.verificationStatus || "PENDING"} /></td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#94A3B8" }}>{new Date(inv.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta.totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: 16, borderTop: "1px solid #2A3444" }}>
            {Array.from({ length: meta.totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => fetchInvestors(i + 1)}
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
