export const routes = {
  home: "/",
  login: "/login",
  it: {
    root: "/it",
    dashboard: "/it/dashboard",
  },
  admin: {
    root: "/admin",
    mapview: "/admin/mapview",
    systemLogs: "/admin/system-logs",
    alertsMonitor: "/admin/alerts-monitor",
  },
  staff: {
    root: "/staff",
    analytics: "/staff/analytics",
  },
} as const;
