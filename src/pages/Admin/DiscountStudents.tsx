import { useState } from "react";
import ResetButton from "../../components/ui/ResetButton/ResetButton";
import SearchInput from "../../components/ui/SearchInput/SearchInput";
import { Users } from "lucide-react";
import AddButton from "../../components/ui/AddButton/AddButton";
import DiscountedStudentsTable from "../../components/admin/tables/DiscountedStudentsTable";
import type { DiscountedStudent } from "../../components/admin/tables/DiscountedStudentsTable";
import DiscountedStudentForm from "../../components/admin/forms/DiscountedStudentForm";
import { useModal } from "../../context/ModalContext";
import { useDiscountedStudents } from "../../hooks/useStudents";
import type { TableMeta } from "../../components/ui/GeneralTable/GeneralTable";

interface FilterStates {
  search: string;
  page: number;
  limit: number;
}

export default function DiscountStudents() {
  const { openModal, closeModal } = useModal();

  // ── Filters State ─────────────────────────────────────────────────────────
  const [filters, setFilters] = useState<FilterStates>({
    search: "",
    page: 1,
    limit: 10,
  });

  const setField = <K extends keyof FilterStates>(
    field: K,
    value: FilterStates[K],
  ) => {
    setFilters((prev) => ({ ...prev, [field]: value, page: 1 }));
  };

  const handleReset = () => {
    setFilters({
      search: "",
      page: 1,
      limit: 10,
    });
  };

  // ── Data Fetching ──────────────────────────────────────────────────────────
  const { data, isLoading } = useDiscountedStudents({
    search: filters.search,
    page: filters.page,
    limit: filters.limit,
  });

  // Extract from the pagination structure robustly
  const raw = data as any;
  const items: DiscountedStudent[] =
    raw?.data?.items ||
    (Array.isArray(raw?.data) ? raw.data : null) ||
    raw?.items ||
    (Array.isArray(raw) ? raw : []) ||
    [];

  const total: number =
    raw?.data?.total ??
    raw?.total ??
    raw?.count ??
    items.length;

  const page: number =
    raw?.data?.page ??
    raw?.page ??
    filters.page;

  const limit: number =
    raw?.data?.limit ??
    raw?.limit ??
    filters.limit;

  const pages: number =
    raw?.data?.pages ??
    raw?.pages ??
    Math.max(1, Math.ceil(total / Math.max(1, limit)));

  const meta: TableMeta | null = data
    ? {
        page,
        pages,
        count: total,
        limit,
        hasPrev: page > 1,
        hasNext: page < pages,
      }
    : null;

  const openUpload = () => {
    openModal(<DiscountedStudentForm isOpen onClose={closeModal} />);
  };

  return (
    <div className="page-container">
      {/* ── Header ── */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon orange">
            <Users size={20} />
          </div>
          <div>
            <h2 className="page-title">Discounted Students</h2>
            <p className="page-sub">
              Manage student certificate discount eligibility
            </p>
          </div>
        </div>
        <div className="page-header-right">
          <AddButton text="Upload Discounted Students" onClick={openUpload} />
        </div>
      </div>

      {/* ── Filters ── */}
      <div
        className="filter-wrapper ua-filter-wrapper"
        // style={{ display: "flex", gap: "10px", alignItems: "center" }}
      >
        <SearchInput
          value={filters.search}
          onChange={(val) => setField("search", val)}
          placeholder="Search by name, reg. number…"
          onClear={handleReset}
        />
        <ResetButton onClick={handleReset} />
      </div>

      {/* ── Table ── */}
      <div className="table-wrapper" style={{ marginTop: "24px" }}>
        <DiscountedStudentsTable
          data={items}
          loading={isLoading}
          meta={meta}
          onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
          onLimitChange={(l) => setField("limit", l)}
        />
      </div>
    </div>
  );
}
