import React, { useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, ArrowRight } from "lucide-react";
import { useVerifyCertificatePayment } from "../../hooks/useCertificate";
import Spinner from "../../components/ui/Spinner/Spinner";
import { toast } from "react-toastify";
import "./paymentStatus.css";

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();

  const { mutate: verify, isPending } = useVerifyCertificatePayment();

  useEffect(() => {
    const verifyId =
      searchParams.get("orderId") ||
      searchParams.get("RRR") ||
      searchParams.get("rrr");

    if (
      verifyId &&
      verifyId !== "undefined" &&
      verifyId !== "null" &&
      verifyId !== "Pending"
    ) {
      verify(
        { orderId: verifyId, rrr: verifyId }, // Send it as both if we're not sure which one we got
        {
          onSuccess: (res) => {
            if (res.success) {
              toast.success("Payment verified successfully!");
            }
          },
          onError: () => {
            toast.error("Verification failed. Please contact support.");
          },
        },
      );
    }
  }, [searchParams, verify]);

  return (
    <div className="payment-status-container">
      <div className="payment-status-card success">
        <div className="status-icon-wrapper">
          <CheckCircle size={48} />
        </div>
        <h1>Payment Successful!</h1>
        <p>
          Your certificate payment has been received and confirmed. You can now
          track your application from your student dashboard.
        </p>

        {isPending ? (
          <div className="verifying-status">
            <Spinner size={24} color="var(--color-accent)" />
            <span>Finalizing your certificate request...</span>
          </div>
        ) : (
          <div className="status-action-footer">
            <Link to="/student/dashboard" className="btn-status-primary">
              View Certificate Status <ArrowRight size={18} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
