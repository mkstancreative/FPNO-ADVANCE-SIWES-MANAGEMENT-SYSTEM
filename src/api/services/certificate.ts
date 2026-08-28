import { api, publicApi } from "./api";
import type {
  AdminCertificateParams,
  CertificateStatusResponse,
  RRRData,
} from "../types/certificate";

// ─── Payment ──────────────────────────────────────────────────────────────────

export interface CertificatePaymentInitiationResponse {
  success: boolean;
  message?: string;
  data: RRRData;
}

/**
 * Step 1 for external (self-registered) students: raise the order and get an
 * RRR. Takes no body — the backend derives the fee from the student. Only once
 * this payment completes will `requestCertificate` accept the documents.
 */
export const initiateCertificatePayment =
  async (): Promise<CertificatePaymentInitiationResponse> => {
    const response = await api.post("/certificates/initiate-payment");
    return response.data;
  };

/**
 * Remita redirects here after checkout. Public by design — no `Authorization`
 * header, so it works even if the student's session lapsed during the detour.
 */
export const verifyCertificatePayment = async (params: {
  orderId: string;
  rrr?: string;
}) => {
  const value = params.rrr || params.orderId;
  const key = params.rrr ? "rrr" : "orderId";

  const response = await publicApi.post(
    `/certificates/verify-payment?${key}=${encodeURIComponent(value)}`,
  );
  return response.data;
};

export const regenerateRRR = async (rrr: string) => {
  const response = await api.patch(`/certificates/regenerate-rrr/${rrr}`);
  return response.data;
};

// ─── Requests ─────────────────────────────────────────────────────────────────

export interface CertificateRequest {
  graduationYear?: string;
  graduationMonth?: string;
  graduationDate?: string;
  ndStatementOfResult?: File;
  itDischargeLetter?: File;
  hndStatementOfResult?: File;
  placeOfIT?: string;
  internshipId?: string;
  batchId?: string;
}

/**
 * Step 2 for external students. The body is unchanged, but the request now
 * requires a completed payment and returns no RRR — see
 * `useRequestCertificate` for how the 404/400 failures are recovered from.
 */
export const requestCertificate = async (
  payload: FormData | CertificateRequest,
) => {
  const response = await api.post("/certificates/request", payload, {
    headers:
      payload instanceof FormData
        ? { "Content-Type": "multipart/form-data" }
        : {},
  });
  return response.data;
};

export interface InternshipCertificateRequest {
  internshipId?: string;
  batchId?: string;
}

/**
 * Platform students. No RRR, no amount, no Remita redirect — the internship fee
 * already covered this. Fails with 402 when that fee was never paid.
 */
export const requestInternshipCertificate = async (
  payload: InternshipCertificateRequest,
) => {
  const response = await api.post(
    "/certificates/request-internship-certificate",
    payload,
  );
  return response.data;
};

export const resendRequest = async (id: string, payload: FormData) => {
  const response = await api.put(`/certificates/re-request/${id}`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const getCertificateStatus =
  async (): Promise<CertificateStatusResponse> => {
    const response = await api.get("/certificates/status");
    return response.data;
  };

export const getMyCertificate = async () => {
  const response = await api.get("/certificates/my-certificate");
  return response.data;
};

// ─── Admin ────────────────────────────────────────────────────────────────────

export const getAllRequests = async (params: AdminCertificateParams) => {
  const response = await api.get("/certificates/admin/all", { params });
  return response.data;
};

export const getCertById = async (id: string) => {
  const response = await api.get(`/certificates/admin/cert/${id}`);
  return response.data;
};

export const approveCertBulk = async (payload: {
  certificateIds: string[];
}) => {
  const response = await api.post(`/certificates/admin/bulk-approve`, payload);
  return response.data;
};

export const rejectCertBulk = async (payload: {
  certificateIds: string[];
  reason?: string;
}) => {
  const response = await api.post(`/certificates/admin/bulk-reject`, payload);
  return response.data;
};

export const financialStats = async () => {
  const response = await api.get(`/certificates/stats`);
  return response.data;
};

/** Public verification — scanned from the QR code on an issued certificate. */
export const certificateQRCode = async (id: string) => {
  const response = await publicApi.get(
    `/certificates/verify?certificateNumber=${encodeURIComponent(id)}`,
  );
  return response.data;
};
