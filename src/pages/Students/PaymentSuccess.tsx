import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, CheckCircle, XCircle } from "lucide-react";
import {
  useVerifyCertificatePayment,
  isOutstandingBalance,
} from "../../hooks/useCertificate";
import { useVerifyInternshipPayment } from "../../hooks/useInternshipPayment";
import { getApiErrorMessage } from "../../api/services/api";
import Spinner from "../../components/ui/Spinner/Spinner";
import "./paymentStatus.css";

const PLACEHOLDERS = new Set(["undefined", "null", "Pending", ""]);

const COPY = {
  certificate: {
    body: "Your certificate payment has been received and confirmed. Upload your supporting documents from your dashboard to finish your request.",
    cta: "Upload Documents",
    pending: "Finalizing your certificate request...",
  },
  internship: {
    body: "Your internship fee has been received and confirmed. Your placement form is now unlocked.",
    cta: "Continue to Placement",
    pending: "Finalizing your internship payment...",
  },
} as const;

/**
 * What the verification actually said.
 *
 * "balance" is its own outcome on purpose. A certificate invoice can be
 * re-priced after its RRR was issued, and the superseded reference stays
 * payable at any bank — so a student can pay a real, cheaper invoice and come
 * back here with money received but a balance still owed. That is not a failed
 * payment and must never be shown as one.
 */
type Outcome =
  | { kind: "ok"; message?: string; overpaid?: number }
  | { kind: "balance"; message: string }
  | { kind: "failed"; message: string };

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();

  // `flow` is set by the return URL the payment modal builds. Older links have
  // no flow at all, and those were always certificate payments.
  const flow =
    searchParams.get("flow") === "internship" ? "internship" : "certificate";

  const { mutate: verifyCertificate, isPending: verifyingCertificate } =
    useVerifyCertificatePayment();
  const { mutate: verifyInternship, isPending: verifyingInternship } =
    useVerifyInternshipPayment();

  const isPending = verifyingCertificate || verifyingInternship;
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  // Remita can bounce the browser back here more than once; verify only once.
  const verified = useRef(false);

  useEffect(() => {
    if (verified.current) return;

    const verifyId =
      searchParams.get("rrr") ||
      searchParams.get("RRR") ||
      searchParams.get("orderId");

    if (!verifyId || PLACEHOLDERS.has(verifyId)) return;
    verified.current = true;

    const onError = (error: unknown) => {
      setOutcome({
        // The backend explains the shortfall far better than fixed copy can.
        kind: isOutstandingBalance(error) ? "balance" : "failed",
        message: getApiErrorMessage(
          error,
          "We could not confirm this payment. Please contact the SIWES office.",
        ),
      });
    };

    if (flow === "internship") {
      verifyInternship(verifyId, {
        onSuccess: (res: { success?: boolean; message?: string }) =>
          setOutcome(
            res?.success
              ? { kind: "ok", message: res.message }
              : {
                  kind: "failed",
                  message: res?.message || "Payment not successful",
                },
          ),
        onError,
      });
    } else {
      verifyCertificate(
        { orderId: verifyId, rrr: verifyId },
        {
          onSuccess: (res) =>
            setOutcome(
              res?.success
                ? {
                    kind: "ok",
                    message: res.message,
                    overpaid: res.data?.overpaid,
                  }
                : {
                    kind: "failed",
                    message: res?.message || "Payment not successful",
                  },
            ),
          onError,
        },
      );
    }
  }, [searchParams, flow, verifyCertificate, verifyInternship]);

  const copy = COPY[flow];
  const destination =
    flow === "internship" ? "/student/placement" : "/student/dashboard";

  // ── Still checking ─────────────────────────────────────────────────────────
  if (isPending || !outcome) {
    return (
      <div className="payment-status-container">
        <div className="payment-status-card success">
          <div className="status-icon-wrapper">
            <CheckCircle size={48} />
          </div>
          <h1>Payment Received</h1>
          <p>{copy.body}</p>
          <div className="verifying-status">
            <Spinner size={24} color="var(--color-accent)" />
            <span>{copy.pending}</span>
          </div>
        </div>
      </div>
    );
  }

  // ── Money in, but short of the current fee ─────────────────────────────────
  if (outcome.kind === "balance") {
    return (
      <div className="payment-status-container">
        <div className="payment-status-card warning">
          <div className="status-icon-wrapper">
            <AlertTriangle size={48} />
          </div>
          <h1>Balance Outstanding</h1>
          <p>{outcome.message}</p>
          <div className="ps-note ps-note--warn">
            Your payment has been received and recorded. Your certificate
            request stays open until the balance is settled — contact the SIWES
            office rather than paying the same reference again.
          </div>
          <div className="status-action-footer">
            <Link to={destination} className="btn-status-primary">
              Back to Dashboard <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Genuinely unsuccessful ─────────────────────────────────────────────────
  if (outcome.kind === "failed") {
    return (
      <div className="payment-status-container">
        <div className="payment-status-card failed">
          <div className="status-icon-wrapper">
            <XCircle size={48} />
          </div>
          <h1>Payment Not Confirmed</h1>
          <p>{outcome.message}</p>
          <div className="ps-note">
            Bank transfers can take a few minutes to reflect. If you have been
            debited, contact the SIWES office with your payment reference.
          </div>
          <div className="status-action-footer">
            <Link to={destination} className="btn-status-primary">
              Back to Dashboard <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Confirmed ──────────────────────────────────────────────────────────────
  return (
    <div className="payment-status-container">
      <div className="payment-status-card success">
        <div className="status-icon-wrapper">
          <CheckCircle size={48} />
        </div>
        <h1>Payment Successful!</h1>
        <p>{outcome.message || copy.body}</p>

        {outcome.overpaid != null && outcome.overpaid > 0 && (
          <div className="ps-note ps-note--warn">
            You paid an invoice that had since been re-priced, so you are due a
            refund of <strong>₦{outcome.overpaid.toLocaleString()}</strong>.
            Your request is paid and continues normally — the SIWES office will
            contact you about the difference.
          </div>
        )}

        <div className="status-action-footer">
          <Link to={destination} className="btn-status-primary">
            {copy.cta} <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
