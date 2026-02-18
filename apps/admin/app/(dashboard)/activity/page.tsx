"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function ActionTypeBadge({ type }: { type: string }) {
  const isApproval = type.includes("APPROVED") || type.includes("VERIFIED");
  const isRejection = type.includes("REJECTED");
  const isInfo = type.includes("INFO");

  const bg = isApproval
    ? "rgba(16, 185, 129, 0.15)"
    : isRejection
    ? "rgba(239, 68, 68, 0.15)"
    : isInfo
    ? "rgba(59, 130, 246, 0.15)"
    : "rgba(245, 158, 11, 0.15)";

  const color = isApproval
    ? "#10B981"
    : isRejection
    ? "#EF4444"
    : isInfo
    ? "#3B82F6"
    : "#F59E0B";

  return (
    <span style={{ padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500, backgroundColor: bg, color }}>
      {type.replace(/_/g, " ")}
    </span>
  );
}

export default function ActivityPage() {
  const { accessToken } = useAuth();
  const [actions, setActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });

  const fetchActivity = async (page = 1) => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/activity?page=${page}&limit=20`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (data.success) {
        setActions(data.data);
        setMeta(data.meta);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, [accessToken]);

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Activity Log</h1>

      <div style={{ backgroundColor: "#1A2332", border: "1px solid #2A3444", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #2A3444" }}>
                {["Admin", "Action", "Target Type", "Target ID", "Reason", "Timestamp"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontSize: 12, fontWeight: 500, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: 24, textAlign: "center", color: "#94A3B8" }}>Loading...</td></tr>
              ) : actions.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 24, textAlign: "center", color: "#94A3B8" }}>No admin actions recorded yet</td></tr>
              ) : (
                actions.map((a) => (
                  <tr key={a.id} style={{ borderBottom: "1px solid #2A3444" }}>
                    <td style={{ padding: "12px 16px", fontSize: 14, color: "#FFFFFF" }}>
                      {a.admin?.firstName} {a.admin?.lastName}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <ActionTypeBadge type={a.actionType} />
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#94A3B8" }}>{a.targetType}</td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "#94A3B8", fontFamily: "monospace" }}>
                      {a.targetId?.substring(0, 12)}...
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#94A3B8", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {a.reason || "—"}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#94A3B8" }}>
                      {new Date(a.createdAt).toLocaleString()}
                    </td>
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
                onClick={() => fetchActivity(i + 1)}
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
