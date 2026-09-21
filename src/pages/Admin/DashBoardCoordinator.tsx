import { nameInitials } from "../../helpers/names";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Award,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Layers,
  MapPin,
  ShieldAlert,
  TrendingUp,
  Users,
} from "lucide-react";
import { useAdminDashboard } from "../../hooks/useDashboard";
import { useAllCertRequests } from "../../hooks/useCertificate";
import {
  usePendingCompanies,
  usePartiallyVerifiedCompanies,
} from "../../hooks/useCompany";
import { useSystemSettings } from "../../hooks/useSettings";
import { resolveName } from "../../utils/branding";
import {
  KpiCard,
  SectionHead,
  DashboardSkeleton,
  DashboardBanner,
  DashboardError,
} from "../../components/shared/dashboard/DashboardKit";
import "../../components/shared/dashboard/dashboard.css";
import { useAuth } from "../../context/useAuth";

/**
 * The review queues are counted, not listed — one request each, asking for a
 * single row and reading the total off the pagination.
 */
const COUNT_ONLY = { page: 1, limit: 1 };

/** Wide enough to cover any request still open; the queue is what matters. */
const CERT_WINDOW = { startDate: "2020-01-01", endDate: "2099-12-31" };

/**
 * A coordinator reviews; an admin decides. This dashboard leads with the three
 * queues waiting on a coordinator's judgement rather than the system-wide
 * totals an admin opens their dashboard for — those follow underneath, as
 * context.
 */
export default function DashBoardCoordinator() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: resp, isLoading } = useAdminDashboard();
  const { data: settingsResp } = useSystemSettings();

  const { data: pendingCerts } = useAllCertRequests({
    ...COUNT_ONLY,
    ...CERT_WINDOW,
    status: "pending",
  });
  const { data: pendingCompanies } = usePendingCompanies(COUNT_ONLY);
  const { data: pendingPlacements } = usePartiallyVerifiedCompanies(COUNT_ONLY);

  if (isLoading) return <DashboardSkeleton cards={7} wide />;
  if (!resp?.data) return <DashboardError />;

  const students = resp.data.students ?? {
    total: 0,
    uploaded: 0,
    seekingPlacement: 0,
    pendingVerification: 0,
    placed: 0,
    active: 0,
    completed: 0,
  };
  const companies = resp.data.companies ?? {
    total: 0,
    pending: 0,
    verified: 0,
  };
  const logbooks = resp.data.logbooks ?? {
    pending: 0,
    approved: 0,
    rejected: 0,
  };
  const batches = resp.data.batches ?? { total: 0, active: 0 };

  // The dashboard's own company count is authoritative; the queue request is a
  // fallback for when this payload omits it.
  const certQueue = pendingCerts?.pagination?.totalItems ?? 0;
  const companyQueue = companies.pending || (pendingCompanies?.total ?? 0);
  const placementQueue = pendingPlacements?.total ?? 0;

  const totalQueue = certQueue + companyQueue + placementQueue;

  const firstName = user?.firstName ?? "Coordinator";
  const initials = nameInitials(user);
  const appName = resolveName(settingsResp?.settings);

  const queues = [
    {
      key: "certificates",
      label: "Certificate Requests",
      value: certQueue,
      sub: "Awaiting approval or rejection",
      icon: <Award size={18} />,
      color: "purple" as const,
      to: "/admin/certificates",
      cta: "Review requests",
    },
    {
      key: "companies",
      label: "Companies to Verify",
      value: companyQueue,
      sub: "Unverified host organisations",
      icon: <Building2 size={18} />,
      color: "blue" as const,
      to: "/admin/companies",
      cta: "Verify companies",
    },
    {
      key: "placements",
      label: "Placements to Verify",
      value: placementQueue,
      sub: "Partially verified, awaiting sign-off",
      icon: <MapPin size={18} />,
      color: "amber" as const,
      to: "/admin/partially-verified-companies",
      cta: "Verify placements",
    },
  ];

  return (
    <div className="db-page">
      <DashboardBanner
        greeting="Review Queue 📋"
        name={`Welcome, ${firstName}!`}
        meta={`${appName} · Coordinator Dashboard`}
        badge={
          totalQueue > 0 ? (
            <>
              <ClipboardCheck size={12} /> {totalQueue} item
              {totalQueue !== 1 ? "s" : ""} waiting on you
            </>
          ) : (
            <>
              <CheckCircle2 size={12} /> Nothing waiting — all queues clear
            </>
          )
        }
        initials={initials}
        gradient="linear-gradient(135deg, #0d9488 100%)"
      />

      {/* ── The queues this role exists to clear ───────────────────────────── */}
      <div>
        <SectionHead
          title="Waiting on You"
          sub={
            totalQueue > 0
              ? `${totalQueue} item${totalQueue !== 1 ? "s" : ""} to review`
              : "Every queue is clear"
          }
          icon={<ClipboardCheck size={16} />}
          color="purple"
        />
        <div className="db-kpi-grid" style={{ marginTop: 16 }}>
          {queues.map((q) => (
            <button
              key={q.key}
              type="button"
              className="coord-queue"
              onClick={() => navigate(q.to)}
            >
              <KpiCard
                label={q.label}
                value={q.value}
                sub={q.sub}
                icon={q.icon}
                color={q.color}
                trend={q.value > 0 ? "Action needed" : "Clear"}
                trendType={q.value > 0 ? "warn" : "up"}
              />
              <span className="coord-queue__cta">
                {q.cta} <ArrowRight size={13} />
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Everything else, for context ───────────────────────────────────── */}
      <div>
        <SectionHead
          title="System Overview"
          sub="Read-only — the numbers behind the queues"
          icon={<TrendingUp size={16} />}
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
            label="Active IT"
            value={students.active}
            sub="Currently interning"
            icon={<TrendingUp size={18} />}
            color="purple"
          />
          <KpiCard
            label="Completed"
            value={students.completed}
            sub="Finished their IT"
            icon={<CheckCircle2 size={18} />}
            color="green"
          />
          <KpiCard
            label="Verified Companies"
            value={companies.verified}
            sub={`${companies.total} on record`}
            icon={<Building2 size={18} />}
            color="blue"
          />
          <KpiCard
            label="Logbooks Pending"
            value={logbooks.pending}
            sub="Awaiting supervisor review"
            icon={<FileText size={18} />}
            color="amber"
          />
          <KpiCard
            label="Active Batches"
            value={batches.active}
            sub={`${batches.total} session${batches.total !== 1 ? "s" : ""} total`}
            icon={<Layers size={18} />}
            color="slate"
          />
        </div>
      </div>

      {/* ── The limits of the role, stated once ────────────────────────────── */}
      <div className="coord-scope">
        <ShieldAlert size={16} className="coord-scope__icon" />
        <div>
          <strong>What you can change</strong>
          <p>
            You approve and reject certificates, verify companies and
            placements, upload students, and open or close sessions. Anything
            that moves money, creates an account, changes a password or changes
            a student&rsquo;s status is handled by an administrator — those
            screens stay readable, with their controls switched off.
          </p>
        </div>
      </div>

      <style>{`
        .coord-queue {
          display: block;
          width: 100%;
          padding: 0;
          border: none;
          background: none;
          text-align: left;
          cursor: pointer;
        }

        .coord-queue .db-kpi {
          height: 100%;
          transition: transform 0.15s, box-shadow 0.15s;
        }

        .coord-queue:hover .db-kpi {
          transform: translateY(-2px);
          box-shadow: var(--shadow-float, 0 8px 24px rgba(0, 0, 0, 0.08));
        }

        .coord-queue__cta {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          margin-top: 8px;
          padding-left: 2px;
          font-size: 12px;
          font-weight: 600;
          color: var(--color-accent);
        }

        .coord-scope {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 14px 16px;
          border-radius: 12px;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
        }

        .coord-scope__icon {
          flex-shrink: 0;
          margin-top: 2px;
          color: #b45309;
        }

        .coord-scope strong {
          display: block;
          margin-bottom: 3px;
          font-size: 13px;
          color: var(--color-text-primary);
        }

        .coord-scope p {
          margin: 0;
          max-width: 78ch;
          font-size: 12.5px;
          line-height: 1.6;
          color: var(--color-text-secondary);
        }

        @media (max-width: 560px) {
          .coord-scope {
            padding: 12px 14px;
          }
        }
      `}</style>
    </div>
  );
}
