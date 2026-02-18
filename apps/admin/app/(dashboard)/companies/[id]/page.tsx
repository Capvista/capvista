"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: "#1A2332", border: "1px solid #2A3444", borderRadius: 12, marginBottom: 20, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid #2A3444", backgroundColor: "rgba(200, 162, 77, 0.05)" }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "#C8A24D", margin: 0 }}>{title}</h3>
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: any }) {
  const display = value === null || value === undefined || value === "" ? "—" : typeof value === "boolean" ? (value ? "Yes" : "No") : String(value);
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, color: "#FFFFFF" }}>{display}</div>
    </div>
  );
}

function FieldGrid({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0 24px" }}>{children}</div>;
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    PENDING_REVIEW: { bg: "rgba(245, 158, 11, 0.15)", text: "#F59E0B" },
    APPROVED: { bg: "rgba(16, 185, 129, 0.15)", text: "#10B981" },
    REJECTED: { bg: "rgba(239, 68, 68, 0.15)", text: "#EF4444" },
    INFO_REQUESTED: { bg: "rgba(59, 130, 246, 0.15)", text: "#3B82F6" },
  };
  const c = colors[status] || colors.PENDING_REVIEW;
  return (
    <span style={{ padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 500, backgroundColor: c.bg, color: c.text }}>
      {status.replace(/_/g, " ")}
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
  type: "approve" | "reject" | "info";
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

  const colors = { approve: "#10B981", reject: "#EF4444", info: "#F59E0B" };

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <div style={{ backgroundColor: "#1A2332", border: "1px solid #2A3444", borderRadius: 12, padding: 24, width: "100%", maxWidth: 480 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, margin: "0 0 16px 0" }}>{title}</h3>
        {type !== "approve" && (
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={type === "reject" ? "Reason for rejection (required)" : "Message to the founder"}
            required={type === "reject"}
            style={{
              width: "100%",
              minHeight: 100,
              padding: 12,
              backgroundColor: "#0F1729",
              border: "1px solid #2A3444",
              borderRadius: 8,
              color: "#FFFFFF",
              fontSize: 14,
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />
        )}
        {type === "approve" && (
          <p style={{ color: "#94A3B8", fontSize: 14 }}>Are you sure you want to approve this company? This will make it visible to investors.</p>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 20 }}>
          <button onClick={onClose} style={{ padding: "8px 20px", backgroundColor: "transparent", border: "1px solid #2A3444", borderRadius: 6, color: "#94A3B8", cursor: "pointer", fontSize: 14 }}>
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
              color: type === "info" ? "#0B1220" : "#FFFFFF",
              cursor: submitting ? "not-allowed" : "pointer",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {submitting ? "Processing..." : type === "approve" ? "Confirm Approve" : type === "reject" ? "Confirm Reject" : "Send Request"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CompanyDetailPage() {
  const { accessToken } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"approve" | "reject" | "info" | null>(null);

  const fetchCompany = async () => {
    if (!accessToken) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/companies/${params.id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (data.success) setCompany(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, [accessToken, params.id]);

  const handleAction = async (reason?: string) => {
    if (!modal || !accessToken) return;
    const endpoints: Record<string, string> = {
      approve: "approve",
      reject: "reject",
      info: "info",
    };
    const body = modal === "approve" ? {} : modal === "reject" ? { reason } : { message: reason };

    try {
      const res = await fetch(`${API_URL}/api/admin/companies/${params.id}/${endpoints[modal]}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setModal(null);
        fetchCompany();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div style={{ color: "#94A3B8", padding: 40, textAlign: "center" }}>Loading company details...</div>;
  }

  if (!company) {
    return <div style={{ color: "#EF4444", padding: 40, textAlign: "center" }}>Company not found</div>;
  }

  const founder = company.founders?.[0]?.founder;
  const founderUser = founder?.user;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <Link href="/companies" style={{ color: "#94A3B8", fontSize: 13, textDecoration: "none", marginBottom: 8, display: "inline-block" }}>
            &larr; Back to Companies
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{company.legalName}</h1>
            <StatusBadge status={company.approvalStatus || "PENDING_REVIEW"} />
          </div>
          {company.tradingName && <p style={{ color: "#94A3B8", fontSize: 14, margin: "4px 0 0" }}>Trading as: {company.tradingName}</p>}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setModal("approve")} style={{ padding: "8px 20px", backgroundColor: "#10B981", border: "none", borderRadius: 6, color: "#FFFFFF", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            Approve
          </button>
          <button onClick={() => setModal("reject")} style={{ padding: "8px 20px", backgroundColor: "#EF4444", border: "none", borderRadius: 6, color: "#FFFFFF", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            Reject
          </button>
          <button onClick={() => setModal("info")} style={{ padding: "8px 20px", backgroundColor: "#F59E0B", border: "none", borderRadius: 6, color: "#0B1220", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            Request More Info
          </button>
        </div>
      </div>

      {/* Company Identity */}
      <Section title="Company Identity">
        <FieldGrid>
          <Field label="Legal Name" value={company.legalName} />
          <Field label="Trading Name" value={company.tradingName} />
          <Field label="CAC / Incorporation Number" value={company.incorporationNumber} />
          <Field label="Incorporation Date" value={company.incorporationDate ? new Date(company.incorporationDate).toLocaleDateString() : null} />
          <Field label="Country of Incorporation" value={company.countryOfIncorporation} />
          <Field label="Operating Countries" value={company.operatingCountries?.join(", ")} />
          <Field label="Company Address" value={company.companyAddress} />
          <Field label="Website" value={company.website} />
          <Field label="Official Email Domain" value={company.officialEmailDomain} />
          <Field label="Regulatory Licenses" value={company.regulatoryDependencies} />
          <Field label="CAC Verification Status" value={company.cacVerificationStatus} />
        </FieldGrid>
      </Section>

      {/* Team & Overview */}
      <Section title="Team & Overview">
        <FieldGrid>
          <Field label="Team Size" value={company.teamSize} />
          <Field label="Stage" value={company.stage?.replace(/_/g, " ")} />
          <Field label="One-Line Description" value={company.oneLineDescription} />
          <Field label="Sector" value={company.sector?.replace(/_/g, " ")} />
          <Field label="Subsector" value={company.subsector} />
          <Field label="Business Model" value={company.businessModel} />
          <Field label="Revenue Model" value={company.revenueModel?.replace(/_/g, " ")} />
        </FieldGrid>
        <div style={{ marginTop: 8 }}>
          <Field label="Detailed Description" value={company.detailedDescription} />
        </div>
      </Section>

      {/* Founder Verification */}
      <Section title="Founder Verification">
        <FieldGrid>
          <Field label="Full Name" value={founderUser ? `${founderUser.firstName} ${founderUser.lastName}` : null} />
          <Field label="Email" value={founderUser?.email} />
          <Field label="Phone" value={founderUser?.phone} />
          <Field label="LinkedIn" value={founder?.linkedinUrl} />
          <Field label="Years Experience" value={founder?.yearsExperience} />
          <Field label="NIN" value={founder?.nin || company.founders?.[0]?.nin} />
          <Field label="BVN" value={founder?.bvn || company.founders?.[0]?.bvn} />
        </FieldGrid>
      </Section>

      {/* Traction */}
      <Section title="Traction">
        <FieldGrid>
          <Field label="Revenue Status" value={company.revenueStatus} />
          <Field label="Revenue Range" value={company.revenueRange} />
          <Field label="Primary Revenue Source" value={company.primaryRevenueSource} />
          <Field label="Key Metrics" value={company.keyMetrics ? JSON.stringify(company.keyMetrics) : null} />
          <Field label="Major Customers" value={company.majorCustomers?.join(", ")} />
          <Field label="Geographic Footprint" value={company.geographicFootprint} />
        </FieldGrid>
      </Section>

      {/* Capital & History */}
      <Section title="Capital & History">
        <FieldGrid>
          <Field label="Has Raised Before" value={company.hasRaisedBefore} />
          <Field label="Previous Raises" value={company.previousRaises ? JSON.stringify(company.previousRaises) : null} />
          <Field label="Founder Owned %" value={company.founderOwnedPercent ? `${company.founderOwnedPercent}%` : null} />
          <Field label="External Investors %" value={company.externalInvestorsPercent ? `${company.externalInvestorsPercent}%` : null} />
          <Field label="Notable Investors" value={company.notableInvestors?.join(", ")} />
        </FieldGrid>
      </Section>

      {/* Risks */}
      <Section title="Risks">
        <FieldGrid>
          <Field label="Top 3 Risks" value={company.topRisks?.join(", ")} />
          <Field label="Material Threats" value={company.materialThreats} />
          <Field label="Regulation Dependent" value={company.regulationDependent} />
          <Field label="FX Exposure" value={company.fxExposure} />
          <Field label="Single Supplier Risk" value={company.singleSupplier} />
          <Field label="Infrastructure Dependent" value={company.infrastructureDependent} />
        </FieldGrid>
      </Section>

      {/* Fundraising Intent */}
      <Section title="Fundraising Intent">
        <FieldGrid>
          <Field label="Preferred Lane" value={company.preferredLane} />
          <Field label="Preferred Instrument" value={company.preferredInstrument?.replace(/_/g, " ")} />
          <Field label="Target Raise Range" value={company.targetRaiseRange} />
          <Field label="Primary Use of Funds" value={company.primaryUseOfFunds} />
        </FieldGrid>
      </Section>

      {/* Legal Representations */}
      <Section title="Legal Representations">
        <FieldGrid>
          <Field label="Equity Acknowledgement Accepted" value={company.equityAcknowledgementAccepted} />
          <Field label="Equity Acknowledgement Timestamp" value={company.equityAcknowledgementTimestamp ? new Date(company.equityAcknowledgementTimestamp).toLocaleString() : null} />
          <Field label="Equity Acknowledgement IP" value={company.equityAcknowledgementIp} />
          <Field label="Equity Issued to Capvista Holdings" value={company.equityIssuedToCapvistaHoldings} />
        </FieldGrid>
      </Section>

      {/* Modals */}
      {modal === "approve" && (
        <ActionModal title="Approve Company" type="approve" onClose={() => setModal(null)} onSubmit={handleAction} />
      )}
      {modal === "reject" && (
        <ActionModal title="Reject Company" type="reject" onClose={() => setModal(null)} onSubmit={handleAction} />
      )}
      {modal === "info" && (
        <ActionModal title="Request More Information" type="info" onClose={() => setModal(null)} onSubmit={handleAction} />
      )}
    </div>
  );
}
