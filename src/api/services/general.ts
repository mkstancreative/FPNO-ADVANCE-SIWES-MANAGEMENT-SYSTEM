import { api } from "./api";
import type { CompanyListResponse, CompanyParams } from "../types/company";

export const getCompanies = async (
  params?: CompanyParams & { city?: string },
): Promise<CompanyListResponse> => {
  const response = await api.get<CompanyListResponse>(`/general/companies`, {
    params,
  });
  return response.data;
};
