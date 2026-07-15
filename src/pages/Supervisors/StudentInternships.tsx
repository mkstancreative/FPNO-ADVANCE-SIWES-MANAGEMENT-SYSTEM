import {
  Briefcase,
  Calendar,
  Building2,
  User,
  ChevronRight,
  BookOpen,
  ArrowLeft,
} from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useInternships } from "../../hooks/useInternships";
import StatusBadge from "../../components/ui/StatusBadge/StatusBadge";
import { formatDate } from "../../helpers/utilities";
import type { Internship } from "../../api/types/internship";
import "../../components/supervisor/views/StudentsInternShips.css";

function InternshipCard({
  internship,
  onViewProfile,
  onViewLogbooks,
}: {
  internship: Internship;
  onViewProfile: (studentId: string) => void;
  onViewLogbooks: (
    studentId: string,
    batchId: string,
    internshipId: string,
  ) => void;
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

      <div className="si-card-actions">
        <button
          className="si-view-btn"
          onClick={() => onViewProfile(studentId)}
        >
          <User size={13} />
          View Profile
          <ChevronRight size={13} />
        </button>

        <button
          type="button"
          className="si-logbooks-btn"
          onClick={() =>
            onViewLogbooks(studentId, batch?._id ?? "", internship._id)
          }
        >
          <BookOpen size={13} />
          View Logbooks
        </button>
      </div>
    </div>
  );
}

export default function StudentInternships() {
  const { studentId } = useParams<{ studentId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const studentName = searchParams.get("name") ?? "";

  const { data, isLoading } = useInternships({
    studentId,
    isCurrent: true,
    limit: 20,
  });

  const internships = data?.data ?? [];

  const handleViewProfile = (sid: string) => {
    navigate(`/supervisor/students/${sid}`);
  };

  const handleViewLogbooks = (sid: string, bid: string, iid: string) => {
    navigate(
      `/supervisor/students/${sid}/logbooks?batchId=${bid}&internshipId=${iid}`,
    );
  };

  return (
    <div className="page-container">
      {/* ── Back button ── */}
      <div className="page-header-left" style={{ marginBottom: 8 }}>
        <button
          className="dash-btn dash-btn--ghost"
          onClick={() => navigate("/supervisor/assigned-students")}
        >
          <ArrowLeft size={15} /> Assigned Students
        </button>
      </div>

      {/* ── Page header ── */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon orange">
            <Briefcase size={20} />
          </div>
          <div>
            <h2 className="page-title">
              {studentName
                ? `${studentName}'s Internships`
                : "Student Internships"}
            </h2>
            <p className="page-sub">
              {internships.length} internship record
              {internships.length !== 1 ? "s" : ""} found
            </p>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      {isLoading ? (
        <div className="si-loading">
          {[1, 2, 3].map((i) => (
            <div key={i} className="si-skel" />
          ))}
        </div>
      ) : internships.length === 0 ? (
        <div className="si-empty">
          <Briefcase size={48} />
          <p>No internship records found for this student.</p>
        </div>
      ) : (
        <div className="si-list" style={{ marginTop: 16 }}>
          {internships.map((internship) => (
            <InternshipCard
              key={internship._id}
              internship={internship}
              onViewProfile={handleViewProfile}
              onViewLogbooks={handleViewLogbooks}
            />
          ))}
        </div>
      )}
    </div>
  );
}
