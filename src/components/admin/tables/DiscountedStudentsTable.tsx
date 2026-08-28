import GeneralTable from "../../ui/GeneralTable/GeneralTable";
import type { Column, TableMeta } from "../../ui/GeneralTable/GeneralTable";

export interface DiscountedStudent {
  _id: string;
  studentName: string;
  registrationNumber: string;
  normalizedReg: string;
  discountAmount: number;
  source: string;
  timesApplied: number;
  createdAt: string;
  updatedAt: string;
}

interface DiscountedStudentsTableProps {
  data: DiscountedStudent[];
  meta: TableMeta | null;
  loading: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export default function DiscountedStudentsTable({
  data,
  meta,
  loading,
  onPageChange,
  onLimitChange,
}: DiscountedStudentsTableProps) {
  const columns: Column<DiscountedStudent>[] = [
    {
      header: "S/N",
      render: (_, index) => {
        const offset = meta ? (meta.page - 1) * meta.limit : 0;
        return <span>{offset + index + 1}</span>;
      },
    },
    {
      header: "Student Name",
      render: (row) => (
        <span style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>
          {row.studentName ? row.studentName.toUpperCase() : "—"}
        </span>
      ),
    },
    {
      header: "Registration Number",
      accessor: "registrationNumber",
    },
    {
      header: "Discount Amount",
      render: (row) => (
        <span style={{ fontWeight: 600, color: "var(--color-accent)" }}>
          ₦{row.discountAmount.toLocaleString()}
        </span>
      ),
    },
    {
      header: "Times Applied",
      accessor: "timesApplied",
    },
    // {
    //   header: "Source",
    //   render: (row) => {
    //     // Strip prefix "upload:" if present for clean look
    //     const file = row.source?.startsWith("upload:")
    //       ? row.source.substring(7)
    //       : row.source;
    //     return (
    //       <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
    //         {file || "—"}
    //       </span>
    //     );
    //   },
    // },
    {
      header: "Date Uploaded",
      render: (row) => (
        <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <GeneralTable<DiscountedStudent>
      columns={columns}
      data={data}
      loading={loading}
      meta={meta}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
    />
  );
}
