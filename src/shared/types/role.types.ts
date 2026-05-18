export type UserRole = "it" | "admin" | "staff";

export type AuthUser = {
  id: string;
  displayName: string;
  role: UserRole;
  title: string;
};
