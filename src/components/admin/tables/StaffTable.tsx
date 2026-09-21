import { Eye, KeyRound, Mail, UserRoundPen } from "lucide-react";
import GeneralTable from "../../ui/GeneralTable/GeneralTable";
import type { Column, TableMeta } from "../../ui/GeneralTable/GeneralTable";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";
import ActionDropdown from "../../ui/ActionDropdown/ActionDropDown";
import { useStaff } from "../../../hooks/useStaff";
import { formatDate } from "../../../helpers/utilities";
import type { StaffParams, StaffUser } from "../../../api/types/staff";

interface Props {
  search?: string;
  /** Undefined means "any" — the filter is off, not set to false. */
  isActive?: boolean;
  mustChangePassword?: boolean;
  page: number;
  limit: number;
  onPageChange: (p: number) => void;
  onLimitChange: (l: number) => void;
  onView: (staff: StaffUser) => void;
  onEdit: (staff: StaffUser) => void;
  onResetPassword: (staff: StaffUser) => void;
}

export default function StaffTable({
  search,
  isActive,
  mustChangePassword,
  page,
  limit,
  onPageChange,
  onLimitChange,
  onView,
  onEdit,
  onResetPassword,
}: Props) {
  const params: StaffParams = {
    page,
    limit,
    ...(search ? { search } : {}),
    ...(isActive === undefined ? {} : { isActive }),
    ...(mustChangePassword === undefined ? {} : { mustChangePassword }),
  };

  const { data, isLoading } = useStaff(params);

  const staff: StaffUser[] = data?.data ?? [];

  const meta: TableMeta | null = data
    ? {
        page: data.page,
        pages: data.pages,
        count: data.total,
        limit,
        hasPrev: data.page > 1,
        hasNext: data.page < data.pages,
      }
    : null;

  const columns: Column<StaffUser>[] = [
    {
      header: "Coordinator",
      render: (s) => {
        const fullName = [s.firstName, s.lastName].filter(Boolean).join(" ");
        return (
          <div className="staff-td-identity">
            <span className="staff-td-name">{fullName || "—"}</span>
            {/* The email is the account's identity here — coordinators have no
                staff ID or registration number to fall back on — so it is set
                as a real second line rather than trailing the name inline. */}
            <a
              className="staff-td-email"
              href={`mailto:${s.email}`}
              title={s.email}
              onClick={(e) => e.stopPropagation()}
            >
              <Mail size={12} />
              <span>{s.email}</span>
            </a>
          </div>
        );
      },
    },
    {
      header: "Role",
      render: (s) => <StatusBadge status={s.role || "coordinator"} />,
    },
    {
      header: "Status",
      render: (s) =>
        s.isActive === undefined ? (
          <span className="staff-td-muted">—</span>
        ) : (
          <StatusBadge status={s.isActive ? "active" : "inactive"} />
        ),
    },
    {
      header: "Password",
      render: (s) =>
        s.mustChangePassword === undefined ? (
          <span className="staff-td-muted">—</span>
        ) : (
          <span
            className={`staff-pill ${
              s.mustChangePassword ? "staff-pill--warn" : "staff-pill--ok"
            }`}
          >
            {s.mustChangePassword ? "Change pending" : "Set"}
          </span>
        ),
    },
    {
      header: "Last Login",
      render: (s) =>
        s.lastLogin ? (
          <span className="staff-td-nowrap">{formatDate(s.lastLogin)}</span>
        ) : (
          <span className="staff-td-muted">Never</span>
        ),
    },
    {
      header: <div style={{ textAlign: "right" }}>Actions</div>,
      render: (s) => (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <ActionDropdown
            actions={[
              {
                label: "View Details",
                icon: <Eye size={13} />,
                onClick: () => onView(s),
              },
              {
                label: "Edit Record",
                icon: <UserRoundPen size={13} />,
                onClick: () => onEdit(s),
              },
              {
                label: "Reset Password",
                icon: <KeyRound size={13} />,
                onClick: () => onResetPassword(s),
              },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <GeneralTable<StaffUser>
        columns={columns}
        data={staff}
        loading={isLoading}
        meta={meta}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
      />
      <StaffTableStyles />
    </>
  );
}

/**
 * The shared `cell-stack` / `cell-primary` / `cell-sub` class names several
 * other tables reach for are not defined in any stylesheet, so a "stacked"
 * cell renders as two inline spans on one line. These are scoped replacements
 * rather than a global fix, which would restyle those tables uninvited.
 */
function StaffTableStyles() {
  return (
    <style>{`
      .staff-td-identity {
        display: flex;
        flex-direction: column;
        gap: 3px;
        /* Wide enough that the column cannot be crushed to a ragged sliver,
           narrow enough to leave room for the five columns beside it. */
        min-width: 160px;
        max-width: 320px;
      }

      .staff-td-name {
        font-weight: 600;
        font-size: 13.5px;
        color: var(--color-text-primary);
      }

      .staff-td-email {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        min-width: 0;
        font-size: 12.5px;
        color: var(--color-text-muted);
        text-decoration: none;
      }

      .staff-td-email > span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .staff-td-email:hover {
        color: var(--color-accent);
        text-decoration: underline;
      }

      .staff-td-email svg {
        flex-shrink: 0;
      }

      .staff-td-muted {
        color: var(--color-text-muted);
      }

      .staff-td-nowrap {
        white-space: nowrap;
      }

      .staff-pill {
        display: inline-block;
        padding: 3px 9px;
        border-radius: 999px;
        font-size: 11.5px;
        font-weight: 600;
        white-space: nowrap;
      }

      .staff-pill--warn {
        color: #b45309;
        background: rgba(245, 158, 11, 0.12);
        border: 1px solid rgba(245, 158, 11, 0.3);
      }

      .staff-pill--ok {
        color: #047857;
        background: rgba(16, 185, 129, 0.1);
        border: 1px solid rgba(16, 185, 129, 0.28);
      }

      @media (max-width: 768px) {
        .staff-td-identity {
          min-width: 150px;
          max-width: 200px;
        }
        .staff-td-email {
          font-size: 11.5px;
        }
      }
    `}</style>
  );
}
