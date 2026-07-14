import { GraduationCap, Calendar, Building2, CheckCircle2 } from "lucide-react";
import { useMyInternshipHistory } from "../../hooks/useInternships";
import { useInternship } from "../../context/useInternship";
import StatusBadge from "../../components/ui/StatusBadge/StatusBadge";
import Spinner from "../../components/ui/Spinner/Spinner";
import type { Internship } from "../../api/types/internship";
import "./InternshipHistory.css";

function batchLabel(batch: Internship["batch"]) {
  if (typeof batch === "string") return batch;
  return `${batch.name} — ${batch.session}`;
}

export default function InternshipHistory() {
  const { data, isLoading } = useMyInternshipHistory();
  const { selectedInternshipId, selectInternship } = useInternship();

  const internships = data?.data ?? [];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon purple">
            <GraduationCap size={20} />
          </div>
          <div>
            <h2 className="page-title">Internship History</h2>
            <p className="page-sub">
              Every internship you've been enrolled in — select one to view its
              dashboard, logbooks, and report.
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div
          style={{
            height: "40vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Spinner size={26} color="var(--color-accent)" text="Loading…" />
        </div>
      ) : internships.length === 0 ? (
        <div className="ih-empty">
          <GraduationCap size={32} />
          <p>You don't have any internship records yet.</p>
        </div>
      ) : (
        <div className="ih-grid">
          {internships.map((i) => {
            const isSelected = i._id === selectedInternshipId;
            return (
              <button
                key={i._id}
                className={`ih-card ${isSelected ? "ih-card--selected" : ""}`}
                onClick={() => selectInternship(i._id)}
              >
                <div className="ih-card-header">
                  <span className="ih-card-title">{batchLabel(i.batch)}</span>
                  {i.isCurrent && (
                    <span className="ih-current-badge">
                      <CheckCircle2 size={12} /> Current
                    </span>
                  )}
                </div>
                <div className="ih-card-row">
                  <StatusBadge status={i.itStatus} />
                </div>
                {i.placement && i.placement.company && (
                  <div className="ih-card-row">
                    <Building2 size={13} />
                    <span>
                      {typeof i.placement.company === "object"
                        ? ((i.placement.company as Record<string, unknown>)
                            .companyName as string) || "—"
                        : i.placement.company}
                    </span>
                  </div>
                )}
                {i.itPeriod && (
                  <div className="ih-card-row">
                    <Calendar size={13} />
                    <span>
                      {new Date(i.itPeriod.startDate).toLocaleDateString()} –{" "}
                      {new Date(i.itPeriod.endDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {isSelected && (
                  <div className="ih-viewing-tag">Currently viewing</div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
