import { api } from "./api";
import type {
  StudentListResponse,
  StudentDetailResponse,
  StudentParams,
  StudentReportParams,
  UploadStudentsPayload,
  UpdateStudentStatusPayload,
  UpdateStatusApiResult,
} from "../types/student";

export const getStudents = async (
  params?: StudentParams,
): Promise<StudentListResponse> => {
  const response = await api.get("/admin/students", { params });
  return response.data;
};

export const getStudentById = async (
  id: string,
): Promise<StudentDetailResponse> => {
  const response = await api.get(`/admin/students/${id}`);
  return response.data;
};

export const getStudentProgress = async (id: string) => {
  const response = await api.get(`/admin/students/${id}/progress`);
  return response.data;
};

export const uploadStudents = async ({
  batchId,
  file,
}: UploadStudentsPayload) => {
  const formData = new FormData();
  formData.append("batchId", batchId);
  formData.append("file", file);
  const response = await api.post("/admin/upload-students", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const downloadStudentTemplate = async () => {
  const response = await api.get("/admin/students/download-template", {
    responseType: "blob",
  });
  return response.data;
};

export const updateStudentStatus = async (
  payload: UpdateStudentStatusPayload,
): Promise<UpdateStatusApiResult> => {
  const response = await api.put("/admin/students/status", payload);
  return response.data;
};

export const getStudentReport = async (
  id: string,
  params?: StudentReportParams,
) => {
  const response = await api.get(`/reports/student/${id}`, { params });
  return response.data;
};

export const getAiScoreBreakDown = async (
  id: string,
  params?: StudentReportParams,
) => {
  const response = await api.get(`/reports/${id}/ai-score-breakdown`, {
    params,
  });
  return response.data;
};

export const getUnassignedStudents = async (
  params?: StudentParams,
): Promise<StudentListResponse> => {
  const response = await api.get("/admin/students/unassigned", { params });
  return response.data;
};

export const uploadDiscountedStudents = async (
  payload: { file: File } | FormData,
) => {
  const formData =
    payload instanceof FormData ? payload : new FormData();
  if (!(payload instanceof FormData)) {
    formData.append("file", payload.file);
  }
  const response = await api.post(
    "/admin/certificate-discounts/upload",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return response.data;
};

export const getDiscountedStudents = async (
  params?: StudentParams,
): Promise<StudentListResponse> => {
  const response = await api.get("/admin/certificate-discounts", { params });
  return response.data;
};
