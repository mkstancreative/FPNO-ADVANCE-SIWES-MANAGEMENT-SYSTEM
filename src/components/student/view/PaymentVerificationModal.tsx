import React from "react";
import { CreditCard, Copy, RefreshCcw } from "lucide-react";
import {
  useRegenerateRRR,
  useCertificateStatus,
} from "../../../hooks/useCertificate";
import {
  useRegenerateInternshipRRR,
  useInternshipPaymentStatus,
} from "../../../hooks/useInternshipPayment";
import { toast } from "react-toastify";
import CustomModal from "../../ui/CustomModal/CustomModal";
import Spinner from "../../ui/Spinner/Spinner";
import type { RRRData } from "../../../api/types/certificate";
import type { InternshipScopeParams } from "../../../api/types/internship";

/** Which fee this RRR belongs to. Each has its own regenerate + status route. */
export type PaymentFlow = "certificate" | "internship";

interface PaymentVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: RRRData;
  flow?: PaymentFlow;
  /**
   * Which internship this fee belongs to. Must match the scope the opening
   * screen queried with, or the modal reads a different cache entry and fires
   * a redundant unscoped request.
   */
  scope?: InternshipScopeParams;
  title?: string;
  subtitle?: string;
}

const REMITA_PUBLIC_KEY =
  import.meta.env.VITE_REMITA_PUBLIC_KEY ||
  "RzAwMDAzODk5NTh8MTEwMDQwOTIxNTU5fDlmMmE5ZTFmOTdmN2Y4MDg1ZTE5ODkxY2I2ZDZjN2M2YTcxNWFkMzE3NDU2ZGNmZDc5OWQyYjgzZTdkOWViZDc2ZjE5NTUzZDA4YjJjYmM5ZjU0OTA0NWI5NGMzYmM4MzA5MmU1MmE5ZGRiYjAyYWY1MmJkYzkwOTk3ODUxMjBi";

declare global {
  interface Window {
    RmPaymentEngine: {
      init: (config: Record<string, unknown>) => {
        showPaymentWidget: () => void;
      };
    };
  }
}

export const PaymentVerificationModal: React.FC<
  PaymentVerificationModalProps
> = ({
  isOpen,
  onClose,
  data: initialData,
  flow = "certificate",
  scope,
  title,
  subtitle,
}) => {
  const isInternship = flow === "internship";

  const { mutate: regenerateCert, isPending: regeneratingCert } =
    useRegenerateRRR();
  const { mutate: regenerateInternship, isPending: regeneratingInternship } =
    useRegenerateInternshipRRR();
  const regenerate = isInternship ? regenerateInternship : regenerateCert;
  const regenerating = isInternship ? regeneratingInternship : regeneratingCert;

  // Only the flow in play is queried; the other stays disabled so opening the
  // internship modal never fires a certificate-status request and vice versa.
  const { data: certResponse } = useCertificateStatus({
    enabled: isOpen && !isInternship,
  });
  const { data: internshipResponse } = useInternshipPaymentStatus(scope, {
    enabled: isOpen && isInternship,
  });

  // Prefer whatever the cache knows now — a regenerate that lands while this
  // modal is open should swap the RRR under the student without a reopen.
  const latestData = isInternship
    ? internshipResponse?.data
    : certResponse?.data;

  const data = React.useMemo<RRRData>(
    () =>
      latestData
        ? {
            rrr: latestData.rrr || initialData.rrr,
            amount: latestData.amount ?? initialData.amount,
            orderId: latestData.orderId || initialData.orderId,
            merchantId: latestData.merchantId || initialData.merchantId,
            certificateId:
              (latestData as { certificateId?: string }).certificateId ||
              initialData.certificateId,
            internshipId:
              (latestData as { internshipId?: string }).internshipId ||
              initialData.internshipId,
          }
        : initialData,
    [latestData, initialData],
  );

  const [isPayLoading, setIsPayLoading] = React.useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.info("Copied to clipboard");
  };

  const handleRegenerate = () => {
    if (!data.rrr || data.rrr === "Pending") return;

    regenerate(data.rrr, {
      onSuccess: (res) => {
        if (res.success) {
          toast.success("RRR regenerated successfully!");
        } else {
          toast.error(res.message || "Failed to regenerate RRR");
        }
      },
      onError: () => {
        toast.error("An error occurred while regenerating RRR.");
      },
    });
  };

  /** Where Remita drops the student once checkout finishes. */
  const buildReturnUrl = React.useCallback(
    (confirmedRrr: string, confirmedOrder: string) => {
      const params = new URLSearchParams({
        flow,
        rrr: confirmedRrr,
        orderId: confirmedOrder,
      });
      const scopeId = isInternship ? data.internshipId : data.certificateId;
      if (scopeId) {
        params.set(isInternship ? "internshipId" : "certificateId", scopeId);
      }
      return `${window.location.origin}/student/payment/success?${params.toString()}`;
    },
    [flow, isInternship, data.internshipId, data.certificateId],
  );

  const handleRemitaPay = React.useCallback(() => {
    if (!data.rrr || data.rrr === "Pending") {
      toast.error("RRR not ready. Please wait.");
      return;
    }

    if (!window.RmPaymentEngine) {
      toast.error("Remita Payment Engine not loaded. Please refresh.");
      return;
    }

    setIsPayLoading(true);
    const paymentEngine = window.RmPaymentEngine.init({
      key: REMITA_PUBLIC_KEY,
      processRrr: true,
      transactionId: data.orderId || data.rrr,
      extendedData: {
        customFields: [{ name: "rrr", value: data.rrr }],
      },
      onSuccess: function (response: unknown) {
        setIsPayLoading(false);
        const res = response as { rrr?: string; paymentReference?: string };
        window.location.href = buildReturnUrl(
          res.rrr || data.rrr,
          res.paymentReference || data.orderId,
        );
      },
      onError: function () {
        setIsPayLoading(false);
        toast.error("Payment failed. Please try again.");
      },
      onClose: function () {
        setIsPayLoading(false);
      },
    });

    paymentEngine.showPaymentWidget();

    // Close our modal so Remita can take over the screen
    onClose();

    setTimeout(() => setIsPayLoading(false), 2000);
  }, [data, onClose, buildReturnUrl]);

  const heading =
    title ?? (isInternship ? "Internship Fee Payment" : "Certificate Fee Payment");
  const subheading =
    subtitle ??
    (isInternship
      ? "Pay your internship fee to unlock placement and your certificate"
      : "Use the RRR below to complete your payment");

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title={heading}
      subtitle={subheading}
      icon={<CreditCard size={18} />}
      footer={
        <>
          <button className="modal-cancel" type="button" onClick={onClose}>
            Pay Later
          </button>
          {data.rrr !== "Pending" ? (
            <button
              className="modal-submit"
              onClick={handleRemitaPay}
              disabled={isPayLoading}
              title="Click to pay via Remita"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {isPayLoading ? (
                <>
                  <Spinner size={14} color="#fff" />
                  Connecting...
                </>
              ) : (
                "Pay via Remita"
              )}
            </button>
          ) : (
            <button
              className="modal-submit"
              disabled
              style={{ opacity: 0.5, cursor: "not-allowed" }}
            >
              Generating RRR...
            </button>
          )}
        </>
      }
    >
      <div className="payment-display">
        <div className="rrr-box">
          <label>Remita Retrieval Reference (RRR)</label>
          <div className="rrr-value-wrap">
            <span className="rrr-value">{data.rrr}</span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                className="copy-btn"
                onClick={() => handleCopy(data.rrr)}
                title="Copy RRR"
              >
                <Copy size={14} />
              </button>
              <button
                className="copy-btn"
                onClick={handleRegenerate}
                disabled={regenerating}
                title="Regenerate RRR if expired"
                style={{ color: "var(--color-warning, #f59e0b)" }}
              >
                {regenerating ? (
                  <Spinner
                    text="Regenerating..."
                    color="var(--color-accent)"
                    size={12}
                  />
                ) : (
                  <RefreshCcw size={14} />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="amount-box">
          <label>Amount to Pay</label>
          <div className="amount-value">
            ₦{(data.amount ?? 0).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="payment-instructions">
        <div className="instruction-step">
          <div className="step-number">1</div>
          <div className="step-content">
            <h5>Launch Gateway</h5>
            <p>Click "Pay via Remita" to open the payment portal.</p>
          </div>
        </div>
        <div className="instruction-step">
          <div className="step-number">2</div>
          <div className="step-content">
            <h5>Complete Payment</h5>
            <p>Choose your method (Card, Bank, or Transfer) and finalize.</p>
          </div>
        </div>
        <div className="instruction-step">
          <div className="step-number">3</div>
          <div className="step-content">
            <h5>{isInternship ? "Submit Your Placement" : "Upload Documents"}</h5>
            <p>
              {isInternship
                ? "Once confirmed, your placement form unlocks automatically."
                : "Once confirmed, upload your supporting documents for review."}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .payment-display {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 20px;
        }
        .rrr-box,
        .amount-box {
          background: linear-gradient(145deg, var(--color-bg-secondary), var(--color-bg-primary));
          padding: 16px;
          border-radius: 12px;
          border: 1px solid var(--color-border);
          box-shadow: 0 2px 8px -2px rgba(0,0,0,0.05);
        }
        .rrr-box label,
        .amount-box label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--color-text-muted);
          display: block;
          margin-bottom: 8px;
          font-weight: 700;
        }
        .rrr-value-wrap {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        .rrr-value {
          font-family: monospace;
          font-size: 20px;
          font-weight: 800;
          color: var(--color-accent);
          letter-spacing: 1px;
        }
        .copy-btn {
          background: var(--color-surface-overlay);
          border: 1px solid var(--color-border);
          color: var(--color-text-primary);
          padding: 6px;
          border-radius: 6px;
          cursor: pointer;
        }
        .amount-value {
          font-size: 24px;
          font-weight: 800;
          color: var(--color-text-primary);
        }
        .payment-instructions {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 16px;
          background: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.2);
          border-left: 4px solid var(--color-warning, #d97706);
          border-radius: 12px;
        }
        .instruction-step {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }
        .step-number {
          width: 20px;
          height: 20px;
          background: var(--color-accent);
          color: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .step-content h5 {
          margin: 0 0 2px 0;
          font-size: 13px;
          font-weight: 700;
          color: var(--color-text-primary);
        }
        .step-content p {
          margin: 0;
          font-size: 13px;
          color: var(--color-text-secondary);
          line-height: 1.4;
        }
      `}</style>
    </CustomModal>
  );
};
