import type { Batch } from "./batch";
import type {
  StudentUser,
  StudentDepartment,
  StudentProgram,
  ITStatus,
} from "./student";

export type InternshipStatus = ITStatus;

export interface InternshipStudentRef {
  _id: string;
  user: StudentUser;
  registrationNumber: string;
  department?: StudentDepartment;
  program?: StudentProgram;
}

export interface InternshipIndustrialSupervisorRef {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

export interface InternshipSchoolSupervisorRef {
  _id: string;
  user: StudentUser;
  departments: string[];
}

export interface InternshipSupervisors {
  industrial?: InternshipIndustrialSupervisorRef;
  school?: InternshipSchoolSupervisorRef;
}

export interface InternshipPlacement {
  company: string | Record<string, unknown> | null;
  position: string;
  department?: string;
  startDate: string;
  status: string;
}

export interface InternshipITPeriod {
  startDate: string;
  endDate: string;
  expectedDuration: number;
}

export interface Internship {
  _id: string;
  student: InternshipStudentRef | string;
  batch: Batch | string;
  session: string;
  itStatus: InternshipStatus;
  isCurrent: boolean;
  supervisors?: InternshipSupervisors;
  placement?: InternshipPlacement;
  itPeriod?: InternshipITPeriod;
  paymentStatus?: InternshipPaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface InternshipListResponse {
  success: boolean;
  total: number;
  page: number;
  pages: number;
  data: Internship[];
}

export interface InternshipDetailResponse {
  success: boolean;
  data: Internship;
}

export interface MyInternshipHistoryResponse {
  success: boolean;
  data: Internship[];
}

export interface InternshipParams {
  studentId?: string;
  batchId?: string;
  itStatus?: InternshipStatus | "";
  // session?: string;
  search?: string;
  program?: string;
  level?: string;
  isCurrent?: boolean;
  page?: number;
  limit?: number;
}

// ── Bulk Enroll ────────────────────────────────────────────────────────────────

export interface BulkEnrollPayload {
  batchId: string;
  studentIds?: string[];
  registrationNumbers?: string[];
  sourceBatchId?: string;
}

export interface BulkEnrollError {
  row?: string;
  studentId?: string;
  error: string;
}

export interface BulkEnrollResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    successful: number;
    skipped: number;
    failed: number;
    errors: BulkEnrollError[];
  };
}

// ── Status / Current ────────────────────────────────────────────────────────────

export interface UpdateInternshipStatusPayload {
  status: InternshipStatus;
}

/** Shared by every student-facing endpoint that can target a specific
 * internship instead of defaulting to the student's current one. */
export interface InternshipScopeParams {
  internshipId?: string;
  batchId?: string;
}

// ─── Internship fee payment ────────────────────────────────────────────────────

/**
 * Platform students pay one fee per internship. It gates placement submission
 * and, later, the internship certificate — so this status is checked before
 * either form is rendered rather than after the student has filled it in.
 */
export type InternshipPaymentStatus = "pending" | "successful" | "failed";

/**
 * The single field that decides which payment screen an internship needs.
 * `none` means there is nothing left to pay.
 */
export type InternshipPaymentNextAction =
  | "pay"
  | "verify"
  | "regenerate_rrr"
  | "none";

export interface InternshipPaymentStatusData {
  paymentStatus: InternshipPaymentStatus;
  /** Whether `POST /students/confirm-placement` will be accepted right now. */
  canSubmitPlacement: boolean;
  nextAction: InternshipPaymentNextAction;
  internshipId?: string;
  rrr?: string;
  orderId?: string;
  amount?: number;
  merchantId?: string;
  paidAt?: string;
}

export interface InternshipPaymentStatusResponse {
  success: boolean;
  message?: string;
  data: InternshipPaymentStatusData;
}

export interface InternshipPaymentInitiationResponse {
  success: boolean;
  message?: string;
  data: {
    internshipId?: string;
    orderId: string;
    rrr: string;
    amount: number;
    merchantId?: string;
  };
}

export interface InternshipPaymentVerificationResponse {
  success: boolean;
  message?: string;
  data?: InternshipPaymentStatusData;
}
