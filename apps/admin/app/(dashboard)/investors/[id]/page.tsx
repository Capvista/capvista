"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useParams } from "next/navigation";
import Link from "next/link";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://capvista-api.onrender.com";

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
    PENDING: { bg: "rgba(245, 158, 11, 0.15)", text: "#F59E0B" },
    VERIFIED: { bg: "rgba(16, 185, 129, 0.15)", text: "#10B981" },
    REJECTED: { bg: "rgba(239, 68, 68, 0.15)", text: "#EF4444" },
  };
  const c = colors[status] || colors.PENDING;
  return (
    <span style={{ padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 500, backgroundColor: c.bg, color: c.text }}>
      {status}
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
  type: "verify" | "reject" | "info";
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

  const colors = { verify: "#10B981", reject: "#EF4444", info: "#F59E0B" };

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 12, padding: 24, width: "100%", maxWidth: 480 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 16px 0" }}>{title}</h3>
        {type !== "verify" && (
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={type === "reject" ? "Reason for rejection (required)" : "Message to the investor"}
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
        )}
        {type === "verify" && (
          <p style={{ color: "#6B7280", fontSize: 14 }}>Are you sure you want to verify this investor? This will grant them full platform access.</p>
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
              color: type === "info" ? "#FFFFFF" : "#FFFFFF",
              cursor: submitting ? "not-allowed" : "pointer",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {submitting ? "Processing..." : type === "verify" ? "Confirm Verify" : type === "reject" ? "Confirm Reject" : "Send Request"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InvestorDetailPage() {
  const { accessToken, authFetch } = useAuth();
  const params = useParams();
  const [investor, setInvestor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"verify" | "reject" | "info" | null>(null);

  const fetchInvestor = async () => {
    if (!accessToken) return;
    try {
      const res = await authFetch(`${API_URL}/api/admin/investors/${params.id}`);
      const data = await res.json();
      if (data.success) setInvestor(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestor();
  }, [accessToken, params.id]);

  const handleAction = async (reason?: string) => {
    if (!modal || !accessToken) return;
    const endpoints: Record<string, string> = { verify: "verify", reject: "reject", info: "info" };
    const body = modal === "verify" ? {} : modal === "reject" ? { reason } : { message: reason };

    try {
      const res = await authFetch(`${API_URL}/api/admin/investors/${params.id}/${endpoints[modal]}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setModal(null);
        fetchInvestor();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div style={{ color: "#6B7280", padding: 40, textAlign: "center" }}>Loading investor details...</div>;
  }

  if (!investor) {
    return <div style={{ color: "#EF4444", padding: 40, textAlign: "center" }}>Investor not found</div>;
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <Link href="/investors" style={{ color: "#6B7280", fontSize: 13, textDecoration: "none", marginBottom: 8, display: "inline-block" }}>
            &larr; Back to Investors
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "#0A1F44" }}>
              {investor.fullName || `${investor.user?.firstName || ""} ${investor.user?.lastName || ""}`}
            </h1>
            <StatusBadge status={investor.verificationStatus || "PENDING"} />
          </div>
          <p style={{ color: "#6B7280", fontSize: 14, margin: "4px 0 0" }}>{investor.user?.email}</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setModal("verify")} style={{ padding: "8px 20px", backgroundColor: "#10B981", border: "none", borderRadius: 6, color: "#FFFFFF", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            Verify
          </button>
          <button onClick={() => setModal("reject")} style={{ padding: "8px 20px", backgroundColor: "#EF4444", border: "none", borderRadius: 6, color: "#FFFFFF", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            Reject
          </button>
          <button onClick={() => setModal("info")} style={{ padding: "8px 20px", backgroundColor: "#F59E0B", border: "none", borderRadius: 6, color: "#FFFFFF", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            Request More Info
          </button>
        </div>
      </div>

      {/* Identity & Jurisdiction */}
      <Section title="Identity & Jurisdiction">
        <FieldGrid>
          <Field label="Country of Residence" value={investor.countryOfResidence} />
          <Field label="Citizenship" value={investor.citizenship} />
          <Field label="Tax Residency" value={investor.taxResidency} />
          <Field label="Full Name" value={investor.fullName} />
          <Field label="Date of Birth" value={investor.dateOfBirth ? new Date(investor.dateOfBirth).toLocaleDateString() : null} />
          <Field label="Phone" value={investor.phone} />
          <Field label="Residential Address" value={investor.residentialAddress} />
          <Field label="City" value={investor.city} />
          <Field label="State / Province" value={investor.stateProvince} />
          <Field label="Postal Code" value={investor.postalCode} />
          <Field label="NIN" value={investor.nin} />
          <Field label="BVN" value={investor.bvn} />
          <Field label="SSN" value={investor.ssn} />
          <Field label="NI Number" value={investor.niNumber} />
          <Field label="Passport Number" value={investor.passportNumber} />
          <Field label="ID Type" value={investor.idType} />
          <Field label="ID Number" value={investor.idNumber} />
        </FieldGrid>
      </Section>

      {/* Investor Profile */}
      <Section title="Investor Profile">
        <FieldGrid>
          <Field label="Investor Type" value={investor.investorType} />
          <Field label="Firm Name" value={investor.firmName} />
          <Field label="AUM" value={investor.aum} />
          <Field label="Title" value={investor.investorTitle} />
          <Field label="Years Investing" value={investor.yearsInvesting} />
        </FieldGrid>
      </Section>

      {/* Accreditation */}
      <Section title="Accreditation">
        <FieldGrid>
          <Field label="Accreditation Basis" value={investor.accreditationBasis} />
          <Field label="Accreditation Certified" value={investor.accreditationCertified} />
          <Field label="Expiry Date" value={investor.accreditationExpiresAt ? new Date(investor.accreditationExpiresAt).toLocaleDateString() : null} />
        </FieldGrid>
      </Section>

      {/* Suitability & Risk */}
      <Section title="Suitability & Risk">
        <FieldGrid>
          <Field label="Risk Tolerance" value={investor.riskTolerance} />
          <Field label="General Experience" value={investor.generalExperience} />
          <Field label="Private Market Experience" value={investor.privateMarketExperience} />
          <Field label="Source of Funds" value={investor.sourceOfFunds?.join(", ")} />
          <Field label="Illiquidity Comfort (1-5)" value={investor.illiquidityComfort} />
          <Field label="Can Absorb Total Loss" value={investor.canAbsorbTotalLoss} />
          <Field label="Politically Exposed" value={investor.politicallyExposed} />
          <Field label="PEP Details" value={investor.politicallyExposedDetails} />
          <Field label="Regulatory Restrictions" value={investor.regulatoryRestrictions} />
          <Field label="Restriction Details" value={investor.regulatoryRestrictionsDetails} />
          <Field label="Broker Affiliated" value={investor.brokerAffiliated} />
          <Field label="Broker Details" value={investor.brokerDetails} />
          <Field label="Senior Officer" value={investor.seniorOfficer} />
          <Field label="Senior Officer Company" value={investor.seniorOfficerCompany} />
        </FieldGrid>
      </Section>

      {/* Investment Preferences */}
      <Section title="Investment Preferences">
        <FieldGrid>
          <Field label="Investment Focus Sectors" value={investor.investmentFocus?.join(", ")} />
          <Field label="Preferred Lanes" value={investor.preferredLanes?.join(", ")} />
          <Field label="Minimum Check Size" value={investor.minimumCheckSize ? `$${investor.minimumCheckSize.toLocaleString()}` : null} />
          <Field label="Maximum Check Size" value={investor.maximumCheckSize ? `$${investor.maximumCheckSize.toLocaleString()}` : null} />
          <Field label="Holding Period" value={investor.holdingPeriod} />
          <Field label="Liquidity Needs" value={investor.liquidityNeeds} />
          <Field label="Investment Horizon" value={investor.investmentHorizon} />
        </FieldGrid>
      </Section>

      {/* Risk Acknowledgements */}
      <Section title="Risk Acknowledgements">
        <FieldGrid>
          <Field label="Risk Acknowledged" value={investor.riskAcknowledged} />
          <Field label="Private Placement" value={investor.acknowledgePrivatePlacement} />
          <Field label="Illiquidity" value={investor.acknowledgeIlliquidity} />
          <Field label="Loss Risk" value={investor.acknowledgeLossRisk} />
          <Field label="No Guarantee" value={investor.acknowledgeNoGuarantee} />
          <Field label="Accredited Status" value={investor.acknowledgeAccreditedStatus} />
          <Field label="Not Advisor" value={investor.acknowledgeNotAdvisor} />
          <Field label="E-Signature Timestamp" value={investor.eSignatureTimestamp ? new Date(investor.eSignatureTimestamp).toLocaleString() : null} />
          <Field label="E-Signature IP" value={investor.eSignatureIp} />
          <Field label="Risk Acknowledged At" value={investor.riskAcknowledgedAt ? new Date(investor.riskAcknowledgedAt).toLocaleString() : null} />
        </FieldGrid>
      </Section>

      {/* Trusted Contact */}
      <Section title="Trusted Contact">
        <FieldGrid>
          <Field label="Name" value={investor.trustedContactName} />
          <Field label="Email" value={investor.trustedContactEmail} />
          <Field label="Phone" value={investor.trustedContactPhone} />
          <Field label="Relationship" value={investor.trustedContactRelationship} />
        </FieldGrid>
      </Section>

      {/* Modals */}
      {modal === "verify" && (
        <ActionModal title="Verify Investor" type="verify" onClose={() => setModal(null)} onSubmit={handleAction} />
      )}
      {modal === "reject" && (
        <ActionModal title="Reject Investor" type="reject" onClose={() => setModal(null)} onSubmit={handleAction} />
      )}
      {modal === "info" && (
        <ActionModal title="Request More Information" type="info" onClose={() => setModal(null)} onSubmit={handleAction} />
      )}
    </div>
  );
}
