import { api } from "./api";
import type {
  BatchListResponse,
  BatchPayload,
  BatchParams,
  ActivateBatchParams,
  UpdateBatchPayload,
  AutoAssignSupervisorsPayload,
  DepartmentsResponse,
} from "../types/batch";

export const getBatches = async (
  params?: BatchParams,
): Promise<BatchListResponse> => {
  const response = await api.get("/batches", { params });
  return response.data;
};

export const getBatchById = async (id: string) => {
  const response = await api.get(`/batches/${id}`);
  return response.data;
};

export const getBatchStudents = async (id: string) => {
  const response = await api.get(`/batches/${id}/students`);
  return response.data;
};

export const getBatchStats = async (id: string) => {
  const response = await api.get(`/batches/${id}/stats`);
  return response.data;
};

export const createBatch = async (payload: BatchPayload) => {
  const response = await api.post("/batches", payload);
  return response.data;
};

export const updateBatch = async ({ id, data }: UpdateBatchPayload) => {
  const response = await api.put(`/batches/${id}`, data);
  return response.data;
};

export const deleteBatch = async (id: string) => {
  const response = await api.delete(`/batches/${id}`);
  return response.data;
};

export const activateBatch = async ({
  id,
  activateStudents = true,
}: ActivateBatchParams) => {
  const response = await api.patch(`/batches/${id}/activate`,{
    params: { activateStudents },
  });
  return response.data;
};

export const archieveBatch = async (id: string) => {
  const response = await api.patch(`/batches/${id}/archive`);
  return response.data;
};

export const autoAssignSupervisors = async (
  payload: AutoAssignSupervisorsPayload,
) => {
  const response = await api.post(`/admin/supervisors/auto-assign`, payload);
  return response.data;
};

export const getDepartments = async (): Promise<DepartmentsResponse> => {
  const response = await api.get(`/admin/all-departments`);
  return response.data;
};
