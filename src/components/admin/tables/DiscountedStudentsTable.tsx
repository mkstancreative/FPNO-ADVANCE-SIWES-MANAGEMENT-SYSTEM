import { Trash2 } from "lucide-react";
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
  /**
   * Removing a discount re-prices the student's outstanding invoice **upward**
   * to the full fee, so the page that passes this must confirm first.
   */
  onRemove?: (student: DiscountedStudent) => void;
}

export default function DiscountedStudentsTable({
  data,
  meta,
  loading,
  onPageChange,
  onLimitChange,
  onRemove,
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
    ...(onRemove
      ? [
          {
            header: "",
            render: (row: DiscountedStudent) => (
              <button
                type="button"
                className="ds-remove"
                onClick={() => onRemove(row)}
                title="Remove this discount — re-prices their invoice upward"
              >
                <Trash2 size={12} /> Remove
              </button>
            ),
          },
        ]
      : []),
  ];

  return (
    <>
      <GeneralTable<DiscountedStudent>
        columns={columns}
        data={data}
        loading={loading}
        meta={meta}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
      />
      <style>{`
        .ds-remove {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 10px;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
          border-radius: 6px;
          cursor: pointer;
          color: #dc2626;
          background: transparent;
          border: 1px solid rgba(220, 38, 38, 0.4);
        }
        .ds-remove:hover {
          background: #dc2626;
          color: #fff;
          border-color: #dc2626;
        }
      `}</style>
    </>
  );
}
