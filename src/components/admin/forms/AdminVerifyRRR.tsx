import { useState, type FormEvent } from "react";
import { CheckCircle2, CreditCard, ShieldCheck, XCircle } from "lucide-react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import Spinner from "../../ui/Spinner/Spinner";
import { useVerifyInternshipPayment } from "../../../hooks/useInternshipPayment";
import { useVerifyCertificatePayment } from "../../../hooks/useCertificate";
import type { InternshipPaymentVerificationResponse } from "../../../api/types/internship";

export type VerifyRRRFlow = "internship" | "certificate";

interface AdminVerifyRRRProps {
  isOpen?: boolean;
  onClose?: () => void;
  /** Default is internship (platform students). Pass "certificate" for self-registered students. */
  flow?: VerifyRRRFlow;
}

const FLOW_META: Record<VerifyRRRFlow, { title: string; subtitle: string; hint: string }> = {
  internship: {
    title: "Verify Internship RRR",
    subtitle: "Confirm a Remita payment for a platform (internship-fee) student",
    hint: "Verifying checks Remita's servers directly and updates the student's internship payment status once confirmed.",
  },
  certificate: {
    title: "Verify Certificate RRR",
    subtitle: "Confirm a Remita payment for a self-registered student's certificate fee",
    hint: "Verifying checks Remita's servers directly and unlocks the student's certificate request once confirmed.",
  },
};

export default function AdminVerifyRRR({ isOpen = true, onClose, flow = "internship" }: AdminVerifyRRRProps) {
  const [rrr, setRrr] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<InternshipPaymentVerificationResponse | null>(null);

  const { mutate: verifyInternship, isPending: pendingInternship } = useVerifyInternshipPayment();
  const { mutate: verifyCertificate, isPending: pendingCertificate } = useVerifyCertificatePayment();

  const isPending = flow === "internship" ? pendingInternship : pendingCertificate;
  const meta = FLOW_META[flow];

  const handleClose = () => {
    setRrr("");
    setError("");
    setResult(null);
    onClose?.();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleanedRRR = rrr.trim().replace(/\s+/g, "");
    if (!cleanedRRR) { setError("Please enter a valid Remita Retrieval Reference (RRR)"); return; }
    if (cleanedRRR.length < 8) { setError("RRR must be at least 8 digits"); return; }
    setError("");

    if (flow === "internship") {
      verifyInternship(cleanedRRR, {
        onSuccess: (data) => setResult(data),
        onError: (err: unknown) => {
          const e = err as { response?: { data?: { message?: string } } };
          setResult({
            success: false,
            message:
              e?.response?.data?.message ||
              "Internship payment verification failed.",
          });
        },
      });
    } else {
      verifyCertificate(
        { orderId: cleanedRRR, rrr: cleanedRRR },
        {
          onSuccess: (data) =>
            setResult({
              success: data?.success ?? false,
              message: data?.message,
            }),
          onError: (err: unknown) => {
            const e = err as { response?: { data?: { message?: string } } };
            setResult({
              success: false,
              message:
                e?.response?.data?.message ||
                "Certificate payment verification failed.",
            });
          },
        },
      );
    }
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
          <button type="button" className="modal-submit" onClick={handleClose}>Done</button>
        }
      >
        <div className="avr-success-body">
          <div className="avr-success-icon"><ShieldCheck size={32} /></div>
          <h3>Payment Verified</h3>
          <p className="avr-success-msg">{result.message || "Remita transaction verified successfully."}</p>
          {result.data && (
            <div className="avr-meta-card">
              {result.data.rrr && (
                <div className="avr-meta-row"><span>RRR:</span><strong>{result.data.rrr}</strong></div>
              )}
              {result.data.amount !== undefined && (
                <div className="avr-meta-row"><span>Amount:</span><strong>&#8358;{result.data.amount.toLocaleString()}</strong></div>
              )}
              {result.data.paymentStatus && (
                <div className="avr-meta-row">
                  <span>Status:</span>
                  <span className="avr-badge-success">{result.data.paymentStatus.toUpperCase()}</span>
                </div>
              )}
            </div>
          )}
        </div>
        <style>{`
          .avr-success-body { display:flex; flex-direction:column; align-items:center; text-align:center; padding:12px 0; }
          .avr-success-icon { width:56px; height:56px; border-radius:50%; background:rgba(22,163,74,0.12); color:#16a34a; display:flex; align-items:center; justify-content:center; margin-bottom:12px; }
          .avr-success-body h3 { margin:0 0 6px; font-size:17px; font-weight:700; color:var(--color-text-primary); }
          .avr-success-msg { margin:0 0 16px; font-size:13px; color:var(--color-text-muted); }
          .avr-meta-card { width:100%; background:var(--color-bg-secondary); border:1px solid var(--color-border); border-radius:8px; padding:12px 14px; display:flex; flex-direction:column; gap:8px; }
          .avr-meta-row { display:flex; justify-content:space-between; align-items:center; font-size:13px; }
          .avr-meta-row span { color:var(--color-text-muted); }
          .avr-badge-success { font-weight:700; font-size:11px; padding:2px 8px; border-radius:4px; background:rgba(22,163,74,0.12); color:#16a34a; }
        `}</style>
      </CustomModal>
    );
  }
  // ── Failure result ───────────────────────────────────────────────────────
  if (result && !result.success) {
    return (
      <CustomModal
        isOpen={isOpen}
        onClose={handleClose}
        title="Verification Failed"
        subtitle="The RRR could not be verified"
        icon={<XCircle size={18} style={{ color: "#ef4444" }} />}
        size="default"
        footer={
          <button type="button" className="modal-submit" onClick={handleClose}>
            Close
          </button>
        }
      >
        <div className="avr-success-body">
          <div className="avr-error-icon"><XCircle size={32} /></div>
          <h3 style={{ color: "var(--color-text-primary)" }}>Verification Failed</h3>
          <p className="avr-success-msg">
            {result.message || "Could not verify the RRR. Please check and try again."}
          </p>
          <div
            style={{
              width: "100%",
              padding: "10px 14px",
              background: "rgba(239, 68, 68, 0.06)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              borderLeft: "4px solid #ef4444",
              borderRadius: 8,
              fontSize: 13,
              color: "var(--color-text-secondary)",
            }}
          >
            RRR entered: <strong style={{ color: "var(--color-text-primary)" }}>{rrr}</strong>
          </div>
        </div>
        <style>{`
          .avr-success-body { display:flex; flex-direction:column; align-items:center; text-align:center; padding:12px 0; gap:8px; }
          .avr-error-icon { width:56px; height:56px; border-radius:50%; background:rgba(239,68,68,0.1); color:#ef4444; display:flex; align-items:center; justify-content:center; margin-bottom:4px; }
          .avr-success-body h3 { margin:0; font-size:17px; font-weight:700; }
          .avr-success-msg { margin:0; font-size:13px; color:var(--color-text-muted); }
        `}</style>
      </CustomModal>
    );
  }

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={handleClose}
      title={meta.title}
      subtitle={meta.subtitle}
      icon={<CreditCard size={18} />}
      size="default"
      footer={
        <>
          <button type="button" className="modal-cancel" onClick={handleClose} disabled={isPending}>Cancel</button>
          <button type="submit" form="admin-verify-rrr-form" className="modal-submit" disabled={isPending || !rrr.trim()}>
            {isPending ? <Spinner size={14} color="#fff" /> : "Verify RRR"}
          </button>
        </>
      }
    >
      <form id="admin-verify-rrr-form" onSubmit={handleSubmit}>
        <div className="form-group" style={{ marginBottom: 16 }}>
          <label className="modal-label">Remita Retrieval Reference (RRR) <span className="req">*</span></label>
          <input
            type="text"
            className={`modal-input${error ? " input-error" : ""}`}
            value={rrr}
            onChange={(e) => { setRrr(e.target.value); if (error) setError(""); }}
            placeholder="e.g. 120008472910"
            disabled={isPending}
            autoFocus
          />
          {error && <span className="field-error-msg">{error}</span>}
        </div>
        <p className="avr-hint">{meta.hint}</p>
      </form>
      <style>{`
        .input-error { border-color:#ef4444 !important; }
        .field-error-msg { display:block; margin-top:4px; font-size:12px; color:#ef4444; }
        .avr-hint { margin:0; font-size:12.5px; line-height:1.45; color:var(--color-text-muted); }
      `}</style>
    </CustomModal>
  );
}
