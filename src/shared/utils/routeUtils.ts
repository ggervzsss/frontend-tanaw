import { routes } from "../../app/routers/routes";
import type { UserRole } from "../types/role.types";

export function getRoleDashboardPath(role: UserRole): string {
  if (role === "admin") return routes.admin.mapview;
  if (role === "staff") return routes.staff.analytics;
  return routes.it.dashboard;
}
