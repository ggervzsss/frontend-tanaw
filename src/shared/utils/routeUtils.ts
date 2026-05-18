import { appRoutes } from "../constants/appRoutes";
import type { UserRole } from "../types/role.types";

export function getRoleDashboardPath(role: UserRole): string {
  if (role === "admin") return appRoutes.admin.dashboard;
  if (role === "staff") return appRoutes.staff.dashboard;
  return appRoutes.it.dashboard;
}
