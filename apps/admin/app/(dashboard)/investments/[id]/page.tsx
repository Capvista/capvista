"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useParams } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
    INTERESTED: { bg: "rgba(148, 163, 184, 0.15)", text: "#94A3B8" },
    COMMITTED: { bg: "rgba(139, 92, 246, 0.15)", text: "#8B5CF6" },
    PENDING_FUNDING: { bg: "rgba(245, 158, 11, 0.15)", text: "#F59E0B" },
    FUNDED: { bg: "rgba(16, 185, 129, 0.15)", text: "#10B981" },
    ACTIVE: { bg: "rgba(59, 130, 246, 0.15)", text: "#3B82F6" },
    COMPLETED: { bg: "rgba(16, 185, 129, 0.15)", text: "#10B981" },
    DEFAULTED: { bg: "rgba(239, 68, 68, 0.15)", text: "#EF4444" },
    CANCELLED: { bg: "rgba(107, 114, 128, 0.15)", text: "#6B7280" },
    WAITLISTED: { bg: "rgba(200, 162, 77, 0.15)", text: "#C8A24D" },
  };
  const c = colors[status] || colors.INTERESTED;
  return (
    <span style={{ padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 500, backgroundColor: c.bg, color: c.text }}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

function ConfirmFundingModal({
  commitmentAmount,
  onClose,
  onSubmit,
}: {
  commitmentAmount: number;
  onClose: () => void;
  onSubmit: (fundedAmount: number, externalRef: string) => void;
}) {
  const [fundedAmount, setFundedAmount] = useState(String(commitmentAmount));
  const [externalRef, setExternalRef] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    const amount = Number(fundedAmount);
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    if (amount !== commitmentAmount) {
      setError(`Funded amount must match commitment amount ($${commitmentAmount.toLocaleString()})`);
      return;
    }
    setError("");
    setSubmitting(true);
    await onSubmit(amount, externalRef);
    setSubmitting(false);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: 12,
    backgroundColor: "#0F1729",
    border: "1px solid #2A3444",
    borderRadius: 8,
    color: "#FFFFFF",
    fontSize: 14,
    boxSizing: "border-box",
  };

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <div style={{ backgroundColor: "#1A2332", border: "1px solid #2A3444", borderRadius: 12, padding: 24, width: "100%", maxWidth: 480 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 16px 0" }}>Confirm Funding</h3>
        <p style={{ color: "#94A3B8", fontSize: 14, marginBottom: 16 }}>
          Confirm that funds have been received for this investment. Commitment amount: <strong style={{ color: "#FFFFFF" }}>${commitmentAmount.toLocaleString()}</strong>
        </p>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, color: "#94A3B8", marginBottom: 6 }}>Funded Amount ($) *</label>
          <input
            type="number"
            value={fundedAmount}
            onChange={(e) => setFundedAmount(e.target.value)}
            style={inputStyle}
            step="0.01"
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, color: "#94A3B8", marginBottom: 6 }}>External Reference (optional)</label>
          <input
            type="text"
            value={externalRef}
            onChange={(e) => setExternalRef(e.target.value)}
            placeholder="Wire transfer reference, transaction ID, etc."
            style={inputStyle}
          />
        </div>

        {error && <p style={{ color: "#EF4444", fontSize: 13, marginBottom: 12 }}>{error}</p>}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 20 }}>
          <button onClick={onClose} style={{ padding: "8px 20px", backgroundColor: "transparent", border: "1px solid #2A3444", borderRadius: 6, color: "#94A3B8", cursor: "pointer", fontSize: 14 }}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              padding: "8px 20px",
              backgroundColor: "#10B981",
              border: "none",
              borderRadius: 6,
              color: "#FFFFFF",
              cursor: submitting ? "not-allowed" : "pointer",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {submitting ? "Processing..." : "Confirm Funding"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CancelModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    await onSubmit(reason);
    setSubmitting(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <div style={{ backgroundColor: "#1A2332", border: "1px solid #2A3444", borderRadius: 12, padding: 24, width: "100%", maxWidth: 480 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 16px 0" }}>Cancel Investment</h3>
        <p style={{ color: "#94A3B8", fontSize: 14, marginBottom: 16 }}>
          Are you sure you want to cancel this investment? This action cannot be undone.
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for cancellation (optional)"
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
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 20 }}>
          <button onClick={onClose} style={{ padding: "8px 20px", backgroundColor: "transparent", border: "1px solid #2A3444", borderRadius: 6, color: "#94A3B8", cursor: "pointer", fontSize: 14 }}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              padding: "8px 20px",
              backgroundColor: "#EF4444",
              border: "none",
              borderRadius: 6,
              color: "#FFFFFF",
              cursor: submitting ? "not-allowed" : "pointer",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {submitting ? "Processing..." : "Confirm Cancellation"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InvestmentDetailPage() {
  const { accessToken } = useAuth();
  const params = useParams();
  const [investment, setInvestment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"confirm-funding" | "cancel" | null>(null);

  const fetchInvestment = async () => {
    if (!accessToken) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/investments/${params.id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (data.success) setInvestment(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestment();
  }, [accessToken, params.id]);

  const handleConfirmFunding = async (fundedAmount: number, externalRef: string) => {
    if (!accessToken) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/investments/${params.id}/confirm-funding`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ fundedAmount, externalRef: externalRef || undefined }),
      });
      const data = await res.json();
      if (data.success) {
        setModal(null);
        fetchInvestment();
      } else {
        alert(data.error?.message || "Failed to confirm funding");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = async (reason: string) => {
    if (!accessToken) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/investments/${params.id}/cancel`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason || undefined }),
      });
      const data = await res.json();
      if (data.success) {
        setModal(null);
        fetchInvestment();
      } else {
        alert(data.error?.message || "Failed to cancel investment");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div style={{ color: "#94A3B8", padding: 40, textAlign: "center" }}>Loading investment details...</div>;
  }

  if (!investment) {
    return <div style={{ color: "#EF4444", padding: 40, textAlign: "center" }}>Investment not found</div>;
  }

  const formatCurrency = (value: any) => {
    if (!value) return "—";
    return `$${Number(value).toLocaleString()}`;
  };

  const formatDate = (value: any) => {
    if (!value) return "—";
    return new Date(value).toLocaleString();
  };

  const deal = investment.deal;
  const investor = investment.investor;
  const company = deal?.company;
  const escrowTxns = investment.escrowTransactions || [];
  const ownershipRecords = investment.ownershipRecords || [];

  const showConfirmFunding = investment.status === "PENDING_FUNDING";
  const showCancel = investment.status !== "COMPLETED" && investment.status !== "CANCELLED";

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <Link href="/investments" style={{ color: "#94A3B8", fontSize: 13, textDecoration: "none", marginBottom: 8, display: "inline-block" }}>
            &larr; Back to Investments
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>
              Investment #{investment.id.slice(-8).toUpperCase()}
            </h1>
            <StatusBadge status={investment.status} />
          </div>
          <p style={{ color: "#94A3B8", fontSize: 14, margin: "4px 0 0" }}>
            {investor?.fullName || "—"} &rarr;{" "}
            <Link href={`/deals/${deal?.id}`} style={{ color: "#C8A24D", textDecoration: "none" }}>
              {deal?.name || "—"}
            </Link>
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {showConfirmFunding && (
            <button onClick={() => setModal("confirm-funding")} style={{ padding: "8px 20px", backgroundColor: "#10B981", border: "none", borderRadius: 6, color: "#FFFFFF", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              Confirm Funding
            </button>
          )}
          {showCancel && (
            <button onClick={() => setModal("cancel")} style={{ padding: "8px 20px", backgroundColor: "#EF4444", border: "none", borderRadius: 6, color: "#FFFFFF", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              Cancel Investment
            </button>
          )}
        </div>
      </div>

      {/* Investment Overview */}
      <Section title="Investment Overview">
        <FieldGrid>
          <Field label="Status" value={investment.status?.replace(/_/g, " ")} />
          <Field label="Commitment Amount" value={formatCurrency(investment.commitmentAmount)} />
          <Field label="Funded Amount" value={formatCurrency(investment.fundedAmount)} />
          <Field label="Current Value" value={formatCurrency(investment.currentValue)} />
          <Field label="Total Returned" value={formatCurrency(investment.totalReturned)} />
          <Field label="Funding Method" value={investment.fundingMethod} />
          <Field label="Funding Reference" value={investment.fundingReference} />
          <Field label="Waitlisted" value={investment.waitlisted} />
          {investment.waitlistPosition && <Field label="Waitlist Position" value={investment.waitlistPosition} />}
        </FieldGrid>
      </Section>

      {/* Timeline */}
      <Section title="Timeline">
        <FieldGrid>
          <Field label="Interest Expressed" value={formatDate(investment.interestedAt)} />
          <Field label="Committed" value={formatDate(investment.committedAt)} />
          <Field label="Funded" value={formatDate(investment.fundedAt)} />
          <Field label="Completed" value={formatDate(investment.completedAt)} />
          <Field label="Created" value={formatDate(investment.createdAt)} />
          <Field label="Last Updated" value={formatDate(investment.updatedAt)} />
          <Field label="Funding Deadline" value={formatDate(investment.fundingDeadline)} />
        </FieldGrid>
      </Section>

      {/* Subscription & Confirmations */}
      <Section title="Subscription & Confirmations">
        <FieldGrid>
          <Field label="Subscription Agreement Signed" value={formatDate(investment.subscriptionAgreementSignedAt)} />
          <Field label="Subscription Agreement IP" value={investment.subscriptionAgreementIp} />
          <Field label="Confirmed Qualified Investor" value={investment.confirmedQualifiedInvestor} />
          <Field label="Confirmed Understands Risks" value={investment.confirmedUnderstandsRisks} />
          <Field label="Confirmed Own Account" value={investment.confirmedOwnAccount} />
          <Field label="Confirmed No Liquidity Expectation" value={investment.confirmedNoLiquidityExpectation} />
        </FieldGrid>
      </Section>

      {/* E-Signature */}
      <Section title="E-Signature">
        <FieldGrid>
          <Field label="E-Signature" value={investment.eSignature} />
          <Field label="E-Signature Timestamp" value={formatDate(investment.eSignatureTimestamp)} />
          <Field label="E-Signature IP" value={investment.eSignatureIp} />
        </FieldGrid>
      </Section>

      {/* Investor Information */}
      {investor && (
        <Section title="Investor Information">
          <FieldGrid>
            <Field label="Full Name" value={investor.fullName} />
            <Field label="Email" value={investor.user?.email} />
            <Field label="Investor Type" value={investor.investorType?.replace(/_/g, " ")} />
            <Field label="Accreditation Status" value={investor.accreditationStatus?.replace(/_/g, " ")} />
            <Field label="Country" value={investor.country} />
            <Field label="Verification Status" value={investor.verificationStatus?.replace(/_/g, " ")} />
          </FieldGrid>
          <Link href={`/investors/${investor.id}`} style={{ color: "#C8A24D", fontSize: 13, textDecoration: "none" }}>
            View Full Investor Profile &rarr;
          </Link>
        </Section>
      )}

      {/* Deal Information */}
      {deal && (
        <Section title="Deal Information">
          <FieldGrid>
            <Field label="Deal Name" value={deal.name} />
            <Field label="Lane" value={deal.lane} />
            <Field label="Instrument Type" value={deal.instrumentType?.replace(/_/g, " ")} />
            <Field label="Deal Status" value={deal.status?.replace(/_/g, " ")} />
            <Field label="Target Amount" value={formatCurrency(deal.targetAmount)} />
            <Field label="Minimum Investment" value={formatCurrency(deal.minimumInvestment)} />
          </FieldGrid>
          {company && (
            <FieldGrid>
              <Field label="Company" value={company.legalName} />
              <Field label="Sector" value={company.sector?.replace(/_/g, " ")} />
            </FieldGrid>
          )}
          <Link href={`/deals/${deal.id}`} style={{ color: "#C8A24D", fontSize: 13, textDecoration: "none" }}>
            View Full Deal Details &rarr;
          </Link>
        </Section>
      )}

      {/* Wire Instructions */}
      {investment.wireInstructions && (
        <Section title="Wire Instructions">
          <pre style={{ color: "#94A3B8", fontSize: 13, whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0 }}>
            {typeof investment.wireInstructions === "object"
              ? JSON.stringify(investment.wireInstructions, null, 2)
              : String(investment.wireInstructions)}
          </pre>
        </Section>
      )}

      {/* Admin Notes */}
      {investment.adminNotes && (
        <Section title="Admin Notes">
          <p style={{ color: "#94A3B8", fontSize: 14, margin: 0 }}>{investment.adminNotes}</p>
          {investment.reviewedBy && (
            <p style={{ color: "#64748B", fontSize: 12, marginTop: 8 }}>
              Reviewed at {formatDate(investment.reviewedAt)}
            </p>
          )}
        </Section>
      )}

      {/* Escrow Transactions */}
      <Section title="Escrow Transactions">
        {escrowTxns.length === 0 ? (
          <p style={{ color: "#94A3B8", fontSize: 14, margin: 0 }}>No escrow transactions recorded</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #2A3444" }}>
                  {["Direction", "Amount", "Status", "External Ref", "Date"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: 12, fontWeight: 500, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {escrowTxns.map((txn: any) => (
                  <tr key={txn.id} style={{ borderBottom: "1px solid #2A3444" }}>
                    <td style={{ padding: "8px 12px", fontSize: 13, color: "#FFFFFF" }}>
                      {txn.direction?.replace(/_/g, " ")}
                    </td>
                    <td style={{ padding: "8px 12px", fontSize: 13, color: "#FFFFFF", fontWeight: 500 }}>
                      {formatCurrency(txn.amount)}
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      <span style={{
                        padding: "3px 8px",
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 500,
                        backgroundColor: txn.status === "COMPLETED" ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                        color: txn.status === "COMPLETED" ? "#10B981" : "#F59E0B",
                      }}>
                        {txn.status}
                      </span>
                    </td>
                    <td style={{ padding: "8px 12px", fontSize: 13, color: "#94A3B8" }}>
                      {txn.externalRef || "—"}
                    </td>
                    <td style={{ padding: "8px 12px", fontSize: 13, color: "#94A3B8" }}>
                      {new Date(txn.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* Ownership Records */}
      {ownershipRecords.length > 0 && (
        <Section title="Ownership Records">
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #2A3444" }}>
                  {["Type", "Units/Shares", "Percentage", "Issued At"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: 12, fontWeight: 500, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ownershipRecords.map((rec: any) => (
                  <tr key={rec.id} style={{ borderBottom: "1px solid #2A3444" }}>
                    <td style={{ padding: "8px 12px", fontSize: 13, color: "#FFFFFF" }}>{rec.ownershipType?.replace(/_/g, " ")}</td>
                    <td style={{ padding: "8px 12px", fontSize: 13, color: "#FFFFFF" }}>{rec.units || rec.shares || "—"}</td>
                    <td style={{ padding: "8px 12px", fontSize: 13, color: "#FFFFFF" }}>{rec.percentage ? `${rec.percentage}%` : "—"}</td>
                    <td style={{ padding: "8px 12px", fontSize: 13, color: "#94A3B8" }}>{rec.issuedAt ? new Date(rec.issuedAt).toLocaleString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* Modals */}
      {modal === "confirm-funding" && (
        <ConfirmFundingModal
          commitmentAmount={Number(investment.commitmentAmount)}
          onClose={() => setModal(null)}
          onSubmit={handleConfirmFunding}
        />
      )}
      {modal === "cancel" && (
        <CancelModal
          onClose={() => setModal(null)}
          onSubmit={handleCancel}
        />
      )}
    </div>
  );
}
