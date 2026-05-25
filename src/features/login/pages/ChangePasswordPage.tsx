import { type FormEvent, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Navigate, useNavigate } from "react-router-dom";
import { KeyRound } from "lucide-react";
import { routes } from "../../../app/routers/routes";
import { useAuthStore } from "../../../app/store/authStore";
import { changePassword } from "../../../shared/services/accountManagement";
import { getRoleDashboardPath } from "../../../shared/utils/routeUtils";
import { LoginBackground, LoginBrandHeader, LoginCard } from "../components";

export function ChangePasswordPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const setSession = useAuthStore((state) => state.setSession);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) {
    return <Navigate to={routes.login} replace />;
  }

  if (user.role === "enterprise") {
    return <Navigate to={routes.login} replace />;
  }

  if (!user.mustChangePassword) {
    return <Navigate to={getRoleDashboardPath(user.role)} replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const currentPassword = String(formData.get("currentPassword") ?? "");
    const newPassword = String(formData.get("newPassword") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      const session = await changePassword(currentPassword, newPassword);
      queryClient.removeQueries({ queryKey: ["current-user"] });
      setSession(session);
      toast.success("Password updated");
      navigate(getRoleDashboardPath(session.user.role), { replace: true });
    } catch {
      toast.error("Unable to update password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="text-charcoal-800 relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#f8f9fa] p-6 font-['Bai_Jamjuree']">
      <LoginBackground />
      <LoginCard>
        <LoginBrandHeader />
        <div className="mb-6 rounded-2xl border border-amber-100 bg-amber-50 p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white">
              <KeyRound size={17} />
            </span>
            <div>
              <h1 className="text-sm font-black text-slate-950">Change Temporary Password</h1>
              <p className="mt-1 text-xs font-medium text-amber-800">Set a private password before continuing.</p>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <PasswordField label="Current Temporary Password" name="currentPassword" />
          <PasswordField label="New Password" name="newPassword" />
          <PasswordField label="Confirm New Password" name="confirmPassword" />
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-tanaw-green mt-2 w-full rounded-2xl p-5 text-xs font-bold tracking-[0.2em] text-white uppercase shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] transition hover:-translate-y-px hover:bg-[#044a1e] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Updating..." : "Update Password"}
          </button>
        </form>
      </LoginCard>
    </section>
  );
}

function PasswordField({ label, name }: { label: string; name: string }) {
  return (
    <label className="mb-5 block">
      <span className="mb-1 block text-[10px] font-bold tracking-widest text-[#9ca3af] uppercase">{label}</span>
      <input
        name={name}
        type="password"
        minLength={8}
        required
        className="text-charcoal-800 w-full rounded-2xl border border-[#f3f4f6] bg-[#f9fafb] px-5 py-4 text-sm font-semibold transition-shadow outline-none focus:shadow-[0_0_0_2px_#055b25]"
      />
    </label>
  );
}
