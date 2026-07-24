import { api } from "./api";

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

export const verifyCertificatePayment = async (params: {
  orderId: string;
  rrr?: string;
}) => {
  const value = params.rrr || params.orderId;
  const key = params.rrr ? "rrr" : "orderId";

  const response = await api.post(
    `/certificates/verify-payment?${key}=${value}`,
  );
  return response.data;
};

export const getCertificateStatus = async () => {
  const response = await api.get("/certificates/status");
  return response.data;
};

export const getMyCertificate = async () => {
  const response = await api.get("/certificates/my-certificate");
  return response.data;
};

// Admin
export const getAllRequests = async (params: {
  page: number;
  limit: number;
  startDate: string;
  endDate: string;
  status?: string | null;
  paymentStatus?: string | null;
  search?: string | null;
}) => {
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

export const certificateQRCode = async (id: string) => {
  const response = await api.get(
    `/certificates/verify?certificateNumber=${encodeURIComponent(id)}`,
  );
  return response.data;
};

export const regenerateRRR = async (rrr: string) => {
  const response = await api.patch(`/certificates/regenerate-rrr/${rrr}`);
  return response.data;
};
