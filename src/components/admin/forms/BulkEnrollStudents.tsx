import { useState } from "react";
import { UserPlus } from "lucide-react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import Spinner from "../../ui/Spinner/Spinner";
import MultiSelectPicker from "../../ui/MultiSelectPicker/MultiSelectPicker";
import { useBatches } from "../../../hooks/useBatches";
import { useStudents } from "../../../hooks/useStudents";
import { useBulkEnrollStudents } from "../../../hooks/useInternships";
import ImportResult, {
  type ImportResponse,
} from "../../ui/ImportResult/ImportResult";
import type { BulkEnrollResponse } from "../../../api/types/internship";
import type { Batch } from "../../../api/types/batch";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** Preselect the target batch (e.g. opened from the Batches page). */
  targetBatch?: Batch;
}

type Mode = "studentIds" | "registrationNumbers" | "sourceBatchId";

export default function BulkEnrollStudents({
  isOpen,
  onClose,
  targetBatch,
}: Props) {
  const [batchId, setBatchId] = useState(targetBatch?._id ?? "");
  const [mode, setMode] = useState<Mode>("studentIds");
  const [studentIds, setStudentIds] = useState<string[]>([]);
  const [regNumbersText, setRegNumbersText] = useState("");
  const [sourceBatchId, setSourceBatchId] = useState("");
  const [result, setResult] = useState<BulkEnrollResponse | null>(null);

  const { data: batchesData } = useBatches({ limit: 1000 });
  const { data: studentsData } = useStudents({ limit: 1000 });
  const { mutate: enroll, isPending } = useBulkEnrollStudents();

  const batches = batchesData?.data ?? [];
  const students = studentsData?.data ?? [];

  const studentOptions = students.map((s) => ({
    id: s._id,
    name: `${s.user.firstName} ${s.user.lastName} (${s.registrationNumber})`,
  }));

  const handleClose = () => {
    setBatchId(targetBatch?._id ?? "");
    setMode("studentIds");
    setStudentIds([]);
    setRegNumbersText("");
    setSourceBatchId("");
    setResult(null);
    onClose();
  };

  const isValid =
    !!batchId &&
    ((mode === "studentIds" && studentIds.length > 0) ||
      (mode === "registrationNumbers" && regNumbersText.trim().length > 0) ||
      (mode === "sourceBatchId" && !!sourceBatchId));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    const payload =
      mode === "studentIds"
        ? { batchId, studentIds }
        : mode === "registrationNumbers"
          ? {
              batchId,
              registrationNumbers: regNumbersText
                .split(/[\n,]/)
                .map((s) => s.trim())
                .filter(Boolean),
            }
          : { batchId, sourceBatchId };

    enroll(payload, { onSuccess: (data) => setResult(data) });
  };

  if (result) {
    const importResult: ImportResponse = {
      success: result.success,
      message: result.message,
      data: {
        total: result.data.total,
        successful: result.data.successful,
        failed: result.data.failed,
        errors: result.data.errors.map((err) => ({
          row: err.row ?? err.studentId ?? "—",
          error: err.error,
        })),
      },
    };
    return (
      <ImportResult
        isOpen={isOpen}
        result={importResult}
        onClose={handleClose}
        title="Enrollment Results"
        successLabel="enrolled"
        failedLabel="failed"
      />
    );
  }

  const footer = (
    <>
      <button
        className="modal-cancel"
        onClick={handleClose}
        disabled={isPending}
      >
        Cancel
      </button>
      <button
        className="modal-submit"
        form="bulk-enroll-form"
        type="submit"
        disabled={isPending || !isValid}
      >
        {isPending ? <Spinner size={14} color="#fff" text="" /> : "Enroll"}
      </button>
    </>
  );

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Bulk Enroll Students"
      subtitle="Enroll existing students into a batch (creates a new internship each)"
      icon={<UserPlus size={16} />}
      size="medium"
      footer={footer}
    >
      <form
        id="bulk-enroll-form"
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
        <div className="form-group">
          <label className="modal-label">
            Target Batch <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <select
            className="modal-input"
            required
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            disabled={!!targetBatch}
          >
            <option value="" disabled hidden>
              Select batch
            </option>
            {batches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name} ({b.session})
              </option>
            ))}
          </select>
        </div>

        <div
          style={{
            display: "flex",
            gap: 0,
            borderRadius: 10,
            overflow: "hidden",
            border: "1px solid var(--color-border)",
          }}
        >
          {(
            [
              { key: "studentIds", label: "Pick Students" },
              { key: "registrationNumbers", label: "Reg. Numbers" },
              { key: "sourceBatchId", label: "Roll Over a Batch" },
            ] as { key: Mode; label: string }[]
          ).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setMode(t.key)}
              style={{
                flex: 1,
                padding: "8px 4px",
                background: mode === t.key ? "var(--color-accent)" : "transparent",
                color: mode === t.key ? "#fff" : "var(--color-text-secondary)",
                border: "none",
                fontWeight: 600,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {mode === "studentIds" && (
          <div className="form-group">
            <label className="modal-label">Students</label>
            <MultiSelectPicker
              options={studentOptions}
              value={studentIds}
              onChange={(ids) => setStudentIds(ids as string[])}
              placeholder="Search and select students…"
            />
          </div>
        )}

        {mode === "registrationNumbers" && (
          <div className="form-group">
            <label className="modal-label">Registration Numbers</label>
            <textarea
              className="modal-input"
              rows={4}
              placeholder="ND/22/001, ND/22/002 (comma or newline separated)"
              value={regNumbersText}
              onChange={(e) => setRegNumbersText(e.target.value)}
            />
          </div>
        )}

        {mode === "sourceBatchId" && (
          <div className="form-group">
            <label className="modal-label">
              Roll students over from batch
            </label>
            <select
              className="modal-input"
              value={sourceBatchId}
              onChange={(e) => setSourceBatchId(e.target.value)}
            >
              <option value="" disabled hidden>
                Select source batch
              </option>
              {batches
                .filter((b) => b._id !== batchId)
                .map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name} ({b.session})
                  </option>
                ))}
            </select>
            <p style={{ margin: "4px 0 0", fontSize: 11, color: "#94a3b8" }}>
              Every student currently in this batch will be enrolled into the
              target batch above.
            </p>
          </div>
        )}
      </form>
    </CustomModal>
  );
}
