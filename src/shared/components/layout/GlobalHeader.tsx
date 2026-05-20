import { Bell, ChevronDown, LogOut, Shield, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { routes } from "../../../app/routers/routes";
import { useAuthStore } from "../../../app/store/authStore";
import { useHeaderStore } from "../../../app/store/headerStore";
import type { UserRole } from "../../types/role.types";
import { ProfileSettingsModal, SecurityDataControlModal } from "./ProfileModals";
import { roleAccessLabel } from "./navigation";

type GlobalHeaderProps = {
  role: UserRole;
};

export function GlobalHeader({ role }: GlobalHeaderProps) {
  const authUser = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { title, description } = useHeaderStore();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeAccountModal, setActiveAccountModal] = useState<"profile" | "security" | null>(null);

  const profile = {
    name: authUser?.displayName ?? "TANAW User",
    email: `${authUser?.id ?? "user"}@tanaw.gov.ph`,
    department: authUser?.title ?? "City Tourism Operations",
    phone: "+63 2 8847 0000",
  };

  const initials = useMemo(
    () =>
      profile.name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase(),
    [profile.name],
  );

  const handleLogout = () => {
    setShowProfileMenu(false);
    logout();
    toast.success("Secure logout complete.");
    navigate(routes.login, { replace: true });
  };

  const openAccountModal = (modal: "profile" | "security") => {
    setShowProfileMenu(false);
    setActiveAccountModal(modal);
  };

  return (
    <>
      <header className="z-10 flex h-16 items-center justify-between border-b border-white/70 bg-slate-100/80 px-8 backdrop-blur max-sm:px-4">
        {/* Left Section: Page Title & Subtitle */}
        <div className="flex flex-col min-w-0 pr-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={title}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col"
            >
              <h1 className="text-tanaw-navy font-display text-base font-bold leading-tight tracking-tight sm:text-lg truncate">
                {title || "TANAW"}
              </h1>
              {description && (
                <p className="mt-0.5 text-[10px] sm:text-xs text-gray-500 font-medium truncate max-md:hidden">
                  {description}
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Section: Actions & Profile Menu */}
        <div className="flex items-center gap-6 max-sm:gap-3 shrink-0">
          <button
            type="button"
            aria-label="Notifications"
            className="text-tanaw-navy hover:text-tanaw-green relative rounded-full border border-white/80 bg-white p-2 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
          >
            <Bell size={18} />
            <span className="bg-tanaw-red absolute top-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white" />
          </button>

          <div className="relative">
            <button
              type="button"
              aria-label="Open account menu"
              onClick={() => setShowProfileMenu((current) => !current)}
              className="flex items-center gap-3 rounded-full border border-white/80 bg-white py-1 pr-3 pl-1.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-md active:translate-y-0"
            >
              <div className="bg-tanaw-green flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white">{initials}</div>
              <div className="hidden text-left md:block">
                <p className="text-tanaw-navy text-sm leading-none font-bold">{profile.name}</p>
                <p className="text-[10px] text-gray-500">{roleAccessLabel[role]}</p>
              </div>
              <ChevronDown size={14} className="ml-1 text-gray-400" />
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-white/80 bg-white py-2 shadow-xl ring-1 ring-slate-900/4"
                >
                  <div className="mb-1 border-b border-slate-100 px-4 py-3">
                    <p className="text-tanaw-navy text-sm font-bold">{profile.name}</p>
                    <p className="text-xs text-gray-500">{profile.email}</p>
                  </div>
                  <button type="button" onClick={() => openAccountModal("profile")} className="profile-menu-button">
                    <User size={14} /> Profile Settings
                  </button>
                  <button type="button" onClick={() => openAccountModal("security")} className="profile-menu-button">
                    <Shield size={14} /> Security & Data Control
                  </button>
                  <button type="button" onClick={handleLogout} className="text-tanaw-red flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-semibold transition-colors hover:bg-red-50">
                    <LogOut size={14} /> Secure Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {activeAccountModal === "profile" && <ProfileSettingsModal user={profile} onClose={() => setActiveAccountModal(null)} />}
        {activeAccountModal === "security" && <SecurityDataControlModal onClose={() => setActiveAccountModal(null)} />}
      </AnimatePresence>
    </>
  );
}
