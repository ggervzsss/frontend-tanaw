import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { routes } from "@/app/routers/routes";
import { useAuthStore } from "@/app/store/authStore";
import { useHeaderStore } from "@/app/store/headerStore";
import { getCurrentUser } from "../../services/accountManagement";
import type { UserRole } from "../../types/role.types";
import { PortalTopbar } from "./PortalTopbar";

type AccountLayoutProps = {
  role: UserRole;
};

export function AccountLayout({ role }: AccountLayoutProps) {
  const mainRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const updateUser = useAuthStore((state) => state.updateUser);
  const title = useHeaderStore((state) => state.title);

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
    if (currentUserQuery.isError) {
      logout();
      navigate(routes.login, { replace: true });
    }
  }, [currentUserQuery.isError, logout, navigate]);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, left: 0 });
    window.scrollTo({ top: 0, left: 0 });
  }, [pathname]);

  return (
    <section className="text-charcoal-800 flex h-screen w-full overflow-hidden bg-[#f8f9fa] font-['Bai_Jamjuree'] max-[920px]:h-auto max-[920px]:min-h-screen max-[920px]:flex-col max-[920px]:overflow-visible">
      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <PortalTopbar role={role} />
        <main
          ref={mainRef}
          className="it-portal-main flex-1 overflow-y-auto bg-[#f8f9fa] px-8 py-8 text-[15px] max-2xl:px-7 max-xl:px-6 max-sm:px-4 max-sm:py-5"
        >
          <div className="mx-auto w-full max-w-[1880px]">
            {title && <h1 className="text-tanaw-navy mb-5 text-2xl font-bold tracking-tight max-sm:mb-4 max-sm:text-xl">{title}</h1>}
            <Outlet />
          </div>
        </main>
      </div>
    </section>
  );
}
