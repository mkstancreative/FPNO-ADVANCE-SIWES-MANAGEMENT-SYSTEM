import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getSupervisors,
  getSupervisorTemplate,
  uploadSupervisorsExcel,
  createSupervisor,
  updateSupervisorDepartments,
  updateSupervisor,
} from "../api/services/supervisor";
import { getApiErrorMessage, getApiErrorStatus } from "../api/services/api";
import type {
  SupervisorParams,
  CreateSupervisorPayload,
  UpdateSupervisorDepartmentsPayload,
  UpdateSupervisorPayload,
} from "../api/types/supervisor";

// ── Download template ─────────────────────────────────────────────────────────
export const useDownloadSupervisorTemplate = () => {
  return useMutation({
    mutationFn: getSupervisorTemplate,
    onSuccess: (blob: unknown) => {
      const url = URL.createObjectURL(blob as Blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "supervisor_upload_template.xlsx";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Template downloaded!");
    },
    onError: (err: unknown) =>
      toast.error(getApiErrorMessage(err, "Could not download template.")),
  });
};

// ── Upload Excel ──────────────────────────────────────────────────────────────
export const useUploadSupervisorExcel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadSupervisorsExcel(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supervisors"] });
    },
    onError: (err: unknown) =>
      toast.error(
        getApiErrorMessage(err, "Upload failed. Please check the file format."),
      ),
  });
};

// ── Create Supervisor ─────────────────────────────────────────────────────────
export const useCreateSupervisor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSupervisorPayload) => createSupervisor(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supervisors"] });
      toast.success("Supervisor created successfully!");
    },
    onError: (err: unknown) =>
      toast.error(getApiErrorMessage(err, "Failed to create supervisor.")),
  });
};

// ── Update Departments ─────────────────────────────────────────────────────────
export const useUpdateSupervisorDepartments = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateSupervisorDepartmentsPayload;
    }) => updateSupervisorDepartments(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supervisors"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Departments updated.");
    },
    onError: (err: unknown) =>
      toast.error(getApiErrorMessage(err, "Failed to update departments.")),
  });
};

// ── Get Supervisors ───────────────────────────────────────────────────────────
export const useSupervisors = (params?: SupervisorParams) => {
  return useQuery({
    queryKey: ["supervisors", params],
    queryFn: () => getSupervisors(params),
  });
};

// ── Update a supervisor's own record ──────────────────────────────────────────
export const useUpdateSupervisor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateSupervisorPayload;
    }) => updateSupervisor(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supervisors"] });
    },
    // A 409 is handled in the form, which keeps the admin in place to fix the
    // clashing email or staff ID.
    onError: (err: unknown) => {
      if (getApiErrorStatus(err) === 409) return;
      toast.error(getApiErrorMessage(err, "Failed to update supervisor."));
    },
  });
};
