import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../../app/store/authStore";
import { getCurrentUser } from "../../services/accountManagement";
import type { UserRole } from "../../types/role.types";
import { GlobalHeader } from "./GlobalHeader";
import { GlobalSidebar } from "./GlobalSidebar";

type AccountLayoutProps = {
  role: UserRole;
};

export function AccountLayout({ role }: AccountLayoutProps) {
  const mainRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();
  const token = useAuthStore((state) => state.token);
  const updateUser = useAuthStore((state) => state.updateUser);

  const currentUserQuery = useQuery({
    queryKey: ["current-user", token],
    queryFn: getCurrentUser,
    enabled: Boolean(token),
    staleTime: 60_000,
  });

  useEffect(() => {
    if (currentUserQuery.data) {
      updateUser(currentUserQuery.data);
    }
  }, [currentUserQuery.data, updateUser]);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, left: 0 });
    window.scrollTo({ top: 0, left: 0 });
  }, [pathname]);

  return (
    <section className="text-charcoal-800 flex h-screen w-full overflow-hidden bg-[#f8f9fa] font-['Bai_Jamjuree'] max-[920px]:h-auto max-[920px]:min-h-screen max-[920px]:flex-col max-[920px]:overflow-visible">
      <GlobalSidebar role={role} />
      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <GlobalHeader role={role} />
        <main ref={mainRef} className="flex-1 overflow-y-auto bg-[#f8f9fa] p-8 max-xl:p-6 max-sm:p-4">
          <Outlet />
        </main>
      </div>
    </section>
  );
}
