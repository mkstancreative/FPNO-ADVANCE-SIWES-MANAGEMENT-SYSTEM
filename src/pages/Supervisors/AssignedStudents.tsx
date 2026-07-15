import { Layers } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ResetButton from "../../components/ui/ResetButton/ResetButton";
import SearchInput from "../../components/ui/SearchInput/SearchInput";
import { useAssignedStudents } from "../../hooks/useSchoolSupervisor";
import AssignedStudentTable from "../../components/supervisor/tables/AssignedStudentTable";
import type { StudentSummary } from "../../api/types/schoolSupervisor";
import SelectFilter from "../../components/ui/SelectFilter/SelectFilter";
import { useGetMe } from "../../hooks/useAuth";
import type { ITStatus } from "../../api/types/student";

interface FilterState {
  search: string;
  page: number;
  limit: number;
  isCurrent: boolean;
  status: ITStatus | "";
  department: string;
}

export default function AssignedStudents() {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    page: 1,
    limit: 10,
    isCurrent: true,
    status: "",
    department: "",
  });

  const { data, isLoading } = useAssignedStudents(filters);

  const { data: meData } = useGetMe();

  interface ProfileInfo {
    departments?: string[];
    department?: string | { name: string; code?: string };
  }

  const profile = meData?.data?.profile as ProfileInfo | undefined;
  const departments: string[] = Array.isArray(profile?.departments)
    ? profile.departments
    : typeof profile?.department === "string"
      ? [profile.department]
      : profile?.department?.name
        ? [profile.department.name]
        : [];

  const setField = <K extends keyof FilterState>(
    field: K,
    value: FilterState[K],
  ) => {
    setFilters((prev) => ({ ...prev, [field]: value, page: 1 }));
  };

  const navigate = useNavigate();

  const meta = {
    count: data?.total ?? 0,
    page: data?.page ?? 1,
    pages: data?.pages ?? 1,
    limit: filters.limit,
    hasPrev: (data?.page ?? 1) > 1,
    hasNext: (data?.page ?? 1) < (data?.pages ?? 1),
  };

  const handleView = (student: StudentSummary) => {
    const studentName = `${student.user.firstName} ${student.user.lastName}`;
    navigate(
      `/supervisor/students/${student._id}/internships?name=${encodeURIComponent(studentName)}`,
    );
  };

  const handleReset = () => {
    setFilters({
      search: "",
      page: 1,
      limit: 10,
      isCurrent: true,
      status: "",
      department: "",
    });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon orange">
            <Layers size={20} />
          </div>
          <div>
            <h2 className="page-title">Assigned Students</h2>
            <p className="page-sub">Manage assigned students</p>
          </div>
        </div>
      </div>

      <div className="filter-wrapper">
        <SearchInput
          value={filters.search}
          onChange={(val) =>
            setFilters((prev) => ({ ...prev, search: val, page: 1 }))
          }
          placeholder="Search by name, reg number…"
          onClear={handleReset}
        />
      </div>
      <div
        className="filter-selects-block"
        style={{ display: "flex", gap: "12px", marginTop: "12px" }}
      >
        <SelectFilter
          label="Status"
          options={[
            { value: "", label: "All Statuses" },
            { value: "uploaded", label: "Uploaded" },
            { value: "pending_verification", label: "Pending Verification" },
            { value: "seeking_placement", label: "Seeking Placement" },
            { value: "active", label: "Active" },
            { value: "placed", label: "Placed" },
            { value: "completed", label: "Completed" },
          ]}
          value={filters.status}
          onChange={(value) => setField("status", value as ITStatus | "")}
          name="status"
        />
        <SelectFilter
          label="Department"
          options={[
            { value: "", label: "All Departments" },
            ...departments.map((d) => ({ value: d, label: d })),
          ]}
          value={filters.department}
          onChange={(value) => setField("department", value)}
          name="department"
        />
        <ResetButton onClick={handleReset} />
      </div>

      <div className="table-wrapper">
        <AssignedStudentTable
          data={data?.data ?? []}
          isLoading={isLoading}
          meta={meta}
          onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
          onLimitChange={(limit) =>
            setFilters((prev) => ({ ...prev, limit, page: 1 }))
          }
          onView={handleView}
        />
      </div>
    </div>
  );
}
