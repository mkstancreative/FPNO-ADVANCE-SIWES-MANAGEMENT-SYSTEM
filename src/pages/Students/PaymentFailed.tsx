import React from "react";
import { useSearchParams, Link } from "react-router-dom";
import { XCircle, RefreshCw, Home } from "lucide-react";
import "./paymentStatus.css";

const PaymentFailed: React.FC = () => {
  const [searchParams] = useSearchParams();
  const reason =
    searchParams.get("reason") || "The payment was not successful.";

  return (
    <div className="payment-status-container">
      <div className="payment-status-card failed">
        <div className="status-icon-wrapper">
          <XCircle size={48} />
        </div>
        <h1>Payment Failed</h1>
        <p className="error-message">
          {reason === "payment_not_successful"
            ? "Your transaction could not be completed at this time."
            : reason}
        </p>
        <p>
          Don't worry, no funds were deducted from your account. You can try the
          payment again or return to the dashboard to select a different method.
        </p>

        <div className="status-action-footer">
          <Link to="/student/dashboard" className="btn-status-secondary">
            <Home size={18} /> Back to dashboard
          </Link>
          <Link to="/student/dashboard" className="btn-status-primary">
            <RefreshCw size={18} /> Try Again
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
