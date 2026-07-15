import { api } from "./api";
import type {
  StudentDetailResponse,
  StudentsResponse,
  LogbookListResponse,
  LogbookDetailResponse,
  ReviewPayload,
  EvaluationListResponse,
  EvaluationRequestPayload,
  EvaluationRequestResponse,
  SchoolEvaluationPayload,
  SchoolEvaluationResponse,
} from "../types/schoolSupervisor";

export const supervisorDashboardStats = async () => {
  const response = await api.get("/supervisors/dashboard");
  return response.data;
};

export interface AssignedStudentsParams {
  page?: number;
  limit?: number;
  search?: string;
  isCurrent?: boolean;
  status?: string;
  itStatus?: string;
  department?: string;
}

export const getAssignedStudents = async (
  params?: AssignedStudentsParams,
): Promise<StudentsResponse> => {
  const response = await api.get("/supervisors/school/students", { params });
  return response.data;
};

export const getStudentDetail = async (
  id: string,
): Promise<StudentDetailResponse> => {
  const response = await api.get(`/supervisors/school/students/${id}`);
  return response.data;
};

export interface BatchParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface BatchItem {
  _id: string;
  name: string;
}

export interface BatchListResponse {
  success: boolean;
  total: number;
  data: BatchItem[];
}

export const getMyBatches = async (
  params?: BatchParams,
): Promise<BatchListResponse> => {
  const response = await api.get(`/batches/supervisor`, { params });
  return response.data;
};

export interface LogbookListParams {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  batchId?: string;
  internshipId?: string;
}

export const getStudentLogbooks = async (
  studentId: string,
  params?: LogbookListParams,
): Promise<LogbookListResponse> => {
  const response = await api.get(
    `/supervisors/school/students/${studentId}/logbooks`,
    { params },
  );
  return response.data;
};

export const getLogbookDetail = async (
  studentId: string,
  logbookId: string,
): Promise<LogbookDetailResponse> => {
  const response = await api.get(
    `/supervisors/school/students/${studentId}/logbooks/${logbookId}`,
  );
  return response.data;
};

export const reviewLogbook = async (
  logbookId: string,
  payload: ReviewPayload,
): Promise<{ success: boolean; message?: string }> => {
  const response = await api.put(
    `/supervisors/school/logbooks/${logbookId}/review`,
    payload,
  );
  return response.data;
};

export interface EvaluationListParams {
  search?: string;
  page?: number;
  limit?: number;
  batchId?: string;
  status?: string;
  department?: string;
}

export const getPendingEvaluations = async (
  params?: EvaluationListParams,
): Promise<EvaluationListResponse> => {
  const response = await api.get("/evaluations/pending", { params });
  return response.data;
};

export const requestEvaluations = async (
  payload: EvaluationRequestPayload,
): Promise<EvaluationRequestResponse> => {
  const response = await api.post("/evaluations/request", payload);
  return response.data;
};

export const submitSchoolEvaluation = async (
  studentId: string,
  payload: SchoolEvaluationPayload,
): Promise<SchoolEvaluationResponse> => {
  const response = await api.post(`/evaluations/school/${studentId}`, payload);
  return response.data;
};

export const exportSchoolEvaluations = async () => {
  const response = await api.get("/evaluations/composite-results", { responseType: "blob" });
  return response.data;
};
