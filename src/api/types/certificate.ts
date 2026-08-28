// ─── Shared payment primitives ────────────────────────────────────────────────

/**
 * `covered` means the fee was settled some other way — a waiver, or a platform
 * student whose internship fee already paid for the certificate. Treat it
 * exactly like `successful` when deciding what a student may do next.
 *
 * `unpaid` is what `GET /certificates/fee` reports before any order exists;
 * `pending` is an order raised but not yet confirmed by Remita. Both mean the
 * student still owes money, but only `pending` has an RRR to resume from.
 */
export type CertificatePaymentStatus =
  | "unpaid"
  | "pending"
  | "successful"
  | "failed"
  | "covered";

export type CertificateApprovalStatus = "pending" | "approved" | "rejected";

/**
 * Lifecycle of the supporting documents an external student uploads after
 * paying. Separate from `approvalStatus`, which covers the certificate itself.
 */
export type CertificateDocumentStatus =
  | "pending"
  | "submitted"
  | "approved"
  | "rejected";

/**
 * The single field that decides which screen a student sees. Prefer this over
 * re-deriving the state from `paymentStatus` + `approvalStatus` + `rrr`.
 */
export type CertificateNextAction =
  | "pay"
  | "request_internship_certificate"
  | "upload_documents"
  | "await_approval"
  | "resubmit"
  | "download";

/** Everything needed to drive the Remita widget for one order. */
export interface RRRData {
  certificateId?: string;
  internshipId?: string;
  orderId: string;
  rrr: string;
  amount: number;
  merchantId?: string;
}

// ─── Student-facing status ────────────────────────────────────────────────────

export interface CertificateStatus {
  paymentStatus: CertificatePaymentStatus;
  approvalStatus: CertificateApprovalStatus;
  documentStatus?: CertificateDocumentStatus;
  nextAction?: CertificateNextAction;
  canDownload: boolean;
  rrr?: string;
  amount?: number;
  orderId: string;
  merchantId?: string;
  certificateId?: string;
  certificateNumber?: string;
  graduationYear?: number;
  graduationMonth?: string;
  graduationDate?: string;
  placeOfIT?: string;
  requestId?: string;
  rejectionReason?: string;
  issuedAt?: string;
}

export interface CertificateStatusResponse {
  success: boolean;
  message?: string;
  data: CertificateStatus;
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface AdminCertificateRequest {
  _id: string;
  student: {
    department: {
      name: string;
      code: string;
    };
    program: {
      type: string;
      level: string;
    };
    _id: string;
    registrationNumber: string;
    batch?: {
      itPeriod: {
        name: string;
        startDate: string;
        endDate: string;
        duration: number;
      };
      _id: string;
    };
  };
  user: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  graduationYear: number;
  graduationMonth: string;
  graduationDate: string;
  placeOfIT: string;
  paymentStatus: CertificatePaymentStatus;
  documentStatus?: CertificateDocumentStatus;
  paymentAmount?: number;
  rrr?: string;
  certificateNumber?: string;
  issuedAt?: string;
  approvalStatus: CertificateApprovalStatus;
  documents: {
    ndStatementOfResult?: { url: string };
    hndStatementOfResult?: { url: string };
    itDischargeLetter?: { url: string };
  };
  createdAt: string;
  updatedAt: string;
}

export interface AdminCertificateParams {
  page: number;
  limit: number;
  startDate: string;
  endDate: string;
  status?: string | null;
  paymentStatus?: string | null;
  documentStatus?: string | null;
  search?: string | null;
}

// ─── Certificate fee ──────────────────────────────────────────────────────────

/**
 * `GET /certificates/fee` — the only certificate endpoint that answers for a
 * student with no request yet (`/certificates/status` 404s with "No certificate
 * request found"). It reports what this student owes and what they should do
 * next, for both tracks:
 *
 *   platform student   → paymentStatus "covered", paid true,  amount 0,
 *                        nextAction "request_internship_certificate"
 *   self-registered    → paymentStatus "unpaid",  paid false, amount = the fee,
 *                        nextAction "pay"
 *
 * Fields beyond the core four are optional — only the self-registered response
 * has been observed directly.
 */
export interface CertificateFeeData {
  amount: number;
  paid: boolean;
  paymentStatus: CertificatePaymentStatus;
  nextAction: CertificateNextAction;
  currency?: string;
  /** False once the fee is covered or waived. */
  feeRequired?: boolean;
  /** Why this amount — e.g. "certificate_fee". */
  reason?: string;
  discountApplied?: boolean;
  discountAmount?: number | null;
  /** Null until a request exists. */
  certificateId?: string | null;
  approvalStatus?: CertificateApprovalStatus | null;
  documentStatus?: CertificateDocumentStatus | null;
}

export interface CertificateFeeResponse {
  success: boolean;
  message?: string;
  data: CertificateFeeData;
}
