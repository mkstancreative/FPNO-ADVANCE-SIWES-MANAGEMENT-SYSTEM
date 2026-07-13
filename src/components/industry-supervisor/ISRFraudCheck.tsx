import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { useLogbookFraudCheck } from "../../hooks/useIndustrySupervisor";
import { ISRSection } from "./ISRSection";
import AddButton from "../ui/AddButton/AddButton";

interface FraudCheckProps {
  logbookId: string;
}

export function ISRFraudCheck({ logbookId }: FraudCheckProps) {
  const {
    mutateAsync: runCheck,
    isPending,
    data: result,
  } = useLogbookFraudCheck();

  const fraud = result?.data;

  const headerAction = !fraud ? (
    <AddButton 
    text="Run Checker"
    icon={<AlertTriangle size={15} />}
    onClick={(e) => {
        e.stopPropagation();
        runCheck(logbookId);
      }}
      disabled={isPending}
      loading={isPending}
    />
  ) : (
    <div
      className={`isr-fraud-status ${
        fraud.passed ? "isr-fraud-status--passed" : "isr-fraud-status--failed"
      }`}
    >
      {fraud.passed ? (
        <>
          <CheckCircle size={14} /> Pass
        </>
      ) : (
        <>
          <XCircle size={14} /> Fail
        </>
      )}
      <span className="isr-fraud-score">{fraud.fraudScore}%</span>
    </div>
  );

  return (
    <ISRSection
      title="Logbook Compliance Checker"
      icon={<AlertTriangle size={15} />}
      className={`isr-fraud-panel ${
        fraud
          ? fraud.passed
            ? "isr-fraud-panel--passed"
            : "isr-fraud-panel--failed"
          : ""
      }`}
      headerAction={headerAction}
      defaultOpen={!!fraud}
    >
      {fraud && (
        <div className="isr-fraud-body">
          <p className="isr-fraud-message">{result.message}</p>

          {fraud.flags.length > 0 && (
            <div className="isr-flags-list">
              {fraud.flags.map((flag, idx) => (
                <div key={idx} className="isr-flag-item">
                  <AlertTriangle size={14} className="isr-flag-icon" />
                  <div className="isr-flag-content">
                    <span className="isr-flag-reason">{flag.reason}</span>
                    <span className="isr-flag-confidence">
                      Confidence: {flag.confidence}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!fraud.passed && (
            <div
              className="isr-form-error"
              style={{ marginTop: 8, background: "#fff5f5" }}
            >
              <AlertTriangle size={14} />
              <span>
                High fraud score detected. Please review the Daily Activities
                carefully for AI-generated patterns or copied content.
              </span>
            </div>
          )}
        </div>
      )}
      {!fraud && (
        <p className="isr-prose" style={{ padding: "0 4px" }}>
          Run the Logbook Compliance Checker to check the student's logbook for
          suspicious patterns or AI-generated content.
        </p>
      )}
    </ISRSection>
  );
}
