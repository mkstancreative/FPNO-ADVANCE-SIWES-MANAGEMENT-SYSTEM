import { User, Clock } from "lucide-react";
import { formatDate } from "../../helpers/utilities";

interface StudentBannerProps {
  initials: string;
  name: string;
  regNumber?: string;
  department: string;
  program: string;
  position: string;
  placementDept?: string;
  evaluatorEmail?: string;
  expiresAt: string;
}

export function ISRStudentBanner({
  initials,
  name,
  regNumber,
  department,
  program,
  position,
  placementDept,
  evaluatorEmail,
  expiresAt,
}: StudentBannerProps) {
  return (
    <div className="isr-student-banner">
      <div className="isr-avatar">{initials}</div>
      <div className="isr-student-info">
        <div className="isr-student-reg">
          {name} {regNumber && `(${regNumber})`}
        </div>
        <div className="isr-student-meta">
          {department} · {program}
        </div>
        <div className="isr-student-placement">
          <User size={12} /> {position} {placementDept && `— ${placementDept}`}
        </div>
      </div>
      <div className="isr-token-info">
        {evaluatorEmail && (
          <>
            <div className="isr-token-label">Evaluator</div>
            <div className="isr-token-email">{evaluatorEmail}</div>
          </>
        )}
        <div className="isr-token-exp">
          <Clock size={11} /> Expires {formatDate(expiresAt)}
        </div>
      </div>
    </div>
  );
}
