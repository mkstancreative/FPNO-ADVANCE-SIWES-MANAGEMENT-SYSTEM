import { useState, type FormEvent } from "react";
import { CheckCircle2, CreditCard, ShieldCheck } from "lucide-react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import Spinner from "../../ui/Spinner/Spinner";
import { useVerifyInternshipPayment } from "../../../hooks/useInternshipPayment";
import type { InternshipPaymentVerificationResponse } from "../../../api/types/internship";

interface AdminVerifyRRRProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminVerifyRRR({
  isOpen = true,
  onClose,
}: AdminVerifyRRRProps) {
  const [rrr, setRrr] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<InternshipPaymentVerificationResponse | null>(null);

  const { mutate: verifyPayment, isPending } = useVerifyInternshipPayment();

  const handleClose = () => {
    setRrr("");
    setError("");
    setResult(null);
    onClose?.();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleanedRRR = rrr.trim().replace(/\s+/g, "");

    if (!cleanedRRR) {
      setError("Please enter a valid Remita Retrieval Reference (RRR)");
      return;
    }

    if (cleanedRRR.length < 8) {
      setError("RRR must be at least 8 digits");
      return;
    }

    setError("");
    verifyPayment(cleanedRRR, {
      onSuccess: (data) => {
        setResult(data);
      },
    });
  };

  if (result && result.success) {
    return (
      <CustomModal
        isOpen={isOpen}
        onClose={handleClose}
        title="RRR Verification Successful"
        subtitle="The payment has been verified on Remita"
        icon={<CheckCircle2 size={18} style={{ color: "#16a34a" }} />}
        size="default"
        footer={
          <button type="button" className="modal-submit" onClick={handleClose}>
            Done
          </button>
        }
      >
        <div className="avr-success-body">
          <div className="avr-success-icon">
            <ShieldCheck size={32} />
          </div>
          <h3>Payment Verified</h3>
          <p className="avr-success-msg">
            {result.message || "Remita transaction verified successfully."}
          </p>

          {result.data && (
            <div className="avr-meta-card">
              {result.data.rrr && (
                <div className="avr-meta-row">
                  <span>RRR:</span>
                  <strong>{result.data.rrr}</strong>
                </div>
              )}
              {result.data.amount !== undefined && (
                <div className="avr-meta-row">
                  <span>Amount:</span>
                  <strong>₦{result.data.amount.toLocaleString()}</strong>
                </div>
              )}
              {result.data.paymentStatus && (
                <div className="avr-meta-row">
                  <span>Status:</span>
                  <span className="avr-badge-success">
                    {result.data.paymentStatus.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
        <style>{`
          .avr-success-body {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: 12px 0;
          }
          .avr-success-icon {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background: #dcfce7;
            color: #16a34a;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 12px;
          }
          .avr-success-body h3 {
            margin: 0 0 6px;
            font-size: 17px;
            font-weight: 700;
            color: var(--color-text-primary);
          }
          .avr-success-msg {
            margin: 0 0 16px;
            font-size: 13px;
            color: var(--color-text-muted);
          }
          .avr-meta-card {
            width: 100%;
            background: var(--color-bg-secondary);
            border: 1px solid var(--color-border);
            border-radius: 8px;
            padding: 12px 14px;
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .avr-meta-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 13px;
          }
          .avr-meta-row span {
            color: var(--color-text-muted);
          }
          .avr-badge-success {
            font-weight: 700;
            font-size: 11px;
            padding: 2px 8px;
            border-radius: 4px;
            background: #dcfce7;
            color: #15803d;
          }
        `}</style>
      </CustomModal>
    );
  }

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Verify RRR Payment"
      subtitle="Manually confirm a Remita Retrieval Reference payment"
      icon={<CreditCard size={18} />}
      size="default"
      footer={
        <>
          <button
            type="button"
            className="modal-cancel"
            onClick={handleClose}
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="admin-verify-rrr-form"
            className="modal-submit"
            disabled={isPending || !rrr.trim()}
          >
            {isPending ? <Spinner size={14} color="#fff" /> : "Verify RRR"}
          </button>
        </>
      }
    >
      <form id="admin-verify-rrr-form" onSubmit={handleSubmit}>
        <div className="form-group" style={{ marginBottom: 16 }}>
          <label className="modal-label">
            Remita Retrieval Reference (RRR) <span className="req">*</span>
          </label>
          <input
            type="text"
            className={`modal-input${error ? " input-error" : ""}`}
            value={rrr}
            onChange={(e) => {
              setRrr(e.target.value);
              if (error) setError("");
            }}
            placeholder="e.g. 120008472910"
            disabled={isPending}
            autoFocus
          />
          {error && <span className="field-error-msg">{error}</span>}
        </div>

        <p className="avr-hint">
          Verifying the RRR checks Remita&apos;s servers directly and updates the student&apos;s
          internship payment status once confirmed.
        </p>
      </form>

      <style>{`
        .input-error {
          border-color: #ef4444 !important;
        }
        .field-error-msg {
          display: block;
          margin-top: 4px;
          font-size: 12px;
          color: #ef4444;
        }
        .avr-hint {
          margin: 0;
          font-size: 12.5px;
          line-height: 1.45;
          color: var(--color-text-muted);
        }
      `}</style>
    </CustomModal>
  );
}
