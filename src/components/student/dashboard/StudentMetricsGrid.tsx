import React from "react";
import {
  CalendarCheck2,
  BookOpen,
  Star,
  GraduationCap,
  FileText,
  Bell,
  Download,
} from "lucide-react";
import { KpiCard } from "../../shared/dashboard/DashboardKit";
import type {
  StudentDashProgress,
  StudentDashLogbooks,
  StudentDashEvaluation,
  StudentDashReport,
  StudentDashNotifications,
} from "../../../api/types/dashboard";
import type {
  CertificateStatus,
  RRRData,
} from "../../../api/types/certificate";

interface StudentMetricsGridProps {
  progress: StudentDashProgress;
  logbooks: StudentDashLogbooks;
  evaluation: StudentDashEvaluation;
  report: StudentDashReport;
  notifications: StudentDashNotifications;
  certificate: CertificateStatus | null;
  downloadingCert: boolean;
  downloadingReq: boolean;
  onDownloadCert: () => void;
  onDownloadReq: () => void;
  onOpenPayment: (data: RRRData, showVerify: boolean) => void;
  onOpenRequest: (requestId?: string) => void;
}

export const StudentMetricsGrid: React.FC<StudentMetricsGridProps> = ({
  progress,
  logbooks,
  evaluation,
  report,
  notifications,
  certificate,
  downloadingCert,
  downloadingReq,
  onDownloadCert,
  onDownloadReq,
  onOpenPayment,
  onOpenRequest,
}) => {
  return (
    <div className="db-kpi-grid db-kpi-grid--wide" style={{ marginTop: 16 }}>
      <KpiCard
        label="Weeks Completed"
        value={`${progress.weeksCompleted}/${progress.totalWeeks}`}
        sub={`${progress.daysRemaining} days remaining`}
        icon={<CalendarCheck2 size={18} />}
        color="teal"
        trend={`${progress.progressPercent}%`}
        trendType={progress.progressPercent >= 80 ? "up" : "warn"}
        progress={progress.progressPercent}
      />
      <KpiCard
        label="Logbooks Approved"
        value={logbooks.approved}
        sub={`of ${logbooks.total} submitted`}
        icon={<BookOpen size={18} />}
        color="purple"
        trend={
          logbooks.meetsRequirement
            ? "✓ Met"
            : `Need ${logbooks.minimumRequired}`
        }
        trendType={logbooks.meetsRequirement ? "up" : "warn"}
        progress={Math.round(
          (logbooks.approved / Math.max(logbooks.minimumRequired, 1)) * 100,
        )}
      />
      <KpiCard
        label="Avg. Logbook Rating"
        value={logbooks.averageRating > 0 ? `${logbooks.averageRating}/5` : "—"}
        sub="Weekly performance score"
        icon={<Star size={18} />}
        color="amber"
        trend={
          logbooks.averageRating >= 4
            ? "Excellent"
            : logbooks.averageRating >= 3
              ? "Good"
              : "Fair"
        }
        trendType={
          logbooks.averageRating >= 4
            ? "up"
            : logbooks.averageRating >= 3
              ? "neutral"
              : "warn"
        }
      />
      <KpiCard
        label="Final Score"
        value={evaluation?.finalScore ?? "Pending"}
        sub={
          evaluation?.isComplete ? "Evaluation complete" : "Awaiting evaluation"
        }
        icon={<GraduationCap size={18} />}
        color="green"
        trend={evaluation?.finalGrade ?? "—"}
        trendType={
          !evaluation?.finalGrade
            ? "neutral"
            : evaluation?.finalGrade === "A" || evaluation?.finalGrade === "B"
              ? "up"
              : "warn"
        }
      />
      <KpiCard
        label="AI Report Score"
        value={
          report.aiScore !== undefined ? `${report.aiScore}/100` : "Pending"
        }
        sub={
          report.generated
            ? `Grade: ${report.aiGrade ?? "—"}`
            : "Not yet generated"
        }
        icon={<FileText size={18} />}
        color="blue"
        trend={report.generated ? "Generated" : "Pending"}
        trendType={report.generated ? "up" : "neutral"}
      />
      <KpiCard
        label="Notifications"
        value={notifications.unreadCount}
        sub="Unread messages"
        icon={<Bell size={18} />}
        color={notifications.unreadCount > 0 ? "rose" : "slate"}
        trend={notifications.unreadCount > 0 ? "New" : "All read"}
        trendType={notifications.unreadCount > 0 ? "warn" : "up"}
      />
      <KpiCard
        className="no-blur"
        label="Completion Form"
        value={certificate?.canDownload ? "Ready" : "Certificate"}
        sub={
          <span
            onClick={(e) => {
              e.stopPropagation();
              if (
                certificate?.rrr &&
                certificate?.rrr !== "Pending" &&
                certificate?.paymentStatus !== "successful"
              ) {
                onOpenPayment(certificate as RRRData, false);
              } else if (
                !certificate ||
                certificate.rrr === "Pending" ||
                certificate.paymentStatus === "failed"
              ) {
                onOpenRequest();
              } else if (certificate?.canDownload) {
                onDownloadCert();
              }
            }}
            style={{
              cursor: "pointer",
              textDecoration: "underline",
              color: "var(--color-accent)",
              fontWeight: 500,
            }}
          >
            {downloadingCert
              ? "Generating PDF..."
              : !certificate ||
                  certificate.paymentStatus === "failed" ||
                  certificate.rrr === "Pending" ||
                  !certificate.rrr
                ? "Request Certificate"
                : certificate.paymentStatus !== "successful"
                  ? "Verify Payment/Pay"
                  : certificate.approvalStatus !== "approved"
                    ? "Awaiting Approval"
                    : "Download Certificate"}
          </span>
        }
        icon={<Download size={18} />}
        color={certificate?.canDownload ? "green" : "slate"}
        trend={certificate?.approvalStatus || "Pending"}
        trendType={certificate?.canDownload ? "up" : "warn"}
      />
      <KpiCard
        label="Request Form"
        value="IT Placement"
        sub={
          <span
            onClick={(e) => {
              e.stopPropagation();
              onDownloadReq();
            }}
            style={{
              cursor: "pointer",
              textDecoration: "underline",
              color: "var(--color-accent)",
              fontWeight: 500,
            }}
          >
            {downloadingReq ? "Generating PDF..." : "Click to download"}
          </span>
        }
        icon={<FileText size={18} />}
        color="blue"
        trend="Available"
        trendType="up"
      />
    </div>
  );
};
