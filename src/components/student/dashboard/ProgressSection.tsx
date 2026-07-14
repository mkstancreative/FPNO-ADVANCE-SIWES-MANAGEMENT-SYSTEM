import { ClipboardList } from "lucide-react";
import { ProgressRing, InfoPanel } from "../../shared/dashboard/DashboardKit";
import type {
  StudentDashProgress,
  StudentDashEvaluation,
} from "../../../api/types/dashboard";

interface ProgressSectionProps {
  progress: StudentDashProgress;
  evaluation: StudentDashEvaluation;
  fmt: (d: string | null) => string;
}

export const ProgressSection: React.FC<ProgressSectionProps> = ({
  progress,
  evaluation,
  fmt,
}) => {
  return (
    <div className="db-panels">
      <div className="db-ring-card">
        <div className="db-ring-card__ring">
          <ProgressRing
            pct={progress.progressPercent}
            color={progress.progressPercent >= 80 ? "#10b981" : "#f59e0b"}
          />
          <div className="db-ring-card__inner">
            <span className="db-ring-card__pct">
              {progress.progressPercent}%
            </span>
            <span className="db-ring-card__pct-lbl">done</span>
          </div>
        </div>
        <div className="db-ring-card__info">
          <div className="db-ring-card__title">IT Duration Progress</div>
          <div className="db-ring-card__rows">
            <div className="db-ring-card__row">
              <span className="db-ring-card__row-lbl">Start Date</span>
              <span className="db-ring-card__row-val">
                {fmt(progress.startDate)}
              </span>
            </div>
            <div className="db-ring-card__row">
              <span className="db-ring-card__row-lbl">End Date</span>
              <span className="db-ring-card__row-val">
                {fmt(progress.endDate)}
              </span>
            </div>
            <div className="db-ring-card__row">
              <span className="db-ring-card__row-lbl">Weeks Left</span>
              <span className="db-ring-card__row-val">
                {progress.totalWeeks - progress.weeksCompleted}
              </span>
            </div>
            <div className="db-ring-card__row">
              <span className="db-ring-card__row-lbl">Days Remaining</span>
              <span className="db-ring-card__row-val">
                {progress.daysRemaining}
              </span>
            </div>
          </div>
        </div>
      </div>

      <InfoPanel
        title="Evaluation Summary"
        sub={
          evaluation?.isComplete
            ? "Final results available"
            : "Awaiting submission"
        }
        icon={<ClipboardList size={16} />}
        iconColor="purple"
        rows={[
          {
            label: "Industrial Supervisor",
            value: evaluation?.industrialSubmitted ? (
              <span style={{ color: "#10b981", fontWeight: 600 }}>
                ✓ Submitted
              </span>
            ) : (
              <span style={{ color: "#f59e0b", fontWeight: 600 }}>Pending</span>
            ),
          },
          {
            label: "School Supervisor",
            value: evaluation?.schoolSubmitted ? (
              <span style={{ color: "#10b981", fontWeight: 600 }}>
                ✓ Submitted
              </span>
            ) : (
              <span style={{ color: "#f59e0b", fontWeight: 600 }}>Pending</span>
            ),
          },
          {
            label: "Status",
            value: (
              <span
                style={{
                  textTransform: "capitalize",
                  color: evaluation?.isComplete
                    ? "#10b981"
                    : "var(--color-text-muted)",
                  fontWeight: 600,
                }}
              >
                {evaluation?.status}
              </span>
            ),
          },
        ]}
      />
    </div>
  );
};
