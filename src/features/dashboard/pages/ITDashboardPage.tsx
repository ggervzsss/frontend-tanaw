import { AlertTriangle, Building2, ClipboardList, Users, Wifi } from "lucide-react";
import { motion } from "motion/react";
import { MetricCard } from "../../../shared/components/cards";
import { PageHeader } from "../../../shared/components/layout";
import { PageMotion, stagger } from "../../../shared/components/ui";
import { enterpriseAccounts, enterprises, pipelineHealth, systemActivities } from "../../../shared/data";
import type { AlertSeverity, SystemActivityStatus } from "../../../shared/types";

export function ITDashboardPage() {
  const offlineCameras = enterpriseAccounts.reduce((total, enterprise) => total + enterprise.cameras.filter((camera) => camera.status === "Offline").length, 0);
  const activeEnterprises = enterprises.filter((enterprise) => enterprise.gatewayStatus !== "Closed").length;
  const gatewaysOnline = enterprises.filter((enterprise) => enterprise.gatewayStatus === "Connected").length;
  const alerts = pipelineHealth.flatMap((enterprise) =>
    enterprise.warnings.map((warning) => ({
      ...warning,
      enterprise: enterprise.name,
      gatewayStatus: enterprise.gatewayStatus,
    })),
  );
  const recentActivities = systemActivities.slice(0, 6);

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
              <p className="mt-1 mb-0 text-xs text-gray-500">Operational changes, incidents, and enterprise coordination updates.</p>
            </div>
            <span className="text-tanaw-green inline-flex rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold">Latest {recentActivities.length}</span>
          </div>
          <div className="divide-y divide-gray-100">
            {recentActivities.map((activity) => (
              <article className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-4 px-6 py-4 max-md:grid-cols-1" key={activity.id}>
                <SeverityBadge severity={activity.severity} />
                <div className="min-w-0">
                  <p className="text-charcoal-800 m-0 text-sm font-semibold">{activity.summary}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                    <span className="font-semibold text-gray-700">{activity.type}</span>
                    <span>{activity.enterprise ?? activity.accountName ?? "General system"}</span>
                    {activity.device && <span>{activity.device}</span>}
                    <span>By {activity.initiatedBy}</span>
                  </div>
                </div>
                <div className="text-right max-md:text-left">
                  <p className="m-0 font-mono text-xs text-gray-500">{activity.time}</p>
                  <div className="mt-2">
                    <ActivityStatusBadge status={activity.status} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="grid gap-6">
          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-charcoal-800 m-0 text-base font-bold">Priority Alerts</h3>
                  <p className="mt-1 mb-0 text-xs text-gray-500">Issues that need IT attention.</p>
                </div>
                <span className="text-tanaw-green inline-flex shrink-0 items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold">
                  <ClipboardList className="h-4 w-4" />
                  {alerts.length}
                </span>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {alerts.map((alert) => (
                <article className="px-6 py-4" key={alert.id}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <SeverityBadge severity={alert.severity} />
                    <span className="font-mono text-xs text-gray-500">{alert.device}</span>
                  </div>
                  <p className="text-charcoal-800 mt-3 mb-1 text-sm font-semibold">{alert.enterprise}</p>
                  <p className="m-0 text-sm leading-relaxed text-gray-600">{alert.msg}</p>
                </article>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </PageMotion>
  );
}

function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  const classes = {
    Info: "bg-blue-50 text-blue-700",
    Warning: "bg-yellow-50 text-yellow-700",
    Critical: "bg-red-50 text-red-700",
  }[severity];

  return <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${classes}`}>{severity}</span>;
}

function ActivityStatusBadge({ status }: { status: SystemActivityStatus }) {
  const classes: Record<SystemActivityStatus, string> = {
    Open: "bg-red-50 text-red-700",
    Resolved: "bg-emerald-50 text-emerald-700",
    Completed: "bg-blue-50 text-blue-700",
    Pending: "bg-yellow-50 text-yellow-700",
    Acknowledged: "bg-slate-100 text-slate-700",
  };

  return <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${classes[status]}`}>{status}</span>;
}
