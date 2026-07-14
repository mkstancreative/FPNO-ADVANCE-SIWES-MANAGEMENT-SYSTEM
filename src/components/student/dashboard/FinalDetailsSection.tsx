import React from "react";
import { Building2, UserCheck, GraduationCap } from "lucide-react";
import type {
  StudentDashPlacement,
  StudentDashSupervisors,
} from "../../../api/types/dashboard";

interface FinalDetailsSectionProps {
  placement: StudentDashPlacement;
  supervisors: StudentDashSupervisors;
  fmt: (d: string | null) => string;
}

export const FinalDetailsSection: React.FC<FinalDetailsSectionProps> = ({
  placement,
  supervisors,
  fmt,
}) => {
  return (
    <div className="db-panels">
      <div
        className="db-panel"
        style={{
          flex: 1,
          background: "var(--color-bg-secondary)",
          borderRadius: "16px",
          padding: "20px",
          border: "1px solid var(--color-border)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              background: "rgba(59, 130, 246, 0.1)",
              color: "#3b82f6",
              padding: "8px",
              borderRadius: "8px",
            }}
          >
            <Building2 size={16} />
          </div>
          <div>
            <h4
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "var(--color-text-primary)",
              }}
            >
              Placement Details
            </h4>
            <p
              style={{
                fontSize: "12px",
                color: "var(--color-text-muted)",
              }}
            >
              {placement.company}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "13px",
            }}
          >
            <span style={{ color: "var(--color-text-muted)" }}>Company</span>
            <span style={{ fontWeight: 600 }}>{placement.company}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "13px",
            }}
          >
            <span style={{ color: "var(--color-text-muted)" }}>Position</span>
            <span style={{ fontWeight: 600 }}>{placement.position}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "13px",
            }}
          >
            <span style={{ color: "var(--color-text-muted)" }}>Start Date</span>
            <span style={{ fontWeight: 600 }}>{fmt(placement.startDate)}</span>
          </div>
        </div>
      </div>

      <div
        className="db-panel"
        style={{
          flex: 1,
          background: "var(--color-bg-secondary)",
          borderRadius: "16px",
          padding: "20px",
          border: "1px solid var(--color-border)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              background: "rgba(245, 158, 11, 0.1)",
              color: "#f59e0b",
              padding: "8px",
              borderRadius: "8px",
            }}
          >
            <UserCheck size={16} />
          </div>
          <div>
            <h4
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "var(--color-text-primary)",
              }}
            >
              Company Supervisor
            </h4>
            <p
              style={{
                fontSize: "12px",
                color: "var(--color-text-muted)",
              }}
            >
              {supervisors.industrial?.name ?? "—"}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "13px",
            }}
          >
            <span style={{ color: "var(--color-text-muted)" }}>Name</span>
            <span style={{ fontWeight: 600 }}>
              {supervisors.industrial?.name ?? "—"}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "13px",
            }}
          >
            <span style={{ color: "var(--color-text-muted)" }}>Email</span>
            <span style={{ fontWeight: 600 }}>
              {supervisors.industrial?.email ?? "—"}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "13px",
            }}
          >
            <span style={{ color: "var(--color-text-muted)" }}>Phone</span>
            <span style={{ fontWeight: 600 }}>
              {supervisors.industrial?.phone ?? "—"}
            </span>
          </div>
        </div>
      </div>

      <div
        className="db-panel"
        style={{
          flex: 1,
          background: "var(--color-bg-secondary)",
          borderRadius: "16px",
          padding: "20px",
          border: "1px solid var(--color-border)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              background: "rgba(13, 148, 136, 0.1)",
              color: "#0d9488",
              padding: "8px",
              borderRadius: "8px",
            }}
          >
            <GraduationCap size={16} />
          </div>
          <div>
            <h4
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "var(--color-text-primary)",
              }}
            >
              School Supervisor
            </h4>
            <p
              style={{
                fontSize: "12px",
                color: "var(--color-text-muted)",
              }}
            >
              {supervisors.school?.department ?? "—"}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "13px",
            }}
          >
            <span style={{ color: "var(--color-text-muted)" }}>Department</span>
            <span style={{ fontWeight: 600 }}>
              {supervisors.school?.department ?? "—"}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "13px",
            }}
          >
            <span style={{ color: "var(--color-text-muted)" }}>
              Specialization
            </span>
            <span style={{ fontWeight: 600 }}>
              {supervisors.school?.specialization ?? "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
