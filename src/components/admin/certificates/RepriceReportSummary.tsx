import { AlertTriangle, CheckCircle2, RefreshCcw, XCircle } from "lucide-react";
import Spinner from "../../ui/Spinner/Spinner";
import { naira } from "../../../helpers/utilities";
import type {
  RepriceIssue,
  RepriceReport,
} from "../../../api/types/certificate";
import "./RepriceReportSummary.css";

interface RepriceReportSummaryProps {
  /** Partial because the add-discount endpoint merges it into its own doc. */
  report: Partial<RepriceReport> | null | undefined;
  /**
   * Offered per row on `repriceFailed`. Remita simply refused to issue a
   * replacement there, so the same call usually succeeds on a second attempt.
   */
  onRetry?: (registrationNumber: string) => void;
  retryingFor?: string | null;
}

/** A row label that still reads sensibly when the backend omits the reg. no. */
const label = (entry: RepriceIssue) =>
  entry.registrationNumber || entry.certificateId || "Unknown student";

/**
 * The shared outcome of anything that re-prices: the discount upload, adding
 * or removing one discount, and the explicit re-price call.
 *
 * The counts matter operationally, not just cosmetically — `alreadyPaid` is
 * money that has to be refunded by hand, and `repriceFailed` leaves a student
 * holding a reference at the wrong price.
 */
export default function RepriceReportSummary({
  report,
  onRetry,
  retryingFor,
}: RepriceReportSummaryProps) {
  if (!report) return null;

  const repriced = report.repriced ?? [];
  const alreadyPaid = report.alreadyPaid ?? [];
  const repriceFailed = report.repriceFailed ?? [];
  const unchanged = report.unchanged ?? 0;

  const nothingHappened =
    repriced.length === 0 &&
    alreadyPaid.length === 0 &&
    repriceFailed.length === 0;

  return (
    <div className="rr-summary">
      <div className="rr-stats">
        <Stat
          tone="ok"
          value={repriced.length}
          label="Re-priced"
          hint="New reference issued, student notified"
        />
        <Stat
          tone="warn"
          value={alreadyPaid.length}
          label="Already paid"
          hint="Refund decision needed"
        />
        <Stat
          tone="bad"
          value={repriceFailed.length}
          label="Failed"
          hint="Old reference still works"
        />
        <Stat
          tone="muted"
          value={unchanged}
          label="Unchanged"
          hint="Already at the right price"
        />
      </div>

      {nothingHappened && (
        <p className="rr-empty">
          {unchanged > 0
            ? "Every invoice was already at the right price — nothing to correct."
            : "No invoices needed re-pricing."}
        </p>
      )}

      {repriced.length > 0 && (
        <Section
          icon={<CheckCircle2 size={14} />}
          tone="ok"
          title={`Re-priced (${repriced.length})`}
          note="A new RRR was issued for each. The student has been notified automatically and told to discard the old invoice."
        >
          {repriced.map((item) => (
            <div className="rr-row" key={item.certificateId || item.newRRR}>
              <span className="rr-reg">{item.registrationNumber}</span>
              <span className="rr-move">
                <s>{naira(item.from)}</s> → <strong>{naira(item.to)}</strong>
              </span>
              <span className="rr-rrr" title={`was ${item.oldRRR}`}>
                {item.newRRR}
              </span>
            </div>
          ))}
        </Section>
      )}

      {alreadyPaid.length > 0 && (
        <Section
          icon={<AlertTriangle size={14} />}
          tone="warn"
          title={`Already paid (${alreadyPaid.length})`}
          note="Money was already in, so these were never re-priced. They need a manual refund decision and also appear in Refunds & Balances."
        >
          {alreadyPaid.map((item, i) => (
            <div className="rr-row" key={item.certificateId || i}>
              <span className="rr-reg">{label(item)}</span>
              <span className="rr-move">
                {item.from != null || item.to != null ? (
                  <>
                    paid {naira(item.from)} · owes {naira(item.to)}
                  </>
                ) : (
                  (item.message ?? item.reason ?? "Payment already completed")
                )}
              </span>
            </div>
          ))}
        </Section>
      )}

      {repriceFailed.length > 0 && (
        <Section
          icon={<XCircle size={14} />}
          tone="bad"
          title={`Failed (${repriceFailed.length})`}
          note="Remita would not issue a replacement. The student's existing reference still works, and retrying is safe."
        >
          {repriceFailed.map((item, i) => {
            const reg = item.registrationNumber;
            return (
              <div className="rr-row" key={item.certificateId || i}>
                <span className="rr-reg">{label(item)}</span>
                <span className="rr-move">
                  {item.error ?? item.message ?? item.reason ?? "Re-price failed"}
                </span>
                {onRetry && reg && (
                  <button
                    type="button"
                    className="rr-retry"
                    onClick={() => onRetry(reg)}
                    disabled={retryingFor === reg}
                  >
                    {retryingFor === reg ? (
                      <Spinner size={11} color="currentColor" text="" />
                    ) : (
                      <>
                        <RefreshCcw size={11} /> Retry
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </Section>
      )}
    </div>
  );
}

function Stat({
  value,
  label,
  hint,
  tone,
}: {
  value: number;
  label: string;
  hint: string;
  tone: "ok" | "warn" | "bad" | "muted";
}) {
  return (
    <div className={`rr-stat rr-stat--${tone}`}>
      <div className="rr-stat-value">{value}</div>
      <div className="rr-stat-label">{label}</div>
      <div className="rr-stat-hint">{hint}</div>
    </div>
  );
}

function Section({
  icon,
  title,
  note,
  tone,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  note: string;
  tone: "ok" | "warn" | "bad";
  children: React.ReactNode;
}) {
  return (
    <div className={`rr-section rr-section--${tone}`}>
      <div className="rr-section-head">
        {icon}
        <span>{title}</span>
      </div>
      <p className="rr-section-note">{note}</p>
      <div className="rr-rows">{children}</div>
    </div>
  );
}
