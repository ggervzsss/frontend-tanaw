import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "../../features/login";
import { appRoutes } from "../../shared/constants/appRoutes";
import { getRoleDashboardPath } from "../../shared/utils/routeUtils";
import { useAuthStore } from "../store/authStore";
import { ProtectedRoute } from "./ProtectedRoute";

function RootRedirect() {
  const user = useAuthStore((state) => state.user);
  return <Navigate to={user ? getRoleDashboardPath(user.role) : appRoutes.login} replace />;
}

function AccountPlaceholder() {
  const user = useAuthStore((state) => state.user);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f9fa] p-6 font-['Bai_Jamjuree'] text-charcoal-800">
      <section className="w-full max-w-md rounded-[28px] border-t-8 border-t-tanaw-lime bg-white p-8 text-center shadow-[0_25px_50px_-12px_rgba(0,0,0,0.18)]">
        <p className="mb-2 text-[10px] font-bold tracking-[0.3em] text-[#9ca3af] uppercase">Portal Initialized</p>
        <h1 className="font-['Montserrat'] text-2xl font-extrabold text-tanaw-green">{user?.displayName}</h1>
        <p className="mt-2 text-sm font-semibold text-charcoal-800">{user?.title}</p>
      </section>
    </main>
  );
}

export function AppRouter() {
  return (
    <Routes>
      <Route path={appRoutes.home} element={<RootRedirect />} />
      <Route path={appRoutes.login} element={<LoginPage />} />

      <Route
        path={appRoutes.it.dashboard}
        element={
          <ProtectedRoute allowedRoles={["it"]}>
            <AccountPlaceholder />
          </ProtectedRoute>
        }
      />
      <Route
        path={appRoutes.admin.dashboard}
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AccountPlaceholder />
          </ProtectedRoute>
        }
      />
      <Route
        path={appRoutes.staff.dashboard}
        element={
          <ProtectedRoute allowedRoles={["staff"]}>
            <AccountPlaceholder />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}
