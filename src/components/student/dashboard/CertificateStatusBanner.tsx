import React from "react";
import { GraduationCap } from "lucide-react";
import Spinner from "../../ui/Spinner/Spinner";
import type {
  CertificateNextAction,
  CertificateStatus,
} from "../../../api/types/certificate";
import {
  approvalLabel,
  nextActionDescription,
  nextActionLabel,
  resolveNextAction,
} from "../../../helpers/certificateFlow";

interface CertificateStatusBannerProps {
  certificate: CertificateStatus | null;
  loadingCert: boolean;
  busy: boolean;
  /** Single entry point — the dashboard maps the action to the right screen. */
  onAction: (action: CertificateNextAction) => void;
}

export const CertificateStatusBanner: React.FC<
  CertificateStatusBannerProps
> = ({ certificate, loadingCert, busy, onAction }) => {
  if (loadingCert || !certificate) return null;

  // A student with no order and no request yet has nothing to act on, unless
  // the backend explicitly named the next step.
  const hasSomethingToShow =
    !!certificate.nextAction || !!certificate.rrr || !!certificate.requestId;
  if (!hasSomethingToShow) return null;

  const action = resolveNextAction(certificate);
  if (!action) return null;

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
            <span style={{ color: "var(--color-accent)" }}>
              {approvalLabel(certificate)}
            </span>
          </div>
          <div
            style={{
              fontSize: "12px",
              color:
                action === "resubmit" ? "#ef4444" : "var(--color-text-muted)",
            }}
          >
            {nextActionDescription(certificate)}
          </div>
        </div>
      </div>
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
    </div>
  );
};
