import { UserRoundCog, Users } from "lucide-react";
import { useSupervisors } from "../../../hooks/useSupervisor";
import type {
  Supervisor,
  SupervisorParams,
} from "../../../api/types/supervisor";
import type { Column, TableMeta } from "../../ui/GeneralTable/GeneralTable";
import GeneralTable from "../../ui/GeneralTable/GeneralTable";
import ActionDropdown from "../../ui/ActionDropdown/ActionDropDown";

interface Props {
  search?: string;
  department?: string;
  page: number;
  limit: number;
  onPageChange: (p: number) => void;
  onLimitChange: (l: number) => void;
  onEditDepartments: (supervisor: Supervisor) => void;
}

export default function SupervisorsTable({
  search,
  department,
  page,
  limit,
  onPageChange,
  onLimitChange,
  onEditDepartments,
}: Props) {
  const params: SupervisorParams = {
    page,
    limit,
    ...(search ? { search } : {}),
    ...(department ? { department } : {}),
  };

  const { data, isLoading } = useSupervisors(params);

  // data is SupervisorListResponse (service unwraps response.data)
  const supervisors: Supervisor[] = data?.data ?? [];

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

  const columns: Column<Supervisor>[] = [
    {
      header: "Name",
      render: (sv) => (
        <div className="cell-stack">
          <span
            className="cell-primary"
            style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}
          >
            {sv.user.firstName} {sv.user.lastName}
          </span>
          <span className="cell-sub"
           style={{ fontSize: 13, color: "var(--color-text-muted)"}}
          >{sv.user.email}</span>
        </div>
      ),
    },
    {
      header: "Phone",
      render: (sv) => sv.user.phone || "—",
    },
    {
      header: "Staff ID",
      render: (sv) => <span className="badge badge-neutral">{sv.staffId}</span>,
    },
    {
      header: "Departments",
      render: (sv) => (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, maxWidth: 220 }}>
          {sv.departments.map((d) => (
            <span key={d} className="badge badge-neutral">
              {d}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: "Specialization",
      accessor: "specialization",
    },
    {
      header: "Students",
      render: (sv) => (
        <span
          style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13 }}
        >
          <Users size={12} style={{ color: "var(--color-text-muted)" }} />
          {sv.currentStudentCount}
        </span>
      ),
    },
    {
      header: "Actions",
      render: (sv) => (
        <ActionDropdown
          actions={[
            {
              label: "Edit Departments",
              icon: <UserRoundCog size={13} />,
              onClick: () => onEditDepartments(sv),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <GeneralTable<Supervisor>
      columns={columns}
      data={supervisors}
      loading={isLoading}
      meta={meta}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
    />
  );
}
