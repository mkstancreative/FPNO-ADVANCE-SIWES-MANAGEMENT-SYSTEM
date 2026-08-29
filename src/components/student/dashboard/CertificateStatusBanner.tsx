import React from "react";
import { GraduationCap } from "lucide-react";
import Spinner from "../../ui/Spinner/Spinner";
import type {
  CertificateFeeData,
  CertificateNextAction,
  CertificateStatus,
} from "../../../api/types/certificate";
import {
  approvalLabel,
  availableNextAction,
  feeNextAction,
  isActionUnlocked,
  nextActionDescription,
  nextActionLabel,
  resolveNextAction,
} from "../../../helpers/certificateFlow";

interface CertificateStatusBannerProps {
  certificate: CertificateStatus | null;
  /**
   * `/certificates/fee`, which answers even when no request exists. Without it
   * a student who has never started gets no banner at all, because
   * `/certificates/status` 404s and leaves `certificate` null.
   */
  fee: CertificateFeeData | null;
  /**
   * The student's IT status. A platform student is not offered the certificate
   * request until this reads "completed".
   */
  itStatus?: string;
  loadingCert: boolean;
  busy: boolean;
  /** Single entry point — the dashboard maps the action to the right screen. */
  onAction: (action: CertificateNextAction) => void;
}

/** Description when there is no request yet and only the fee is known. */
function feeDescription(fee: CertificateFeeData | null): string {
  if (!fee) return "Processing";
  if (fee.nextAction === "pay") {
    return `Certificate fee: ₦${fee.amount.toLocaleString()}`;
  }
  if (fee.nextAction === "request_internship_certificate") {
    return "Your internship fee covers this — request your certificate";
  }
  return "Processing";
}

export const CertificateStatusBanner: React.FC<
  CertificateStatusBannerProps
> = ({ certificate, fee, itStatus, loadingCert, busy, onAction }) => {
  if (loadingCert) return null;

  // An existing request is the richer source; fall back to the fee endpoint for
  // students who have not started one yet.
  const rawAction = certificate
    ? (resolveNextAction(certificate) ?? feeNextAction(fee))
    : feeNextAction(fee);

  // Locked rather than absent: tell the student the certificate is coming and
  // what unlocks it, instead of showing nothing at all.
  const locked = !isActionUnlocked(rawAction, itStatus);
  const action = availableNextAction(rawAction, itStatus);
  if (!action && !locked) return null;

  const heading = locked
    ? "Available After IT"
    : certificate
      ? approvalLabel(certificate)
      : "Not Requested";
  const description = locked
    ? "You can request your certificate once your IT is marked completed"
    : certificate
      ? nextActionDescription(certificate)
      : feeDescription(fee);

  return (
    <div
      className="certificate-status-banner no-blur"
      style={{
        background: "var(--color-bg-secondary)",
        border: "1px solid var(--color-border)",
        borderRadius: "12px",
        padding: "16px",
        marginBottom: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            background: "var(--color-accent-soft)",
            color: "var(--color-accent)",
            padding: "8px",
            borderRadius: "8px",
          }}
        >
          <GraduationCap size={20} />
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: "14px" }}>
            <span style={{ color: "var(--color-text-primary)" }}>
              IT Certificate Status:{" "}
            </span>
            <span style={{ color: "var(--color-accent)" }}>{heading}</span>
          </div>
          <div
            style={{
              fontSize: "12px",
              color:
                action === "resubmit" ? "#ef4444" : "var(--color-text-muted)",
            }}
          >
            {description}
          </div>
        </div>
      </div>
      {action && (
      <button
        className="dash-btn dash-btn--sm dash-btn--primary"
        onClick={() => onAction(action)}
        style={{ color: "#fff" }}
        disabled={busy}
      >
        {busy ? (
          <Spinner size={14} color="#fff" text="Please wait..." />
        ) : (
          nextActionLabel(action)
        )}
      </button>
      )}
    </div>
  );
};
