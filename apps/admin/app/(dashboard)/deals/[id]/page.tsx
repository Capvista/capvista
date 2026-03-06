"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useParams } from "next/navigation";
import Link from "next/link";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://capvista-api.onrender.com";

const stageLabels: Record<string, string> = {
  PRE_SEED: "Pre-Seed",
  SEED: "Seed",
  SERIES_A: "Series A",
  SERIES_B: "Series B",
  SERIES_C: "Series C",
  SERIES_D_PLUS: "Series D+",
  GROWTH_LATE: "Growth / Late Stage",
  PRE_IPO: "Pre-IPO",
  BOOTSTRAPPED: "Revenue-Generating (Bootstrapped)",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 12, marginBottom: 20, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid #E5E7EB", backgroundColor: "#F9FAFB" }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "#0A1F44", margin: 0 }}>{title}</h3>
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: any }) {
  const display = value === null || value === undefined || value === "" ? "—" : typeof value === "boolean" ? (value ? "Yes" : "No") : String(value);
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, color: "#111827" }}>{display}</div>
    </div>
  );
}

function FieldGrid({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0 24px" }}>{children}</div>;
}

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
    <span style={{ padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 500, backgroundColor: c.bg, color: c.text }}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

function LaneBadge({ lane }: { lane: string }) {
  const isYield = lane === "YIELD";
  return (
    <span
      style={{
        padding: "4px 10px",
        borderRadius: 4,
        fontSize: 13,
        fontWeight: 500,
        backgroundColor: isYield ? "rgba(10, 31, 68, 0.08)" : "rgba(139, 92, 246, 0.15)",
        color: isYield ? "#0A1F44" : "#8B5CF6",
      }}
    >
      {lane}
    </span>
  );
}

function ActionModal({
  title,
  type,
  onClose,
  onSubmit,
}: {
  title: string;
  type: "approve" | "reject" | "golive" | "close";
  onClose: () => void;
  onSubmit: (reason?: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    await onSubmit(reason);
    setSubmitting(false);
  };

  const colors = { approve: "#10B981", reject: "#EF4444", golive: "#3B82F6", close: "#6B7280" };
  const labels = { approve: "Confirm Approve", reject: "Confirm Reject", golive: "Confirm Go Live", close: "Confirm Close" };
  const showTextarea = type === "reject" || type === "close";
  const descriptions: Record<string, string> = {
    approve: "Are you sure you want to approve this deal? It will become eligible to go live.",
    golive: "Are you sure you want to set this deal to LIVE? It will become visible to investors.",
  };

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 12, padding: 24, width: "100%", maxWidth: 480 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, margin: "0 0 16px 0", color: "#111827" }}>{title}</h3>
        {showTextarea ? (
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={type === "close" ? "Reason for closing deal (optional)" : "Reason for rejection (required)"}
            required={type === "reject"}
            style={{
              width: "100%",
              minHeight: 100,
              padding: 12,
              backgroundColor: "#F9FAFB",
              border: "1px solid #E5E7EB",
              borderRadius: 8,
              color: "#111827",
              fontSize: 14,
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />
        ) : (
          <p style={{ color: "#6B7280", fontSize: 14 }}>{descriptions[type]}</p>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 20 }}>
          <button onClick={onClose} style={{ padding: "8px 20px", backgroundColor: "transparent", border: "1px solid #E5E7EB", borderRadius: 6, color: "#6B7280", cursor: "pointer", fontSize: 14 }}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || (type === "reject" && !reason.trim())}
            style={{
              padding: "8px 20px",
              backgroundColor: colors[type],
              border: "none",
              borderRadius: 6,
              color: "#FFFFFF",
              cursor: submitting ? "not-allowed" : "pointer",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {submitting ? "Processing..." : labels[type]}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DealDetailPage() {
  const { accessToken, authFetch } = useAuth();
  const params = useParams();
  const [deal, setDeal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"approve" | "reject" | "golive" | "close" | null>(null);

  const fetchDeal = async () => {
    if (!accessToken) return;
    try {
      const res = await authFetch(`${API_URL}/api/admin/deals/${params.id}`);
      const data = await res.json();
      if (data.success) setDeal(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeal();
  }, [accessToken, params.id]);

  const handleAction = async (reason?: string) => {
    if (!modal || !accessToken) return;
    const endpoints: Record<string, string> = {
      approve: "approve",
      reject: "reject",
      golive: "golive",
      close: "close",
    };
    const body = modal === "reject" || modal === "close" ? { reason } : {};

    try {
      const res = await authFetch(`${API_URL}/api/admin/deals/${params.id}/${endpoints[modal]}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setModal(null);
        fetchDeal();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div style={{ color: "#6B7280", padding: 40, textAlign: "center" }}>Loading deal details...</div>;
  }

  if (!deal) {
    return <div style={{ color: "#EF4444", padding: 40, textAlign: "center" }}>Deal not found</div>;
  }

  const formatCurrency = (value: any) => {
    if (!value) return "—";
    return `$${Number(value).toLocaleString()}`;
  };

  const terms = deal.terms && typeof deal.terms === "object" ? deal.terms : {};
  const company = deal.company;
  const owner = company?.owner?.user;

  // Determine which action buttons to show based on deal status
  const showApprove = deal.status === "UNDER_REVIEW";
  const showReject = deal.status === "UNDER_REVIEW";
  const showGoLive = deal.status === "APPROVED";
  const showClose = deal.status === "APPROVED" || deal.status === "LIVE";

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <Link href="/deals" style={{ color: "#6B7280", fontSize: 13, textDecoration: "none", marginBottom: 8, display: "inline-block" }}>
            &larr; Back to Deals
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "#0A1F44" }}>{deal.name}</h1>
            <StatusBadge status={deal.status} />
            <LaneBadge lane={deal.lane} />
          </div>
          {company && (
            <p style={{ color: "#6B7280", fontSize: 14, margin: "4px 0 0" }}>
              by{" "}
              <Link href={`/companies/${company.id}`} style={{ color: "#0A1F44", textDecoration: "none" }}>
                {company.legalName}
              </Link>
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {showApprove && (
            <button onClick={() => setModal("approve")} style={{ padding: "8px 20px", backgroundColor: "#10B981", border: "none", borderRadius: 6, color: "#FFFFFF", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              Approve
            </button>
          )}
          {showReject && (
            <button onClick={() => setModal("reject")} style={{ padding: "8px 20px", backgroundColor: "#EF4444", border: "none", borderRadius: 6, color: "#FFFFFF", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              Reject
            </button>
          )}
          {showGoLive && (
            <button onClick={() => setModal("golive")} style={{ padding: "8px 20px", backgroundColor: "#3B82F6", border: "none", borderRadius: 6, color: "#FFFFFF", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              Go Live
            </button>
          )}
          {showClose && (
            <button onClick={() => setModal("close")} style={{ padding: "8px 20px", backgroundColor: "#6B7280", border: "none", borderRadius: 6, color: "#FFFFFF", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              Close Deal
            </button>
          )}
        </div>
      </div>

      {/* Participation Warning */}
      {company && company.participationStatus !== "VERIFIED" && (
        <div style={{ marginBottom: 20, padding: "12px 16px", backgroundColor: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: 8, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>&#9888;</span>
          <span style={{ fontSize: 13, color: "#F59E0B" }}>
            Platform participation not yet verified. Deal cannot go live.{" "}
            <Link href={`/companies/${company.id}`} style={{ color: "#3B82F6", textDecoration: "underline" }}>
              View participation status
            </Link>
          </span>
        </div>
      )}

      {/* Deal Overview */}
      <Section title="Deal Overview">
        <FieldGrid>
          <Field label="Deal Name" value={deal.name} />
          <Field label="Lane" value={deal.lane} />
          <Field label="Instrument Type" value={deal.instrumentType?.replace(/_/g, " ")} />
          <Field label="Status" value={deal.status?.replace(/_/g, " ")} />
          <Field label="Target Amount" value={formatCurrency(deal.targetAmount)} />
          <Field label="Minimum Investment" value={formatCurrency(deal.minimumInvestment)} />
          <Field label="Raised Amount" value={formatCurrency(deal.raisedAmount)} />
          <Field label="Duration (months)" value={deal.duration} />
        </FieldGrid>
      </Section>

      {/* Terms */}
      <Section title="Deal Terms">
        <FieldGrid>
          {deal.lane === "YIELD" ? (
            <>
              <Field label="Revenue Share %" value={terms.revenueSharePercent ? `${terms.revenueSharePercent}%` : null} />
              <Field label="Payment Frequency" value={terms.paymentFrequency?.replace(/_/g, " ")} />
              <Field label="Return Cap" value={terms.returnCap ? `${terms.returnCap}x` : null} />
              <Field label="Asset Description" value={terms.assetDescription} />
              <Field label="Collateral Type" value={terms.collateralType} />
              <Field label="Asset Valuation" value={formatCurrency(terms.assetValuation)} />
            </>
          ) : (
            <>
              <Field label="Valuation Cap" value={formatCurrency(terms.valuationCap)} />
              <Field label="Discount %" value={terms.discountPercent ? `${terms.discountPercent}%` : null} />
              <Field label="Interest Rate" value={terms.interestRate ? `${terms.interestRate}%` : null} />
              <Field label="Maturity (months)" value={terms.maturityMonths} />
              <Field label="Conversion Trigger" value={terms.conversionTrigger} />
              <Field label="SPV Name" value={terms.spvName} />
              <Field label="Target Ownership %" value={terms.targetOwnershipPercent ? `${terms.targetOwnershipPercent}%` : null} />
              <Field label="Pre-money Valuation" value={formatCurrency(terms.preMoneyValuation)} />
            </>
          )}
        </FieldGrid>
      </Section>

      {/* Documents */}
      <Section title="Documents">
        <FieldGrid>
          <Field label="Pitch Deck" value={deal.pitchDeckUrl ? "Uploaded" : "Not provided"} />
          <Field label="Financial Documents" value={deal.financialDocsUrl ? "Uploaded" : "Not provided"} />
          <Field label="Terms Sheet" value={deal.termsSheetUrl ? "Uploaded" : "Not provided"} />
        </FieldGrid>
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          {deal.pitchDeckUrl && (
            <a href={deal.pitchDeckUrl} target="_blank" rel="noopener noreferrer" style={{ padding: "6px 14px", backgroundColor: "rgba(10, 31, 68, 0.06)", border: "1px solid #0A1F44", borderRadius: 6, color: "#0A1F44", fontSize: 13, textDecoration: "none" }}>
              View Pitch Deck
            </a>
          )}
          {deal.financialDocsUrl && (
            <a href={deal.financialDocsUrl} target="_blank" rel="noopener noreferrer" style={{ padding: "6px 14px", backgroundColor: "rgba(10, 31, 68, 0.06)", border: "1px solid #0A1F44", borderRadius: 6, color: "#0A1F44", fontSize: 13, textDecoration: "none" }}>
              View Financials
            </a>
          )}
          {deal.termsSheetUrl && (
            <a href={deal.termsSheetUrl} target="_blank" rel="noopener noreferrer" style={{ padding: "6px 14px", backgroundColor: "rgba(10, 31, 68, 0.06)", border: "1px solid #0A1F44", borderRadius: 6, color: "#0A1F44", fontSize: 13, textDecoration: "none" }}>
              View Terms Sheet
            </a>
          )}
        </div>
      </Section>

      {/* Dates */}
      <Section title="Dates & Timeline">
        <FieldGrid>
          <Field label="Created" value={new Date(deal.createdAt).toLocaleString()} />
          <Field label="Last Updated" value={new Date(deal.updatedAt).toLocaleString()} />
          <Field label="Opened At" value={deal.openedAt ? new Date(deal.openedAt).toLocaleString() : null} />
          <Field label="Closed At" value={deal.closedAt ? new Date(deal.closedAt).toLocaleString() : null} />
        </FieldGrid>
      </Section>

      {/* Company Info */}
      {company && (
        <Section title="Company Information">
          <FieldGrid>
            <Field label="Legal Name" value={company.legalName} />
            <Field label="Sector" value={company.sector?.replace(/_/g, " ")} />
            <Field label="Stage" value={stageLabels[company.stage] || company.stage} />
            <Field label="Country" value={company.countryOfIncorporation} />
            <Field label="Approval Status" value={company.approvalStatus?.replace(/_/g, " ")} />
            <Field label="Founder" value={owner ? `${owner.firstName} ${owner.lastName}` : null} />
            <Field label="Founder Email" value={owner?.email} />
          </FieldGrid>
        </Section>
      )}

      {/* Admin Action History */}
      {deal.adminActions && deal.adminActions.length > 0 && (
        <Section title="Admin Action History">
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
                  {["Admin", "Action", "Reason", "Date"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: 12, fontWeight: 500, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {deal.adminActions.map((action: any) => (
                  <tr key={action.id} style={{ borderBottom: "1px solid #E5E7EB" }}>
                    <td style={{ padding: "8px 12px", fontSize: 13, color: "#111827" }}>
                      {action.admin?.firstName} {action.admin?.lastName}
                    </td>
                    <td style={{ padding: "8px 12px", fontSize: 13, color: "#6B7280" }}>
                      {action.actionType.replace(/_/g, " ")}
                    </td>
                    <td style={{ padding: "8px 12px", fontSize: 13, color: "#6B7280" }}>
                      {action.reason || "—"}
                    </td>
                    <td style={{ padding: "8px 12px", fontSize: 13, color: "#6B7280" }}>
                      {new Date(action.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* Modals */}
      {modal === "approve" && (
        <ActionModal title="Approve Deal" type="approve" onClose={() => setModal(null)} onSubmit={handleAction} />
      )}
      {modal === "reject" && (
        <ActionModal title="Reject Deal" type="reject" onClose={() => setModal(null)} onSubmit={handleAction} />
      )}
      {modal === "golive" && (
        <ActionModal title="Set Deal Live" type="golive" onClose={() => setModal(null)} onSubmit={handleAction} />
      )}
      {modal === "close" && (
        <ActionModal title="Close Deal" type="close" onClose={() => setModal(null)} onSubmit={handleAction} />
      )}
    </div>
  );
}
