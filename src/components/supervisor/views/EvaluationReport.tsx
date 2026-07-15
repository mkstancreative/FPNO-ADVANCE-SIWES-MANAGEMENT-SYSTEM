import { FileSpreadsheet, Loader2 } from "lucide-react";
import { useExportSchoolEvaluations } from "../../../hooks/useSchoolSupervisor";

export default function EvaluationReport() {
  const { mutate: exportReport, isPending } = useExportSchoolEvaluations();

  return (
    <button
      type="button"
      className="dash-btn"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        height: 38,
        fontSize: "13px",
        fontWeight: 600,
        background: "linear-gradient(135deg, #10b981, #059669)",
        borderColor: "transparent",
        color: "#fff",
        padding: "0 16px",
        borderRadius: "8px",
        cursor: "pointer",
        transition: "all 0.15s ease",
        boxShadow: "0 2px 4px rgba(16, 185, 129, 0.2)",
      }}
      disabled={isPending}
      onClick={() => exportReport()}
      onMouseEnter={(e) => {
        if (!isPending) {
          e.currentTarget.style.opacity = "0.9";
          e.currentTarget.style.transform = "translateY(-1px)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isPending) {
          e.currentTarget.style.opacity = "1";
          e.currentTarget.style.transform = "none";
        }
      }}
    >
      {isPending ? (
        <>
          <Loader2
            size={15}
            className="lbv2-spin"
            style={{ animation: "spin 1s linear infinite" }}
          />
          <span>Exporting…</span>
        </>
      ) : (
        <>
          <FileSpreadsheet size={15} />
          <span>Export Report (Excel)</span>
        </>
      )}
    </button>
  );
}
