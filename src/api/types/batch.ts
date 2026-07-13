// ─── Batch Types ──────────────────────────────────────────────────────────────

export type BatchStatus =
  | "created"
  | "students_uploaded"
  | "in_progress"
  | "completed"
  | "archived";
export type Program = "ND" | "HND";
export type Level = "ND1" | "ND2" | "HND1" | "HND2";

export interface ITPeriod {
  name: string;
  startDate: string;
  endDate: string;
  duration?: number;
}

export interface Batch {
  _id: string;
  name: string;
  session: string;
  program: Program;
  level: Level;
  status: BatchStatus;
  itPeriod: ITPeriod;
  __v?: number;
}

export interface BatchListResponse {
  success: boolean;
  total: number;
  page: number;
  pages: number;
  data: Batch[];
}

// ─── Request Payloads ─────────────────────────────────────────────────────────

export interface BatchPayload {
  name: string;
  session: string;
  program: Program;
  level: Level;
  itPeriod: {
    name: string;
    startDate: string; // "YYYY-MM-DD"
    endDate: string; // "YYYY-MM-DD"
  };
}

export interface BatchParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: BatchStatus | "";
  program?: Program | "";
  level?: Level | "";
  department?: string;
}

export interface ActivateBatchParams {
  id: string;
  activateStudents?: boolean;
}

export interface UpdateBatchPayload {
  id: string;
  data: Partial<BatchPayload>;
}

export interface AutoAssignSupervisorsPayload {
  batchId?: string;
  department?: string;
}

export type Department = string;

export interface DepartmentsResponse {
  data: string[];
}
export interface AutoAssignError {
  student: string;
  error: string;
}

export interface AutoAssignResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    assigned: number;
    skipped: number;
    failed: number;
    errors: AutoAssignError[];
  };
}
