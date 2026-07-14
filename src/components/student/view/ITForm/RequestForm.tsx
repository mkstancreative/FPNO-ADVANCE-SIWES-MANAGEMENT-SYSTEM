import { useStudentDashboard } from "../../../../hooks/useDashboard";
import { useInternship } from "../../../../context/useInternship";
import "./ITForm.css";

// ── Helpers ──────────────────────────────────────────────────────
const fmt = (d: string | null | undefined | Date) => {
  if (!d) return "___________________________";
  const date = d instanceof Date ? d : new Date(d);
  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

/** Auto-generate a deterministic Ref No. */
const refNo = (reg: string, today: Date) => {
  const seq = reg.replace(/\D/g, "").slice(-4).padStart(4, "0");
  const yr = today.getFullYear();
  const mo = String(today.getMonth() + 1).padStart(2, "0");
  return `FPNO/IPC/${yr}/${mo}/${seq}`;
};

// ── Sub-components ────────────────────────────────────────────────
interface FieldProps {
  label: string;
  value?: string | null;
  span2?: boolean;
}
const Field = ({ label, value, span2 }: FieldProps) => (
  <div className={`req-field${span2 ? " req-field--span2" : ""}`}>
    <span className="req-label">{label}</span>
    <span className={`req-val${value ? "" : " req-val--placeholder"}`}>
      {value || "\u00A0"}
    </span>
  </div>
);

interface SectionProps {
  letter: string;
  title: string;
  children: React.ReactNode;
}
const Section = ({ letter, title, children }: SectionProps) => (
  <div className="req-section">
    <div className="req-section-head">
      <div className="req-section-badge">{letter}</div>
      <span className="req-section-title">{title}</span>
      <div className="req-section-line" />
    </div>
    <div className="req-fields">{children}</div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────
export const RequestForm = () => {
  const { selectedInternshipId } = useInternship();
  const { data: resp, isLoading } = useStudentDashboard({
    internshipId: selectedInternshipId ?? undefined,
  });

  if (isLoading)
    return (
      <div
        style={{
          padding: 40,
          textAlign: "center",
          color: "var(--color-text-muted)",
          fontFamily: "inherit",
        }}
      >
        Loading request form…
      </div>
    );

  if (!resp?.data)
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#f43f5e" }}>
        Could not load student data. Please refresh and try again.
      </div>
    );

  const { student, placement, supervisors, progress } = resp.data;
  const today = new Date();
  const ref = refNo(student.registrationNumber, today);

  return (
    <div className="req-page">
      <div className="req-frame">
        {/* Corner ornaments */}
        <div className="req-corner-tl" />
        <div className="req-corner-tr" />
        <div className="req-corner-bl" />
        <div className="req-corner-br" />

        {/* ── Gradient Header Band ─────────────────────────────── */}
        <div className="req-header-band">
          {/* Left logo */}
          <div className="cert-logo-circle">
            <span className="cert-logo-text">FPNO</span>
            <span className="cert-logo-subtext">FED. POLY NEKEDE</span>
          </div>

          <div className="req-header-center">
            <p className="cert-school-name">
              Holy Rosary Hospital College of Nursing Sciences
            </p>
            <p className="cert-school-sub">
              PMB 1036 Emekuku – Owerri, Imo State, Nigeria
            </p>
            <p className="cert-dept-name">Company Placement Centre</p>
            <p className="cert-dept-sub">(CIMS Directorate)</p>
          </div>

          {/* Right logo */}
          <div className="cert-logo-circle cert-logo-circle--nbte">
            <span className="cert-logo-text">NBTE</span>
            <span className="cert-logo-subtext">ACCREDITED</span>
          </div>
        </div>

        {/* orange ribbon */}
        <div className="req-ribbon" />

        {/* ── Body ─────────────────────────────────────────────── */}
        <div className="req-body-wrap">
          {/* Title */}
          <div className="req-title-block">
            <h1 className="req-title">IT Placement Request Form</h1>
            <p className="req-title-sub">
              Student Company Work Experience Scheme (CIMS) — Mandatory Company
              Training
            </p>
          </div>

          {/* Ref / Date meta bar */}
          <div className="req-meta-bar">
            <div className="req-meta-item">
              <span className="req-meta-label">Form Ref. No.</span>
              <span
                className="req-meta-val"
                style={{
                  fontFamily: "'Courier New', monospace",
                  color: "#002B5B",
                  fontWeight: 700,
                }}
              >
                {ref}
              </span>
            </div>
            <div className="req-meta-divider" />
            <div className="req-meta-item">
              <span className="req-meta-label">Date Issued</span>
              <span className="req-meta-val">{fmt(today)}</span>
            </div>
            <div className="req-meta-divider" />
            <div className="req-meta-item">
              <span className="req-meta-label">Academic Session</span>
              <span className="req-meta-val">
                {today.getFullYear()}/{today.getFullYear() + 1}
              </span>
            </div>
          </div>

          {/* ── SECTION A: Student Bio-data ──────────────────────── */}
          <Section letter="A" title="Student Bio-data">
            <Field label="Full Name" value={student.name} />
            <Field
              label="Matric / Reg. Number"
              value={student.registrationNumber}
            />
            <Field label="Department" value={student.department} />
            <Field label="Programme" value={student.program} />
            <Field
              label="IT Status"
              value={student.itStatus.replace(/_/g, " ")}
            />
            <Field
              label="Level"
              value={
                student.program?.toLowerCase().includes("hnd")
                  ? "HND 2"
                  : "ND 2"
              }
            />
          </Section>

          {/* ── SECTION B: Placement / Company Details ───────────── */}
          <Section letter="B" title="Placement / Company Details">
            <Field
              label="Organisation / Company Name"
              value={placement.company}
              span2
            />
            <Field label="IT Position / Role" value={placement.position} />
            <Field label="Commencement Date" value={fmt(placement.startDate)} />
            <Field
              label="Expected Duration"
              value={
                progress.totalWeeks ? `${progress.totalWeeks} weeks` : undefined
              }
            />
            <Field label="Expected End Date" value={fmt(progress.endDate)} />
          </Section>

          {/* ── SECTION C: Supervisor Details ────────────────────── */}
          <Section letter="C" title="Supervisor Details">
            <Field
              label="Industry Supervisor Name"
              value={supervisors?.industrial?.name}
            />
            <Field
              label="Industry Supervisor Email"
              value={supervisors?.industrial?.email}
            />
            <Field
              label="Industry Supervisor Phone"
              value={supervisors?.industrial?.phone}
            />
            <Field
              label="School Supervisor Department"
              value={supervisors?.school?.department}
            />
            <Field
              label="School Supervisor Specialization"
              value={supervisors?.school?.specialization}
              span2
            />
          </Section>

          {/* ── SECTION D: Student Declaration ───────────────────── */}
          <div className="req-section">
            <div className="req-section-head">
              <div className="req-section-badge">D</div>
              <span className="req-section-title">Student Declaration</span>
              <div className="req-section-line" />
            </div>
            <div className="req-declaration">
              I, <strong>{student.name}</strong>, with Matric Number{" "}
              <strong>{student.registrationNumber}</strong>, a student of the
              Department of <strong>{student.department}</strong>, Federal
              Polytechnic Nekede, Owerri, hereby declare that all information
              provided in this form is true and correct to the best of my
              knowledge. I understand that any misrepresentation may lead to
              disciplinary action and/or cancellation of my Company Training
              (CT) placement. I further declare my full commitment to abide by
              the rules and regulations of the placement organisation and the
              CIMS Directorate throughout the duration of my clinical training.
            </div>
          </div>

          {/* ── Signature blocks ─────────────────────────────────── */}
          <div className="req-sig-grid">
            <div className="req-sig-block">
              <div className="req-sig-area" />
              <p className="req-sig-label">Student's Signature &amp; Date</p>
            </div>
            <div className="req-sig-block">
              <div className="req-sig-area" />
              <p className="req-sig-label">
                Industrial Supervisor's Signature, Stamp &amp; Date
              </p>
            </div>
            <div className="req-sig-block">
              <div className="req-sig-area" />
              <p className="req-sig-label">
                IPC / CIMS Officer's Signature &amp; Date
              </p>
            </div>
          </div>
        </div>

        {/* ── Footer ───────────────────────────────────────────── */}
        <div className="req-footer">
          <span>
            Ref: <span className="req-footer-id">{ref}</span>
          </span>
          <span>
            Holy Rosary Hospital College of Nursing Sciences, Emekuku — CIMS
            Directorate. All rights reserved.
          </span>
          <span>portal.fpno.edu.ng/siwes-verify</span>
        </div>
      </div>
    </div>
  );
};
