import { CheckCircle, AlertCircle, AlertTriangle } from "lucide-react";
import CustomModal from "../CustomModal/CustomModal";

export interface ImportError {
  row: string;
  error: string;
}

export interface ImportData {
  total: number;
  successful: number;
  skipped?: number;
  failed: number;
  errors: ImportError[];
}

export interface ImportResponse {
  success: boolean;
  message: string;
  data: ImportData;
}

interface ImportResultProps {
  isOpen: boolean;
  result: ImportResponse;
  onClose: () => void;
  title?: string;
  successLabel?: string;
  failedLabel?: string;
}

export default function ImportResult({
  isOpen,
  result,
  onClose,
  title = "Import Results",
  successLabel = "successful",
  failedLabel = "failed",
}: ImportResultProps) {
  const { successful, failed, skipped = 0, total } = result.data;
  const hasErrors = failed > 0;
  const hasSkipped = skipped > 0;

  // three-state: error > warning (skipped) > success
  const state = hasErrors ? "error" : hasSkipped ? "warning" : "success";
  const stateColors = {
    error: {
      bg: "rgba(239,68,68,0.06)",
      border: "rgba(239,68,68,0.18)",
      icon: <AlertCircle size={24} color="#ef4444" />,
    },
    warning: {
      bg: "rgba(245,158,11,0.06)",
      border: "rgba(245,158,11,0.20)",
      icon: <AlertTriangle size={24} color="#f59e0b" />,
    },
    success: {
      bg: "rgba(16,185,129,0.06)",
      border: "rgba(16,185,129,0.18)",
      icon: <CheckCircle size={24} color="#10b981" />,
    },
  }[state];

  const pills: { label: string; value: number; color: string; bg: string }[] = [
    {
      label: successLabel,
      value: successful,
      color: "#10b981",
      bg: "rgba(16,185,129,0.10)",
    },
    ...(hasSkipped
      ? [
          {
            label: "skipped",
            value: skipped,
            color: "#f59e0b",
            bg: "rgba(245,158,11,0.10)",
          },
        ]
      : []),
    {
      label: failedLabel,
      value: failed,
      color: "#ef4444",
      bg: "rgba(239,68,68,0.10)",
    },
  ];

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} title={title} size="medium">
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Summary banner */}
        <div
          style={{
            padding: "14px 16px",
            borderRadius: 12,
            background: stateColors.bg,
            border: `1px solid ${stateColors.border}`,
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
          <div style={{ flexShrink: 0, marginTop: 2 }}>{stateColors.icon}</div>
          <div style={{ flex: 1 }}>
            <p
              style={{
                margin: "0 0 4px",
                fontSize: 14,
                fontWeight: 600,
                color: "var(--color-text-primary)",
                lineHeight: 1.4,
              }}
            >
              {result.message}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: 12,
                color: "var(--color-text-secondary)",
              }}
            >
              {total} student{total !== 1 ? "s" : ""} processed
            </p>
          </div>
        </div>

        {/* Stat pills */}
        <div style={{ display: "flex", gap: 10 }}>
          {pills.map((pill) => (
            <div
              key={pill.label}
              style={{
                flex: 1,
                textAlign: "center",
                padding: "12px 8px",
                borderRadius: 10,
                background: pill.bg,
                border: `1px solid ${pill.color}30`,
              }}
            >
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: pill.color,
                  lineHeight: 1,
                }}
              >
                {pill.value}
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: pill.color,
                  marginTop: 4,
                  textTransform: "capitalize",
                }}
              >
                {pill.label}
              </div>
            </div>
          ))}
        </div>

        {/* Error list */}
        {result.data.errors.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#ef4444",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Error Details
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                maxHeight: 260,
                overflowY: "auto",
                paddingRight: 4,
              }}
              className="custom-scrollbar"
            >
              {result.data.errors.map((err, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    padding: "10px 12px",
                    background: "var(--color-bg-secondary)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 13,
                    gap: 15,
                  }}
                >
                  <span
                    style={{
                      fontWeight: 600,
                      color: "var(--color-text-primary)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {err.row}
                  </span>
                  <span style={{ color: "#ef4444", textAlign: "right" }}>
                    {err.error}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          className="modal-submit"
          onClick={onClose}
          style={{ width: "100%", marginTop: 4 }}
        >
          Done
        </button>
      </div>
    </CustomModal>
  );
}
