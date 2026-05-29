import { Activity, Building2, Clock, MapPin, Phone, Radio, TrendingUp, Users, X } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { ModalPortal } from "@/shared/components/ui";
import type { MapEnterprise } from "@/shared/types";
import { getDarkStatusBadgeClass } from "../utils";

type EnterpriseDetailsModalProps = {
  enterprise: MapEnterprise;
  onClose: () => void;
};

export function EnterpriseDetailsModal({ enterprise, onClose }: EnterpriseDetailsModalProps) {
  return (
    <ModalPortal>
      <motion.div
        className="fixed inset-0 z-999 flex min-h-dvh items-center justify-center overflow-y-auto bg-slate-950/55 p-3 backdrop-blur-[3px] sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        onClick={onClose}
      >
        <motion.section
          role="dialog"
          aria-modal="true"
          aria-labelledby="enterprise-details-title"
          className="my-auto flex max-h-[calc(100dvh-1.5rem)] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-white/10 bg-slate-950/70 text-white shadow-2xl backdrop-blur-md sm:max-h-[calc(100dvh-3rem)]"
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="shrink-0 border-b border-white/10 bg-black/25 px-4 py-4 sm:px-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-[10px] font-black tracking-widest text-white/70 uppercase">
                  <Building2 size={14} className="text-tanaw-sky" />
                  Enterprise Details
                </p>
                <h3 id="enterprise-details-title" className="mt-1 text-lg leading-tight font-black text-white sm:text-xl">
                  {enterprise.name}
                </h3>
                <p className="mt-1 text-[10px] leading-relaxed font-bold tracking-widest text-white/75 uppercase sm:text-[11px]">
                  {enterprise.category} - Barangay {enterprise.barangay}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close enterprise details"
                className="focus:ring-tanaw-sky flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-white/75 transition hover:bg-white/20 hover:text-white focus:ring-2 focus:outline-none"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="min-h-0 overflow-y-auto bg-black/10 p-4 sm:p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <EnterpriseMetricCard icon={<Activity size={16} />} label="Total Live Occupancy" value={enterprise.totalLiveOccupancy.toLocaleString()} />
              <EnterpriseMetricCard icon={<Users size={16} />} label="Est. Unique Count" value={enterprise.estimatedUniqueCount.toLocaleString()} />
              <EnterpriseMetricCard icon={<Building2 size={16} />} label="Category" value={enterprise.category} />
              <EnterpriseMetricCard
                icon={<Radio size={16} />}
                label="Status"
                value={<span className={`inline-flex rounded border px-2 py-1 text-[10px] font-black tracking-widest uppercase ${getDarkStatusBadgeClass(enterprise.status)}`}>{enterprise.status}</span>}
              />
              <EnterpriseMetricCard className="sm:col-span-2" icon={<MapPin size={16} />} label="Full Address" value={enterprise.fullAddress} />
            </div>

            <div className="mt-4 grid gap-3 rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-white sm:grid-cols-2">
              <EnterpriseDetailRow icon={<Radio size={14} />} label="Gateway" value={enterprise.gatewayStatus ?? "Not Linked"} />
              <EnterpriseDetailRow icon={<Clock size={14} />} label="Last sync" value={enterprise.lastSync ?? "No sync recorded"} />
              <EnterpriseDetailRow icon={<Phone size={14} />} label="Contact" value={enterprise.contact ?? "No contact listed"} />
              <EnterpriseDetailRow icon={<TrendingUp size={14} />} label="Trend" value={enterprise.trend ?? "Stable"} />
              <EnterpriseDetailRow className="sm:col-span-2" icon={<Clock size={14} />} label="Operating hours" value={enterprise.operatingHours ?? "Not specified"} />
            </div>
          </div>
        </motion.section>
      </motion.div>
    </ModalPortal>
  );
}

function EnterpriseMetricCard({ icon, label, value, className = "" }: { icon: ReactNode; label: string; value: ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-white/10 bg-white/5 p-4 shadow-sm ${className}`}>
      <div className="text-tanaw-sky flex items-center gap-2">
        {icon}
        <p className="text-[10px] font-black tracking-widest text-white/60 uppercase">{label}</p>
      </div>
      <div className="mt-2 text-lg leading-tight font-black text-white max-sm:text-base">{value}</div>
    </div>
  );
}

function EnterpriseDetailRow({ icon, label, value, className = "" }: { icon: ReactNode; label: string; value: string; className?: string }) {
  return (
    <div className={`flex min-w-0 items-start gap-2 ${className}`}>
      <span className="text-tanaw-sky mt-0.5">{icon}</span>
      <div className="min-w-0">
        <p className="text-[9px] font-black tracking-widest text-white/50 uppercase">{label}</p>
        <p className="mt-0.5 font-bold wrap-break-word text-white/90">{value}</p>
      </div>
    </div>
  );
}

