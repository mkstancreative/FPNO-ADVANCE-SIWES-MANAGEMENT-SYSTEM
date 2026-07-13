import { api } from "./api";
import type {
  BulkVerifyResponse,
  CompanyListResponse,
  CompanyParams,
  VerifyCompaniesPayload,
  PendingPlacementsResponse,
  VerifyPlacementsPayload,
} from "../types/company";

export const getPendingCompanies = async (
  params?: CompanyParams,
): Promise<CompanyListResponse> => {
  const response = await api.get("/admin/companies/pending", { params });
  return response.data;
};

export const verifyCompanies = async (
  payload: VerifyCompaniesPayload,
): Promise<BulkVerifyResponse> => {
  const response = await api.put("/admin/verify-companies", payload);
  return response.data;
};

export const getVerifiedCompaniesSecure = async (
  params?: CompanyParams,
): Promise<CompanyListResponse> => {
  const response = await api.get<CompanyListResponse>(
    "/general/companies/secure",
    { params },
  );
  return response.data;
};

export const getPartiallyVerifiedCompanies = async (
  params?: CompanyParams,
): Promise<PendingPlacementsResponse> => {
  const response = await api.get("/admin/placements/pending", { params });
  return response.data;
};

export const verifyPlacementCompanies = async (
  payload: VerifyPlacementsPayload,
): Promise<BulkVerifyResponse> => {
  const response = await api.put("/admin/verify-placements", payload);
  return response.data;
};
