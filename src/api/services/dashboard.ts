import { api } from "./api";
import type { AdminDashboardResponse } from "../types/dashboard";

export const getAdminDashboardStats = async (): Promise<AdminDashboardResponse> => {
  const response = await api.get<AdminDashboardResponse>("/admin/dashboard");
  return response.data;
};
