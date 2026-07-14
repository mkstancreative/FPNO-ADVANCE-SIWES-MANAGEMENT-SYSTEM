import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Briefcase,
  BookOpen,
  Phone,
  Mail,
  MapPin,
  FileText,
  Download,
  ClipboardCheck,
} from "lucide-react";
import { useStudentById } from "../../../hooks/useStudents";
import { useStudentEvaluations } from "../../../hooks/useEvaluations";
import type { StudentDetail } from "../../../api/types/student";
import "./AdminStudentView.css";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";
import { formatDate } from "../../../helpers/utilities";

function InfoRow({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="sv-info-row">
      <span className="sv-info-label">{label}</span>
      <span className="sv-info-value">{value ?? "—"}</span>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="sv-section">
      <div className="sv-section-header">
        <span className="sv-section-icon">{icon}</span>
        <h3 className="sv-section-title">{title}</h3>
      </div>
      <div className="sv-section-body">{children}</div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="sv-stat-card" style={{ borderTop: `3px solid ${color}` }}>
      <div className="sv-stat-value" style={{ color }}>
        {value}
      </div>
      <div className="sv-stat-label">{label}</div>
    </div>
  );
}

export default function AdminStudentView() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: student, isLoading } = useStudentById(id);
  const { data: evaluationsResp } = useStudentEvaluations(id);

  const s = student as StudentDetail | undefined;
  const stats = s?.logbookStats;
  const apiBase = (import.meta.env.VITE_API_URL ?? "").replace(
    /\/api(\/v\d+)?\/?$/,
    "",
  );

  if (isLoading) {
    return (
      <div className="sv-loading">
        <div className="sv-skeleton sv-skeleton--avatar" />
        <div className="sv-skeleton sv-skeleton--line" />
        <div className="sv-skeleton sv-skeleton--line sv-skeleton--short" />
      </div>
    );
  }

  if (!s) {
    return (
      <div className="sv-empty">
        <p>Student not found.</p>
        <button
          className="dash-btn dash-btn--ghost"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
      </div>
    );
  }

  const fullName = `${s.user.firstName} ${s.user.lastName}`;
  const initials =
    `${s.user.firstName?.charAt(0) || ""}${s.user.lastName?.charAt(0) || ""}`.toUpperCase() ||
    "??";
  const batchName = typeof s.batch === "object" ? s.batch.name : s.batch;

  return (
    <div className="page-container">
      {/* ── Back ── */}
      <button className="sv-back" onClick={() => navigate("/admin/students")}>
        <ArrowLeft size={16} /> Students
      </button>

      {/* ── Profile Hero ── */}
      <div className="sv-hero">
        <div className="sv-avatar-wrap">
          {s.passportPhoto ? (
            <img
              src={`${apiBase}${s.passportPhoto.startsWith("/") ? "" : "/"}${s.passportPhoto}`}
              alt={fullName}
              className="sv-avatar"
            />
          ) : (
            <div className="sv-avatar sv-avatar--fallback">{initials}</div>
          )}
        </div>
        <div className="sv-hero-info">
          <h2 className="sv-name">{fullName}</h2>
          <p className="sv-reg">{s.registrationNumber}</p>
          <div className="sv-meta-row">
            <span className="sv-meta">
              <Mail size={12} /> {s.user.email}
            </span>
            <span className="sv-meta">
              <Phone size={12} /> {s.user.phone}
            </span>
          </div>
        </div>
        <div className="sv-hero-badge">
          <StatusBadge status={s.itStatus} />
        </div>
      </div>

      {/* ── Logbook Stats ── */}
      {stats && (
        <div className="sv-stats-grid">
          <StatCard label="Total Entries" value={stats.total} color="#3b82f6" />
          <StatCard label="Approved" value={stats.approved} color="#10b981" />
          <StatCard label="Submitted" value={stats.submitted} color="#f59e0b" />
          <StatCard label="Rejected" value={stats.rejected} color="#ef4444" />
        </div>
      )}

      <div className="sv-grid">
        {/* ── Personal / Academic ── */}
        <Section title="Academic Details" icon={<User size={15} />}>
          <InfoRow
            label="Department"
            value={`${s.department.name} (${s.department.code})`}
          />
          <InfoRow
            label="Program"
            value={`${s.program.type} — ${s.program.level}`}
          />
          <InfoRow label="Session" value={s.session} />
          <InfoRow label="Batch" value={batchName as string} />
        </Section>

        {/* ── IT Period ── */}
        {s.itPeriod && (
          <Section title="IT Period" icon={<BookOpen size={15} />}>
            <InfoRow
              label="Start Date"
              value={formatDate(s.itPeriod.startDate)}
            />
            <InfoRow label="End Date" value={formatDate(s.itPeriod.endDate)} />
            <InfoRow
              label="Duration (weeks)"
              value={s.itPeriod.expectedDuration}
            />
          </Section>
        )}

        {/* ── Placement ── */}
        {s.placement && (
          <Section title="Placement" icon={<Briefcase size={15} />}>
            <InfoRow label="Company" value={s.placement.company?.companyName} />
            <InfoRow label="Industry" value={s.placement.company?.industry} />
            <InfoRow label="Position" value={s.placement.position} />
            <InfoRow label="Department" value={s.placement.department} />
            <div className="sv-info-row">
              <span className="sv-info-label">Status</span>
              <span className="sv-info-value">
                <StatusBadge status={s.placement.status} />
              </span>
            </div>
            {s.placement.company?.address && (
              <div className="sv-info-row">
                <span className="sv-info-label">
                  <MapPin size={11} /> Address
                </span>
                <span className="sv-info-value">
                  {s.placement.company.address.street},{" "}
                  {s.placement.company.address.city},{" "}
                  {s.placement.company.address.state}
                </span>
              </div>
            )}
            {s.placement?.acceptanceLetterUrl && (
              <div className="sv-info-row">
                <span className="sv-info-label">
                  <FileText size={11} /> Acceptance Letter
                </span>
                <a
                  href={`${apiBase}${s.placement.acceptanceLetterUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sv-info-value"
                  style={{
                    color: "var(--color-accent)",
                    cursor: "pointer",
                    textDecoration: "underline",
                    fontWeight: "600",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <Download size={14} style={{ marginRight: "4px" }} />
                  View PDF
                </a>
              </div>
            )}
          </Section>
        )}

        {/* ── Industrial Supervisor ── */}
        {s.supervisors?.industrial && (
          <Section title="Industrial Supervisor" icon={<User size={15} />}>
            <InfoRow label="Name" value={s.supervisors.industrial.name} />
            <InfoRow label="Email" value={s.supervisors.industrial.email} />
            <InfoRow label="Phone" value={s.supervisors.industrial.phone} />
            <InfoRow
              label="Position"
              value={s.supervisors.industrial.position}
            />
            {s.supervisors.industrial.totalApprovals !== undefined && (
              <InfoRow
                label="Total Approvals"
                value={s.supervisors.industrial.totalApprovals}
              />
            )}
          </Section>
        )}

        {/* ── Academic Supervisor ── */}
        {s.supervisors?.school && (
          <Section title="Academic Supervisor" icon={<User size={15} />}>
            <InfoRow
              label="Name"
              value={`${s.supervisors.school.user.firstName} ${s.supervisors.school.user.lastName}`}
            />
            <InfoRow label="Email" value={s.supervisors.school.user.email} />
            <InfoRow label="Phone" value={s.supervisors.school.user.phone} />
            <InfoRow label="Staff ID" value={s.supervisors.school.staffId} />
            <InfoRow
              label="Departments"
              value={s.supervisors.school.departments.join(", ")}
            />
            <InfoRow
              label="Specialization"
              value={s.supervisors.school.specialization}
            />
          </Section>
        )}

        {/* ── Guarantor ── */}
        {s.guarantor && (
          <Section title="Guarantor" icon={<User size={15} />}>
            <InfoRow label="Name" value={s.guarantor.name} />
            <InfoRow label="Relationship" value={s.guarantor.relationship} />
            <InfoRow label="Phone" value={s.guarantor.phone} />
            <InfoRow label="Address" value={s.guarantor.address} />
          </Section>
        )}

        {/* ── Evaluations ── */}
        {(evaluationsResp?.data?.length ?? 0) > 0 && (
          <Section title="Evaluations" icon={<ClipboardCheck size={15} />}>
            {evaluationsResp!.data.map((ev) => (
              <div
                key={ev._id}
                style={{
                  padding: "10px 0",
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                <InfoRow
                  label={`${ev.type} — ${ev.internship.batch?.name ?? ""}`}
                  value={ev.isComplete ? "Complete" : "Pending"}
                />
                <InfoRow
                  label="Final Score"
                  value={
                    ev.finalScore != null
                      ? `${ev.finalScore} (${ev.finalGrade ?? "—"})`
                      : "—"
                  }
                />
                {ev.school && (
                  <InfoRow label="School Comments" value={ev.school.comments} />
                )}
                {ev.industrial && (
                  <InfoRow
                    label="Industrial Comments"
                    value={ev.industrial.comments}
                  />
                )}
              </div>
            ))}
          </Section>
        )}
      </div>
    </div>
  );
}
