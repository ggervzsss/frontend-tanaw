import { Activity, AlertTriangle, Bell, Building2, Users, Wifi } from "lucide-react";
import { motion } from "motion/react";
import { MetricCard } from "../../../shared/components/cards";
import { PageHeader } from "../../../shared/components/layout";
import { PageMotion, stagger } from "../../../shared/components/ui";
import { enterpriseAccounts, enterprises, priorityAlerts, systemActivities } from "../../../shared/data";
import type { AlertSeverity, PriorityAlertResolutionMode, SystemActivityType } from "../../../shared/types";

export function ITDashboardPage() {
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
            {recentActivities.map((activity) => (
              <article className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-4 px-6 py-4 max-md:grid-cols-1" key={activity.id}>
                <ActivityTypeBadge type={activity.type} />
                <div className="min-w-0">
                  <p className="text-charcoal-800 m-0 text-sm font-semibold">{activity.summary}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                    <span>{activity.initiatedBy}</span>
                    <span>{activity.actorType}</span>
                    {activity.enterprise && <span>{activity.enterprise}</span>}
                  </div>
                </div>
                <p className="m-0 font-mono text-xs whitespace-nowrap text-gray-500">{activity.time}</p>
              </article>
            ))}
            {recentActivities.length === 0 && <DashboardEmptyState icon={Activity} title="No recent activity" description="System activity records will appear here once the logging source is connected." />}
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
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {actionableAlerts.map((alert) => (
                <article className="px-6 py-4" key={alert.id}>
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
              {actionableAlerts.length === 0 && <DashboardEmptyState icon={Bell} title="No priority alerts" description="Alerts requiring IT attention will appear here once alert ingestion is implemented." />}
            </div>
          </section>
        </aside>
      </div>
    </PageMotion>
  );
}

function ActivityTypeBadge({ type }: { type: SystemActivityType }) {
  const classes: Record<SystemActivityType, string> = {
    LOGIN: "bg-blue-50 text-blue-700",
    CONNECTION: "bg-emerald-50 text-emerald-700",
    "ACCOUNT CONFIG": "bg-indigo-50 text-indigo-700",
    "ENTERPRISE CONFIG": "bg-cyan-50 text-cyan-700",
    "IT ACTION": "bg-violet-50 text-violet-700",
    SYSTEM: "bg-slate-100 text-slate-700",
  };
  return <span className={`rounded-full px-3 py-1 text-[10px] font-bold whitespace-nowrap uppercase ${classes[type]}`}>{type}</span>;
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

function DashboardEmptyState({ icon: Icon, title, description }: { icon: typeof Activity; title: string; description: string }) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center px-6 py-10 text-center">
      <span className="bg-tgreen-dark/10 text-tgreen-dark flex h-10 w-10 items-center justify-center rounded-lg">
        <Icon size={20} />
      </span>
      <p className="mt-3 text-sm font-bold text-gray-900">{title}</p>
      <p className="mt-1 max-w-sm text-xs leading-relaxed text-gray-500">{description}</p>
    </div>
  );
}
