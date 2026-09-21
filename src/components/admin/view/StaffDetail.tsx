import { displayName } from "../../../helpers/names";
import { IdCard, KeyRound, Mail, UserRoundPen } from "lucide-react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import Spinner from "../../ui/Spinner/Spinner";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";
import { useStaffById } from "../../../hooks/useStaff";
import { formatDateTime } from "../../../helpers/utilities";
import type { StaffUser } from "../../../api/types/staff";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** The list row, shown while the full record is fetched by id. */
  staff: StaffUser;
  onEdit?: (staff: StaffUser) => void;
  onResetPassword?: (staff: StaffUser) => void;
}

export default function StaffDetail({
  isOpen,
  onClose,
  staff,
  onEdit,
  onResetPassword,
}: Props) {
  const { data, isLoading, isError } = useStaffById(staff._id);

  // Fall back to the row while the fetch is in flight, so the modal opens with
  // the name and email already on screen rather than an empty frame.
  const record: StaffUser = data?.data ?? staff;
  const fullName = displayName(record, record.email);

  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "Full Name", value: fullName },
    {
      label: "Email",
      value: record.email ? (
        <a className="staff-detail-email" href={`mailto:${record.email}`}>
          <Mail size={13} />
          <span>{record.email}</span>
        </a>
      ) : (
        "—"
      ),
    },
    { label: "Phone", value: record.phone || "—" },
    {
      label: "Role",
      value: <StatusBadge status={record.role || "coordinator"} />,
    },
    {
      label: "Status",
      value:
        record.isActive === undefined ? (
          "—"
        ) : (
          <StatusBadge status={record.isActive ? "active" : "inactive"} />
        ),
    },
    {
      label: "Password",
      value:
        record.mustChangePassword === undefined ? (
          "—"
        ) : record.mustChangePassword ? (
          <span className="staff-detail-warn">
            Change required at next login
          </span>
        ) : (
          <span className="staff-detail-ok">Set by the holder</span>
        ),
    },
    {
      label: "Last Login",
      value: record.lastLogin ? formatDateTime(record.lastLogin) : "Never",
    },
    {
      label: "Created",
      value: record.createdAt ? formatDateTime(record.createdAt) : "—",
    },
  ];

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Coordinator"
      subtitle={fullName}
      icon={<IdCard size={16} />}
      size="medium"
      footer={
        <>
          {onEdit && (
            <button
              className="modal-cancel staff-detail-footer-btn"
              type="button"
              onClick={() => onEdit(record)}
            >
              <UserRoundPen size={14} />
              Edit Record
            </button>
          )}
          {onResetPassword && (
            <button
              className="modal-cancel staff-detail-footer-btn"
              type="button"
              onClick={() => onResetPassword(record)}
            >
              <KeyRound size={14} />
              Reset Password
            </button>
          )}
          <button className="modal-submit" type="button" onClick={onClose}>
            Done
          </button>
        </>
      }
    >
      <StaffDetailStyles />

      {isError ? (
        <div className="staff-detail-error">
          Could not load the full record. Showing what the staff list already
          knows about this account.
        </div>
      ) : null}

      <div className="staff-detail-card">
        {rows.map((row) => (
          <div key={row.label} className="staff-detail-row">
            <span className="staff-detail-label">{row.label}</span>
            <span className="staff-detail-value">{row.value}</span>
          </div>
        ))}

        {isLoading && (
          <div className="staff-detail-loading">
            <Spinner size={11} color="var(--color-accent)" text="" />
            Refreshing…
          </div>
        )}
      </div>
    </CustomModal>
  );
}

/**
 * Two columns while there is room; below 560px each field's label sits above
 * its value, which is the only way a long email and a timestamp both stay
 * readable on a phone.
 */
function StaffDetailStyles() {
  return (
    <style>{`
      .staff-detail-card {
        border: 1px solid var(--color-border);
        border-radius: 10px;
        overflow: hidden;
      }

      .staff-detail-row {
        display: grid;
        grid-template-columns: minmax(110px, 1fr) 2fr;
        gap: 10px;
        padding: 10px 14px;
        font-size: 12.5px;
      }

      .staff-detail-row + .staff-detail-row {
        border-top: 1px solid var(--color-border);
      }

      .staff-detail-label {
        font-weight: 600;
        color: var(--color-text-secondary);
      }

      .staff-detail-value {
        min-width: 0;
        color: var(--color-text-primary);
        overflow-wrap: anywhere;
      }

      .staff-detail-email {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: var(--color-accent);
        text-decoration: none;
        overflow-wrap: anywhere;
      }

      .staff-detail-email:hover {
        text-decoration: underline;
      }

      .staff-detail-email svg {
        flex-shrink: 0;
      }

      .staff-detail-warn {
        font-weight: 600;
        color: #b45309;
      }

      .staff-detail-ok {
        font-weight: 600;
        color: #047857;
      }

      .staff-detail-error {
        margin-bottom: 16px;
        padding: 10px 14px;
        border-radius: 8px;
        font-size: 12.5px;
        line-height: 1.55;
        color: #b91c1c;
        background: rgba(239, 68, 68, 0.08);
        border: 1px solid rgba(239, 68, 68, 0.25);
        border-left: 4px solid #ef4444;
      }

      .staff-detail-loading {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 14px;
        font-size: 11.5px;
        color: var(--color-text-muted);
        border-top: 1px solid var(--color-border);
      }

      .staff-detail-footer-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }

      @media (max-width: 560px) {
        .staff-detail-row {
          grid-template-columns: 1fr;
          gap: 3px;
        }
        .staff-detail-label {
          font-size: 11px;
          letter-spacing: 0.4px;
          text-transform: uppercase;
        }
        /* The footer's two buttons do not fit side by side at this width. */
        .modal-actions:has(.staff-detail-footer-btn) {
          flex-direction: column-reverse;
        }
        .modal-actions:has(.staff-detail-footer-btn) > * {
          width: 100%;
          justify-content: center;
        }
      }
    `}</style>
  );
}
