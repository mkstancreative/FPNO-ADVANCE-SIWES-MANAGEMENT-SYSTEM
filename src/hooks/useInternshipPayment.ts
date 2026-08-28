import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getInternshipPaymentStatus,
  initiateInternshipPayment,
  verifyInternshipPayment,
  regenerateInternshipRRR,
} from "../api/services/internship";
import { getApiErrorMessage } from "../api/services/api";
import type { InternshipScopeParams } from "../api/types/internship";

export const INTERNSHIP_PAYMENT_KEY = "internship-payment-status";

/** Invalidate everything the internship fee gates once it is settled. */
const gatedQueries = [
  [INTERNSHIP_PAYMENT_KEY],
  ["placement-status"],
  ["certificate-status"],
  ["my-internship-history"],
];

/**
 * Drives the internship payment screen. `canSubmitPlacement` is the flag the
 * placement page checks *before* rendering its form — cheaper for the student
 * than filling the whole thing in and collecting a 402 on submit.
 */
export const useInternshipPaymentStatus = (
  params?: InternshipScopeParams,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: [INTERNSHIP_PAYMENT_KEY, params ?? {}],
    queryFn: () => getInternshipPaymentStatus(params),
    enabled: options?.enabled ?? true,
  });
};

export const useInitiateInternshipPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload?: InternshipScopeParams) =>
      initiateInternshipPayment(payload),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: [INTERNSHIP_PAYMENT_KEY] });
      } else {
        toast.error(data.message || "Could not start the internship payment");
      }
    },
    onError: (error: unknown) => {
      toast.error(
        getApiErrorMessage(error, "Error starting the internship payment"),
      );
    },
  });
};

export const useVerifyInternshipPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rrr: string) => verifyInternshipPayment(rrr),
    onSuccess: (data) => {
      if (data.success) {
        gatedQueries.forEach((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        );
      }
    },
  });
};

export const useRegenerateInternshipRRR = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (lastRRR: string) => regenerateInternshipRRR(lastRRR),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: [INTERNSHIP_PAYMENT_KEY] });
      }
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Error regenerating RRR"));
    },
  });
};
