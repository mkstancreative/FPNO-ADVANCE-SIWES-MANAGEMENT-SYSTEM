// ─── Staff (Coordinator) Accounts ─────────────────────────────────────────────
// Staff are SIWES coordinators: plain user accounts with a coordinator role and
// no student/supervisor profile behind them. They are created in bulk from just
// a name and an institutional email — the backend issues the first password
// itself and flags the account `mustChangePassword` until the holder sets
// their own.

export interface StaffUser {
  _id: string;
  email: string;
  firstName?: string;
  /** Optional everywhere. Absent, `null` and `""` all mean "no middle name". */
  middleName?: string;
  lastName?: string;
  /** Composed by the API — already includes the middle name. */
  name?: string;
  phone?: string;
  /** "coordinator" for everything this screen creates; admins can appear too. */
  role?: string;
  isActive?: boolean;
  /** True until the holder replaces the password the backend issued. */
  mustChangePassword?: boolean;
  lastLogin?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface StaffListResponse {
  success: boolean;
  total: number;
  page: number;
  pages: number;
  data: StaffUser[];
}

export interface StaffDetailResponse {
  success: boolean;
  data: StaffUser;
}

// ─── Query Params ─────────────────────────────────────────────────────────────

/**
 * `isActive` and `mustChangePassword` are tri-state in the UI (any / yes / no),
 * so they travel as booleans and are simply omitted when the filter is "any" —
 * sending `false` would mean something quite different from not filtering.
 */
export interface StaffParams {
  search?: string;
  isActive?: boolean;
  mustChangePassword?: boolean;
  page?: number;
  limit?: number;
}

// ─── Update Payload ───────────────────────────────────────────────────────────

/**
 * Admin correction of a staff record. **Partial** — send only the fields that
 * actually changed; anything omitted is left alone. Mirrors the student record
 * update, which is the established shape for this kind of edit here.
 */
export interface UpdateStaffPayload {
  firstName?: string;
  /** Send `""` to clear an existing middle name. */
  middleName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  /** Deactivating blocks sign-in without deleting the account or its history. */
  isActive?: boolean;
}

/** One field the backend actually changed, as it reports it back. */
export interface StaffRecordChange {
  field: string;
  from: unknown;
  to: unknown;
}

export interface UpdateStaffResponse {
  success: boolean;
  message?: string;
  data?: StaffUser & {
    changes?: StaffRecordChange[];
  };
}

// ─── Create Payload ───────────────────────────────────────────────────────────

export interface NewStaffUser {
  firstName: string;
  /** Optional — omitting the key and sending `""` behave identically. */
  middleName?: string;
  lastName: string;
  email: string;
}

/** The endpoint is bulk-only: even one coordinator goes in as a single-item array. */
export interface CreateStaffPayload {
  users: NewStaffUser[];
}

export interface CreateStaffError {
  email?: string;
  row?: string | number;
  error: string;
}

export interface CreatedStaffAccount {
  userId?: string;
  _id?: string;
  id?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  /** Composed by the API — already includes the middle name. */
  name?: string;
  email: string;
  /**
   * The first password, if the backend hands it back. The exact spelling is
   * unconfirmed, so `readStaffPassword` checks the likely ones rather than
   * betting on a single key — an admin who cannot read it has just created an
   * account nobody can sign into.
   */
  temporaryPassword?: string;
  tempPassword?: string;
  password?: string;
}

export interface CreateStaffResponse {
  success: boolean;
  message?: string;
  data?:
    | {
        total?: number;
        successful?: number;
        failed?: number;
        created?: CreatedStaffAccount[];
        users?: CreatedStaffAccount[];
        errors?: CreateStaffError[];
      }
    | CreatedStaffAccount[];
}

/** Pull the issued password out of whichever field carries it. */
export const readStaffPassword = (
  account?: CreatedStaffAccount | null,
): string | undefined =>
  account?.temporaryPassword ?? account?.tempPassword ?? account?.password;

/**
 * Normalise the create response. The endpoint is bulk, so it may report a
 * summary object or just the array of accounts it made; both are flattened to
 * the same shape here so the UI never has to care which one arrived.
 */
export const readCreateStaffResult = (
  res?: CreateStaffResponse | null,
): {
  created: CreatedStaffAccount[];
  errors: CreateStaffError[];
  total: number;
  successful: number;
  failed: number;
} => {
  const payload = res?.data;
  const created = Array.isArray(payload)
    ? payload
    : (payload?.created ?? payload?.users ?? []);
  const errors = Array.isArray(payload) ? [] : (payload?.errors ?? []);
  const successful = Array.isArray(payload)
    ? payload.length
    : (payload?.successful ?? created.length);
  const failed = Array.isArray(payload)
    ? 0
    : (payload?.failed ?? errors.length);
  const total = Array.isArray(payload)
    ? payload.length
    : (payload?.total ?? successful + failed);
  return { created, errors, total, successful, failed };
};
