import { Eye, FileText } from "lucide-react";
import GeneralTable from "../../ui/GeneralTable/GeneralTable";
import ActionDropDown from "../../ui/ActionDropdown/ActionDropDown";
import type { Column, TableMeta } from "../../ui/GeneralTable/GeneralTable";
import type { Student } from "../../../api/types/student";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";

interface AdminStudentsTableProps {
  students: Student[];
  meta: TableMeta | null;
  loading?: boolean;
  onPageChange: (p: number) => void;
  onLimitChange: (l: number) => void;
  onView: (student: Student) => void;
  onProgress: (student: Student) => void;
  onViewReport: (student: Student) => void;
  // bulk selection (omit both + set hideCheckbox to render without a selection column)
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  hideSession?: boolean;
  hideDeptCode?: boolean;
  hideActions?: boolean;
  hideCheckbox?: boolean;
}

function Avatar({ src, name }: { src?: string; name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  // Strip "/api" or "/api/v1" from the end of the base URL to get the root domain
  const apiBase = (import.meta.env.VITE_API_URL ?? "").replace(
    /\/api(\/v\d+)?\/?$/,
    "",
  );

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {src ? (
        <img
          src={`${apiBase}${src.startsWith("/") ? "" : "/"}${src}`}
          alt={name}
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            objectFit: "cover",
            flexShrink: 0,
          }}
        />
      ) : (
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "var(--color-accent-muted)",
            color: "var(--color-accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11.5,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
      )}
      <div>
        <div
          style={{
            fontWeight: 600,
            fontSize: 13,
            color: "var(--color-text-primary)",
          }}
        >
          {name}
        </div>
        <div style={{ fontSize: 11.5, color: "var(--color-text-secondary)" }}>
          {initials}
        </div>
      </div>
    </div>
  );
}

function CheckBox({
  checked,
  indeterminate,
  onChange,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
}) {
  return (
    <input
      type="checkbox"
      checked={checked}
      ref={(el) => {
        if (el) el.indeterminate = !!indeterminate;
      }}
      onChange={onChange}
      style={{
        width: 15,
        height: 15,
        cursor: "pointer",
        accentColor: "var(--color-accent)",
      }}
    />
  );
}

export default function AdminStudentsTable({
  students,
  meta,
  loading,
  onPageChange,
  onLimitChange,
  onView,
  onProgress,
  onViewReport,
  selectedIds = new Set(),
  onSelectionChange,
  hideSession = false,
  hideDeptCode = false,
  hideActions = false,
  hideCheckbox = false,
}: AdminStudentsTableProps) {
  const allSelected =
    students.length > 0 && students.every((s) => selectedIds.has(s._id));
  const someSelected = students.some((s) => selectedIds.has(s._id));

  const toggleAll = () => {
    if (!onSelectionChange) return;
    if (allSelected) {
      const next = new Set(selectedIds);
      students.forEach((s) => next.delete(s._id));
      onSelectionChange(next);
    } else {
      const next = new Set(selectedIds);
      students.forEach((s) => next.add(s._id));
      onSelectionChange(next);
    }
  };

  const toggleOne = (id: string) => {
    if (!onSelectionChange) return;
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onSelectionChange(next);
  };

  const columns: Column<Student>[] = [
    {
      header: (
        <CheckBox
          checked={allSelected}
          indeterminate={someSelected && !allSelected}
          onChange={toggleAll}
        />
      ) as unknown as string,
      render: (row) => (
        <CheckBox
          checked={selectedIds.has(row._id)}
          onChange={() => toggleOne(row._id)}
        />
      ),
    },
    {
      header: "Student",
      render: (row) => (
        <Avatar
          src={row.passportPhoto}
          name={`${row.user.firstName} ${row.user.lastName}`}
        />
      ),
    },
    { header: "Reg. Number", accessor: "registrationNumber" },
    {
      header: "Department",
      render: (row) => (
        <span>
          {row.department.name}{" "}
          {!hideDeptCode && (
            <span
              style={{ fontSize: 11, color: "var(--color-text-secondary)" }}
            >
              ({row.department.code})
            </span>
          )}
        </span>
      ),
    },
    {
      header: "Program",
      render: (row) => `${row.program.type} — ${row.program.level}`,
    },
    { header: "Session", accessor: "session" },
    {
      header: "IT Status",
      render: (row) => <StatusBadge status={row.itStatus} />,
    },
    {
      header: "Actions",
      render: (row) => (
        <ActionDropDown
          actions={[
            {
              label: "View Profile",
              icon: <Eye size={13} />,
              onClick: () => onView(row),
            },
            {
              label: "View Progress",
              icon: <Eye size={13} />,
              onClick: () => onProgress(row),
            },
            {
              label: "View IT Report",
              icon: <FileText size={13} />,
              onClick: () => onViewReport(row),
            },
          ]}
        />
      ),
    },
  ];

  const finalColumns = columns.filter((col, i) => {
    if (hideCheckbox && i === 0) return false;
    if (hideSession && col.header === "Session") return false;
    if (hideActions && col.header === "Actions") return false;
    return true;
  });

  return (
    <GeneralTable<Student>
      columns={finalColumns}
      data={students}
      loading={loading}
      meta={meta}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
    />
  );
}
