import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../../app/store/authStore";
import { getRoleDashboardPath } from "../../../shared/utils/routeUtils";
import { LoginBackground, LoginBrandHeader, LoginCard, LoginForm } from "../components";
import { useLogin } from "../hooks";

export function LoginPage() {
  const user = useAuthStore((state) => state.user);
  const { handleLoginSubmit } = useLogin();

  if (user) {
    return <Navigate to={getRoleDashboardPath(user.role)} replace />;
  }

  return (
    <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#f8f9fa] p-6 font-['Bai_Jamjuree'] text-charcoal-800">
      <LoginBackground />
      <LoginCard>
        <LoginBrandHeader />
        <LoginForm onSubmit={handleLoginSubmit} />
      </LoginCard>
    </section>
  );
}
