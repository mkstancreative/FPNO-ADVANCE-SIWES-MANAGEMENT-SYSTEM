import { useState } from "react";
import { GraduationCap, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AddButton from "../../components/ui/AddButton/AddButton";
import SearchInput from "../../components/ui/SearchInput/SearchInput";
import ResetButton from "../../components/ui/ResetButton/ResetButton";
import SelectFilter from "../../components/ui/SelectFilter/SelectFilter";
import InternshipsTable from "../../components/admin/tables/InternshipsTable";
import BulkEnrollStudents from "../../components/admin/forms/BulkEnrollStudents";
import { useModal } from "../../context/ModalContext";
import { useBatches } from "../../hooks/useBatches";
import type { Internship } from "../../api/types/internship";
import type { ITStatus } from "../../api/types/student";

interface FilterState {
  batchId: string;
  itStatus: ITStatus | "";
  search: string;
  page: number;
  limit: number;
}

const STATUS_OPTIONS: { value: ITStatus | ""; label: string }[] = [
  { value: "", label: "All Status" },
  { value: "uploaded", label: "Uploaded" },
  { value: "pending_verification", label: "Pending Verification" },
  { value: "seeking_placement", label: "Seeking Placement" },
  { value: "placed", label: "Placed" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
];

export default function Internships() {
  const { openModal, closeModal } = useModal();
  const navigate = useNavigate();
  const { data: batches } = useBatches({ limit: 1000 });

  const [filter, setFilter] = useState<FilterState>({
    batchId: "",
    itStatus: "",
    search: "",
    page: 1,
    limit: 20,
  });

  const setField = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K],
  ) => setFilter((prev) => ({ ...prev, [key]: value, page: 1 }));

  const handleReset = () => {
    setFilter({ batchId: "", itStatus: "", search: "", page: 1, limit: 20 });
  };

  const openBulkEnroll = () =>
    openModal(<BulkEnrollStudents isOpen onClose={closeModal} />);

  const handleView = (internship: Internship) =>
    navigate(`/admin/internships/${internship._id}`);

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon purple">
            <GraduationCap size={20} />
          </div>
          <div>
            <h2 className="page-title">Internships</h2>
            <p className="page-sub">
              Every internship record across all students and batches
            </p>
          </div>
        </div>
        <div className="page-header-right">
          <AddButton
            text="Bulk Enroll"
            icon={<UserPlus size={14} />}
            onClick={openBulkEnroll}
          />
        </div>
      </div>

      <div className="filter-wrapper">
        <SearchInput
          value={filter.search}
          onChange={(val) => setField("search", val)}
          placeholder="Search by name, reg number…"
          onClear={handleReset}
        />
      </div>

      <div className="filter-selects-block">
        <SelectFilter
          label="Batch"
          options={[
            { value: "", label: "All Batches" },
            ...(batches?.data.map((b) => ({ value: b._id, label: b.name })) ??
              []),
          ]}
          value={filter.batchId}
          onChange={(value) => setField("batchId", value)}
          name="batchId"
        />
        <SelectFilter
          label="Status"
          options={STATUS_OPTIONS}
          value={filter.itStatus}
          onChange={(value) => setField("itStatus", value as ITStatus | "")}
          name="itStatus"
        />
        <ResetButton onClick={handleReset} />
      </div>

      <div className="table-wrapper">
        <InternshipsTable
          params={{
            batchId: filter.batchId || undefined,
            itStatus: filter.itStatus || undefined,
            search: filter.search || undefined,
          }}
          page={filter.page}
          limit={filter.limit}
          onPageChange={(p) => setFilter((prev) => ({ ...prev, page: p }))}
          onLimitChange={(l) => setField("limit", l)}
          onView={handleView}
        />
      </div>
    </div>
  );
}
