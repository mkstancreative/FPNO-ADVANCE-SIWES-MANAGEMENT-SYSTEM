import { useState } from "react";
import { Send, Loader2, ClipboardList } from "lucide-react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import ImportResult, {
  type ImportResponse,
} from "../../ui/ImportResult/ImportResult";
import { useRequestEvaluations } from "../../../hooks/useSchoolSupervisor";
import type {
  EvaluationType,
  EvaluationRequestResponse,
} from "../../../api/types/schoolSupervisor";

interface EvaluationFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIds: string[];
  onSuccess?: () => void;
}

export default function EvaluationForm({
  isOpen,
  onClose,
  selectedIds,
  onSuccess,
}: EvaluationFormProps) {
  const [type, setType] = useState<EvaluationType>("final");
  const [result, setResult] = useState<EvaluationRequestResponse | null>(null);

  const { mutate: request, isPending } = useRequestEvaluations();

  const handleSubmit = () => {
    request(
      { studentIds: selectedIds, type },
      {
        onSuccess: (data) => {
          setResult(data);
          onSuccess?.();
        },
      },
    );
  };

  const handleClose = () => {
    setResult(null);
    setType("final");
    onClose();
  };

  // ─── Transform Evaluation Result to Import Format ──────────────────────────
  const getImportResult = (res: EvaluationRequestResponse): ImportResponse => ({
    success: res.success,
    message: res.message,
    data: {
      total: res.data.total,
      successful: res.data.successful,
      failed: res.data.failed,
      errors: res.data.errors.map((e) => ({
        row: e.registrationNumber || e.name || "Student",
        error: e.error,
      })),
    },
  });

  if (result) {
    return (
      <ImportResult
        isOpen={isOpen}
        onClose={handleClose}
        result={getImportResult(result)}
        title="Evaluation Request Summary"
        successLabel="requested"
        failedLabel="failed"
      />
    );
  }

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Request Evaluations"
      subtitle={`Send evaluation request to ${selectedIds.length} selected student(s)`}
      icon={<ClipboardList size={16} />}
      size="medium"
    >
      <div className="evf-form">
        <div className="evf-selected-info">
          <span className="evf-selected-count">{selectedIds.length}</span>
          student{selectedIds.length !== 1 ? "s" : ""} selected
        </div>

        <div className="form-group">
          <label className="modal-label">Evaluation Type</label>
          <div className="evf-type-grid" style={{ gridTemplateColumns: "1fr" }}>
            {(["final"] as EvaluationType[]).map((t) => (
              <button
                key={t}
                type="button"
                className={`evf-type-btn ${type === t ? "evf-type-btn--active" : ""}`}
                onClick={() => setType(t)}
              >
                <span className="evf-type-label">
                  {t === "midterm" ? "Mid-Term" : "Final"}
                </span>
                <span className="evf-type-desc">
                  {t === "midterm"
                    ? "Conducted halfway through IT"
                    : "End-of-placement evaluation"}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="modal-cancel"
            onClick={handleClose}
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            type="button"
            className="modal-submit"
            disabled={isPending || selectedIds.length === 0}
            onClick={handleSubmit}
          >
            {isPending ? (
              <>
                <Loader2
                  size={13}
                  style={{
                    animation: "spin 0.8s linear infinite",
                    display: "inline-block",
                  }}
                />
                Sending…
              </>
            ) : (
              <>
                <Send size={13} /> Send Requests
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        .evf-form{display:flex;flex-direction:column;gap:20px}
        .evf-selected-info{font-size:13px;color:var(--color-text-secondary);padding:10px 14px;background:var(--color-accent-muted);border-radius:8px;display:flex;align-items:center;gap:6px}
        .evf-selected-count{font-size:20px;font-weight:700;color:var(--color-accent)}
        .evf-type-grid{display:grid;grid-template-columns:1fr;gap:12px}
        .evf-type-btn{display:flex;flex-direction:column;gap:4px;padding:14px 16px;border:1.5px solid var(--color-border);border-radius:12px;background:var(--color-bg-primary);cursor:pointer;text-align:left;transition:border-color .15s,background .15s}
        .evf-type-btn:hover{border-color:var(--color-accent)}
        .evf-type-btn--active{border-color:var(--color-accent);background:var(--color-accent-muted)}
        .evf-type-label{font-size:14px;font-weight:700;color:var(--color-text-primary)}
        .evf-type-desc{font-size:11.5px;color:var(--color-text-secondary)}
        .modal-submit{display:inline-flex;align-items:center;gap:6px}
      `}</style>
    </CustomModal>
  );
}
