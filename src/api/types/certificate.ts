// ─── Shared payment primitives ────────────────────────────────────────────────

/**
 * `covered` means the fee was settled some other way — a waiver, or a platform
 * student whose internship fee already paid for the certificate. Treat it
 * exactly like `successful` when deciding what a student may do next.
 */
export type CertificatePaymentStatus =
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
