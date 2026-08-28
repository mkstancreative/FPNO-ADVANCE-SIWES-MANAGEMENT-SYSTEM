import { useCallback, useState } from "react";
import {
  ChevronDown,
  LogOut,
  ChevronLeft,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLogoutUser } from "../../hooks/useAuth";
import { useSystemSettings } from "../../hooks/useSettings";
import { resolveLogo, resolveName } from "../../utils/branding";
import type { NavItem, NavSection } from "./types";

// ─── Expandable Nav Item ──────────────────────────────────────────────────────
function NavItemRow({
  item,
  activePath,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  activePath: string;
  collapsed: boolean;
  onNavigate: (path: string) => void;
}) {
  const hasChildren = !!item.children?.length;
  const isActive = !hasChildren && item.path === activePath;
  const isChildActive =
    hasChildren && item.children!.some((c) => c.path === activePath);
  const [open, setOpen] = useState(isChildActive);

  if (!hasChildren) {
    return (
      <div
        className={`dash-nav-item${isActive ? " dash-nav-item--active" : ""}${collapsed ? " dash-nav-item--collapsed" : ""}`}
        onClick={() => item.path && onNavigate(item.path)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) =>
          e.key === "Enter" && item.path && onNavigate(item.path)
        }
        title={collapsed ? item.label : undefined}
      >
        <span className="dash-nav-item__icon">{item.icon}</span>
        {!collapsed && (
          <span className="dash-nav-item__label">{item.label}</span>
        )}
      </div>
    );
  }

  return (
    <>
      <div
        className={`dash-nav-item${isChildActive ? " dash-nav-item--active" : ""}${collapsed ? " dash-nav-item--collapsed" : ""}`}
        onClick={() => !collapsed && setOpen((o) => !o)}
        role="button"
        tabIndex={0}
        title={collapsed ? item.label : undefined}
      >
        <span className="dash-nav-item__icon">{item.icon}</span>
        {!collapsed && (
          <>
            <span className="dash-nav-item__label">{item.label}</span>
            <span
              className={`dash-nav-item__chevron${open ? " dash-nav-item__chevron--open" : ""}`}
            >
              <ChevronDown size={14} />
            </span>
          </>
        )}
      </div>

      {!collapsed && (
        <div
          className="dash-submenu"
          style={{
            maxHeight: open ? item.children!.length * 40 + "px" : "0px",
          }}
        >
          {item.children!.map((child) => (
            <div
              key={child.path}
              className={`dash-submenu-item${child.path === activePath ? " dash-submenu-item--active" : ""}`}
              onClick={() => onNavigate(child.path)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onNavigate(child.path)}
            >
              {child.label}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
interface SideBarProps {
  nav?: NavSection[];
  collapsed: boolean;
  mobileOpen: boolean;
  onCollapseToggle: () => void;
  onMobileClose: () => void;
}

export default function SideBar({
  nav,
  collapsed,
  mobileOpen,
  onCollapseToggle,
  onMobileClose,
}: SideBarProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { mutate: logout, isPending: loggingOut } = useLogoutUser();
  const { data } = useSystemSettings();
  const settings = data?.settings;
  const appName = resolveName(settings);
  const logo = resolveLogo(settings);

  // On mobile the sidebar is an overlay drawer, so following a link has to
  // dismiss it or the destination stays hidden behind it. Off mobile this is a
  // no-op: `mobileOpen` is already false and the class it drives only applies
  // under the 900px breakpoint.
  const handleNavigate = useCallback(
    (path: string) => {
      navigate(path);
      onMobileClose();
    },
    [navigate, onMobileClose],
  );

  return (
    <aside
      className={[
        "dash-sidebar",
        collapsed ? "dash-sidebar--collapsed" : "",
        mobileOpen ? "dash-sidebar--mobile-open" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* ── Logo + collapse toggle ── */}
      <div className="dash-sidebar__logo">
        <img src={logo} alt="logo" className="dash-sidebar__logo-icon" />
        {!collapsed && (
          <span className="dash-sidebar__logo-text">{appName}</span>
        )}
        <button
          className="dash-sidebar__collapse-btn"
          onClick={onCollapseToggle}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft size={15} className="dash-sidebar__collapse-icon" />
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="dash-sidebar__nav">
        {(nav ?? []).map((section) => (
          <div key={section.section} className="dash-sidebar__section">
            {!collapsed && (
              <p className="dash-sidebar__section-label">{section.section}</p>
            )}
            {collapsed && <div className="dash-sidebar__section-divider" />}
            {section.items.map((item) => (
              <NavItemRow
                key={item.label}
                item={item}
                activePath={pathname}
                collapsed={collapsed}
                onNavigate={handleNavigate}
              />
            ))}
          </div>
        ))}
      </nav>

      {/* ── User / Logout footer ── */}
      <div className="dash-sidebar__footer">
        {/* Logout button */}
        <button
          className={`dash-sidebar__logout-btn${collapsed ? " collapsed" : ""}`}
          onClick={() => logout()}
          disabled={loggingOut}
          title="Logout"
          aria-label="Logout"
        >
          <LogOut size={15} />
          {!collapsed && (
            <span>{loggingOut ? "Signing out…" : "Sign Out"}</span>
          )}
        </button>
      </div>
    </aside>
  );
}
