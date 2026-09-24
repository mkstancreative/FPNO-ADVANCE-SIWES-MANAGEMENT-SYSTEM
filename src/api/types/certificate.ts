import type { ITPeriodDates } from "../../helpers/utilities";

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
  "unpaid" | "pending" | "successful" | "failed" | "covered";

export type CertificateApprovalStatus = "pending" | "approved" | "rejected";

/**
 * Lifecycle of the supporting documents an external student uploads after
 * paying. Separate from `approvalStatus`, which covers the certificate itself.
 */
export type CertificateDocumentStatus =
  "pending" | "submitted" | "approved" | "rejected";

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
  discountApplied?: boolean;
  /**
   * True when the backend re-priced this invoice in flight and minted a new
   * RRR — the student must be told to discard the previous one. See
   * `RepriceInfo` for why this is never safe to swap silently.
   */
  repriced?: boolean;
  /** What the superseded invoice charged. Present whenever `repriced`. */
  previousAmount?: number;
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
    /**
     * The period to show. For a self-registered student these are the dates
     * they typed on the request; for a platform student it is the internship's
     * period. Null when the backend cannot work one out. Only `startDate` and
     * `endDate` are dependable — see `ITPeriodDates`.
     */
    itPeriod?: ITPeriodDates | null;
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
    /** Optional everywhere. Absent, `null` and `""` all mean "no middle name". */
    middleName?: string;
    lastName: string;
  };
  graduationYear: number;
  graduationMonth: string;
  graduationDate: string;
  placeOfIT: string;
  /**
   * Sits next to `placeOfIT` on the admin review response, so a reviewer can
   * check the dates the student entered against the uploaded discharge letter.
   */
  itPeriod?: ITPeriodDates | null;
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

// ─── Re-pricing ───────────────────────────────────────────────────────────────

/**
 * A certificate invoice is not permanent. When the fee a student owes changes
 * after their RRR was minted — they were added to (or removed from) the
 * pre-paid discount list — the backend issues a **new RRR at the new amount**
 * and keeps the old one on file as a superseded reference.
 *
 * The old RRR cannot be cancelled: it stays payable at any bank. So whenever
 * `repriced` comes back, the student must be told explicitly to discard the
 * invoice they are holding, or they will pay the superseded one and create a
 * refund the office has to process by hand.
 */
export interface RepriceInfo {
  /** True when this response replaced an earlier, differently-priced RRR. */
  repriced?: boolean;
  /** What the superseded invoice charged. Present whenever `repriced`. */
  previousAmount?: number;
}

/** `POST /certificates/verify-payment` — the money-handling response. */
export interface CertificateVerifyPaymentData {
  /** Set when a superseded, more expensive invoice was paid — a refund is due. */
  overpaid?: number;
  paidAmount?: number;
  owed?: number;
  /** The 400 "balance remains" variant carries the raw Remita payload here. */
  [key: string]: unknown;
}

export interface CertificateVerifyPaymentResponse {
  success: boolean;
  message?: string;
  data?: CertificateVerifyPaymentData;
}

// ─── Admin: re-price report ───────────────────────────────────────────────────

/** One invoice the backend successfully re-priced. */
export interface RepricedInvoice {
  certificateId: string;
  registrationNumber: string;
  from: number;
  to: number;
  oldRRR: string;
  newRRR: string;
  message: string;
}

/** An invoice that could not be re-priced — already paid, or Remita refused. */
export interface RepriceIssue {
  certificateId?: string;
  registrationNumber?: string;
  from?: number;
  to?: number;
  rrr?: string;
  message?: string;
  reason?: string;
  error?: string;
}

/**
 * Returned by every endpoint that re-prices as a side effect: the discount
 * upload, adding or removing a single discount, and the explicit re-price call.
 */
export interface RepriceReport {
  /** Corrected. A new RRR was issued and the student notified automatically. */
  repriced: RepricedInvoice[];
  /** Money was already in, so these were left alone — they need a refund call. */
  alreadyPaid: RepriceIssue[];
  /** Remita would not issue a replacement; the old reference still works. */
  repriceFailed: RepriceIssue[];
  /** How many invoices were already at the right price. */
  unchanged: number;
}

export interface RepriceReportResponse {
  success: boolean;
  message?: string;
  data: RepriceReport;
}

/** Explicit re-price: one student, or everything the dry run found. */
export type RepricePayload =
  | { registrationNumber: string; all?: never }
  | { all: true; registrationNumber?: never };

// ─── Admin: mispriced invoices (dry run) ──────────────────────────────────────

/**
 * ⚠ Sign convention: `difference = correctAmount - currentAmount`, so a
 * **negative** difference means the student is being over-billed. This is the
 * opposite of `CertificateDiscrepancy.difference` — never share a formatting
 * helper between the two.
 */
export interface MispricedInvoice {
  certificateId: string;
  studentId: string;
  registrationNumber: string;
  currentAmount: number;
  correctAmount: number;
  difference: number;
  discountApplied: boolean;
  paymentStatus: CertificatePaymentStatus;
  rrr: string;
  createdAt: string;
}

export interface MispricedInvoicesData {
  count: number;
  /** Invoices charging more than the student owes. */
  overcharged: number;
  /** Invoices charging less than the student owes. */
  undercharged: number;
  totalOverchargedAmount: number;
  includePaid: boolean;
  items: MispricedInvoice[];
}

export interface MispricedInvoicesResponse {
  success: boolean;
  message?: string;
  data: MispricedInvoicesData;
}

// ─── Admin: refund / balance queue ────────────────────────────────────────────

/**
 * ⚠ Sign convention: `difference = paidAmount - expectedAmount`, so a
 * **positive** difference means the student overpaid and is owed a refund.
 * Opposite of `MispricedInvoice.difference`.
 */
export interface CertificateDiscrepancy {
  certificateId: string;
  registrationNumber: string;
  name: string;
  email: string;
  phone: string;
  paymentStatus: CertificatePaymentStatus;
  /** "over" — the office owes a refund. "under" — the student owes a balance. */
  direction: "over" | "under";
  paidAmount: number;
  expectedAmount: number;
  difference: number;
  rrr: string;
  detectedAt: string;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  note?: string;
}

export interface CertificateDiscrepanciesData {
  count: number;
  /** Total the office owes back to students. */
  refundsOwed: number;
  /** Total students still owe. */
  balancesOwed: number;
  includeResolved: boolean;
  items: CertificateDiscrepancy[];
}

export interface CertificateDiscrepanciesResponse {
  success: boolean;
  message?: string;
  data: CertificateDiscrepanciesData;
}

export interface ResolveDiscrepancyResponse {
  success: boolean;
  message?: string;
  data: CertificateDiscrepancy;
}

// ─── Admin: discount eligibility ──────────────────────────────────────────────

export interface AddCertificateDiscountPayload {
  registrationNumber: string;
  studentName?: string;
  discountAmount?: number;
}

/** Adding a discount also re-prices, so the report is merged into the doc. */
export interface AddCertificateDiscountResponse {
  success: boolean;
  message?: string;
  data: Partial<RepriceReport> & Record<string, unknown>;
}

// ─── Public verification ──────────────────────────────────────────────────────

/** `GET /certificates/verify?certificateNumber=…` — what a QR scan shows. */
export interface CertificateVerifyData {
  certificateNumber: string;
  studentName: string;
  registrationNumber: string;
  department: string;
  program: string;
  graduationYear: number;
  graduationMonth: string;
  placeOfIT: string;
  /** Null when no period could be found — render a dash, do not crash. */
  itPeriod?: ITPeriodDates | null;
  issueDate: string;
}

export interface CertificateVerifyResponse {
  success: boolean;
  verified: boolean;
  message?: string;
  data?: CertificateVerifyData;
}

// ─── Self-registered request: the IT period the student enters ────────────────

/**
 * A self-registered student did their IT outside the platform, so nothing here
 * knows when it ran — they type it in. Both are required, and the end must be
 * strictly after the start.
 */
export interface CertificateITPeriodInput {
  /** ISO date, `YYYY-MM-DD` — exactly what an `<input type="date">` gives. */
  internshipStartDate: string;
  internshipEndDate: string;
}
