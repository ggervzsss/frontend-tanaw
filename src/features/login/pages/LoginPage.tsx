import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { routes } from "../../../app/routers/routes";
import { useAuthStore } from "../../../app/store/authStore";
import { getRoleDashboardPath } from "../../../shared/utils/routeUtils";
import { LoginBackground, LoginBrandHeader, LoginCard, LoginForm } from "../components";
import { useLogin } from "../hooks";

export function LoginPage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { handleLoginSubmit } = useLogin();

  useEffect(() => {
    if (user?.role === "enterprise") {
      logout();
    }
  }, [logout, user?.role]);

  if (user?.role === "enterprise") {
    return null;
  }

  if (user) {
    if (user.mustChangePassword) {
      return <Navigate to={routes.changePassword} replace />;
    }
    return <Navigate to={getRoleDashboardPath(user.role)} replace />;
  }

  return (
    <section className="text-charcoal-800 relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#f8f9fa] p-6 font-['Bai_Jamjuree']">
      <LoginBackground />
      <LoginCard>
        <LoginBrandHeader />
        <LoginForm onSubmit={handleLoginSubmit} />
      </LoginCard>
    </section>
  );
}
