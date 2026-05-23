import { Activity, AlertTriangle, Bell, Building2, Users, Wifi } from "lucide-react";
import { motion } from "motion/react";
import { MetricCard } from "../../../shared/components/cards";
import { PageHeader } from "../../../shared/components/layout";
import { PageMotion, stagger } from "../../../shared/components/ui";
import { enterpriseAccounts, enterprises } from "../../../shared/data";

export function ITDashboardPage() {
  const offlineCameras = enterpriseAccounts.reduce((total, enterprise) => total + enterprise.cameras.filter((camera) => camera.status === "Offline").length, 0);
  const activeEnterprises = enterprises.filter((enterprise) => enterprise.gatewayStatus !== "Closed").length;
  const gatewaysOnline = enterprises.filter((enterprise) => enterprise.gatewayStatus === "Connected").length;

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
              <p className="mt-1 mb-0 text-xs text-gray-500">Ready for future operational event feeds.</p>
            </div>
          </div>
          <DashboardEmptyState icon={Activity} title="No recent activity" description="System activity records will appear here once the logging source is connected." />
        </section>

        <aside className="grid gap-6">
          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-charcoal-800 m-0 text-base font-bold">Priority Alerts</h3>
                  <p className="mt-1 mb-0 text-xs text-gray-500">Ready for future alert feeds.</p>
                </div>
              </div>
            </div>
            <DashboardEmptyState icon={Bell} title="No priority alerts" description="Alerts requiring IT attention will appear here once alert ingestion is implemented." />
          </section>
        </aside>
      </div>
    </PageMotion>
  );
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
