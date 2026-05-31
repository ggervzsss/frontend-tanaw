import type { FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/app/store/authStore";
import { getRoleDashboardPath } from "@/shared/utils/routeUtils";
import { loginService } from "../services";

export function useLogin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setSession = useAuthStore((state) => state.setSession);

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const clientId = String(formData.get("clientId") ?? "");
    const encryptionKey = String(formData.get("encryptionKey") ?? "");
    const rememberMe = formData.get("rememberMe") === "on";

    try {
      const session = await loginService({ clientId, encryptionKey });
      queryClient.removeQueries({ queryKey: ["current-user"] });
      setSession(session, rememberMe);
      if (session.user.mustChangePassword) {
        toast.success("Temporary credentials verified");
        navigate("/change-password", { replace: true });
        return;
      }
      toast.success("Portal Initialized Successfully");
      navigate(getRoleDashboardPath(session.user.role), { replace: true });
    } catch {
      toast.error("Invalid email or password");
      return;
    }
  };

  return {
    handleLoginSubmit,
  };
}
