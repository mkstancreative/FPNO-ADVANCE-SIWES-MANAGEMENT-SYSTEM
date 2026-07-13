import { UserRound } from "lucide-react";
import AddButton from "../../components/ui/AddButton/AddButton";
import SearchInput from "../../components/ui/SearchInput/SearchInput";
import ResetButton from "../../components/ui/ResetButton/ResetButton";
import SupervisorsTable from "../../components/admin/tables/SupervisorsTable";
import SelectFilter from "../../components/ui/SelectFilter/SelectFilter";
import { useState } from "react";
import { useModal } from "../../context/ModalContext";
import { useDepartments } from "../../hooks/useBatches";
import UploadSupervisors from "../../components/admin/forms/UploadSupervisors";
import EditSupervisorDepartments from "../../components/admin/forms/EditSupervisorDepartments";
import type { Supervisor } from "../../api/types/supervisor";

interface FilterState {
  search: string;
  page: number;
  limit: number;
  department: string;
}

export default function SupervisorPage() {
  const { openModal, closeModal } = useModal();
  const { data: departmentsData } = useDepartments();

  const [filter, setFilter] = useState<FilterState>({
    search: "",
    page: 1,
    limit: 10,
    department: "",
  });

  const setField = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K],
  ) =>
    setFilter((prev) => ({
      ...prev,
      [key]: value,
      page: key !== "page" ? 1 : (value as number),
    }));

  const handleReset = () =>
    setFilter({ search: "", page: 1, limit: 10, department: "" });

  // ── Modal openers ──────────────────────────────────────────────────────────
  const openCreate = () =>
    openModal(<UploadSupervisors isOpen onClose={closeModal} />);


  const openEditDepartments = (supervisor: Supervisor) =>
    openModal(
      <EditSupervisorDepartments
        isOpen
        onClose={closeModal}
        supervisor={supervisor}
      />,
    );

  // Department options from API
  const departmentOptions = [
    { value: "", label: "All Departments" },
    ...(departmentsData?.data?.map((name: string) => ({
      value: name,
      label: name,
    })) ?? []),
  ];

  return (
    <div className="page-container">
      {/* ── Header ── */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon orange">
            <UserRound size={20} />
          </div>
          <div>
            <h2 className="page-title">Supervisors</h2>
            <p className="page-sub">
              Manage school supervisors in the institution
            </p>
          </div>
        </div>
        <div className="page-header-right">
          <AddButton text="Add Supervisor" onClick={openCreate} />
        </div>
      </div>

      {/* ── Search + Reset ── */}
      <div className="filter-wrapper">
        <SearchInput
          value={filter.search}
          onChange={(val) => setField("search", val)}
          placeholder="Search by name, staff ID…"
          onClear={handleReset}
        />
      </div>

      {/* ── Select Filters ── */}
      <div className="filter-selects-block">
        <SelectFilter
          label="Department"
          options={departmentOptions}
          value={filter.department}
          onChange={(value) => setField("department", value)}
          name="department"
        />
        <ResetButton onClick={handleReset} />
      </div>

      {/* ── Table ── */}
      <div className="table-wrapper">
        <SupervisorsTable
          search={filter.search}
          department={filter.department}
          page={filter.page}
          limit={filter.limit}
          onPageChange={(p) => setField("page", p)}
          onLimitChange={(l) =>
            setFilter((prev) => ({ ...prev, limit: l, page: 1 }))
          }
          onEditDepartments={openEditDepartments}
        />
      </div>
    </div>
  );
}
