import React from "react";
import { Layers } from "lucide-react";
import { useSystemSettings } from "../../hooks/useSettings";
import { resolveName } from "../../utils/branding";

interface ShellProps {
  children: React.ReactNode;
  tag?: string;
}

export function ISRShell({
  children,
  tag = "Industry Supervisor Review",
}: ShellProps) {
  const { data } = useSystemSettings();
  const appName = resolveName(data?.settings);
  return (
    <div className="isr-shell">
      <header className="isr-header">
        <div className="isr-logo">
          <Layers size={18} />
          {appName}
        </div>
        <div className="isr-header-tag">{tag}</div>
      </header>
      <main className="isr-main">{children}</main>
      <footer className="isr-footer">
        &copy; {new Date().getFullYear()} {appName} — Secure Review Link
      </footer>
    </div>
  );
}
