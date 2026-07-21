import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getStudents,
  getStudentById,
  getStudentProgress,
  uploadStudents,
  updateStudentStatus,
  downloadStudentTemplate,
  getStudentReport,
  getAiScoreBreakDown,
  getUnassignedStudents,
} from "../api/services/manageStudent";
import type {
  StudentParams,
  StudentReportParams,
  UploadStudentsPayload,
  UpdateStudentStatusPayload,
  StudentProgressResponse,
} from "../api/types/student";

export const useUnassignedStudents = (params?: StudentParams) => {
  return useQuery({
    queryKey: ["students", "unassigned", params],
    queryFn: () => getUnassignedStudents(params),
  });
};

function getErrMsg(err: unknown, fallback: string) {
  const e = err as { response?: { data?: { message?: string } } };
  return e?.response?.data?.message ?? fallback;
}

export const useStudents = (params?: StudentParams) => {
  return useQuery({
    queryKey: ["students", params],
    queryFn: () => getStudents(params),
  });
};

export const useStudentById = (id: string) => {
  return useQuery({
    queryKey: ["students", id],
    queryFn: () => getStudentById(id),
    enabled: !!id,
    select: (data) => data.data,
  });
};

export const useStudentProgress = (id: string) => {
  return useQuery({
    queryKey: ["students", id, "progress"],
    queryFn: (): Promise<StudentProgressResponse> => getStudentProgress(id),
    enabled: !!id,
    select: (data) => data.data,
  });
};

export const useUploadStudents = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UploadStudentsPayload) => uploadStudents(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (err: unknown) =>
      toast.error(
        getErrMsg(err, "Upload failed. Please check the file format."),
      ),
  });
};

export const useUpdateStudentStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateStudentStatusPayload) =>
      updateStudentStatus(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to update student status.")),
  });
};

export const useDownloadStudentTemplate = () => {
  return useMutation({
    mutationFn: downloadStudentTemplate,
    onSuccess: (blob: Blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "student_upload_template.xlsx";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Template downloaded!");
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Could not download template.")),
  });
};

export const useStudentReport = (id: string, params?: StudentReportParams) => {
  return useQuery({
    queryKey: ["student-report", id, params],
    queryFn: () => getStudentReport(id, params),
    enabled: !!id,
    retry: false,
  });
};

export const useAiScoreBreakdown = (
  id: string,
  params?: StudentReportParams,
) => {
  return useQuery({
    queryKey: ["student-ai-score", id, params],
    queryFn: () => getAiScoreBreakDown(id, params),
    enabled: !!id,
    retry: false,
  });
};
