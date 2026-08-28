import React, { useRef, useState, type FormEvent } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  X,
  CheckCircle,
  AlertCircle,
  Download,
} from "lucide-react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import Spinner from "../../ui/Spinner/Spinner";
import { useUploadDiscountedStudents } from "../../../hooks/useStudents";
import * as XLSX from "xlsx";

interface DiscountedStudentFormProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DiscountUploadResponse {
  success: boolean;
  message: string;
  data: {
    fileName: string;
    sheetsProcessed: { sheet: string; rows: number }[];
    totalRows: number;
    imported: number;
    updated: number;
    skipped: number;
    skippedByReason: {
      duplicate?: number;
      "no-registration-number"?: number;
      [key: string]: number | undefined;
    };
    skippedBySheet: { [sheetName: string]: number };
    skippedRows: {
      sheet: string;
      row: number;
      studentName: string;
      registrationNumber: string;
      reason: string;
      duplicateOf?: string;
    }[];
    discountAmount: number;
  };
}

export default function DiscountedStudentForm({
  isOpen,
  onClose,
}: DiscountedStudentFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { mutate: upload, isPending } = useUploadDiscountedStudents();
  const [result, setResult] = useState<DiscountUploadResponse | null>(null);

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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    upload(formData, {
      onSuccess: (res) => {
        setResult(res as DiscountUploadResponse);
      },
    });
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    onClose();
  };

  const downloadExcelBreakdown = () => {
    if (!result) return;
    const { data } = result;

    const wb = XLSX.utils.book_new();

    // Summary Sheet
    const summaryRows = [
      ["Import Summary Report", ""],
      ["Source File Name", data.fileName],
      ["Report Generated", new Date().toLocaleString()],
      ["", ""],
      ["Metric", "Count"],
      ["Total Rows in Excel", data.totalRows],
      ["New Student Discounts Registered", data.imported],
      ["Existing Discounts Updated", data.updated],
      ["Total Successful (Imported + Updated)", data.imported + data.updated],
      ["Total Skipped / Failed", data.skipped],
      ["", ""],
      ["Skipped Reasons Breakdown", ""],
    ];

    if (data.skippedByReason) {
      Object.entries(data.skippedByReason).forEach(([reason, count]) => {
        summaryRows.push([reason, count ?? 0]);
      });
    }

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

    // Errors/Skipped Rows sheet
    const errorHeader = [
      "Sheet Name",
      "Row #",
      "Student Name",
      "Registration Number",
      "Skip Reason",
      "Reference / Details",
    ];
    const errorRows = (data.skippedRows || []).map((row) => [
      row.sheet || "",
      row.row || "",
      row.studentName || "",
      row.registrationNumber || "",
      row.reason || "",
      row.duplicateOf || "",
    ]);

    const wsErrors = XLSX.utils.aoa_to_sheet([errorHeader, ...errorRows]);
    wsErrors["!cols"] = [15, 10, 30, 20, 25, 25].map((wch) => ({ wch }));

    XLSX.utils.book_append_sheet(wb, wsErrors, "Skipped Rows (Errors)");

    XLSX.writeFile(
      wb,
      `${data.fileName.replace(/\.[^/.]+$/, "")}_breakdown.xlsx`,
    );
  };

  if (result) {
    const hasErrors = result.data.skipped > 0;
    return (
      <CustomModal
        isOpen={isOpen}
        onClose={handleClose}
        title="Discount Import Results"
        size="medium"
        footer={
          <>
            <button className="modal-cancel" onClick={handleClose}>
              Close
            </button>
            <button
              className="modal-submit"
              onClick={downloadExcelBreakdown}
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <Download size={14} />
              Download Excel Breakdown
            </button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Main banner */}
          <div
            style={{
              padding: 16,
              borderRadius: 12,
              background: hasErrors
                ? "rgba(217, 119, 6, 0.05)"
                : "rgba(16, 185, 129, 0.05)",
              border: `1px solid ${
                hasErrors
                  ? "rgba(217, 119, 6, 0.15)"
                  : "rgba(16, 185, 129, 0.15)"
              }`,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            {hasErrors ? (
              <AlertCircle size={24} color="var(--color-amber)" />
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
                Source: {result.data.fileName}
              </p>
            </div>
          </div>

          {/* Stats grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 12,
            }}
          >
            <div
              style={{
                background: "var(--color-bg-secondary)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                padding: "12px 16px",
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: "var(--color-text-muted)",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Total Checked Rows
              </span>
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                }}
              >
                {result.data.totalRows}
              </span>
            </div>

            <div
              style={{
                background: "var(--color-bg-secondary)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                padding: "12px 16px",
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: "var(--color-text-muted)",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Total Imported / Updated
              </span>
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#10b981",
                }}
              >
                {result.data.imported + result.data.updated}
              </span>
            </div>

            <div
              style={{
                background: "var(--color-bg-secondary)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                padding: "12px 16px",
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: "var(--color-text-muted)",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Skipped (Duplicates)
              </span>
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "var(--color-amber)",
                }}
              >
                {result.data.skippedByReason?.duplicate || 0}
              </span>
            </div>

            <div
              style={{
                background: "var(--color-bg-secondary)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                padding: "12px 16px",
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: "var(--color-text-muted)",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                No Reg. Num Skip
              </span>
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#ef4444",
                }}
              >
                {result.data.skippedByReason?.["no-registration-number"] || 0}
              </span>
            </div>
          </div>

          {/* Skipped preview */}
          {result.data.skippedRows?.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--color-text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Skipped Rows Preview ({result.data.skippedRows.length})
              </span>
              <div
                style={{
                  maxHeight: 180,
                  overflowY: "auto",
                  paddingRight: 4,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
                className="custom-scrollbar"
              >
                {result.data.skippedRows.slice(0, 15).map((row, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "8px 12px",
                      background: "var(--color-bg-tertiary)",
                      borderRadius: 6,
                      fontSize: 12.5,
                      borderLeft: `4px solid ${
                        row.reason === "duplicate"
                          ? "var(--color-amber)"
                          : "#ef4444"
                      }`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontWeight: 600,
                        color: "var(--color-text-primary)",
                      }}
                    >
                      <span>
                        Row {row.row} ({row.sheet})
                      </span>
                      <span
                        style={{
                          color:
                            row.reason === "duplicate"
                              ? "var(--color-amber)"
                              : "#ef4444",
                        }}
                      >
                        {row.reason}
                      </span>
                    </div>
                    {row.studentName && (
                      <div
                        style={{
                          color: "var(--color-text-secondary)",
                          marginTop: 2,
                        }}
                      >
                        {row.studentName} — {row.registrationNumber}
                      </div>
                    )}
                    {row.duplicateOf && (
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--color-text-muted)",
                          marginTop: 2,
                        }}
                      >
                        Duplicate of: {row.duplicateOf}
                      </div>
                    )}
                  </div>
                ))}
                {result.data.skippedRows.length > 15 && (
                  <div
                    style={{
                      textAlign: "center",
                      fontSize: 12,
                      color: "var(--color-text-muted)",
                      paddingTop: 4,
                    }}
                  >
                    ...and {result.data.skippedRows.length - 15} more skipped
                    rows. Download Excel breakdown for full details.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CustomModal>
    );
  }

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Upload Discounted Students"
      subtitle="Import a list of students eligible for certificate discounts via Excel"
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
            form="upload-discounted-students-form"
            type="submit"
            disabled={isPending || !file}
          >
            {isPending ? (
              <Spinner size={14} color="#fff" text="" />
            ) : (
              "Upload and Process"
            )}
          </button>
        </>
      }
    >
      <form
        id="upload-discounted-students-form"
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !file && inputRef.current?.click()}
          style={{
            border: `2px dashed ${
              dragOver
                ? "var(--color-accent)"
                : file
                  ? "#10b981"
                  : "rgba(13, 148, 136, 0.35)"
            }`,
            borderRadius: 12,
            padding: "36px 20px",
            textAlign: "center",
            cursor: file ? "default" : "pointer",
            transition: "all 0.2s",
            background: dragOver
              ? "var(--color-accent-muted)"
              : file
                ? "rgba(16, 185, 129, 0.05)"
                : "rgba(13, 148, 136, 0.03)",
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
              <FileSpreadsheet size={32} color="#10b981" />
              <div style={{ textAlign: "left" }}>
                <p
                  style={{
                    margin: 0,
                    fontWeight: 600,
                    fontSize: 13.5,
                    color: "#059669",
                  }}
                >
                  {file.name}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: 11.5,
                    color: "var(--color-text-muted)",
                  }}
                >
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
                  padding: "6px 10px",
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
                size={40}
                color={
                  dragOver ? "var(--color-accent)" : "rgba(13, 148, 136, 0.6)"
                }
                style={{ marginBottom: 10 }}
              />
              <p
                style={{
                  margin: "0 0 4px",
                  fontWeight: 600,
                  fontSize: 14,
                  color: "var(--color-text-primary)",
                }}
              >
                Drag & drop your Excel file here
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  color: "var(--color-text-muted)",
                }}
              >
                or{" "}
                <span
                  style={{
                    color: "var(--color-accent)",
                    fontWeight: 600,
                    borderBottom: "1px dashed var(--color-accent)",
                  }}
                >
                  browse files
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

        <p
          style={{
            margin: 0,
            fontSize: 12.5,
            color: "var(--color-text-secondary)",
            padding: "10px 14px",
            background: "var(--color-bg-secondary)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            lineHeight: 1.5,
          }}
        >
          <strong>Import Requirements:</strong> The spreadsheet must contain a
          sheet for each program department containing a table of students
          eligible for the discount. Ensure registration numbers are well
          structured (e.g. <code>21E/0069/AC</code>).
        </p>
      </form>
    </CustomModal>
  );
}
