export type UserRole = "it" | "admin" | "staff" | "enterprise";

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  title: string;
  mustChangePassword: boolean;
  enterpriseId: string | null;
  enterpriseName: string | null;
};
