import React from "react";
import { Layers } from "lucide-react";

interface ShellProps {
  children: React.ReactNode;
  tag?: string;
}

export function ISRShell({
  children,
  tag = "Industry Supervisor Review",
}: ShellProps) {
  const appName = import.meta.env.VITE_APP_NAME;
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
