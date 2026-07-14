import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Briefcase,
  BookOpen,
  Star,
  Shield,
} from "lucide-react";
import {
  useInternshipById,
  useUpdateInternshipStatus,
  useSetCurrentInternship,
} from "../../../hooks/useInternships";
import type { InternshipStatus } from "../../../api/types/internship";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";
import { formatDate } from "../../../helpers/utilities";
import "./AdminStudentView.css";

const STATUS_OPTIONS: InternshipStatus[] = [
  "uploaded",
  "seeking_placement",
  "pending_verification",
  "placed",
  "active",
  "completed",
];

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

export default function InternshipView() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useInternshipById(id);
  const { mutate: updateStatus, isPending: updatingStatus } =
    useUpdateInternshipStatus();
  const { mutate: setCurrent, isPending: settingCurrent } =
    useSetCurrentInternship();

  const [statusDraft, setStatusDraft] = useState<InternshipStatus | "">("");

  const internship = data?.data;

  if (isLoading) {
    return (
      <div className="sv-loading">
        <div className="sv-skeleton sv-skeleton--avatar" />
        <div className="sv-skeleton sv-skeleton--line" />
        <div className="sv-skeleton sv-skeleton--line sv-skeleton--short" />
      </div>
    );
  }

  if (!internship) {
    return (
      <div className="sv-empty">
        <p>Internship not found.</p>
        <button
          className="dash-btn dash-btn--ghost"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
      </div>
    );
  }

  const student =
    typeof internship.student === "object" ? internship.student : null;
  const batch = typeof internship.batch === "object" ? internship.batch : null;

  const handleUpdateStatus = () => {
    if (!statusDraft) return;
    updateStatus(
      { id: internship._id, payload: { status: statusDraft } },
      { onSuccess: () => setStatusDraft("") },
    );
  };

  return (
    <div className="page-container">
      <button
        className="sv-back"
        onClick={() => navigate("/admin/internships")}
      >
        <ArrowLeft size={16} /> Internships
      </button>

      <div className="sv-hero">
        <div className="sv-hero-info">
          <h2 className="sv-name">
            {student
              ? `${student.user.firstName} ${student.user.lastName}`
              : "—"}
          </h2>
          <p className="sv-reg">{student?.registrationNumber}</p>
          <div className="sv-meta-row">
            <span className="sv-meta">
              {batch?.name ??
                (typeof internship.batch === "string" ? internship.batch : "")}
            </span>
            <span className="sv-meta">{internship.session}</span>
          </div>
        </div>
        <div className="sv-hero-badge">
          <StatusBadge status={internship.itStatus} />
        </div>
      </div>

      <div className="sv-grid">
        <Section title="Status Management" icon={<Briefcase size={15} />}>
          <div className="form-group">
            <label className="modal-label">Change Status</label>
            <div style={{ display: "flex", gap: 8 }}>
              <select
                className="modal-input"
                value={statusDraft}
                onChange={(e) =>
                  setStatusDraft(e.target.value as InternshipStatus | "")
                }
              >
                <option value="" disabled hidden>
                  Select status
                </option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="modal-submit"
                disabled={!statusDraft || updatingStatus}
                onClick={handleUpdateStatus}
              >
                {updatingStatus ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
          <button
            type="button"
            className="dash-btn dash-btn--ghost"
            disabled={internship.isCurrent || settingCurrent}
            onClick={() => setCurrent(internship._id)}
            style={{ marginTop: 10 }}
          >
            <Star size={13} />{" "}
            {settingCurrent
              ? "Setting…"
              : internship.isCurrent
              ? "Current"
              : "Set as Current Internship"}
          </button>
        </Section>

        {internship.itPeriod && (
          <Section title="IT Period" icon={<BookOpen size={15} />}>
            <InfoRow
              label="Start Date"
              value={formatDate(internship.itPeriod.startDate)}
            />
            <InfoRow
              label="End Date"
              value={formatDate(internship.itPeriod.endDate)}
            />
            <InfoRow
              label="Duration (weeks)"
              value={internship.itPeriod.expectedDuration}
            />
          </Section>
        )}

        {internship.placement && (
          <Section title="Placement" icon={<Briefcase size={15} />}>
            <InfoRow label="Company" value={internship.placement.company} />
            <InfoRow label="Position" value={internship.placement.position} />
            <InfoRow
              label="Start Date"
              value={formatDate(internship.placement.startDate)}
            />
            <InfoRow label="Status" value={internship.placement.status} />
          </Section>
        )}

        {internship.supervisors?.industrial && (
          <Section title="Industrial Supervisor" icon={<Shield size={15} />}>
            <InfoRow
              label="Name"
              value={internship.supervisors.industrial.name}
            />
            <InfoRow
              label="Email"
              value={internship.supervisors.industrial.email}
            />
            <InfoRow
              label="Phone"
              value={internship.supervisors.industrial.phone}
            />
          </Section>
        )}

        {internship.supervisors?.school && (
          <Section title="School Supervisor" icon={<User size={15} />}>
            <InfoRow
              label="Name"
              value={`${internship.supervisors.school.user.firstName} ${internship.supervisors.school.user.lastName}`}
            />
            <InfoRow
              label="Departments"
              value={internship.supervisors.school.departments.join(", ")}
            />
          </Section>
        )}
      </div>
    </div>
  );
}
