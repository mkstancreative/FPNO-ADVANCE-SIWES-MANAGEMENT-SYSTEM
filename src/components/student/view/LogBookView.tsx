import CustomModal from "../../ui/CustomModal/CustomModal";
import {
  useLogBookById,
  useSubmitLogBook,
  useRequestLogbookApproval,
} from "../../../hooks/useLogBooks";
import type { LogBookListItem, LogBook } from "../../../api/types/logbook";
import {
  BookOpen,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Send,
  RotateCcw,
  Star,
} from "lucide-react";
import { formatDate } from "../../../helpers/utilities";
import "./LogBookView.css";

interface LogBookViewProps {
  isOpen: boolean;
  onClose: () => void;
  logbook: LogBookListItem;
}

export default function LogBookView({
  isOpen,
  onClose,
  logbook,
}: LogBookViewProps) {
  const { data, isLoading } = useLogBookById(logbook._id);
  const entry = data?.data;

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Week ${logbook.weekNumber} — ${logbook.title}`}
      subtitle="View your weekly log book entry"
      icon={<BookOpen size={16} />}
      size="wide"
      isLoading={isLoading}
    >
      {!isLoading && (
        <LogBookViewInner
          entry={entry}
          status={logbook.status}
          id={logbook._id}
          onClose={onClose}
        />
      )}
    </CustomModal>
  );
}

// ─── Inner content — receives fully loaded entry ──────────────────────────────

function LogBookViewInner({
  entry,
  status,
  id,
  onClose,
}: {
  entry: LogBook | undefined;
  status: string;
  id: string;
  onClose: () => void;
}) {
  const { mutate: submit, isPending: submitting } = useSubmitLogBook();
  const { mutate: requestApproval, isPending: requesting } =
    useRequestLogbookApproval();

  const isActionPending = submitting || requesting;

  if (!entry) {
    return (
      <div className="lbv-error">
        <AlertCircle size={28} />
        <span>Could not load log book details.</span>
      </div>
    );
  }

  // Direct cast — entry is now typed as LogBook after the null guard above
  const e = entry as LogBook;

  const statusMeta: Record<string, { label: string; cls: string }> = {
    draft: { label: "Draft", cls: "draft" },
    submitted: { label: "Submitted", cls: "submitted" },
    approved: { label: "Approved", cls: "approved" },
    rejected: { label: "Rejected", cls: "rejected" },
    needs_revision: { label: "Needs Revision", cls: "needs-revision" },
  };
  const sm = statusMeta[e.status] ?? { label: e.status, cls: "draft" };

  return (
    <div className="lbv-root">
      {/* ── Meta bar ── */}
      <div className="lbv-meta-bar">
        <div className="lbv-meta-item">
          <Calendar size={13} />
          <span>
            {e.weekStartDate
              ? `${formatDate(e.weekStartDate)} – ${formatDate(e.weekEndDate ?? e.weekStartDate)}`
              : "—"}
          </span>
        </div>
        <div className="lbv-meta-item">
          <Clock size={13} />
          <span>{e.totalHours ?? 0} hours</span>
        </div>
        <span className={`lbv-status ${sm.cls}`}>{sm.label}</span>
      </div>

      {/* ── Activities ── */}
      <div className="lbv-section">
        <h4 className="lbv-section-title">
          Daily Activities ({e.activities.length})
        </h4>
        <div className="lbv-activities">
          {e.activities.map((act, i) => (
            <div key={act._id ?? i} className="lbv-activity-card">
              <div className="lbv-activity-top">
                <div className="lbv-activity-left">
                  <span className="lbv-day-badge">
                    {(() => {
                      if (act.dayOfWeek) return act.dayOfWeek;
                      if (!act.date) return "Day";
                      const dateStr = act.date.slice(0, 10);
                      const [y, m, d] = dateStr.split("-");
                      const dateObj = new Date(
                        Number(y),
                        Number(m) - 1,
                        Number(d),
                      );
                      return !isNaN(dateObj.getTime())
                        ? dateObj.toLocaleDateString("en-US", {
                            weekday: "long",
                          })
                        : "Day";
                    })()}
                  </span>
                  <span className="lbv-activity-name">{act.activity}</span>
                </div>
                <div className="lbv-activity-right">
                  <span className="lbv-hrs">
                    <Clock size={11} /> {act.hoursSpent}h
                  </span>
                  <span className="lbv-date">
                    {act.date ? formatDate(act.date) : "—"}
                  </span>
                </div>
              </div>
              <div
                className="lbv-desc"
                dangerouslySetInnerHTML={{ __html: act.description }}
              />
              {act.skillsUsed.length > 0 && (
                <div className="lbv-skills">
                  {act.skillsUsed.map((s) => (
                    <span key={s} className="lbv-skill-chip">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Reflections ── */}
      {(e.challengesFaced || e.lessonsLearned || e.nextWeekPlan) && (
        <div className="lbv-section">
          <h4 className="lbv-section-title">Weekly Reflections</h4>
          <div className="lbv-reflections">
            {e.challengesFaced && (
              <ReflectionBlock
                label="Challenges Faced"
                text={e.challengesFaced}
                color="orange"
              />
            )}
            {e.lessonsLearned && (
              <ReflectionBlock
                label="Lessons Learned"
                text={e.lessonsLearned}
                color="green"
              />
            )}
            {e.nextWeekPlan && (
              <ReflectionBlock
                label="Next Week's Plan"
                text={e.nextWeekPlan}
                color="blue"
              />
            )}
          </div>
        </div>
      )}

      {/* ── Industrial Review ── */}
      {e.industrialReview?.comments && (
        <div className="lbv-section">
          <h4 className="lbv-section-title">Industrial Supervisor's Review</h4>
          <div className="lbv-review-card industrial">
            <StarRating value={e.industrialReview.rating ?? undefined} />
            <div
              className="lbv-review-text"
              dangerouslySetInnerHTML={{
                __html: `"${e.industrialReview.comments}"`,
              }}
            />
            <div className="lbv-review-footer">
              <span className="lbv-reviewer">Industrial Supervisor</span>
              {e.industrialReview.reviewedAt && (
                <span className="lbv-review-date">
                  {formatDate(e.industrialReview.reviewedAt)}
                  {e.industrialReview.approvalMethod &&
                    ` via ${e.industrialReview.approvalMethod.replace("_", " ")}`}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── School Review ── */}
      {e.schoolReview?.comments && (
        <div className="lbv-section">
          <h4 className="lbv-section-title">School Supervisor's Review</h4>
          <div className="lbv-review-card school">
            <div
              className="lbv-review-text"
              dangerouslySetInnerHTML={{
                __html: `"${e.schoolReview.comments}"`,
              }}
            />
            <div className="lbv-review-footer">
              <span className="lbv-reviewer">Institution Supervisor</span>
              {e.schoolReview.reviewedAt && (
                <span className="lbv-review-date">
                  {formatDate(e.schoolReview.reviewedAt)}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Reviewer feedback banner (rejected / needs revision) ── */}
      {(e.status === "rejected" || e.status === "needs_revision") &&
        e.industrialReview?.comments && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              padding: "12px 14px",
              borderRadius: 10,
              background:
                e.status === "rejected"
                  ? "rgba(239,68,68,.07)"
                  : "rgba(245,158,11,.07)",
              border:
                e.status === "rejected"
                  ? "1px solid rgba(239,68,68,.2)"
                  : "1px solid rgba(245,158,11,.2)",
              color: e.status === "rejected" ? "#dc2626" : "#b45309",
              fontSize: 13,
              marginBottom: 4,
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <span style={{ fontWeight: 700 }}>Supervisor Feedback: </span>
              {e.industrialReview?.comments}
            </div>
          </div>
        )}

      {/* ── Actions ── */}
      <div className="modal-actions">
        <button
          type="button"
          className="modal-cancel"
          onClick={onClose}
          disabled={isActionPending}
        >
          Close
        </button>

        {/* Submit for review — draft only */}
        {status === "draft" && (
          <button
            type="button"
            className="modal-submit lbv-submit-btn"
            disabled={isActionPending}
            onClick={() => submit(id, { onSuccess: onClose })}
          >
            {submitting ? (
              "Submitting…"
            ) : (
              <>
                <Send size={13} /> Submit for Review
              </>
            )}
          </button>
        )}

        {/* Request approval — rejected or needs_revision */}
        {(status === "rejected" || status === "needs_revision") && (
          <button
            type="button"
            className="modal-submit lbv-submit-btn"
            disabled={isActionPending}
            style={{
              background:
                status === "rejected"
                  ? "linear-gradient(135deg,#f43f5e,#e11d48)"
                  : "linear-gradient(135deg,#f59e0b,#d97706)",
            }}
            onClick={() => requestApproval(id, { onSuccess: onClose })}
          >
            {requesting ? (
              "Requesting…"
            ) : (
              <>
                <RotateCcw size={13} />
                {status === "rejected"
                  ? "Rejected By Supervisor"
                  : "Request Re-evaluation"}
              </>
            )}
          </button>
        )}

        {/* Approved note */}
        {status === "approved" && (
          <span className="lbv-approved-note">
            <CheckCircle2 size={14} />
            Approved by supervisor
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Shared helper ────────────────────────────────────────────────────────────

function ReflectionBlock({
  label,
  text,
  color,
}: {
  label: string;
  text: string;
  color: "orange" | "green" | "blue";
}) {
  return (
    <div className={`lbv-reflection reflection-${color}`}>
      <div className="lbv-reflection-label">{label}</div>
      <div
        className="lbv-reflection-text"
        dangerouslySetInnerHTML={{ __html: text }}
      />
    </div>
  );
}

function StarRating({ value }: { value?: number }) {
  if (!value) return null;
  return (
    <div className="lbv-stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          fill={i < value ? "#f59e0b" : "transparent"}
          color={i < value ? "#f59e0b" : "#cbd5e1"}
        />
      ))}
      <span className="lbv-stars-val">{value}/5</span>
    </div>
  );
}
