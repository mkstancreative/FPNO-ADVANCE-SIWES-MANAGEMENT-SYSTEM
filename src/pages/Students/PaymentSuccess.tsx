import React, { useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, ArrowRight } from "lucide-react";
import { useVerifyCertificatePayment } from "../../hooks/useCertificate";
import { useVerifyInternshipPayment } from "../../hooks/useInternshipPayment";
import Spinner from "../../components/ui/Spinner/Spinner";
import { toast } from "react-toastify";
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

    const onSuccess = (res: { success: boolean }) => {
      if (res.success) toast.success("Payment verified successfully!");
    };
    const onError = () => {
      toast.error("Verification failed. Please contact support.");
    };

    if (flow === "internship") {
      verifyInternship(verifyId, { onSuccess, onError });
    } else {
      verifyCertificate(
        { orderId: verifyId, rrr: verifyId },
        { onSuccess, onError },
      );
    }
  }, [searchParams, flow, verifyCertificate, verifyInternship]);

  const copy = COPY[flow];
  const destination =
    flow === "internship" ? "/student/placement" : "/student/dashboard";

  return (
    <div className="payment-status-container">
      <div className="payment-status-card success">
        <div className="status-icon-wrapper">
          <CheckCircle size={48} />
        </div>
        <h1>Payment Successful!</h1>
        <p>{copy.body}</p>

        {isPending ? (
          <div className="verifying-status">
            <Spinner size={24} color="var(--color-accent)" />
            <span>{copy.pending}</span>
          </div>
        ) : (
          <div className="status-action-footer">
            <Link to={destination} className="btn-status-primary">
              {copy.cta} <ArrowRight size={18} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
