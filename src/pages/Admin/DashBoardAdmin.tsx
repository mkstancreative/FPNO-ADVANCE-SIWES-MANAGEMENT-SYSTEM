import {
  BookOpen,
  Building2,
  CheckCircle2,
  FileText,
  Layers,
  TrendingUp,
  Users,
  UserCheck,
  AlertCircle,
} from "lucide-react";
import { useAdminDashboard } from "../../hooks/useDashboard";
import {
  InfoPanel,
  KpiCard,
  ProgressRing,
  SectionHead,
  DashboardSkeleton,
  DashboardBanner,
  DashboardError,
} from "../../components/shared/dashboard/DashboardKit";
import "../../components/shared/dashboard/dashboard.css";
import { useAuth } from "../../context/useAuth";

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function DashBoardAdmin() {
  const { user } = useAuth();
  const { data: resp, isLoading } = useAdminDashboard();

  if (isLoading) return <DashboardSkeleton cards={8} wide />;
  if (!resp?.data) return <DashboardError />;

  const students = resp.data?.students ?? {
    total: 0,
    uploaded: 0,
    seekingPlacement: 0,
    pendingVerification: 0,
    placed: 0,
    active: 0,
    completed: 0,
  };
  const companies = resp.data?.companies ?? {
    total: 0,
    pending: 0,
    verified: 0,
  };
  const supervisors = resp.data?.supervisors ?? { school: 0, industrial: 0 };
  const logbooks = resp.data?.logbooks ?? {
    pending: 0,
    approved: 0,
    rejected: 0,
  };
  const batches = resp.data?.batches ?? { total: 0, active: 0 };
  const totalInternships = resp.data?.totalInternships ?? 0;

  const firstName = user?.firstName ?? "Admin";
  const initials =
    `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase();

  const placementRate =
    students.total > 0
      ? Math.round(
          ((students.placed + students.active + students.completed) /
            students.total) *
            100,
        )
      : 0;

  const verificationRate =
    companies.total > 0
      ? Math.round((companies.verified / companies.total) * 100)
      : 0;

  const logbookApprovalRate =
    logbooks.approved + logbooks.pending + logbooks.rejected > 0
      ? Math.round(
          (logbooks.approved /
            (logbooks.approved + logbooks.pending + logbooks.rejected)) *
            100,
        )
      : 0;

  const appName = "CIMS";

  return (
    <div className="db-page">
      <DashboardBanner
        greeting="Administration Overview 🏛️"
        name={`Welcome, ${firstName}!`}
        meta={`${appName} · Admin Dashboard · All departments`}
        badge={
          <>
            <CheckCircle2 size={12} /> {students.completed} Student
            {students.completed !== 1 ? "s" : ""} Completed
          </>
        }
        initials={initials}
        gradient="linear-gradient(135deg, #0d9488 100%)"
      />

      {/* ── Students KPIs ──────────────────────────────────────────────────── */}
      <div>
        <SectionHead
          title="Student Overview"
          sub={`${students.total} total students`}
          icon={<Users size={16} />}
          color="teal"
        />
        <div
          className="db-kpi-grid db-kpi-grid--wide"
          style={{ marginTop: 16 }}
        >
          <KpiCard
            label="Total Students"
            value={students.total}
            sub="All enrolments"
            icon={<Users size={18} />}
            color="teal"
          />
          <KpiCard
            label="Uploaded"
            value={students.uploaded}
            sub="Awaiting placement"
            icon={<FileText size={18} />}
            color="slate"
            trend={`${students.total > 0 ? Math.round((students.uploaded / students.total) * 100) : 0}%`}
            trendType="neutral"
          />
          <KpiCard
            label="Placed"
            value={students.placed}
            sub="At a company"
            icon={<Building2 size={18} />}
            color="blue"
          />
          <KpiCard
            label="Active IT"
            value={students.active}
            sub="Currently interning"
            icon={<TrendingUp size={18} />}
            color="purple"
            trend={students.active > 0 ? "Active" : "None"}
            trendType={students.active > 0 ? "up" : "neutral"}
          />
          <KpiCard
            label="Completed"
            value={students.completed}
            sub="IT fully completed"
            icon={<CheckCircle2 size={18} />}
            color="green"
            trend={`${placementRate}% placed`}
            trendType={placementRate >= 60 ? "up" : "warn"}
          />
          <KpiCard
            label="Pending Verification"
            value={students.pendingVerification}
            sub="Placement under review"
            icon={<AlertCircle size={18} />}
            color={students.pendingVerification > 0 ? "amber" : "slate"}
            trend={
              students.pendingVerification > 0 ? "Action needed" : "All clear"
            }
            trendType={students.pendingVerification > 0 ? "warn" : "up"}
          />
          <KpiCard
            label="Seeking Placement"
            value={students.seekingPlacement}
            sub="Looking for companies"
            icon={<AlertCircle size={18} />}
            color={students.seekingPlacement > 0 ? "rose" : "slate"}
            trend={students.seekingPlacement > 0 ? "Needs attention" : "None"}
            trendType={students.seekingPlacement > 0 ? "danger" : "up"}
          />
          <KpiCard
            label="Placement Rate"
            value={`${placementRate}%`}
            sub="Placed + Active + Completed"
            icon={<TrendingUp size={18} />}
            color={
              placementRate >= 70
                ? "green"
                : placementRate >= 40
                  ? "amber"
                  : "rose"
            }
            progress={placementRate}
          />
        </div>
      </div>

      {/* ── Progress Rings + Secondary KPIs ────────────────────────────────── */}
      <div className="db-panels">
        {/* Companies ring */}
        <div className="db-ring-card">
          <div className="db-ring-card__ring">
            <ProgressRing
              pct={verificationRate}
              color={verificationRate >= 80 ? "#10b981" : "#6366f1"}
            />
            <div className="db-ring-card__inner">
              <span className="db-ring-card__pct">{verificationRate}%</span>
              <span className="db-ring-card__pct-lbl">verified</span>
            </div>
          </div>
          <div className="db-ring-card__info">
            <div className="db-ring-card__title">Company Verification</div>
            <div className="db-ring-card__rows">
              <div className="db-ring-card__row">
                <span className="db-ring-card__row-lbl">Total Companies</span>
                <span className="db-ring-card__row-val">{companies.total}</span>
              </div>
              <div className="db-ring-card__row">
                <span className="db-ring-card__row-lbl">Verified</span>
                <span
                  className="db-ring-card__row-val"
                  style={{ color: "#10b981" }}
                >
                  {companies.verified}
                </span>
              </div>
              <div className="db-ring-card__row">
                <span className="db-ring-card__row-lbl">Pending</span>
                <span
                  className="db-ring-card__row-val"
                  style={{
                    color:
                      companies.pending > 0
                        ? "#f59e0b"
                        : "var(--color-text-muted)",
                  }}
                >
                  {companies.pending}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Logbooks ring */}
        <div className="db-ring-card">
          <div className="db-ring-card__ring">
            <ProgressRing
              pct={logbookApprovalRate}
              color={logbookApprovalRate >= 80 ? "#10b981" : "#f59e0b"}
            />
            <div className="db-ring-card__inner">
              <span className="db-ring-card__pct">{logbookApprovalRate}%</span>
              <span className="db-ring-card__pct-lbl">approved</span>
            </div>
          </div>
          <div className="db-ring-card__info">
            <div className="db-ring-card__title">Logbook Activity</div>
            <div className="db-ring-card__rows">
              <div className="db-ring-card__row">
                <span className="db-ring-card__row-lbl">Approved</span>
                <span
                  className="db-ring-card__row-val"
                  style={{ color: "#10b981" }}
                >
                  {logbooks.approved}
                </span>
              </div>
              <div className="db-ring-card__row">
                <span className="db-ring-card__row-lbl">Pending Review</span>
                <span
                  className="db-ring-card__row-val"
                  style={{
                    color:
                      logbooks.pending > 0
                        ? "#f59e0b"
                        : "var(--color-text-muted)",
                  }}
                >
                  {logbooks.pending}
                </span>
              </div>
              <div className="db-ring-card__row">
                <span className="db-ring-card__row-lbl">Rejected</span>
                <span
                  className="db-ring-card__row-val"
                  style={{
                    color:
                      logbooks.rejected > 0
                        ? "#f43f5e"
                        : "var(--color-text-muted)",
                  }}
                >
                  {logbooks.rejected}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Supervisors & Batches Info ───────────────────────────────────────── */}
      <div className="db-panels">
        <InfoPanel
          title="Supervisor Summary"
          sub="Teaching & Company staff"
          icon={<UserCheck size={16} />}
          iconColor="purple"
          rows={[
            {
              label: "School Supervisors",
              value: (
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: "rgba(99,102,241,.12)",
                      color: "#6366f1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {supervisors.school}
                  </span>
                </span>
              ),
            },
            {
              label: "Industrial Supervisors",
              value: (
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: "rgba(13,148,136,.12)",
                      color: "#0d9488",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {supervisors.industrial}
                  </span>
                </span>
              ),
            },
            {
              label: "Total Supervisors",
              value: supervisors.school + supervisors.industrial,
            },
          ]}
        />
        <InfoPanel
          title="Batch Overview"
          sub="Student cohort management"
          icon={<Layers size={16} />}
          iconColor="amber"
          rows={[
            { label: "Total Batches", value: batches.total },
            { label: "Total Internships", value: totalInternships },
            {
              label: "Active Batches",
              value: (
                <span
                  style={{
                    color:
                      batches.active > 0
                        ? "#10b981"
                        : "var(--color-text-muted)",
                    fontWeight: 600,
                  }}
                >
                  {batches.active}
                </span>
              ),
            },
            {
              label: "Inactive",
              value: batches.total - batches.active,
            },
          ]}
        />
        <InfoPanel
          title="Logbook Summary"
          sub="Approval pipeline"
          icon={<BookOpen size={16} />}
          iconColor="green"
          rows={[
            {
              label: "Pending Review",
              value: (
                <span
                  style={{
                    color:
                      logbooks.pending > 0
                        ? "#f59e0b"
                        : "var(--color-text-muted)",
                    fontWeight: 600,
                  }}
                >
                  {logbooks.pending}
                </span>
              ),
            },
            {
              label: "Approved",
              value: (
                <span style={{ color: "#10b981", fontWeight: 600 }}>
                  {logbooks.approved}
                </span>
              ),
            },
            {
              label: "Rejected",
              value: (
                <span
                  style={{
                    color:
                      logbooks.rejected > 0
                        ? "#f43f5e"
                        : "var(--color-text-muted)",
                    fontWeight: 600,
                  }}
                >
                  {logbooks.rejected}
                </span>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
