import { useState } from "react";
import { UserRoundCog } from "lucide-react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import MultiSelectPicker from "../../ui/MultiSelectPicker/MultiSelectPicker";
import Spinner from "../../ui/Spinner/Spinner";
import { useDepartments } from "../../../hooks/useBatches";
import { useUpdateSupervisorDepartments } from "../../../hooks/useSupervisor";
import type { Supervisor } from "../../../api/types/supervisor";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  supervisor: Supervisor;
}

export default function EditSupervisorDepartments({
  isOpen,
  onClose,
  supervisor,
}: Props) {
  const [departments, setDepartments] = useState<string[]>(
    supervisor.departments,
  );

  const { data: departmentsData } = useDepartments();
  const { mutate: update, isPending } = useUpdateSupervisorDepartments();

  const options = (departmentsData?.data ?? []).map((d) => ({
    id: d,
    name: d,
  }));

  const handleClose = () => {
    setDepartments(supervisor.departments);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (departments.length === 0) return;
    update(
      { id: supervisor._id, payload: { departments } },
      { onSuccess: onClose },
    );
  };

  const footer = (
    <>
      <button
        className="modal-cancel"
        onClick={handleClose}
        disabled={isPending}
      >
        Cancel
      </button>
      <button
        className="modal-submit"
        form="edit-supervisor-departments-form"
        type="submit"
        disabled={isPending || departments.length === 0}
      >
        {isPending ? <Spinner size={14} color="#fff" text="" /> : "Save"}
      </button>
    </>
  );

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Departments"
      subtitle={`${supervisor.user.firstName} ${supervisor.user.lastName} — owned departments`}
      icon={<UserRoundCog size={16} />}
      size="medium"
      footer={footer}
    >
      <form
        id="edit-supervisor-departments-form"
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 14 }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 13,
            color: "var(--color-text-secondary)",
            lineHeight: 1.6,
          }}
        >
          Adding a department cascade-assigns its students to this supervisor;
          removing one releases its (non-completed) students. A department
          already owned by another supervisor can't be added here.
        </p>
        <div className="form-group">
          <label className="modal-label">
            Departments <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <MultiSelectPicker
            options={options}
            value={departments}
            onChange={(ids) => setDepartments(ids as string[])}
            placeholder="Search and select departments…"
          />
        </div>
      </form>
    </CustomModal>
  );
}
