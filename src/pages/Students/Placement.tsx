import { useState } from "react";
import {
  Briefcase,
  Building2,
  UserCheck,
  CalendarDays,
  Clock,
  BookCheck,
  Plus,
} from "lucide-react";
import type { PlacementStatusData } from "../../api/types/itstudent";
import {
  useStudentWeeklyProgress,
  usePlacementStatus,
} from "../../hooks/useITStudents";
import ConfirmPlacementForm from "../../components/student/forms/ConfirmPlacementForm";
import "./Placement.css";
import AddButton from "../../components/ui/AddButton/AddButton";
import StatusBadge from "../../components/ui/StatusBadge/StatusBadge";
import { useInternship } from "../../context/useInternship";

// ── SVG circle constants ──────────────────────────────────────────────────────
const RADIUS = 70;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function strokeColor(pct: number, meets: boolean) {
  if (meets) return "meets";
  if (pct >= 60) return "not-meets";
  return "danger";
}

export default function Placement() {
  const [showForm, setShowForm] = useState(false);
  const { selectedInternshipId } = useInternship();
  const scopeParams = { internshipId: selectedInternshipId ?? undefined };

  const { data: progressData, isLoading: loadingProgress } =
    useStudentWeeklyProgress(scopeParams);
  const { data: placementData, isLoading: loadingPlacement } =
    usePlacementStatus(scopeParams);

  const progress = progressData?.data;
  const placement = placementData?.data;

  // Stroke dash
  const pct = progress?.progressPercent ?? 0;
  const offset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE;

  const currentItStatus = placement?.itStatus || progress?.itStatus;

  const showPlacementActions =
    (currentItStatus === "seeking_placement" || currentItStatus === "uploaded") &&
    !placement?.placement?.company;

  const openCreate = () => setShowForm(true);

  return (
    <>
      <div className="page-container">
        <div className="page-header">
          <div className="page-header-left">
            <div className="page-icon orange">
              <Briefcase size={20} />
            </div>
            <div>
              <h2 className="page-title">Placement</h2>
              <p className="page-sub">
                Track your clinical training progress and manage your placement
              </p>
            </div>
          </div>
          <div className="page-header-right">
            {showPlacementActions && (
              <AddButton text="Confirm Placement" onClick={openCreate} />
            )}
          </div>
        </div>

        <div className="pl-grid">
          {/* ── LEFT: Progress ─────────────────────────────────────────── */}
          <div className="pl-card">
            <div className="pl-card-title">
              <CalendarDays size={18} />
              Training Progress
            </div>

            {loadingProgress ? (
              <div className="pl-loading">Loading progress…</div>
            ) : progress ? (
              <>
                {/* Circle */}
                <div className="pl-circle-wrap">
                  <div className="pl-circle">
                    <svg width="160" height="160" viewBox="0 0 160 160">
                      <circle
                        className="pl-circle-bg"
                        cx="80"
                        cy="80"
                        r={RADIUS}
                      />
                      <circle
                        className={`pl-circle-fill ${strokeColor(pct, progress.meetsRequirement)}`}
                        cx="80"
                        cy="80"
                        r={RADIUS}
                        strokeDasharray={CIRCUMFERENCE}
                        strokeDashoffset={offset}
                      />
                    </svg>
                    <div className="pl-circle-label">
                      <span className="pl-circle-pct">{pct}%</span>
                      <span className="pl-circle-sub">Complete</span>
                    </div>
                  </div>

                  {/* IT Status */}
                  <StatusBadge status={progress.itStatus} />
                </div>

                {/* Stats */}
                <div className="pl-stats">
                  <div className="pl-stat">
                    <span className="pl-stat-val green">
                      {progress.weeksCompleted}
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: "var(--text-secondary)",
                        }}
                      >
                        /{progress.totalWeeks}
                      </span>
                    </span>
                    <span className="pl-stat-label">Weeks Completed</span>
                  </div>

                  <div className="pl-stat">
                    <span
                      className={`pl-stat-val ${progress.daysRemaining === 0 ? "green" : "amber"}`}
                    >
                      {progress.daysRemaining}
                    </span>
                    <span className="pl-stat-label">Days Remaining</span>
                  </div>

                  <div className="pl-stat">
                    <span className="pl-stat-val amber">
                      {progress.logbooksSubmitted}
                    </span>
                    <span className="pl-stat-label">Logbooks Submitted</span>
                  </div>

                  <div className="pl-stat">
                    <span className="pl-stat-val green">
                      {progress.logbooksApproved}
                    </span>
                    <span className="pl-stat-label">Logbooks Approved</span>
                  </div>
                </div>

                {/* Missed weeks */}
                {progress.missedWeeks.length > 0 && (
                  <div>
                    <div className="pl-missed-label">
                      Missed Weeks ({progress.missedWeeks.length})
                    </div>
                    <div className="pl-missed-chips">
                      {progress.missedWeeks.map((w) => (
                        <span key={w} className="pl-missed-chip">
                          Wk {w}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="pl-empty">No progress data available.</div>
            )}
          </div>

          {/* ── RIGHT: Placement ───────────────────────────────────────── */}
          <div className="pl-card" style={{ gap: 20 }}>
            <div className="pl-card-title">
              <Briefcase size={18} />
              Placement Details
            </div>

            {loadingPlacement ? (
              <div className="pl-loading">Loading placement…</div>
            ) : placement?.placement ? (
              <PlacementInfo data={placement} />
            ) : (
              <div className="pl-cta-wrap">
                <div className="pl-cta-icon">
                  <Building2 size={28} />
                </div>
                <h2 className="pl-cta-title">No Placement Confirmed</h2>
                <p className="pl-cta-sub">
                  Submit your acceptance letter and company details to register
                  your clinical attachment placement.
                </p>
                {showPlacementActions && (
                  <button className="pl-btn" onClick={() => setShowForm(true)}>
                    <Plus size={16} />
                    Request Placement
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Placement form modal */}
      <ConfirmPlacementForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
      />
    </>
  );
}

// ── PlacementInfo sub-component ───────────────────────────────────────────────
function PlacementInfo({ data }: { data: PlacementStatusData }) {
  const { placement, supervisors, itPeriod } = data;

  // Guard against undefined placement or placement.company
  if (!placement || !placement.company) {
    return (
      <div className="pl-empty">
        No placement details available. Please confirm your placement first.
      </div>
    );
  }

  const co = placement.company;

  return (
    <div className="pl-existing">
      {/* Approval status */}
      <span
        className={`pl-placement-status`}
        style={{ alignSelf: "flex-start" }}
      >
        <StatusBadge status={placement.status} />
      </span>

      {/* Company */}
      <div className="pl-info-group">
        <div className="pl-info-group-title">
          <Building2 size={13} />
          Company
        </div>
        <div className="pl-info-rows">
          <InfoRow label="Name" value={co.companyName ?? ""} />
          <InfoRow
            label="Address"
            value={`${co.address?.street ?? ""}, ${co.address?.city ?? ""}, ${co.address?.state ?? ""}`}
          />
          <InfoRow label="Phone" value={co.phone ?? ""} />
          <InfoRow
            label="Verification"
            value={
              co.verificationStatus ? (
                <StatusBadge status={co.verificationStatus} />
              ) : (
                ""
              )
            }
          />
        </div>
      </div>

      {/* Role */}
      <div className="pl-info-group">
        <div className="pl-info-group-title">
          <Briefcase size={13} />
          Role
        </div>
        <div className="pl-info-rows">
          <InfoRow label="Position" value={placement.position ?? ""} />
          <InfoRow label="Department" value={placement.department ?? ""} />
          <InfoRow
            label="Start Date"
            value={
              placement.startDate
                ? new Date(placement.startDate).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : ""
            }
          />
        </div>
      </div>

      {/* IT Period */}
      {itPeriod && (
        <div className="pl-info-group">
          <div className="pl-info-group-title">
            <Clock size={13} />
            IT Period
          </div>
          <div className="pl-info-rows">
            <InfoRow
              label="Start"
              value={
                itPeriod.startDate
                  ? new Date(itPeriod.startDate).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : ""
              }
            />
            <InfoRow
              label="End"
              value={
                itPeriod.endDate
                  ? new Date(itPeriod.endDate).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : ""
              }
            />
            <InfoRow
              label="Duration"
              value={`${itPeriod.expectedDuration ?? ""} weeks`}
            />
          </div>
        </div>
      )}

      {/* Industrial Supervisor */}
      {supervisors?.industrial && (
        <div className="pl-info-group">
          <div className="pl-info-group-title">
            <UserCheck size={13} />
            Industry Supervisor
          </div>
          <div className="pl-info-rows">
            <InfoRow label="Name" value={supervisors.industrial.name ?? ""} />
            <InfoRow label="Email" value={supervisors.industrial.email ?? ""} />
            <InfoRow label="Phone" value={supervisors.industrial.phone ?? ""} />
          </div>
        </div>
      )}

      {/* School Supervisor */}
      {supervisors?.school && (
        <div className="pl-info-group">
          <div className="pl-info-group-title">
            <BookCheck size={13} />
            School Supervisor
          </div>
          <div className="pl-info-rows">
            <InfoRow
              label="Name"
              value={`${supervisors.school.user.firstName ?? ""} ${supervisors.school.user.lastName ?? ""}`}
            />
            <InfoRow
              label="Email"
              value={supervisors.school.user.email ?? ""}
            />
            <InfoRow
              label="Department"
              value={supervisors.school.department ?? ""}
            />
            <InfoRow
              label="Specialization"
              value={supervisors.school.specialization ?? ""}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value?: string | React.ReactNode;
}) {
  if (!value) return null;
  return (
    <div className="pl-info-row">
      <span className="pl-info-key">{label}</span>
      <span className="pl-info-val">{value}</span>
    </div>
  );
}
