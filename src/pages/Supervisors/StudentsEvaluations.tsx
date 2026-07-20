import { useState } from "react";
import { ClipboardList, Send } from "lucide-react";
import SearchInput from "../../components/ui/SearchInput/SearchInput";
import ResetButton from "../../components/ui/ResetButton/ResetButton";
import StudentEvaluationTable from "../../components/supervisor/tables/StudentEvaluationTable";
import EvaluationForm from "../../components/supervisor/forms/EvaluationForm";
import SubmitEvaluationForm from "../../components/supervisor/forms/SubmitEvaluationForm";
import { useEvaluations, useMyBatches } from "../../hooks/useSchoolSupervisor";
import type { PendingEvaluation } from "../../api/types/schoolSupervisor";
import { useModal } from "../../context/ModalContext";
import AddButton from "../../components/ui/AddButton/AddButton";
import SelectFilter from "../../components/ui/SelectFilter/SelectFilter";
import { useGetMe } from "../../hooks/useAuth";
import type { ITStatus } from "../../api/types/student";

export default function StudentsEvaluations() {
  const [filters, setFilters] = useState({
    search: "",
    page: 1,
    limit: 20,
    batchId: "",
    itStatus: "" as ITStatus | "",
    hasSchoolEvaluation: "",
    hasIndustrialEvaluation: "",
    department: "",
  });

  const setField = <K extends keyof typeof filters>(
    field: K,
    value: (typeof filters)[K],
  ) => {
    setFilters((prev) => ({ ...prev, [field]: value, page: 1 }));
  };

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [evalTarget, setEvalTarget] = useState<PendingEvaluation | null>(null);
  const [submitOpen, setSubmitOpen] = useState(false);

  const { data, isLoading } = useEvaluations({
    search: filters.search || undefined,
    page: filters.page,
    limit: filters.limit,
    batchId: filters.batchId || undefined,
    itStatus: filters.itStatus || undefined,
    hasSchoolEvaluation: filters.hasSchoolEvaluation || undefined,
    hasIndustrialEvaluation: filters.hasIndustrialEvaluation || undefined,
    department: filters.department || undefined,
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

  const { data: batches } = useMyBatches();
  const { data: meData } = useGetMe();

  interface ProfileInfo {
    departments?: string[];
    department?: string | { name: string; code?: string };
  }

  const profile = meData?.data?.profile as ProfileInfo | undefined;
  const departments: string[] = Array.isArray(profile?.departments)
    ? profile.departments
    : typeof profile?.department === "string"
      ? [profile.department]
      : profile?.department?.name
        ? [profile.department.name]
        : [];

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

  const handleRequestIndividualEvaluation = (row: PendingEvaluation) => {
    openModal(
      <EvaluationForm
        isOpen
        onClose={closeModal}
        selectedIds={[row.student._id]}
        onSuccess={() => {}}
      />,
    );
  };

  const handleReset = () => {
    setFilters({
      search: "",
      page: 1,
      limit: 20,
      batchId: "",
      itStatus: "",
      hasSchoolEvaluation: "",
      hasIndustrialEvaluation: "",
      department: "",
    });
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

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {/* Bulk request button — only visible when rows are selected */}
          {selectedIds.length > 0 && (
            <AddButton
              text={`Request Evaluation (${selectedIds.length})`}
              icon={<Send size={14} />}
              onClick={handleOpenRequestModal}
            />
          )}
        </div>
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
      </div>

      <div className="filter-selects-block">
        <SelectFilter
          label="Batch"
          options={[
            { value: "", label: "All Batches" },
            ...(batches?.data.map((b) => ({ value: b._id, label: b.name })) ||
              []),
          ]}
          value={filters.batchId}
          onChange={(value) => setField("batchId", value)}
          name="batchId"
        />
        <SelectFilter
          label="IT Status"
          options={[
            { value: "", label: "All Statuses" },
            { value: "uploaded", label: "Uploaded" },
            { value: "pending_verification", label: "Pending Verification" },
            { value: "seeking_placement", label: "Seeking Placement" },
            { value: "active", label: "Active" },
            { value: "placed", label: "Placed" },
            { value: "completed", label: "Completed" },
          ]}
          value={filters.itStatus}
          onChange={(value) => setField("itStatus", value as ITStatus | "")}
          name="itStatus"
        />
        <SelectFilter
          label="School Eval"
          options={[
            { value: "", label: "All" },
            { value: "true", label: "Done" },
            { value: "false", label: "Pending" },
          ]}
          value={filters.hasSchoolEvaluation}
          onChange={(value) => setField("hasSchoolEvaluation", value)}
          name="hasSchoolEvaluation"
        />
        <SelectFilter
          label="Company Eval"
          options={[
            { value: "", label: "All" },
            { value: "true", label: "Done" },
            { value: "false", label: "Pending" },
          ]}
          value={filters.hasIndustrialEvaluation}
          onChange={(value) => setField("hasIndustrialEvaluation", value)}
          name="hasIndustrialEvaluation"
        />
        <SelectFilter
          label="Department"
          options={[
            { value: "", label: "All Departments" },
            ...departments.map((d) => ({ value: d, label: d })),
          ]}
          value={filters.department}
          onChange={(value) => setField("department", value)}
          name="department"
        />
        <ResetButton onClick={handleReset} />
      </div>

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
          onRequestEvaluation={handleRequestIndividualEvaluation}
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
