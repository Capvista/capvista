"use client";

import { useAuth } from "@/lib/contexts/AuthContext";
import { useState, useEffect, useCallback } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://capvista-api.onrender.com";

const TABS = [
  "Overview",
  "Traffic & Performance",
  "Users & Activity",
  "Business Metrics",
  "Errors & Alerts",
] as const;
type Tab = (typeof TABS)[number];

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

function timeAgo(seconds: number): string {
  if (seconds < 60) return `${seconds}s ago`;
  return `${Math.floor(seconds / 60)}m ago`;
}

function fmtHour(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function fmtDay(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

// ── Shared Components ────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  trend,
  danger,
}: {
  label: string;
  value: string | number;
  sub?: string;
  trend?: number | null;
  danger?: boolean;
}) {
  const trendColor =
    trend === undefined || trend === null
      ? "#6B7280"
      : danger
        ? trend > 0
          ? "#EF4444"
          : "#10B981"
        : trend > 0
          ? "#10B981"
          : trend < 0
            ? "#EF4444"
            : "#6B7280";
  const arrow =
    trend === undefined || trend === null ? "" : trend > 0 ? "\u2191" : trend < 0 ? "\u2193" : "";
  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        border: "1px solid #E5E7EB",
        padding: 24,
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "#0A1F44" }}>{value}</div>
      {(sub || trend !== undefined) && (
        <div style={{ fontSize: 12, marginTop: 4, color: trendColor }}>
          {arrow} {trend !== undefined && trend !== null ? `${Math.abs(trend).toFixed(1)}%` : ""}{" "}
          {sub || ""}
        </div>
      )}
    </div>
  );
}

function PeriodSelector({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          style={{
            padding: "6px 14px",
            borderRadius: 20,
            border: "none",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            backgroundColor: value === o ? "#0A1F44" : "#F3F4F6",
            color: value === o ? "#FFFFFF" : "#4B5563",
          }}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        border: "1px solid #E5E7EB",
        padding: 24,
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 600, color: "#0A1F44", marginBottom: 16 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Skeleton({ height = 200 }: { height?: number }) {
  return (
    <div
      style={{
        height,
        backgroundColor: "#F3F4F6",
        borderRadius: 8,
        animation: "pulse 1.5s ease-in-out infinite",
      }}
    />
  );
}

function EmptyState({ message = "No data for this period" }: { message?: string }) {
  return (
    <div
      style={{
        padding: 48,
        textAlign: "center",
        color: "#9CA3AF",
        fontSize: 14,
      }}
    >
      {message}
    </div>
  );
}

function DataTable({
  columns,
  rows,
  expandable,
}: {
  columns: { key: string; label: string; align?: string }[];
  rows: Record<string, unknown>[];
  expandable?: (row: Record<string, unknown>) => React.ReactNode;
}) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ backgroundColor: "#F9FAFB" }}>
            {columns.map((c) => (
              <th
                key={c.key}
                style={{
                  padding: "10px 12px",
                  textAlign: (c.align as CanvasTextAlign) || "left",
                  fontWeight: 600,
                  color: "#4B5563",
                  borderBottom: "1px solid #E5E7EB",
                  whiteSpace: "nowrap",
                }}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{ padding: 32, textAlign: "center", color: "#9CA3AF" }}
              >
                No data
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <>
                <tr
                  key={i}
                  onClick={() =>
                    expandable ? setExpandedIdx(expandedIdx === i ? null : i) : undefined
                  }
                  style={{
                    cursor: expandable ? "pointer" : "default",
                    borderBottom: "1px solid #F3F4F6",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#F9FAFB")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      style={{
                        padding: "10px 12px",
                        textAlign: (c.align as CanvasTextAlign) || "left",
                        color: "#1F2937",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {String(row[c.key] ?? "-")}
                    </td>
                  ))}
                </tr>
                {expandable && expandedIdx === i && (
                  <tr key={`exp-${i}`}>
                    <td
                      colSpan={columns.length}
                      style={{
                        padding: 16,
                        backgroundColor: "#F9FAFB",
                        fontSize: 12,
                        color: "#4B5563",
                      }}
                    >
                      {expandable(row)}
                    </td>
                  </tr>
                )}
              </>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function MonitoringPage() {
  const { authFetch } = useAuth();
  const [tab, setTab] = useState<Tab>("Overview");
  const [lastUpdated, setLastUpdated] = useState(0);

  // Data states
  const [overview, setOverview] = useState<Record<string, unknown> | null>(null);
  const [health, setHealth] = useState<Record<string, unknown> | null>(null);
  const [traffic, setTraffic] = useState<Record<string, unknown> | null>(null);
  const [trafficPeriod, setTrafficPeriod] = useState("24h");
  const [users, setUsers] = useState<Record<string, unknown> | null>(null);
  const [usersPeriod, setUsersPeriod] = useState("30d");
  const [business, setBusiness] = useState<Record<string, unknown> | null>(null);
  const [businessPeriod, setBusinessPeriod] = useState("30d");
  const [businessEvents, setBusinessEvents] = useState<Record<string, unknown> | null>(null);
  const [errors, setErrors] = useState<Record<string, unknown> | null>(null);
  const [errorsPeriod, setErrorsPeriod] = useState("7d");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(
    async (currentTab: Tab) => {
      try {
        setLoading(true);
        const base = `${API_URL}/api/admin/telemetry`;

        if (currentTab === "Overview") {
          const [ov, hl] = await Promise.all([
            authFetch(`${base}/overview`).then((r: Response) => r.json()),
            authFetch(`${base}/health`).then((r: Response) => r.json()),
          ]);
          if (ov.success) setOverview(ov.data);
          if (hl.success) setHealth(hl.data);
        } else if (currentTab === "Traffic & Performance") {
          const res = await authFetch(`${base}/requests?period=${trafficPeriod}`);
          const d = await res.json();
          if (d.success) setTraffic(d.data);
          // Also fetch overview for charts
          const ov = await authFetch(`${base}/overview`).then((r: Response) => r.json());
          if (ov.success) setOverview(ov.data);
        } else if (currentTab === "Users & Activity") {
          const res = await authFetch(`${base}/users`);
          const d = await res.json();
          if (d.success) setUsers(d.data);
        } else if (currentTab === "Business Metrics") {
          const [biz, ev] = await Promise.all([
            authFetch(`${base}/business`).then((r: Response) => r.json()),
            authFetch(`${base}/events?period=${businessPeriod}`).then((r: Response) => r.json()),
          ]);
          if (biz.success) setBusiness(biz.data);
          if (ev.success) setBusinessEvents(ev.data);
        } else if (currentTab === "Errors & Alerts") {
          const res = await authFetch(`${base}/errors?period=${errorsPeriod}`);
          const d = await res.json();
          if (d.success) setErrors(d.data);
        }
      } catch (e) {
        console.error("Monitoring fetch error:", e);
      } finally {
        setLoading(false);
        setLastUpdated(0);
      }
    },
    [authFetch, trafficPeriod, businessPeriod, errorsPeriod]
  );

  // Initial + period change fetch
  useEffect(() => {
    fetchData(tab);
  }, [tab, fetchData]);

  // Auto-refresh every 60s
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated((p) => p + 1);
    }, 1000);
    const refresh = setInterval(() => {
      fetchData(tab);
    }, 60000);
    return () => {
      clearInterval(interval);
      clearInterval(refresh);
    };
  }, [tab, fetchData]);

  // ── Tab renderers ────────────────────────────────────────────────────────

  function renderOverview() {
    if (loading && !overview) return <Skeleton height={400} />;
    if (!overview) return <EmptyState />;

    const ov = overview as {
      requestsToday: number;
      avgResponseTimeMs: number;
      errorRate: number;
      activeUsersToday: number;
      requestsPerHour: { hour: string; count: number }[];
    };
    const hl = health as {
      currentChecks: { service: string; status: string; responseTimeMs: number; createdAt: string }[];
      uptime: { "7d": number };
    } | null;

    const hourlyData = (ov.requestsPerHour || []).map((h) => ({
      time: fmtHour(h.hour),
      requests: h.count,
    }));

    // Derive response time + error rate per hour from overview data if available
    const eventsToday = hourlyData.reduce((s, h) => s + h.requests, 0);

    const latestChecks = hl?.currentChecks || [];
    const apiCheck = latestChecks.find((c) => c.service === "api");
    const dbCheck = latestChecks.find((c) => c.service === "database");
    const supaCheck = latestChecks.find((c) => c.service === "supabase");
    const allHealthy =
      latestChecks.length > 0 && latestChecks.every((c) => c.status === "up");

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Row 1: Stat cards */}
        <div
          style={{ display: "grid", gap: 16 }}
          className="stat-grid-6"
        >
          <StatCard label="Requests Today" value={formatNum(ov.requestsToday)} />
          <StatCard label="Avg Response Time" value={`${ov.avgResponseTimeMs}ms`} />
          <StatCard
            label="Error Rate"
            value={`${ov.errorRate}%`}
            danger={ov.errorRate > 5}
          />
          <StatCard label="Active Users Today" value={ov.activeUsersToday} />
          <StatCard label="Uptime (7d)" value={`${hl?.uptime?.["7d"] ?? 100}%`} />
          <StatCard label="Events Today" value={formatNum(eventsToday)} />
        </div>

        {/* Row 2: Requests per hour */}
        <ChartCard title="Requests per Hour (Last 24h)">
          {hourlyData.length === 0 ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="time" fontSize={11} stroke="#9CA3AF" />
                <YAxis fontSize={11} stroke="#9CA3AF" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="requests"
                  stroke="#0A1F44"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Row 3: System Health */}
        <ChartCard title="System Health">
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <span
              style={{
                display: "inline-block",
                padding: "4px 12px",
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 600,
                backgroundColor: allHealthy ? "#D1FAE5" : "#FEE2E2",
                color: allHealthy ? "#065F46" : "#991B1B",
              }}
            >
              {allHealthy ? "Healthy" : "Issues Detected"}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "API", check: apiCheck },
              { label: "Database", check: dbCheck },
              { label: "Supabase", check: supaCheck },
            ].map(({ label, check }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "8px 0",
                  borderBottom: "1px solid #F3F4F6",
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    backgroundColor:
                      check?.status === "up" ? "#10B981" : check ? "#EF4444" : "#D1D5DB",
                  }}
                />
                <span style={{ fontWeight: 500, color: "#1F2937", minWidth: 80 }}>
                  {label}
                </span>
                <span style={{ color: "#6B7280", fontSize: 13 }}>
                  {check ? `${check.responseTimeMs}ms` : "N/A"}
                </span>
              </div>
            ))}
          </div>
          {latestChecks.length > 0 && (
            <div style={{ marginTop: 12, fontSize: 12, color: "#9CA3AF" }}>
              Last checked:{" "}
              {new Date(latestChecks[0].createdAt).toLocaleString()}
            </div>
          )}
        </ChartCard>
      </div>
    );
  }

  function renderTraffic() {
    if (loading && !traffic) return <Skeleton height={400} />;

    const t = traffic as {
      totalRequests: number;
      topEndpoints: { path: string; count: number }[];
      slowestEndpoints: { path: string; avgMs: number }[];
      errorBreakdown: { path: string; statusCode: number; count: number }[];
    } | null;

    const ov = overview as {
      avgResponseTimeMs: number;
      requestsPerHour: { hour: string; count: number }[];
    } | null;

    const hourlyData = (ov?.requestsPerHour || []).map((h) => ({
      time: fmtHour(h.hour),
      requests: h.count,
    }));

    // Compute avg and p95 approximation from endpoints
    const avgTime = ov?.avgResponseTimeMs ?? 0;
    const p95 =
      t?.slowestEndpoints && t.slowestEndpoints.length > 0
        ? t.slowestEndpoints[Math.min(1, t.slowestEndpoints.length - 1)]?.avgMs || 0
        : 0;

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div />
          <PeriodSelector
            options={["24h", "7d", "30d"]}
            value={trafficPeriod}
            onChange={setTrafficPeriod}
          />
        </div>

        {/* Stat cards */}
        <div className="stat-grid-3" style={{ display: "grid", gap: 16 }}>
          <StatCard label="Total Requests" value={formatNum(t?.totalRequests ?? 0)} />
          <StatCard label="Avg Response Time" value={`${avgTime}ms`} />
          <StatCard label="P95 Response Time" value={`${p95}ms`} />
        </div>

        {/* Request Volume chart */}
        <ChartCard title="Request Volume">
          {hourlyData.length === 0 ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="time" fontSize={11} stroke="#9CA3AF" />
                <YAxis fontSize={11} stroke="#9CA3AF" />
                <Tooltip />
                <Bar dataKey="requests" fill="#0A1F44" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Top Endpoints table */}
        <ChartCard title="Top Endpoints">
          <DataTable
            columns={[
              { key: "path", label: "Endpoint" },
              { key: "count", label: "Requests", align: "right" },
            ]}
            rows={(t?.topEndpoints || []).map((e) => ({
              path: e.path,
              count: formatNum(e.count),
            }))}
          />
        </ChartCard>

        {/* Slowest Endpoints table */}
        <ChartCard title="Slowest Endpoints">
          <DataTable
            columns={[
              { key: "path", label: "Endpoint" },
              { key: "avgMs", label: "Avg Time (ms)", align: "right" },
            ]}
            rows={(t?.slowestEndpoints || []).slice(0, 10).map((e) => ({
              path: e.path,
              avgMs: `${e.avgMs}ms`,
            }))}
          />
        </ChartCard>
      </div>
    );
  }

  function renderUsers() {
    if (loading && !users) return <Skeleton height={400} />;

    const u = users as {
      signupsPerDay: { day: string; role: string; count: number }[];
      activePerDay: { day: string; role: string; count: number }[];
      retention: { thisWeek: number; lastWeek: number; retained: number; retentionRate: number };
      topUsers: { userId: string; role: string; requestCount: number }[];
    } | null;

    if (!u) return <EmptyState />;

    // Aggregate signups by day with founder/investor split
    const signupMap = new Map<string, { day: string; FOUNDER: number; INVESTOR: number }>();
    for (const s of u.signupsPerDay) {
      const key = fmtDay(s.day);
      const existing = signupMap.get(key) || { day: key, FOUNDER: 0, INVESTOR: 0 };
      if (s.role === "FOUNDER") existing.FOUNDER += s.count;
      else if (s.role === "INVESTOR") existing.INVESTOR += s.count;
      signupMap.set(key, existing);
    }
    const signupData = Array.from(signupMap.values());

    // Active users by day
    const activeMap = new Map<string, { day: string; FOUNDER: number; INVESTOR: number; ADMIN: number }>();
    for (const a of u.activePerDay) {
      const key = fmtDay(a.day);
      const existing = activeMap.get(key) || { day: key, FOUNDER: 0, INVESTOR: 0, ADMIN: 0 };
      if (a.role === "FOUNDER") existing.FOUNDER += a.count;
      else if (a.role === "INVESTOR") existing.INVESTOR += a.count;
      else if (a.role === "ADMIN") existing.ADMIN += a.count;
      activeMap.set(key, existing);
    }
    const activeData = Array.from(activeMap.values());

    const totalFounders = u.signupsPerDay.filter((s) => s.role === "FOUNDER").reduce((a, b) => a + b.count, 0);
    const totalInvestors = u.signupsPerDay.filter((s) => s.role === "INVESTOR").reduce((a, b) => a + b.count, 0);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div />
          <PeriodSelector
            options={["7d", "30d", "90d"]}
            value={usersPeriod}
            onChange={setUsersPeriod}
          />
        </div>

        <div className="stat-grid-4" style={{ display: "grid", gap: 16 }}>
          <StatCard label="Total Signups (period)" value={totalFounders + totalInvestors} />
          <StatCard label="Founders" value={totalFounders} />
          <StatCard label="Investors" value={totalInvestors} />
          <StatCard label="Retention Rate" value={`${u.retention.retentionRate}%`} />
        </div>

        <ChartCard title="Signups Over Time">
          {signupData.length === 0 ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={signupData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="day" fontSize={11} stroke="#9CA3AF" />
                <YAxis fontSize={11} stroke="#9CA3AF" />
                <Tooltip />
                <Legend />
                <Bar dataKey="FOUNDER" name="Founders" fill="#0A1F44" stackId="a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="INVESTOR" name="Investors" fill="#10B981" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Active Users">
          {activeData.length === 0 ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={activeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="day" fontSize={11} stroke="#9CA3AF" />
                <YAxis fontSize={11} stroke="#9CA3AF" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="FOUNDER" name="Founders" stroke="#0A1F44" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="INVESTOR" name="Investors" stroke="#10B981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="ADMIN" name="Admins" stroke="#F59E0B" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Most Active Users">
          <DataTable
            columns={[
              { key: "userId", label: "User ID" },
              { key: "role", label: "Role" },
              { key: "requestCount", label: "Requests", align: "right" },
            ]}
            rows={u.topUsers.map((t) => ({
              userId: t.userId?.slice(0, 12) + "...",
              role: t.role,
              requestCount: formatNum(t.requestCount),
            }))}
          />
        </ChartCard>
      </div>
    );
  }

  function renderBusiness() {
    if (loading && !business) return <Skeleton height={400} />;

    const b = business as {
      companies: { event: string; count: number }[];
      deals: { event: string; count: number }[];
      investments: { event: string; count: number }[];
      watchlist: { total: number; mostWatchlisted: { companyId: string; count: number }[] };
    } | null;

    const ev = businessEvents as {
      recentEvents: {
        id: string;
        eventType: string;
        category: string;
        userId: string;
        metadata: unknown;
        createdAt: string;
      }[];
    } | null;

    if (!b) return <EmptyState />;

    const getCount = (arr: { event: string; count: number }[], event: string) =>
      arr.find((a) => a.event === event)?.count ?? 0;

    const companiesSubmitted = getCount(b.companies, "company_submitted");
    const dealsCreated = getCount(b.deals, "deal_created");
    const investmentsMade = getCount(b.investments, "investment_created");

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div />
          <PeriodSelector
            options={["7d", "30d", "90d"]}
            value={businessPeriod}
            onChange={setBusinessPeriod}
          />
        </div>

        <div className="stat-grid-4" style={{ display: "grid", gap: 16 }}>
          <StatCard label="Companies Submitted" value={companiesSubmitted} />
          <StatCard label="Deals Created" value={dealsCreated} />
          <StatCard label="Investments Made" value={investmentsMade} />
          <StatCard label="Total Watchlists" value={b.watchlist.total} />
        </div>

        {/* Company pipeline */}
        <ChartCard title="Company Pipeline">
          {b.companies.length === 0 ? (
            <EmptyState />
          ) : (
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              {b.companies.map((c) => (
                <div key={c.event} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "#0A1F44" }}>{c.count}</div>
                  <div style={{ fontSize: 12, color: "#6B7280", textTransform: "capitalize" }}>
                    {c.event.replace(/_/g, " ")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ChartCard>

        {/* Deal flow */}
        <ChartCard title="Deal Activity">
          {b.deals.length === 0 ? (
            <EmptyState />
          ) : (
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              {b.deals.map((d) => (
                <div key={d.event} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "#0A1F44" }}>{d.count}</div>
                  <div style={{ fontSize: 12, color: "#6B7280", textTransform: "capitalize" }}>
                    {d.event.replace(/_/g, " ")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ChartCard>

        {/* Most watchlisted */}
        <ChartCard title="Most Watchlisted Companies">
          <DataTable
            columns={[
              { key: "companyId", label: "Company ID" },
              { key: "count", label: "Watchlist Count", align: "right" },
            ]}
            rows={b.watchlist.mostWatchlisted.map((w) => ({
              companyId: w.companyId?.slice(0, 12) + "...",
              count: w.count,
            }))}
          />
        </ChartCard>

        {/* Recent events */}
        <ChartCard title="Recent Platform Events">
          <DataTable
            columns={[
              { key: "time", label: "Time" },
              { key: "eventType", label: "Event" },
              { key: "category", label: "Category" },
              { key: "userId", label: "User" },
            ]}
            rows={(ev?.recentEvents || []).slice(0, 50).map((e) => ({
              time: new Date(e.createdAt).toLocaleString(),
              eventType: e.eventType,
              category: e.category,
              userId: e.userId ? e.userId.slice(0, 12) + "..." : "-",
            }))}
          />
        </ChartCard>
      </div>
    );
  }

  function renderErrors() {
    if (loading && !errors) return <Skeleton height={400} />;

    const e = errors as {
      recentErrors: {
        id: string;
        method: string;
        path: string;
        statusCode: number;
        errorMessage: string | null;
        userId: string | null;
        userRole: string | null;
        createdAt: string;
      }[];
      errorRateOverTime: { day: string; total: number; errors: number; rate: number }[];
      topErrorEndpoints: { path: string; count: number }[];
      statusBreakdown: { statusCode: number; count: number }[];
    } | null;

    if (!e) return <EmptyState />;

    const errorsToday = e.recentErrors.filter(
      (err) => new Date(err.createdAt).toDateString() === new Date().toDateString()
    ).length;
    const totalErrors = e.statusBreakdown.reduce((s, b) => s + b.count, 0);
    const mostCommon =
      e.statusBreakdown.length > 0
        ? `${e.statusBreakdown[0].statusCode} (${e.topErrorEndpoints[0]?.path || "N/A"})`
        : "None";

    const errorChartData = e.errorRateOverTime.map((d) => ({
      day: fmtDay(d.day),
      rate: d.rate,
      errors: d.errors,
    }));

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div />
          <PeriodSelector
            options={["24h", "7d", "30d"]}
            value={errorsPeriod}
            onChange={setErrorsPeriod}
          />
        </div>

        <div className="stat-grid-3" style={{ display: "grid", gap: 16 }}>
          <StatCard
            label="Errors Today"
            value={errorsToday}
            danger={errorsToday > 0}
          />
          <StatCard
            label="Total Errors (period)"
            value={totalErrors}
            danger={totalErrors > 0}
          />
          <StatCard label="Most Common Error" value={mostCommon} />
        </div>

        {/* Error rate chart */}
        <ChartCard title="Error Rate Over Time">
          {errorChartData.length === 0 ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={errorChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="day" fontSize={11} stroke="#9CA3AF" />
                <YAxis fontSize={11} stroke="#9CA3AF" unit="%" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke="#EF4444"
                  fill="#FEE2E2"
                  strokeWidth={2}
                  name="Error Rate %"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Status code breakdown */}
        <ChartCard title="Error Breakdown by Status Code">
          <DataTable
            columns={[
              { key: "statusCode", label: "Status" },
              { key: "count", label: "Count", align: "right" },
              { key: "pct", label: "% of Total", align: "right" },
            ]}
            rows={e.statusBreakdown.map((s) => ({
              statusCode: s.statusCode,
              count: s.count,
              pct: totalErrors > 0 ? `${((s.count / totalErrors) * 100).toFixed(1)}%` : "0%",
            }))}
          />
        </ChartCard>

        {/* Recent errors */}
        <ChartCard title="Recent Errors">
          <DataTable
            columns={[
              { key: "time", label: "Time" },
              { key: "method", label: "Method" },
              { key: "path", label: "Path" },
              { key: "statusCode", label: "Status" },
              { key: "userId", label: "User" },
              { key: "errorMessage", label: "Error" },
            ]}
            rows={e.recentErrors.map((err) => ({
              time: new Date(err.createdAt).toLocaleString(),
              method: err.method,
              path: err.path,
              statusCode: err.statusCode,
              userId: err.userId ? err.userId.slice(0, 8) + "..." : "-",
              errorMessage: err.errorMessage?.slice(0, 60) || "-",
              _full: err,
            }))}
            expandable={(row) => {
              const full = row._full as {
                method: string;
                path: string;
                statusCode: number;
                errorMessage: string | null;
                userId: string | null;
                userRole: string | null;
                createdAt: string;
              };
              return (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div><strong>Method:</strong> {full.method}</div>
                  <div><strong>Path:</strong> {full.path}</div>
                  <div><strong>Status:</strong> {full.statusCode}</div>
                  <div><strong>User Role:</strong> {full.userRole || "N/A"}</div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <strong>Error:</strong> {full.errorMessage || "No error message"}
                  </div>
                </div>
              );
            }}
          />
        </ChartCard>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Page header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0A1F44", margin: 0 }}>
          Monitoring
        </h1>
        <span style={{ fontSize: 12, color: "#9CA3AF" }}>
          Last updated: {timeAgo(lastUpdated)}
        </span>
      </div>

      {/* Tab bar */}
      <div
        style={{
          display: "flex",
          gap: 0,
          borderBottom: "1px solid #E5E7EB",
          marginBottom: 24,
          overflowX: "auto",
        }}
      >
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "12px 20px",
              border: "none",
              borderBottom: tab === t ? "2px solid #0A1F44" : "2px solid transparent",
              backgroundColor: "transparent",
              color: tab === t ? "#0A1F44" : "#6B7280",
              fontWeight: tab === t ? 600 : 400,
              fontSize: 14,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "Overview" && renderOverview()}
      {tab === "Traffic & Performance" && renderTraffic()}
      {tab === "Users & Activity" && renderUsers()}
      {tab === "Business Metrics" && renderBusiness()}
      {tab === "Errors & Alerts" && renderErrors()}

      {/* Responsive grid styles */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .stat-grid-6 {
          grid-template-columns: repeat(3, 1fr);
        }
        .stat-grid-4 {
          grid-template-columns: repeat(4, 1fr);
        }
        .stat-grid-3 {
          grid-template-columns: repeat(3, 1fr);
        }
        @media (min-width: 1200px) {
          .stat-grid-6 { grid-template-columns: repeat(6, 1fr); }
        }
        @media (max-width: 900px) {
          .stat-grid-6 { grid-template-columns: repeat(2, 1fr); }
          .stat-grid-4 { grid-template-columns: repeat(2, 1fr); }
          .stat-grid-3 { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .stat-grid-6 { grid-template-columns: 1fr; }
          .stat-grid-4 { grid-template-columns: 1fr; }
          .stat-grid-3 { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
