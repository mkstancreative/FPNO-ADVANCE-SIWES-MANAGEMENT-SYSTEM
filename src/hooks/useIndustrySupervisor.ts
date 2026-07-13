import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  reviewStudentLogbookByToken,
  approveStudentLogbookByToken,
  rejectStudentLogbookByToken,
  requestRevisionStudentLogbookByToken,
  getStudentEvaluationDataByToken,
  submitStudentEvaluationByToken,
} from "../api/services/industrySupervisor";
import { logBookFraudChecker } from "../api/services/logbook";
import type {
  ISApprovePayload,
  ISEvaluationPayload,
} from "../api/types/industrySupervisor";
import type { FraudCheckResponse } from "../api/types/logbook";

function errMsg(err: unknown, fallback: string) {
  const e = err as { response?: { data?: { message?: string } } };
  return e?.response?.data?.message ?? fallback;
}

/** Validate token and get logbook review data (auto-fetches on mount) */
export const useReviewLogbookByToken = (token: string) =>
  useQuery({
    queryKey: ["logbook-review", token],
    queryFn: () => reviewStudentLogbookByToken(token),
    enabled: !!token,
    retry: false, // don't retry on 400/401/403 (already-used, expired)
    staleTime: Infinity, // review data won't change mid-session
  });

/** Approve logbook */
export const useApproveLogbook = (token: string) =>
  useMutation({
    mutationFn: (payload: ISApprovePayload) =>
      approveStudentLogbookByToken(token, payload),
    onError: (err) => toast.error(errMsg(err, "Approval failed")),
  });

/** Reject logbook */
export const useRejectLogbook = (token: string) =>
  useMutation({
    mutationFn: (payload: ISApprovePayload) =>
      rejectStudentLogbookByToken(token, payload),
    onError: (err) => toast.error(errMsg(err, "Rejection failed")),
  });

/** Request Revision logbook */
export const useRequestRevisionLogbook = (token: string) =>
  useMutation({
    mutationFn: (payload: ISApprovePayload) =>
      requestRevisionStudentLogbookByToken(token, payload),
    onError: (err) => toast.error(errMsg(err, "Revision request failed")),
  });

/** Get evaluation form data */
export const useEvaluationData = (token: string) =>
  useQuery({
    queryKey: ["evaluation", token],
    queryFn: () => getStudentEvaluationDataByToken(token),
    enabled: !!token,
    retry: false,
  });

/** Submit final evaluation */
export const useSubmitEvaluation = (token: string) =>
  useMutation({
    mutationFn: (payload: ISEvaluationPayload) =>
      submitStudentEvaluationByToken(token, payload),
    onError: (err) => toast.error(errMsg(err, "Submission failed")),
  });
/** AI Fraud Check */
export const useLogbookFraudCheck = () =>
  useMutation<FraudCheckResponse, Error, string>({
    mutationFn: (logbookId: string) => logBookFraudChecker(logbookId),
    onError: (err) => toast.error(errMsg(err, "Fraud check failed")),
  });
