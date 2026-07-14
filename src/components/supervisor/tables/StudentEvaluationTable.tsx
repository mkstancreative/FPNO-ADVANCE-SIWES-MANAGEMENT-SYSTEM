import { type PendingEvaluation } from "../../../api/types/schoolSupervisor";
import type { Column, TableMeta } from "../../ui/GeneralTable/GeneralTable";
import GeneralTable from "../../ui/GeneralTable/GeneralTable";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";
import { CheckSquare, Square, ClipboardCheck } from "lucide-react";

// ─── Submission indicator ─────────────────────────────────────────────────────

function SubmittedPill({
  submitted,
  label,
}: {
  submitted: boolean;
  label: string;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "2px 9px",
        borderRadius: 20,
        fontSize: 11.5,
        fontWeight: 600,
        background: submitted ? "rgba(16,185,129,.12)" : "rgba(239,68,68,.08)",
        color: submitted ? "#10b981" : "#ef4444",
      }}
    >
      {submitted ? <CheckSquare size={11} /> : <Square size={11} />}
      {label}
    </span>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface StudentEvaluationTableProps {
  data: PendingEvaluation[];
  isLoading: boolean;
  meta: TableMeta;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleAll: () => void;
  onSubmitEvaluation: (row: PendingEvaluation) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function StudentEvaluationTable({
  data,
  isLoading,
  meta,
  selectedIds,
  onToggleSelect,
  onToggleAll,
  onSubmitEvaluation,
  onPageChange,
  onLimitChange,
}: StudentEvaluationTableProps) {
  const allSelected =
    data.length > 0 && data.every((r) => selectedIds.includes(r.student._id));

  const columns: Column<PendingEvaluation>[] = [
    {
      header: "✓",
      render: (row) => (
        <button
          className="eval-select-btn"
          onClick={() => onToggleSelect(row.student._id)}
          title={selectedIds.includes(row.student._id) ? "Deselect" : "Select"}
        >
          {selectedIds.includes(row.student._id) ? (
            <CheckSquare size={16} color="var(--color-accent)" />
          ) : (
            <Square size={16} color="var(--color-text-secondary)" />
          )}
        </button>
      ),
    },
    {
      header: "Student",
      render: (row) => (
        <div>
          <div className="eval-student-name">{row.student.name}</div>
          <div className="eval-student-reg">
            {row.student.registrationNumber}
          </div>
        </div>
      ),
    },
    {
      header: "Department",
      render: (row) => row.student.department,
    },
    {
      header: "IT Status",
      render: (row) => <StatusBadge status={row.itStatus} />,
    },
    {
      header: "School Eval",
      render: (row) => (
        <SubmittedPill
          submitted={row.schoolSubmitted}
          label={row.schoolSubmitted ? "Done" : "Pending"}
        />
      ),
    },
    {
      header: "Company Eval",
      render: (row) => (
        <SubmittedPill
          submitted={row.industrialSubmitted}
          label={row.industrialSubmitted ? "Done" : "Pending"}
        />
      ),
    },
    {
      header: "Needs Evaluation",
      render: (row) => (
        <SubmittedPill
          submitted={!row.needsEvaluation}
          label={row.needsEvaluation ? "Yes" : "No"}
        />
      ),
    },
    {
      header: "Action",
      render: (row) => (
        <button
          className={`eval-submit-btn ${row.schoolSubmitted ? "eval-submit-btn--done" : ""}`}
          onClick={() => !row.schoolSubmitted && onSubmitEvaluation(row)}
          disabled={row.schoolSubmitted}
          title={
            row.schoolSubmitted ? "Already submitted" : "Submit evaluation"
          }
        >
          <ClipboardCheck size={13} />
          {row.schoolSubmitted ? "Submitted" : "Evaluate"}
        </button>
      ),
    },
  ];

  return (
    <>
      <style>{`
        .eval-select-btn{background:none;border:none;padding:0;cursor:pointer;display:flex;align-items:center}
        .eval-student-name{font-size:13px;font-weight:600;color:var(--color-text-primary)}
        .eval-student-reg{font-size:11.5px;font-family:monospace;color:var(--color-text-secondary);margin-top:2px}
        .eval-select-all-wrap{display:flex;align-items:center;gap:6px;cursor:pointer;user-select:none;font-size:12px;color:var(--color-text-secondary)}
        .eval-submit-btn{display:inline-flex;align-items:center;gap:5px;padding:5px 12px;border-radius:8px;border:1.5px solid var(--color-accent);background:var(--color-accent-muted);color:var(--color-accent);font-size:12px;font-weight:700;cursor:pointer;transition:opacity .15s,background .15s}
        .eval-submit-btn:hover:not(:disabled){background:var(--color-accent);color:#fff}
        .eval-submit-btn--done{border-color:var(--color-border);background:transparent;color:var(--color-text-secondary);cursor:not-allowed;opacity:.7}
      `}</style>

      {/* Select-all header row */}
      <div className="eval-select-all-wrap" style={{ marginBottom: 10 }}>
        <button className="eval-select-btn" onClick={onToggleAll}>
          {allSelected ? (
            <CheckSquare size={16} color="var(--color-accent)" />
          ) : (
            <Square size={16} color="var(--color-text-secondary)" />
          )}
        </button>
        {allSelected ? "Deselect all on this page" : "Select all on this page"}
        {selectedIds.length > 0 && (
          <span
            style={{
              marginLeft: 8,
              color: "var(--color-accent)",
              fontWeight: 600,
            }}
          >
            ({selectedIds.length} selected)
          </span>
        )}
      </div>

      <GeneralTable<PendingEvaluation>
        columns={columns}
        data={data}
        loading={isLoading}
        meta={meta}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
      />
    </>
  );
}
