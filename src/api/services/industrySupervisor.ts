import { api } from "./api";
import type {
  ISTokenReviewResponse,
  ISApprovePayload,
  ISApproveResponse,
  ISEvaluationResponse,
  ISEvaluationPayload,
  ISEvaluationSubmitResponse,
} from "../types/industrySupervisor";

/** Validate token & fetch logbook + student data */
export const reviewStudentLogbookByToken = async (
  token: string,
): Promise<ISTokenReviewResponse> => {
  const response = await api.get<ISTokenReviewResponse>(
    `/supervisors/review/${token}`,
  );
  return response.data;
};

/** Approve a logbook entry */
export const approveStudentLogbookByToken = async (
  token: string,
  payload: ISApprovePayload,
): Promise<ISApproveResponse> => {
  const response = await api.post<ISApproveResponse>(
    `/supervisors/review/${token}/approve`,
    payload,
  );
  return response.data;
};

/** Reject a logbook entry */
export const rejectStudentLogbookByToken = async (
  token: string,
  payload: ISApprovePayload,
): Promise<ISApproveResponse> => {
  const response = await api.post<ISApproveResponse>(
    `/supervisors/review/${token}/reject`,
    payload,
  );
  return response.data;
};

/** Request a revision for logbook */
export const requestRevisionStudentLogbookByToken = async (
  token: string,
  payload: ISApprovePayload,
): Promise<ISApproveResponse> => {
  const response = await api.post<ISApproveResponse>(
    `/supervisors/review/${token}/needs-revision`,
    payload,
  );
  return response.data;
};

/** Fetch evaluation form data (student info, check if already submitted) */
export const getStudentEvaluationDataByToken = async (
  token: string,
): Promise<ISEvaluationResponse> => {
  const response = await api.get<ISEvaluationResponse>(
    `/evaluations/industrial/${token}`,
  );
  return response.data;
};

/** Submit the final industry supervisor evaluation */
export const submitStudentEvaluationByToken = async (
  token: string,
  payload: ISEvaluationPayload,
): Promise<ISEvaluationSubmitResponse> => {
  const response = await api.post<ISEvaluationSubmitResponse>(
    `/evaluations/industrial/${token}`,
    payload,
  );
  return response.data;
};
