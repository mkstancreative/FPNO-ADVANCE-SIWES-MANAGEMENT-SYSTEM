import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCertificateStatus,
  requestCertificate,
  verifyCertificatePayment,
  getAllRequests,
  getCertById,
  approveCertBulk,
  rejectCertBulk,
  financialStats,
  resendRequest,
  regenerateRRR,
  getMyCertificate,
  certificateQRCode,
} from "../api/services/certificate";
import { toast } from "react-toastify";
import type { RRRData } from "../api/types/certificate";

export const useCertificateStatus = () => {
  return useQuery({
    queryKey: ["certificate-status"],
    queryFn: getCertificateStatus,
  });
};

export const useRequestCertificate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: FormData) =>
      requestCertificate(payload) as Promise<{
        success: boolean;
        message: string;
        data: RRRData;
      }>,
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Certificate request initiated. Please pay the fee.");
        queryClient.invalidateQueries({ queryKey: ["certificate-status"] });
      } else {
        toast.error(data.message || "Failed to request certificate");
      }
    },
    onError: (error: Error) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message || "Error requesting certificate",
      );
    },
  });
};

export const useResendCertificateRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: FormData }) =>
      resendRequest(id, payload),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Request resent successfully!");
        queryClient.invalidateQueries({ queryKey: ["certificate-status"] });
      } else {
        toast.error(data.message || "Failed to resend request");
      }
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Error resending request");
    },
  });
};

export const useVerifyCertificatePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: verifyCertificatePayment,
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["certificate-status"] });
      }
    },
  });
};

export const useAllCertRequests = (params: {
  page: number;
  limit: number;
  startDate: string;
  endDate: string;
  status?: string | null;
  paymentStatus?: string | null;
  search?: string | null;
}) => {
  return useQuery({
    queryKey: ["all-cert-requests", params],
    queryFn: () => getAllRequests(params),
  });
};

export const useCertDetails = (id: string | null) => {
  return useQuery({
    queryKey: ["cert-details", id],
    queryFn: () => getCertById(id!),
    enabled: !!id,
  });
};

export const useBulkApproveCert = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { certificateIds: string[] }) =>
      approveCertBulk(payload),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["all-cert-requests"] });
      }
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Error approving requests");
    },
  });
};

export const useBulkRejectCert = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { certificateIds: string[]; reason?: string }) =>
      rejectCertBulk(payload),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["all-cert-requests"] });
      }
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Error rejecting requests");
    },
  });
};

export const useCertFinancialStats = () => {
  return useQuery({
    queryKey: ["cert-financial-stats"],
    queryFn: financialStats,
  });
};

export const useRegenerateRRR = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rrr: string) => regenerateRRR(rrr),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["certificate-status"] });
        queryClient.invalidateQueries({ queryKey: ["all-cert-requests"] });
      }
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Error regenerating RRR");
    },
  });
};

export const useGetMyCertificate = () => {
  return useMutation({
    mutationFn: getMyCertificate,
  });
};

export const useVerifyCertificateQRCode = (certNumber: string | null) => {
  return useQuery({
    queryKey: ["verify-cert-qrcode", certNumber],
    queryFn: () => certificateQRCode(certNumber!),
    enabled: !!certNumber,
    retry: false,
  });
};
