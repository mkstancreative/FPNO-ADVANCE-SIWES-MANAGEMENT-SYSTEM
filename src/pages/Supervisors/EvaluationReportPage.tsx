import { useState } from "react";
import { ClipboardList, FileSpreadsheet, Loader2 } from "lucide-react";
import SearchInput from "../../components/ui/SearchInput/SearchInput";
import ResetButton from "../../components/ui/ResetButton/ResetButton";
import SelectFilter from "../../components/ui/SelectFilter/SelectFilter";
import EvaluationReportTable from "../../components/supervisor/tables/EvaluationReportTable";
import {
  useEvaluationReport,
  useExportSchoolEvaluations,
  useMyBatches,
} from "../../hooks/useSchoolSupervisor";
import { useGetMe } from "../../hooks/useAuth";
import type { EvaluationReportParams } from "../../api/services/schoolSupervisors";

// ─── Filter state ─────────────────────────────────────────────────────────────

interface Filters extends EvaluationReportParams {
  page: number;
  limit: number;
}

const DEFAULT_FILTERS: Filters = {
  search: "",
  department: "",
  batchId: "",
  internshipId: "",
  status: "completed",
  grade: "",
  type: "final",
  page: 1,
  limit: 20,
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function EvaluationReportPage() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const setField = <K extends keyof Filters>(field: K, value: Filters[K]) => {
    setFilters((prev) => ({ ...prev, [field]: value, page: 1 }));
  };

  const handleReset = () => setFilters(DEFAULT_FILTERS);

  // ── Data ──────────────────────────────────────────────────────────────────

  const queryParams: EvaluationReportParams = {
    search: filters.search || undefined,
    department: filters.department || undefined,
    batchId: filters.batchId || undefined,
    internshipId: filters.internshipId || undefined,
    status: filters.status || undefined,
    grade: filters.grade || undefined,
    type: filters.type || undefined,
    page: filters.page,
    limit: filters.limit,
  };

  const { data, isLoading } = useEvaluationReport(queryParams);
  const { mutate: exportReport, isPending: isExporting } =
    useExportSchoolEvaluations();

  const { data: batches } = useMyBatches();
  const { data: meData } = useGetMe();

  // ── Department list from supervisor profile ────────────────────────────────
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

  // ── Table meta ────────────────────────────────────────────────────────────
  const rows = data?.data ?? [];
  const meta = {
    count: data?.total ?? 0,
    page: data?.page ?? 1,
    pages: data?.pages ?? 1,
    limit: filters.limit,
    hasPrev: (data?.page ?? 1) > 1,
    hasNext: (data?.page ?? 1) < (data?.pages ?? 1),
  };

  // ── Export with current filters ───────────────────────────────────────────
  const handleExport = () => exportReport(queryParams);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="page-container">
      {/* ── Page header ── */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon orange">
            <ClipboardList size={20} />
          </div>
          <div>
            <h2 className="page-title">Evaluation Report</h2>
            <p className="page-sub">
              View and export composite evaluation results for assigned students
            </p>
          </div>
        </div>

        <div className="page-header-right">
          {/* Export button */}
          <button
            type="button"
            className="dash-btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              height: 38,
              fontSize: 13,
              fontWeight: 600,
              background: "linear-gradient(135deg, #10b981, #059669)",
              color: "#fff",
              padding: "0 16px",
              borderRadius: 10,
              cursor: isExporting ? "not-allowed" : "pointer",
              opacity: isExporting ? 0.7 : 1,
              transition: "all 0.15s ease",
              border: "none",
            }}
            disabled={isExporting}
            onClick={handleExport}
          >
            {isExporting ? (
              <>
                <Loader2
                  size={15}
                  style={{ animation: "spin 1s linear infinite" }}
                />
                Exporting…
              </>
            ) : (
              <>
                <FileSpreadsheet size={15} />
                Export Excel
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="filter-wrapper">
        <SearchInput
          value={filters.search ?? ""}
          onChange={(val) => setField("search", val)}
          placeholder="Search by name or reg number…"
          onClear={() => setField("search", "")}
        />
      </div>

      {/* ── Select filters ── */}
      <div className="filter-selects-block">
        <SelectFilter
          label="Batch"
          options={[
            { value: "", label: "All Batches" },
            ...(batches?.data.map((b) => ({ value: b._id, label: b.name })) ??
              []),
          ]}
          value={filters.batchId ?? ""}
          onChange={(value) => setField("batchId", value)}
          name="batchId"
        />

        <SelectFilter
          label="Grade"
          options={[
            { value: "", label: "All Grades" },
            { value: "A", label: "A" },
            { value: "B", label: "B" },
            { value: "C", label: "C" },
            { value: "D", label: "D" },
            { value: "F", label: "F" },
          ]}
          value={filters.grade ?? ""}
          onChange={(value) => setField("grade", value)}
          name="grade"
        />

        {departments.length > 0 && (
          <SelectFilter
            label="Department"
            options={[
              { value: "", label: "All Departments" },
              ...departments.map((d) => ({ value: d, label: d })),
            ]}
            value={filters.department ?? ""}
            onChange={(value) => setField("department", value)}
            name="department"
          />
        )}

        <ResetButton onClick={handleReset} />
      </div>



      {/* ── Table ── */}
      <div className="table-wrapper">
        <EvaluationReportTable
          data={rows}
          isLoading={isLoading}
          meta={meta}
          onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
          onLimitChange={(limit) =>
            setFilters((prev) => ({ ...prev, limit, page: 1 }))
          }
        />
      </div>

      {/* spin keyframe for export loader */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
