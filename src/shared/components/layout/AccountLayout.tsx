import { Outlet } from "react-router-dom";
import type { UserRole } from "../../types/role.types";
import { GlobalHeader } from "./GlobalHeader";
import { GlobalSidebar } from "./GlobalSidebar";

type AccountLayoutProps = {
  role: UserRole;
};

export function AccountLayout({ role }: AccountLayoutProps) {
  return (
    <section className="flex h-screen w-full overflow-hidden bg-[#f8f9fa] font-['Bai_Jamjuree'] text-charcoal-800 max-[920px]:h-auto max-[920px]:min-h-screen max-[920px]:flex-col max-[920px]:overflow-visible">
      <GlobalSidebar role={role} />
      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <GlobalHeader role={role} />
        <main className="flex-1 overflow-y-auto bg-[#f8f9fa] p-8 max-xl:p-6 max-sm:p-4">
          <Outlet />
        </main>
      </div>
    </section>
  );
}
