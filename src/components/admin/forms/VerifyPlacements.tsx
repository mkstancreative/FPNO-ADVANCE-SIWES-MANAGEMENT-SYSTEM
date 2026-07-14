import { useState } from "react";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import Spinner from "../../ui/Spinner/Spinner";
import { useVerifyPlacements } from "../../../hooks/useCompany";
import type {
  BulkVerifyResponse,
  PendingPlacement,
  PlacementVerifyEntry,
} from "../../../api/types/company";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  placements: PendingPlacement[];
}

type Decision = "verified" | "rejected" | "";

export default function VerifyPlacements({
  isOpen,
  onClose,
  placements,
}: Props) {
  const [decision, setDecision] = useState<Decision>("");
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<BulkVerifyResponse | null>(null);

  const isBulk = placements.length > 1;
  const placement = placements[0];

  const { mutate: verify, isPending } = useVerifyPlacements();

  const handleClose = () => {
    setDecision("");
    setNotes("");
    setResult(null);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!decision) return;

    const entries: PlacementVerifyEntry[] = placements.map((p) => ({
      placementId: p._id,
      status: decision as "verified" | "rejected",
      notes: notes.trim() || undefined,
    }));

    verify({ placements: entries }, { onSuccess: (data) => setResult(data) });
  };

  // ── Result View ───────────────────────────────────────────────────────────
  if (result) {
    return (
      <CustomModal
        isOpen={isOpen}
        onClose={handleClose}
        title="Verification Results"
        size="medium"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              padding: 16,
              borderRadius: 12,
              background:
                result.data.failed > 0
                  ? "rgba(239,68,68,0.05)"
                  : "rgba(16,185,129,0.05)",
              border: `1px solid ${result.data.failed > 0 ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)"}`,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            {result.data.failed > 0 ? (
              <AlertCircle size={24} color="#ef4444" />
            ) : (
              <CheckCircle size={24} color="#10b981" />
            )}
            <div>
              <h4
                style={{
                  margin: 0,
                  fontSize: 15,
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                }}
              >
                {result.message}
              </h4>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: "var(--color-text-secondary)",
                }}
              >
                {result.data.successful} successful, {result.data.failed}{" "}
                failed.
              </p>
            </div>
          </div>

          {result.data.errors.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#ef4444",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Error Details
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {result.data.errors.map((err, i) => {
                  const p = placements.find((pl) => pl._id === err.placementId);
                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "10px 12px",
                        background: "var(--color-bg-secondary)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 8,
                        fontSize: 13,
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 600,
                          color: "var(--color-text-primary)",
                        }}
                      >
                        {p
                          ? `${p.student.user.firstName} ${p.student.user.lastName}`
                          : err.placementId}
                      </span>
                      <span style={{ color: "#ef4444" }}>{err.error}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <button
            className="modal-submit"
            onClick={handleClose}
            style={{ width: "100%", marginTop: 10 }}
          >
            Close
          </button>
        </div>
      </CustomModal>
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
        form="verify-placement-form"
        type="submit"
        disabled={isPending || !decision}
        style={{
          background:
            decision === "rejected"
              ? "#ef4444"
              : decision === "verified"
                ? "#10b981"
                : undefined,
        }}
      >
        {isPending ? (
          <Spinner size={14} color="#fff" text="" />
        ) : decision === "rejected" ? (
          `Reject ${isBulk ? `${placements.length} Placements` : "Placement"}`
        ) : decision === "verified" ? (
          `Verify ${isBulk ? `${placements.length} Placements` : "Placement"}`
        ) : (
          "Select a Decision"
        )}
      </button>
    </>
  );

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={handleClose}
      title={isBulk ? "Bulk Placement Verification" : "Review Placement"}
      subtitle={
        isBulk
          ? `Processing ${placements.length} selected placements`
          : `Reviewing placement for ${placement?.student.user.firstName} ${placement?.student.user.lastName}`
      }
      size="medium"
      footer={footer}
    >
      <form
        id="verify-placement-form"
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
        {!isBulk && placement && (
          <div className="vp-details-card">
            <div className="vp-section">
              <label>Company & Position</label>
              <p>
                {placement.company.companyName} — {placement.position}
              </p>
              <span className="vp-dept">{placement.department} Dept.</span>
            </div>
            <div className="vp-section">
              <label>Industrial Supervisor</label>
              <p>{placement.industrialSupervisor.name}</p>
              <span className="vp-sub">
                {placement.industrialSupervisor.email} •{" "}
                {placement.industrialSupervisor.phone}
              </span>
            </div>
          </div>
        )}

        {/* ── Decision toggle ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
          }}
        >
          <button
            type="button"
            onClick={() => setDecision("verified")}
            style={{
              padding: "10px 0",
              borderRadius: 8,
              border: `2px solid ${decision === "verified" ? "#10b981" : "var(--color-border)"}`,
              background:
                decision === "verified"
                  ? "rgba(16,185,129,0.08)"
                  : "transparent",
              color:
                decision === "verified"
                  ? "#10b981"
                  : "var(--color-text-secondary)",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              transition: "all 0.2s",
            }}
          >
            <CheckCircle size={15} />
            Approve
          </button>
          <button
            type="button"
            onClick={() => setDecision("rejected")}
            style={{
              padding: "10px 0",
              borderRadius: 8,
              border: `2px solid ${decision === "rejected" ? "#ef4444" : "var(--color-border)"}`,
              background:
                decision === "rejected"
                  ? "rgba(239,68,68,0.08)"
                  : "transparent",
              color:
                decision === "rejected"
                  ? "#ef4444"
                  : "var(--color-text-secondary)",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              transition: "all 0.2s",
            }}
          >
            <XCircle size={15} />
            Reject
          </button>
        </div>

        {/* ── Notes ── */}
        <div className="form-group">
          <label className="modal-label">
            Notes{" "}
            <span style={{ color: "#94a3b8", fontWeight: 400 }}>
              (optional)
            </span>
          </label>
          <textarea
            className="modal-input"
            rows={3}
            placeholder={
              decision === "rejected"
                ? "Reason for rejection…"
                : "Any additional comments…"
            }
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{ resize: "vertical", minHeight: 72 }}
          />
        </div>
      </form>
      <style>{`
        .vp-details-card {
           background: var(--color-bg-secondary);
           border: 1px solid var(--color-border);
           border-radius: 10px;
           padding: 16px;
           display: flex;
           flex-direction: column;
           gap: 16px;
        }
        .vp-section label {
           display: block;
           font-size: 11px;
           font-weight: 700;
           text-transform: uppercase;
           color: var(--color-text-muted);
           margin-bottom: 4px;
        }
        .vp-section p {
           margin: 0;
           font-weight: 600;
           font-size: 14px;
           color: var(--color-text-primary);
        }
        .vp-dept, .vp-sub {
           font-size: 12px;
           color: var(--color-text-secondary);
        }
        .vp-letter-link {
           display: inline-flex;
           align-items: center;
           gap: 8px;
           font-size: 13px;
           color: var(--color-accent);
           text-decoration: none;
           font-weight: 600;
           padding: 8px 0;
           width: fit-content;
        }
        .vp-letter-link:hover {
           text-decoration: underline;
        }
      `}</style>
    </CustomModal>
  );
}
