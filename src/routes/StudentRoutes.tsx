import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Spinner from "../components/ui/Spinner/Spinner";
const NotFound = lazy(() => import("../pages/NotFound/NotFound"));

import DashBoardStudent from "../pages/Students/DashBoardStudent";
import LogBook from "../pages/Students/LogBook";
import Placement from "../pages/Students/Placement";
import MyProfile from "../pages/Students/MyProfile";
import Report from "../pages/Students/Report";
import AvailableCompanies from "../pages/Students/AvailableCompanies";
import InternshipHistory from "../pages/Students/InternshipHistory";
import Notifications from "../pages/Shared/Notifications";
const PaymentSuccess = lazy(() => import("../pages/Students/PaymentSuccess"));
const PaymentFailed = lazy(() => import("../pages/Students/PaymentFailed"));

export default function StudentRoutes() {
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
          <Spinner size={30} color="var(--color-accent)" text="Loading..." />
        </div>
      }
    >
      <Routes>
        {/* Default → dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashBoardStudent />} />
        <Route path="logbook" element={<LogBook />} />
        <Route path="placement" element={<Placement />} />
        <Route path="profile" element={<MyProfile />} />
        <Route path="report" element={<Report />} />
        <Route path="companies" element={<AvailableCompanies />} />
        <Route path="internships" element={<InternshipHistory />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="payment/success" element={<PaymentSuccess />} />
        <Route path="payment/failed" element={<PaymentFailed />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
