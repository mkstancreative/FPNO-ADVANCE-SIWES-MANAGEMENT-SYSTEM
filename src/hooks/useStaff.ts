import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  createStaff,
  getStaff,
  getStaffById,
  updateStaff,
} from "../api/services/staff";
import {
  getApiErrorMessage,
  getApiErrorStatus,
} from "../api/services/api";
import type {
  CreateStaffPayload,
  StaffParams,
  UpdateStaffPayload,
} from "../api/types/staff";

// ── List staff ────────────────────────────────────────────────────────────────
export const useStaff = (params?: StaffParams) => {
  return useQuery({
    queryKey: ["staff", params],
    queryFn: () => getStaff(params),
  });
};

// ── One staff account ─────────────────────────────────────────────────────────
export const useStaffById = (userId?: string) => {
  return useQuery({
    queryKey: ["staff", "detail", userId],
    queryFn: () => getStaffById(userId as string),
    enabled: Boolean(userId),
  });
};

// ── Create coordinator accounts ───────────────────────────────────────────────
export const useCreateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStaffPayload) => createStaff(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
    // The form keeps the admin in place on failure so they can fix the row that
    // was rejected, so the toast is the only thing this needs to do.
    onError: (err: unknown) =>
      toast.error(getApiErrorMessage(err, "Failed to create staff accounts.")),
  });
};

// ── Update a staff record ─────────────────────────────────────────────────────
export const useUpdateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload: UpdateStaffPayload;
    }) => updateStaff(userId, payload),
    onSuccess: () => {
      // Both the list and the open detail record are now stale.
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
    // A 409 is handled in the form, which keeps the admin in place to fix the
    // email rather than throwing a toast at them and closing.
    onError: (err: unknown) => {
      if (getApiErrorStatus(err) === 409) return;
      toast.error(getApiErrorMessage(err, "Failed to update staff record."));
    },
  });
};
