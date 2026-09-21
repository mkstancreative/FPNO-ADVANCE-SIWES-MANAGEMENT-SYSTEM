import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Spinner from "../components/ui/Spinner/Spinner";
const NotFound = lazy(() => import("../pages/NotFound/NotFound"));
import DashBoardAdmin from "../pages/Admin/DashBoardAdmin";
import AdminOnlyRoute from "./AdminOnlyRoute";
import { usePermissions } from "../hooks/usePermissions";
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
const StudentReportPage = lazy(
  () => import("../pages/Admin/StudentReportPage"),
);
const AdminCertificates = lazy(
  () => import("../pages/Admin/AdminCertificates"),
);
const DiscountStudents = lazy(() => import("../pages/Admin/DiscountStudents"));
const MispricedInvoices = lazy(
  () => import("../pages/Admin/MispricedInvoices"),
);
const RefundsAndBalances = lazy(
  () => import("../pages/Admin/RefundsAndBalances"),
);
const SystemSettings = lazy(() => import("../pages/Admin/SystemSettings"));
const UserAccounts = lazy(() => import("../pages/Admin/UserAccounts"));
const Staff = lazy(() => import("../pages/Admin/Staff"));
const DashBoardCoordinator = lazy(
  () => import("../pages/Admin/DashBoardCoordinator"),
);
const Internships = lazy(() => import("../pages/Admin/Internships"));
const InternshipView = lazy(
  () => import("../components/admin/view/InternshipView"),
);

export default function AdminRoutes() {
  // Admins and coordinators share these screens; the dashboard is the one
  // place the two roles want genuinely different things on arrival.
  const { canEdit } = usePermissions();
  const Dashboard = canEdit ? DashBoardAdmin : DashBoardCoordinator;

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
        <Route path="dashboard" element={<Dashboard />} />
        {/* ── Setup ── */}
        <Route path="batches" element={<Batches />} />
        <Route path="students" element={<Students />} />
        <Route path="students/:id" element={<AdminStudentView />} />
        <Route path="students/:id/progress" element={<StudentProgress />} />
        <Route path="students/:id/report" element={<StudentReportPage />} />
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
        <Route path="discounted-students" element={<DiscountStudents />} />
        <Route path="mispriced-invoices" element={<MispricedInvoices />} />
        <Route path="refunds-and-balances" element={<RefundsAndBalances />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="change-password" element={<ChangePassword />} />
        <Route
          path="user-accounts"
          element={
            <AdminOnlyRoute>
              <UserAccounts />
            </AdminOnlyRoute>
          }
        />
        <Route
          path="staff"
          element={
            <AdminOnlyRoute>
              <Staff />
            </AdminOnlyRoute>
          }
        />
        <Route
          path="settings"
          element={
            <AdminOnlyRoute>
              <SystemSettings />
            </AdminOnlyRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
