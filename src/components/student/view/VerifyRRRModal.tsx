import { useState, type FormEvent } from "react";
import { CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import Spinner from "../../ui/Spinner/Spinner";
import { useVerifyInternshipPayment } from "../../../hooks/useInternshipPayment";
import { useVerifyCertificatePayment } from "../../../hooks/useCertificate";
import { useStudentFeeTrack } from "../../../hooks/useStudentFeeTrack";

interface VerifyRRRModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  /** Prefilled when opened from the payment screen, which already has the RRR. */
  defaultRRR?: string;
}

type VerifyOutcome = { success: boolean; message?: string } | null;

/**
 * Student-facing counterpart to the admin's `AdminVerifyRRR`.
 *
 * The admin has to be asked which payment type they are verifying, because they
 * act on behalf of any student. A student is only ever on one track, so this
 * resolves the flow from their own record instead of making them choose:
 *
 *   platform student (pays an internship fee) → POST /internships/verify-payment
 *   self-registered  (pays a certificate fee) → POST /certificates/verify-payment
 *
 * Picking the wrong one is not a harmless mistake — each route only knows about
 * its own orders, so a correct RRR checked against the other flow comes back as
 * "not found" and reads to the student as a lost payment.
 */
export default function VerifyRRRModal({
  isOpen = true,
  onClose,
  defaultRRR = "",
}: VerifyRRRModalProps) {
  const [rrr, setRrr] = useState(defaultRRR);
  const [error, setError] = useState("");
  const [result, setResult] = useState<VerifyOutcome>(null);

  const { paysInternshipFee, paysCertificateFee, isLoading: loadingTrack } =
    useStudentFeeTrack();

  const { mutate: verifyInternship, isPending: pendingInternship } =
    useVerifyInternshipPayment();
  const { mutate: verifyCertificate, isPending: pendingCertificate } =
    useVerifyCertificatePayment();

  const isPending = pendingInternship || pendingCertificate;
  // Neither flag is true until the student's record resolves — verifying before
  // then could hit the wrong route entirely.
  const trackKnown = paysInternshipFee || paysCertificateFee;

  const copy = paysInternshipFee
    ? {
        title: "Verify Internship Fee Payment",
        subtitle: "Already paid? Confirm it here to unlock your placement",
        hint: "We will check your reference with Remita directly. Once confirmed, your placement form unlocks automatically.",
        unlocked: "Your placement form is now unlocked.",
      }
    : {
        title: "Verify Certificate Fee Payment",
        subtitle: "Already paid? Confirm it here to continue your request",
        hint: "We will check your reference with Remita directly. Once confirmed, you can continue your certificate request.",
        unlocked: "You can now continue your certificate request.",
      };

  const handleClose = () => {
    setRrr("");
    setError("");
    setResult(null);
    onClose?.();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleaned = rrr.trim().replace(/\s+/g, "");

    if (!cleaned) {
      setError("Please enter your Remita Retrieval Reference (RRR)");
      return;
    }
    if (cleaned.length < 8) {
      setError("An RRR is at least 8 digits");
      return;
    }
    if (!trackKnown) {
      setError("Still loading your record — please try again in a moment");
      return;
    }
    setError("");

    const onError = (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      setResult({
        success: false,
        message:
          e?.response?.data?.message ||
          "We could not confirm this payment. Please check the reference and try again.",
      });
    };

    if (paysInternshipFee) {
      verifyInternship(cleaned, {
        onSuccess: (data) =>
          setResult({ success: data?.success ?? false, message: data?.message }),
        onError,
      });
    } else {
      verifyCertificate(
        { orderId: cleaned, rrr: cleaned },
        {
          onSuccess: (data) =>
            setResult({
              success: data?.success ?? false,
              message: data?.message,
            }),
          onError,
        },
      );
    }
  };

  // ── Confirmed ───────────────────────────────────────────────────────────────
  if (result?.success) {
    return (
      <CustomModal
        isOpen={isOpen}
        onClose={handleClose}
        title="Payment Confirmed"
        subtitle="Remita has confirmed your payment"
        icon={<CheckCircle2 size={18} style={{ color: "#16a34a" }} />}
        size="default"
        footer={
          <button type="button" className="modal-submit" onClick={handleClose}>
            Done
          </button>
        }
      >
        <div className="vrr-body">
          <div className="vrr-icon vrr-icon--ok">
            <ShieldCheck size={32} />
          </div>
          <h3>Payment Confirmed</h3>
          <p className="vrr-msg">
            {result.message || copy.unlocked}
          </p>
        </div>
        <style>{`
          .vrr-body { display:flex; flex-direction:column; align-items:center; text-align:center; padding:12px 0; gap:8px; }
          .vrr-icon { width:56px; height:56px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin-bottom:4px; }
          .vrr-icon--ok { background:rgba(22,163,74,0.12); color:#16a34a; }
          .vrr-body h3 { margin:0; font-size:17px; font-weight:700; color:var(--color-text-primary); }
          .vrr-msg { margin:0; font-size:13px; color:var(--color-text-muted); line-height:1.5; }
        `}</style>
      </CustomModal>
    );
  }

  // ── Not confirmed ───────────────────────────────────────────────────────────
  if (result && !result.success) {
    return (
      <CustomModal
        isOpen={isOpen}
        onClose={handleClose}
        title="Not Confirmed Yet"
        subtitle="We could not confirm this payment"
        icon={<XCircle size={18} style={{ color: "#ef4444" }} />}
        size="default"
        footer={
          <>
            <button
              type="button"
              className="modal-cancel"
              onClick={() => setResult(null)}
            >
              Try Again
            </button>
            <button type="button" className="modal-submit" onClick={handleClose}>
              Close
            </button>
          </>
        }
      >
        <div className="vrr-body">
          <div className="vrr-icon vrr-icon--bad">
            <XCircle size={32} />
          </div>
          <h3>Not Confirmed Yet</h3>
          <p className="vrr-msg">{result.message}</p>
          <div className="vrr-note">
            Reference checked:{" "}
            <strong style={{ color: "var(--color-text-primary)" }}>{rrr}</strong>
            <br />
            Bank transfers can take a few minutes to reflect. If you have been
            debited and this keeps failing, contact the SIWES office with this
            reference.
          </div>
        </div>
        <style>{`
          .vrr-body { display:flex; flex-direction:column; align-items:center; text-align:center; padding:12px 0; gap:8px; }
          .vrr-icon { width:56px; height:56px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin-bottom:4px; }
          .vrr-icon--bad { background:rgba(239,68,68,0.1); color:#ef4444; }
          .vrr-body h3 { margin:0; font-size:17px; font-weight:700; color:var(--color-text-primary); }
          .vrr-msg { margin:0; font-size:13px; color:var(--color-text-muted); line-height:1.5; }
          .vrr-note { width:100%; margin-top:6px; padding:10px 14px; text-align:left; background:rgba(239,68,68,0.06); border:1px solid rgba(239,68,68,0.2); border-left:4px solid #ef4444; border-radius:8px; font-size:12.5px; line-height:1.5; color:var(--color-text-secondary); }
        `}</style>
      </CustomModal>
    );
  }

  // ── Entry form ──────────────────────────────────────────────────────────────
  return (
    <CustomModal
      isOpen={isOpen}
      onClose={handleClose}
      title={copy.title}
      subtitle={copy.subtitle}
      icon={<ShieldCheck size={18} />}
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
            form="student-verify-rrr-form"
            className="modal-submit"
            disabled={isPending || loadingTrack || !rrr.trim()}
          >
            {isPending ? <Spinner size={14} color="#fff" /> : "Verify Payment"}
          </button>
        </>
      }
    >
      <form id="student-verify-rrr-form" onSubmit={handleSubmit}>
        <div className="form-group" style={{ marginBottom: 16 }}>
          <label className="modal-label">
            Remita Retrieval Reference (RRR) <span className="req">*</span>
          </label>
          <input
            type="text"
            inputMode="numeric"
            className={`modal-input${error ? " vrr-input-error" : ""}`}
            value={rrr}
            onChange={(e) => {
              setRrr(e.target.value);
              if (error) setError("");
            }}
            placeholder="e.g. 120008472910"
            disabled={isPending}
            autoFocus
          />
          {error && <span className="vrr-field-error">{error}</span>}
        </div>
        <p className="vrr-hint">{copy.hint}</p>
      </form>
      <style>{`
        .vrr-input-error { border-color:#ef4444 !important; }
        .vrr-field-error { display:block; margin-top:4px; font-size:12px; color:#ef4444; }
        .vrr-hint { margin:0; font-size:12.5px; line-height:1.45; color:var(--color-text-muted); }
      `}</style>
    </CustomModal>
  );
}
