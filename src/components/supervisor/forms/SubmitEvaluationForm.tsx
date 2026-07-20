import { useState } from "react";
import { Award, Loader2, SlidersHorizontal, MessageSquare } from "lucide-react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import ConfirmModal from "../../ui/ConfirmModal/ConfirmModal";
import { useSubmitSchoolEvaluation } from "../../../hooks/useSchoolSupervisor";
import type {
  SchoolEvaluationRatings,
  SchoolEvaluationResponse,
} from "../../../api/types/schoolSupervisor";

// ─── Rating line ────────────────────────────────────────────────────────────

interface RatingSliderProps {
  label: string;
  description: string;
  field: keyof SchoolEvaluationRatings;
  max: number;
  value: number;
  onChange: (field: keyof SchoolEvaluationRatings, val: number) => void;
  disabled?: boolean;
}

function RatingSlider({
  label,
  description,
  field,
  max,
  value,
  onChange,
  disabled,
}: RatingSliderProps) {
  const pct = Math.round((value / max) * 100);
  const color = pct >= 80 ? "#10b981" : pct >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div className="sef-rating-row">
      <div className="sef-rating-header">
        <div>
          <span className="sef-rating-label">{label}</span>
          <span className="sef-rating-desc">{description}</span>
        </div>
        <span className="sef-rating-score" style={{ color }}>
          {value}
          <span className="sef-rating-max">/{max}</span>
        </span>
      </div>
      <div className="sef-slider-wrap">
        <input
          type="range"
          min={0}
          max={max}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(field, Number(e.target.value))}
          className="sef-slider"
          style={{ "--pct": `${pct}%`, "--clr": color } as React.CSSProperties}
        />
        <div className="sef-slider-labels">
          <span>0</span>
          <span>{Math.round(max / 2)}</span>
          <span>{max}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Grade chip ──────────────────────────────────────────────────────────────

const GRADE_COLORS: Record<string, string> = {
  A: "#10b981",
  B: "#3b82f6",
  C: "#f59e0b",
  D: "#ea580c",
  F: "#ef4444",
};

function GradeChip({ grade }: { grade: string }) {
  const color = GRADE_COLORS[grade] ?? "#6b7280";
  return (
    <span
      className="sef-grade-chip"
      style={{
        background: `${color}22`,
        color,
        border: `1.5px solid ${color}`,
      }}
    >
      {grade}
    </span>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

interface SubmitEvaluationFormProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  onSuccess?: () => void;
}

const DEFAULT_RATINGS: SchoolEvaluationRatings = {
  logbookQuality: 20,
  logbookConsistency: 15,
  professionalGrowth: 15,
};

interface EvaluationRequirementError {
  success: boolean;
  message: string;
  approvedLogbooks: number;
  minimumRequired: number;
  totalWeeks: number;
  percentComplete: number;
  percentRequired: number;
}

export default function SubmitEvaluationForm({
  isOpen,
  onClose,
  studentId,
  studentName,
  onSuccess,
}: SubmitEvaluationFormProps) {
  const [ratings, setRatings] =
    useState<SchoolEvaluationRatings>(DEFAULT_RATINGS);
  const [comments, setComments] = useState("");
  const [result, setResult] = useState<SchoolEvaluationResponse | null>(null);
  const [validationError, setValidationError] = useState<{
    message: string;
    title: string;
  } | null>(null);

  const { mutate: submit, isPending } = useSubmitSchoolEvaluation();

  const totalScore =
    ratings.logbookQuality +
    ratings.logbookConsistency +
    ratings.professionalGrowth;

  const handleChange = (field: keyof SchoolEvaluationRatings, val: number) => {
    setRatings((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = () => {
    if (!comments.trim()) return;
    setValidationError(null);

    submit(
      { studentId, payload: { ratings, comments } },
      {
        onSuccess: (data) => {
          setResult(data);
          onClose();
        },
        onError: (err: unknown) => {
          const apiData = (
            err as { response?: { data?: EvaluationRequirementError } }
          )?.response?.data;
          // Check if this is the specific "insufficient logbooks" error
          if (apiData && apiData.minimumRequired !== undefined) {
            setValidationError({
              title: "Evaluation Requirement Not Met",
              message: apiData.message,
            });
          }
        },
      },
    );
  };

  const handleClose = () => {
    setRatings(DEFAULT_RATINGS);
    setComments("");
    setValidationError(null);
    onClose();
  };

  const handleDismissResult = () => {
    setResult(null);
    onSuccess?.();
  };

  return (
    <>
      <CustomModal
        isOpen={isOpen}
        onClose={handleClose}
        title="Submit School Evaluation"
        subtitle={studentName}
        icon={<Award size={16} />}
        size="medium"
        placement="top"
      >
        {/* ── Form (always shown) ── */}
        <div className="sef-form">
          {/* Total score preview */}
          <div className="sef-score-preview">
            <SlidersHorizontal size={14} />
            <span>Total score preview:</span>
            <strong className="sef-total-score">{totalScore} / 100</strong>
          </div>

          {/* Rating sliders */}
          <div className="sef-ratings">
            <RatingSlider
              label="Logbook Quality"
              description="Clarity, detail, and accuracy of entries"
              field="logbookQuality"
              max={40}
              value={ratings.logbookQuality}
              onChange={handleChange}
              disabled={isPending}
            />
            <RatingSlider
              label="Logbook Consistency"
              description="Regularity and timeliness of submissions"
              field="logbookConsistency"
              max={30}
              value={ratings.logbookConsistency}
              onChange={handleChange}
              disabled={isPending}
            />
            <RatingSlider
              label="Professional Growth"
              description="Skills learned and observable development"
              field="professionalGrowth"
              max={30}
              value={ratings.professionalGrowth}
              onChange={handleChange}
              disabled={isPending}
            />
          </div>

          {/* Comments */}
          <div className="form-group">
            <label className="modal-label">
              <MessageSquare
                size={12}
                style={{ display: "inline", marginRight: 4 }}
              />
              Supervisor Comments
              <span style={{ color: "#ef4444", marginLeft: 3 }}>*</span>
            </label>
            <textarea
              className="modal-input"
              rows={4}
              placeholder="Describe your overall assessment of the student's performance during the IT period…"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="modal-cancel"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              type="button"
              className="modal-submit"
              disabled={isPending || !comments.trim()}
              onClick={handleSubmit}
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              {isPending ? (
                <>
                  <Loader2
                    size={13}
                    style={{ animation: "spin .8s linear infinite" }}
                  />
                  Submitting…
                </>
              ) : (
                <>
                  <Award size={13} /> Submit Evaluation
                </>
              )}
            </button>
          </div>
        </div>

        <style>{`
        /* ── SubmitEvaluationForm styles ── */
        .sef-form{display:flex;flex-direction:column;gap:20px}
        /* Score preview */
        .sef-score-preview{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--color-text-secondary);padding:10px 14px;background:var(--color-bg-secondary);border:1px solid var(--color-border);border-radius:10px}
        .sef-total-score{font-size:18px;color:var(--color-accent);margin-left:auto}
        /* Ratings */
        .sef-ratings{display:flex;flex-direction:column;gap:16px}
        .sef-rating-row{display:flex;flex-direction:column;gap:8px;padding:14px;border:1px solid var(--color-border);border-radius:12px;background:var(--color-bg-primary)}
        .sef-rating-header{display:flex;align-items:flex-start;justify-content:space-between;gap:8px}
        .sef-rating-label{display:block;font-size:13px;font-weight:700;color:var(--color-text-primary)}
        .sef-rating-desc{display:block;font-size:11.5px;color:var(--color-text-secondary);margin-top:2px}
        .sef-rating-score{font-size:22px;font-weight:700;white-space:nowrap;flex-shrink:0;transition:color .2s}
        .sef-rating-max{font-size:13px;font-weight:500;opacity:.6}
        /* Slider */
        .sef-slider-wrap{display:flex;flex-direction:column;gap:4px}
        .sef-slider{width:100%;-webkit-appearance:none;height:6px;border-radius:20px;background:linear-gradient(to right,var(--clr) var(--pct),var(--color-border) var(--pct));outline:none;cursor:pointer}
        .sef-slider:disabled{opacity:.5;cursor:not-allowed}
        .sef-slider::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:var(--clr);box-shadow:0 1px 6px rgba(0,0,0,.2);cursor:pointer;transition:transform .15s}
        .sef-slider::-webkit-slider-thumb:hover{transform:scale(1.15)}
        .sef-slider-labels{display:flex;justify-content:space-between;font-size:10.5px;color:var(--color-text-secondary)}
        /* Result grid (reused in ConfirmModal) */
        .sef-result-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .sef-result-item{display:flex;flex-direction:column;gap:4px;padding:12px;border:1px solid var(--color-border);border-radius:10px;background:var(--color-bg-secondary)}
        .sef-result-label{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--color-text-secondary)}
        .sef-result-val{font-size:14px;font-weight:600;color:var(--color-text-primary)}
        .sef-score{font-size:22px;color:var(--color-accent)}
        .sef-grade-chip{padding:3px 14px;border-radius:20px;font-size:18px;font-weight:800;display:inline-block}
      `}</style>
      </CustomModal>

      {/* ── Success result modal ── */}
      <ConfirmModal
        isOpen={!!result}
        variant="success"
        title={result?.message ?? "Evaluation Submitted"}
        confirmText="Done"
        cancelText=""
        onConfirm={handleDismissResult}
        onCancel={handleDismissResult}
      >
        {result && (
          <div className="sef-result-grid" style={{ marginTop: 12 }}>
            <div className="sef-result-item">
              <span className="sef-result-label">Student</span>
              <span className="sef-result-val">{result.data.student}</span>
            </div>
            <div className="sef-result-item">
              <span className="sef-result-label">Type</span>
              <span
                className="sef-result-val"
                style={{ textTransform: "capitalize" }}
              >
                {result.data.type}
              </span>
            </div>
            <div className="sef-result-item">
              <span className="sef-result-label">School Score</span>
              <span className="sef-result-val sef-score">
                {result.data.schoolScore}
              </span>
            </div>
            <div className="sef-result-item">
              <span className="sef-result-label">Final Score</span>
              <span className="sef-result-val sef-score">
                {result.data.finalScore}
              </span>
            </div>
            <div className="sef-result-item">
              <span className="sef-result-label">Grade</span>
              <GradeChip grade={result.data.finalGrade} />
            </div>
            <div className="sef-result-item">
              <span className="sef-result-label">Status</span>
              <span
                className="sef-result-val"
                style={{
                  color: "#10b981",
                  fontWeight: 700,
                  textTransform: "capitalize",
                }}
              >
                {result.data.status}
              </span>
            </div>
          </div>
        )}
      </ConfirmModal>

      {/* ── Validation error modal ── */}
      <ConfirmModal
        isOpen={!!validationError}
        title={validationError?.title}
        message={validationError?.message}
        variant="warning"
        confirmText="Understand"
        cancelText="Close"
        onConfirm={() => setValidationError(null)}
        onCancel={() => setValidationError(null)}
      />
    </>
  );
}
