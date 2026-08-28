import { api, publicApi } from "./api";
import type {
  InternshipListResponse,
  InternshipDetailResponse,
  InternshipParams,
  MyInternshipHistoryResponse,
  BulkEnrollPayload,
  BulkEnrollResponse,
  UpdateInternshipStatusPayload,
  InternshipPaymentStatusResponse,
  InternshipPaymentInitiationResponse,
  InternshipPaymentVerificationResponse,
  InternshipScopeParams,
} from "../types/internship";

// ── Student self-service ───────────────────────────────────────────────────────

export const getMyInternshipHistory =
  async (): Promise<MyInternshipHistoryResponse> => {
    const response = await api.get("/internships/my-history");
    return response.data;
  };

export const getMyInternshipDetail = async (
  id: string,
): Promise<InternshipDetailResponse> => {
  const response = await api.get(`/internships/my-history/${id}`);
  return response.data;
};

// ── Admin / Coordinator ────────────────────────────────────────────────────────

export const bulkEnrollStudents = async (
  payload: BulkEnrollPayload,
): Promise<BulkEnrollResponse> => {
  const response = await api.post("/internships/enroll", payload);
  return response.data;
};

export const getInternships = async (
  params?: InternshipParams,
): Promise<InternshipListResponse> => {
  const response = await api.get("/internships", { params });
  return response.data;
};

export const getInternshipById = async (
  id: string,
): Promise<InternshipDetailResponse> => {
  const response = await api.get(`/internships/${id}`);
  return response.data;
};

export const updateInternshipStatus = async (
  id: string,
  payload: UpdateInternshipStatusPayload,
): Promise<InternshipDetailResponse> => {
  const response = await api.put(`/internships/${id}/status`, payload);
  return response.data;
};

export const setCurrentInternship = async (
  id: string,
): Promise<InternshipDetailResponse> => {
  const response = await api.put(`/internships/${id}/set-current`);
  return response.data;
};

// ── Internship fee payment ─────────────────────────────────────────────────────

/**
 * Drives the internship payment screen. `canSubmitPlacement` says whether the
 * placement form may be rendered at all; `nextAction` says which screen to show
 * when it may not.
 */
export const getInternshipPaymentStatus = async (
  params?: InternshipScopeParams,
): Promise<InternshipPaymentStatusResponse> => {
  const response = await api.get("/internships/payment-status", { params });
  return response.data;
};

/** Raises the order for one internship's fee and returns its RRR. */
export const initiateInternshipPayment = async (
  payload?: InternshipScopeParams,
): Promise<InternshipPaymentInitiationResponse> => {
  const response = await api.post("/internships/initiate-payment", payload ?? {});
  return response.data;
};

/**
 * Remita redirects here after checkout. Public by design — no `Authorization`
 * header.
 */
export const verifyInternshipPayment = async (
  rrr: string,
): Promise<InternshipPaymentVerificationResponse> => {
  const response = await publicApi.post(
    `/internships/verify-payment?rrr=${encodeURIComponent(rrr)}`,
  );
  return response.data;
};

/** Issues a fresh RRR when the previous one has expired on Remita's side. */
export const regenerateInternshipRRR = async (
  lastRRR: string,
): Promise<InternshipPaymentInitiationResponse> => {
  const response = await api.patch(
    `/internships/regenerate-rrr/${encodeURIComponent(lastRRR)}`,
  );
  return response.data;
};
