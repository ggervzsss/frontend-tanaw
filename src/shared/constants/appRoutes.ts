export const appRoutes = {
  home: "/",
  login: "/login",
  it: {
    root: "/it",
    dashboard: "/it/dashboard",
  },
  admin: {
    root: "/admin",
    dashboard: "/admin/dashboard",
  },
  staff: {
    root: "/staff",
    dashboard: "/staff/dashboard",
  },
} as const;
