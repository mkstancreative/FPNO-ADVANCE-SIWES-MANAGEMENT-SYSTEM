import { api } from "./api";
import type {
  AdminUserLookupResponse,
  AdminResetPasswordPayload,
  AdminResetPasswordResponse,
} from "../types/adminUser";

/**
 * Lookup users as Admin by query string (name, email, reg number, etc.).
 * GET /admin/users/lookup?q=
 */
export const lookupAdminUsers = async (
  q: string,
): Promise<AdminUserLookupResponse> => {
  const response = await api.get<AdminUserLookupResponse>(
    "/admin/users/lookup",
    {
      params: { q },
    },
  );
  return response.data;
};

/**
 * Reset a user's password as Admin or Coordinator.
 * PUT /admin/users/:userId/password
 * Body: { newPassword } — omit `newPassword` entirely to have the backend
 * generate a temporary one and force a change on next login.
 *
 * The backend also refuses some pairings (a coordinator resetting an admin, or
 * anyone resetting themselves); the lookup reports that per row as `canReset`.
 */
export const resetUserPasswordByAdmin = async (
  userId: string,
  newPassword?: string,
): Promise<AdminResetPasswordResponse> => {
  const payload: AdminResetPasswordPayload = newPassword ? { newPassword } : {};
  const response = await api.put<AdminResetPasswordResponse>(
    `/admin/users/${userId}/password`,
    payload,
  );
  return response.data;
};
