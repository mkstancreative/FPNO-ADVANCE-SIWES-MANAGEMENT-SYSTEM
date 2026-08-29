import React from "react";
import { Wallet } from "lucide-react";
import Spinner from "../../ui/Spinner/Spinner";
import type { InternshipPaymentStatusData } from "../../../api/types/internship";

interface InternshipFeeBannerProps {
  payment: InternshipPaymentStatusData | null;
  loading: boolean;
  busy: boolean;
  onPay: () => void;
}

const COPY: Record<
  InternshipPaymentStatusData["nextAction"],
  { heading: string; body: string; cta: string } | null
> = {
  pay: {
    heading: "Internship Fee Outstanding",
    body: "Pay your internship fee to submit your placement and unlock your certificate.",
    cta: "Pay Now",
  },
  verify: {
    heading: "Internship Fee Awaiting Confirmation",
    body: "We have not received confirmation from Remita yet. Open the payment to check.",
    cta: "Verify Payment",
  },
  regenerate_rrr: {
    heading: "Internship Fee Reference Expired",
    body: "Your payment reference is no longer valid. Generate a fresh one to continue.",
    cta: "Get New RRR",
  },
  none: null,
};

/**
 * The internship fee gates both placement submission and the internship
 * certificate, so it gets its own banner rather than hiding inside either flow.
 */
export const InternshipFeeBanner: React.FC<InternshipFeeBannerProps> = ({
  payment,
  loading,
  busy,
  onPay,
}) => {
  if (loading || !payment) return null;

  const copy = COPY[payment.nextAction];
  if (!copy) return null;

  return (
    <div
      className="internship-fee-banner no-blur"
      style={{
        background: "var(--color-bg-secondary)",
        border: "1px solid #fde68a",
        borderLeft: "4px solid #d97706",
        borderRadius: "12px",
        padding: "16px",
        marginBottom: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            background: "rgba(245, 158, 11, 0.15)",
            color: "var(--color-warning, #d97706)",
            padding: "8px",
            borderRadius: "8px",
            display: "flex",
          }}
        >
          <Wallet size={20} />
        </div>
        <div>
          <div
            style={{
              fontWeight: 600,
              fontSize: "14px",
              color: "var(--color-text-primary)",
            }}
          >
            {copy.heading}
            {payment.amount ? (
              <span style={{ color: "var(--color-accent)" }}>
                {" "}
                · ₦{payment.amount.toLocaleString()}
              </span>
            ) : null}
          </div>
          <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
            {copy.body}
          </div>
        </div>
      </div>
      <button
        className="dash-btn dash-btn--sm dash-btn--primary"
        onClick={onPay}
        style={{ color: "#fff", flexShrink: 0 }}
        disabled={busy}
      >
        {busy ? (
          <Spinner size={14} color="#fff" text="Please wait..." />
        ) : (
          copy.cta
        )}
      </button>
    </div>
  );
};
