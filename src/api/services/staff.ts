import { api } from "./api";
import type {
  CreateStaffPayload,
  CreateStaffResponse,
  StaffDetailResponse,
  StaffListResponse,
  StaffParams,
  UpdateStaffPayload,
  UpdateStaffResponse,
} from "../types/staff";

/**
 * List staff (coordinator) accounts.
 * GET /admin/users/staff?search=&isActive=&mustChangePassword=&page=&limit=
 */
export const getStaff = async (
  params?: StaffParams,
): Promise<StaffListResponse> => {
  const response = await api.get<StaffListResponse>("/admin/users/staff", {
    params,
  });
  return response.data;
};

/**
 * One staff account by user id.
 * GET /admin/users/staff/:userId
 */
export const getStaffById = async (
  userId: string,
): Promise<StaffDetailResponse> => {
  const response = await api.get<StaffDetailResponse>(
    `/admin/users/staff/${userId}`,
  );
  return response.data;
};

/**
 * Create coordinator accounts.
 * POST /admin/users/staff — Body: { users: [{ firstName, lastName, email }] }
 *
 * Bulk by design: a single coordinator is sent as a one-item array. Responds
 * 409 when an email already belongs to an account.
 */
export const createStaff = async (
  payload: CreateStaffPayload,
): Promise<CreateStaffResponse> => {
  const response = await api.post<CreateStaffResponse>(
    "/admin/users/staff",
    payload,
  );
  return response.data;
};

/**
 * Admin correction of a staff record.
 * PUT /admin/users/staff/:userId
 *
 * Partial — pass only the fields that changed. Responds 409 when an email
 * collides with another account.
 */
export const updateStaff = async (
  userId: string,
  payload: UpdateStaffPayload,
): Promise<UpdateStaffResponse> => {
  const response = await api.put<UpdateStaffResponse>(
    `/admin/users/staff/${userId}`,
    payload,
  );
  return response.data;
};
