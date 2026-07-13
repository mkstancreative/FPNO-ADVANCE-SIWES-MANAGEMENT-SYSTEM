import { useState, type FormEvent } from "react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import Spinner from "../../ui/Spinner/Spinner";
import { useCreateBatch, useUpdateBatch } from "../../../hooks/useBatches";
import type {
  Batch,
  BatchPayload,
  Level,
  Program,
} from "../../../api/types/batch";
import { Layers } from "lucide-react";
import "./BatchForm.css";

interface BatchFormProps {
  isOpen: boolean;
  onClose: () => void;
  editing?: Batch | null;
}

const PROGRAMS: Program[] = ["ND", "HND"];
const PROGRAM_LEVELS: Record<Program, Level[]> = {
  ND: ["ND1", "ND2"],
  HND: ["HND1", "HND2"],
};

function toDateInput(iso?: string) {
  if (!iso) return "";
  return iso.slice(0, 10);
}

function buildInitial(editing?: Batch | null): BatchPayload {
  if (editing) {
    return {
      name: editing.name,
      session: editing.session,
      program: editing.program,
      level: editing.level,
      itPeriod: {
        name: editing.itPeriod.name,
        startDate: toDateInput(editing.itPeriod.startDate),
        endDate: toDateInput(editing.itPeriod.endDate),
      },
    };
  }
  return {
    name: "",
    session: "",
    program: "ND",
    level: "ND1",
    itPeriod: { name: "", startDate: "", endDate: "" },
  };
}

export default function BatchForm({
  isOpen,
  onClose,
  editing,
}: BatchFormProps) {
  const [form, setForm] = useState<BatchPayload>(() => buildInitial(editing));
  const { mutate: create, isPending: creating } = useCreateBatch();
  const { mutate: update, isPending: updating } = useUpdateBatch();
  const isPending = creating || updating;

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleProgramChange = (p: Program) => {
    setForm((prev) => ({
      ...prev,
      program: p,
      level: PROGRAM_LEVELS[p][0],
    }));
  };

  const setItPeriod = (field: string, value: string) =>
    setForm((prev) => ({
      ...prev,
      itPeriod: { ...prev.itPeriod, [field]: value },
    }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (editing) {
      update({ id: editing._id, data: form }, { onSuccess: onClose });
    } else {
      create(form, { onSuccess: onClose });
    }
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title={editing ? "Edit Batch" : "Add New Batch"}
      subtitle={
        editing
          ? "Update batch details below"
          : "Fill in the details to create a new batch"
      }
      icon={<Layers size={16} />}
      size="medium"
      footer={
        <>
          <button
            type="button"
            className="modal-cancel"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="batch-form"
            className="modal-submit"
            disabled={isPending}
          >
            {isPending ? (
              <Spinner size={14} color="#fff" />
            ) : editing ? (
              "Save Changes"
            ) : (
              "Create Batch"
            )}
          </button>
        </>
      }
    >
      <form id="batch-form" onSubmit={handleSubmit} className="form-grid">
        {/* ── Batch Name ── */}
        <div className="form-group col-2">
          <label className="modal-label">
            Batch Name <span>*</span>
          </label>
          <input
            className="modal-input"
            placeholder="e.g. ND2 IT Batch A"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
          />
        </div>

        {/* ── Session ── */}
        <div className="form-group col-2">
          <label className="modal-label">
            Session <span>*</span>
          </label>
          <input
            className="modal-input"
            placeholder="e.g. 2023/2024"
            value={form.session}
            onChange={(e) => set("session", e.target.value)}
            required
          />
        </div>

        {/* ── Program + Level ── */}
        <div className="form-group col-2">
          <label className="modal-label">
            Program <span>*</span>
          </label>
          <select
            className="modal-input"
            value={form.program}
            onChange={(e) => handleProgramChange(e.target.value as Program)}
            required
          >
            {PROGRAMS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group col-2">
          <label className="modal-label">
            Level <span>*</span>
          </label>
          <select
            className="modal-input"
            value={form.level}
            onChange={(e) => set("level", e.target.value as Level)}
            required
          >
            {PROGRAM_LEVELS[form.program].map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

        {/* ── IT Period ── */}
        <div className="section-title-divider">NMCN/NBTE Period</div>

        <div className="form-group col-2">
          <label className="modal-label">
            Start Date <span>*</span>
          </label>
          <input
            type="date"
            className="modal-input"
            value={form.itPeriod.startDate}
            onChange={(e) => setItPeriod("startDate", e.target.value)}
            required
          />
        </div>
        <div className="form-group col-2">
          <label className="modal-label">
            End Date <span>*</span>
          </label>
          <input
            type="date"
            className="modal-input"
            value={form.itPeriod.endDate}
            onChange={(e) => setItPeriod("endDate", e.target.value)}
            required
          />
        </div>
      </form>
    </CustomModal>
  );
}
