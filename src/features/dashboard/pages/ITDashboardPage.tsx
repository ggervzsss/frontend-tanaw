import { Activity, Bell, Building2, Users, Wifi } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../../app/routers/routes";
import { useAlertStore } from "../../../app/store";
import { AlertDetailsModal, PriorityAlertListItem } from "../../alerts-monitor/components";
import { MetricCard } from "../../../shared/components/cards";
import { PageHeader } from "../../../shared/components/layout";
import { EmptyState, ModalPortal, PageMotion, stagger } from "../../../shared/components/ui";
import { useActivityLogs } from "../../../shared/hooks/useActivityLogs";
import { enterprises, lguAccounts } from "../../../shared/data";
import type { PriorityAlert, SystemLog } from "../../../shared/types";

export function ITDashboardPage() {
  const { logs, isLoading: logsLoading } = useActivityLogs();
  const [selectedActivity, setSelectedActivity] = useState<SystemLog | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<PriorityAlert | null>(null);
  const priorityAlerts = useAlertStore((state) => state.alerts).filter((alert) => alert.owner === "IT");
  const activeAlertsCount = priorityAlerts.filter((alert) => alert.status !== "Resolved").length;
  const activeLguAccounts = lguAccounts.filter((account) => account.status === "Active").length;
  const activeEnterprises = enterprises.filter((enterprise) => enterprise.gatewayStatus !== "Closed").length;
  const gatewaysOnline = enterprises.filter((enterprise) => enterprise.gatewayStatus === "Connected").length;
  const recentActivities = logs.slice(0, 7);

  const actionableAlerts = priorityAlerts.filter((alert) => alert.status !== "Resolved").slice(0, 4);

  return (
    <PageMotion>
      <PageHeader title="Dashboard" description="Operational overview for accounts, enterprise connectivity, camera health, and recent system activity." />

      <motion.section className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4" variants={stagger}>
        <MetricCard label="LGU Accounts" value={activeLguAccounts} foot="Active account registry" color="#065f46" icon={Users} />
        <MetricCard label="Active Enterprises" value={activeEnterprises} foot="Not marked closed" color="#2563eb" icon={Building2} />
        <MetricCard label="Gateways Online" value={gatewaysOnline} foot="Synced edge gateways" color="#10b981" icon={Wifi} />
        <MetricCard label="Priority Alerts" value={activeAlertsCount} foot="Requires IT action" color="#dc2626" footClassName="text-red-600" icon={Bell} />
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
                    return (
                      <tr key={activity.id} onClick={() => setSelectedActivity(activity)} className="hover:bg-tgreen-dark/5 cursor-pointer transition">
                        <td className="py-3 pr-1.5 pl-2.5 font-mono text-[10px] leading-snug text-gray-500 lg:pr-2 lg:pl-3">{formatCompactTimestamp(activity.timestamp)}</td>
                        <td className="text-charcoal-800 px-2.5 py-3 text-[11px] leading-snug font-semibold lg:px-3">
                          <span className="line-clamp-3">{activity.summary}</span>
                        </td>
                        <td className="px-2.5 py-3 text-[10px] leading-snug font-semibold wrap-break-word text-gray-600 lg:px-3">
                          <span className="line-clamp-3">{activity.actor}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {recentActivities.length === 0 && (
              <EmptyState
                icon={Activity}
                title={logsLoading ? "Loading recent activity" : "No recent activity"}
                description={logsLoading ? "Fetching live activity records." : "System activity records will appear here once the logging source is connected."}
              />
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
                <Link to={routes.it.alerts} className="shrink-0 text-xs font-semibold text-emerald-600 transition hover:text-emerald-700">
                  View All Alerts
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {actionableAlerts.map((alert) => (
                <PriorityAlertListItem key={alert.id} alert={alert} onOpen={setSelectedAlert} />
              ))}
              {actionableAlerts.length === 0 && <EmptyState icon={Bell} title="No priority alerts" description="Alerts requiring IT attention will appear here once alert ingestion is implemented." />}
            </div>
          </section>
        </aside>
      </div>

      <AnimatePresence>
        {selectedActivity && <ActivityDetailsModal activity={selectedActivity} onClose={() => setSelectedActivity(null)} />}
        {selectedAlert && <AlertDetailsModal alert={selectedAlert} onClose={() => setSelectedAlert(null)} />}
      </AnimatePresence>
    </PageMotion>
  );
}

function formatCompactTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? timestamp.replace("2026-", "") : date.toLocaleString();
}

function ActivityDetailsModal({ activity, onClose }: { activity: SystemLog; onClose: () => void }) {
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
            <Detail label="Type" value={activity.category} />
            <Detail label="Actor" value={`${activity.actor} (${activity.actorRole})`} />
            <Detail label="Timestamp" value={formatCompactTimestamp(activity.timestamp)} />
            <Detail label="Target" value={activity.target} />
            <Detail label="Action" value={activity.action} />
            <div className="md:col-span-2">
              <Detail label="Summary" value={activity.summary} />
            </div>
          </div>
        </motion.section>
      </motion.div>
    </ModalPortal>
  );
}

function Detail({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <p className="mb-1 text-[10px] font-bold tracking-wide text-gray-500 uppercase">{label}</p>
      <p className="text-sm leading-relaxed font-semibold text-gray-900">{value}</p>
    </div>
  );
}
