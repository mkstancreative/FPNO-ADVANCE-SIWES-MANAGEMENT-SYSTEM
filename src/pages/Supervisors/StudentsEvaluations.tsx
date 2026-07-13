import { useState } from "react";
import { ClipboardList, Send, Search } from "lucide-react";
import SearchInput from "../../components/ui/SearchInput/SearchInput";
import ResetButton from "../../components/ui/ResetButton/ResetButton";
import StudentEvaluationTable from "../../components/supervisor/tables/StudentEvaluationTable";
import EvaluationForm from "../../components/supervisor/forms/EvaluationForm";
import SubmitEvaluationForm from "../../components/supervisor/forms/SubmitEvaluationForm";
import { useEvaluations } from "../../hooks/useSchoolSupervisor";
import type { PendingEvaluation } from "../../api/types/schoolSupervisor";
import { useModal } from "../../context/ModalContext";
import AddButton from "../../components/ui/AddButton/AddButton";

export default function StudentsEvaluations() {
  const [filters, setFilters] = useState({
    search: "",
    page: 1,
    limit: 10,
  });

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [evalTarget, setEvalTarget] = useState<PendingEvaluation | null>(null);
  const [submitOpen, setSubmitOpen] = useState(false);

  const { data, isLoading } = useEvaluations({
    search: filters.search || undefined,
    page: filters.page,
    limit: filters.limit,
  });

  const { openModal, closeModal } = useModal();

  const rows = data?.data ?? [];

  const meta = {
    count: data?.total ?? 0,
    page: data?.page ?? 1,
    pages: data?.pages ?? 1,
    limit: filters.limit,
    hasPrev: (data?.page ?? 1) > 1,
    hasNext: (data?.page ?? 1) < (data?.pages ?? 1),
  };

  // ── Selection helpers ──────────────────────────────────────────────────────

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleToggleAll = () => {
    const pageIds = rows.map((r) => r.student._id);
    const allSelected = pageIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...pageIds])]);
    }
  };

  // ── Request evaluations (bulk) ─────────────────────────────────────────────

  const handleOpenRequestModal = () => {
    openModal(
      <EvaluationForm
        isOpen
        onClose={closeModal}
        selectedIds={selectedIds}
        onSuccess={() => setSelectedIds([])}
      />,
    );
  };

  // ── Submit individual evaluation ───────────────────────────────────────────

  const handleSubmitEvaluation = (row: PendingEvaluation) => {
    setEvalTarget(row);
    setSubmitOpen(true);
  };

  const handleReset = () => {
    setFilters({ search: "", page: 1, limit: 10 });
    setSelectedIds([]);
  };

  return (
    <div className="page-container">
      {/* ── Page header ── */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon orange">
            <ClipboardList size={20} />
          </div>
          <div>
            <h2 className="page-title">Student Evaluations</h2>
            <p className="page-sub">
              Submit and track school evaluations for assigned students
            </p>
          </div>
        </div>

        {/* Bulk request button — only visible when rows are selected */}
        {selectedIds.length > 0 && (
          <AddButton
            text={`Request Evaluation (${selectedIds.length})`}
            icon={<Send size={14} />}
            onClick={handleOpenRequestModal}
          />
        )}
      </div>

      {/* ── Filters ── */}
      <div className="filter-wrapper">
        <SearchInput
          value={filters.search}
          onChange={(val) =>
            setFilters((prev) => ({ ...prev, search: val, page: 1 }))
          }
          placeholder="Search by name or reg number…"
          onClear={() =>
            setFilters((prev) => ({ ...prev, search: "", page: 1 }))
          }
        />
        <ResetButton onClick={handleReset} />
      </div>

      {/* ── Summary stats ── */}
      {!isLoading && rows.length > 0 && (
        <div className="eval-summary-bar">
          <span className="eval-summary-item">
            <Search size={12} />
            {data?.total ?? 0} students found
          </span>
          <span className="eval-summary-item eval-summary-item--pending">
            {rows.filter((r) => !r.schoolSubmitted).length} pending school eval
          </span>
          <span className="eval-summary-item eval-summary-item--done">
            {rows.filter((r) => r.schoolSubmitted).length} completed
          </span>
          <style>{`
            .eval-summary-bar{display:flex;align-items:center;gap:16px;padding:10px 16px;background:var(--color-bg-secondary);border:1px solid var(--color-border);border-radius:10px;font-size:12.5px;color:var(--color-text-secondary);flex-wrap:wrap}
            .eval-summary-item{display:inline-flex;align-items:center;gap:5px}
            .eval-summary-item--pending{color:#f59e0b;font-weight:600}
            .eval-summary-item--done{color:#10b981;font-weight:600}
          `}</style>
        </div>
      )}

      {/* ── Table ── */}
      <div className="table-wrapper">
        <StudentEvaluationTable
          data={rows}
          isLoading={isLoading}
          meta={meta}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleAll={handleToggleAll}
          onSubmitEvaluation={handleSubmitEvaluation}
          onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
          onLimitChange={(limit) =>
            setFilters((prev) => ({ ...prev, limit, page: 1 }))
          }
        />
      </div>

      {/* ── Individual submit evaluation modal ── */}
      {evalTarget && (
        <SubmitEvaluationForm
          isOpen={submitOpen}
          onClose={() => {
            setSubmitOpen(false);
            setEvalTarget(null);
          }}
          studentId={evalTarget.student._id}
          studentName={evalTarget.student.name}
          onSuccess={() => {
            setSubmitOpen(false);
            setEvalTarget(null);
          }}
        />
      )}
    </div>
  );
}
