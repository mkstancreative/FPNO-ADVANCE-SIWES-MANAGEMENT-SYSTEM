import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCertificateFee,
  getCertificateStatus,
  initiateCertificatePayment,
  requestCertificate,
  requestInternshipCertificate,
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
  getMispricedInvoices,
  repriceCertificates,
  getCertificateDiscrepancies,
  resolveCertificateDiscrepancy,
  addCertificateDiscount,
  removeCertificateDiscount,
} from "../api/services/certificate";
import {
  getApiErrorData,
  getApiErrorMessage,
  getApiErrorStatus,
} from "../api/services/api";
import { toast } from "react-toastify";
import type {
  AdminCertificateParams,
  AddCertificateDiscountPayload,
  RepricePayload,
  RRRData,
} from "../api/types/certificate";

const CERT_STATUS_KEY = ["certificate-status"];

/**
 * `POST /certificates/request` rejects an unpaid order with a 400 whose body
 * carries the `rrr` to resume from. Pull it out so the caller can drop the
 * student straight back onto the payment screen.
 */
export const getUnpaidRRRFromError = (error: unknown): string | undefined => {
  if (getApiErrorStatus(error) !== 400) return undefined;
  const data = getApiErrorData<{ rrr?: string; data?: { rrr?: string } }>(error);
  return data?.rrr ?? data?.data?.rrr;
};

/** True when the request failed because no payment has been started yet. */
export const isPaymentNotStarted = (error: unknown): boolean =>
  getApiErrorStatus(error) === 404;

/**
 * A 400 from `verify-payment` means one of two very different things:
 *
 *   - the payment genuinely did not go through ("Payment not successful"), or
 *   - the money **was** received and recorded, but against a superseded
 *     cheaper invoice, so a balance remains.
 *
 * The second is not a failure the student caused, and rendering it as
 * "payment failed" would tell them their money vanished. The backend's own
 * message explains the balance, so surface that verbatim.
 */
export const isOutstandingBalance = (error: unknown): boolean => {
  if (getApiErrorStatus(error) !== 400) return false;
  const message = getApiErrorData<{ message?: string }>(error)?.message ?? "";
  return /balance|owed|received/i.test(message);
};

/** True when the request failed because a fee is still outstanding (402). */
export const isPaymentRequired = (error: unknown): boolean =>
  getApiErrorStatus(error) === 402;

export const CERT_FEE_KEY = ["certificate-fee"];

/**
 * Drives the certificate screens for every student, including one who has not
 * requested anything yet — `/certificates/status` 404s in that case, so this is
 * what the dashboard leans on to know whether to offer "pay" at all.
 */
export const useCertificateFee = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: CERT_FEE_KEY,
    queryFn: getCertificateFee,
    enabled: options?.enabled ?? true,
  });
};

export const useCertificateStatus = (options?: {
  enabled?: boolean;
  /**
   * Pass "always" from the payment screen. An invoice can be re-priced
   * server-side between visits, so whatever is in the cache may name an RRR
   * and an amount that have both been superseded.
   */
  refetchOnMount?: boolean | "always";
}) => {
  return useQuery({
    queryKey: CERT_STATUS_KEY,
    queryFn: getCertificateStatus,
    enabled: options?.enabled ?? true,
    refetchOnMount: options?.refetchOnMount,
    // A student with no request yet gets a 404 here; that is a normal state,
    // not a transient failure, so do not burn retries on it.
    retry: false,
  });
};

/**
 * Step 1 for external students — raise the order and get an RRR. Nothing is
 * submitted yet; the documents follow once this payment clears.
 */
export const useInitiateCertificatePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: initiateCertificatePayment,
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: CERT_STATUS_KEY });
        queryClient.invalidateQueries({ queryKey: CERT_FEE_KEY });
      } else {
        toast.error(data.message || "Could not start the certificate payment");
      }
    },
    onError: (error: unknown) => {
      toast.error(
        getApiErrorMessage(error, "Error starting the certificate payment"),
      );
    },
  });
};

/**
 * Step 2 for external students — submit the documents against a paid order.
 * No RRR comes back any more; the payment screen is behind us at this point.
 */
export const useRequestCertificate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: FormData) =>
      requestCertificate(payload) as Promise<{
        success: boolean;
        message: string;
      }>,
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Documents submitted. Your request is now under review.");
        queryClient.invalidateQueries({ queryKey: CERT_STATUS_KEY });
        queryClient.invalidateQueries({ queryKey: CERT_FEE_KEY });
      } else {
        toast.error(data.message || "Failed to submit certificate request");
      }
    },
    onError: (error: unknown) => {
      if (isPaymentNotStarted(error)) {
        toast.error("Start the certificate payment before submitting.");
        return;
      }
      if (getUnpaidRRRFromError(error)) {
        toast.error("Your certificate fee is still unpaid.");
        return;
      }
      toast.error(getApiErrorMessage(error, "Error requesting certificate"));
    },
  });
};

/**
 * Platform students. The internship fee already covered this, so there is no
 * RRR and no payment screen — only a 402 when that fee was never paid.
 */
export const useRequestInternshipCertificate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { internshipId?: string; batchId?: string }) =>
      requestInternshipCertificate(payload) as Promise<{
        success: boolean;
        message: string;
      }>,
    onSuccess: (data) => {
      if (data.success) {
        toast.success(
          "Certificate requested. Your request is now under review.",
        );
        queryClient.invalidateQueries({ queryKey: CERT_STATUS_KEY });
        queryClient.invalidateQueries({ queryKey: CERT_FEE_KEY });
      } else {
        toast.error(data.message || "Failed to request certificate");
      }
    },
    onError: (error: unknown) => {
      if (isPaymentRequired(error)) {
        toast.error(
          "Your internship fee is outstanding. Settle it to request your certificate.",
        );
        return;
      }
      toast.error(getApiErrorMessage(error, "Error requesting certificate"));
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
        queryClient.invalidateQueries({ queryKey: CERT_STATUS_KEY });
        queryClient.invalidateQueries({ queryKey: CERT_FEE_KEY });
      } else {
        toast.error(data.message || "Failed to resend request");
      }
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Error resending request"));
    },
  });
};

export const useVerifyCertificatePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: verifyCertificatePayment,
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: CERT_STATUS_KEY });
        queryClient.invalidateQueries({ queryKey: CERT_FEE_KEY });
      }
    },
  });
};

export const useAllCertRequests = (params: AdminCertificateParams) => {
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
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Error approving requests"));
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
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Error rejecting requests"));
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
    mutationFn: (rrr: string) =>
      regenerateRRR(rrr) as Promise<{
        success: boolean;
        message?: string;
        data: RRRData;
      }>,
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: CERT_STATUS_KEY });
        queryClient.invalidateQueries({ queryKey: CERT_FEE_KEY });
        queryClient.invalidateQueries({ queryKey: ["all-cert-requests"] });
      }
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Error regenerating RRR"));
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

// ─── Re-pricing ───────────────────────────────────────────────────────────────

export const MISPRICED_KEY = ["mispriced-invoices"];
export const DISCREPANCIES_KEY = ["certificate-discrepancies"];

/**
 * Everything a re-price touches, in one place. A correction changes the
 * mispriced backlog, can create a discrepancy, moves invoice amounts on the
 * requests table, and may change a student's discount row.
 */
const invalidateRepriceSurfaces = (queryClient: {
  invalidateQueries: (filters: { queryKey: unknown[] }) => void;
}) => {
  queryClient.invalidateQueries({ queryKey: MISPRICED_KEY });
  queryClient.invalidateQueries({ queryKey: DISCREPANCIES_KEY });
  queryClient.invalidateQueries({ queryKey: ["all-cert-requests"] });
  queryClient.invalidateQueries({ queryKey: ["discounted-students"] });
  queryClient.invalidateQueries({ queryKey: ["cert-financial-stats"] });
};

/** Dry run — changes nothing, so it is safe to poll and safe to refetch. */
export const useMispricedInvoices = (params?: { includePaid?: boolean }) => {
  return useQuery({
    queryKey: [...MISPRICED_KEY, params ?? {}],
    queryFn: () => getMispricedInvoices(params),
  });
};

export const useRepriceCertificates = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RepricePayload) => repriceCertificates(payload),
    onSuccess: () => invalidateRepriceSurfaces(queryClient),
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Could not re-price."));
    },
  });
};

export const useCertificateDiscrepancies = (params?: {
  includeResolved?: boolean;
}) => {
  return useQuery({
    queryKey: [...DISCREPANCIES_KEY, params ?? {}],
    queryFn: () => getCertificateDiscrepancies(params),
  });
};

export const useResolveDiscrepancy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      certificateId,
      note,
    }: {
      certificateId: string;
      note: string;
    }) => resolveCertificateDiscrepancy(certificateId, { note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DISCREPANCIES_KEY });
      toast.success("Discrepancy marked as settled.");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Could not resolve discrepancy."));
    },
  });
};

export const useAddCertificateDiscount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddCertificateDiscountPayload) =>
      addCertificateDiscount(payload),
    onSuccess: () => invalidateRepriceSurfaces(queryClient),
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Could not add the discount."));
    },
  });
};

/** ⚠ Re-prices the student's outstanding invoice upward. Confirm first. */
export const useRemoveCertificateDiscount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (registrationNumber: string) =>
      removeCertificateDiscount(registrationNumber),
    onSuccess: () => invalidateRepriceSurfaces(queryClient),
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Could not remove the discount."));
    },
  });
};
