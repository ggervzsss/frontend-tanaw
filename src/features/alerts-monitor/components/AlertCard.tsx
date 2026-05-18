import { CheckCircle, Loader, Zap } from "lucide-react";
import { motion } from "motion/react";
import type { SystemAlert } from "../../../shared/types";
import { formatISOTime } from "../utils";

type AlertCardProps = {
  alert: SystemAlert;
  index: number;
  loading: boolean;
  onOpen: () => void;
  onNotify: () => void;
};

export function AlertCard({ alert, index, loading, onOpen, onNotify }: AlertCardProps) {
  const isCritical = alert.severity === "Critical";
  const isWarning = alert.severity === "Warning";
  const rail = isCritical ? "from-tanaw-red to-red-300" : isWarning ? "from-tanaw-orange to-amber-300" : "from-tanaw-blue to-tanaw-sky";
  const surface = isCritical ? "from-red-50/90 via-white to-white" : isWarning ? "from-orange-50/90 via-white to-white" : "from-blue-50/90 via-white to-white";
  const badge = isCritical ? "border-red-100 bg-red-50 text-tanaw-red" : isWarning ? "border-orange-100 bg-orange-50 text-tanaw-orange" : "border-blue-100 bg-blue-50 text-tanaw-blue";
  const notified = alert.status === "IT Notified";

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.995 }}
      transition={{ duration: 0.18, delay: index * 0.025, ease: "easeOut" }}
      onClick={onOpen}
      className={`group relative flex min-h-37.5 shrink-0 cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-linear-to-br ${surface} shadow-md ring-1 shadow-slate-900/5 ring-white transition-shadow hover:shadow-xl`}
    >
      <div className={`absolute inset-y-3 left-3 w-1.5 rounded-full bg-linear-to-b ${rail}`} />
      <div className="flex items-center justify-between gap-3 border-b border-slate-100/80 px-5 py-4 pl-7">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-white font-mono text-[9px] font-black text-slate-500 shadow-sm">{String(index + 1).padStart(2, "0")}</span>
          <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black tracking-widest uppercase shadow-sm ${badge}`}>{alert.severity}</span>
          <span className="text-tanaw-navy group-hover:text-tanaw-green truncate text-[13px] font-black transition-colors">{alert.type}</span>
        </div>
        <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2.5 py-1 font-mono text-[9px] font-bold tracking-wider text-slate-500 uppercase shadow-sm">
          {formatISOTime(alert.timestamp)}
        </span>
      </div>
      <div className="flex flex-1 items-center justify-between gap-4 p-5 pl-7">
        <div className="flex-1">
          <div className="text-tanaw-navy mb-1 text-[14px] font-black">{alert.enterprise}</div>
          <div className="pr-4 text-[11px] leading-relaxed text-slate-600">{alert.desc}</div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-3 rounded-2xl border border-slate-200/80 bg-white/85 p-3 shadow-sm ring-1 ring-white">
          <span
            className={`rounded-full border px-2.5 py-1 text-[9px] font-black tracking-widest uppercase shadow-sm ${notified ? "border-tanaw-green/20 bg-tanaw-green/10 text-tanaw-green" : "border-tanaw-red text-tanaw-red animate-pulse bg-white"}`}
          >
            {alert.status}
          </span>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onNotify();
            }}
            disabled={loading || notified}
            className={`flex w-28 items-center justify-center gap-1 rounded-lg px-3 py-2 text-[9px] font-black tracking-widest uppercase transition-all duration-200 ${
              notified
                ? "border-tanaw-lime/30 text-tanaw-green cursor-not-allowed border bg-slate-100"
                : "border-tanaw-navy text-tanaw-navy hover:bg-tanaw-navy border bg-white shadow-sm hover:-translate-y-0.5 hover:text-white hover:shadow-md active:translate-y-0"
            }`}
          >
            {loading ? <Loader size={12} className="animate-spin" /> : notified ? <CheckCircle size={12} /> : <Zap size={12} />}
            {loading ? "Pinging" : notified ? "Notified" : "Notify IT"}
          </button>
        </div>
      </div>
    </motion.article>
  );
}
