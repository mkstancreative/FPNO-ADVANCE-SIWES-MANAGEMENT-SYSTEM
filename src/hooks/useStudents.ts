import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getStudents,
  getStudentById,
  getStudentProgress,
  uploadStudents,
  updateStudentStatus,
  updateStudentRecord,
  downloadStudentTemplate,
  getStudentReport,
  getAiScoreBreakDown,
  getUnassignedStudents,
  getDiscountedStudents,
  uploadDiscountedStudents,
} from "../api/services/manageStudent";
import type {
  StudentParams,
  StudentReportParams,
  UploadStudentsPayload,
  UpdateStudentStatusPayload,
  StudentProgressResponse,
  UpdateStudentRecordPayload,
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

export const useUpdateStudentRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateStudentRecordPayload;
    }) => updateStudentRecord(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({
        queryKey: ["students", variables.id],
      });
      toast.success("Student record updated.");
    },
    onError: (err: unknown) => {
      // A 409 is a field-level collision (email / registration number). The
      // form surfaces that inline, so don't also shout it as a toast.
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      if (status === 409) return;
      toast.error(getErrMsg(err, "Failed to update student record."));
    },
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

export const useDiscountedStudents = (params?: StudentParams) => {
  return useQuery({
    queryKey: ["discounted-students", params],
    queryFn: () => getDiscountedStudents(params),
  });
};

export const useUploadDiscountedStudents = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { file: File } | FormData) =>
      uploadDiscountedStudents(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discounted-students"] });
    },
    onError: (err: unknown) => {
      toast.error(getErrMsg(err, "Discount upload failed."));
    },
  });
};
