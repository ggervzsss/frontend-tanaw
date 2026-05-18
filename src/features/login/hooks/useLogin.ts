import type { FormEvent } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../app/store/authStore";
import { getRoleDashboardPath } from "../../../shared/utils/routeUtils";

export function useLogin() {
  const navigate = useNavigate();
  const loginWithClientId = useAuthStore((state) => state.loginWithClientId);

  const handleLoginSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const clientId = String(formData.get("clientId") ?? "");
    const matchedUser = loginWithClientId(clientId);

    if (!matchedUser) {
      toast.error("Invalid client identification");
      return;
    }

    toast.success("Portal Initialized Successfully");
    navigate(getRoleDashboardPath(matchedUser.role), { replace: true });
  };

  return {
    handleLoginSubmit,
  };
}
