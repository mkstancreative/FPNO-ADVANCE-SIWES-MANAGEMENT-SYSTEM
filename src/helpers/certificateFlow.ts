import type {
  CertificateFeeData,
  CertificateNextAction,
  CertificatePaymentStatus,
  CertificateStatus,
} from "../api/types/certificate";

/**
 * `covered` students never pay directly — their internship fee already settled
 * the certificate — so every "has this been paid for?" check has to accept it
 * alongside `successful`.
 */
export const isFeeSettled = (status?: CertificatePaymentStatus): boolean =>
  status === "successful" || status === "covered";

/**
 * The fee endpoint answers for students with no request yet, so it — not
 * `/certificates/status` — decides whether there is anything to offer.
 */
export const feeNextAction = (
  fee?: CertificateFeeData | null,
): CertificateNextAction | null => fee?.nextAction ?? null;

/**
 * The backend now hands us `nextAction`, which is the only field that should
 * decide which certificate screen a student sees. The fallback below keeps the
 * UI coherent against an older payload (or a partial one) by deriving the same
 * answer from the legacy fields.
 */
export const resolveNextAction = (
  certificate?: CertificateStatus | null,
): CertificateNextAction | null => {
  if (!certificate) return null;
  if (certificate.nextAction) return certificate.nextAction;

  if (certificate.approvalStatus === "rejected") return "resubmit";
  if (!isFeeSettled(certificate.paymentStatus)) return "pay";
  if (certificate.canDownload) return "download";
  if (!certificate.requestId) return "upload_documents";
  return "await_approval";
};

/** Label for the primary button that carries out `action`. */
export const nextActionLabel = (
  action: CertificateNextAction | null,
): string => {
  switch (action) {
    case "pay":
      return "Complete Payment";
    case "request_internship_certificate":
      return "Request Certificate";
    case "upload_documents":
      return "Upload Documents";
    case "await_approval":
      return "View Details";
    case "resubmit":
      return "View Rejection";
    case "download":
      return "Download Now";
    default:
      return "View Details";
  }
};

/** One-line explanation shown under the certificate status heading. */
export const nextActionDescription = (
  certificate: CertificateStatus,
): string => {
  switch (resolveNextAction(certificate)) {
    case "pay":
      return "Pay the certificate fee to continue";
    case "request_internship_certificate":
      return "Your internship fee covers this — request your certificate";
    case "upload_documents":
      return "Payment received — upload your supporting documents";
    case "await_approval":
      return "Awaiting administrative review";
    case "resubmit":
      return certificate.rejectionReason
        ? `Reason: ${certificate.rejectionReason}`
        : "Please contact the CIMS unit";
    case "download":
      return "Your certificate is ready for download";
    default:
      return "Processing";
  }
};

/** Heading shown beside the certificate icon. */
export const approvalLabel = (certificate: CertificateStatus): string => {
  if (certificate.approvalStatus === "approved") return "Approved";
  if (certificate.approvalStatus === "rejected") return "Rejected";
  return "Processing";
};
