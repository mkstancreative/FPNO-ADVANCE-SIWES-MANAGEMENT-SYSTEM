import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Spinner from "../components/ui/Spinner/Spinner";
const NotFound = lazy(() => import("../pages/NotFound/NotFound"));
import DashBoardAdmin from "../pages/Admin/DashBoardAdmin";
import Supervisor from "../pages/Admin/Supervisor";
import Companies from "../pages/Admin/Companies";
import VerifiedCompanies from "../pages/Admin/VerifiedCompanies";
import Notifications from "../pages/Shared/Notifications";
import ChangePassword from "../pages/Shared/ChangePassword";
import UnAssignedStudents from "../pages/Admin/UnAssignedStudents";
import PartiallyVerified from "../pages/Admin/PartiallyVerified";

const Batches = lazy(() => import("../pages/Admin/Batches"));
const Students = lazy(() => import("../pages/Admin/Students"));
const AdminStudentView = lazy(
  () => import("../components/admin/view/AdminStudentView"),
);
const StudentProgress = lazy(
  () => import("../components/admin/view/StudentProgress"),
);
const AdminCertificates = lazy(
  () => import("../pages/Admin/AdminCertificates"),
);
const SystemSettings = lazy(() => import("../pages/Admin/SystemSettings"));
const Internships = lazy(() => import("../pages/Admin/Internships"));
const InternshipView = lazy(
  () => import("../components/admin/view/InternshipView"),
);

export default function AdminRoutes() {
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
        <Route path="dashboard" element={<DashBoardAdmin />} />
        {/* ── Setup ── */}
        <Route path="batches" element={<Batches />} />
        <Route path="students" element={<Students />} />
        <Route path="students/:id" element={<AdminStudentView />} />
        <Route path="students/:id/progress" element={<StudentProgress />} />
        <Route path="unassigned-students" element={<UnAssignedStudents />} />
        <Route path="internships" element={<Internships />} />
        <Route path="internships/:id" element={<InternshipView />} />

        {/* ── Future pages ── */}
        <Route path="supervisors" element={<Supervisor />} />
        <Route path="companies" element={<Companies />} />
        <Route
          path="partially-verified-companies"
          element={<PartiallyVerified />}
        />
        <Route path="verified-companies" element={<VerifiedCompanies />} />
        <Route path="certificates" element={<AdminCertificates />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="change-password" element={<ChangePassword />} />
        <Route path="settings" element={<SystemSettings />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
