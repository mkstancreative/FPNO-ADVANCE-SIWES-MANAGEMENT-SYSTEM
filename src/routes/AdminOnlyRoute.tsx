import type { ReactNode } from "react";
import { usePermissions } from "../hooks/usePermissions";
import { NoPermission } from "../components/ui/Permission/Permission";

/**
 * Wraps a route whose screen is admin-only. The nav already hides these from
 * coordinators, so this catches a typed URL or a stale bookmark — and says why
 * rather than rendering a page whose every request would 403.
 */
export default function AdminOnlyRoute({ children }: { children: ReactNode }) {
  const { canEdit } = usePermissions();
  if (!canEdit) {
    return (
      <div className="page-container">
        <NoPermission />
      </div>
    );
  }
  return <>{children}</>;
}
