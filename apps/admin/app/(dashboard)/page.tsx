"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import Link from "next/link";
import {
  Users,
  Building2,
  FileText,
  DollarSign,
  Clock,
  CheckCircle,
  Eye,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://capvista-api.onrender.com";

type Stats = {
  companies: { total: number; pending: number; approved: number; rejected: number };
  investors: { total: number; pending: number; verified: number; rejected: number };
  users: number;
  deals: { total: number; underReview: number; approved: number; live: number };
  investments: { total: number; pendingFunding: number; funded: number; active: number };
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
  const colorMap: Record<string, string> = {
    PENDING_REVIEW: "bg-orange-50 text-orange-600",
    PENDING: "bg-orange-50 text-orange-600",
    APPROVED: "bg-green-50 text-[#10B981]",
    VERIFIED: "bg-green-50 text-[#10B981]",
    REJECTED: "bg-red-50 text-red-600",
    INFO_REQUESTED: "bg-blue-50 text-blue-600",
  };
  const classes = colorMap[status] || colorMap.PENDING;
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${classes}`}>
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
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-400 text-sm">Loading dashboard...</div>
      </div>
    );
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
          icon: Building2,
          iconColor: "text-[#10B981]",
          iconBg: "bg-green-50",
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
          icon: Users,
          iconColor: "text-blue-600",
          iconBg: "bg-blue-50",
        },
        {
          title: "Users",
          total: stats.users,
          subs: [],
          href: "/users",
          icon: Users,
          iconColor: "text-purple-600",
          iconBg: "bg-purple-50",
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
          icon: FileText,
          iconColor: "text-orange-600",
          iconBg: "bg-orange-50",
        },
        {
          title: "Investments",
          total: stats.investments.total,
          subs: [
            { label: "Pending", value: stats.investments.pendingFunding, color: "#F59E0B" },
            { label: "Funded", value: stats.investments.funded, color: "#10B981" },
            { label: "Active", value: stats.investments.active, color: "#3B82F6" },
          ],
          href: "/investments",
          icon: DollarSign,
          iconColor: "text-emerald-600",
          iconBg: "bg-emerald-50",
        },
      ]
    : [];

  const pendingItems = feed.filter(
    (item) => item.status === "PENDING_REVIEW" || item.status === "PENDING"
  );

  const quickActions = [
    { label: "Companies", description: "Manage company listings", icon: Building2, href: "/companies", color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Users", description: "Manage platform users", icon: Users, href: "/users", color: "text-[#10B981]", bg: "bg-green-50" },
    { label: "Deals", description: "Review & manage deals", icon: FileText, href: "/deals", color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Investors", description: "Investor profiles & KYC", icon: TrendingUp, href: "/investors", color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] -m-6 p-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0A1F44] to-[#1A3A6B] rounded-2xl p-8 text-white mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-300">Platform overview and management</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 ${card.iconBg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{card.total.toLocaleString()}</div>
              <div className="text-sm text-gray-500 mt-1">{card.title}</div>
              {card.subs.length > 0 && (
                <div className="flex gap-3 mt-3 pt-3 border-t border-gray-100">
                  {card.subs.map((s) => (
                    <div key={s.label} className="text-center flex-1">
                      <div className="text-xs text-gray-400">{s.label}</div>
                      <div className="text-sm font-semibold mt-0.5" style={{ color: s.color }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Pending Approvals */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Pending Approvals</h2>
            <span className="text-xs font-medium bg-orange-50 text-orange-600 px-2.5 py-1 rounded-full">
              {pendingItems.length} pending
            </span>
          </div>
          <div className="divide-y divide-gray-100">
            {pendingItems.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-400 text-sm">
                No pending approvals
              </div>
            ) : (
              pendingItems.slice(0, 5).map((item) => (
                <div key={`pending-${item.type}-${item.id}`} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
                        item.type === "Company" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {(item.name || "?").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{item.name || "—"}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                            item.type === "Company" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {item.type}
                        </span>
                        <span className="text-xs text-gray-400 truncate">{item.email}</span>
                        <span className="text-xs text-gray-300">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                    <Link
                      href={item.type === "Company" ? `/companies/${item.id}` : `/investors/${item.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Review
                    </Link>
                    <Link
                      href={item.type === "Company" ? `/companies/${item.id}` : `/investors/${item.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-green-50 text-[#10B981] hover:bg-green-100 transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Approve
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 p-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all text-center"
                >
                  <div className={`w-10 h-10 ${action.bg} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${action.color}`} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{action.label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{action.description}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <Link href="/activity" className="text-sm text-[#0A1F44] hover:text-[#1A3A6B] font-medium flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {feed.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-400 text-sm">
              No recent activity
            </div>
          ) : (
            feed.map((item) => (
              <div key={`activity-${item.type}-${item.id}`} className="px-6 py-3.5 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#10B981] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-700">
                    <span className="font-medium text-gray-900">{item.name || "Unknown"}</span>
                    <span> submitted a </span>
                    <span className="font-medium">{item.type.toLowerCase()}</span>
                    <span> application</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">
                      {new Date(item.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <StatusBadge status={item.status} />
                  </div>
                </div>
                <Link
                  href={item.type === "Company" ? `/companies/${item.id}` : `/investors/${item.id}`}
                  className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                >
                  <Eye className="w-4 h-4" />
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
