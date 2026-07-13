import {
  CheckCircle,
  XCircle,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
} from "lucide-react";
import { ISRShell } from "./ISRShell";
import { formatDate } from "../../helpers/utilities";

export function ISRLoadingState({ message = "Validating your review link…" }) {
  return (
    <ISRShell>
      <div className="isr-center-state">
        <span className="isr-spinner-lg" />
        <p>{message}</p>
      </div>
    </ISRShell>
  );
}

export function ISRErrorState({ message }: { message: string }) {
  return (
    <ISRShell>
      <div className="isr-center-state isr-center-state--error">
        <XCircle size={40} />
        <h2>Link Invalid or Expired</h2>
        <p>{message}</p>
      </div>
    </ISRShell>
  );
}

export function ISRUsedState({
  action,
  usedAt,
}: {
  action: "approved" | "rejected" | "need_revision";
  usedAt: string;
}) {
  return (
    <ISRShell>
      <div
        className={`isr-center-state ${
          action === "approved"
            ? "isr-center-state--success"
            : action === "need_revision"
              ? "isr-center-state--warn"
              : "isr-center-state--error"
        }`}
      >
        {action === "approved" ? (
          <CheckCircle size={40} />
        ) : action === "rejected" ? (
          <XCircle size={40} />
        ) : (
          <RotateCcw size={40} />
        )}
        <h2>Link Already Used</h2>
        <p>
          This review link was already used on <strong>{formatDate(usedAt)}</strong>.
          <br />
          The logbook was{" "}
          <strong>
            {action === "need_revision" ? "marked for revision" : action}
          </strong>
          .
        </p>
      </div>
    </ISRShell>
  );
}

export function ISRDoneState({
  action,
  studentName,
  entity = "Logbook",
}: {
  action: "approved" | "rejected" | "need_revision";
  studentName: string;
  entity?: string;
}) {
  return (
    <ISRShell>
      <div
        className={`isr-center-state ${
          action === "approved"
            ? "isr-center-state--success"
            : action === "need_revision"
              ? "isr-center-state--warn"
              : "isr-center-state--error"
        }`}
      >
        {action === "approved" ? (
          <ThumbsUp size={40} />
        ) : action === "rejected" ? (
          <ThumbsDown size={40} />
        ) : (
          <RotateCcw size={40} />
        )}
        <h2>
          {entity}{" "}
          {action === "approved"
            ? "Approved"
            : action === "rejected"
              ? "Rejected"
              : "Marked for Revision"}{" "}
          Successfully
        </h2>
        <p>
          You have{" "}
          <strong>
            {action === "need_revision" ? "requested a revision for" : action}
          </strong>{" "}
          the {entity.toLowerCase()} for <strong>{studentName}</strong>. The
          student and school will be notified.
        </p>
      </div>
    </ISRShell>
  );
}
