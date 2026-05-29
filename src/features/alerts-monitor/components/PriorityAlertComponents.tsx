import { Bell } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { EmptyState, ModalPortal } from "@/shared/components/ui";
import type { AlertSeverity, PriorityAlert, PriorityAlertResolutionMode } from "@/shared/types";

type PriorityAlertListItemProps = {
  alert: PriorityAlert;
  onOpen: (alert: PriorityAlert) => void;
};

export function PriorityAlertListItem({ alert, onOpen }: PriorityAlertListItemProps) {
  return (
    <article className="cursor-pointer px-6 py-4 transition hover:bg-emerald-50" onClick={() => onOpen(alert)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SeverityBadge severity={alert.severity} />
        <ResolutionBadge mode={alert.resolutionMode} />
      </div>
      <p className="text-charcoal-800 mt-3 mb-1 text-sm font-semibold">{alert.summary}</p>
      <p className="m-0 text-xs leading-relaxed text-gray-500">{alert.requiredAction}</p>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold tracking-wide text-gray-400 uppercase">
        <span>{alert.type}</span>
        <span>{alert.enterprise ?? alert.requester}</span>
        <span>{alert.time}</span>
      </div>
    </article>
  );
}

export function AlertDetailsModal({ alert, onClose }: { alert: PriorityAlert; onClose: () => void }) {
  const relatedEntity = alert.enterprise ? <Detail label="Enterprise" value={alert.enterprise} /> : null;

  return (
    <ModalPortal>
      <motion.div className="bg-charcoal-950/70 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.section
          className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-2xl"
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <header className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4">
            <div>
              <p className="font-mono text-[10px] font-bold text-gray-400">{alert.id}</p>
              <h2 className="text-lg font-bold text-gray-900">Priority Alert Details</h2>
            </div>
            <button onClick={onClose} className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-500 transition hover:bg-white hover:text-gray-900">
              Close
            </button>
          </header>
          <div className="grid gap-4 p-6 md:grid-cols-2">
            <Detail label="Type" value={alert.type} />
            <Detail label="Severity" value={<SeverityBadge severity={alert.severity} />} />
            <Detail label="Timestamp" value={alert.time} />
            <Detail label="Status" value={<AlertStatusBadge status={alert.status} />} />
            <Detail label="Requester" value={alert.requester} />
            <Detail label="Resolution Mode" value={<ResolutionBadge mode={alert.resolutionMode} />} />
            {relatedEntity}
            <div className="md:col-span-2">
              <Detail label="Summary" value={alert.summary} />
            </div>
            <div className="md:col-span-2">
              <Detail label="Required Action" value={alert.requiredAction} />
            </div>
          </div>
        </motion.section>
      </motion.div>
    </ModalPortal>
  );
}

export function AllAlertsModal({ alerts, onClose, onSelectAlert }: { alerts: PriorityAlert[]; onClose: () => void; onSelectAlert: (alert: PriorityAlert) => void }) {
  return (
    <ModalPortal>
      <motion.div className="bg-charcoal-950/70 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.section
          className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-2xl"
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <header className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">All Priority Alerts</h2>
              <p className="mt-1 mb-0 text-xs text-gray-500">List of all priority alerts and their current statuses.</p>
            </div>
            <button onClick={onClose} className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-500 transition hover:bg-white hover:text-gray-900">
              Close
            </button>
          </header>

          <div className="flex-1 overflow-y-auto">
            <div className="divide-y divide-gray-100">
              {alerts.length === 0 && <AlertEmptyState />}
              {alerts.map((alert) => (
                <div key={alert.id} className="relative">
                  <PriorityAlertListItem alert={alert} onOpen={onSelectAlert} />
                  <div className="absolute right-6 bottom-4">
                    <AlertStatusBadge status={alert.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>
      </motion.div>
    </ModalPortal>
  );
}

export function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  const classes: Record<AlertSeverity, string> = {
    Info: "bg-blue-50 text-blue-700",
    Warning: "bg-yellow-50 text-yellow-700",
    Critical: "bg-red-50 text-red-700",
  };
  return <span className={`rounded-full px-3 py-1 text-[10px] font-bold whitespace-nowrap uppercase ${classes[severity]}`}>{severity}</span>;
}

export function ResolutionBadge({ mode }: { mode: PriorityAlertResolutionMode }) {
  const classes: Record<PriorityAlertResolutionMode, string> = {
    "On-site Visit Required": "bg-red-50 text-red-700",
    "In-system Action": "bg-emerald-50 text-emerald-700",
    "Staff Follow-up": "bg-amber-50 text-amber-700",
    "Remote Review": "bg-blue-50 text-blue-700",
    "Admin Monitoring": "bg-indigo-50 text-indigo-700",
  };
  return <span className={`rounded-full px-3 py-1 text-[10px] font-bold whitespace-nowrap uppercase ${classes[mode]}`}>{mode}</span>;
}

export function AlertStatusBadge({ status }: { status: PriorityAlert["status"] }) {
  const classes: Record<PriorityAlert["status"], string> = {
    New: "border-red-200 bg-red-50 text-red-700",
    "In Review": "border-yellow-200 bg-yellow-50 text-yellow-700",
    Resolved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };
  return <span className={`rounded border px-2.5 py-1 text-[10px] font-bold tracking-wide whitespace-nowrap uppercase ${classes[status]}`}>{status}</span>;
}

function Detail({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <p className="mb-1 text-[10px] font-bold tracking-wide text-gray-500 uppercase">{label}</p>
      <p className="text-sm leading-relaxed font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function AlertEmptyState() {
  return <EmptyState icon={Bell} title="No alerts" description="There are currently no priority alerts." />;
}
