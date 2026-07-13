import { CheckCircle, Users, XCircle } from "lucide-react";
import type { Company } from "../../../api/types/company";
import type { Column, TableMeta } from "../../ui/GeneralTable/GeneralTable";
import GeneralTable from "../../ui/GeneralTable/GeneralTable";
import ActionDropdown from "../../ui/ActionDropdown/ActionDropDown";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";

interface Props {
  data: Company[];
  loading: boolean;
  meta: TableMeta | null;
  onPageChange: (p: number) => void;
  onLimitChange: (l: number) => void;
  onVerify?: (company: Company) => void;
  onView?: (company: Company) => void;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
}

export default function CompaniesTable({
  data,
  loading,
  meta,
  onPageChange,
  onLimitChange,
  onVerify,
  onView,
  selectedIds = [],
  onSelectionChange,
}: Props) {
  const selectableIds = data
    .filter((c) => c.verificationStatus !== "verified")
    .map((c) => c._id);

  const isAllSelected =
    selectableIds.length > 0 &&
    selectableIds.every((id) => selectedIds.includes(id));

  const toggleAll = () => {
    if (isAllSelected) {
      onSelectionChange?.(
        selectedIds.filter((id) => !selectableIds.includes(id)),
      );
    } else {
      onSelectionChange?.([...new Set([...selectedIds, ...selectableIds])]);
    }
  };

  const toggleOne = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange?.(selectedIds.filter((x) => x !== id));
    } else {
      onSelectionChange?.([...selectedIds, id]);
    }
  };

  const columns: Column<Company>[] = [
    {
      header: (
        <input
          type="checkbox"
          checked={isAllSelected}
          onChange={toggleAll}
          style={{ cursor: "pointer" }}
        />
      ),
      render: (c) => (
        <div style={{ width: 20 }}>
          {c.verificationStatus !== "verified" && (
            <input
              type="checkbox"
              checked={selectedIds.includes(c._id)}
              onChange={() => toggleOne(c._id)}
              style={{ cursor: "pointer" }}
            />
          )}
        </div>
      ),
    },
    {
      header: "Company Name",
      render: (c) => (
        <div className="cell-stack">
          <span className="cell-primary">{c.companyName}</span>
          <br />
          <span className="cell-sub" style={{ fontSize: 12 }}>
            {c.email}
          </span>
        </div>
      ),
    },
    {
      header: "Industry",
      accessor: "industry",
    },
    {
      header: "Type",
      render: (c) => (
        <span
          className="badge badge-neutral"
          style={{ textTransform: "capitalize" }}
        >
          {c.companyType}
        </span>
      ),
    },
    {
      header: "Location",
      render: (c) => `${c.address.city}, ${c.address.state}`,
    },
    {
      header: "Phone",
      accessor: "phone",
    },
    {
      header: "Students",
      render: (c) => (
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: 13,
          }}
        >
          <Users size={12} style={{ color: "var(--color-text-muted)" }} />
          {c.studentCount}
        </span>
      ),
    },
    {
      header: "Status",
      render: (c) => <StatusBadge status={c.verificationStatus} />,
    },
  ];

  if (onVerify) {
    columns.push({
      header: "Actions",
      render: (c) => (
        <ActionDropdown
          actions={[
            {
              label: "View Details",
              icon: <Users size={13} />,
              onClick: () => onView?.(c),
            },
            {
              label: "Verify / Reject",
              icon: <CheckCircle size={13} />,
              onClick: () => onVerify(c),
            },
            {
              label: "Reject",
              icon: <XCircle size={13} />,
              onClick: () =>
                onVerify({ ...c, verificationStatus: "rejected" as const }),
              danger: true,
              disabled: c.verificationStatus === "rejected",
            },
          ]}
        />
      ),
    });
  }

  return (
    <GeneralTable<Company>
      columns={columns}
      data={data}
      loading={loading}
      meta={meta}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
      rowProps={(c) => ({
        className: selectedIds.includes(c._id) ? "row-selected" : "",
      })}
    />
  );
}
