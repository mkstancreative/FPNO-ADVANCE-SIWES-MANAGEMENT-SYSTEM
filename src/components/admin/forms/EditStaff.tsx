import { useMemo, useState, type FormEvent } from "react";
import { UserRoundPen } from "lucide-react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import Spinner from "../../ui/Spinner/Spinner";
import Toggler from "../../ui/Toggler/Toggler";
import { useStaffById, useUpdateStaff } from "../../../hooks/useStaff";
import {
  getApiErrorMessage,
  getApiErrorStatus,
} from "../../../api/services/api";
import type {
  StaffUser,
  UpdateStaffPayload,
  UpdateStaffResponse,
} from "../../../api/types/staff";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** The list row; the full record is fetched by id before editing. */
  staff: StaffUser;
}

/**
 * The PUT payload is partial, but the form needs a value for every control.
 * This is the complete shape the inputs bind to; the patch is derived from it
 * at submit time.
 */
interface StaffRecordForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isActive: boolean;
}

function toForm(staff: StaffUser): StaffRecordForm {
  return {
    firstName: staff.firstName ?? "",
    lastName: staff.lastName ?? "",
    email: staff.email ?? "",
    phone: staff.phone ?? "",
    // An account with no flag from the backend is treated as active, which is
    // what every other screen assumes about a record it can see.
    isActive: staff.isActive ?? true,
  };
}

export default function EditStaff({ isOpen, onClose, staff }: Props) {
  // The row may be a trimmed projection; pull the full record so the diff is
  // taken against what is actually stored.
  const { data: detail, isLoading } = useStaffById(staff._id);

  if (isLoading || !detail?.data) {
    return (
      <CustomModal
        isOpen={isOpen}
        onClose={onClose}
        title="Edit Coordinator"
        subtitle={staff.email}
        icon={<UserRoundPen size={16} />}
        size="medium"
      >
        <div
          style={{
            padding: "40px 0",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Spinner size={22} color="var(--color-accent)" text="Loading…" />
        </div>
      </CustomModal>
    );
  }

  return (
    <EditStaffForm isOpen={isOpen} onClose={onClose} staff={detail.data} />
  );
}

function EditStaffForm({
  isOpen,
  onClose,
  staff,
}: {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffUser;
}) {
  const { mutate: updateStaff, isPending } = useUpdateStaff();

  const [initial] = useState<StaffRecordForm>(() => toForm(staff));
  const [form, setForm] = useState<StaffRecordForm>(initial);
  const [conflict, setConflict] = useState("");
  const [result, setResult] = useState<UpdateStaffResponse | null>(null);

  const setField = <K extends keyof StaffRecordForm>(
    key: K,
    value: StaffRecordForm[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  /**
   * Send only what actually moved — that keeps the backend's `changes` diff
   * honest and avoids tripping the uniqueness check on an email the admin
   * never touched.
   */
  const patch = useMemo<UpdateStaffPayload>(() => {
    const next: UpdateStaffPayload = {};
    const keys = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "isActive",
    ] as const;
    keys.forEach((key) => {
      if (form[key] !== initial[key]) next[key] = form[key] as never;
    });
    return next;
  }, [form, initial]);

  const isDirty = Object.keys(patch).length > 0;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isDirty) return;
    setConflict("");
    updateStaff(
      { userId: staff._id, payload: patch },
      {
        onSuccess: (data) => setResult(data),
        onError: (error) => {
          // 409 means the email belongs to someone else. Keep the admin in the
          // form so they can correct it.
          if (getApiErrorStatus(error) === 409) {
            setConflict(
              getApiErrorMessage(
                error,
                "That email address already belongs to another account.",
              ),
            );
          }
        },
      },
    );
  };

  const fullName =
    [form.firstName, form.lastName].filter(Boolean).join(" ") || staff.email;

  if (result) {
    return (
      <UpdateResult
        isOpen={isOpen}
        onClose={onClose}
        result={result}
        name={fullName}
        deactivated={initial.isActive && !form.isActive}
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
        form="edit-staff-form"
        type="submit"
        disabled={isPending || !isDirty}
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
      title="Edit Coordinator"
      subtitle={fullName}
      icon={<UserRoundPen size={16} />}
      size="medium"
      footer={footer}
    >
      <EditStaffStyles />

      <form id="edit-staff-form" onSubmit={handleSubmit} className="staff-edit">
        {conflict && <div className="staff-edit-error">{conflict}</div>}

        <div className="staff-edit-grid">
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
              placeholder="Nwachukwu"
            />
          </div>
          <div className="form-group">
            <label className="modal-label">
              Last Name <Required />
            </label>
            <input
              required
              type="text"
              className="modal-input"
              value={form.lastName}
              onChange={(e) => setField("lastName", e.target.value)}
              placeholder="Faith Oluebube"
            />
          </div>
          <div className="form-group staff-edit-wide">
            <label className="modal-label">
              Email <Required />
            </label>
            <input
              required
              type="email"
              className="modal-input"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              placeholder="nwachukwufaith@fpno.edu.ng"
            />
          </div>
          <div className="form-group staff-edit-wide">
            <label className="modal-label">Phone</label>
            <input
              type="tel"
              className="modal-input"
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
              placeholder="e.g. 08123456789"
            />
          </div>
        </div>

        <div className="staff-edit-toggle">
          <Toggler
            checked={form.isActive}
            onChange={(e) => setField("isActive", e.target.checked)}
            disabled={isPending}
          />
          <div>
            <div className="staff-edit-toggle-title">Account active</div>
            <div className="staff-edit-toggle-sub">
              {form.isActive
                ? "This coordinator can sign in."
                : "Sign-in is blocked. The account and its history are kept — this is not a deletion."}
            </div>
          </div>
        </div>
      </form>
    </CustomModal>
  );
}

function Required() {
  return <span style={{ color: "#ef4444" }}>*</span>;
}

/**
 * What the backend actually changed. Worth showing rather than closing
 * silently: an email edit changes the address the coordinator signs in with,
 * and the admin should see that land.
 */
function UpdateResult({
  isOpen,
  onClose,
  result,
  name,
  deactivated,
}: {
  isOpen: boolean;
  onClose: () => void;
  result: UpdateStaffResponse;
  name: string;
  /** This save switched the account off, which is worth calling out. */
  deactivated: boolean;
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
      title="Record Updated"
      subtitle={name}
      icon={<UserRoundPen size={16} />}
      size="medium"
      footer={
        <button className="modal-submit" type="button" onClick={onClose}>
          Done
        </button>
      }
    >
      <EditStaffStyles />

      <div className="staff-edit-result">
        <p className="staff-edit-result-msg">
          {result.message ||
            (changes.length > 0
              ? `${changes.length} field${changes.length === 1 ? "" : "s"} updated.`
              : "No fields needed changing.")}
        </p>

        {changes.length > 0 && (
          <div className="staff-edit-changes">
            {changes.map((change) => (
              <div key={change.field} className="staff-edit-change">
                <span className="staff-edit-change-field">{change.field}</span>
                <span>
                  <span className="staff-edit-from">{render(change.from)}</span>{" "}
                  → <strong>{render(change.to)}</strong>
                </span>
              </div>
            ))}
          </div>
        )}

        {deactivated && (
          <div className="staff-edit-warn">
            <strong>Account deactivated</strong>
            This coordinator can no longer sign in. Turn the account back on
            from this screen whenever you need to.
          </div>
        )}
      </div>
    </CustomModal>
  );
}

/**
 * Two fields per row while there is room, one below 560px — the same point the
 * rest of the staff screens stack at.
 */
function EditStaffStyles() {
  return (
    <style>{`
      .staff-edit {
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .staff-edit-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
        align-items: start;
      }

      .staff-edit-wide {
        grid-column: 1 / -1;
      }

      .staff-edit-error {
        padding: 10px 14px;
        border-radius: 8px;
        font-size: 13px;
        line-height: 1.5;
        color: #b91c1c;
        background: rgba(239, 68, 68, 0.08);
        border: 1px solid rgba(239, 68, 68, 0.25);
        border-left: 4px solid #ef4444;
      }

      .staff-edit-toggle {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 12px 14px;
        border-radius: 10px;
        border: 1px solid var(--color-border);
      }

      .staff-edit-toggle > :first-child {
        flex-shrink: 0;
        margin-top: 2px;
      }

      .staff-edit-toggle-title {
        font-size: 13px;
        font-weight: 600;
      }

      .staff-edit-toggle-sub {
        margin-top: 2px;
        font-size: 12px;
        line-height: 1.5;
        color: var(--color-text-secondary);
      }

      .staff-edit-result {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .staff-edit-result-msg {
        margin: 0;
        font-size: 13px;
        line-height: 1.6;
        color: var(--color-text-secondary);
      }

      .staff-edit-changes {
        border: 1px solid var(--color-border);
        border-radius: 10px;
        overflow: hidden;
      }

      .staff-edit-change {
        display: grid;
        grid-template-columns: minmax(110px, 1fr) 2fr;
        gap: 10px;
        padding: 10px 14px;
        font-size: 12.5px;
        overflow-wrap: anywhere;
      }

      .staff-edit-change + .staff-edit-change {
        border-top: 1px solid var(--color-border);
      }

      .staff-edit-change-field {
        font-weight: 600;
        color: var(--color-text-secondary);
      }

      .staff-edit-from {
        text-decoration: line-through;
        color: var(--color-text-muted);
      }

      .staff-edit-warn {
        padding: 12px 14px;
        border-radius: 10px;
        font-size: 12.5px;
        line-height: 1.6;
        color: var(--color-text-primary);
        background: rgba(245, 158, 11, 0.08);
        border: 1px solid rgba(245, 158, 11, 0.28);
        border-left: 4px solid #f59e0b;
      }

      .staff-edit-warn strong {
        display: block;
        margin-bottom: 2px;
      }

      @media (max-width: 560px) {
        .staff-edit-grid {
          grid-template-columns: 1fr;
        }
        .staff-edit-change {
          grid-template-columns: 1fr;
          gap: 3px;
        }
      }
    `}</style>
  );
}
