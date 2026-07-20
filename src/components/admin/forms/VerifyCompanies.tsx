import { useState } from "react";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import Spinner from "../../ui/Spinner/Spinner";
import { useVerifyCompanies } from "../../../hooks/useCompany";
import type {
  BulkVerifyResponse,
  Company,
  CompanyVerifyEntry,
} from "../../../api/types/company";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  companies: Company[];
}

type Decision = "verified" | "rejected" | "";

export default function VerifyCompanies({ isOpen, onClose, companies }: Props) {
  const [decision, setDecision] = useState<Decision>("");
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<BulkVerifyResponse | null>(null);

  const isBulk = companies.length > 1;
  const company = companies[0]; // For single mode or default fields

  // Editable fields (only for single mode)
  const [editFields, setEditFields] = useState({
    companyName: company?.companyName || "",
    phone: company?.phone || "",
    email: company?.email || "",
    industry: company?.industry || "",
    companyType: company?.companyType || "private",
    street: company?.address?.street || "",
    city: company?.address?.city || "",
    state: company?.address?.state || "",
  });

  const { mutate: verify, isPending } = useVerifyCompanies();

  const handleClose = () => {
    setDecision("");
    setNotes("");
    setResult(null);
    onClose();
  };

  const setField = (key: keyof typeof editFields, value: string) =>
    setEditFields((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!decision) return;

    const entries: CompanyVerifyEntry[] = companies.map((c) => ({
      companyId: c._id,
      status: decision as "verified" | "rejected",
      notes: notes.trim() || undefined,
      editFields:
        !isBulk && decision === "verified"
          ? {
              companyName: editFields.companyName,
              phone: editFields.phone,
              email: editFields.email,
              industry: editFields.industry,
              companyType: editFields.companyType as Company["companyType"],
              address: {
                street: editFields.street,
                city: editFields.city,
                state: editFields.state,
              },
            }
          : undefined,
    }));

    verify({ companies: entries }, { onSuccess: (data) => setResult(data) });
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
              <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>
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
                  const comp = companies.find((c) => c._id === err.companyId);
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
                      <span style={{ fontWeight: 600 }}>
                        {comp?.companyName || err.companyId}
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
        form="verify-company-form"
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
          `Reject ${isBulk ? `${companies.length} organizations` : "organization"}`
        ) : decision === "verified" ? (
          `Verify ${isBulk ? `${companies.length} organizations` : "organization"}`
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
      title={isBulk ? "Bulk Verification" : "Review Organization"}
      subtitle={
        isBulk
          ? `Processing ${companies.length} selected organizations`
          : `Verify or reject — ${company?.companyName}`
      }
      size="medium"
      footer={footer}
    >
      <form
        id="verify-organization-form"
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
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

        {/* ── Editable fields (only shown when approving single company) ── */}
        {!isBulk && decision === "verified" && (
          <>
            <p
              style={{
                margin: 0,
                fontSize: 12,
                color: "var(--color-text-secondary)",
                fontStyle: "italic",
              }}
            >
              You may edit any fields before approving.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <div className="form-group">
                <label className="modal-label">Company Name</label>
                <input
                  className="modal-input"
                  value={editFields.companyName}
                  onChange={(e) => setField("companyName", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="modal-label">Industry</label>
                <input
                  className="modal-input"
                  value={editFields.industry}
                  onChange={(e) => setField("industry", e.target.value)}
                />
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <div className="form-group">
                <label className="modal-label">Email</label>
                <input
                  className="modal-input"
                  type="email"
                  value={editFields.email}
                  readOnly
                  onChange={(e) => setField("email", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="modal-label">Phone</label>
                <input
                  className="modal-input"
                  value={editFields.phone}
                  readOnly
                  onChange={(e) => setField("phone", e.target.value)}
                />
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 12,
              }}
            >
              <div className="form-group">
                <label className="modal-label">Street</label>
                <input
                  className="modal-input"
                  value={editFields.street}
                  onChange={(e) => setField("street", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="modal-label">City</label>
                <input
                  className="modal-input"
                  value={editFields.city}
                  onChange={(e) => setField("city", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="modal-label">State</label>
                <input
                  className="modal-input"
                  value={editFields.state}
                  onChange={(e) => setField("state", e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="modal-label">Company Type</label>
              <select
                className="modal-input"
                value={editFields.companyType}
                onChange={(e) => setField("companyType", e.target.value)}
              >
                <option value="private">Private</option>
                <option value="government">Government</option>
                <option value="ngo">NGO</option>
              </select>
            </div>
          </>
        )}

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
    </CustomModal>
  );
}
