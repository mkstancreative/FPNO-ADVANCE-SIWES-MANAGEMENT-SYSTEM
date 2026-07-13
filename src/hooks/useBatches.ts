import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getBatches,
  getBatchById,
  getBatchStats,
  getBatchStudents,
  createBatch,
  updateBatch,
  deleteBatch,
  activateBatch,
  archieveBatch,
  autoAssignSupervisors,
  getDepartments,
} from "../api/services/batch";
import type { BatchParams } from "../api/types/batch";

function getErrMsg(err: unknown, fallback: string) {
  const e = err as { response?: { data?: { message?: string } } };
  return e?.response?.data?.message ?? fallback;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export const useBatches = (params?: BatchParams) => {
  return useQuery({
    queryKey: ["batches", params],
    queryFn: () => getBatches(params),
  });
};

export const useBatchById = (id: string) => {
  return useQuery({
    queryKey: ["batches", id],
    queryFn: () => getBatchById(id),
    enabled: !!id,
  });
};

export const useBatchStudents = (id: string) => {
  return useQuery({
    queryKey: ["batches", id, "students"],
    queryFn: () => getBatchStudents(id),
    enabled: !!id,
  });
};

export const useBatchStats = (id: string) => {
  return useQuery({
    queryKey: ["batches", id, "stats"],
    queryFn: () => getBatchStats(id),
    enabled: !!id,
  });
};

// ─── Mutations ────────────────────────────────────────────────────────────────

export const useCreateBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      toast.success("Batch created successfully!");
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to create batch.")),
  });
};

export const useUpdateBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateBatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      toast.success("Batch updated successfully!");
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to update batch.")),
  });
};

export const useDeleteBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      toast.success("Batch deleted.");
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to delete batch.")),
  });
};

export const useActivateBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: activateBatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      toast.success("Batch activated successfully!");
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to activate batch.")),
  });
};

export const useArchieveBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: archieveBatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      toast.success("Batch archived.");
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to archive batch.")),
  });
};

export const useAutoAssignSupervisors = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: autoAssignSupervisors,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to assign supervisors.")),
  });
};

export const useDepartments = () => {
  return useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
  });
};
