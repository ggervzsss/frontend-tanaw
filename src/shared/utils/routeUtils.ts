import { appRoutes } from "../constants/appRoutes";
import type { UserRole } from "../types/role.types";

export function getRoleDashboardPath(role: UserRole): string {
  if (role === "admin") return appRoutes.admin.mapview;
  if (role === "staff") return appRoutes.staff.analytics;
  return appRoutes.it.dashboard;
}
