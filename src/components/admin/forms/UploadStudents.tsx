import { useRef, useState, type FormEvent } from "react";
import { UploadCloud, FileSpreadsheet, X } from "lucide-react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import Spinner from "../../ui/Spinner/Spinner";
import {
  useUploadStudents,
  useDownloadStudentTemplate,
} from "../../../hooks/useStudents";
import { useBatches } from "../../../hooks/useBatches";
import type { BulkUploadResponse } from "../../../api/types/student";
import ImportResult from "../../ui/ImportResult/ImportResult";

interface UploadStudentsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadStudents({
  isOpen,
  onClose,
}: UploadStudentsProps) {
  const [file, setFile] = useState<File | null>(null);
  const [batchId, setBatchId] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { mutate: upload, isPending } = useUploadStudents();
  const { mutate: downloadTemplate, isPending: downloading } =
    useDownloadStudentTemplate();
  const { data: batchData } = useBatches({ limit: 100 });
  const batches = batchData?.data ?? [];

  const handleFile = (f: File) => {
    const allowed = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (!allowed.includes(f.type) && !f.name.match(/\.(xlsx|xls)$/i)) {
      return;
    }
    setFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  };

  const [result, setResult] = useState<BulkUploadResponse | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!file || !batchId) return;
    upload(
      { batchId, file },
      {
        onSuccess: (data) => {
          setResult(data as BulkUploadResponse);
        },
      },
    );
  };

  const handleClose = () => {
    setFile(null);
    setBatchId("");
    setResult(null);
    onClose();
  };

  if (result) {
    return (
      <ImportResult
        isOpen={isOpen}
        result={result}
        onClose={handleClose}
        title="Student Import Results"
      />
    );
  }

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Upload Students"
      subtitle="Import students into a batch via Excel file"
      size="medium"
      footer={
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
            form="upload-students-form"
            type="submit"
            disabled={isPending || !file || !batchId}
          >
            {isPending ? (
              <Spinner size={14} color="#fff" text="" />
            ) : (
              "Upload Students"
            )}
          </button>
        </>
      }
    >
      <form
        id="upload-students-form"
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
        {/* Batch selector */}
        <div className="form-group">
          <label className="modal-label">
            Select Batch <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <select
            className="modal-input"
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            required
          >
            <option value="" hidden>
              — Choose a batch —
            </option>
            {batches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name} ({b.session})
              </option>
            ))}
          </select>
        </div>

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
                Drag & drop your Excel file here
              </p>
              <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
                or{" "}
                <span style={{ color: "var(--color-accent)", fontWeight: 600 }}>
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

        {/* Download template */}
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
          {downloading ? "Downloading…" : "⬇ Download student upload template"}
        </button>

        {/* Note */}
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
          <strong>Note:</strong> The Excel file must follow the template format.
          Each row should contain student details including name, email,
          registration number and department.
        </p>
      </form>
    </CustomModal>
  );
}
