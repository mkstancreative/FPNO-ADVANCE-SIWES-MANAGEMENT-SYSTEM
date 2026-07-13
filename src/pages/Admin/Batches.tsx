import { useState } from "react"; // already there
import { useModal } from "../../context/ModalContext";
import { useDeleteBatch, useDepartments } from "../../hooks/useBatches";
import type { Batch, BatchStatus, Level, Program } from "../../api/types/batch";
import BatchForm from "../../components/admin/forms/BatchForm";
import AutoAssignSupervisors from "../../components/admin/forms/AutoAssignSuperviors";
import BulkEnrollStudents from "../../components/admin/forms/BulkEnrollStudents";
import { Layers } from "lucide-react";
import AddButton from "../../components/ui/AddButton/AddButton";
import SearchInput from "../../components/ui/SearchInput/SearchInput";
import ResetButton from "../../components/ui/ResetButton/ResetButton";
import BatchesTable from "../../components/admin/tables/BatchesTable";
import ConfirmModal from "../../components/ui/ConfirmModal/ConfirmModal";
import SelectFilter from "../../components/ui/SelectFilter/SelectFilter";

interface FilterState {
  search: string;
  page: number;
  limit: number;
  status: BatchStatus | "";
  department: string;
  level: Level | "";
  program: Program | "";
}

const PROGRAMS: Program[] = ["ND", "HND"];
const LEVELS: Level[] = ["ND1", "ND2", "HND1", "HND2"];

export default function Batches() {
  const { openModal, closeModal } = useModal();

  const [filter, setFilter] = useState<FilterState>({
    search: "",
    page: 1,
    limit: 10,
    status: "",
    level: "",
    program: "",
    department: "",
  });

  const setField = <K extends keyof FilterState>(
    field: K,
    value: FilterState[K],
  ) => {
    setFilter((prev) => ({ ...prev, [field]: value, page: 1 }));
  };

  const { data: departmentsResponse } = useDepartments();
  const departments = departmentsResponse?.data;

  const { mutate: remove, isPending: deleting } = useDeleteBatch();

  const [deleteTarget, setDeleteTarget] = useState<Batch | null>(null);

  const confirmDelete = () => {
    if (deleteTarget) {
      remove(deleteTarget._id, { onSuccess: () => setDeleteTarget(null) });
    }
  };

  const openCreate = () =>
    openModal(<BatchForm key="new" isOpen onClose={closeModal} />);

  const openEdit = (batch: Batch) =>
    openModal(
      <BatchForm key={batch._id} isOpen onClose={closeModal} editing={batch} />,
    );

  const openAutoAssignSupervisors = (batch: Batch) =>
    openModal(
      <AutoAssignSupervisors
        isOpen
        onClose={closeModal}
        batch={batch}
        departments={departments}
      />,
    );

  const openBulkEnroll = (batch: Batch) =>
    openModal(
      <BulkEnrollStudents isOpen onClose={closeModal} targetBatch={batch} />,
    );

  const handleReset = () => {
    setFilter({
      search: "",
      page: 1,
      limit: 10,
      status: "",
      department: "",
      level: "",
      program: "",
    });
  };

  return (
    <>
      <div className="page-container">
        <div className="page-header">
          <div className="page-header-left">
            <div className="page-icon orange">
              <Layers size={20} />
            </div>
            <div>
              <h2 className="page-title">Batches</h2>
              <p className="page-sub">
                Manage student batches in the institution
              </p>
            </div>
          </div>
          <div className="page-header-right">
            <AddButton text="Add Batch" onClick={openCreate} />
          </div>
        </div>

        <div className="filter-wrapper">
          <SearchInput
            value={filter.search}
            onChange={(val) => setField("search", val)}
            placeholder="Search by name, session…"
            onClear={handleReset}
          />
        </div>

        <div className="filter-selects-block">
          <SelectFilter
            label="Status"
            options={[
              { value: "", label: "All Status" },
              { value: "created", label: "Created" },
              { value: "students_uploaded", label: "Students Uploaded" },
              { value: "in_progress", label: "In Progress" },
              { value: "completed", label: "Completed" },
              { value: "archived", label: "Archived" },
            ]}
            value={filter.status}
            onChange={(value) => setField("status", value as BatchStatus | "")}
            name="status"
          />
          <SelectFilter
            label="Department"
            options={[
              { value: "", label: "All Departments" },
              ...(departments?.map((d) => ({ value: d, label: d })) || []),
            ]}
            value={filter.department}
            onChange={(value) => setField("department", value)}
            name="department"
          />
          <SelectFilter
            label="Level"
            options={[
              { value: "", label: "All Levels" },
              ...LEVELS.map((l) => ({ value: l, label: l })),
            ]}
            value={filter.level}
            onChange={(value) => setField("level", value as Level | "")}
            name="level"
          />
          <SelectFilter
            label="Program"
            options={[
              { value: "", label: "All Programs" },
              ...PROGRAMS.map((p) => ({ value: p, label: p })),
            ]}
            value={filter.program}
            onChange={(value) => setField("program", value as Program | "")}
            name="program"
          />
          <ResetButton onClick={handleReset} />
        </div>

        <div className="table-wrapper">
          <BatchesTable
            search={filter.search}
            status={filter.status}
            department={filter.department}
            level={filter.level}
            program={filter.program}
            onEdit={openEdit}
            page={filter.page}
            limit={filter.limit}
            onPageChange={(p) => setFilter((prev) => ({ ...prev, page: p }))}
            onLimitChange={(l) => setField("limit", l)}
            onAutoAssignSupervisors={openAutoAssignSupervisors}
            onBulkEnroll={openBulkEnroll}
            onDeleteRequest={setDeleteTarget}
          />
        </div>
      </div>

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        variant="danger"
        title="Delete Batch"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name}"?`
            : ""
        }
        confirmText="Yes, Delete"
        cancelText="Cancel"
        isPending={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
