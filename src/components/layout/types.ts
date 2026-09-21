import type { ReactNode } from "react";

export type NavChild = {
  label: string;
  path: string;
  /** Hidden from coordinators — the screen behind it is admin-only. */
  adminOnly?: boolean;
};

export type NavItem = {
  label: string;
  icon: ReactNode;
  path?: string;
  children?: NavChild[];
  /** Hidden from coordinators — the screen behind it is admin-only. */
  adminOnly?: boolean;
};

export type NavSection = {
  section: string;
  items: NavItem[];
};
