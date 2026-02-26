"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    PENDING_REVIEW: { bg: "rgba(245, 158, 11, 0.15)", text: "#F59E0B" },
    APPROVED: { bg: "rgba(16, 185, 129, 0.15)", text: "#10B981" },
    REJECTED: { bg: "rgba(239, 68, 68, 0.15)", text: "#EF4444" },
    INFO_REQUESTED: { bg: "rgba(59, 130, 246, 0.15)", text: "#3B82F6" },
  };
  const c = colors[status] || colors.PENDING_REVIEW;
  return (
    <span style={{ padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500, backgroundColor: c.bg, color: c.text }}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

export default function CompaniesPage() {
  const { accessToken } = useAuth();
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [sectorFilter, setSectorFilter] = useState("");
  const [search, setSearch] = useState("");
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });

  const fetchCompanies = async (page = 1) => {
    if (!accessToken) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("approvalStatus", statusFilter);
    if (sectorFilter) params.set("sector", sectorFilter);
    if (search) params.set("search", search);
    params.set("page", String(page));

    try {
      const res = await fetch(`${API_URL}/api/admin/companies?${params}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (data.success) {
        setCompanies(data.data);
        setMeta(data.meta);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [accessToken, statusFilter, sectorFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCompanies(1);
  };

  const sectors = [
    "TECHNOLOGY", "FINTECH", "LOGISTICS", "ENERGY", "CONSUMER_FMCG",
    "HEALTH", "AGRI_FOOD", "REAL_ESTATE", "INFRASTRUCTURE", "SAAS_TECH", "MANUFACTURING",
  ];

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
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Companies</h1>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
          <option value="">All Statuses</option>
          <option value="PENDING_REVIEW">Pending Review</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="INFO_REQUESTED">Info Requested</option>
        </select>
        <select value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)} style={selectStyle}>
          <option value="">All Sectors</option>
          {sectors.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 8 }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            style={{ ...selectStyle, width: 240 }}
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
                {["Company", "Founder", "Sector", "Stage", "Lane", "Status", "Submitted"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontSize: 12, fontWeight: 500, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: 24, textAlign: "center", color: "#94A3B8" }}>Loading...</td></tr>
              ) : companies.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 24, textAlign: "center", color: "#94A3B8" }}>No companies found</td></tr>
              ) : (
                companies.map((c) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid #2A3444", cursor: "pointer" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <Link href={`/companies/${c.id}`} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "#FFFFFF" }}>
                        {c.logoUrl ? (
                          <img src={c.logoUrl} alt="" style={{ width: 32, height: 32, borderRadius: 6, objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: 32, height: 32, borderRadius: 6, backgroundColor: "#2A3444", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#94A3B8" }}>
                            {c.legalName?.charAt(0)}
                          </div>
                        )}
                        <span style={{ fontSize: 14, fontWeight: 500 }}>{c.legalName}</span>
                      </Link>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 14 }}>
                      <div style={{ color: "#FFFFFF" }}>{c.owner?.user?.firstName} {c.owner?.user?.lastName}</div>
                      <div style={{ color: "#94A3B8", fontSize: 12 }}>{c.owner?.user?.email}</div>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#94A3B8" }}>{c.sector?.replace(/_/g, " ")}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#94A3B8" }}>{c.stage?.replace(/_/g, " ")}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#94A3B8" }}>{c.preferredLane || "—"}</td>
                    <td style={{ padding: "12px 16px" }}><StatusBadge status={c.approvalStatus || "PENDING_REVIEW"} /></td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#94A3B8" }}>{new Date(c.createdAt).toLocaleDateString()}</td>
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
                onClick={() => fetchCompanies(i + 1)}
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
