import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ISRSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  headerAction?: React.ReactNode;
}

export function ISRSection({
  title,
  icon,
  children,
  defaultOpen = true,
  className = "",
  headerAction,
}: ISRSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`isr-card ${className}`}>
      <div className="isr-card-header isr-section-toggle-wrapper">
        <button
          className="isr-section-toggle-btn"
          onClick={() => setOpen((v) => !v)}
          type="button"
        >
          <span className="isr-card-header-content">
            {icon}
            {title}
          </span>
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {headerAction && (
          <div className="isr-section-header-action">{headerAction}</div>
        )}
      </div>
      {open && <div className="isr-section-body">{children}</div>}
    </div>
  );
}
