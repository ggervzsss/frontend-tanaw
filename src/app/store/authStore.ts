import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser, UserRole } from "../../shared/types/role.types";

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  setSession: (session: { token: string; user: AuthUser }) => void;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setSession: (session) => set({ token: session.token, user: session.user }),
      logout: () => set({ token: null, user: null }),
      hasRole: (roles) => {
        const user = get().user;
        return Boolean(user && roles.includes(user.role));
      },
    }),
    {
      name: "tanaw-auth",
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
);
