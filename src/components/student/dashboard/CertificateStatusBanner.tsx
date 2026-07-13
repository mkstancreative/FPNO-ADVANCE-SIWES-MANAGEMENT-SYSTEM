import React from "react";
import { GraduationCap } from "lucide-react";
import Spinner from "../../ui/Spinner/Spinner";
import type {
  CertificateStatus,
  RRRData,
} from "../../../api/types/certificate";

interface CertificateStatusBannerProps {
  certificate: CertificateStatus | null;
  loadingCert: boolean;
  downloadingCert: boolean;
  onOpenRejection: (id: string, reason: string) => void;
  onOpenPayment: (data: RRRData, showVerify: boolean) => void;
  onOpenRequest: (requestId?: string) => void;
  onDownload: () => void;
  onOpenPending: (data: {
    requestId?: string;
    paymentStatus?: string;
    requestDate?: string;
  }) => void;
}

export const CertificateStatusBanner: React.FC<
  CertificateStatusBannerProps
> = ({
  certificate,
  loadingCert,
  downloadingCert,
  onOpenRejection,
  onOpenPayment,
  onOpenRequest,
  onDownload,
  onOpenPending,
}) => {
  if (
    loadingCert ||
    !certificate ||
    (!certificate.rrr && !certificate.requestId)
  ) {
    return null;
  }

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
              {certificate.approvalStatus === "approved"
                ? "Approved"
                : certificate.approvalStatus === "rejected"
                  ? "Rejected"
                  : "Processing"}
            </span>
          </div>
          <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
            {certificate.approvalStatus === "rejected" ? (
              <span style={{ color: "#ef4444" }}>
                Reason:{" "}
                {certificate.rejectionReason || "Please contact CIMS unit"}
              </span>
            ) : certificate.paymentStatus !== "successful" ? (
              "Pending Payment Verification"
            ) : certificate.approvalStatus !== "approved" ? (
              "Awaiting Administrative Review"
            ) : (
              "Your certificate is ready for download"
            )}
          </div>
        </div>
      </div>
      <button
        className="dash-btn dash-btn--sm dash-btn--primary"
        onClick={() => {
          if (certificate.approvalStatus === "rejected") {
            onOpenRejection(
              certificate.requestId || "",
              certificate.rejectionReason || "No reason provided",
            );
          } else if (
            certificate.rrr &&
            certificate.rrr !== "Pending" &&
            certificate.paymentStatus !== "successful"
          ) {
            onOpenPayment(certificate as RRRData, false);
          } else if (
            !certificate.rrr ||
            certificate.rrr === "Pending" ||
            certificate.paymentStatus === "failed"
          ) {
            onOpenRequest();
          } else if (certificate.canDownload) {
            onDownload();
          } else if (certificate.approvalStatus === "pending") {
            onOpenPending(certificate);
          }
        }}
        style={{ color: "#fff" }}
        disabled={downloadingCert}
      >
        {downloadingCert ? (
          <>
            <Spinner size={14} color="#fff" text="Please wait..." />
          </>
        ) : certificate.approvalStatus === "rejected" ? (
          "View Rejection"
        ) : certificate.paymentStatus === "failed" ? (
          "Verify Payment"
        ) : certificate.paymentStatus !== "successful" ? (
          "Complete Payment"
        ) : certificate.canDownload ? (
          "Download Now"
        ) : (
          "View Details"
        )}
      </button>
    </div>
  );
};
