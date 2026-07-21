import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Spinner from "../components/ui/Spinner/Spinner";
const NotFound = lazy(() => import("../pages/NotFound/NotFound"));
const StudentReportPage = lazy(
  () => import("../pages/Admin/StudentReportPage"),
);

import AssignedStudents from "../pages/Supervisors/AssignedStudents";
import DashBoardSupervisor from "../pages/Supervisors/DashBoardSupervisor";
import StudentLogBooks from "../pages/Supervisors/StudentLogBooks";
import StudentInternships from "../pages/Supervisors/StudentInternships";
import AssignedStudentLogBookView from "../components/supervisor/views/AssignedStudentLogBookView";
import StudentsEvaluations from "../pages/Supervisors/StudentsEvaluations";
import EvaluationReportPage from "../pages/Supervisors/EvaluationReportPage";
import Notifications from "../pages/Shared/Notifications";
import ChangePassword from "../pages/Shared/ChangePassword";
import AssignedStudentPage from "../pages/Supervisors/AssignedStudentPage";

export default function SupervisorRoutes() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            height: "60vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Spinner
            size={30}
            color="var(--color-accent)"
            text="Loading module..."
          />
        </div>
      }
    >
      <Routes>
        {/* Default → dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />

        {/* Supervisor routes */}
        <Route path="dashboard" element={<DashBoardSupervisor />} />
        <Route path="assigned-students" element={<AssignedStudents />} />
        <Route
          path="students/:studentId/internships"
          element={<StudentInternships />}
        />
        <Route path="students/:studentId" element={<AssignedStudentPage />} />
        <Route
          path="students/:studentId/report"
          element={<StudentReportPage />}
        />

        {/* Logbook routes */}
        <Route
          path="students/:studentId/logbooks"
          element={<StudentLogBooks />}
        />
        <Route
          path="students/:studentId/logbooks/:logbookId"
          element={<AssignedStudentLogBookView />}
        />

        {/* Evaluation routes */}
        <Route path="students-evaluations" element={<StudentsEvaluations />} />
        <Route path="evaluation-report" element={<EvaluationReportPage />} />

        {/* Notifications */}
        <Route path="notifications" element={<Notifications />} />
        <Route path="change-password" element={<ChangePassword />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
