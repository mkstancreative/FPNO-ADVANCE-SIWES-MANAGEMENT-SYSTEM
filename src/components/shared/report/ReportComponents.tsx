import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
} from "lucide-react";
import type {
  StudentReport,
  AiPreviewData,
  WeeklySummary,
  ChallengeAnalysis,
  TechnicalSkill,
  SoftSkill,
  AiScoreBreakdown,
} from "../../../api/types/itstudent";
import { gradeClass, formatBreakdownKey } from "./reportUtils";

// ── StatCard ────────────────────────────────────────────────────────────────
export function StatCard({
  icon,
  label,
  value,
  color,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  badge?: string;
}) {
  return (
    <div className={`rp-stat-card rp-stat-card--${color}`}>
      <div className="rp-stat-icon">{icon}</div>
      <div className="rp-stat-body">
        <div className="rp-stat-value">
          {value}
          {badge && (
            <span className={`rp-grade-badge ${gradeClass(badge)}`}>
              {badge}
            </span>
          )}
        </div>
        <div className="rp-stat-label">{label}</div>
      </div>
    </div>
  );
}

// ── ScoreBar ────────────────────────────────────────────────────────────────
export function ScoreBar({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="rp-bar-row">
      <span className="rp-bar-label">{label}</span>
      <div className="rp-bar-track">
        <div className="rp-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="rp-bar-value">{value}</span>
    </div>
  );
}

// ── ScoreRing ───────────────────────────────────────────────────────────────
export function ScoreRing({
  grade,
  total,
  subLabel,
}: {
  grade: string;
  total: number;
  subLabel?: string;
}) {
  return (
    <div className={`rp-grade-ring ${gradeClass(grade)}`}>
      <span className="rp-grade-letter">{grade}</span>
      <span className="rp-grade-score">
        {total}/100{subLabel ? ` · ${subLabel}` : ""}
      </span>
    </div>
  );
}

// ── ReasoningList ───────────────────────────────────────────────────────────
export function ReasoningList({ items }: { items: string[] }) {
  return (
    <ul className="rp-reasoning-list">
      {items.map((r, i) => (
        <li key={i} className="rp-reasoning-item">
          <span className="rp-reasoning-dot" />
          {r}
        </li>
      ))}
    </ul>
  );
}

// ── AccordionItem (weekly summary) ──────────────────────────────────────────
export function WeekAccordion({
  week,
  isOpen,
  toggle,
}: {
  week: WeeklySummary;
  isOpen: boolean;
  toggle: () => void;
}) {
  return (
    <div className={`rp-accordion ${isOpen ? "open" : ""}`}>
      <button className="rp-accordion-header" onClick={toggle}>
        <div className="rp-accordion-left">
          <span className="rp-week-badge">Week {week.weekNumber}</span>
          <span className="rp-accordion-title">{week.title}</span>
        </div>
        <div className="rp-accordion-right">
          <span className="rp-hrs-chip">{week.hoursSpent}h</span>
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>
      {isOpen && (
        <div className="rp-accordion-body">
          <p className="rp-prose">{week.summary}</p>
          {week.keyLearnings.length > 0 && (
            <div className="rp-key-learnings">
              <div className="rp-key-learnings-label">Key Learnings</div>
              <ul>
                {week.keyLearnings.map((l, i) => (
                  <li key={i}>{l}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── ChallengeCard ───────────────────────────────────────────────────────────
export function ChallengeCard({
  challenge,
  isOpen,
  toggle,
}: {
  challenge: ChallengeAnalysis;
  isOpen: boolean;
  toggle: () => void;
}) {
  return (
    <div className={`rp-accordion ${isOpen ? "open" : ""}`}>
      <button className="rp-accordion-header" onClick={toggle}>
        <div className="rp-accordion-left">
          <span className="rp-week-badge">Wk {challenge.weekNumber}</span>
          <span className="rp-accordion-title">
            {challenge.challenge.slice(0, 80)}
            {challenge.challenge.length > 80 ? "…" : ""}
          </span>
        </div>
        <div className="rp-accordion-right">
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>
      {isOpen && (
        <div className="rp-accordion-body">
          <div className="rp-challenge-grid">
            <div>
              <div className="rp-challenge-label">Challenge</div>
              <p className="rp-prose">{challenge.challenge}</p>
            </div>
            <div>
              <div className="rp-challenge-label">Solution</div>
              <p className="rp-prose">{challenge.solution}</p>
            </div>
          </div>
          <div className="rp-outcome">
            <CheckCircle2 size={13} />
            {challenge.outcome}
          </div>
        </div>
      )}
    </div>
  );
}

// ── TechnicalSkillRow ───────────────────────────────────────────────────────
export function TechnicalSkillRow({ skill }: { skill: TechnicalSkill }) {
  return (
    <div className="rp-skill-row">
      <span className="rp-skill-name">{skill.skill}</span>
      <span
        className={`rp-proficiency rp-proficiency--${skill.proficiency.toLowerCase()}`}
      >
        {skill.proficiency}
      </span>
      <span className="rp-weeks-used">{skill.weeksUsed}w</span>
    </div>
  );
}

// ── SoftSkillRow ────────────────────────────────────────────────────────────
export function SoftSkillRow({ skill }: { skill: SoftSkill }) {
  return (
    <div className="rp-skill-row">
      <span className="rp-skill-name">{skill.skill}</span>
      <span className="rp-evidence">{skill.evidence[0]}</span>
    </div>
  );
}

// ── GrowthGrid ──────────────────────────────────────────────────────────────
export function GrowthGrid({
  summary,
  keyAreas,
  recommendations,
}: {
  summary: string;
  keyAreas: string[];
  recommendations: string[];
}) {
  return (
    <>
      <p className="rp-prose">{summary}</p>
      <div className="rp-two-col rp-growth-grid">
        <div>
          <div className="rp-growth-label">Key Areas</div>
          <ul className="rp-growth-list">
            {keyAreas.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="rp-growth-label">Recommendations</div>
          <ul className="rp-growth-list">
            {recommendations.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

// ── ScoreStrip ──────────────────────────────────────────────────────────────
export function ScoreStrip({
  grade,
  total,
  breakdown,
}: {
  grade: string;
  total: number;
  breakdown?: AiScoreBreakdown;
}) {
  const entries = breakdown
    ? (Object.entries(breakdown) as [string, number][])
    : [];
  return (
    <div className="rp-score-strip">
      <div className={`rp-grade-pill ${gradeClass(grade)}`}>Grade {grade}</div>
      <span className="rp-score-strip-score">{total}/100</span>
      <span className="rp-score-strip-label">Final Score</span>
      {entries.length > 0 && (
        <div className="rp-score-strip-breakdown">
          {entries.map(([k, v]) => (
            <span key={k} className="rp-strip-chip">
              {formatBreakdownKey(k)}: <strong>{v}</strong>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── EmptyReportState ────────────────────────────────────────────────────────
export function EmptyReportState({
  onGenerate,
  generating,
  message,
}: {
  onGenerate?: () => void;
  generating?: boolean;
  message?: string;
}) {
  return (
    <div className="rp-empty">
      <div className="rp-empty-icon">
        <FileText size={32} />
      </div>
      <h3 className="rp-empty-title">No Report Available</h3>
      <p className="rp-empty-sub">
        {message ?? "No IT report has been generated yet for this student."}
      </p>
      {onGenerate && (
        <button
          className="rp-generate-btn"
          onClick={onGenerate}
          disabled={generating}
        >
          {generating ? (
            <>
              <span className="rp-spinner" /> Generating…
            </>
          ) : (
            <>
              <Sparkles size={15} /> Generate Report
            </>
          )}
        </button>
      )}
    </div>
  );
}

// ── ReportSkeleton ──────────────────────────────────────────────────────────
export function ReportSkeleton() {
  return (
    <div className="rp-skeleton-wrap">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rp-skeleton-card">
          <div className="rp-skeleton rp-skeleton--title" />
          <div className="rp-skeleton rp-skeleton--line" />
          <div className="rp-skeleton rp-skeleton--line rp-skeleton--short" />
        </div>
      ))}
    </div>
  );
}

// ── AiScorePreviewHero ──────────────────────────────────────────────────────
export function AiScorePreviewHero({ preview }: { preview: AiPreviewData }) {
  return (
    <div className="rp-score-hero">
      <ScoreRing
        grade={preview.predictedGrade}
        total={preview.predictedScore}
      />
      <div className="rp-score-meta">
        <div className="rp-score-title">Predicted IT Score</div>
        <div className="rp-score-sub">
          Based on {preview.currentLogbooks} logbook
          {preview.currentLogbooks !== 1 ? "s" : ""} submitted
        </div>
        <div className="rp-disclaimer">
          <AlertCircle size={13} />
          {preview.disclaimer}
        </div>
      </div>
    </div>
  );
}

// ── FullReportBody ──────────────────────────────────────────────────────────
/**
 * The full content of a completed report.
 * Suitable for both the student's own page and the admin modal.
 */
export function FullReportBody({ report }: { report: StudentReport }) {
  const [expandedWeek, setExpandedWeek] = useState<string | null>(null);
  const [expandedChallenge, setExpandedChallenge] = useState<string | null>(
    null,
  );

  return (
    <div className="rp-section">
      {/* Score strip — supports both old aiScore and new finalScore/finalGrade */}
      {(() => {
        const grade = report.finalGrade || report.aiScore?.grade;
        const total =
          report.finalScore !== undefined && report.finalScore !== null
            ? report.finalScore
            : report.aiScore?.total;
        if (!grade || total === undefined) return null;
        return (
          <ScoreStrip
            grade={grade}
            total={total}
            breakdown={report.aiScore?.breakdown}
          />
        );
      })()}

      {/* Executive Summary */}
      <div className="rp-card">
        <div className="rp-card-header">Executive Summary</div>
        <p className="rp-prose">{report.executiveSummary}</p>
      </div>

      {/* Weekly Summaries */}
      <div className="rp-card">
        <div className="rp-card-header">Weekly Summaries</div>
        <div className="rp-accordion-list">
          {report.weeklySummaries && report.weeklySummaries.length > 0 ? (
            report.weeklySummaries.map((w) => (
              <WeekAccordion
                key={w._id}
                week={w}
                isOpen={expandedWeek === w._id}
                toggle={() =>
                  setExpandedWeek(expandedWeek === w._id ? null : w._id)
                }
              />
            ))
          ) : (
            <p className="rp-prose">No weekly summaries available.</p>
          )}
        </div>
      </div>

      {/* Challenges */}
      <div className="rp-card">
        <div className="rp-card-header">Challenges & Solutions</div>
        <div className="rp-accordion-list">
          {report.challengesAnalysis && report.challengesAnalysis.length > 0 ? (
            report.challengesAnalysis.map((c) => (
              <ChallengeCard
                key={c._id}
                challenge={c}
                isOpen={expandedChallenge === c._id}
                toggle={() =>
                  setExpandedChallenge(
                    expandedChallenge === c._id ? null : c._id,
                  )
                }
              />
            ))
          ) : (
            <p className="rp-prose">No challenges recorded.</p>
          )}
        </div>
      </div>

      {/* Skills */}
      <div className="rp-two-col">
        <div className="rp-card">
          <div className="rp-card-header">Technical Skills</div>
          <div className="rp-skill-table">
            {report.skillsAnalysis?.technicalSkills &&
            report.skillsAnalysis.technicalSkills.length > 0 ? (
              report.skillsAnalysis.technicalSkills.map((s) => (
                <TechnicalSkillRow key={s._id} skill={s} />
              ))
            ) : (
              <p className="rp-prose">No technical skills recorded.</p>
            )}
          </div>
        </div>
        <div className="rp-card">
          <div className="rp-card-header">Soft Skills</div>
          <div className="rp-skill-table">
            {report.skillsAnalysis?.softSkills &&
            report.skillsAnalysis.softSkills.length > 0 ? (
              report.skillsAnalysis.softSkills.map((s) => (
                <SoftSkillRow key={s._id} skill={s} />
              ))
            ) : (
              <p className="rp-prose">No soft skills recorded.</p>
            )}
          </div>
        </div>
      </div>

      {/* AI Reasoning */}
      {report.aiScore && (
        <div className="rp-card">
          <div className="rp-card-header">AI Reasoning</div>
          <ReasoningList items={report.aiScore.reasoning} />
        </div>
      )}

      {/* Professional Growth */}
      {report.professionalGrowth && (
        <div className="rp-card">
          <div className="rp-card-header">Professional Growth</div>
          <GrowthGrid
            summary={report.professionalGrowth.summary}
            keyAreas={report.professionalGrowth.keyAreas}
            recommendations={report.professionalGrowth.recommendations}
          />
        </div>
      )}

      {/* Conclusion */}
      <div className="rp-card rp-card--accent">
        <div className="rp-card-header">Conclusion</div>
        <p className="rp-prose">{report.conclusion}</p>
      </div>
    </div>
  );
}
