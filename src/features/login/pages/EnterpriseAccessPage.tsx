import { MonitorCheck } from "lucide-react";
import { Navigate } from "react-router-dom";
import { routes } from "../../../app/routers/routes";
import { useAuthStore } from "../../../app/store/authStore";
import { getRoleDashboardPath } from "../../../shared/utils/routeUtils";
import { LoginBackground, LoginBrandHeader, LoginCard } from "../components";

export function EnterpriseAccessPage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  if (!user) {
    return <Navigate to={routes.login} replace />;
  }

  if (user.mustChangePassword) {
    return <Navigate to={routes.changePassword} replace />;
  }

  if (user.role !== "enterprise") {
    return <Navigate to={getRoleDashboardPath(user.role)} replace />;
  }

  return (
    <section className="text-charcoal-800 relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#f8f9fa] p-6 font-['Bai_Jamjuree']">
      <LoginBackground />
      <LoginCard>
        <LoginBrandHeader />
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
          <div className="flex items-start gap-3">
            <span className="bg-tanaw-green flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white">
              <MonitorCheck size={18} />
            </span>
            <div>
              <h1 className="text-sm font-black text-slate-950">Enterprise Account Ready</h1>
              <p className="mt-2 text-xs leading-relaxed font-medium text-emerald-800">
                Your password has been updated. Use either your Enterprise ID or contact email with your new password to sign in to the TANAW Enterprise Desktop application.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 space-y-3 rounded-2xl border border-gray-100 bg-white p-4">
          <CredentialDetail label="Enterprise" value={user.enterpriseName ?? user.displayName} />
          <CredentialDetail label="Enterprise ID" value={user.enterpriseId ?? "Not assigned"} mono />
          <CredentialDetail label="Contact Email" value={user.email} mono />
        </div>
        <button
          type="button"
          onClick={logout}
          className="bg-tanaw-green mt-6 w-full rounded-2xl p-5 text-xs font-bold tracking-[0.2em] text-white uppercase shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] transition hover:-translate-y-px hover:bg-[#044a1e]"
        >
          Return to Login
        </button>
      </LoginCard>
    </section>
  );
}

function CredentialDetail({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">{label}</p>
      <p className={`mt-1 text-sm font-bold text-slate-900 ${mono ? "font-mono break-all" : ""}`}>{value}</p>
    </div>
  );
}
