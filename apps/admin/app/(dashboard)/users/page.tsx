"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://capvista-api.onrender.com";

function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    ADMIN: { bg: "rgba(10, 31, 68, 0.08)", text: "#0A1F44" },
    FOUNDER: { bg: "rgba(59, 130, 246, 0.1)", text: "#3B82F6" },
    INVESTOR: { bg: "rgba(16, 185, 129, 0.1)", text: "#10B981" },
  };
  const c = colors[role] || colors.FOUNDER;
  return (
    <span style={{ padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500, backgroundColor: c.bg, color: c.text }}>
      {role}
    </span>
  );
}

export default function UsersPage() {
  const { accessToken, authFetch } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });

  const fetchUsers = async (page = 1) => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/api/admin/users?page=${page}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
        setMeta(data.meta);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [accessToken]);

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, color: "#0A1F44" }}>Users</h1>

      <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #E5E7EB", backgroundColor: "#F9FAFB" }}>
                {["Name", "Email", "Role", "Status", "Created"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontSize: 12, fontWeight: 500, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: 24, textAlign: "center", color: "#6B7280" }}>Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 24, textAlign: "center", color: "#6B7280" }}>No users found</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: "1px solid #E5E7EB" }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F9FAFB")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>
                    <td style={{ padding: "12px 16px", fontSize: 14, color: "#111827" }}>
                      {u.firstName} {u.lastName}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 14, color: "#6B7280" }}>{u.email}</td>
                    <td style={{ padding: "12px 16px" }}><RoleBadge role={u.role} /></td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: u.status === "active" ? "#10B981" : "#6B7280" }}>
                      {u.status}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#6B7280" }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta.totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: 16, borderTop: "1px solid #E5E7EB" }}>
            {Array.from({ length: meta.totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => fetchUsers(i + 1)}
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
