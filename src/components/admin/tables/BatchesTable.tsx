import { Edit2, Zap, Archive, Trash2, UserPlus } from "lucide-react";
import GeneralTable from "../../ui/GeneralTable/GeneralTable";
import "../forms/BatchForm.css";
import type { Batch, BatchStatus, Level, Program } from "../../../api/types/batch";
import type { Column, TableMeta } from "../../ui/GeneralTable/GeneralTable";
import ActionDropdown from "../../ui/ActionDropdown/ActionDropDown";
import { formatDate } from "../../../helpers/utilities";
import {
  useBatches,
  useActivateBatch,
  useArchieveBatch,
} from "../../../hooks/useBatches";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";

interface BatchesTableProps {
  search?: string;
  status?: BatchStatus | "";
  department?: string;
  level?: Level | "";
  program?: Program | "";
  onEdit: (batch: Batch) => void;
  page: number;
  limit: number;
  onPageChange: (p: number) => void;
  onLimitChange: (l: number) => void;
  onAutoAssignSupervisors: (batch: Batch) => void;
  onBulkEnroll: (batch: Batch) => void;
  onDeleteRequest: (batch: Batch) => void;
}

export default function BatchesTable({
  search,
  status,
  department,
  level,
  program,
  onEdit,
  page,
  limit,
  onPageChange,
  onLimitChange,
  onAutoAssignSupervisors,
  onBulkEnroll,
  onDeleteRequest,
}: BatchesTableProps) {
  // ── Data ──────────────────────────────────────────────────────────────────
  const { data, isLoading } = useBatches({
    page,
    limit,
    search,
    status,
    department,
    level,
    program,
  });

  const { mutate: activate } = useActivateBatch();
  const { mutate: archive } = useArchieveBatch();

  const batches: Batch[] = data?.data ?? [];

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

  // ── Columns ───────────────────────────────────────────────────────────────
  const columns: Column<Batch>[] = [
    {
      header: "Batch Name",
      accessor: "name",
    },
    {
      header: "Session",
      accessor: "session",
    },
    {
      header: "Program",
      accessor: "program",
    },
    {
      header: "Level",
      accessor: "level",
    },
    {
      header: "Start Date",
      render: (row) =>
        row.itPeriod?.startDate ? formatDate(row.itPeriod.startDate) : "—",
    },
    {
      header: "End Date",
      render: (row) =>
        row.itPeriod?.endDate ? formatDate(row.itPeriod.endDate) : "—",
    },
    {
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Actions",
      render: (row) => (
        <ActionDropdown
          actions={[
            {
              label: "Edit",
              icon: <Edit2 size={13} />,
              onClick: () => onEdit(row),
              disabled: row.status === "archived",
            },
            {
              label: "Auto Assign Supervisors",
              icon: <Zap size={13} />,
              onClick: () => onAutoAssignSupervisors(row),
              disabled: row.status === "archived",
            },
            {
              label: "Bulk Enroll Students",
              icon: <UserPlus size={13} />,
              onClick: () => onBulkEnroll(row),
              disabled: row.status === "archived",
            },
            {
              label: "Activate",
              icon: <Zap size={13} />,
              onClick: () => activate({ id: row._id, activateStudents: true }),
              disabled:
                row.status !== "created" && row.status !== "students_uploaded",
            },
            {
              label: row.status === "archived" ? "Unarchive" : "Archive",
              icon: <Archive size={13} />,
              onClick: () => archive(row._id),
              disabled: row.status === "created",
            },
            {
              label: "Delete",
              icon: <Trash2 size={13} />,
              onClick: () => onDeleteRequest(row),
              danger: true,
            },
          ]}
        />
      ),
    },
  ];

  return (
    <GeneralTable<Batch>
      columns={columns}
      data={batches}
      loading={isLoading}
      meta={meta}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
    />
  );
}
