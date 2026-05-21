import { AlertTriangle, Building2, ClipboardList, Users, Wifi } from "lucide-react";
import { motion } from "motion/react";
import { MetricCard } from "../../../shared/components/cards";
import { PageHeader } from "../../../shared/components/layout";
import { PageMotion, stagger } from "../../../shared/components/ui";
import { enterpriseAccounts, enterprises, pipelineHealth, technicalLogs } from "../../../shared/data";
import type { AlertSeverity } from "../../../shared/types";

export function ITDashboardPage() {
  const offlineCameras = enterpriseAccounts.reduce((total, enterprise) => total + enterprise.cameras.filter((camera) => camera.status === "Offline").length, 0);
  const gatewaysOnline = enterprises.filter((enterprise) => enterprise.gatewayStatus === "Connected").length;
  const alerts = pipelineHealth.flatMap((enterprise) =>
    enterprise.warnings.map((warning) => ({
      ...warning,
      enterprise: enterprise.name,
      gatewayStatus: enterprise.gatewayStatus,
    })),
  );
  return (
    <PageMotion>
      <PageHeader title="Dashboard" description="Operational overview for accounts, enterprise connectivity, camera health, and recent system activity." />

      <motion.section className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4" variants={stagger}>
        <MetricCard label="LGU Accounts" value={4} foot="Active account registry" color="#065f46" icon={Users} />
        <MetricCard label="Active Enterprises" value={enterprises.filter((enterprise) => enterprise.status === "Active").length} foot="Currently monitored" color="#2563eb" icon={Building2} />
        <MetricCard label="Gateways Online" value={gatewaysOnline} foot="Synced edge gateways" color="#10b981" icon={Wifi} />
        <MetricCard label="Offline Cameras" value={offlineCameras} foot="Needs diagnosis" color="#dc2626" footClassName="text-red-600" icon={AlertTriangle} />
      </motion.section>

      <div className="mt-6 grid grid-cols-[minmax(0,2fr)_minmax(320px,1fr)] gap-6 max-xl:grid-cols-1">
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-6 py-5 max-sm:flex-col max-sm:items-start">
            <div>
              <h3 className="text-charcoal-800 m-0 text-base font-bold">Priority Alerts</h3>
              <p className="mt-1 mb-0 text-xs text-gray-500">Issues that need IT attention.</p>
            </div>
            <span className="text-tanaw-green inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold">
              <ClipboardList className="h-4 w-4" />
              Health Queue
            </span>
          </div>
          <div className="divide-y divide-gray-100">
            {alerts.map((alert) => (
              <article className="px-6 py-4" key={alert.id}>
                <div className="grid grid-cols-[120px_minmax(0,1fr)_100px] gap-4 max-sm:grid-cols-1">
                  <div>
                    <FieldLabel>Severity</FieldLabel>
                    <SeverityBadge severity={alert.severity} />
                  </div>
                  <div>
                    <FieldLabel>Enterprise</FieldLabel>
                    <p className="text-charcoal-800 m-0 text-sm font-semibold">{alert.enterprise}</p>
                  </div>
                  <div>
                    <FieldLabel>Device</FieldLabel>
                    <p className="m-0 text-sm text-gray-500">{alert.device}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <FieldLabel>Issue</FieldLabel>
                  <p className="m-0 text-sm text-gray-700">{alert.msg}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="grid gap-6">
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-charcoal-800 m-0 text-base font-bold">Recent System Activity</h3>
            <div className="mt-5 space-y-4">
              {technicalLogs.map((log) => (
                <div className="border-l-2 border-gray-200 pl-4" key={log.id}>
                  <p className="text-charcoal-800 m-0 text-sm font-semibold">{log.desc}</p>
                  <p className="mt-1 mb-0 text-xs text-gray-500">
                    {log.eventType} by {log.performedBy} · {log.time}
                  </p>
                </div>
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

function FieldLabel({ children }: { children: string }) {
  return <p className="mb-1 text-[10px] font-bold text-gray-500 uppercase">{children}</p>;
}
