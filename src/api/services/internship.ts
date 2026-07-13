import { api } from "./api";
import type {
  InternshipListResponse,
  InternshipDetailResponse,
  InternshipParams,
  MyInternshipHistoryResponse,
  BulkEnrollPayload,
  BulkEnrollResponse,
  UpdateInternshipStatusPayload,
} from "../types/internship";

// ── Student self-service ───────────────────────────────────────────────────────

export const getMyInternshipHistory =
  async (): Promise<MyInternshipHistoryResponse> => {
    const response = await api.get("/internships/my-history");
    return response.data;
  };

export const getMyInternshipDetail = async (
  id: string,
): Promise<InternshipDetailResponse> => {
  const response = await api.get(`/internships/my-history/${id}`);
  return response.data;
};

// ── Admin / Coordinator ────────────────────────────────────────────────────────

export const bulkEnrollStudents = async (
  payload: BulkEnrollPayload,
): Promise<BulkEnrollResponse> => {
  const response = await api.post("/internships/enroll", payload);
  return response.data;
};

export const getInternships = async (
  params?: InternshipParams,
): Promise<InternshipListResponse> => {
  const response = await api.get("/internships", { params });
  return response.data;
};

export const getInternshipById = async (
  id: string,
): Promise<InternshipDetailResponse> => {
  const response = await api.get(`/internships/${id}`);
  return response.data;
};

export const updateInternshipStatus = async (
  id: string,
  payload: UpdateInternshipStatusPayload,
): Promise<InternshipDetailResponse> => {
  const response = await api.put(`/internships/${id}/status`, payload);
  return response.data;
};

export const setCurrentInternship = async (
  id: string,
): Promise<InternshipDetailResponse> => {
  const response = await api.put(`/internships/${id}/set-current`);
  return response.data;
};
