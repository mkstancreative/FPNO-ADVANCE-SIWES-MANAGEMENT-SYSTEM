import { useAuth } from "../context/useAuth";
import type { UserRole } from "../api/types/auth";

/**
 * What the signed-in user is allowed to do.
 *
 * The rule the backend enforces is: **a coordinator reviews, an admin decides.**
 * Coordinators read everything and approve or reject certificates; anything
 * that moves money, creates an account, changes a credential or changes a
 * student's status is admin only.
 *
 * There is no capability a coordinator has that an admin lacks, so a single
 * `canEdit` boolean gates every admin-only control in the app — never check
 * for "admin or coordinator".
 */
export interface Permissions {
  role?: UserRole;
  isAdmin: boolean;
  isCoordinator: boolean;
  /**
   * The one gate. True for admins only. Gate on this rather than discovering
   * the limit by firing a request and catching the 403 — the 403 is a backstop,
   * not a user experience.
   */
  canEdit: boolean;
}

export const usePermissions = (): Permissions => {
  const { user } = useAuth();
  const role = user?.role;
  return {
    role,
    isAdmin: role === "admin",
    isCoordinator: role === "coordinator",
    canEdit: role === "admin",
  };
};

/**
 * Why a control is disabled. Shown on hover rather than hidden outright, so a
 * coordinator can see that the screen has the action and that their role is
 * what is withholding it.
 */
export const ADMIN_ONLY_HINT =
  "Only an administrator can do this. Contact the SIWES administrator.";
