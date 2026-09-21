import { useState } from "react";
import ResetButton from "../../components/ui/ResetButton/ResetButton";
import SearchInput from "../../components/ui/SearchInput/SearchInput";
import { Users } from "lucide-react";
import AddButton from "../../components/ui/AddButton/AddButton";
import DiscountedStudentsTable from "../../components/admin/tables/DiscountedStudentsTable";
import type { DiscountedStudent } from "../../components/admin/tables/DiscountedStudentsTable";
import DiscountedStudentForm from "../../components/admin/forms/DiscountedStudentForm";
import AddDiscountedStudent from "../../components/admin/forms/AddDiscountedStudent";
import ConfirmModal from "../../components/ui/ConfirmModal/ConfirmModal";
import CustomModal from "../../components/ui/CustomModal/CustomModal";
import RepriceReportSummary from "../../components/admin/certificates/RepriceReportSummary";
import { useModal } from "../../context/ModalContext";
import { useDiscountedStudents } from "../../hooks/useStudents";
import { useRemoveCertificateDiscount } from "../../hooks/useCertificate";
import { naira } from "../../helpers/utilities";
import type { RepriceReport } from "../../api/types/certificate";
import type { TableMeta } from "../../components/ui/GeneralTable/GeneralTable";
import { usePermissions } from "../../hooks/usePermissions";
import { ReadOnlyNotice } from "../../components/ui/Permission/Permission";

interface FilterStates {
  search: string;
  page: number;
  limit: number;
}

export default function DiscountStudents() {
  const { openModal, closeModal } = useModal();
  const { canEdit } = usePermissions();

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

  /**
   * The discount list has been seen wrapped more than one way, so read it
   * defensively rather than pinning a single shape.
   */
  interface LoosePage {
    items?: DiscountedStudent[];
    data?: DiscountedStudent[] | LoosePage;
    total?: number;
    count?: number;
    page?: number;
    pages?: number;
    limit?: number;
  }

  const raw: LoosePage = Array.isArray(data)
    ? { items: data as DiscountedStudent[] }
    : ((data ?? {}) as LoosePage);
  const inner: LoosePage = Array.isArray(raw.data)
    ? { items: raw.data }
    : ((raw.data ?? {}) as LoosePage);

  const items: DiscountedStudent[] = inner.items ?? raw.items ?? [];
  const total: number = inner.total ?? raw.total ?? raw.count ?? items.length;
  const page: number = inner.page ?? raw.page ?? filters.page;
  const limit: number = inner.limit ?? raw.limit ?? filters.limit;
  const pages: number =
    inner.pages ??
    raw.pages ??
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

  const openAdd = () => {
    openModal(<AddDiscountedStudent isOpen onClose={closeModal} />);
  };

  // ── Removal ───────────────────────────────────────────────────────────────
  // Removing a discount is not a bookkeeping change: it re-prices the
  // student's outstanding invoice **upward** to the full fee and replaces a
  // reference they may already be holding. Always confirm, then show what the
  // backend actually did.
  const [pendingRemoval, setPendingRemoval] =
    useState<DiscountedStudent | null>(null);
  const [removalReport, setRemovalReport] = useState<RepriceReport | null>(
    null,
  );
  const { mutate: removeDiscount, isPending: removing } =
    useRemoveCertificateDiscount();

  const confirmRemoval = () => {
    if (!pendingRemoval) return;
    removeDiscount(pendingRemoval.registrationNumber, {
      onSuccess: (res) => {
        setRemovalReport(res.data);
        setPendingRemoval(null);
      },
    });
  };

  return (
    <div className="page-container">
      <ReadOnlyNotice>
        You can review who is on a discount and why. Adding, removing or
        re-pricing a discount is limited to administrators.
      </ReadOnlyNotice>
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
          {canEdit && (
            <>
              <AddButton text="Add Student" onClick={openAdd} />
              <AddButton
                text="Upload Discounted Students"
                onClick={openUpload}
              />
            </>
          )}
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
          onRemove={canEdit ? setPendingRemoval : undefined}
        />
      </div>

      {/* ── Removal confirmation ── */}
      <ConfirmModal
        isOpen={pendingRemoval !== null}
        variant="danger"
        title="Remove this discount?"
        message={
          pendingRemoval
            ? `${pendingRemoval.studentName || pendingRemoval.registrationNumber} loses their ${naira(pendingRemoval.discountAmount)} certificate discount. ` +
              "If they have an unpaid invoice it is re-priced UPWARD to the full fee and issued a new payment reference — the one they are holding stops matching what they owe, though it stays payable at the bank."
            : undefined
        }
        confirmText={removing ? "Removing…" : "Remove discount"}
        onConfirm={confirmRemoval}
        onCancel={() => setPendingRemoval(null)}
        isPending={removing}
      />

      {/* ── What the removal actually did ── */}
      <CustomModal
        isOpen={removalReport !== null}
        onClose={() => setRemovalReport(null)}
        title="Discount Removed"
        subtitle="Outstanding invoices were re-priced to the full fee"
        icon={<Users size={16} />}
        size="medium"
        footer={
          <button
            className="modal-submit"
            type="button"
            onClick={() => setRemovalReport(null)}
          >
            Done
          </button>
        }
      >
        <RepriceReportSummary report={removalReport} />
      </CustomModal>
    </div>
  );
}
