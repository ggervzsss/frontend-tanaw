import { Navigate, Route, Routes } from "react-router-dom";
import { StaffAnalyticsPage } from "../../features/analytics";
import { ITDashboardPage } from "../../features/dashboard";
import { LoginPage } from "../../features/login";
import { AdminMapViewPage } from "../../features/mapview";
import { AccountLayout } from "../../shared/components/layout";
import { getRoleDashboardPath } from "../../shared/utils/routeUtils";
import { useAuthStore } from "../store/authStore";
import { ProtectedRoute } from "./ProtectedRoute";
import { routes } from "./routes";

function RootRedirect() {
  const user = useAuthStore((state) => state.user);
  return <Navigate to={user ? getRoleDashboardPath(user.role) : routes.login} replace />;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path={routes.home} element={<RootRedirect />} />
      <Route path={routes.login} element={<LoginPage />} />

      <Route
        path={routes.it.root}
        element={
          <ProtectedRoute allowedRoles={["it"]}>
            <AccountLayout role="it" />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to={routes.it.dashboard} replace />} />
        <Route path="dashboard" element={<ITDashboardPage />} />
      </Route>

      <Route
        path={routes.admin.root}
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AccountLayout role="admin" />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to={routes.admin.mapview} replace />} />
        <Route path="mapview" element={<AdminMapViewPage />} />
      </Route>

      <Route
        path={routes.staff.root}
        element={
          <ProtectedRoute allowedRoles={["staff"]}>
            <AccountLayout role="staff" />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to={routes.staff.analytics} replace />} />
        <Route path="analytics" element={<StaffAnalyticsPage />} />
      </Route>

      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}
