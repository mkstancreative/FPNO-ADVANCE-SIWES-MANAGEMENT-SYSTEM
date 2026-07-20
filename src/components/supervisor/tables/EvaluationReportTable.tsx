import type { EvaluationReportItem } from "../../../api/services/schoolSupervisors";
import type { Column, TableMeta } from "../../ui/GeneralTable/GeneralTable";
import GeneralTable from "../../ui/GeneralTable/GeneralTable";

// ─── Grade badge ─────────────────────────────────────────────────────────────

const GRADE_COLORS: Record<string, { bg: string; color: string }> = {
  A: { bg: "rgba(16,185,129,.12)", color: "#10b981" },
  B: { bg: "rgba(99,102,241,.12)", color: "#6366f1" },
  C: { bg: "rgba(245,158,11,.12)", color: "#f59e0b" },
  D: { bg: "rgba(239,68,68,.08)", color: "#ef4444" },
  F: { bg: "rgba(239,68,68,.15)", color: "#dc2626" },
};

function GradeBadge({ grade }: { grade?: string }) {
  if (!grade)
    return <span style={{ color: "var(--color-text-subtle)" }}>—</span>;
  const g = grade.toUpperCase();
  const palette = GRADE_COLORS[g] ?? {
    bg: "rgba(100,116,139,.1)",
    color: "#64748b",
  };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 700,
        background: palette.bg,
        color: palette.color,
        letterSpacing: "0.04em",
      }}
    >
      {g}
    </span>
  );
}

function ScoreCell({ value }: { value?: number }) {
  if (value === undefined || value === null)
    return <span style={{ color: "var(--color-text-subtle)" }}>—</span>;
  return (
    <span style={{ fontWeight: 600, fontSize: 13 }}>{value.toFixed(1)}</span>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface EvaluationReportTableProps {
  data: EvaluationReportItem[];
  isLoading: boolean;
  meta: TableMeta;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EvaluationReportTable({
  data,
  isLoading,
  meta,
  onPageChange,
  onLimitChange,
}: EvaluationReportTableProps) {
  const columns: Column<EvaluationReportItem>[] = [
    {
      header: "#",
      render: (_row, idx) => (
        <span style={{ color: "var(--color-text-subtle)", fontSize: 12 }}>
          {(meta.page - 1) * meta.limit + idx + 1}
        </span>
      ),
    },
    {
      header: "Student",
      render: (row) => (
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--color-text-primary)",
            }}
          >
            {row.student.name}
          </div>
          <div
            style={{
              fontSize: 11.5,
              fontFamily: "monospace",
              color: "var(--color-text-secondary)",
              marginTop: 2,
            }}
          >
            {row.student.registrationNumber}
          </div>
        </div>
      ),
    },
    {
      header: "Department",
      render: (row) => {
        const dept = row.student?.department;
        let deptName = "—";
        if (dept) {
          if (typeof dept === "string") {
            deptName = dept;
          } else if (typeof dept === "object") {
            deptName = dept.name || dept.code || "—";
          }
        }
        return (
          <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
            {deptName}
          </span>
        );
      },
    },
    {
      header: "Batch",
      render: (row) => (
        <span style={{ fontSize: 13 }}>{row.batch?.name ?? "—"}</span>
      ),
    },
    {
      header: "Type",
      render: (row) => {
        const type = row.type || "final";
        return (
          <span
            style={{
              display: "inline-block",
              padding: "2px 9px",
              borderRadius: 20,
              fontSize: 11.5,
              fontWeight: 600,
              background:
                type === "final"
                  ? "rgba(13,148,136,.1)"
                  : "rgba(99,102,241,.1)",
              color: type === "final" ? "var(--color-accent)" : "#6366f1",
              textTransform: "capitalize",
            }}
          >
            {type}
          </span>
        );
      },
    },
    {
      header: "School Score",
      render: (row) => (
        <ScoreCell value={row.scores?.school ?? row.schoolScore} />
      ),
    },
    {
      header: "Company Score",
      render: (row) => (
        <ScoreCell value={row.scores?.industrial ?? row.industrialScore} />
      ),
    },
    {
      header: "Final Score",
      render: (row) => (
        <ScoreCell value={row.scores?.composite ?? row.finalScore} />
      ),
    },
    {
      header: "Grade",
      render: (row) => <GradeBadge grade={row.finalGrade ?? row.grade} />,
    },
    {
      header: "Status",
      render: (row) => (
        <span
          style={{
            display: "inline-block",
            padding: "2px 9px",
            borderRadius: 20,
            fontSize: 11.5,
            fontWeight: 600,
            background:
              row.status === "completed"
                ? "rgba(16,185,129,.1)"
                : "rgba(245,158,11,.1)",
            color: row.status === "completed" ? "#10b981" : "#f59e0b",
            textTransform: "capitalize",
          }}
        >
          {row.status}
        </span>
      ),
    },
  ];

  return (
    <GeneralTable<EvaluationReportItem>
      columns={columns}
      data={data}
      loading={isLoading}
      meta={meta}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
    />
  );
}
