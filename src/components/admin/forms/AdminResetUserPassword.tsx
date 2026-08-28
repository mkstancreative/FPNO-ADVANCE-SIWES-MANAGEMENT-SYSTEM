import { useState, type FormEvent } from "react";
import { Check, Copy, Eye, EyeOff, KeyRound, ShieldAlert, Wand2 } from "lucide-react";
import { toast } from "react-toastify";
import CustomModal from "../../ui/CustomModal/CustomModal";
import Spinner from "../../ui/Spinner/Spinner";
import { useAdminResetUserPassword } from "../../../hooks/useAdminUsers";
import type { AdminUserLookupItem } from "../../../api/types/adminUser";
import { readTemporaryPassword } from "../../../api/types/adminUser";

interface AdminResetUserPasswordProps {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUserLookupItem;
}

interface FormErrors {
  newPassword?: string;
  confirmPassword?: string;
}

/** Same rules the self-service change-password form enforces. */
const RULES: { label: string; test: (v: string) => boolean }[] = [
  { label: "At least 8 characters", test: (v) => v.length >= 8 },
  { label: "An uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { label: "A lowercase letter", test: (v) => /[a-z]/.test(v) },
  { label: "A number", test: (v) => /[0-9]/.test(v) },
  { label: "A special character (!@#$%^&*)", test: (v) => /[!@#$%^&*]/.test(v) },
];

export default function AdminResetUserPassword({
  isOpen,
  onClose,
  user,
}: AdminResetUserPasswordProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [show, setShow] = useState({ next: false, confirm: false });
  const [errors, setErrors] = useState<FormErrors>({});
  // Omitting `newPassword` tells the backend to generate one and force a change
  // on next login — the admin never has to invent a password.
  const [generate, setGenerate] = useState(false);
  const [issued, setIssued] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { mutate: resetPassword, isPending } = useAdminResetUserPassword();

  if (!user) {
    return null;
  }

  const email = user.email || "";
  const fullName =
    user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim();
  const nameParts = fullName.split(" ").filter(Boolean);
  const initialFirst = nameParts[0] ? nameParts[0][0].toUpperCase() : "?";
  const initialLast =
    nameParts.length > 1 ? nameParts[nameParts.length - 1][0].toUpperCase() : "";
  const roleText =
    typeof user.role === "string" ? user.role.replace(/_/g, " ") : "";
  const userId = user.userId || user.id || user._id || "";

  const validate = (): boolean => {
    if (generate) return true;

    const next: FormErrors = {};

    if (!newPassword.trim()) {
      next.newPassword = "New password is required";
    } else {
      const unmet = RULES.find((r) => !r.test(newPassword));
      if (unmet) next.newPassword = `Password needs: ${unmet.label.toLowerCase()}`;
    }

    if (!confirmPassword.trim()) {
      next.confirmPassword = "Please re-enter the password";
    } else if (newPassword !== confirmPassword) {
      next.confirmPassword = "Passwords do not match";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate() || !userId) return;

    resetPassword(
      { userId, newPassword: generate ? undefined : newPassword },
      {
        onSuccess: (res) => {
          const temp = readTemporaryPassword(res);
          // Keep the modal open while a generated password is on screen —
          // closing it would lose the only copy the admin ever sees.
          if (generate && temp) {
            setIssued(temp);
            return;
          }
          onClose();
        },
      },
    );
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Reset User Password"
      subtitle="Set a new sign-in password on this user's behalf"
      icon={<KeyRound size={18} />}
      size="medium"
      footer={
        issued ? (
          <button type="button" className="modal-submit" onClick={onClose}>
            Done
          </button>
        ) : (
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
              form="admin-reset-password-form"
              className="modal-submit"
              disabled={isPending}
            >
              {isPending ? (
                <Spinner size={14} color="#fff" />
              ) : generate ? (
                "Generate & Reset"
              ) : (
                "Reset Password"
              )}
            </button>
          </>
        )
      }
    >
      {issued ? (
        <div className="aru-issued">
          <div className="aru-issued-head">
            <Check size={16} />
            Password reset for {fullName || email}
          </div>
          <label className="aru-issued-label">Temporary password</label>
          <div className="aru-issued-value">
            <code>{issued}</code>
            <button
              type="button"
              className="aru-copy"
              onClick={() => {
                navigator.clipboard.writeText(issued);
                setCopied(true);
                toast.info("Copied to clipboard");
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="aru-issued-note">
            This is shown once and is not emailed. Pass it to the user through a
            channel they already trust — they will be asked to choose a new
            password the next time they sign in.
          </p>
        </div>
      ) : (
      <form
        id="admin-reset-password-form"
        onSubmit={handleSubmit}
        className="form-grid"
      >
        {/* Who this affects — shown so an admin cannot reset the wrong account */}
        <div className="form-group col-4">
          <div className="aru-target">
            <div className="aru-avatar">
              {initialFirst}
              {initialLast}
            </div>
            <div className="aru-target-meta">
              <div className="aru-target-name">{fullName || email || "User"}</div>
              <div className="aru-target-sub">
                {email}
                {user.registrationNumber ? ` · ${user.registrationNumber}` : ""}
                {roleText ? ` · ${roleText}` : ""}
              </div>
            </div>
          </div>
        </div>

        <div className="form-group col-4">
          <div className="aru-warning">
            <ShieldAlert size={16} />
            <span>
              {generate
                ? "The backend will generate a password and require the user to change it at their next sign-in. It is shown to you once and is not emailed."
                : "This replaces the password immediately. Tell the user their new password through a channel they already trust — it is not emailed to them."}
            </span>
          </div>
        </div>

        <div className="form-group col-4">
          <div className="aru-modes">
            <button
              type="button"
              className={`aru-mode${!generate ? " active" : ""}`}
              onClick={() => setGenerate(false)}
              disabled={isPending}
            >
              <KeyRound size={14} />
              Set a password
            </button>
            <button
              type="button"
              className={`aru-mode${generate ? " active" : ""}`}
              onClick={() => {
                setGenerate(true);
                setErrors({});
              }}
              disabled={isPending}
            >
              <Wand2 size={14} />
              Generate a temporary one
            </button>
          </div>
        </div>

        {!generate && (
          <div className="form-group col-2">
            <label className="modal-label">
              New Password <span className="req">*</span>
            </label>
            <div className="aru-input-wrap">
              <input
                type={show.next ? "text" : "password"}
                className={`modal-input${errors.newPassword ? " aru-input-error" : ""}`}
                value={newPassword}
                autoComplete="new-password"
                placeholder="Enter a new password"
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errors.newPassword) {
                    setErrors((p) => ({ ...p, newPassword: undefined }));
                  }
                }}
                disabled={isPending}
              />
              <button
                type="button"
                className="aru-toggle"
                onClick={() => setShow((p) => ({ ...p, next: !p.next }))}
                aria-label={show.next ? "Hide password" : "Show password"}
                disabled={isPending}
              >
                {show.next ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.newPassword && (
              <span className="aru-error">{errors.newPassword}</span>
            )}
          </div>
        )}

        {!generate && (
          <div className="form-group col-2">
            <label className="modal-label">
              Confirm Password <span className="req">*</span>
            </label>
            <div className="aru-input-wrap">
              <input
                type={show.confirm ? "text" : "password"}
                className={`modal-input${errors.confirmPassword ? " aru-input-error" : ""}`}
                value={confirmPassword}
                autoComplete="new-password"
                placeholder="Re-enter the password"
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) {
                    setErrors((p) => ({ ...p, confirmPassword: undefined }));
                  }
                }}
                disabled={isPending}
              />
              <button
                type="button"
                className="aru-toggle"
                onClick={() => setShow((p) => ({ ...p, confirm: !p.confirm }))}
                aria-label={show.confirm ? "Hide password" : "Show password"}
                disabled={isPending}
              >
                {show.confirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="aru-error">{errors.confirmPassword}</span>
            )}
          </div>
        )}

        {/* Live checklist, so the admin sees what is still missing */}
        {!generate && (
          <div className="form-group col-4">
            <ul className="aru-rules">
              {RULES.map((rule) => {
                const met = rule.test(newPassword);
                return (
                  <li key={rule.label} className={met ? "met" : ""}>
                    {rule.label}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </form>
      )}

      <style>{`
        .aru-target {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 10px;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
        }
        .aru-avatar {
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          border-radius: 50%;
          background: var(--color-accent);
          color: #fff;
          font-weight: 700;
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .aru-target-name {
          font-weight: 600;
          font-size: 14px;
          color: var(--color-text-primary);
        }
        .aru-target-sub {
          font-size: 12px;
          color: var(--color-text-muted);
          text-transform: capitalize;
        }
        .aru-warning {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 14px;
          border-radius: 10px;
          font-size: 12.5px;
          line-height: 1.45;
          color: #92400e;
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-left: 4px solid #d97706;
        }
        .aru-input-wrap { position: relative; }
        .aru-input-wrap .modal-input { padding-right: 38px; width: 100%; }
        .aru-toggle {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: var(--color-text-muted);
          display: flex;
          padding: 4px;
        }
        .aru-toggle:hover:not(:disabled) { color: var(--color-text-primary); }
        .aru-input-error { border-color: #ef4444 !important; }
        .aru-error {
          display: block;
          margin-top: 4px;
          font-size: 11.5px;
          color: #ef4444;
        }
        .aru-rules {
          list-style: none;
          margin: 0;
          padding: 12px 14px;
          border-radius: 10px;
          background: var(--color-surface-overlay);
          border: 1px solid var(--color-border);
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
          gap: 6px 16px;
        }
        .aru-rules li {
          font-size: 12px;
          color: var(--color-text-muted);
          display: flex;
          align-items: center;
          gap: 7px;
        }
        .aru-rules li::before {
          content: "○";
          font-size: 11px;
        }
        .aru-rules li.met { color: #16a34a; }
        .aru-rules li.met::before { content: "●"; }
        .aru-modes {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 8px;
        }
        .aru-mode {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 9px 12px;
          font-size: 12.5px;
          font-weight: 600;
          border-radius: 9px;
          cursor: pointer;
          color: var(--color-text-muted);
          background: var(--color-surface-overlay);
          border: 1px solid var(--color-border);
          transition: background 0.15s, color 0.15s, border-color 0.15s;
        }
        .aru-mode:hover:not(:disabled) { color: var(--color-text-primary); }
        .aru-mode.active {
          color: var(--color-accent);
          background: var(--color-accent-soft);
          border-color: var(--color-accent);
        }
        .aru-issued {
          padding: 18px;
          border-radius: 12px;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
        }
        .aru-issued-head {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13.5px;
          font-weight: 700;
          color: #166534;
          margin-bottom: 16px;
        }
        .aru-issued-label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: #047857;
          margin-bottom: 7px;
        }
        .aru-issued-value {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 9px;
          background: #fff;
          border: 1px solid #a7f3d0;
        }
        .aru-issued-value code {
          font-family: monospace;
          font-size: 17px;
          font-weight: 700;
          color: #065f46;
          word-break: break-all;
        }
        .aru-copy {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
          padding: 6px 10px;
          font-size: 12px;
          font-weight: 600;
          border-radius: 7px;
          cursor: pointer;
          color: #047857;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
        }
        .aru-issued-note {
          margin: 14px 0 0;
          font-size: 12.5px;
          line-height: 1.5;
          color: #047857;
        }
      `}</style>
    </CustomModal>
  );
}
