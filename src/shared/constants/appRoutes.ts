export const appRoutes = {
  home: "/",
  login: "/login",
  it: {
    root: "/it",
    dashboard: "/it/dashboard",
  },
  admin: {
    root: "/admin",
    mapview: "/admin/mapview",
  },
  staff: {
    root: "/staff",
    analytics: "/staff/analytics",
  },
} as const;
