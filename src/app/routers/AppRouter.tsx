import { Navigate, Route, Routes } from "react-router-dom";
import { StaffAnalyticsPage } from "../../features/analytics";
import { ITDashboardPage } from "../../features/dashboard";
import { LoginPage } from "../../features/login";
import { AdminMapViewPage } from "../../features/mapview";
import { AccountLayout } from "../../shared/components/layout";
import { appRoutes } from "../../shared/constants/appRoutes";
import { getRoleDashboardPath } from "../../shared/utils/routeUtils";
import { useAuthStore } from "../store/authStore";
import { ProtectedRoute } from "./ProtectedRoute";

function RootRedirect() {
  const user = useAuthStore((state) => state.user);
  return <Navigate to={user ? getRoleDashboardPath(user.role) : appRoutes.login} replace />;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path={appRoutes.home} element={<RootRedirect />} />
      <Route path={appRoutes.login} element={<LoginPage />} />

      <Route
        path={appRoutes.it.root}
        element={
          <ProtectedRoute allowedRoles={["it"]}>
            <AccountLayout role="it" />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to={appRoutes.it.dashboard} replace />} />
        <Route path="dashboard" element={<ITDashboardPage />} />
      </Route>

      <Route
        path={appRoutes.admin.root}
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AccountLayout role="admin" />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to={appRoutes.admin.mapview} replace />} />
        <Route path="mapview" element={<AdminMapViewPage />} />
      </Route>

      <Route
        path={appRoutes.staff.root}
        element={
          <ProtectedRoute allowedRoles={["staff"]}>
            <AccountLayout role="staff" />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to={appRoutes.staff.analytics} replace />} />
        <Route path="analytics" element={<StaffAnalyticsPage />} />
      </Route>

      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}
