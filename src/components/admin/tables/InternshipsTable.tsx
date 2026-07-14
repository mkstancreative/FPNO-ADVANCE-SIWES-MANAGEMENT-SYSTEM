import { Eye, Star } from "lucide-react";
import GeneralTable from "../../ui/GeneralTable/GeneralTable";
import type { Column, TableMeta } from "../../ui/GeneralTable/GeneralTable";
import ActionDropdown from "../../ui/ActionDropdown/ActionDropDown";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";
import {
  useInternships,
  useSetCurrentInternship,
} from "../../../hooks/useInternships";
import type {
  Internship,
  InternshipParams,
} from "../../../api/types/internship";

interface InternshipsTableProps {
  params: Omit<InternshipParams, "page" | "limit">;
  page: number;
  limit: number;
  onPageChange: (p: number) => void;
  onLimitChange: (l: number) => void;
  onView: (internship: Internship) => void;
}

export default function InternshipsTable({
  params,
  page,
  limit,
  onPageChange,
  onLimitChange,
  onView,
}: InternshipsTableProps) {
  const { data, isLoading } = useInternships({ ...params, page, limit });
  const { mutate: setCurrent } = useSetCurrentInternship();

  const internships: Internship[] = data?.data ?? [];

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

  const columns: Column<Internship>[] = [
    {
      header: "Student",
      render: (row) => {
        const s = row.student;
        if (typeof s === "string") return s;
        return (
          <div className="cell-stack">
            <span
              className="cell-primary"
              style={{ fontSize: "0.8rem", fontWeight: 500 }}
            >
              {s.user.firstName} {s.user.lastName}
            </span>
            <br />
            <span className="cell-sub" style={{ fontSize: "0.8rem" }}>
              {s.registrationNumber}
            </span> 
          </div>
        );
      },
    },
    {
      header: "Batch",
      render: (row) =>
        typeof row.batch === "string" ? row.batch : row.batch.name,
    },
    { header: "Session", accessor: "session" },
    {
      header: "Status",
      render: (row) => <StatusBadge status={row.itStatus} />,
    },
    {
      header: "Current",
      render: (row) =>
        row.isCurrent ? (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "2px 8px",
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 700,
              background: "rgba(234,179,8,0.12)",
              color: "#ca8a04",
              border: "1px solid rgba(234,179,8,0.30)",
            }}
          >
            <Star size={11} fill="#ca8a04" color="#ca8a04" /> Current
          </span>
        ) : (
          "—"
        ),
    },
    {
      header: "Actions",
      render: (row) => (
        <ActionDropdown
          actions={[
            {
              label: "View",
              icon: <Eye size={13} />,
              onClick: () => onView(row),
            },
            {
              label: "Set as Current",
              icon: <Star size={13} />,
              onClick: () => setCurrent(row._id),
              disabled: row.isCurrent,
            },
          ]}
        />
      ),
    },
  ];

  return (
    <GeneralTable<Internship>
      columns={columns}
      data={internships}
      loading={isLoading}
      meta={meta}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
    />
  );
}
