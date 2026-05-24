import type { FormEvent } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../app/store/authStore";
import { getRoleDashboardPath } from "../../../shared/utils/routeUtils";
import { loginService } from "../services";

export function useLogin() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const clientId = String(formData.get("clientId") ?? "");
    const encryptionKey = String(formData.get("encryptionKey") ?? "");

    try {
      const session = await loginService({ clientId, encryptionKey });
      setSession(session);
      toast.success("Portal Initialized Successfully");
      navigate(getRoleDashboardPath(session.user.role), { replace: true });
    } catch {
      toast.error("Invalid username or password");
      return;
    }
  };

  return {
    handleLoginSubmit,
  };
}
