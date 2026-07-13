// ─── Supervisor Types ─────────────────────────────────────────────────────────
// School supervisors own whole departments (unique — no two supervisors share a
// department). Every student in an owned department is auto-assigned; there is
// no capacity/manual per-student assignment.

export interface SupervisorUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
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
