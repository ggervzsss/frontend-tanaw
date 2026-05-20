import { Loader, Send, X } from "lucide-react";
import { motion } from "motion/react";
import { ModalPortal } from "../../../shared/components/ui";
import type { SystemAlert } from "../../../shared/types";
import { formatISOTime } from "../utils";

type IncidentModalProps = {
  incident: SystemAlert;
  loading: boolean;
  onClose: () => void;
  onNotify: () => void;
};

export function IncidentModal({ incident, loading, onClose, onNotify }: IncidentModalProps) {
  const notified = incident.status === "IT Notified";

  return (
    <ModalPortal>
      <motion.div className="bg-charcoal-950/70 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.section
          className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/70 bg-white shadow-2xl"
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50 px-6 py-5">
            <div>
              <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                {incident.id} · {formatISOTime(incident.timestamp)}
              </p>
              <h2 className="text-tanaw-navy mt-1 text-lg font-black">{incident.type}</h2>
            </div>
            <button type="button" onClick={onClose} aria-label="Close incident details" className="rounded-full p-2 text-slate-400 transition hover:bg-white hover:text-slate-700">
              <X size={18} />
            </button>
          </div>

          <div className="space-y-5 p-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Detail label="Enterprise" value={incident.enterprise} />
              <Detail label="Severity" value={incident.severity} />
              <Detail label="Status" value={incident.status} />
            </div>
            <section className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Incident Description</p>
              <p className="mt-2 text-sm leading-relaxed font-semibold text-slate-700">{incident.desc}</p>
            </section>
            <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900">
                Close
              </button>
              <button
                type="button"
                onClick={onNotify}
                disabled={loading || notified}
                className="bg-tanaw-navy hover:bg-tanaw-green inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-black tracking-widest text-white uppercase shadow-sm transition disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {loading ? <Loader size={15} className="animate-spin" /> : <Send size={15} />}
                {notified ? "IT Notified" : loading ? "Dispatching" : "Notify IT"}
              </button>
            </div>
          </div>
        </motion.section>
      </motion.div>
    </ModalPortal>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">{label}</p>
      <p className="text-tanaw-navy mt-2 text-sm font-black">{value}</p>
    </div>
  );
}
