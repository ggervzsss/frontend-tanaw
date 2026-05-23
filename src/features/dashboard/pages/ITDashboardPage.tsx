import { Activity, AlertTriangle, Bell, Building2, Users, Wifi } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { useState } from "react";
import { MetricCard } from "../../../shared/components/cards";
import { PageHeader } from "../../../shared/components/layout";
import { ModalPortal, PageMotion, stagger } from "../../../shared/components/ui";
import { enterpriseAccounts, enterprises, priorityAlerts, systemActivities } from "../../../shared/data";
import type { AlertSeverity, PriorityAlert, PriorityAlertResolutionMode, SystemActivity } from "../../../shared/types";

export function ITDashboardPage() {
  const [selectedActivity, setSelectedActivity] = useState<SystemActivity | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<PriorityAlert | null>(null);
  const [isAllAlertsModalOpen, setIsAllAlertsModalOpen] = useState(false);
  const offlineCameras = enterpriseAccounts.reduce((total, enterprise) => total + enterprise.cameras.filter((camera) => camera.status === "Offline").length, 0);
  const activeEnterprises = enterprises.filter((enterprise) => enterprise.gatewayStatus !== "Closed").length;
  const gatewaysOnline = enterprises.filter((enterprise) => enterprise.gatewayStatus === "Connected").length;
  const recentActivities = systemActivities.slice(0, 7);

  const actionableAlerts = priorityAlerts.filter((alert) => alert.status !== "Resolved").slice(0, 4);

  return (
    <PageMotion>
      <PageHeader title="Dashboard" description="Operational overview for accounts, enterprise connectivity, camera health, and recent system activity." />

      <motion.section className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4" variants={stagger}>
        <MetricCard label="LGU Accounts" value={4} foot="Active account registry" color="#065f46" icon={Users} />
        <MetricCard label="Active Enterprises" value={activeEnterprises} foot="Not marked closed" color="#2563eb" icon={Building2} />
        <MetricCard label="Gateways Online" value={gatewaysOnline} foot="Synced edge gateways" color="#10b981" icon={Wifi} />
        <MetricCard label="Offline Cameras" value={offlineCameras} foot="Needs diagnosis" color="#dc2626" footClassName="text-red-600" icon={AlertTriangle} />
      </motion.section>

      <div className="mt-6 grid grid-cols-[minmax(0,2fr)_minmax(320px,1fr)] gap-6 max-xl:grid-cols-1">
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-6 py-5 max-sm:flex-col max-sm:items-start">
            <div>
              <h3 className="text-charcoal-800 m-0 text-base font-bold">Recent System Activity</h3>
              <p className="mt-1 mb-0 text-xs text-gray-500">Latest IT-visible user, enterprise, configuration, and SYSTEM actions.</p>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full min-w-140 table-fixed text-left">
                <colgroup>
                  <col className="w-[18%]" />
                  <col className="w-[52%]" />
                  <col className="w-[30%]" />
                </colgroup>
                <thead className="bg-gray-50 text-[9px] font-bold tracking-wider text-gray-500 uppercase">
                  <tr>
                    <th className="py-2.5 pr-1.5 pl-2.5 whitespace-nowrap lg:pr-2 lg:pl-3">Timestamp</th>
                    {["Summary", "Name"].map((heading) => (
                      <th key={heading} className="px-2.5 py-2.5 whitespace-nowrap lg:px-3">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentActivities.map((activity) => {
                    const displayName = activity.enterprise ?? activity.accountName ?? activity.initiatedBy;

                    return (
                      <tr key={activity.id} onClick={() => setSelectedActivity(activity)} className="hover:bg-tgreen-dark/5 cursor-pointer transition">
                        <td className="py-3 pr-1.5 pl-2.5 font-mono text-[10px] leading-snug text-gray-500 lg:pr-2 lg:pl-3">{formatCompactTimestamp(activity.time)}</td>
                        <td className="text-charcoal-800 px-2.5 py-3 text-[11px] leading-snug font-semibold lg:px-3">
                          <span className="line-clamp-3">{activity.summary}</span>
                        </td>
                        <td className="px-2.5 py-3 text-[10px] leading-snug font-semibold wrap-break-word text-gray-600 lg:px-3">
                          <span className="line-clamp-3">{displayName}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {recentActivities.length === 0 && (
              <DashboardEmptyState icon={Activity} title="No recent activity" description="System activity records will appear here once the logging source is connected." />
            )}
          </div>
        </section>

        <aside className="grid gap-6">
          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-charcoal-800 m-0 text-base font-bold">Priority Alerts</h3>
                  <p className="mt-1 mb-0 text-xs text-gray-500">Actionable tasks requiring IT intervention or approval.</p>
                </div>
                <button onClick={() => setIsAllAlertsModalOpen(true)} className="shrink-0 text-xs font-semibold text-emerald-600 transition hover:text-emerald-700">
                  View All Alerts
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {actionableAlerts.map((alert) => (
                <article className="cursor-pointer px-6 py-4 transition hover:bg-emerald-50" key={alert.id} onClick={() => setSelectedAlert(alert)}>
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
              ))}
              {actionableAlerts.length === 0 && (
                <DashboardEmptyState icon={Bell} title="No priority alerts" description="Alerts requiring IT attention will appear here once alert ingestion is implemented." />
              )}
            </div>
          </section>
        </aside>
      </div>

      <AnimatePresence>
        {selectedActivity && <ActivityDetailsModal activity={selectedActivity} onClose={() => setSelectedActivity(null)} />}
        {selectedAlert && <AlertDetailsModal alert={selectedAlert} onClose={() => setSelectedAlert(null)} />}
        {isAllAlertsModalOpen && (
          <AllAlertsModal
            alerts={priorityAlerts}
            onClose={() => setIsAllAlertsModalOpen(false)}
            onSelectAlert={(alert) => {
              setIsAllAlertsModalOpen(false);
              setSelectedAlert(alert);
            }}
          />
        )}
      </AnimatePresence>
    </PageMotion>
  );
}

function formatCompactTimestamp(timestamp: string) {
  return timestamp.replace("2026-", "");
}

function AlertDetailsModal({ alert, onClose }: { alert: PriorityAlert; onClose: () => void }) {
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
            <Detail label="Status" value={alert.status} />
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

function AllAlertsModal({ alerts, onClose, onSelectAlert }: { alerts: PriorityAlert[]; onClose: () => void; onSelectAlert: (alert: PriorityAlert) => void }) {
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
              {alerts.length === 0 && (
                <div className="p-8">
                  <DashboardEmptyState icon={Bell} title="No alerts" description="There are currently no priority alerts." />
                </div>
              )}
              {alerts.map((alert) => (
                <article className="cursor-pointer px-6 py-4 transition hover:bg-emerald-50" key={alert.id} onClick={() => onSelectAlert(alert)}>
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
                    <span className="ml-auto text-gray-500">Status: {alert.status}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </motion.section>
      </motion.div>
    </ModalPortal>
  );
}

function ActivityDetailsModal({ activity, onClose }: { activity: SystemActivity; onClose: () => void }) {
  const relatedEntity = activity.enterprise ? <Detail label="Enterprise" value={activity.enterprise} /> : activity.accountName ? <Detail label="Account" value={activity.accountName} /> : null;

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
              <p className="font-mono text-[10px] font-bold text-gray-400">{activity.id}</p>
              <h2 className="text-lg font-bold text-gray-900">Activity Details</h2>
            </div>
            <button onClick={onClose} className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-500 transition hover:bg-white hover:text-gray-900">
              Close
            </button>
          </header>
          <div className="grid gap-4 p-6 md:grid-cols-2">
            <Detail label="Type" value={activity.type} />
            <Detail label="Actor" value={`${activity.initiatedBy} (${activity.actorType})`} />
            <Detail label="Timestamp" value={activity.time} />
            <Detail label="Target" value={activity.target ?? "N/A"} />
            {relatedEntity}
            {activity.device && <Detail label="Device" value={activity.device} />}
            <div className="md:col-span-2">
              <Detail label="Summary" value={activity.summary} />
            </div>
          </div>
        </motion.section>
      </motion.div>
    </ModalPortal>
  );
}

function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  const classes: Record<AlertSeverity, string> = {
    Info: "bg-blue-50 text-blue-700",
    Warning: "bg-yellow-50 text-yellow-700",
    Critical: "bg-red-50 text-red-700",
  };
  return <span className={`rounded-full px-3 py-1 text-[10px] font-bold whitespace-nowrap uppercase ${classes[severity]}`}>{severity}</span>;
}

function ResolutionBadge({ mode }: { mode: PriorityAlertResolutionMode }) {
  const classes: Record<PriorityAlertResolutionMode, string> = {
    "On-site Visit Required": "bg-red-50 text-red-700",
    "In-system Action": "bg-emerald-50 text-emerald-700",
  };
  return <span className={`rounded-full px-3 py-1 text-[10px] font-bold whitespace-nowrap uppercase ${classes[mode]}`}>{mode}</span>;
}

function Detail({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <p className="mb-1 text-[10px] font-bold tracking-wide text-gray-500 uppercase">{label}</p>
      <p className="text-sm leading-relaxed font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function DashboardEmptyState({ icon: Icon, title, description }: { icon: typeof Activity; title: string; description: string }) {
  return (
    <div className="flex min-h-55 flex-col items-center justify-center px-6 py-10 text-center">
      <span className="bg-tgreen-dark/10 text-tgreen-dark flex h-10 w-10 items-center justify-center rounded-lg">
        <Icon size={20} />
      </span>
      <p className="mt-3 text-sm font-bold text-gray-900">{title}</p>
      <p className="mt-1 max-w-sm text-xs leading-relaxed text-gray-500">{description}</p>
    </div>
  );
}
