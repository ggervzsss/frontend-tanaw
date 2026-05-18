import { BarChart3, Bell, FileCheck2, FileText, Layers, LayoutDashboard, MapPinned } from "lucide-react";
import type { ComponentType } from "react";
import { routes } from "../../../app/routers/routes";
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
      path: routes.admin.mapview,
      icon: MapPinned,
    },
    {
      id: "system-logs",
      label: "System Logs",
      path: routes.admin.systemLogs,
      icon: FileText,
    },
    {
      id: "alerts-monitor",
      label: "Alerts & Monitor",
      path: routes.admin.alertsMonitor,
      icon: Bell,
    },
  ],
  staff: [
    {
      id: "analytics",
      label: "Comparative Analytics",
      path: routes.staff.analytics,
      icon: BarChart3,
    },
    {
      id: "batch-reports",
      label: "Batch Reports",
      path: routes.staff.batchReports,
      icon: Layers,
    },
    {
      id: "final-reports-audit",
      label: "Final Reports Audit",
      path: routes.staff.finalReportsAudit,
      icon: FileCheck2,
    },
  ],
  it: [
    {
      id: "dashboard",
      label: "Dashboard",
      path: routes.it.dashboard,
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
