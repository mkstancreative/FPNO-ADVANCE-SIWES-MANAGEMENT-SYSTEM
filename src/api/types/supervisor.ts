// ─── Supervisor Types ─────────────────────────────────────────────────────────
// School supervisors own whole departments (unique — no two supervisors share a
// department). Every student in an owned department is auto-assigned; there is
// no capacity/manual per-student assignment.

export interface SupervisorUser {
  _id: string;
  email: string;
  firstName: string;
  /** Optional everywhere. Absent, `null` and `""` all mean "no middle name". */
  middleName?: string;
  lastName: string;
  /** Composed by the API — already includes the middle name. */
  name?: string;
  phone: string;
}

export interface Supervisor {
  _id: string;
  id: string;
  user: SupervisorUser;
  staffId: string;
  departments: string[];
  specialization: string;
  currentStudentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SupervisorListResponse {
  success: boolean;
  total: number;
  page: number;
  pages: number;
  data: Supervisor[];
}

// ─── Query Params ─────────────────────────────────────────────────────────────

export interface SupervisorParams {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
}

// ─── Create Payload ───────────────────────────────────────────────────────────

export interface CreateSupervisorPayload {
  firstName: string;
  /** Optional everywhere. Absent, `null` and `""` all mean "no middle name". */
  middleName?: string;
  lastName: string;
  email: string;
  phone: string;
  staffId: string;
  departments: string[];
  specialization: string;
}

export interface CreateSupervisorResponse {
  success: boolean;
  message: string;
  data: {
    supervisorId: string;
    cascadeAssigned?: number;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    /** Composed by the API — already includes the middle name. */
    name?: string;
    email?: string;
    staffId?: string;
  };
}

// ─── Update Record Payload ────────────────────────────────────────────────────

/**
 * Admin correction of a supervisor's own details.
 * **Partial** — send only what changed.
 *
 * Departments are deliberately not here: they decide which students the
 * supervisor owns, so they keep their own endpoint.
 */
export interface UpdateSupervisorPayload {
  firstName?: string;
  /** Send `""` to clear an existing middle name. */
  middleName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  staffId?: string;
  specialization?: string;
}

/** One field the backend actually changed, as it reports it back. */
export interface SupervisorRecordChange {
  field: string;
  from: unknown;
  to: unknown;
}

export interface UpdateSupervisorResponse {
  success: boolean;
  message?: string;
  data?: {
    firstName?: string;
    middleName?: string;
    lastName?: string;
    name?: string;
    email?: string;
    phone?: string;
    staffId?: string;
    specialization?: string;
    changes?: SupervisorRecordChange[];
  };
}

// ─── Update Departments Payload ───────────────────────────────────────────────

export interface UpdateSupervisorDepartmentsPayload {
  departments: string[];
}

export interface UpdateSupervisorDepartmentsResponse {
  success: boolean;
  message: string;
  data: {
    addedDepartments: string[];
    removedDepartments: string[];
    assignedCount: number;
    unassignedCount: number;
  };
}

export interface BulkUploadError {
  row: string;
  error: string;
}

export interface BulkUploadResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    successful: number;
    failed: number;
    errors: BulkUploadError[];
  };
}
