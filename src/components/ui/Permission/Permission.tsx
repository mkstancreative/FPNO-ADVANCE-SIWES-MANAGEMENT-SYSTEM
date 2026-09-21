import type { ReactNode } from "react";
import { ShieldAlert } from "lucide-react";
import { usePermissions } from "../../../hooks/usePermissions";

/**
 * Renders `children` only for admins. Use it for controls that would be dead
 * ends for a coordinator — a create button on a screen they can only read.
 *
 * Prefer `ReadOnlyNotice` + a disabled control when the screen itself is part
 * of the coordinator's job: someone who cannot find the discount list at all
 * will ask why, while someone who finds it without an "Add" button will not.
 */
export function AdminOnly({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { canEdit } = usePermissions();
  return <>{canEdit ? children : fallback}</>;
}

/**
 * The banner a coordinator sees at the top of a screen they can read but not
 * change. It names the limit up front so nothing further down reads as broken.
 */
export function ReadOnlyNotice({
  children = "You can review everything on this page. Making changes here is limited to administrators.",
}: {
  children?: ReactNode;
}) {
  const { canEdit } = usePermissions();
  if (canEdit) return null;

  return (
    <>
      <div className="perm-notice">
        <ShieldAlert size={16} className="perm-notice__icon" />
        <span>{children}</span>
      </div>
      <PermissionStyles />
    </>
  );
}

/**
 * A whole screen a coordinator cannot open. Routed rather than linked — the
 * nav already hides these, so reaching one means a typed URL or a stale
 * bookmark, and a plain explanation beats a 404.
 */
export function NoPermission({
  title = "Administrators only",
  message = "This screen is limited to administrators. If you need something from it, contact the SIWES administrator.",
}: {
  title?: string;
  message?: string;
}) {
  return (
    <>
      <div className="perm-block">
        <div className="perm-block__icon">
          <ShieldAlert size={26} />
        </div>
        <h3>{title}</h3>
        <p>{message}</p>
      </div>
      <PermissionStyles />
    </>
  );
}

function PermissionStyles() {
  return (
    <style>{`
      .perm-notice {
        display: flex;
        align-items: flex-start;
        gap: 9px;
        margin-bottom: 18px;
        padding: 11px 14px;
        border-radius: 10px;
        font-size: 12.5px;
        line-height: 1.55;
        color: var(--color-text-primary);
        background: rgba(59, 130, 246, 0.08);
        border: 1px solid rgba(59, 130, 246, 0.25);
        border-left: 4px solid #3b82f6;
      }

      .perm-notice__icon {
        flex-shrink: 0;
        margin-top: 1px;
        color: #3b82f6;
      }

      .perm-block {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 56px 24px;
        background: var(--color-bg-secondary);
        border: 1px solid var(--color-border);
        border-radius: 12px;
      }

      .perm-block__icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 54px;
        height: 54px;
        margin-bottom: 14px;
        border-radius: 50%;
        color: #b45309;
        background: rgba(245, 158, 11, 0.12);
      }

      .perm-block h3 {
        margin: 0 0 6px;
        font-size: 15px;
        font-weight: 700;
        color: var(--color-text-primary);
      }

      .perm-block p {
        margin: 0;
        max-width: 430px;
        font-size: 13px;
        line-height: 1.6;
        color: var(--color-text-muted);
      }
    `}</style>
  );
}
