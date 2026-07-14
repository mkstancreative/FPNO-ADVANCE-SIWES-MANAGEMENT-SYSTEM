import { useState } from "react";
import { Zap } from "lucide-react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import {
  useAutoAssignSupervisors,
  useBatches,
} from "../../../hooks/useBatches";
import type { Batch, AutoAssignResponse } from "../../../api/types/batch";
import SearchableSelect from "../../ui/SearchableSelect/SearchableSelect";
import ImportResult, {
  type ImportResponse,
} from "../../ui/ImportResult/ImportResult";

export default function AutoAssignSupervisors({
  isOpen,
  onClose,
  batch,
  departments,
}: {
  isOpen: boolean;
  onClose: () => void;
  /** Lock to a specific batch (e.g. when opened from the Batches page). Omit to
   * let the admin optionally pick a batch (e.g. from Unassigned Students). */
  batch?: Batch;
  departments: string[] | undefined;
}) {
  const { mutate: autoAssign, isPending: assigning } =
    useAutoAssignSupervisors();
  const { data: batchesData } = useBatches({ limit: 1000 });

  const [selectedBatchId, setSelectedBatchId] = useState<string>(
    batch?._id ?? "",
  );
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [result, setResult] = useState<AutoAssignResponse | null>(null);

  const handleSubmit = () => {
    autoAssign(
      {
        ...(selectedBatchId ? { batchId: selectedBatchId } : {}),
        ...(selectedDepartment ? { department: selectedDepartment } : {}),
      },
      {
        onSuccess: (data) => {
          setResult(data as AutoAssignResponse);
        },
      },
    );
  };

  const handleClose = () => {
    setSelectedBatchId(batch?._id ?? "");
    setSelectedDepartment("");
    setResult(null);
    onClose();
  };

  // ── Show results if available ──
  if (result) {
    // Transform AutoAssignResponse to ImportResponse format
    const importResult: ImportResponse = {
      success: result.success,
      message: result.message,
      data: {
        total: result.data.total,
        successful: result.data.assigned,
        failed: result.data.failed,
        errors: result.data.errors.map((err) => ({
          row: err.student,
          error: err.error,
        })),
      },
    };

    return (
      <ImportResult
        isOpen={isOpen}
        result={importResult}
        onClose={handleClose}
        title="Assignment Results"
        successLabel="assigned"
        failedLabel="failed"
      />
    );
  }

  const footer = (
    <>
      <button
        type="button"
        className="modal-cancel"
        onClick={onClose}
        disabled={assigning}
      >
        Cancel
      </button>
      <button
        type="button"
        className="modal-submit"
        onClick={handleSubmit}
        disabled={assigning}
      >
        {assigning ? "Assigning…" : "Auto-Assign"}
      </button>
    </>
  );

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Auto-Assign Supervisors"
      subtitle={
        batch
          ? `Batch: ${batch.name} · ${batch.program} ${batch.level}`
          : "Assign every internship with no school supervisor yet"
      }
      icon={<Zap size={16} />}
      size="medium"
      footer={footer}
    >
      <div className="form-grid">
        {/* ── Info banner ── */}
        <div className="form-group col-1" style={{ marginBottom: 4 }}>
          <p
            style={{
              fontSize: 13,
              color: "var(--color-text-secondary)",
              lineHeight: 1.6,
            }}
          >
            Assigns department's supervisor to every internship without a
            school supervisor. Optionally narrow it to a specific batch
            and/or department — leave either blank to run across everything.
          </p>
        </div>

        {/* ── Batch select (only when not locked to one) ── */}
        {!batch && (
          <div className="form-group col-2">
            <label className="modal-label">Batch</label>
            <SearchableSelect
              options={(batchesData?.data ?? []).map((b) => ({
                value: b._id,
                label: `${b.name} (${b.session})`,
              }))}
              value={selectedBatchId}
              onChange={(val) => setSelectedBatchId(val as string)}
              clearable
              placeholder="All batches…"
              searchPlaceholder="Search batches…"
              loading={batchesData === undefined}
              noOptionsText="No batches found"
            />
          </div>
        )}

        {/* ── Department select ── */}
        <div className="form-group col-2">
          <label className="modal-label">Department</label>
          <SearchableSelect
            options={(departments ?? [])
              .filter((d) => d != null)
              .map((d) => ({ value: d, label: d }))}
            value={selectedDepartment}
            onChange={(val) => setSelectedDepartment(val as string)}
            clearable
            placeholder="All departments…"
            searchPlaceholder="Search departments…"
            loading={departments === undefined}
            noOptionsText="No departments found"
          />
        </div>
      </div>
    </CustomModal>
  );
}
