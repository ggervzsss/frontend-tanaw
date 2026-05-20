import { X } from "lucide-react";
import { motion } from "motion/react";
import { ModalPortal } from "../../../shared/components/ui";
import type { AuditLog } from "../../../shared/types";
import { EventBadge, RoleBadge } from "./AuditBadges";

type LogDetailsModalProps = {
  log: AuditLog;
  onClose: () => void;
};

export function LogDetailsModal({ log, onClose }: LogDetailsModalProps) {
  return (
    <ModalPortal>
      <motion.div className="bg-charcoal-950/70 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.section
          className="w-full max-w-3xl overflow-hidden rounded-2xl border border-white/70 bg-white shadow-2xl"
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50 px-6 py-5">
            <div>
              <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">{log.hashId}</p>
              <h2 className="text-tanaw-navy mt-1 text-lg font-black">{log.module} Event Detail</h2>
            </div>
            <button type="button" onClick={onClose} aria-label="Close log details" className="rounded-full p-2 text-slate-400 transition hover:bg-white hover:text-slate-700">
              <X size={18} />
            </button>
          </div>

          <div className="grid gap-4 p-6 md:grid-cols-2">
            <Detail label="Timestamp" value={log.time} />
            <Detail label="Session ID" value={log.sessionId} />
            <Detail label="User Identifier" value={log.user} />
            <Detail label="IP Address" value={log.ip} />
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="mb-2 text-[10px] font-black tracking-widest text-slate-400 uppercase">Role</p>
              <RoleBadge role={log.role} />
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="mb-2 text-[10px] font-black tracking-widest text-slate-400 uppercase">Event</p>
              <EventBadge event={log.event} />
            </div>
            <div className="md:col-span-2">
              <Detail label="Technical Description" value={log.desc} />
            </div>
            <div className="md:col-span-2">
              <p className="mb-2 text-[10px] font-black tracking-widest text-slate-400 uppercase">Payload</p>
              <pre className="bg-charcoal-950 max-h-56 overflow-auto rounded-xl border border-slate-100 p-4 text-xs text-slate-100">{JSON.stringify(log.payload, null, 2)}</pre>
            </div>
          </div>
        </motion.section>
      </motion.div>
    </ModalPortal>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">{label}</p>
      <p className="mt-2 text-sm font-bold text-slate-800">{value}</p>
    </div>
  );
}
