import { useRef, useState, useEffect } from "react";
import { ChevronDown, GraduationCap } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { useInternship } from "../../context/useInternship";

function batchLabel(batch: string | { name: string; session: string }) {
  if (typeof batch === "string") return batch;
  return `${batch.name} (${batch.session})`;
}

export default function InternshipSwitcher() {
  const { user } = useAuth();
  const { internships, selectedInternshipId, isMultiple, selectInternship } =
    useInternship();

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (user?.role !== "student" || !isMultiple) return null;

  const selected = internships.find((i) => i._id === selectedInternshipId);

  return (
    <div className="dash-topbar__user-menu" ref={ref}>
      <button
        className="dash-topbar__avatar-btn"
        aria-label="Switch internship"
        onClick={() => setOpen((o) => !o)}
        title="Switch internship"
      >
        <GraduationCap size={15} color="var(--color-accent)" />
        <span className="dash-topbar__user-name" style={{ maxWidth: 140 }}>
          {selected ? batchLabel(selected.batch) : "Select internship"}
        </span>
        <ChevronDown
          size={13}
          color="var(--color-text-subtle)"
          style={{
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
          }}
        />
      </button>

      {open && (
        <div className="dash-topbar__dropdown">
          <div className="dash-topbar__dropdown-header">
            <div>
              <p className="dash-topbar__dropdown-name">
                Internship History
              </p>
              <p className="dash-topbar__dropdown-role">
                Switch which internship you're viewing
              </p>
            </div>
          </div>
          <div className="dash-topbar__dropdown-divider" />
          {internships.map((i) => (
            <button
              key={i._id}
              className="dash-topbar__dropdown-item"
              style={
                i._id === selectedInternshipId
                  ? { fontWeight: 700, color: "var(--color-accent)" }
                  : undefined
              }
              onClick={() => {
                selectInternship(i._id);
                setOpen(false);
              }}
            >
              <span>
                {batchLabel(i.batch)}
                {i.isCurrent ? " · current" : ""}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
