import { X } from "lucide-react";
import { motion } from "motion/react";
import { ModalPortal } from "../ui";

type ProfileUser = {
  name: string;
  email: string;
  department: string;
  phone: string;
};

type ModalProps = {
  onClose: () => void;
};

type ProfileSettingsModalProps = ModalProps & {
  user: ProfileUser;
};

export function ProfileSettingsModal({ user, onClose }: ProfileSettingsModalProps) {
  return (
    <ModalShell title="Profile Settings" onClose={onClose}>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Full Name" defaultValue={user.name} />
        <Field label="Professional Email" defaultValue={user.email} type="email" />
        <Field label="Department" defaultValue={user.department} />
        <Field label="Phone" defaultValue={user.phone} />
      </div>
      <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900">
          Cancel
        </button>
        <button type="button" onClick={onClose} className="bg-tanaw-green rounded-lg px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#044a1e]">
          Save Changes
        </button>
      </div>
    </ModalShell>
  );
}

export function SecurityDataControlModal({ onClose }: ModalProps) {
  return (
    <ModalShell title="Security & Data Control" onClose={onClose}>
      <div className="grid gap-4">
        <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-bold text-slate-900">Credential Management</h3>
          <p className="mt-1 text-sm text-slate-500">Update local portal credentials once backend account services are connected.</p>
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Two-Factor Authentication</h3>
              <p className="mt-1 text-sm text-slate-500">Extra verification is enabled for administrative sessions.</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Active</span>
          </div>
        </section>
      </div>
      <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">
        <button type="button" onClick={onClose} className="bg-tanaw-green rounded-lg px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#044a1e]">
          Done
        </button>
      </div>
    </ModalShell>
  );
}

function ModalShell({ title, children, onClose }: ModalProps & { title: string; children: React.ReactNode }) {
  return (
    <ModalPortal>
      <motion.div className="bg-charcoal-950/70 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div
          className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-white/70 bg-white p-6 shadow-2xl"
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <div className="mb-5 flex shrink-0 items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <h2 className="text-tanaw-navy text-lg font-bold">{title}</h2>
            <button type="button" onClick={onClose} aria-label="Close modal" className="rounded-full p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700">
              <X size={18} />
            </button>
          </div>
          <div className="grow overflow-y-auto pr-1 -mr-1">
            {children}
          </div>
        </motion.div>
      </motion.div>
    </ModalPortal>
  );
}

function Field({ label, defaultValue, type = "text" }: { label: string; defaultValue: string; type?: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold tracking-wide text-slate-500 uppercase">{label}</span>
      <input
        type={type}
        defaultValue={defaultValue}
        className="focus:ring-tanaw-green/20 w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-900 transition outline-none focus:ring-2"
      />
    </label>
  );
}
