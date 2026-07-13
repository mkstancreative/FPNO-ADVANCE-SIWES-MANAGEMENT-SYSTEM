import { CheckCircle } from "lucide-react";
import GeneralTable from "../../ui/GeneralTable/GeneralTable";
import ActionDropDown from "../../ui/ActionDropdown/ActionDropDown";
import type { Column, TableMeta } from "../../ui/GeneralTable/GeneralTable";
import type { PendingPlacement } from "../../../api/types/company";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";

interface PlacementsTableProps {
  data: PendingPlacement[];
  meta: TableMeta | null;
  loading?: boolean;
  onPageChange: (p: number) => void;
  onLimitChange: (l: number) => void;
  onVerify: (placement: PendingPlacement) => void;
  onView: (placement: PendingPlacement) => void;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

export default function PlacementsTable({
  data,
  meta,
  loading,
  onPageChange,
  onLimitChange,
  onVerify,
  selectedIds,
  onSelectionChange,
}: PlacementsTableProps) {
  const allSelected = data.length > 0 && selectedIds.length === data.length;

  const toggleAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(data.map((p) => p._id));
    }
  };

  const toggleOne = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((sid) => sid !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const columns: Column<PendingPlacement>[] = [
    {
      header: (
        <input
          type="checkbox"
          checked={allSelected}
          onChange={toggleAll}
          style={{ cursor: "pointer" }}
        />
      ) as unknown as string,
      render: (row) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(row._id)}
          onChange={() => toggleOne(row._id)}
          style={{ cursor: "pointer" }}
        />
      ),
    },
    {
      header: "Student",
      render: (row) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontWeight: 600 }}>
            {row.student.user.firstName} {row.student.user.lastName}
          </span>
          <span
            style={{ fontSize: 11.5, color: "var(--color-text-secondary)" }}
          >
            {row.student.registrationNumber}
          </span>
        </div>
      ),
    },
    {
      header: "Company",
      render: (row) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontWeight: 600 }}>{row.company.companyName}</span>
          <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>
            Dept: {row.department}
          </span>
        </div>
      ),
    },
    {
      header: "Clinical Supervisor",
      render: (row) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontWeight: 600 }}>
            {row.industrialSupervisor.name}
          </span>
          <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>
            {row.industrialSupervisor.phone}
          </span>
        </div>
      ),
    },
    {
      header: "IT Period",
      render: (row) => (
        <div style={{ fontSize: 12.5, color: "var(--color-text-primary)" }}>
          {new Date(row.student.itPeriod.startDate).toLocaleDateString(
            undefined,
            { month: "short", day: "numeric" },
          )}{" "}
          -{" "}
          {new Date(row.student.itPeriod.endDate).toLocaleDateString(
            undefined,
            { month: "short", day: "numeric", year: "numeric" },
          )}
        </div>
      ),
    },
    {
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Actions",
      render: (row) => (
        <ActionDropDown
          actions={[
            {
              label: "Review & Verify",
              icon: <CheckCircle size={14} />,
              onClick: () => onVerify(row),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <GeneralTable<PendingPlacement>
      columns={columns}
      data={data}
      loading={loading}
      meta={meta}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
    />
  );
}
