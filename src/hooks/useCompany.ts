import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPendingCompanies,
  getVerifiedCompaniesSecure,
  verifyCompanies,
  getPartiallyVerifiedCompanies,
  verifyPlacementCompanies,
} from "../api/services/company";
import { getCompanies } from "../api/services/general";
import type {
  CompanyParams,
  VerifyCompaniesPayload,
  VerifyPlacementsPayload,
} from "../api/types/company";

export const usePartiallyVerifiedCompanies = (params?: CompanyParams) => {
  return useQuery({
    queryKey: ["partially-verified-companies", params],
    queryFn: () => getPartiallyVerifiedCompanies(params),
  });
};

export const useVerifyPlacements = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: VerifyPlacementsPayload) =>
      verifyPlacementCompanies(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["partially-verified-companies"],
      });
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
};

export const usePendingCompanies = (params?: CompanyParams) => {
  return useQuery({
    queryKey: ["companies", params],
    queryFn: () => getPendingCompanies(params),
  });
};

export const useVerifyCompanies = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: VerifyCompaniesPayload) => verifyCompanies(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
};

export const useVerifiedCompanies = (
  params?: CompanyParams,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: ["verified-companies", params],
    queryFn: () => getCompanies({ ...params, status: "verified" }),
    enabled: options?.enabled ?? true,
  });
};

export const useVerifiedCompaniesSecure = (params?: CompanyParams) => {
  return useQuery({
    queryKey: ["verified-companies-secure", params],
    queryFn: () => getVerifiedCompaniesSecure(params),
  });
};
