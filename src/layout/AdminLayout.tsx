import DashBoardLayout from "../components/layout/DashBoardLayout";
import AdminRoutes from "../routes/AdminRoutes";
import { usePermissions } from "../hooks/usePermissions";

export default function AdminLayout() {
  // Coordinators share these screens with admins, so the shell has to name the
  // role it is actually serving rather than assuming the admin.
  const { canEdit } = usePermissions();

  return (
    <DashBoardLayout
      pageTitle={canEdit ? "Admin Dashboard" : "Coordinator Dashboard"}
    >
      <AdminRoutes />
    </DashBoardLayout>
  );
}
