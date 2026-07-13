import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "../api/services/api";
import {
  updateStudentProfile,
  uploadPassport,
  getStudentWeeklyProgress,
  confirmPlacement,
  viewPlacementStatus,
  studentGenerateReport,
  previewReport,
  aiAnalyzeSkills,
  getStudentFinalReport,
  getStudentCompanies,
} from "../api/services/itstudent";
import type {
  UpdateStudentProfilePayload,
  UploadPassportPayload,
  ConfirmPlacementPayload,
} from "../api/types/itstudent";
import type { CompanyParams } from "../api/types/company";
import type { InternshipScopeParams } from "../api/types/internship";

export const useUpdateStudentProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateStudentProfilePayload) =>
      updateStudentProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-profile"] });
      toast.success("Profile updated successfully!");
    },
    onError: (error: unknown) => {
      toast.error(
        getApiErrorMessage(
          error,
          "Failed to update profile. Please try again.",
        ),
      );
    },
  });
};

export const useUploadPassport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UploadPassportPayload) => uploadPassport(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-profile"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success("Passport photo uploaded successfully!");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to upload passport."));
    },
  });
};

export const useStudentWeeklyProgress = (params?: InternshipScopeParams) => {
  return useQuery({
    queryKey: ["student-progress", params],
    queryFn: () => getStudentWeeklyProgress(params),
  });
};

export const useConfirmPlacement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ConfirmPlacementPayload) => confirmPlacement(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["placement-status"] });
      toast.success("Placement request submitted successfully!");
    },
    onError: (error: unknown) => {
      toast.error(
        getApiErrorMessage(
          error,
          "Failed to submit placement request. Please try again.",
        ),
      );
    },
  });
};

export const usePlacementStatus = (params?: InternshipScopeParams) => {
  return useQuery({
    queryKey: ["placement-status", params],
    queryFn: () => viewPlacementStatus(params),
  });
};

// ── Report hooks ──────────────────────────────────────────────────────────────

export const useGenerateReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params?: InternshipScopeParams) =>
      studentGenerateReport(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-final-report"] });
      toast.success("Report generated successfully!");
    },
    // No onError here — let the caller handle the structured API error inline
  });
};

export const usePreviewAiScore = (params?: InternshipScopeParams) => {
  return useQuery({
    queryKey: ["ai-preview-score", params],
    queryFn: () => previewReport(params),
  });
};

export const useAiAnalyzeSkills = (params?: InternshipScopeParams) => {
  return useQuery({
    queryKey: ["ai-analyze-skills", params],
    queryFn: () => aiAnalyzeSkills(params),
  });
};

export const useStudentFinalReport = (params?: InternshipScopeParams) => {
  return useQuery({
    queryKey: ["student-final-report", params],
    queryFn: () => getStudentFinalReport(params),
    retry: false,
  });
};

export const useStudentCompanies = (
  params?: CompanyParams,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: ["student-companies", params],
    queryFn: () => getStudentCompanies(params),
    enabled: options?.enabled ?? true,
  });
};
