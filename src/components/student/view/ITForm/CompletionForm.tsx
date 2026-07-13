import type {
  StudentDashStudent,
  StudentDashPlacement,
  StudentDashSupervisors,
  StudentDashProgress,
} from "../../../../api/types/dashboard";
import "./ITForm.css";

// ── helpers ────────────────────────────────────────────────────────────────────
const fmt = (d: string | null | undefined) =>
  d
    ? new Date(d).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "_______________";

const fmtShort = (d: string | null | undefined) =>
  d
    ? new Date(d).toLocaleDateString("en-NG", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "_______________";

const year = (d: string | null | undefined) =>
  d ? new Date(d).getFullYear().toString() : "20__";

/** Deterministic certificate ID from matric number */
const certId = (reg: string) => {
  const dept = reg.split("/")[0]?.toUpperCase() ?? "DEPT";
  const seq = reg.replace(/\D/g, "").slice(-6).padStart(6, "0");
  return { prefix: `FPNO/CIMS/2026/ND2/${dept}/`, seq };
};

// ── Props ──────────────────────────────────────────────────────────────────────
interface Props {
  student: StudentDashStudent;
  placement: StudentDashPlacement;
  supervisors: StudentDashSupervisors;
  progress: StudentDashProgress;
}

// ── Component ──────────────────────────────────────────────────────────────────
export const CompletionForm = ({
  student,
  placement,
  supervisors,
  progress,
}: Props) => {
  const today = new Date();
  const todayStr = today.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const id = certId(student.registrationNumber);

  return (
    <div className="cert-page">
      <div className="cert-frame">
        {/* corner ornaments */}
        <div className="cert-corner-tr" />
        <div className="cert-corner-bl" />

        {/* ── Gradient Header Band ─────────────────────────────── */}
        <div className="cert-header-band">
          {/* Left logo */}
          <div className="cert-logo-circle">
            <span className="cert-logo-text">FPNO</span>
            <span className="cert-logo-subtext">FED. POLY NEKEDE</span>
          </div>

          <div className="cert-header-center">
            <p className="cert-school-name">
              Holy Rosary Hospital College of Nursing Sciences
            </p>
            <p className="cert-school-sub">
              PMB 1036 Owerri – Imo State, Nigeria
            </p>
            <p className="cert-dept-name">Clinical Placement Centre</p>
            <p className="cert-dept-sub">(CIMS Directorate)</p>
          </div>

          {/* Right logo */}
          <div className="cert-logo-circle cert-logo-circle--nbte">
            <span className="cert-logo-text">NBTE</span>
            <span className="cert-logo-subtext">ACCREDITED</span>
          </div>
        </div>

        {/* orange ribbon */}
        <div className="cert-ribbon" />

        {/* ── Body ─────────────────────────────────────────────── */}
        <div className="cert-body-wrap">
          {/* watermark */}
          <div className="cert-watermark">COMPLETION CERTIFICATE</div>

          {/* date */}
          <div className="cert-date-row">
            <span>
              Date: <span className="cert-date-val">{todayStr}</span>
            </span>
          </div>

          {/* title */}
          <div className="cert-title-block">
            <h1 className="cert-title">Completion Certificate</h1>
            <p className="cert-title-sub">
              Mandatory Clinical Training (ND2 / HND2) Graduates
            </p>
          </div>

          {/* body text */}
          <div className="cert-body">
            <p className="cert-para">
              This is to certify that{" "}
              <span className="cert-fill cert-fill--wide">{student.name}</span>
            </p>
            <p className="cert-para">
              with matriculation number{" "}
              <span className="cert-fill cert-fill--wide">
                {student.registrationNumber}
              </span>
            </p>
            <p className="cert-para">
              from the Department of{" "}
              <span className="cert-fill cert-fill--wide">
                {student.department}
              </span>
            </p>
            <p className="cert-para">
              Holy Rosary Hospital College of Nursing Sciences has undergone a
              mandatory Clinical Training in our organisation under{" "}
              <span className="cert-fill cert-fill--md">
                {placement.position || ""}
              </span>{" "}
              ................................................................
              Department
            </p>
            <p className="cert-para">
              from{" "}
              <span className="cert-fill cert-fill--md">
                {fmtShort(progress.startDate)}
              </span>
              &nbsp;{year(progress.startDate)}&nbsp; ..........&nbsp; to{" "}
              <span className="cert-fill cert-fill--md">
                {fmtShort(progress.endDate)}
              </span>
              &nbsp;{year(progress.endDate)}&nbsp; ..........
            </p>
            <p className="cert-para cert-para--spaced">
              During the period, the student was attached to our Department and
              gained practical experiences and professional skills. We are
              pleased to confirm that he/she has successfully completed the
              mandatory training (minimum 9 months) and has demonstrated a good
              understanding of the required competencies.
            </p>
            <p className="cert-para cert-para--spaced">
              Please kindly give him/her the necessary cooperation and
              assistance he/she may require.
            </p>
          </div>

          {/* ── Signatures ──────────────────────────────────────── */}
          <div className="cert-sig-row">
            {/* Director */}
            <div className="cert-sig-block">
              <p className="cert-sig-title">Director, IPC/CIMS</p>
              <div className="cert-sig-underline" />
              <p className="cert-sig-director">Dr. Ijeoma Emeagi</p>
            </div>

            {/* Industry supervisor */}
            <div className="cert-sig-block cert-sig-block--right">
              <p className="cert-sig-title">Industry-Based Supervisor</p>

              <div className="cert-sig-line">
                <span className="cert-sig-line-label">Name:</span>
                {supervisors?.industrial?.name ? (
                  <span className="cert-sig-filled">
                    {supervisors.industrial.name}
                  </span>
                ) : (
                  <span className="cert-sig-blank" />
                )}
              </div>

              <div className="cert-sig-line">
                <span className="cert-sig-line-label">
                  Signature &amp; Stamp:
                </span>
                <span className="cert-sig-blank" />
              </div>

              <div className="cert-sig-line">
                <span className="cert-sig-line-label">Date:</span>
                <span className="cert-sig-filled">{todayStr}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Official stamp band ───────────────────────────────── */}
        <div className="cert-stamp-band">
          OFFICIAL DOCUMENT — Holy Rosary Hospital College of Nursing Sciences CIMS Directorate
        </div>

        {/* ── Footer ───────────────────────────────────────────── */}
        <div className="cert-footer">
          <div className="cert-footer-left">
            <p className="cert-cert-id-label">Certificate ID</p>
            <p className="cert-cert-id">
              {id.prefix}
              <span className="cert-cert-id-highlight">{id.seq}</span>
            </p>
            <p className="cert-valid-note">
              This certificate is valid only when endorsed and stamped by the
              Industry-Based Supervisor and is verifiable via QR code.
            </p>
          </div>

          <div className="cert-footer-right">
            <div className="cert-qr-box">
              <div className="cert-qr-inner">QR</div>
            </div>
            <p className="cert-verify-url">
              Verify at: portal.fpno.edu.ng/siwes-verify
            </p>
          </div>
        </div>

        {/* sidebar */}
        <div className="cert-issued-sidebar">
          Issued this {fmt(progress.endDate)}
        </div>
      </div>
    </div>
  );
};
