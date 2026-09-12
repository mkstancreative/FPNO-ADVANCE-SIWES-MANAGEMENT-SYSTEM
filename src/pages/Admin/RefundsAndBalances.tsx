import { useState, type FormEvent } from "react";
import {
  BadgeCheck,
  Banknote,
  HandCoins,
  Mail,
  Phone,
  Scale,
} from "lucide-react";
import GeneralTable from "../../components/ui/GeneralTable/GeneralTable";
import type { Column } from "../../components/ui/GeneralTable/GeneralTable";
import StatCard from "../../components/ui/StatCard/StatCard";
import Spinner from "../../components/ui/Spinner/Spinner";
import Toggler from "../../components/ui/Toggler/Toggler";
import CustomModal from "../../components/ui/CustomModal/CustomModal";
import {
  useCertificateDiscrepancies,
  useResolveDiscrepancy,
} from "../../hooks/useCertificate";
import { formatDate, naira } from "../../helpers/utilities";
import type { CertificateDiscrepancy } from "../../api/types/certificate";

/**
 * ⚠ Sign convention, and it is the opposite of the Mispriced Invoices screen.
 *
 * Here `difference = paidAmount - expectedAmount`, so a **positive**
 * difference means the student overpaid and the office owes them a refund.
 * `direction` says the same thing; prefer it, and treat the sign as backup.
 */
function describeDiscrepancy(row: CertificateDiscrepancy) {
  const amount = Math.abs(row.difference);
  return row.direction === "over"
    ? { tone: "#dc2626", label: `Refund ${naira(amount)}`, verb: "refunded" }
    : { tone: "#0369a1", label: `Collect ${naira(amount)}`, verb: "collected" };
}

export default function RefundsAndBalances() {
  const [includeResolved, setIncludeResolved] = useState(false);
  const [active, setActive] = useState<CertificateDiscrepancy | null>(null);

  const { data, isLoading } = useCertificateDiscrepancies({ includeResolved });

  const summary = data?.data;
  const items = summary?.items ?? [];

  const columns: Column<CertificateDiscrepancy>[] = [
    {
      header: "Student",
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>
            {row.name || "—"}
          </div>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 11.5,
              color: "var(--color-text-secondary)",
            }}
          >
            {row.registrationNumber}
          </div>
        </div>
      ),
    },
    {
      header: "Contact",
      render: (row) => (
        // Included deliberately by the API — this is a call-the-student list.
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {row.phone && (
            <a className="rb-contact" href={`tel:${row.phone}`}>
              <Phone size={11} /> {row.phone}
            </a>
          )}
          {row.email && (
            <a className="rb-contact" href={`mailto:${row.email}`}>
              <Mail size={11} /> {row.email}
            </a>
          )}
        </div>
      ),
    },
    { header: "Paid", render: (row) => naira(row.paidAmount) },
    { header: "Owed", render: (row) => naira(row.expectedAmount) },
    {
      header: "Action Needed",
      render: (row) => {
        const { tone, label } = describeDiscrepancy(row);
        return (
          <span style={{ color: tone, fontWeight: 700, fontSize: 12.5 }}>
            {label}
          </span>
        );
      },
    },
    {
      header: "RRR",
      render: (row) => (
        <span style={{ fontFamily: "monospace", fontSize: 12 }}>{row.rrr}</span>
      ),
    },
    { header: "Detected", render: (row) => formatDate(row.detectedAt) },
    {
      header: "",
      render: (row) =>
        row.resolved ? (
          <span className="rb-settled">
            <BadgeCheck size={13} /> Settled
          </span>
        ) : (
          <button className="rb-resolve" onClick={() => setActive(row)}>
            Mark settled
          </button>
        ),
    },
  ];

  return (
    <div className="page-container">
      {/* ── Header ── */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon orange">
            <Scale size={20} />
          </div>
          <div>
            <h2 className="page-title">Refunds &amp; Balances</h2>
            <p className="page-sub">
              Students who paid an amount other than what they owed
            </p>
          </div>
        </div>
      </div>

      {/* ── Totals ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 20,
          marginBottom: 24,
        }}
      >
        <StatCard
          label="Open Cases"
          value={summary?.count ?? 0}
          icon={<Scale size={20} />}
          color="#7c3aed"
        />
        <StatCard
          label="Refunds Owed"
          value={naira(summary?.refundsOwed ?? 0)}
          icon={<HandCoins size={20} />}
          color="#dc2626"
        />
        <StatCard
          label="Balances Owed"
          value={naira(summary?.balancesOwed ?? 0)}
          icon={<Banknote size={20} />}
          color="#0369a1"
        />
      </div>

      <div className="rb-bar">
        <p>
          Each row is a phone call. A <strong>refund</strong> means the office
          owes the student; a <strong>balance</strong> means the student still
          owes. Mark a case settled only once the money has actually moved.
        </p>
        <label className="rb-toggle">
          <Toggler
            checked={includeResolved}
            onChange={(e) => setIncludeResolved(e.target.checked)}
          />
          <span>Include settled</span>
        </label>
      </div>

      {/* ── Table ── */}
      <div className="table-wrapper">
        <GeneralTable<CertificateDiscrepancy>
          columns={columns}
          data={items}
          loading={isLoading}
        />
      </div>

      {active && (
        <ResolveDialog
          discrepancy={active}
          onClose={() => setActive(null)}
        />
      )}

      <style>{`
        .rb-bar {
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
        .rb-bar p {
          margin: 0;
          max-width: 70ch;
          font-size: 12.5px;
          line-height: 1.55;
          color: var(--color-text-secondary);
        }
        .rb-bar strong { color: var(--color-text-primary); }
        .rb-toggle {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          font-size: 12.5px;
          font-weight: 600;
          white-space: nowrap;
          color: var(--color-text-secondary);
        }
        .rb-contact {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11.5px;
          color: var(--color-text-secondary);
          text-decoration: none;
        }
        .rb-contact:hover { color: var(--color-accent); }
        .rb-resolve {
          padding: 5px 10px;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
          border-radius: 6px;
          cursor: pointer;
          color: var(--color-accent);
          background: transparent;
          border: 1px solid var(--color-accent);
        }
        .rb-resolve:hover { background: var(--color-accent); color: #fff; }
        .rb-settled {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          font-weight: 600;
          color: #059669;
        }
      `}</style>
    </div>
  );
}

/**
 * The note is required, not decorative: it is the only record of *how* a case
 * was settled. The backend stamps who resolved it and when.
 */
function ResolveDialog({
  discrepancy,
  onClose,
}: {
  discrepancy: CertificateDiscrepancy;
  onClose: () => void;
}) {
  const [note, setNote] = useState("");
  const { mutate: resolve, isPending } = useResolveDiscrepancy();
  const { label, verb } = describeDiscrepancy(discrepancy);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = note.trim();
    if (!trimmed) return;
    resolve(
      { certificateId: discrepancy.certificateId, note: trimmed },
      { onSuccess: onClose },
    );
  };

  return (
    <CustomModal
      isOpen
      onClose={onClose}
      title="Mark as Settled"
      subtitle={`${discrepancy.name || discrepancy.registrationNumber} — ${label}`}
      icon={<BadgeCheck size={16} />}
      size="medium"
      footer={
        <>
          <button
            className="modal-cancel"
            type="button"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            className="modal-submit"
            form="resolve-discrepancy-form"
            type="submit"
            disabled={isPending || !note.trim()}
          >
            {isPending ? (
              <Spinner size={14} color="#fff" text="" />
            ) : (
              "Mark settled"
            )}
          </button>
        </>
      }
    >
      <form
        id="resolve-discrepancy-form"
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 14 }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 10,
            padding: "12px 14px",
            borderRadius: 10,
            background: "var(--color-bg-secondary)",
            border: "1px solid var(--color-border)",
            fontSize: 12.5,
          }}
        >
          <Fact label="Paid" value={naira(discrepancy.paidAmount)} />
          <Fact label="Owed" value={naira(discrepancy.expectedAmount)} />
          <Fact label="Reference" value={discrepancy.rrr} mono />
        </div>

        <div className="form-group">
          <label className="modal-label">
            How was it settled? <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <textarea
            required
            rows={3}
            className="modal-input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={`e.g. ${verb === "refunded" ? "Refunded ₦2,500 in cash, receipt 001" : "Balance of ₦2,500 collected at the bursary, receipt 014"}`}
          />
          <span style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>
            This note is the only record of how the money moved, so be specific.
          </span>
        </div>
      </form>
    </CustomModal>
  );
}

function Fact({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
        {label}
      </div>
      <div
        style={{
          fontWeight: 600,
          color: "var(--color-text-primary)",
          fontFamily: mono ? "monospace" : undefined,
        }}
      >
        {value}
      </div>
    </div>
  );
}
