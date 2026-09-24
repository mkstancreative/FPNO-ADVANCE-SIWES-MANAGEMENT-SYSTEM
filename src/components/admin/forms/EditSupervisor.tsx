import { useMemo, useState, type FormEvent } from "react";
import { UserRoundPen } from "lucide-react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import Spinner from "../../ui/Spinner/Spinner";
import { useUpdateSupervisor } from "../../../hooks/useSupervisor";
import {
  getApiErrorMessage,
  getApiErrorStatus,
} from "../../../api/services/api";
import {
  displayName,
  middleNameError,
  MIDDLE_NAME_MAX_LENGTH,
} from "../../../helpers/names";
import type {
  Supervisor,
  UpdateSupervisorPayload,
  UpdateSupervisorResponse,
} from "../../../api/types/supervisor";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  supervisor: Supervisor;
}

/**
 * The PUT payload is partial, but the form needs a value for every control.
 * Departments are deliberately absent — they decide which students this
 * supervisor owns, so they keep their own screen.
 */
interface SupervisorRecordForm {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  phone: string;
  staffId: string;
  specialization: string;
}

function toForm(sv: Supervisor): SupervisorRecordForm {
  return {
    firstName: sv.user?.firstName ?? "",
    // Absent, null and "" are the same thing — no middle name.
    middleName: sv.user?.middleName ?? "",
    lastName: sv.user?.lastName ?? "",
    email: sv.user?.email ?? "",
    phone: sv.user?.phone ?? "",
    staffId: sv.staffId ?? "",
    specialization: sv.specialization ?? "",
  };
}

export default function EditSupervisor({ isOpen, onClose, supervisor }: Props) {
  const { mutate: updateSupervisor, isPending } = useUpdateSupervisor();

  const [initial] = useState<SupervisorRecordForm>(() => toForm(supervisor));
  const [form, setForm] = useState<SupervisorRecordForm>(initial);
  const [conflict, setConflict] = useState("");
  const [result, setResult] = useState<UpdateSupervisorResponse | null>(null);

  const setField = <K extends keyof SupervisorRecordForm>(
    key: K,
    value: SupervisorRecordForm[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  /**
   * Send only what actually moved, so the backend's `changes` diff stays
   * honest and an untouched email never trips the uniqueness check.
   */
  const patch = useMemo<UpdateSupervisorPayload>(() => {
    const next: UpdateSupervisorPayload = {};
    const keys = [
      "firstName",
      // Clearing one means sending "", which this diff reports as a change.
      "middleName",
      "lastName",
      "email",
      "phone",
      "staffId",
      "specialization",
    ] as const;
    keys.forEach((key) => {
      if (form[key] !== initial[key]) next[key] = form[key];
    });
    return next;
  }, [form, initial]);

  const middleNameProblem = middleNameError(form.middleName);
  const isDirty = Object.keys(patch).length > 0;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isDirty || middleNameProblem) return;
    setConflict("");
    updateSupervisor(
      { id: supervisor._id, payload: patch },
      {
        onSuccess: (data) => setResult(data),
        onError: (error) => {
          // 409 means the email or staff ID belongs to someone else. Keep the
          // admin in the form so they can correct it.
          if (getApiErrorStatus(error) === 409) {
            setConflict(
              getApiErrorMessage(
                error,
                "That email or staff ID already belongs to another account.",
              ),
            );
          }
        },
      },
    );
  };

  const fullName = displayName(
    {
      firstName: form.firstName,
      middleName: form.middleName,
      lastName: form.lastName,
    },
    form.staffId || "Supervisor",
  );

  if (result) {
    return (
      <UpdateResult
        isOpen={isOpen}
        onClose={onClose}
        result={result}
        name={fullName}
      />
    );
  }

  const footer = (
    <>
      <button
        className="modal-cancel"
        type="button"
        onClick={onClose}
        disabled={isPending}
      >
        Cancel
      </button>
      <button
        className="modal-submit"
        form="edit-supervisor-form"
        type="submit"
        disabled={isPending || !isDirty || Boolean(middleNameProblem)}
      >
        {isPending ? (
          <Spinner size={14} color="#fff" text="" />
        ) : (
          "Save Changes"
        )}
      </button>
    </>
  );

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Supervisor"
      subtitle={fullName}
      icon={<UserRoundPen size={16} />}
      size="medium"
      footer={footer}
    >
      <EditSupervisorStyles />

      <form
        id="edit-supervisor-form"
        onSubmit={handleSubmit}
        className="sup-edit"
      >
        {conflict && <div className="sup-edit-error">{conflict}</div>}

        <div className="sup-edit-names">
          <div className="form-group">
            <label className="modal-label">
              First Name <Required />
            </label>
            <input
              required
              type="text"
              className="modal-input"
              value={form.firstName}
              onChange={(e) => setField("firstName", e.target.value)}
              placeholder="Emmanuel"
            />
          </div>
          <div className="form-group">
            <label className="modal-label">Middle Name</label>
            <input
              type="text"
              className="modal-input"
              value={form.middleName}
              onChange={(e) => setField("middleName", e.target.value)}
              placeholder="Optional"
              maxLength={MIDDLE_NAME_MAX_LENGTH}
            />
            {middleNameProblem && (
              <p className="sup-edit-hint">{middleNameProblem}</p>
            )}
          </div>
          <div className="form-group">
            <label className="modal-label">
              Surname <Required />
            </label>
            <input
              required
              type="text"
              className="modal-input"
              value={form.lastName}
              onChange={(e) => setField("lastName", e.target.value)}
              placeholder="Ibe"
            />
          </div>
        </div>

        <div className="sup-edit-grid">
          <div className="form-group">
            <label className="modal-label">
              Email <Required />
            </label>
            <input
              required
              type="email"
              className="modal-input"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              placeholder="okafor.emmae@fpno.edu.ng"
            />
          </div>
          <div className="form-group">
            <label className="modal-label">Phone</label>
            <input
              type="tel"
              className="modal-input"
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
              placeholder="e.g. 08011223344"
            />
          </div>
          <div className="form-group">
            <label className="modal-label">Staff ID</label>
            <input
              type="text"
              className="modal-input"
              value={form.staffId}
              onChange={(e) => setField("staffId", e.target.value)}
              placeholder="FPN/CS/001"
            />
          </div>
          <div className="form-group">
            <label className="modal-label">Specialization</label>
            <input
              type="text"
              className="modal-input"
              value={form.specialization}
              onChange={(e) => setField("specialization", e.target.value)}
              placeholder="Software Engineering"
            />
          </div>
        </div>

        <p className="sup-edit-note">
          Departments are not edited here — they decide which students this
          supervisor owns, so they have their own screen.
        </p>
      </form>
    </CustomModal>
  );
}

function Required() {
  return <span style={{ color: "#ef4444" }}>*</span>;
}

function UpdateResult({
  isOpen,
  onClose,
  result,
  name,
}: {
  isOpen: boolean;
  onClose: () => void;
  result: UpdateSupervisorResponse;
  name: string;
}) {
  const changes = result.data?.changes ?? [];

  const render = (value: unknown) => {
    if (value === null || value === undefined || value === "") return "—";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Supervisor Updated"
      subtitle={result.data?.name || name}
      icon={<UserRoundPen size={16} />}
      size="medium"
      footer={
        <button className="modal-submit" type="button" onClick={onClose}>
          Done
        </button>
      }
    >
      <EditSupervisorStyles />

      <div className="sup-edit-result">
        <p className="sup-edit-result-msg">
          {result.message ||
            (changes.length > 0
              ? `${changes.length} field${changes.length === 1 ? "" : "s"} updated.`
              : "No fields needed changing.")}
        </p>

        {changes.length > 0 && (
          <div className="sup-edit-changes">
            {changes.map((change) => (
              <div key={change.field} className="sup-edit-change">
                <span className="sup-edit-change-field">{change.field}</span>
                <span>
                  <span className="sup-edit-from">{render(change.from)}</span> →{" "}
                  <strong>{render(change.to)}</strong>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </CustomModal>
  );
}

function EditSupervisorStyles() {
  return (
    <style>{`
      .sup-edit {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .sup-edit-names {
        display: grid;
        /* first · middle · last — the three parts share one row. */
        grid-template-columns: repeat(3, 1fr);
        gap: 14px;
        align-items: start;
      }

      .sup-edit-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
        align-items: start;
      }

      .sup-edit-hint {
        margin: 4px 0 0;
        font-size: 11px;
        line-height: 1.45;
        color: #b45309;
      }

      .sup-edit-error {
        padding: 10px 14px;
        border-radius: 8px;
        font-size: 13px;
        line-height: 1.5;
        color: #b91c1c;
        background: rgba(239, 68, 68, 0.08);
        border: 1px solid rgba(239, 68, 68, 0.25);
        border-left: 4px solid #ef4444;
      }

      .sup-edit-note {
        margin: 0;
        font-size: 12px;
        line-height: 1.55;
        color: var(--color-text-secondary);
      }

      .sup-edit-result {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .sup-edit-result-msg {
        margin: 0;
        font-size: 13px;
        line-height: 1.6;
        color: var(--color-text-secondary);
      }

      .sup-edit-changes {
        border: 1px solid var(--color-border);
        border-radius: 10px;
        overflow: hidden;
      }

      .sup-edit-change {
        display: grid;
        grid-template-columns: minmax(110px, 1fr) 2fr;
        gap: 10px;
        padding: 10px 14px;
        font-size: 12.5px;
        overflow-wrap: anywhere;
      }

      .sup-edit-change + .sup-edit-change {
        border-top: 1px solid var(--color-border);
      }

      .sup-edit-change-field {
        font-weight: 600;
        color: var(--color-text-secondary);
      }

      .sup-edit-from {
        text-decoration: line-through;
        color: var(--color-text-muted);
      }

      @media (max-width: 760px) {
        .sup-edit-names {
          grid-template-columns: 1fr 1fr;
        }
      }

      @media (max-width: 560px) {
        .sup-edit-names,
        .sup-edit-grid {
          grid-template-columns: 1fr;
        }
        .sup-edit-change {
          grid-template-columns: 1fr;
          gap: 3px;
        }
      }
    `}</style>
  );
}
