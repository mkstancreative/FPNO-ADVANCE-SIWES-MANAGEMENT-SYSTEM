import { useState } from "react";
import { UserRoundCog } from "lucide-react";
import AddButton from "../../components/ui/AddButton/AddButton";
import SearchInput from "../../components/ui/SearchInput/SearchInput";
import ResetButton from "../../components/ui/ResetButton/ResetButton";
import SelectFilter from "../../components/ui/SelectFilter/SelectFilter";
import StaffTable from "../../components/admin/tables/StaffTable";
import AddStaff from "../../components/admin/forms/AddStaff";
import EditStaff from "../../components/admin/forms/EditStaff";
import StaffDetail from "../../components/admin/view/StaffDetail";
import AdminResetUserPassword from "../../components/admin/forms/AdminResetUserPassword";
import { useModal } from "../../context/ModalContext";
import type { StaffUser } from "../../api/types/staff";
import type { AdminUserLookupItem } from "../../api/types/adminUser";

/**
 * The two boolean filters are tri-state on screen: "" is "any" and only the
 * explicit yes/no values become query params, because `isActive=false` asks a
 * different question from leaving the filter off entirely.
 */
type TriState = "" | "true" | "false";

interface FilterState {
  search: string;
  isActive: TriState;
  mustChangePassword: TriState;
  page: number;
  limit: number;
}

const INITIAL_FILTER: FilterState = {
  search: "",
  isActive: "",
  mustChangePassword: "",
  page: 1,
  limit: 10,
};

const toBool = (value: TriState): boolean | undefined =>
  value === "" ? undefined : value === "true";

/** The reset-password modal is shared with User Accounts and speaks its shape. */
const toLookupItem = (staff: StaffUser): AdminUserLookupItem => ({
  _id: staff._id,
  userId: staff._id,
  firstName: staff.firstName,
  lastName: staff.lastName,
  email: staff.email,
  phone: staff.phone,
  role: staff.role ?? "coordinator",
  isActive: staff.isActive,
  mustChangePassword: staff.mustChangePassword,
});

export default function Staff() {
  const { openModal, closeModal } = useModal();

  const [filter, setFilter] = useState<FilterState>(INITIAL_FILTER);

  const setField = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K],
  ) =>
    setFilter((prev) => ({
      ...prev,
      [key]: value,
      // Any filter change resets to page 1 — page 4 of the old result set is
      // meaningless against the new one.
      page: key !== "page" ? 1 : (value as number),
    }));

  const handleReset = () => setFilter(INITIAL_FILTER);

  const openCreate = () => openModal(<AddStaff isOpen onClose={closeModal} />);

  const openReset = (staff: StaffUser) =>
    openModal(
      <AdminResetUserPassword
        isOpen
        onClose={closeModal}
        user={toLookupItem(staff)}
      />,
    );

  const openEdit = (staff: StaffUser) =>
    openModal(<EditStaff isOpen onClose={closeModal} staff={staff} />);

  const openDetail = (staff: StaffUser) =>
    openModal(
      <StaffDetail
        isOpen
        onClose={closeModal}
        staff={staff}
        onEdit={openEdit}
        onResetPassword={openReset}
      />,
    );

  return (
    <div className="page-container">
      {/* ── Header ── */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon teal">
            <UserRoundCog size={20} />
          </div>
          <div>
            <h2 className="page-title">Staff</h2>
            <p className="page-sub">
              Create and manage SIWES coordinator accounts
            </p>
          </div>
        </div>
        <div className="page-header-right">
          <AddButton text="Add Coordinator" onClick={openCreate} />
        </div>
      </div>

      {/* ── Search ── */}
      <div className="filter-wrapper">
        <SearchInput
          value={filter.search}
          onChange={(val) => setField("search", val)}
          placeholder="Search by name or email…"
          onClear={() => setField("search", "")}
        />
      </div>

      {/* ── Select Filters ── */}
      <div className="filter-selects-block">
        <SelectFilter
          label="Status"
          name="isActive"
          value={filter.isActive}
          onChange={(value) => setField("isActive", value as TriState)}
          options={[
            { value: "", label: "Any Status" },
            { value: "true", label: "Active" },
            { value: "false", label: "Inactive" },
          ]}
        />
        <SelectFilter
          label="Password"
          name="mustChangePassword"
          value={filter.mustChangePassword}
          onChange={(value) =>
            setField("mustChangePassword", value as TriState)
          }
          options={[
            { value: "", label: "Any Password State" },
            { value: "true", label: "Change pending" },
            { value: "false", label: "Set by holder" },
          ]}
        />
        <ResetButton onClick={handleReset} />
      </div>

      {/* ── Table ── */}
      <div className="table-wrapper">
        <StaffTable
          search={filter.search}
          isActive={toBool(filter.isActive)}
          mustChangePassword={toBool(filter.mustChangePassword)}
          page={filter.page}
          limit={filter.limit}
          onPageChange={(p) => setField("page", p)}
          onLimitChange={(l) =>
            setFilter((prev) => ({ ...prev, limit: l, page: 1 }))
          }
          onView={openDetail}
          onEdit={openEdit}
          onResetPassword={openReset}
        />
      </div>
    </div>
  );
}
