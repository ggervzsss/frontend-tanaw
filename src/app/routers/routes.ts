export const routes = {
  home: "/",
  login: "/login",
  it: {
    root: "/it",
    dashboard: "/it/dashboard",
    lguAccounts: "/it/lgu-accounts",
    enterpriseAccounts: "/it/enterprise-accounts",
    alerts: "/it/alerts",
    systemLogs: "/it/system-logs",
    systemSettings: "/it/system-settings",
  },
  admin: {
    root: "/admin",
    mapview: "/admin/mapview",
    systemLogs: "/admin/system-logs",
    alertsMonitor: "/admin/alerts-monitor",
  },
  staff: {
    root: "/staff",
    batchReports: "/staff/batch-reports",
    finalReportsAudit: "/staff/final-reports-audit",
    analytics: "/staff/analytics",
  },
} as const;
