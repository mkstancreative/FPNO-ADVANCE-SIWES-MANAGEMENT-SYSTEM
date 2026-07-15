import {
  Briefcase,
  Calendar,
  Building2,
  User,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useInternships } from "../../../hooks/useInternships";
import CustomModal from "../../ui/CustomModal/CustomModal";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";
import { formatDate } from "../../../helpers/utilities";
import type { Internship } from "../../../api/types/internship";
import "./StudentsInternShips.css";

interface StudentsInternShipsProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName?: string;
}

function InternshipCard({
  internship,
  onViewProfile,
}: {
  internship: Internship;
  onViewProfile: (studentId: string) => void;
}) {
  const batch =
    internship.batch && typeof internship.batch === "object"
      ? (internship.batch as { _id: string; name: string; session: string })
      : null;

  const studentId =
    internship.student && typeof internship.student === "object"
      ? (internship.student as { _id: string })._id
      : (internship.student as string);

  return (
    <div className="si-card">
      <div className="si-card-header">
        <div className="si-card-title">
          <Building2 size={15} />
          <span>{batch?.name ?? "Internship"}</span>
        </div>
        <StatusBadge status={internship.itStatus} />
      </div>

      <div className="si-card-body">
        {batch && (
          <div className="si-row">
            <span className="si-label">Session</span>
            <span className="si-value">{batch.session}</span>
          </div>
        )}

        {internship.itPeriod && (
          <>
            <div className="si-row">
              <span className="si-label">
                <Calendar size={12} /> Start
              </span>
              <span className="si-value">
                {formatDate(internship.itPeriod.startDate)}
              </span>
            </div>
            <div className="si-row">
              <span className="si-label">
                <Calendar size={12} /> End
              </span>
              <span className="si-value">
                {formatDate(internship.itPeriod.endDate)}
              </span>
            </div>
            <div className="si-row">
              <span className="si-label">Duration</span>
              <span className="si-value">
                {internship.itPeriod.expectedDuration} weeks
              </span>
            </div>
          </>
        )}

        {internship.placement && (
          <div className="si-row">
            <span className="si-label">
              <Briefcase size={12} /> Placement
            </span>
            <span className="si-value">
              <StatusBadge status={internship.placement.status} />
            </span>
          </div>
        )}

        {internship.isCurrent && (
          <div className="si-row">
            <span className="si-label" />
            <span className="si-current-badge">Current Internship</span>
          </div>
        )}
      </div>

      {/* ── Navigate to full student profile page ── */}
      <button className="si-view-btn" onClick={() => onViewProfile(studentId)}>
        <User size={13} />
        View Student Profile
        <ChevronRight size={13} />
      </button>
    </div>
  );
}

export default function StudentsInternShips({
  isOpen,
  onClose,
  studentId,
  studentName,
}: StudentsInternShipsProps) {
  const navigate = useNavigate();

  // ── Fetch this student's internships ────────────────────────────────────────
  const { data, isLoading } = useInternships({
    studentId,
    isCurrent: true,
    limit: 20,
  });

  const internships = data?.data ?? [];

  const handleViewProfile = (sid: string) => {
    onClose(); // close modal first
    navigate(`/supervisor/students/${sid}`);
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        studentName ? `${studentName}'s Internships` : "Student Internships"
      }
      subtitle={`${internships.length} internship record${internships.length !== 1 ? "s" : ""} found`}
      icon={<Briefcase size={16} />}
      size="wide"
      placement="top"
    >
      {isLoading ? (
        <div className="si-loading">
          {[1, 2].map((i) => (
            <div key={i} className="si-skel" />
          ))}
        </div>
      ) : internships.length === 0 ? (
        <div className="si-empty">
          <Briefcase size={32} />
          <p>No internship records found for this student.</p>
        </div>
      ) : (
        <div className="si-list">
          {internships.map((internship) => (
            <InternshipCard
              key={internship._id}
              internship={internship}
              onViewProfile={handleViewProfile}
            />
          ))}
        </div>
      )}
    </CustomModal>
  );
}
