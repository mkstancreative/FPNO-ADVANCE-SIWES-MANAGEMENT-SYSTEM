import CustomModal from "../../ui/CustomModal/CustomModal";
import {
  useStudentReport,
  useAiScoreBreakdown,
} from "../../../hooks/useStudents";
import {
  FullReportBody,
  ReportSkeleton,
  EmptyReportState,
  ScoreBar,
  ScoreRing,
  ReasoningList,
} from "../../shared/report/ReportComponents";
import { formatBreakdownKey } from "../../shared/report/reportUtils";
import { FileText, BarChart3, BookOpen, Zap, Clock } from "lucide-react";
import "./StudentReportModal.css";

interface StudentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
}

export default function StudentReportModal({
  isOpen,
  onClose,
  studentId,
  studentName,
}: StudentReportModalProps) {
  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title={`${studentName}'s IT Report`}
      subtitle="AI-generated industrial training performance analysis"
      icon={<FileText size={16} />}
      size="wide"
    >
      <StudentReportContent studentId={studentId} studentName={studentName} />
    </CustomModal>
  );
}

function StudentReportContent({
  studentId,
}: {
  studentId: string;
  studentName: string;
}) {
  const { data: reportRes, isLoading: loadingReport } =
    useStudentReport(studentId);
  const { data: breakdownRes, isLoading: loadingBreakdown } =
    useAiScoreBreakdown(studentId);

  const report =
    (reportRes as { data?: { data?: unknown } })?.data?.data ??
    (reportRes as { data?: unknown })?.data;
  const breakdown = (breakdownRes as { data?: unknown })?.data;

  return (
    <div className="srm-root">
      {/* ── Full Report Section ──────────────────────────────────────────── */}
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

      {/* ── AI Score Breakdown Section ───────────────────────────────────── */}
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
  );
}

// ── Admin breakdown types ─────────────────────────────────────────────────────
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
