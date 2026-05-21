import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser, UserRole } from "../../shared/types/role.types";

const IT_DEMO_USER: AuthUser = {
  id: "it_001",
  displayName: "Mike",
  role: "it",
  title: "IT Personnel",
};

const ADMIN_DEMO_USER: AuthUser = {
  id: "admin_001",
  displayName: "Jherico",
  role: "admin",
  title: "LGU Administrator",
};

const STAFF_DEMO_USER: AuthUser = {
  id: "staff_001",
  displayName: "Marianne",
  role: "staff",
  title: "Tourism Staff",
};

const ROLE_USERS: Record<UserRole, AuthUser> = {
  it: IT_DEMO_USER,
  admin: ADMIN_DEMO_USER,
  staff: STAFF_DEMO_USER,
};

const MOCK_USERS_BY_ID: Record<string, AuthUser> = {
  [IT_DEMO_USER.id]: IT_DEMO_USER,
  [ADMIN_DEMO_USER.id]: ADMIN_DEMO_USER,
  [STAFF_DEMO_USER.id]: STAFF_DEMO_USER,
};

type AuthState = {
  user: AuthUser | null;
  loginAsRole: (role: UserRole) => void;
  loginWithClientId: (clientId: string) => AuthUser | null;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loginAsRole: (role) => set({ user: ROLE_USERS[role] }),
      loginWithClientId: (clientId) => {
        const normalizedClientId = clientId.trim().toLowerCase();
        const matchedUser = MOCK_USERS_BY_ID[normalizedClientId] ?? null;

        if (matchedUser) {
          set({ user: matchedUser });
        }

        return matchedUser;
      },
      logout: () => set({ user: null }),
      hasRole: (roles) => {
        const user = get().user;
        return Boolean(user && roles.includes(user.role));
      },
    }),
    {
      name: "tanaw-auth",
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
