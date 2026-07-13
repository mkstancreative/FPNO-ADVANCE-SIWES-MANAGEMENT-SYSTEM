import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getMyInternshipHistory,
  getMyInternshipDetail,
  bulkEnrollStudents,
  getInternships,
  getInternshipById,
  updateInternshipStatus,
  setCurrentInternship,
} from "../api/services/internship";
import { getApiErrorMessage } from "../api/services/api";
import type {
  InternshipParams,
  UpdateInternshipStatusPayload,
  BulkEnrollPayload,
} from "../api/types/internship";

export const internshipKeys = {
  all: ["internships"] as const,
  myHistory: () => [...internshipKeys.all, "my-history"] as const,
  myDetail: (id: string) => [...internshipKeys.all, "my-history", id] as const,
  list: (params?: InternshipParams) =>
    [...internshipKeys.all, "list", params] as const,
  detail: (id: string) => [...internshipKeys.all, "detail", id] as const,
};

// ── Student self-service ───────────────────────────────────────────────────────

export const useMyInternshipHistory = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: internshipKeys.myHistory(),
    queryFn: getMyInternshipHistory,
    enabled: options?.enabled ?? true,
  });

export const useMyInternshipDetail = (id: string) =>
  useQuery({
    queryKey: internshipKeys.myDetail(id),
    queryFn: () => getMyInternshipDetail(id),
    enabled: !!id,
  });

// ── Admin / Coordinator ────────────────────────────────────────────────────────

export const useInternships = (params?: InternshipParams) =>
  useQuery({
    queryKey: internshipKeys.list(params),
    queryFn: () => getInternships(params),
  });

export const useInternshipById = (id: string) =>
  useQuery({
    queryKey: internshipKeys.detail(id),
    queryFn: () => getInternshipById(id),
    enabled: !!id,
  });

export const useUpdateInternshipStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateInternshipStatusPayload;
    }) => updateInternshipStatus(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: internshipKeys.all });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Internship status updated.");
    },
    onError: (err: unknown) =>
      toast.error(getApiErrorMessage(err, "Failed to update status.")),
  });
};

export const useSetCurrentInternship = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => setCurrentInternship(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: internshipKeys.all });
      toast.success("Current internship updated.");
    },
    onError: (err: unknown) =>
      toast.error(
        getApiErrorMessage(err, "Failed to set current internship."),
      ),
  });
};

export const useBulkEnrollStudents = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BulkEnrollPayload) => bulkEnrollStudents(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: internshipKeys.all });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["batches"] });
    },
    onError: (err: unknown) =>
      toast.error(getApiErrorMessage(err, "Failed to enroll students.")),
  });
};
