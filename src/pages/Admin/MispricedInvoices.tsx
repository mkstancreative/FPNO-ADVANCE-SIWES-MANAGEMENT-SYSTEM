import { useState } from "react";
import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  ReceiptText,
  Wallet,
  Wrench,
} from "lucide-react";
import GeneralTable from "../../components/ui/GeneralTable/GeneralTable";
import type { Column } from "../../components/ui/GeneralTable/GeneralTable";
import StatCard from "../../components/ui/StatCard/StatCard";
import Spinner from "../../components/ui/Spinner/Spinner";
import Toggler from "../../components/ui/Toggler/Toggler";
import ConfirmModal from "../../components/ui/ConfirmModal/ConfirmModal";
import CustomModal from "../../components/ui/CustomModal/CustomModal";
import StatusBadge from "../../components/ui/StatusBadge/StatusBadge";
import RepriceReportSummary from "../../components/admin/certificates/RepriceReportSummary";
import {
  useMispricedInvoices,
  useRepriceCertificates,
} from "../../hooks/useCertificate";
import { formatDate, naira } from "../../helpers/utilities";
import { usePermissions, ADMIN_ONLY_HINT } from "../../hooks/usePermissions";
import { ReadOnlyNotice } from "../../components/ui/Permission/Permission";
import type {
  MispricedInvoice,
  RepriceReport,
} from "../../api/types/certificate";

/**
 * ⚠ Sign convention, and it is the opposite of the Refunds & Balances screen.
 *
 * Here `difference = correctAmount - currentAmount`, so a **negative**
 * difference means the invoice charges more than the student owes — they are
 * being over-billed. Do not reuse this helper for a discrepancy row.
 */
function describeMispricing(row: MispricedInvoice) {
  if (row.difference < 0) {
    return {
      tone: "#d97706",
      label: `Over-billed by ${naira(Math.abs(row.difference))}`,
    };
  }
  if (row.difference > 0) {
    return {
      tone: "#0369a1",
      label: `Under-billed by ${naira(row.difference)}`,
    };
  }
  return { tone: "var(--color-text-muted)", label: "—" };
}

export default function MispricedInvoices() {
  const { canEdit } = usePermissions();
  const [includePaid, setIncludePaid] = useState(false);
  const [confirmAll, setConfirmAll] = useState(false);
  const [report, setReport] = useState<RepriceReport | null>(null);
  /** Reg. number currently being fixed, so only that row shows a spinner. */
  const [fixing, setFixing] = useState<string | null>(null);

  const { data, isLoading } = useMispricedInvoices({ includePaid });
  const { mutate: reprice, isPending } = useRepriceCertificates();

  const summary = data?.data;
  const items = summary?.items ?? [];

  const fixOne = (registrationNumber: string) => {
    setFixing(registrationNumber);
    reprice(
      { registrationNumber },
      {
        onSuccess: (res) => setReport(res.data),
        onSettled: () => setFixing(null),
      },
    );
  };

  // `all: true` is deliberately explicit on the backend — never a default.
  const fixAll = () =>
    reprice(
      { all: true },
      {
        onSuccess: (res) => {
          setReport(res.data);
          setConfirmAll(false);
        },
      },
    );

  const columns: Column<MispricedInvoice>[] = [
    {
      header: "Reg. Number",
      render: (row) => (
        <span style={{ fontFamily: "monospace", fontWeight: 600 }}>
          {row.registrationNumber}
        </span>
      ),
    },
    {
      header: "Invoice Says",
      render: (row) => naira(row.currentAmount),
    },
    {
      header: "Actually Owes",
      render: (row) => (
        <strong style={{ color: "var(--color-text-primary)" }}>
          {naira(row.correctAmount)}
        </strong>
      ),
    },
    {
      header: "Discrepancy",
      render: (row) => {
        const { tone, label } = describeMispricing(row);
        return (
          <span style={{ color: tone, fontWeight: 600, fontSize: 12.5 }}>
            {label}
          </span>
        );
      },
    },
    {
      header: "Discount",
      render: (row) => (row.discountApplied ? "Applied" : "—"),
    },
    {
      header: "Payment",
      render: (row) => <StatusBadge status={row.paymentStatus} />,
    },
    {
      header: "RRR",
      render: (row) => (
        <span style={{ fontFamily: "monospace", fontSize: 12 }}>{row.rrr}</span>
      ),
    },
    {
      header: "Raised",
      render: (row) => formatDate(row.createdAt),
    },
    {
      header: "",
      render: (row) => {
        // An invoice that has already been paid is never re-priced — it needs
        // a refund decision instead, which lives on Refunds & Balances.
        const paid = row.paymentStatus === "successful";
        return (
          <button
            className="mi-fix"
            onClick={() => fixOne(row.registrationNumber)}
            disabled={!canEdit || paid || isPending}
            title={
              !canEdit
                ? ADMIN_ONLY_HINT
                : paid
                  ? "Already paid — settle this in Refunds & Balances"
                  : "Issue a corrected invoice at the right amount"
            }
          >
            {fixing === row.registrationNumber ? (
              <Spinner size={11} color="currentColor" text="" />
            ) : (
              <>
                <Wrench size={12} /> Fix
              </>
            )}
          </button>
        );
      },
    },
  ];

  return (
    <div className="page-container">
      <ReadOnlyNotice>
        You can review every mispriced invoice here. Issuing a corrected invoice
        is limited to administrators.
      </ReadOnlyNotice>
      {/* ── Header ── */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon orange">
            <ReceiptText size={20} />
          </div>
          <div>
            <h2 className="page-title">Mispriced Invoices</h2>
            <p className="page-sub">
              Certificate invoices charging something other than what the
              student owes
            </p>
          </div>
        </div>
        <div className="page-header-right">
          {canEdit && (
            <button
              className="modal-submit"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                fontSize: 13,
              }}
              onClick={() => setConfirmAll(true)}
              disabled={isPending || items.length === 0}
            >
              <Wrench size={14} />
              Fix All ({summary?.count ?? 0})
            </button>
          )}
        </div>
      </div>

      {/* ── Counts ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 20,
          marginBottom: 24,
        }}
      >
        <StatCard
          label="Mispriced"
          value={summary?.count ?? 0}
          icon={<AlertTriangle size={20} />}
          color="#d97706"
        />
        <StatCard
          label="Over-billed"
          value={summary?.overcharged ?? 0}
          icon={<ArrowDownCircle size={20} />}
          color="#dc2626"
        />
        <StatCard
          label="Under-billed"
          value={summary?.undercharged ?? 0}
          icon={<ArrowUpCircle size={20} />}
          color="#0369a1"
        />
        <StatCard
          label="Total Over-billed"
          value={naira(summary?.totalOverchargedAmount ?? 0)}
          icon={<Wallet size={20} />}
          color="#7c3aed"
        />
      </div>

      {/* ── Dry-run note + scope toggle ── */}
      <div className="mi-bar">
        <p>
          This is a dry run — listing it changes nothing. <strong>Fix</strong>{" "}
          issues a new reference at the correct amount and notifies the student
          to discard their old invoice.
        </p>
        <label className="mi-toggle">
          <Toggler
            checked={includePaid}
            onChange={(e) => setIncludePaid(e.target.checked)}
          />
          <span>Include already-paid</span>
        </label>
      </div>

      {/* ── Table ── */}
      <div className="table-wrapper">
        <GeneralTable<MispricedInvoice>
          columns={columns}
          data={items}
          loading={isLoading}
        />
      </div>

      {/* ── Fix All confirmation ── */}
      <ConfirmModal
        isOpen={confirmAll}
        variant="warning"
        title={`Re-price ${summary?.count ?? 0} invoice${summary?.count === 1 ? "" : "s"}?`}
        message={
          "Each one gets a brand-new payment reference at the corrected amount, and the student is notified automatically. " +
          "The references they hold today stay payable at the bank, so anyone who has already printed an invoice may still pay the old amount."
        }
        confirmText={isPending ? "Re-pricing…" : "Re-price all"}
        onConfirm={fixAll}
        onCancel={() => setConfirmAll(false)}
        isPending={isPending}
      />

      {/* ── Outcome ── */}
      <CustomModal
        isOpen={report !== null}
        onClose={() => setReport(null)}
        title="Re-pricing Result"
        subtitle="What changed, and what still needs a person"
        icon={<Wrench size={16} />}
        size="medium"
        footer={
          <button
            className="modal-submit"
            type="button"
            onClick={() => setReport(null)}
          >
            Done
          </button>
        }
      >
        <RepriceReportSummary
          report={report}
          onRetry={fixOne}
          retryingFor={fixing}
        />
      </CustomModal>

      <style>{`
        .mi-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
          margin-bottom: 18px;
          padding: 12px 16px;
          border-radius: 10px;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
        }
        .mi-bar p {
          margin: 0;
          max-width: 70ch;
          font-size: 12.5px;
          line-height: 1.55;
          color: var(--color-text-secondary);
        }
        .mi-bar strong { color: var(--color-text-primary); }
        .mi-toggle {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          font-size: 12.5px;
          font-weight: 600;
          white-space: nowrap;
          color: var(--color-text-secondary);
        }
        .mi-fix {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 10px;
          font-size: 12px;
          font-weight: 600;
          border-radius: 6px;
          cursor: pointer;
          color: var(--color-accent);
          background: transparent;
          border: 1px solid var(--color-accent);
        }
        .mi-fix:hover:not(:disabled) {
          background: var(--color-accent);
          color: #fff;
        }
        .mi-fix:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
