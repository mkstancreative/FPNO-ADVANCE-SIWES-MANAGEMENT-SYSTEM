import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  BookOpen,
  AlertTriangle,
  Calendar,
  Layers,
  Lightbulb,
  Target,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Clock,
  Star,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  useReviewLogbookByToken,
  useApproveLogbook,
  useRejectLogbook,
  useRequestRevisionLogbook,
} from "../../hooks/useIndustrySupervisor";
import {
  ISRShell,
  ISRLoadingState,
  ISRErrorState,
  ISRUsedState,
  ISRDoneState,
  ISRStarRating,
  ISRFraudCheck,
  ISRStudentBanner,
  ISRSection,
} from "../../components/industry-supervisor";
import type {
  ISTokenReviewData,
  ISLogbookActivity,
} from "../../api/types/industrySupervisor";
import "./SupervisorReview.css";
import { formatDate } from "../../helpers/utilities";

// ── Helpers ─────────────────────────────────────────────────────────────────
function initials(reg: string) {
  return reg.slice(0, 2).toUpperCase();
}

// ── Activity Row ─────────────────────────────────────────────────────────────

function ActivityRow({ activity }: { activity: ISLogbookActivity }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`isr-activity ${open ? "isr-activity--open" : ""}`}>
      <button
        className="isr-activity-header"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="isr-activity-left">
          <span className="isr-activity-date">{formatDate(activity.date)}</span>
          <span className="isr-activity-title">{activity.activity}</span>
        </div>
        <div className="isr-activity-right">
          <span className="isr-hrs-chip">{activity.hoursSpent}h</span>
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>
      {open && (
        <div className="isr-activity-body">
          <p className="isr-prose">{activity.description}</p>
          <div className="isr-skills-row">
            {activity.skillsUsed.map((s) => (
              <span key={s} className="isr-skill-chip">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Little stat helper ────────────────────────────────────────────────────────

function CalStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="isr-stat-inner">
      <div className="isr-stat-label">
        {icon}
        {label}
      </div>
      <div className="isr-stat-value">{value}</div>
    </div>
  );
}

// ── Main Review View ─────────────────────────────────────────────────────────

function ReviewView({
  token,
  data,
  onDone,
}: {
  token: string;
  data: ISTokenReviewData;
  onDone: (
    action: "approved" | "rejected" | "need_revision",
    name: string,
  ) => void;
}) {
  const { logbook, student, supervisorEmail, tokenExpiresAt } = data;

  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState("");
  const [formError, setFormError] = useState("");

  const approve = useApproveLogbook(token);
  const reject = useRejectLogbook(token);
  const requestRevision = useRequestRevisionLogbook(token);

  const handleSubmit = async (
    submitAction: "approve" | "reject" | "need_revision",
  ) => {
    if (rating === 0) {
      setFormError("Please select a rating before submitting.");
      return;
    }
    if (!comments.trim()) {
      setFormError("Please add a comment before submitting.");
      return;
    }
    setFormError("");

    const payload = { rating, comments };
    if (submitAction === "approve") {
      const res = await approve.mutateAsync(payload);
      if (res.success) onDone("approved", res.data.studentName);
    } else if (submitAction === "reject") {
      const res = await reject.mutateAsync(payload);
      if (res.success) onDone("rejected", res.data.studentName);
    } else {
      const res = await requestRevision.mutateAsync(payload);
      if (res.success) onDone("need_revision", res.data.studentName);
    }
  };

  const isPending =
    approve.isPending || reject.isPending || requestRevision.isPending;

  const totalHours = logbook.activities.reduce(
    (sum, a) => sum + a.hoursSpent,
    0,
  );

  return (
    <ISRShell>
      <div className="isr-page">
        {/* ── Student banner ── */}
        <ISRStudentBanner
          initials={initials(student.registrationNumber)}
          name={`${student.registrationNumber} (Student)`}
          department={student.department?.name ?? ""}
          program={`${student.program?.type ?? ""} ${student.program?.level ?? ""}`.trim()}
          position={student.placement?.position ?? ""}
          placementDept={student.placement?.department}
          evaluatorEmail={supervisorEmail}
          expiresAt={tokenExpiresAt}
        />

        {/* ── Stat row ── */}
        <div className="isr-stats">
          <div className="isr-stat">
            <CalStat
              icon={<Calendar size={14} />}
              label="Week"
              value={String(logbook.weekNumber)}
            />
          </div>
          <div className="isr-stat">
            <CalStat
              icon={<Clock size={14} />}
              label="Total Hours"
              value={`${totalHours}h`}
            />
          </div>
          <div className="isr-stat">
            <CalStat
              icon={<Calendar size={14} />}
              label="Period"
              value={`${formatDate(logbook.weekStartDate)} – ${formatDate(logbook.weekEndDate)}`}
            />
          </div>
          <div className="isr-stat">
            <CalStat
              icon={<Layers size={14} />}
              label="Status"
              value={
                logbook.status.charAt(0).toUpperCase() + logbook.status.slice(1)
              }
            />
          </div>
        </div>

        {/* ── Activities ── */}
        <ISRSection
          title={`Week ${logbook.weekNumber}: ${logbook.title}`}
          icon={<BookOpen size={15} />}
        >
          <div className="isr-activities">
            {logbook.activities.map((a) => (
              <ActivityRow key={a._id} activity={a} />
            ))}
          </div>
        </ISRSection>

        {/* ── Challenges + Lessons ── */}
        <ISRSection
          title="Challenges Faced"
          icon={<AlertTriangle size={15} />}
          defaultOpen={false}
        >
          <p className="isr-prose" style={{ padding: 0 }}>
            {logbook.challengesFaced}
          </p>
        </ISRSection>
        <ISRSection
          title="Lessons Learned"
          icon={<Lightbulb size={15} />}
          defaultOpen={false}
        >
          <p className="isr-prose" style={{ padding: 0 }}>
            {logbook.lessonsLearned}
          </p>
        </ISRSection>

        {/* ── Next week plan ── */}
        <ISRSection
          title="Next Week Plan"
          icon={<Target size={15} />}
          defaultOpen={false}
        >
          <p className="isr-prose" style={{ padding: 0 }}>
            {logbook.nextWeekPlan}
          </p>
        </ISRSection>

        {/* ── AI Fraud Check ── */}
        <ISRFraudCheck logbookId={logbook._id} />

        {/* ── Review Action Panel ── */}
        <ISRSection title="Your Review" icon={<Star size={15} />}>
          <div className="isr-field">
            <label className="isr-label">Rating *</label>
            <ISRStarRating value={rating} onChange={setRating} />
          </div>

          <div className="isr-field">
            <label className="isr-label">
              Comments *{" "}
              <span className="isr-char-count">({comments.length}/500)</span>
            </label>
            <textarea
              className="isr-textarea"
              rows={4}
              maxLength={500}
              placeholder="Provide feedback on the student's performance this week…"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </div>

          {formError && (
            <div className="isr-form-error">
              <AlertTriangle size={13} /> {formError}
            </div>
          )}

          <div className="isr-action-row">
            <button
              className="isr-btn isr-btn--approve"
              onClick={() => handleSubmit("approve")}
              disabled={isPending}
            >
              {approve.isPending ? (
                <>
                  <span className="isr-spinner-sm" /> Approving…
                </>
              ) : (
                <>
                  <ThumbsUp size={15} /> Approve Logbook
                </>
              )}
            </button>
            <button
              className="isr-btn isr-btn--revision"
              onClick={() => handleSubmit("need_revision")}
              disabled={isPending}
            >
              {requestRevision.isPending ? (
                <>
                  <span className="isr-spinner-sm" /> Requesting…
                </>
              ) : (
                <>
                  <RotateCcw size={15} /> Need Revision
                </>
              )}
            </button>
            <button
              className="isr-btn isr-btn--reject"
              onClick={() => handleSubmit("reject")}
              disabled={isPending}
            >
              {reject.isPending ? (
                <>
                  <span className="isr-spinner-sm" /> Rejecting…
                </>
              ) : (
                <>
                  <ThumbsDown size={15} /> Reject Logbook
                </>
              )}
            </button>
          </div>
        </ISRSection>
      </div>
    </ISRShell>
  );
}

// ── Root Page ─────────────────────────────────────────────────────────────────

export default function SupervisorReview() {
  const { token: tokenParam = "" } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const token = tokenParam || searchParams.get("token") || "";

  const { data, isLoading, isError, error } = useReviewLogbookByToken(token);

  const [doneState, setDoneState] = useState<{
    action: "approved" | "rejected" | "need_revision";
    studentName: string;
  } | null>(null);

  // ── No token in URL ───────────────────────────────────────────────────────
  if (!token) {
    return <ISRErrorState message="No review token found in the URL." />;
  }

  // ── Done (after approve / reject) ─────────────────────────────────────────
  if (doneState) {
    return (
      <ISRDoneState
        action={doneState.action}
        studentName={doneState.studentName}
      />
    );
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) return <ISRLoadingState />;

  // ── Error — check for "already used" payload ──────────────────────────────
  if (isError || !data?.success) {
    const e = error as {
      response?: {
        data?: {
          status?: string;
          message?: string;
          usedAt?: string;
          action?: string;
        };
      };
    } | null;
    const errData = e?.response?.data;

    if (errData?.status === "used") {
      return (
        <ISRUsedState
          usedAt={errData.usedAt ?? ""}
          action={
            (errData.action as "approved" | "rejected" | "need_revision") ??
            "approved"
          }
        />
      );
    }

    return (
      <ISRErrorState
        message={
          errData?.message ??
          "This link is invalid or has expired. Please contact the school for a new link."
        }
      />
    );
  }

  // ── Success — show logbook review ─────────────────────────────────────────
  return (
    <ReviewView
      token={token}
      data={data.data}
      onDone={(action, studentName) => setDoneState({ action, studentName })}
    />
  );
}
