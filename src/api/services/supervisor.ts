import { api } from "./api";
import type {
  SupervisorListResponse,
  SupervisorParams,
  CreateSupervisorPayload,
  CreateSupervisorResponse,
  UpdateSupervisorDepartmentsPayload,
  UpdateSupervisorDepartmentsResponse,
} from "../types/supervisor";

export const getSupervisorTemplate = async (): Promise<Blob> => {
  const response = await api.get("/admin/supervisors/school/download-template", {
    responseType: "blob",
  });
  return response.data;
};

export const uploadSupervisorsExcel = async (file: File): Promise<unknown> => {
  const form = new FormData();
  form.append("file", file);
  const response = await api.post("/admin/supervisors/school/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const createSupervisor = async (
  payload: CreateSupervisorPayload,
): Promise<CreateSupervisorResponse> => {
  const response = await api.post("/admin/supervisors/school", payload);
  return response.data;
};

export const getSupervisors = async (
  params?: SupervisorParams,
): Promise<SupervisorListResponse> => {
  const response = await api.get("/admin/supervisors/school", { params });
  return response.data;
};

export const updateSupervisorDepartments = async (
  id: string,
  payload: UpdateSupervisorDepartmentsPayload,
): Promise<UpdateSupervisorDepartmentsResponse> => {
  const response = await api.put(
    `/admin/supervisors/school/${id}/departments`,
    payload,
  );
  return response.data;
};
