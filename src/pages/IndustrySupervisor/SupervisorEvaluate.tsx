import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  Star,
  Award,
  ThumbsUp,
  Clock,
  BookOpen,
  TrendingUp,
  Zap,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import {
  useEvaluationData,
  useSubmitEvaluation,
} from "../../hooks/useIndustrySupervisor";
import {
  ISRShell,
  ISRLoadingState,
  ISRErrorState,
  ISRSection,
  ISRStudentBanner,
  ISRTagInput,
} from "../../components/industry-supervisor";
import type {
  ISEvaluationPayload,
  ISEvalSummary,
} from "../../api/types/industrySupervisor";
import "./SupervisorReview.css";
import { formatDate } from "../../helpers/utilities";

// ── Constants ─────────────────────────────────────────────────────────────────

type RatingKey = keyof ISEvaluationPayload["ratings"];

const RATING_LABELS: Record<RatingKey, string> = {
  punctuality: "Punctuality & Attendance",
  teamwork: "Teamwork & Collaboration",
  technicalSkills: "Technical Skills",
  communication: "Communication",
  initiative: "Initiative & Problem Solving",
};

const RATING_MAX: Record<RatingKey, number> = {
  punctuality: 20,
  teamwork: 20,
  technicalSkills: 20,
  communication: 20,
  initiative: 20,
};

const MAX_TOTAL = Object.values(RATING_MAX).reduce((s, v) => s + v, 0);

// ── Helpers ───────────────────────────────────────────────────────────────────

function nameInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function scoreColor(pct: number): string {
  if (pct === 0) return "#cbd5e1";
  if (pct <= 25) return "#ef4444";
  if (pct <= 50) return "#f59e0b";
  if (pct <= 75) return "#06b6d4";
  return "#10b981";
}

function scoreLabel(pct: number): string {
  if (pct === 0) return "";
  if (pct <= 25) return "Poor";
  if (pct <= 50) return "Below Avg";
  if (pct <= 75) return "Good";
  return "Excellent";
}

// ── Score Slider ──────────────────────────────────────────────────────────────

function ScoreSlider({
  label,
  max,
  value,
  onChange,
  readOnly = false,
}: {
  label: string;
  max: number;
  value: number;
  onChange?: (v: number) => void;
  readOnly?: boolean;
}) {
  const pct = Math.round((value / max) * 100);
  const color = scoreColor(pct);
  const tag = scoreLabel(pct);

  return (
    <div className="isr-slider-row">
      <div className="isr-slider-header">
        <span className="isr-slider-label">{label}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {tag && (
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 99,
                background: `${color}18`,
                border: `1px solid ${color}40`,
                color,
              }}
            >
              {tag}
            </span>
          )}
          <span className="isr-slider-score" style={{ color }}>
            {value} / {max}
          </span>
        </div>
      </div>
      <div className="isr-slider-track">
        <div
          className="isr-slider-fill"
          style={
            {
              width: `${pct}%`,
              background:
                pct === 0
                  ? color
                  : `linear-gradient(90deg, ${color}cc, ${color})`,
              "--knob-color": color,
            } as React.CSSProperties
          }
        />
        {!readOnly && (
          <input
            type="range"
            min={0}
            max={max}
            value={value}
            onChange={(e) => onChange?.(Number(e.target.value))}
            className="isr-range"
            aria-label={label}
          />
        )}
      </div>
    </div>
  );
}

// ── Total Score Ring ──────────────────────────────────────────────────────────

function TotalScoreRing({ total }: { total: number }) {
  const pct = Math.round((total / MAX_TOTAL) * 100);
  const color = scoreColor(pct);
  const tag = scoreLabel(pct);
  const circumference = 2 * Math.PI * 32;
  return (
    <div className="isr-total-score">
      <div className="isr-total-ring">
        <svg viewBox="0 0 80 80" width="80" height="80">
          <circle
            cx="40"
            cy="40"
            r="32"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="8"
          />
          <circle
            cx="40"
            cy="40"
            r="32"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={`${(pct / 100) * circumference} ${circumference}`}
            strokeLinecap="round"
            transform="rotate(-90 40 40)"
            style={{
              filter: `drop-shadow(0 0 6px ${color}66)`,
              transition: "stroke 0.3s",
            }}
          />
          <text
            x="40"
            y="45"
            textAnchor="middle"
            fontSize="14"
            fontWeight="700"
            fill={color}
          >
            {total}
          </text>
        </svg>
      </div>
      <div>
        <div className="isr-total-label">Total Score</div>
        <div className="isr-total-max" style={{ color }}>
          {total} / {MAX_TOTAL} pts
        </div>
        {tag && (
          <span
            style={{
              display: "inline-flex",
              marginTop: 6,
              fontSize: 11,
              fontWeight: 700,
              padding: "3px 10px",
              borderRadius: 99,
              background: `${color}18`,
              border: `1px solid ${color}40`,
              color,
            }}
          >
            {tag}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Summary Stats Panel ───────────────────────────────────────────────────────

function SummaryPanel({ summary }: { summary: ISEvalSummary }) {
  const consistencyColor =
    summary.consistencyRate >= 80
      ? "#10b981"
      : summary.consistencyRate >= 50
        ? "#f59e0b"
        : "#ef4444";

  return (
    <ISRSection
      title="Student IT Performance Summary"
      icon={<TrendingUp size={15} />}
    >
      <div className="isr-stats" style={{ marginBottom: 14 }}>
        <div className="isr-stat">
          <div className="isr-stat-inner">
            <div className="isr-stat-label">
              <Clock size={12} /> Duration
            </div>
            <div className="isr-stat-value">{summary.itDuration}</div>
          </div>
        </div>
        <div className="isr-stat">
          <div className="isr-stat-inner">
            <div className="isr-stat-label">
              <BookOpen size={12} /> Approved Logbooks
            </div>
            <div className="isr-stat-value">
              {summary.logbooksApproved}/{summary.logbooksSubmitted}
            </div>
          </div>
        </div>
        <div className="isr-stat">
          <div className="isr-stat-inner">
            <div className="isr-stat-label">
              <Zap size={12} /> Hours Logged
            </div>
            <div className="isr-stat-value">{summary.totalHoursLogged}h</div>
          </div>
        </div>
        <div className="isr-stat">
          <div className="isr-stat-inner">
            <div className="isr-stat-label">
              <Star size={12} /> Avg Rating
            </div>
            <div className="isr-stat-value" style={{ color: "#f59e0b" }}>
              {summary.averageWeeklyRating}/5
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div className="isr-slider-header" style={{ marginBottom: 6 }}>
          <span className="isr-slider-label">Consistency Rate</span>
          <span
            style={{ fontSize: 13, fontWeight: 700, color: consistencyColor }}
          >
            {summary.consistencyRate}%
          </span>
        </div>
        <div className="isr-slider-track" style={{ height: 10 }}>
          <div
            className="isr-slider-fill"
            style={{
              width: `${summary.consistencyRate}%`,
              background: consistencyColor,
            }}
          />
        </div>
      </div>

      {summary.missedWeeks.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div className="isr-label" style={{ marginBottom: 6 }}>
            Missed Weeks
          </div>
          <div className="isr-skills-row">
            {summary.missedWeeks.map((w) => (
              <span
                key={w}
                className="isr-skill-chip"
                style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}
              >
                Week {w}
              </span>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="isr-label" style={{ marginBottom: 6 }}>
          Top Skills
        </div>
        <div className="isr-skills-row">
          {summary.topSkills.map((s) => (
            <span key={s} className="isr-skill-chip">
              {s}
            </span>
          ))}
        </div>
      </div>
    </ISRSection>
  );
}

// ── Root Page ─────────────────────────────────────────────────────────────────

export default function SupervisorEvaluate() {
  const { token: tokenParam = "" } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const token = tokenParam || searchParams.get("token") || "";
  const { data, isLoading, error } = useEvaluationData(token);
  const submit = useSubmitEvaluation(token);

  const [submitResult, setSubmitResult] = useState<{
    score?: number;
    studentName?: string;
  } | null>(null);
  const [formError, setFormError] = useState("");

  const [ratings, setRatings] = useState<ISEvaluationPayload["ratings"]>({
    punctuality: 0,
    teamwork: 0,
    technicalSkills: 0,
    communication: 0,
    initiative: 0,
  });
  const [strengths, setStrengths] = useState<string[]>([]);
  const [weaknesses, setWeaknesses] = useState<string[]>([]);
  const [comments, setComments] = useState("");
  const [wouldHire, setWouldHire] =
    useState<ISEvaluationPayload["wouldHire"]>("yes");

  if (!token) return <ISRErrorState message="No evaluation token found." />;
  if (isLoading)
    return <ISRLoadingState message="Loading evaluation data..." />;
  if (error || !data?.success)
    return <ISRErrorState message="Link invalid or already used." />;

  const {
    student,
    summary,
    supervisorEmail,
    tokenExpiresAt,
    existingEvaluation,
  } = data.data;

  if (submitResult) {
    return (
      <ISRShell tag="Evaluation Submitted">
        <div className="isr-center-state isr-center-state--success">
          <ThumbsUp size={48} />
          <h2>Evaluation Submitted!</h2>
          <p>
            Feedback for {submitResult.studentName} recorded. Score:{" "}
            {submitResult.score}/{MAX_TOTAL}
          </p>
        </div>
      </ISRShell>
    );
  }

  if (existingEvaluation) {
    return (
      <ISRShell>
        <div className="isr-page">
          <div className="isr-used-banner">
            <CheckCircle size={18} />
            <div>
              <div className="isr-used-title">Evaluation Already Submitted</div>
              <div className="isr-used-sub">
                Submitted on {formatDate(existingEvaluation.submittedAt)}
              </div>
            </div>
          </div>
          <ISRStudentBanner
            initials={nameInitials(student.name)}
            name={student.name}
            department={student.department}
            program={student.program}
            position={student.position}
            evaluatorEmail={supervisorEmail}
            expiresAt={tokenExpiresAt}
          />
          <SummaryPanel summary={summary} />
          <ISRSection title="Submitted Ratings" icon={<Star size={15} />}>
            <div className="isr-sliders">
              {(Object.keys(RATING_LABELS) as RatingKey[]).map((key) => (
                <ScoreSlider
                  key={key}
                  label={RATING_LABELS[key]}
                  max={RATING_MAX[key]}
                  value={existingEvaluation.ratings[key]}
                  readOnly
                />
              ))}
            </div>
            <TotalScoreRing total={existingEvaluation.totalScore} />
          </ISRSection>
          <div className="isr-card">
            <div className="isr-card-header">
              <Award size={15} /> Comments
            </div>
            <p className="isr-prose">{existingEvaluation.comments}</p>
          </div>
        </div>
      </ISRShell>
    );
  }

  const totalScore = Object.values(ratings).reduce((s, v) => s + v, 0);

  return (
    <ISRShell>
      <div className="isr-page">
        <ISRStudentBanner
          initials={nameInitials(student.name)}
          name={student.name}
          department={student.department}
          program={student.program}
          position={student.position}
          evaluatorEmail={supervisorEmail}
          expiresAt={tokenExpiresAt}
        />
        <SummaryPanel summary={summary} />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <ISRSection title="Ratings" icon={<Star size={15} />}>
            <div className="isr-sliders">
              {(Object.keys(RATING_LABELS) as RatingKey[]).map((key) => (
                <ScoreSlider
                  key={key}
                  label={RATING_LABELS[key]}
                  max={RATING_MAX[key]}
                  value={ratings[key]}
                  onChange={(v) => setRatings((r) => ({ ...r, [key]: v }))}
                />
              ))}
            </div>
            <TotalScoreRing total={totalScore} />
          </ISRSection>

          <ISRSection
            title="Strengths & Weaknesses"
            icon={<ThumbsUp size={15} />}
          >
            <ISRTagInput
              label="Strengths"
              tags={strengths}
              placeholder="Add a strength..."
              onChange={setStrengths}
            />
            <ISRTagInput
              label="Areas for Improvement"
              tags={weaknesses}
              placeholder="Add a weakness..."
              onChange={setWeaknesses}
            />
          </ISRSection>

          <div className="isr-card">
            <div className="isr-card-header">
              <Award size={15} /> Overall Comments
            </div>
            <div className="isr-field">
              <label className="isr-label">Performance Review</label>
              <textarea
                className="isr-textarea"
                rows={4}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Overall feedback..."
              />
            </div>
            <div className="isr-field" style={{ marginTop: 16 }}>
              <label className="isr-label">Would you hire this student?</label>
              <div className="isr-action-row" style={{ marginTop: 8 }}>
                <button
                  type="button"
                  className={`isr-btn ${
                    wouldHire === "yes" ? "isr-btn--approve" : ""
                  }`}
                  style={{ flex: 1 }}
                  onClick={() => setWouldHire("yes")}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className={`isr-btn ${
                    wouldHire === "no" ? "isr-btn--reject" : ""
                  }`}
                  style={{ flex: 1 }}
                  onClick={() => setWouldHire("no")}
                >
                  No
                </button>
                <button
                  type="button"
                  className={`isr-btn ${
                    wouldHire === "maybe" ? "isr-btn--revision" : ""
                  }`}
                  style={{ flex: 1 }}
                  onClick={() => setWouldHire("maybe")}
                >
                  Maybe
                </button>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 24 }}>
            <button
              type="submit"
              className="isr-btn isr-btn--approve isr-btn--full"
              disabled={submit.isPending}
            >
              {submit.isPending ? "Submitting..." : "Submit Final Evaluation"}
            </button>
          </div>
          {formError && (
            <div className="isr-form-error" style={{ marginTop: 12 }}>
              <AlertTriangle size={13} /> {formError}
            </div>
          )}
        </form>
      </div>
    </ISRShell>
  );

  async function handleSubmit() {
    const hasZero = Object.values(ratings).some((v) => v === 0);
    if (hasZero) return setFormError("Please score all categories.");
    if (!strengths.length || !weaknesses.length || !comments.trim())
      return setFormError("Please complete all sections.");

    setFormError("");
    const res = await submit.mutateAsync({
      ratings,
      strengths,
      weaknesses,
      comments,
      wouldHire,
    });
    if (res.success)
      setSubmitResult({
        score: res.data?.totalScore,
        studentName: res.data?.studentName,
      });
  }
}
