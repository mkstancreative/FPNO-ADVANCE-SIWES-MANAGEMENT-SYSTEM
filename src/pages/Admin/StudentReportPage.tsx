import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useStudentReport, useAiScoreBreakdown } from "../../hooks/useStudents";
import {
  FullReportBody,
  ReportSkeleton,
  EmptyReportState,
  ScoreBar,
  ScoreRing,
  ReasoningList,
} from "../../components/shared/report/ReportComponents";
import { formatBreakdownKey } from "../../components/shared/report/reportUtils";
import {
  ArrowLeft,
  FileText,
  BarChart3,
  BookOpen,
  Zap,
  Clock,
} from "lucide-react";
import "./StudentReportPage.css";

// ── Admin breakdown types ───────────────────────────────────────────────────
interface BreakdownEntry {
  score: number;
  max: number;
  label: string;
}

interface AdminBreakdownData {
  student: { name: string; registrationNumber: string };
  scoring: {
    total: number;
    grade: string;
    breakdown: Record<string, BreakdownEntry>;
  };
  reasoning: string[];
}

function AdminScoreBreakdown({ data }: { data: AdminBreakdownData }) {
  const { scoring, reasoning } = data;
  const breakdownEntries = Object.entries(scoring.breakdown);

  return (
    <div className="srm-breakdown-wrap">
      {/* Header row */}
      <div className="srm-breakdown-hero">
        <ScoreRing grade={scoring.grade} total={scoring.total} />
        <div className="srm-breakdown-meta">
          <div className="srm-student-name">{data.student.name}</div>
          <div className="srm-student-reg">
            {data.student.registrationNumber}
          </div>
          <div className="srm-stat-row">
            <span className="srm-stat">
              <Clock size={12} /> Total: <strong>{scoring.total}/100</strong>
            </span>
            <span className="srm-stat">
              <Zap size={12} /> Grade: <strong>{scoring.grade}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Score breakdown bars */}
      <div className="rp-card">
        <div className="rp-card-header">
          <BarChart3 size={15} />
          Score Breakdown
        </div>
        <div className="srm-breakdown-bars">
          {breakdownEntries.map(([key, entry]) => (
            <div key={key} className="srm-bar-with-label">
              <div className="srm-bar-meta">
                <span className="srm-label">{entry.label}</span>
                <span className="srm-score-frac">
                  {entry.score}/{entry.max}
                </span>
              </div>
              <ScoreBar
                label={formatBreakdownKey(key)}
                value={entry.score}
                max={entry.max}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Reasoning */}
      <div className="rp-card">
        <div className="rp-card-header">AI Reasoning</div>
        <ReasoningList items={reasoning} />
      </div>
    </div>
  );
}

export default function StudentReportPage() {
  const { id, studentId } = useParams<{ id?: string; studentId?: string }>();
  const resolvedId = id || studentId || "";
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const studentName = searchParams.get("name") || "Student";
  const internshipId = searchParams.get("internshipId") ?? undefined;
  const batchId = searchParams.get("batchId") ?? undefined;
  const reportParams = { internshipId, batchId };

  const { data: reportRes, isLoading: loadingReport } = useStudentReport(
    resolvedId,
    reportParams,
  );
  const { data: breakdownRes, isLoading: loadingBreakdown } =
    useAiScoreBreakdown(resolvedId, reportParams);

  const report =
    (reportRes as { data?: { data?: unknown } })?.data?.data ??
    (reportRes as { data?: unknown })?.data;
  const breakdown = (breakdownRes as { data?: unknown })?.data;

  return (
    <div className="page-container">
      <button
        type="button"
        className="dash-btn dash-btn--ghost"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon">
            <FileText size={20} />
          </div>
          <div>
            <h2 className="page-title">{studentName}'s IT Report</h2>
            <p className="page-sub">
              AI-generated industrial training performance analysis
            </p>
          </div>
        </div>
      </div>

      <div className="srm-root">
        {/* ── Full Report Section ──────────────────────────────────────── */}
        <section className="srm-section">
          <div className="srm-section-label">
            <BookOpen size={14} />
            Full IT Report
          </div>
          {loadingReport ? (
            <ReportSkeleton />
          ) : report ? (
            <FullReportBody
              report={report as Parameters<typeof FullReportBody>[0]["report"]}
            />
          ) : (
            <EmptyReportState message="No IT report has been generated for this student yet." />
          )}
        </section>

        {/* ── AI Score Breakdown Section ──────────────────────────────────── */}
        <section className="srm-section">
          <div className="srm-section-label">
            <BarChart3 size={14} />
            AI Score Breakdown
          </div>
          {loadingBreakdown ? (
            <ReportSkeleton />
          ) : breakdown ? (
            <AdminScoreBreakdown data={breakdown as AdminBreakdownData} />
          ) : (
            <EmptyReportState message="No AI score breakdown available for this student." />
          )}
        </section>
      </div>
    </div>
  );
}
