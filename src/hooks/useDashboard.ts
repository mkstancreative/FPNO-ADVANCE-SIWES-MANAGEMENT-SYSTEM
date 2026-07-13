import { useQuery } from "@tanstack/react-query";
import { dashboardStats as studentDashboardStats } from "../api/services/itstudent";
import { getAdminDashboardStats } from "../api/services/dashboard";
import { supervisorDashboardStats } from "../api/services/schoolSupervisors";
import type {
  StudentDashboardResponse,
  AdminDashboardResponse,
  SupervisorDashboardResponse,
} from "../api/types/dashboard";
import type { InternshipScopeParams } from "../api/types/internship";

export const useStudentDashboard = (params?: InternshipScopeParams) =>
  useQuery<StudentDashboardResponse>({
    queryKey: ["student-dashboard", params],
    queryFn: () => studentDashboardStats(params),
    staleTime: 2 * 60 * 1000,
  });

export const useAdminDashboard = () =>
  useQuery<AdminDashboardResponse>({
    queryKey: ["admin-dashboard"],
    queryFn: getAdminDashboardStats,
    staleTime: 2 * 60 * 1000,
  });

export const useSupervisorDashboard = () =>
  useQuery<SupervisorDashboardResponse>({
    queryKey: ["supervisor-dashboard"],
    queryFn: supervisorDashboardStats,
    staleTime: 2 * 60 * 1000,
  });
