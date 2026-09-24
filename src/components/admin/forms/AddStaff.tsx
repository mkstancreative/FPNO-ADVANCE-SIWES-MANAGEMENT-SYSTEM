import {
  displayName,
  middleNameError,
  MIDDLE_NAME_MAX_LENGTH,
} from "../../../helpers/names";
import { useState, type FormEvent } from "react";
import {
  AlertCircle,
  Check,
  Copy,
  Plus,
  ShieldCheck,
  Trash2,
  UserPlus,
} from "lucide-react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import Spinner from "../../ui/Spinner/Spinner";
import { useCreateStaff } from "../../../hooks/useStaff";
import {
  getApiErrorMessage,
  getApiErrorStatus,
} from "../../../api/services/api";
import type {
  CreateStaffResponse,
  NewStaffUser,
} from "../../../api/types/staff";
import {
  readCreateStaffResult,
  readStaffPassword,
} from "../../../api/types/staff";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const EMPTY_ROW: NewStaffUser = {
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
};

/** Every coordinator account is an institutional address. */
const isInstitutionalEmail = (email: string) =>
  /@fpno\.edu\.ng$/i.test(email.trim());

export default function AddStaff({ isOpen, onClose }: Props) {
  // The endpoint takes an array, so the form is a list from the start — adding
  // a second coordinator should not mean opening this modal twice.
  const [rows, setRows] = useState<NewStaffUser[]>([{ ...EMPTY_ROW }]);
  const [conflict, setConflict] = useState("");
  const [result, setResult] = useState<CreateStaffResponse | null>(null);

  const { mutate: createStaff, isPending } = useCreateStaff();

  const setRow = <K extends keyof NewStaffUser>(
    index: number,
    key: K,
    value: NewStaffUser[K],
  ) =>
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)),
    );

  const addRow = () => setRows((prev) => [...prev, { ...EMPTY_ROW }]);

  const removeRow = (index: number) =>
    setRows((prev) => prev.filter((_, i) => i !== index));

  const handleClose = () => {
    setRows([{ ...EMPTY_ROW }]);
    setConflict("");
    setResult(null);
    onClose();
  };

  // Trim on the way out — a trailing space in an email is a support ticket.
  const users: NewStaffUser[] = rows.map((row) => ({
    firstName: row.firstName.trim(),
    // Sending "" and omitting the key behave identically, so an untouched
    // field needs no stripping.
    middleName: (row.middleName ?? "").trim(),
    lastName: row.lastName.trim(),
    email: row.email.trim(),
  }));

  const isComplete = users.every((u) => u.firstName && u.lastName && u.email);

  // Mirror the server rule so nobody is bounced by a 400 they could have been
  // warned about while typing.
  const middleNameProblem = users
    .map((u) => middleNameError(u.middleName))
    .find(Boolean);

  // Catch the duplicate here rather than letting the backend reject the whole
  // batch over two identical rows the admin can see for themselves.
  const duplicateEmail = (() => {
    const seen = new Set<string>();
    for (const { email } of users) {
      const key = email.toLowerCase();
      if (!key) continue;
      if (seen.has(key)) return email;
      seen.add(key);
    }
    return "";
  })();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isComplete || duplicateEmail || middleNameProblem) return;
    setConflict("");
    createStaff(
      { users },
      {
        onSuccess: (data) => setResult(data),
        onError: (error) => {
          // 409 means one of these emails already has an account. Stay in the
          // form so the admin can correct the row instead of retyping the lot.
          if (getApiErrorStatus(error) === 409) {
            setConflict(
              getApiErrorMessage(
                error,
                "One of these email addresses already belongs to an account.",
              ),
            );
          }
        },
      },
    );
  };

  if (result) {
    return (
      <CreateStaffResult
        isOpen={isOpen}
        onClose={handleClose}
        result={result}
        submitted={users.length}
      />
    );
  }

  const footer = (
    <>
      <button
        className="modal-cancel"
        type="button"
        onClick={handleClose}
        disabled={isPending}
      >
        Cancel
      </button>
      <button
        className="modal-submit"
        form="add-staff-form"
        type="submit"
        disabled={
          isPending ||
          !isComplete ||
          Boolean(duplicateEmail) ||
          Boolean(middleNameProblem)
        }
      >
        {isPending ? (
          <Spinner size={14} color="#fff" text="" />
        ) : rows.length === 1 ? (
          "Create Account"
        ) : (
          `Create ${rows.length} Accounts`
        )}
      </button>
    </>
  );

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Coordinator"
      subtitle="Create SIWES coordinator accounts"
      icon={<UserPlus size={16} />}
      size="wide"
      footer={footer}
    >
      <form id="add-staff-form" onSubmit={handleSubmit} className="staff-form">
        {conflict && <Banner tone="error">{conflict}</Banner>}
        {duplicateEmail && (
          <Banner tone="error">
            {duplicateEmail} appears more than once — each coordinator needs a
            distinct email address.
          </Banner>
        )}
        {middleNameProblem && <Banner tone="error">{middleNameProblem}</Banner>}

        <Banner tone="info">
          Coordinators sign in with the password the system issues and are asked
          to change it on first login. You will see each issued password once,
          on the next screen.
        </Banner>

        {rows.map((row, index) => (
          <div key={index} className="staff-row">
            {/* Only visible once the row stacks, where the columns stop
                explaining themselves by position. */}
            <div className="staff-row-heading">Coordinator {index + 1}</div>

            <div className="form-group">
              <label className="modal-label">
                First Name <Required />
              </label>
              <input
                required
                className="modal-input"
                value={row.firstName}
                onChange={(e) => setRow(index, "firstName", e.target.value)}
                placeholder="Nwachukwu"
              />
            </div>
            <div className="form-group">
              <label className="modal-label">Middle Name</label>
              <input
                className="modal-input"
                value={row.middleName ?? ""}
                onChange={(e) => setRow(index, "middleName", e.target.value)}
                placeholder="Optional"
                maxLength={MIDDLE_NAME_MAX_LENGTH}
              />
            </div>
            <div className="form-group">
              <label className="modal-label">
                Surname <Required />
              </label>
              <input
                required
                className="modal-input"
                value={row.lastName}
                onChange={(e) => setRow(index, "lastName", e.target.value)}
                placeholder="Oluebube"
              />
            </div>
            <div className="form-group staff-cell-email">
              <label className="modal-label">
                Email <Required />
              </label>
              <input
                required
                type="email"
                className="modal-input"
                value={row.email}
                onChange={(e) => setRow(index, "email", e.target.value)}
                placeholder="nwachukwufaith@fpno.edu.ng"
              />
              {row.email.trim() && !isInstitutionalEmail(row.email) && (
                <p className="staff-hint">
                  Not an @fpno.edu.ng address — double-check before creating.
                </p>
              )}
            </div>
            <div className="form-group staff-cell-remove">
              {/* Spacer so the button sits on the input row, not the label row.
                  It is hidden once the row stacks and there is no input beside
                  it to line up with. */}
              <label className="modal-label staff-spacer" aria-hidden="true">
                &nbsp;
              </label>
              <button
                type="button"
                className="staff-remove-btn"
                onClick={() => removeRow(index)}
                disabled={rows.length === 1 || isPending}
                aria-label={`Remove coordinator ${index + 1}`}
                title={
                  rows.length === 1
                    ? "At least one coordinator is required"
                    : "Remove this row"
                }
              >
                <Trash2 size={15} />
                <span className="staff-remove-text">Remove</span>
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          className="staff-add-btn"
          onClick={addRow}
          disabled={isPending}
        >
          <Plus size={14} />
          Add another coordinator
        </button>
      </form>

      <StaffFormStyles />
    </CustomModal>
  );
}

/**
 * Layout for the coordinator rows. Three breakpoints, because the row carries
 * five columns at full width and none of them survive a phone:
 *
 *  ≥ 1100px  all four fields on one line, delete an icon square beside them
 *  < 1100px  names two-up, email full width, delete a labelled full-width
 *            button — an unlabelled icon under a stacked row is ambiguous
 *  < 560px   one column per field
 */
function StaffFormStyles() {
  return (
    <style>{`
      .staff-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .staff-row {
        display: grid;
        /* first · middle · last · email · delete */
        grid-template-columns: 1fr 1fr 1fr 1.5fr auto;
        gap: 12px;
        /* Top-aligned: the email field grows a warning line underneath, and
           stretching would drag the delete button down with it. */
        align-items: start;
        padding: 14px;
        border-radius: 10px;
        border: 1px solid var(--color-border);
      }

      .staff-row-heading {
        display: none;
        grid-column: 1 / -1;
        font-size: 11.5px;
        font-weight: 700;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        color: var(--color-text-secondary);
      }

      .staff-hint {
        margin: 4px 0 0;
        font-size: 11px;
        line-height: 1.45;
        color: #b45309;
      }

      .staff-remove-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        /* Matches .modal-input so the two line up edge to edge. */
        height: 42px;
        width: 42px;
        border-radius: 10px;
        font-size: 12.5px;
        font-weight: 600;
        cursor: pointer;
        color: #ef4444;
        background: rgba(239, 68, 68, 0.08);
        border: 1px solid rgba(239, 68, 68, 0.25);
      }

      .staff-remove-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      /* The word "Remove" only appears once the icon loses its context. */
      .staff-remove-text {
        display: none;
      }

      .staff-add-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        align-self: flex-start;
        padding: 8px 14px;
        font-size: 12.5px;
        font-weight: 600;
        border-radius: 8px;
        cursor: pointer;
        color: var(--color-accent);
        background: var(--color-accent-soft);
        border: 1px solid var(--color-accent);
      }

      .staff-add-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      @media (max-width: 1100px) {
        .staff-row {
          grid-template-columns: 1fr 1fr;
        }
        .staff-row-heading {
          display: block;
        }
        .staff-cell-email,
        .staff-cell-remove {
          grid-column: 1 / -1;
        }
        .staff-spacer {
          display: none;
        }
        .staff-remove-btn {
          width: 100%;
        }
        .staff-remove-text {
          display: inline;
        }
      }

      @media (max-width: 560px) {
        .staff-row {
          grid-template-columns: 1fr;
          padding: 12px;
        }
        .staff-add-btn {
          width: 100%;
        }
      }
    `}</style>
  );
}

/**
 * The issued-password rows. Side by side while there is room; below 560px the
 * password and its copy button move onto their own line, because a generated
 * password is the one thing on this screen that must never be truncated.
 */
function StaffResultStyles() {
  return (
    <style>{`
      .staff-pw-row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 14px;
        font-size: 12.5px;
      }

      .staff-pw-who {
        flex: 1;
        min-width: 0;
      }

      .staff-pw-email {
        font-size: 11.5px;
        color: var(--color-text-secondary);
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .staff-pw-code {
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 12.5px;
        overflow-wrap: anywhere;
        background: var(--color-bg-secondary);
        border: 1px solid var(--color-border);
      }

      .staff-pw-copy {
        display: flex;
        align-items: center;
        gap: 5px;
        flex-shrink: 0;
        padding: 5px 9px;
        font-size: 11.5px;
        font-weight: 600;
        border-radius: 6px;
        cursor: pointer;
        border: 1px solid var(--color-border);
      }

      @media (max-width: 560px) {
        .staff-pw-row {
          flex-wrap: wrap;
        }
        .staff-pw-who {
          flex: 1 1 100%;
        }
        .staff-pw-code {
          flex: 1;
        }
      }
    `}</style>
  );
}

function Required() {
  return <span style={{ color: "#ef4444" }}>*</span>;
}

function Banner({
  tone,
  children,
}: {
  tone: "error" | "info" | "success";
  children: React.ReactNode;
}) {
  const palette = {
    error: { color: "#b91c1c", rgb: "239,68,68", bar: "#ef4444" },
    info: {
      color: "var(--color-text-primary)",
      rgb: "59,130,246",
      bar: "#3b82f6",
    },
    success: {
      color: "var(--color-text-primary)",
      rgb: "16,185,129",
      bar: "#10b981",
    },
  }[tone];

  return (
    <div
      style={{
        padding: "10px 14px",
        borderRadius: 8,
        fontSize: 12.5,
        lineHeight: 1.55,
        color: palette.color,
        background: `rgba(${palette.rgb},0.08)`,
        border: `1px solid rgba(${palette.rgb},0.25)`,
        borderLeft: `4px solid ${palette.bar}`,
      }}
    >
      {children}
    </div>
  );
}

/**
 * The issued passwords are shown once and never again — the backend does not
 * store them in readable form — so this screen is the only chance the admin
 * has to pass them on. It stays until they dismiss it deliberately.
 */
function CreateStaffResult({
  isOpen,
  onClose,
  result,
  submitted,
}: {
  isOpen: boolean;
  onClose: () => void;
  result: CreateStaffResponse;
  /** How many rows were sent — the fallback count, see below. */
  submitted: number;
}) {
  const { created, errors, successful, failed } = readCreateStaffResult(result);
  // A bare `{ success, message }` response carries nothing to count, and the
  // request did succeed — so fall back to what was sent rather than announcing
  // "0 accounts created" over a batch that went through.
  const createdCount =
    successful || failed || created.length ? successful : submitted;
  const withPasswords = created.filter((a) => readStaffPassword(a));

  const [copied, setCopied] = useState("");

  const copy = async (email: string, password: string) => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(email);
      setTimeout(() => setCopied(""), 1800);
    } catch {
      // Clipboard can be blocked; the password is on screen to read either way.
    }
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Accounts Created"
      subtitle={
        createdCount === 1
          ? "1 coordinator account created"
          : `${createdCount} coordinator accounts created`
      }
      icon={<ShieldCheck size={16} />}
      size="medium"
      footer={
        <button className="modal-submit" type="button" onClick={onClose}>
          Done
        </button>
      }
    >
      <StaffResultStyles />
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {result.message && (
          <p
            style={{
              margin: 0,
              fontSize: 13,
              lineHeight: 1.6,
              color: "var(--color-text-secondary)",
            }}
          >
            {result.message}
          </p>
        )}

        {withPasswords.length > 0 && (
          <>
            <Banner tone="info">
              Copy these passwords now — they are shown only on this screen.
              Each coordinator will be asked to change theirs at first login.
            </Banner>
            <div
              style={{
                border: "1px solid var(--color-border)",
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              {withPasswords.map((account, i) => {
                const password = readStaffPassword(account) as string;
                return (
                  <div
                    key={account.email}
                    className="staff-pw-row"
                    style={{
                      borderTop:
                        i === 0 ? "none" : "1px solid var(--color-border)",
                    }}
                  >
                    <div className="staff-pw-who">
                      <div style={{ fontWeight: 600 }}>
                        {displayName(account, account.email)}
                      </div>
                      <div className="staff-pw-email">{account.email}</div>
                    </div>
                    <code className="staff-pw-code">{password}</code>
                    <button
                      type="button"
                      className="staff-pw-copy"
                      onClick={() => copy(account.email, password)}
                      title="Copy password"
                      style={{
                        color:
                          copied === account.email
                            ? "#059669"
                            : "var(--color-accent)",
                        background:
                          copied === account.email
                            ? "rgba(16,185,129,0.1)"
                            : "var(--color-accent-soft)",
                      }}
                    >
                      {copied === account.email ? (
                        <Check size={12} />
                      ) : (
                        <Copy size={12} />
                      )}
                      {copied === account.email ? "Copied" : "Copy"}
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {withPasswords.length === 0 && failed === 0 && (
          <Banner tone="success">
            {created.length > 0
              ? `${created.map((a) => a.email).join(", ")} created.`
              : "The accounts were created."}{" "}
            No password was returned here — use <strong>Reset Password</strong>{" "}
            on the staff list to issue one.
          </Banner>
        )}

        {failed > 0 && (
          <div
            style={{
              border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "9px 14px",
                fontSize: 12.5,
                fontWeight: 700,
                color: "#b91c1c",
                background: "rgba(239,68,68,0.08)",
              }}
            >
              <AlertCircle size={14} />
              {failed} {failed === 1 ? "account" : "accounts"} could not be
              created
            </div>
            {errors.map((err, i) => (
              <div
                key={`${err.email ?? err.row ?? i}`}
                style={{
                  padding: "9px 14px",
                  fontSize: 12.5,
                  lineHeight: 1.5,
                  borderTop: "1px solid var(--color-border)",
                }}
              >
                <strong>{err.email ?? `Row ${err.row ?? i + 1}`}</strong> —{" "}
                {err.error}
              </div>
            ))}
          </div>
        )}
      </div>
    </CustomModal>
  );
}
