import { api, publicApi } from "./api";
import type {
  AdminCertificateParams,
  AddCertificateDiscountPayload,
  AddCertificateDiscountResponse,
  CertificateDiscrepanciesResponse,
  CertificateFeeResponse,
  CertificateStatusResponse,
  CertificateVerifyPaymentResponse,
  CertificateVerifyResponse,
  MispricedInvoicesResponse,
  RepricePayload,
  RepriceReportResponse,
  ResolveDiscrepancyResponse,
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
}): Promise<CertificateVerifyPaymentResponse> => {
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

/**
 * What this student owes for their certificate and what to do next. Unlike
 * `/certificates/status` this answers before any request exists, so it is the
 * safe entry point for a student who has not started yet.
 */
export const getCertificateFee = async (): Promise<CertificateFeeResponse> => {
  const response = await api.get("/certificates/fee");
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
export const certificateQRCode = async (
  id: string,
): Promise<CertificateVerifyResponse> => {
  const response = await publicApi.get<CertificateVerifyResponse>(
    `/certificates/verify?certificateNumber=${encodeURIComponent(id)}`,
  );
  return response.data;
};

// ─── Admin: re-pricing ────────────────────────────────────────────────────────

/**
 * Dry run. Lists every invoice priced differently from what the student owes
 * and changes nothing — run it before an upload, or to inspect the backlog.
 *
 * `includePaid` also returns already-paid records priced differently, i.e. the
 * refund queue.
 */
export const getMispricedInvoices = async (params?: {
  includePaid?: boolean;
}): Promise<MispricedInvoicesResponse> => {
  const response = await api.get("/admin/certificate-discounts/mismatched", {
    params,
  });
  return response.data;
};

/**
 * Apply the correction — for one student, or for everything the dry run found.
 * `all: true` is deliberately explicit; never send it as a default.
 */
export const repriceCertificates = async (
  payload: RepricePayload,
): Promise<RepriceReportResponse> => {
  const response = await api.post(
    "/admin/certificate-discounts/reprice",
    payload,
  );
  return response.data;
};

/** Students who paid an amount other than what they owed. A call list. */
export const getCertificateDiscrepancies = async (params?: {
  includeResolved?: boolean;
}): Promise<CertificateDiscrepanciesResponse> => {
  const response = await api.get("/admin/certificates/discrepancies", {
    params,
  });
  return response.data;
};

/** Settle one discrepancy once the refund is paid or the balance collected. */
export const resolveCertificateDiscrepancy = async (
  certificateId: string,
  payload: { note: string },
): Promise<ResolveDiscrepancyResponse> => {
  const response = await api.put(
    `/admin/certificates/${certificateId}/discrepancy/resolve`,
    payload,
  );
  return response.data;
};

// ─── Admin: discount eligibility ──────────────────────────────────────────────

/** Add one student to the pre-paid list. Re-prices their invoice downward. */
export const addCertificateDiscount = async (
  payload: AddCertificateDiscountPayload,
): Promise<AddCertificateDiscountResponse> => {
  const response = await api.post("/admin/certificate-discounts", payload);
  return response.data;
};

/**
 * Remove one student from the pre-paid list.
 *
 * ⚠ This has side effects: it re-prices their outstanding invoice **upward**
 * to the full fee and replaces a reference they may already be holding. Always
 * confirm with the admin first.
 */
export const removeCertificateDiscount = async (
  registrationNumber: string,
): Promise<RepriceReportResponse> => {
  const response = await api.delete(
    `/admin/certificate-discounts/${encodeURIComponent(registrationNumber)}`,
  );
  return response.data;
};
