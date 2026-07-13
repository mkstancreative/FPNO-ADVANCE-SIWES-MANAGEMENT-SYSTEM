import { api } from "./api";
import type {
  UpdateStudentProfilePayload,
  UploadPassportPayload,
  GetStudentWeeklyProgressResponse,
  ConfirmPlacementPayload,
  ViewPlacementStatusResponse,
  GetStudentReportResponse,
  PreviewAiScoreResponse,
  AiAnalyzeSkillsResponse,
} from "../types/itstudent";
import type { CompanyListResponse, CompanyParams } from "../types/company";
import type { InternshipScopeParams } from "../types/internship";

export const dashboardStats = async (params?: InternshipScopeParams) => {
  const response = await api.get("/students/dashboard", { params });
  return response.data;
};
export const updateStudentProfile = async (
  payload: UpdateStudentProfilePayload,
) => {
  const response = await api.put("/students/profile", payload);
  return response.data;
};

export const uploadPassport = async (payload: UploadPassportPayload) => {
  const form = new FormData();
  form.append("photo", payload.photo);
  const response = await api.post("/students/upload-passport", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const getStudentWeeklyProgress = async (
  params?: InternshipScopeParams,
) => {
  const response = await api.get<GetStudentWeeklyProgressResponse>(
    "/students/progress",
    { params },
  );
  return response.data;
};

export const confirmPlacement = async (payload: ConfirmPlacementPayload) => {
  const form = new FormData();
  form.append("acceptanceLetter", payload.acceptanceLetter);
  form.append("companyName", payload.companyName);
  form.append("companyAddress", payload.companyAddress);
  form.append("companyCity", payload.companyCity);
  if (payload.companyState) form.append("companyState", payload.companyState);
  if (payload.companyPhone) form.append("companyPhone", payload.companyPhone);
  if (payload.companyEmail) form.append("companyEmail", payload.companyEmail);
  if (payload.industry) form.append("industry", payload.industry);
  form.append("position", payload.position);
  if (payload.department) form.append("department", payload.department);
  form.append("startDate", payload.startDate);
  form.append("supervisorName", payload.supervisorName);
  if (payload.supervisorPhone)
    form.append("supervisorPhone", payload.supervisorPhone);
  if (payload.supervisorEmail)
    form.append("supervisorEmail", payload.supervisorEmail);
  if (payload.supervisorPosition)
    form.append("supervisorPosition", payload.supervisorPosition);

  const response = await api.post("/students/confirm-placement", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const viewPlacementStatus = async (params?: InternshipScopeParams) => {
  const response = await api.get<ViewPlacementStatusResponse>(
    "/students/placement-status",
    { params },
  );
  return response.data;
};

export const getStudentCompanies = async (
  params?: CompanyParams,
): Promise<CompanyListResponse> => {
  const response = await api.get<CompanyListResponse>("/students/companies", {
    params,
  });
  return response.data;
};

export const studentGenerateReport = async (
  params?: InternshipScopeParams,
) => {
  const response = await api.post<GetStudentReportResponse>(
    "/reports/generate",
    params ?? {},
  );
  return response.data;
};

export const previewReport = async (params?: InternshipScopeParams) => {
  const response = await api.get<PreviewAiScoreResponse>("/ai/preview-score", {
    params,
  });
  return response.data;
};
export const aiAnalyzeSkills = async (params?: InternshipScopeParams) => {
  const response = await api.get<AiAnalyzeSkillsResponse>(
    "/ai/analyze-skills",
    { params },
  );
  return response.data;
};

export const getStudentFinalReport = async (
  params?: InternshipScopeParams,
) => {
  const response = await api.get<GetStudentReportResponse>(
    "/reports/my-report",
    { params },
  );
  return response.data;
};
