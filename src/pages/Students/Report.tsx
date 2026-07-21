import { useState } from "react";
import {
  FileText,
  Sparkles,
  BarChart3,
  TrendingUp,
  Brain,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Shield,
  AlertCircle,
  CheckCircle2,
  Clock,
  BookOpen,
  Zap,
  Target,
  ClipboardCheck,
} from "lucide-react";
import {
  useGenerateReport,
  usePreviewAiScore,
  useAiAnalyzeSkills,
  useStudentFinalReport,
} from "../../hooks/useITStudents";
import { useMyEvaluation } from "../../hooks/useEvaluations";
import { useInternship } from "../../context/useInternship";
import "./Report.css";

// ── Grade colour helper ───────────────────────────────────────────────────────
function gradeClass(grade: string) {
  if (grade === "A" || grade === "A+") return "grade-a";
  if (grade === "B") return "grade-b";
  if (grade === "C") return "grade-c";
  return "grade-d";
}

// ── Section tab type ──────────────────────────────────────────────────────────
type Tab = "overview" | "preview" | "skills" | "report" | "evaluation";

export default function Report() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [expandedWeek, setExpandedWeek] = useState<string | null>(null);
  const [expandedChallenge, setExpandedChallenge] = useState<string | null>(
    null,
  );
  // Structured API error from /reports/generate
  const [generateError, setGenerateError] = useState<{
    message: string;
    currentLogbooks?: number;
  } | null>(null);

  const { selectedInternshipId } = useInternship();
  const scopeParams = { internshipId: selectedInternshipId ?? undefined };

  const { mutate: generate, isPending: generating } = useGenerateReport();
  const {
    data: previewData,
    isLoading: loadingPreview,
    isError: previewIsError,
    error: previewQueryError,
  } = usePreviewAiScore(scopeParams);
  const { data: skillsData, isLoading: loadingSkills } =
    useAiAnalyzeSkills(scopeParams);
  const { data: reportData, isLoading: loadingReport } =
    useStudentFinalReport(scopeParams);
  const { data: evaluationData, isLoading: loadingEvaluation } =
    useMyEvaluation(scopeParams);

  const handleGenerate = () => {
    setGenerateError(null);
    generate(scopeParams, {
      onError: (err: unknown) => {
        const body = (
          err as {
            response?: {
              data?: { message?: string; currentLogbooks?: number };
            };
          }
        )?.response?.data;
        setGenerateError({
          message:
            body?.message ?? "Failed to generate report. Please try again.",
          currentLogbooks: body?.currentLogbooks,
        });
      },
    });
  };

  const report = reportData?.data;
  const preview = previewData?.success !== false ? previewData?.data : null;
  const skills = skillsData?.data;

  // ── Derive preview error from the query response or query-level error ───────
  const previewApiError: {
    message: string;
    currentLogbooks?: number;
    required?: number;
  } | null = previewIsError
    ? {
        message:
          (previewQueryError as { response?: { data?: { message?: string } } })
            ?.response?.data?.message ?? "Failed to load AI preview.",
      }
    : previewData?.success === false
      ? {
          message: previewData.message,
          currentLogbooks: previewData.currentLogbooks,
          required: previewData.required,
        }
      : null;

  const evaluation = evaluationData?.data;

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: "Overview", icon: <BarChart3 size={15} /> },
    { key: "preview", label: "AI Preview", icon: <Brain size={15} /> },
    { key: "skills", label: "Skills Analysis", icon: <TrendingUp size={15} /> },
    { key: "report", label: "Full Report", icon: <FileText size={15} /> },
    {
      key: "evaluation",
      label: "Evaluation",
      icon: <ClipboardCheck size={15} />,
    },
  ];

  return (
    <div className="page-container">
      {/* ── Inline error banner ─────────────────────────────────────────────── */}
      {generateError && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            padding: "14px 18px",
            borderRadius: 12,
            background: "rgba(239,68,68,.08)",
            border: "1px solid rgba(239,68,68,.25)",
            color: "#dc2626",
            marginBottom: 4,
            fontSize: 13.5,
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: 700 }}>Cannot Generate Report — </span>
            {generateError.message}
            {generateError.currentLogbooks !== undefined && (
              <span
                style={{
                  marginLeft: 8,
                  padding: "2px 8px",
                  borderRadius: 100,
                  background: "rgba(239,68,68,.12)",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {generateError.currentLogbooks} / 10 logbooks
              </span>
            )}
          </div>
          <button
            onClick={() => setGenerateError(null)}
            style={{
              background: "none",
              border: "none",
              color: "#dc2626",
              cursor: "pointer",
              padding: 2,
              lineHeight: 1,
              fontSize: 16,
              flexShrink: 0,
            }}
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}
      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon purple">
            <FileText size={20} />
          </div>
          <div>
            <h2 className="page-title">IT Report</h2>
            <p className="page-sub">
              AI-powered analysis of your clinical training performance
            </p>
          </div>
        </div>
        <div className="page-header-right"></div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────────── */}
      <div className="rp-tabs">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`rp-tab ${activeTab === t.key ? "active" : ""}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Overview tab ────────────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="rp-section">
          {loadingReport ? (
            <SkeletonCards />
          ) : report ? (
            <>
              {/* Stats row */}
              <div className="rp-stats-row">
                <StatCard
                  icon={<Clock size={18} />}
                  label="Hours Logged"
                  value={report.totalHoursLogged}
                  color="teal"
                />
                <StatCard
                  icon={<BookOpen size={18} />}
                  label="Weeks Completed"
                  value={report.totalWeeksCompleted}
                  color="purple"
                />
                <StatCard
                  icon={<Zap size={18} />}
                  label="Unique Skills"
                  value={report.uniqueSkillsUsed}
                  color="amber"
                />
                {(report.finalScore !== undefined || report.aiScore) && (
                  <StatCard
                    icon={<Target size={18} />}
                    label="Final Score"
                    value={
                      report.finalScore !== undefined &&
                      report.finalScore !== null
                        ? `${report.finalScore}/100`
                        : report.aiScore
                          ? `${report.aiScore.total}/100`
                          : "—"
                    }
                    color="green"
                    badge={
                      report.finalGrade || report.aiScore?.grade || undefined
                    }
                  />
                )}
              </div>

              {/* Executive summary */}
              <CollapsibleCard
                title="Executive Summary"
                icon={<Shield size={16} />}
              >
                <p className="rp-prose">{report.executiveSummary}</p>
              </CollapsibleCard>

              {/* Conclusion */}
              <CollapsibleCard
                title="Conclusion"
                icon={<CheckCircle2 size={16} />}
                accent
              >
                <p className="rp-prose">{report.conclusion}</p>
              </CollapsibleCard>
            </>
          ) : (
            <EmptyState
              onGenerate={handleGenerate}
              generating={generating}
              text=" Generate your AI-powered IT report to see your performance analysis,
        skill breakdown, and professional growth summary. Overview of your CIMS experience"
            />
          )}
        </div>
      )}

      {/* ── AI Preview tab ──────────────────────────────────────────────────── */}
      {activeTab === "preview" && (
        <div className="rp-section">
          {loadingPreview ? (
            <SkeletonCards />
          ) : previewApiError ? (
            // ── API returned success:false or network error ────────────────
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "18px 20px",
                borderRadius: 12,
                background: "rgba(239,68,68,.08)",
                border: "1px solid rgba(239,68,68,.25)",
                color: "#dc2626",
                fontSize: 13.5,
              }}
            >
              <AlertCircle size={20} style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>
                  AI Preview Unavailable
                </div>
                <div>{previewApiError.message}</div>
                {previewApiError.currentLogbooks !== undefined && (
                  <div
                    style={{
                      marginTop: 10,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: 100,
                        background: "rgba(239,68,68,.12)",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {previewApiError.currentLogbooks} /{" "}
                      {previewApiError.required ?? 5} logbooks
                    </span>
                    <span style={{ fontSize: 12, opacity: 0.75 }}>
                      Submit{" "}
                      {(previewApiError.required ?? 5) -
                        (previewApiError.currentLogbooks ?? 0)}{" "}
                      more logbook
                      {(previewApiError.required ?? 5) -
                        (previewApiError.currentLogbooks ?? 0) !==
                      1
                        ? "s"
                        : ""}{" "}
                      to unlock the preview
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : preview ? (
            <>
              {/* Score hero */}
              <div className="rp-score-hero">
                <div
                  className={`rp-grade-ring ${gradeClass(preview.predictedGrade)}`}
                >
                  <span className="rp-grade-letter">
                    {preview.predictedGrade}
                  </span>
                  <span className="rp-grade-score">
                    {preview.predictedScore}/100
                  </span>
                </div>
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

              {/* Breakdown bars */}
              <CollapsibleCard
                title="Score Breakdown"
                icon={<BarChart3 size={16} />}
              >
                <div className="rp-breakdown-list">
                  {Object.entries(preview.breakdown).map(([key, val]) => (
                    <ScoreBar
                      key={key}
                      label={formatBreakdownKey(key)}
                      value={val}
                      max={maxForKey(key)}
                    />
                  ))}
                </div>
              </CollapsibleCard>

              {/* Reasoning */}
              <CollapsibleCard
                title="AI Reasoning"
                icon={<Lightbulb size={16} />}
              >
                <ul className="rp-reasoning-list">
                  {preview.reasoning.map((r, i) => (
                    <li key={i} className="rp-reasoning-item">
                      <span className="rp-reasoning-dot" />
                      {r}
                    </li>
                  ))}
                </ul>
              </CollapsibleCard>
            </>
          ) : (
            <EmptyState
              onGenerate={handleGenerate}
              generating={generating}
              text="Generate your AI-powered IT report to see your performance analysis,
        skill breakdown, and professional growth summary. Overview of your ITMS experience"
            />
          )}
        </div>
      )}

      {/* ── Skills Analysis tab ──────────────────────────────────────────────── */}
      {activeTab === "skills" && (
        <div className="rp-section">
          {loadingSkills ? (
            <SkeletonCards />
          ) : skills ? (
            <>
              {/* Meta stats */}
              <div className="rp-stats-row">
                <StatCard
                  icon={<Zap size={18} />}
                  label="Total Skills"
                  value={skills.totalSkills}
                  color="purple"
                />
                <StatCard
                  icon={<Clock size={18} />}
                  label="Hours Spent"
                  value={skills.totalHoursSpent}
                  color="teal"
                />
                <StatCard
                  icon={<BookOpen size={18} />}
                  label="Weeks"
                  value={skills.totalWeeks}
                  color="amber"
                />
                <StatCard
                  icon={<CheckCircle2 size={18} />}
                  label="Consistency"
                  value={`${skills.consistencyScore}%`}
                  color="green"
                />
              </div>

              {/* Top skills */}
              <CollapsibleCard
                title="Top Skills"
                icon={<TrendingUp size={16} />}
              >
                <div className="rp-skill-chips">
                  {skills.topSkills.map((s) => (
                    <span
                      key={s.skill}
                      className="rp-skill-chip rp-skill-chip--top"
                    >
                      {s.skill}
                      <span className="rp-skill-count">{s.count}×</span>
                    </span>
                  ))}
                </div>
              </CollapsibleCard>

              {/* Emerging skills */}
              <CollapsibleCard
                title="Emerging Skills"
                icon={<Sparkles size={16} />}
              >
                <div className="rp-skill-chips">
                  {skills.emergingSkills.map((s) => (
                    <span
                      key={s.skill}
                      className="rp-skill-chip rp-skill-chip--emerging"
                    >
                      {s.skill}
                      <span className="rp-skill-count">{s.count}×</span>
                    </span>
                  ))}
                </div>
              </CollapsibleCard>

              {/* Frequency table */}
              <CollapsibleCard
                title="All Skills by Frequency"
                icon={<BarChart3 size={16} />}
              >
                <div className="rp-breakdown-list">
                  {skills.skillsByFrequency.map((s) => (
                    <ScoreBar
                      key={s.skill}
                      label={s.skill}
                      value={s.count}
                      max={Math.max(
                        ...skills.skillsByFrequency.map((x) => x.count),
                      )}
                    />
                  ))}
                </div>
              </CollapsibleCard>
            </>
          ) : (
            <EmptyState onGenerate={handleGenerate} generating={generating} />
          )}
        </div>
      )}

      {/* ── Full Report tab ──────────────────────────────────────────────────── */}
      {activeTab === "report" && (
        <div className="rp-section">
          {loadingReport ? (
            <SkeletonCards />
          ) : report ? (
            <>
              {/* AI Score strip */}
              {(report.finalScore !== undefined || report.aiScore) && (
                <div className="rp-score-strip">
                  {(report.finalGrade || report.aiScore?.grade) && (
                    <div
                      className={`rp-grade-pill ${gradeClass(report.finalGrade || report.aiScore?.grade || "")}`}
                    >
                      Grade {report.finalGrade || report.aiScore?.grade}
                    </div>
                  )}
                  {report.finalScore !== undefined &&
                  report.finalScore !== null ? (
                    <span className="rp-score-strip-score">
                      {report.finalScore}/100
                    </span>
                  ) : report.aiScore ? (
                    <span className="rp-score-strip-score">
                      {report.aiScore.total}/100
                    </span>
                  ) : null}
                  <span className="rp-score-strip-label">
                    {report.finalScore !== undefined
                      ? "Final Score"
                      : "AI Score"}
                  </span>
                  {report.aiScore?.breakdown && (
                    <div className="rp-score-strip-breakdown">
                      {Object.entries(report.aiScore.breakdown).map(
                        ([k, v]) => (
                          <span key={k} className="rp-strip-chip">
                            {formatBreakdownKey(k)}: <strong>{v}</strong>
                          </span>
                        ),
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Weekly summaries accordion */}
              <CollapsibleCard
                title="Weekly Summaries"
                icon={<BookOpen size={16} />}
              >
                <div className="rp-accordion-list">
                  {report.weeklySummaries.map((w) => (
                    <div
                      key={w._id}
                      className={`rp-accordion ${expandedWeek === w._id ? "open" : ""}`}
                    >
                      <button
                        className="rp-accordion-header"
                        onClick={() =>
                          setExpandedWeek(expandedWeek === w._id ? null : w._id)
                        }
                      >
                        <div className="rp-accordion-left">
                          <span className="rp-week-badge">
                            Week {w.weekNumber}
                          </span>
                          <span className="rp-accordion-title">{w.title}</span>
                        </div>
                        <div className="rp-accordion-right">
                          <span className="rp-hrs-chip">{w.hoursSpent}h</span>
                          {expandedWeek === w._id ? (
                            <ChevronUp size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          )}
                        </div>
                      </button>
                      {expandedWeek === w._id && (
                        <div className="rp-accordion-body">
                          <p className="rp-prose">{w.summary}</p>
                          {w.keyLearnings.length > 0 && (
                            <div className="rp-key-learnings">
                              <div className="rp-key-learnings-label">
                                Key Learnings
                              </div>
                              <ul>
                                {w.keyLearnings.map((l, i) => (
                                  <li key={i}>{l}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CollapsibleCard>

              {/* Challenges analysis */}
              <CollapsibleCard
                title="Challenges & Solutions"
                icon={<AlertCircle size={16} />}
              >
                <div className="rp-accordion-list">
                  {report.challengesAnalysis.map((c) => (
                    <div
                      key={c._id}
                      className={`rp-accordion ${expandedChallenge === c._id ? "open" : ""}`}
                    >
                      <button
                        className="rp-accordion-header"
                        onClick={() =>
                          setExpandedChallenge(
                            expandedChallenge === c._id ? null : c._id,
                          )
                        }
                      >
                        <div className="rp-accordion-left">
                          <span className="rp-week-badge">
                            Wk {c.weekNumber}
                          </span>
                          <span className="rp-accordion-title">
                            {c.challenge.slice(0, 80)}
                            {c.challenge.length > 80 ? "…" : ""}
                          </span>
                        </div>
                        <div className="rp-accordion-right">
                          {expandedChallenge === c._id ? (
                            <ChevronUp size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          )}
                        </div>
                      </button>
                      {expandedChallenge === c._id && (
                        <div className="rp-accordion-body">
                          <div className="rp-challenge-grid">
                            <div>
                              <div className="rp-challenge-label">
                                Challenge
                              </div>
                              <p className="rp-prose">{c.challenge}</p>
                            </div>
                            <div>
                              <div className="rp-challenge-label">Solution</div>
                              <p className="rp-prose">{c.solution}</p>
                            </div>
                          </div>
                          <div className="rp-outcome">
                            <CheckCircle2 size={13} />
                            {c.outcome}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CollapsibleCard>

              {/* Technical & Soft skills */}
              <CollapsibleCard
                title="Technical Skills"
                icon={<Zap size={16} />}
              >
                <div className="rp-skill-table">
                  {report.skillsAnalysis.technicalSkills.map((s) => (
                    <div key={s._id} className="rp-skill-row">
                      <span className="rp-skill-name">{s.skill}</span>
                      <span
                        className={`rp-proficiency rp-proficiency--${s.proficiency.toLowerCase()}`}
                      >
                        {s.proficiency}
                      </span>
                      <span className="rp-weeks-used">{s.weeksUsed}w</span>
                    </div>
                  ))}
                </div>
              </CollapsibleCard>
              <CollapsibleCard title="Soft Skills" icon={<Brain size={16} />}>
                <div className="rp-skill-table">
                  {report.skillsAnalysis.softSkills.map((s) => (
                    <div key={s._id} className="rp-skill-row">
                      <span className="rp-skill-name">{s.skill}</span>
                      <span className="rp-evidence">{s.evidence[0]}</span>
                    </div>
                  ))}
                </div>
              </CollapsibleCard>

              {/* Professional growth */}
              <CollapsibleCard
                title="Professional Growth"
                icon={<TrendingUp size={16} />}
              >
                <p className="rp-prose">{report.professionalGrowth.summary}</p>
                <div className="rp-two-col rp-growth-grid">
                  <div>
                    <div className="rp-growth-label">Key Areas</div>
                    <ul className="rp-growth-list">
                      {report.professionalGrowth.keyAreas.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="rp-growth-label">Recommendations</div>
                    <ul className="rp-growth-list">
                      {report.professionalGrowth.recommendations.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CollapsibleCard>
            </>
          ) : (
            <EmptyState
              onGenerate={handleGenerate}
              generating={generating}
              text="Generate your AI-powered IT report to see your performance analysis,
        skill breakdown, and professional growth summary. Full report of your ITMS experience"
            />
          )}
        </div>
      )}

      {/* ── Evaluation tab ──────────────────────────────────────────────────── */}
      {activeTab === "evaluation" && (
        <div className="rp-section">
          {loadingEvaluation ? (
            <SkeletonCards />
          ) : evaluation ? (
            <>
              <div className="rp-stats-row">
                <StatCard
                  icon={<Target size={18} />}
                  label="Final Score"
                  value={
                    evaluation.summary.finalScore != null
                      ? evaluation.summary.finalScore
                      : "—"
                  }
                  color="green"
                  badge={evaluation.summary.finalGrade ?? undefined}
                />
                <StatCard
                  icon={<CheckCircle2 size={18} />}
                  label="Status"
                  value={evaluation.summary.isComplete ? "Complete" : "Pending"}
                  color={evaluation.summary.isComplete ? "teal" : "amber"}
                />
              </div>

              {(() => {
                const schoolSide =
                  evaluation.evaluation?.schoolEvaluation ||
                  evaluation.evaluation?.school;
                if (!schoolSide) return null;
                return (
                  <CollapsibleCard
                    title="School Evaluation"
                    icon={<BookOpen size={16} />}
                  >
                    {schoolSide.ratings && (
                      <div className="rp-breakdown-list">
                        <ScoreBar
                          label="Logbook Quality"
                          value={schoolSide.ratings.logbookQuality}
                          max={40}
                        />
                        <ScoreBar
                          label="Logbook Consistency"
                          value={schoolSide.ratings.logbookConsistency}
                          max={30}
                        />
                        <ScoreBar
                          label="Professional Growth"
                          value={schoolSide.ratings.professionalGrowth}
                          max={30}
                        />
                      </div>
                    )}
                    {schoolSide.comments && (
                      <p className="rp-prose" style={{ marginTop: 12 }}>
                        {schoolSide.comments}
                      </p>
                    )}
                  </CollapsibleCard>
                );
              })()}

              {(() => {
                const industrialSide =
                  evaluation.evaluation?.industrialEvaluation ||
                  evaluation.evaluation?.industrial;
                if (!industrialSide) return null;
                return (
                  <CollapsibleCard
                    title="Industrial Evaluation"
                    icon={<Shield size={16} />}
                  >
                    {industrialSide.ratings && (
                      <div className="rp-breakdown-list">
                        {Object.entries(industrialSide.ratings).map(
                          ([key, val]) => (
                            <ScoreBar
                              key={key}
                              label={formatBreakdownKey(key)}
                              value={val as number}
                              max={20}
                            />
                          ),
                        )}
                      </div>
                    )}
                    {industrialSide.comments && (
                      <p className="rp-prose" style={{ marginTop: 12 }}>
                        {industrialSide.comments}
                      </p>
                    )}
                    {((industrialSide.strengths &&
                      industrialSide.strengths.length > 0) ||
                      (industrialSide.weaknesses &&
                        industrialSide.weaknesses.length > 0)) && (
                      <div className="rp-two-col rp-growth-grid">
                        {industrialSide.strengths &&
                          industrialSide.strengths.length > 0 && (
                            <div>
                              <div className="rp-growth-label">Strengths</div>
                              <ul className="rp-growth-list">
                                {industrialSide.strengths.map(
                                  (s: string, i: number) => (
                                    <li key={i}>{s}</li>
                                  ),
                                )}
                              </ul>
                            </div>
                          )}
                        {industrialSide.weaknesses &&
                          industrialSide.weaknesses.length > 0 && (
                            <div>
                              <div className="rp-growth-label">Weaknesses</div>
                              <ul className="rp-growth-list">
                                {industrialSide.weaknesses.map(
                                  (w: string, i: number) => (
                                    <li key={i}>{w}</li>
                                  ),
                                )}
                              </ul>
                            </div>
                          )}
                      </div>
                    )}
                  </CollapsibleCard>
                );
              })()}
            </>
          ) : (
            <div className="rp-empty">
              <div className="rp-empty-icon">
                <ClipboardCheck size={32} />
              </div>
              <h3 className="rp-empty-title">No Evaluation Yet</h3>
              <p className="rp-empty-sub">
                Your school and industrial supervisors haven't submitted an
                evaluation for this internship yet.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function CollapsibleCard({
  title,
  icon,
  children,
  defaultOpen = true,
  accent = false,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  accent?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className={`rp-card ${accent ? "rp-card--accent" : ""}`}>
      <button
        className="rp-card-header rp-card-header--collapsible"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          textAlign: "left",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {icon}
          {title}
        </div>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {isOpen && <div className="rp-card-content">{children}</div>}
    </div>
  );
}

function StatCard({
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

function ScoreBar({
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

function EmptyState({
  text,
}: {
  onGenerate?: () => void;
  generating?: boolean;
  text?: string;
}) {
  return (
    <div className="rp-empty">
      <div className="rp-empty-icon">
        <FileText size={32} />
      </div>
      <h3 className="rp-empty-title">No Report Yet</h3>
      <p className="rp-empty-sub">{text}</p>
    </div>
  );
}

function SkeletonCards() {
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

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatBreakdownKey(key: string) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
}

function maxForKey(key: string): number {
  const maxes: Record<string, number> = {
    logbookQuality: 30,
    logbookConsistency: 20,
    technicalSkills: 20,
    professionalGrowth: 15,
    challengesOvercome: 10,
    communication: 5,
  };
  return maxes[key] ?? 10;
}
