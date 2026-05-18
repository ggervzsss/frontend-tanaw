import { BarChart3, LayoutDashboard, MapPinned } from "lucide-react";
import type { ComponentType } from "react";
import { appRoutes } from "../../constants/appRoutes";
import type { UserRole } from "../../types/role.types";

export type NavigationItem = {
  id: string;
  label: string;
  path: string;
  icon: ComponentType<{ size?: number; className?: string }>;
};

export const roleNavigation: Record<UserRole, NavigationItem[]> = {
  admin: [
    {
      id: "mapview",
      label: "Map View",
      path: appRoutes.admin.mapview,
      icon: MapPinned,
    },
  ],
  staff: [
    {
      id: "analytics",
      label: "Comparative Analytics",
      path: appRoutes.staff.analytics,
      icon: BarChart3,
    },
  ],
  it: [
    {
      id: "dashboard",
      label: "Dashboard",
      path: appRoutes.it.dashboard,
      icon: LayoutDashboard,
    },
  ],
};

export const rolePortalLabel: Record<UserRole, string> = {
  admin: "Admin Portal",
  staff: "Staff Portal",
  it: "IT Portal",
};

export const roleAccessLabel: Record<UserRole, string> = {
  admin: "Supervisory Access",
  staff: "Processing Access",
  it: "Technical Access",
};
