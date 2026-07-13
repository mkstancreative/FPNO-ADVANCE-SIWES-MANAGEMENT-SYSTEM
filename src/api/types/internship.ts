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
  company: string;
  position: string;
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
  session?: string;
  program?: string;
  level?: string;
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
