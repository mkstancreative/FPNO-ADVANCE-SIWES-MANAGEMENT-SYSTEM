import { Building2, MapPin, Phone, Users } from "lucide-react";
import { useVerifiedCompanies } from "../../../hooks/useCompany";
import { useStudentCompanies } from "../../../hooks/useITStudents";
import type { Company, CompanyParams } from "../../../api/types/company";
import type { Column, TableMeta } from "../../ui/GeneralTable/GeneralTable";
import GeneralTable from "../../ui/GeneralTable/GeneralTable";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";

interface Props {
  search?: string;
  state?: string;
  city?: string;
  page: number;
  limit: number;
  onPageChange: (p: number) => void;
  onLimitChange: (l: number) => void;
  /** Optional: call-to-action per row (e.g. "View Details") */
  onView?: (company: Company) => void;
  /** "public" (default) hits GET /general/companies; "student" hits the
   * authenticated, student-scoped GET /students/companies. */
  source?: "public" | "student";
}

export default function VerifiedCompaniesTable({
  search,
  state,
  city,
  page,
  limit,
  onPageChange,
  onLimitChange,
  onView,
  source = "public",
}: Props) {
  const params: CompanyParams = {
    page,
    limit,
    ...(search ? { search } : {}),
    ...(state ? { state } : {}),
    ...(city ? { city } : {}),
  };

  const publicQuery = useVerifiedCompanies(params, {
    enabled: source === "public",
  });
  const studentQuery = useStudentCompanies(params, {
    enabled: source === "student",
  });
  const { data, isLoading } = source === "student" ? studentQuery : publicQuery;

  const companies: Company[] = data?.data ?? [];

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

  const columns: Column<Company>[] = [
    {
      header: "Company",
      render: (c) => (
        <div className="cell-stack">
          <span
            className="cell-primary"
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <Building2
              size={13}
              style={{ color: "var(--color-accent)", flexShrink: 0 }}
            />
            {c.companyName}
          </span>
          <span className="cell-sub">{c.email}</span>
        </div>
      ),
    },
    {
      header: "Industry",
      render: (c) => (
        <span
          className="badge badge-neutral"
          style={{ textTransform: "capitalize" }}
        >
          {c.industry}
        </span>
      ),
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
      render: (c) => (
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: 13,
          }}
        >
          <MapPin size={12} style={{ color: "var(--color-text-muted)" }} />
          {c.address.city}, {c.address.state}
        </span>
      ),
    },
    {
      header: "Phone",
      render: (c) => (
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: 13,
          }}
        >
          <Phone size={12} style={{ color: "var(--color-text-muted)" }} />
          {c.phone}
        </span>
      ),
    },
    {
      header: "Students Hosted",
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
      render: () => <StatusBadge status="verified" />,
    },
    ...(onView
      ? ([
          {
            header: "Actions",
            render: (c: Company) => (
              <button className="vc-view-btn" onClick={() => onView(c)}>
                View Details
              </button>
            ),
          },
        ] as Column<Company>[])
      : []),
  ];

  return (
    <GeneralTable<Company>
      columns={columns}
      data={companies}
      loading={isLoading}
      meta={meta}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
    />
  );
}
