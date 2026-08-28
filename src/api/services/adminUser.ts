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
 * Reset a user's password as Admin.
 * PUT /admin/users/:userId/password
 * Body: { newPassword }
 */
export const resetUserPasswordByAdmin = async (
  userId: string,
  newPassword: string,
): Promise<AdminResetPasswordResponse> => {
  const payload: AdminResetPasswordPayload = { newPassword };
  const response = await api.put<AdminResetPasswordResponse>(
    `/admin/users/${userId}/password`,
    payload,
  );
  return response.data;
};
