import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import type { UserRole } from "../../shared/types/role.types";
import { appRoutes } from "../../shared/constants/appRoutes";
import { useAuthStore } from "../store/authStore";

type ProtectedRouteProps = {
  allowedRoles: UserRole[];
  children: ReactNode;
};

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const user = useAuthStore((state) => state.user);

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={appRoutes.login} replace />;
  }

  return children;
}
