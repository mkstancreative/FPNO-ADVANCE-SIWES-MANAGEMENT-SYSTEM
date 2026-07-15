import { useRef, useState } from "react";
import { FileSpreadsheet, UploadCloud, X, UserPlus } from "lucide-react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import Spinner from "../../ui/Spinner/Spinner";
import {
  useUploadSupervisorExcel,
  useDownloadSupervisorTemplate,
  useCreateSupervisor,
} from "../../../hooks/useSupervisor";
import { useDepartments } from "../../../hooks/useBatches";
import type {
  BulkUploadResponse,
  CreateSupervisorPayload,
} from "../../../api/types/supervisor";
import ImportResult from "../../ui/ImportResult/ImportResult";
import MultiSelectPicker from "../../ui/MultiSelectPicker/MultiSelectPicker";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = "upload" | "manual";

const EMPTY_FORM: CreateSupervisorPayload = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  staffId: "",
  departments: [],
  specialization: "",
};

export default function UploadSupervisors({ isOpen, onClose }: Props) {
  const [tab, setTab] = useState<Tab>("upload");

  // ── Excel upload state ─────────────────────────────────────────────────────
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { mutate: uploadExcel, isPending: uploading } =
    useUploadSupervisorExcel();
  const { mutate: downloadTemplate, isPending: downloading } =
    useDownloadSupervisorTemplate();

  const { data: departmentsData } = useDepartments();

  // ── Manual create state ────────────────────────────────────────────────────
  const [form, setForm] = useState<CreateSupervisorPayload>(EMPTY_FORM);
  const { mutate: createSupervisor, isPending: creating } =
    useCreateSupervisor();

  const [result, setResult] = useState<BulkUploadResponse | null>(null);

  const [showManualDept, setShowManualDept] = useState(false);
  const [manualDept, setManualDept] = useState("");

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleClose = () => {
    setFile(null);
    setForm(EMPTY_FORM);
    setTab("upload");
    setResult(null);
    setShowManualDept(false);
    setManualDept("");
    onClose();
  };

  const handleFile = (f: File) => {
    if (!f.name.match(/\.(xlsx|xls)$/i)) return;
    setFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    uploadExcel(file, {
      onSuccess: (data) => {
        setResult(data as BulkUploadResponse);
      },
    });
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.departments.length === 0) return;
    createSupervisor(form, { onSuccess: handleClose });
  };

  const setField = <K extends keyof CreateSupervisorPayload>(
    key: K,
    value: CreateSupervisorPayload[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  if (result) {
    return (
      <ImportResult
        isOpen={isOpen}
        result={result}
        onClose={handleClose}
        title="Supervisor Import Results"
        successLabel="supervisors added"
        failedLabel="failed"
      />
    );
  }

  // ── Footer buttons ─────────────────────────────────────────────────────────
  const footer = (
    <>
      <button
        className="modal-cancel"
        onClick={handleClose}
        disabled={uploading || creating}
      >
        Cancel
      </button>

      {tab === "upload" ? (
        <button
          className="modal-submit"
          form="upload-supervisors-excel-form"
          type="submit"
          disabled={uploading || !file}
        >
          {uploading ? (
            <Spinner size={14} color="#fff" text="" />
          ) : (
            "Upload Supervisors"
          )}
        </button>
      ) : (
        <button
          className="modal-submit"
          form="create-supervisor-form"
          type="submit"
          disabled={creating || form.departments.length === 0}
        >
          {creating ? (
            <Spinner size={14} color="#fff" text="" />
          ) : (
            "Create Supervisor"
          )}
        </button>
      )}
    </>
  );

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Supervisor"
      subtitle="Import supervisors via Excel file or create manually"
      size="medium"
      footer={footer}
    >
      {/* ── Tab switcher ── */}
      <div
        style={{
          display: "flex",
          gap: 0,
          borderRadius: 10,
          overflow: "hidden",
          border: "1px solid var(--color-border)",
          marginBottom: 20,
        }}
      >
        {(["upload", "manual"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              padding: "9px 0",
              background: tab === t ? "var(--color-accent)" : "transparent",
              color: tab === t ? "#fff" : "var(--color-text-secondary)",
              border: "none",
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
            {t === "upload" ? (
              <UploadCloud size={14} />
            ) : (
              <UserPlus size={14} />
            )}
            {t === "upload" ? "Excel Upload" : "Create Manually"}
          </button>
        ))}
      </div>

      {/* ── Excel Upload Tab ── */}
      {tab === "upload" && (
        <form
          id="upload-supervisors-excel-form"
          onSubmit={handleUploadSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          {/* Drop zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !file && inputRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? "var(--color-accent)" : file ? "#10b981" : "rgba(99,102,241,0.35)"}`,
              borderRadius: 12,
              padding: "28px 20px",
              textAlign: "center",
              cursor: file ? "default" : "pointer",
              transition: "all 0.2s",
              background: dragOver
                ? "rgba(99,102,241,0.06)"
                : file
                  ? "rgba(16,185,129,0.06)"
                  : "rgba(99,102,241,0.03)",
            }}
          >
            {file ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                }}
              >
                <FileSpreadsheet size={30} color="#10b981" />
                <div style={{ textAlign: "left" }}>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 600,
                      fontSize: 13,
                      color: "#059669",
                    }}
                  >
                    {file.name}
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  style={{
                    marginLeft: "auto",
                    border: "none",
                    background: "rgba(239,68,68,0.1)",
                    color: "#ef4444",
                    borderRadius: 6,
                    padding: "4px 8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <UploadCloud
                  size={36}
                  color={dragOver ? "var(--color-accent)" : "#94a3b8"}
                  style={{ marginBottom: 8 }}
                />
                <p
                  style={{
                    margin: "0 0 4px",
                    fontWeight: 600,
                    fontSize: 13,
                    color: "var(--color-text-primary)",
                  }}
                >
                  Drag &amp; drop your Excel file here
                </p>
                <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
                  or{" "}
                  <span
                    style={{ color: "var(--color-accent)", fontWeight: 600 }}
                  >
                    click to browse
                  </span>{" "}
                  — .xlsx or .xls only
                </p>
              </>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />

          <button
            type="button"
            onClick={() => downloadTemplate()}
            disabled={downloading}
            style={{
              background: "none",
              border: "none",
              color: "var(--color-accent)",
              fontSize: 12,
              cursor: "pointer",
              textAlign: "left",
              textDecoration: "underline",
              padding: 0,
            }}
          >
            {downloading
              ? "Downloading…"
              : "⬇ Download supervisor upload template"}
          </button>

          <p
            style={{
              margin: 0,
              fontSize: 12,
              color: "var(--color-text-primary)",
              padding: "8px 12px",
              background: "rgba(248,250,252,0.6)",
              border: "1px solid var(--color-border)",
              borderRadius: 8,
            }}
          >
            <strong>Note:</strong> The Excel file must follow the template
            format. Each row should contain supervisor details including name,
            email, staff ID and department.
          </p>
        </form>
      )}

      {/* ── Manual Create Tab ── */}
      {tab === "manual" && (
        <form
          id="create-supervisor-form"
          onSubmit={handleManualSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
          >
            <div className="form-group">
              <label className="modal-label">
                First Name <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                className="modal-input"
                required
                value={form.firstName}
                onChange={(e) => setField("firstName", e.target.value)}
                placeholder="Emmanuel"
              />
            </div>
            <div className="form-group">
              <label className="modal-label">
                Last Name <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                className="modal-input"
                required
                value={form.lastName}
                onChange={(e) => setField("lastName", e.target.value)}
                placeholder="Ibe"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="modal-label">
              Email <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              className="modal-input"
              type="email"
              required
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              placeholder="okafor.emmae@fpno.edu.ng"
            />
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
          >
            <div className="form-group">
              <label className="modal-label">
                Phone <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                className="modal-input"
                required
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                placeholder="08011223344"
              />
            </div>
            <div className="form-group">
              <label className="modal-label">
                Staff ID <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                className="modal-input"
                required
                value={form.staffId}
                onChange={(e) => setField("staffId", e.target.value)}
                placeholder="FPN/CS/001"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="modal-label">
              Departments <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <MultiSelectPicker
              options={Array.from(
                new Set([
                  ...(departmentsData?.data ?? []),
                  ...form.departments,
                ]),
              ).map((d) => ({
                id: d,
                name: d,
              }))}
              value={form.departments}
              onChange={(ids) => setField("departments", ids as string[])}
              placeholder="Search and select departments…"
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 4,
              }}
            >
              <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>
                A department already owned by another supervisor can't be
                selected here.
              </p>
              <button
                type="button"
                onClick={() => setShowManualDept(!showManualDept)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--color-accent)",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: 0,
                  textDecoration: "underline",
                }}
              >
                {showManualDept
                  ? "Cancel manual entry"
                  : "Add department manually"}
              </button>
            </div>

            {showManualDept && (
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <input
                  className="modal-input"
                  style={{
                    flex: 1,
                    padding: "6px 12px",
                    height: "34px",
                    fontSize: 13,
                  }}
                  value={manualDept}
                  onChange={(e) => setManualDept(e.target.value)}
                  placeholder="Enter department name..."
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    const trimmed = manualDept.trim();
                    if (!trimmed) return;
                    if (!form.departments.includes(trimmed)) {
                      setField("departments", [...form.departments, trimmed]);
                    }
                    setManualDept("");
                    setShowManualDept(false);
                  }}
                  style={{
                    background: "var(--color-accent)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "0 16px",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    height: "34px",
                  }}
                >
                  Add
                </button>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="modal-label">
              Specialization <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              className="modal-input"
              required
              value={form.specialization}
              onChange={(e) => setField("specialization", e.target.value)}
              placeholder="Software Engineering"
            />
          </div>
        </form>
      )}
    </CustomModal>
  );
}
