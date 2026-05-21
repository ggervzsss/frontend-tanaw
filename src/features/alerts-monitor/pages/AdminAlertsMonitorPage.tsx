import { Activity, AlertTriangle, BellRing, CheckCircle2, FileText, RadioTower } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useState } from "react";
import toast from "react-hot-toast";
import { MetricCard } from "../../../shared/components/cards";
import { PageHeader } from "../../../shared/components/layout";
import { Panel, PanelHeader } from "../../../shared/components/panel";
import { PageMotion } from "../../../shared/components/ui";
import { systemAlerts } from "../../../shared/data";
import type { SystemAlert } from "../../../shared/types";
import { AlertCard, IncidentModal, TechnicalGauge } from "../components";
import { formatISOTime } from "../utils";

export function AdminAlertsMonitorPage() {
  const [alerts, setAlerts] = useState<SystemAlert[]>(systemAlerts);
  const [loadingAlerts, setLoadingAlerts] = useState<Set<string>>(new Set());
  const [selectedIncident, setSelectedIncident] = useState<SystemAlert | null>(null);

  const notifyIT = (alertId: string) => {
    setLoadingAlerts((current) => new Set(current).add(alertId));
    window.setTimeout(() => {
      setAlerts((current) => current.map((alert) => (alert.id === alertId ? { ...alert, status: "IT Notified" } : alert)));
      setSelectedIncident((current) => (current?.id === alertId ? { ...current, status: "IT Notified" } : current));
      setLoadingAlerts((current) => {
        const next = new Set(current);
        next.delete(alertId);
        return next;
      });
      toast.success("IT response dispatched and logged.");
    }, 900);
  };

  const activeAlerts = alerts.filter((alert) => alert.status === "Active" || alert.status === "IT Notified");
  const resolvedAlerts = alerts.filter((alert) => alert.status === "Resolved");
  const criticalAlerts = activeAlerts.filter((alert) => alert.severity === "Critical");
  const warningAlerts = activeAlerts.filter((alert) => alert.severity === "Warning");
  const notifiedAlerts = activeAlerts.filter((alert) => alert.status === "IT Notified");

  return (
    <PageMotion>
      <PageHeader title="Alerts & Monitor" description="Live infrastructure, threshold incidents, and escalation state across monitored enterprises." />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard label="Actionable Incidents" value={activeAlerts.length} foot={`${notifiedAlerts.length} already notified`} color="#065f46" icon={BellRing} />
        <MetricCard label="Critical Priority" value={criticalAlerts.length} foot={`${warningAlerts.length} warning signals`} color="#dc2626" footClassName="text-red-600" icon={AlertTriangle} />
        <MetricCard label="Resolved Ledger" value={resolvedAlerts.length} foot="Historical confirmations" color="#2563eb" icon={CheckCircle2} />
      </section>

      <div className="mt-6 grid min-h-190 grid-cols-1 gap-4 xl:grid-cols-12">
        <main className="flex h-full flex-col gap-4 overflow-hidden xl:col-span-8">
          <Panel className="relative flex min-h-0 flex-1 flex-col overflow-hidden border-slate-200/80 bg-linear-to-br from-slate-100 via-white to-emerald-50/70 p-4 shadow-xl ring-1 shadow-slate-900/6">
            <div className="z-10 flex shrink-0 flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-md ring-1 shadow-slate-900/5 ring-white">
              <div className="flex items-center gap-3">
                <span className="text-tanaw-yellow shadow-tanaw-navy/10 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1a1f3c] shadow-md">
                  <AlertTriangle size={17} />
                </span>
                <div>
                  <span className="text-tanaw-navy block text-[10px] font-black tracking-widest uppercase">Active Incident Matrix</span>
                  <span className="mt-0.5 block text-[9px] font-bold tracking-widest text-slate-400 uppercase">Priority stream and escalation state</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="border-tanaw-red/15 bg-tanaw-red/10 text-tanaw-red rounded-full border px-3 py-1 font-mono text-[9px] font-black tracking-widest uppercase">
                  {criticalAlerts.length} Critical
                </span>
                <span className="border-tanaw-green/15 bg-tanaw-green/10 text-tanaw-green rounded-full border px-3 py-1 font-mono text-[9px] font-black tracking-widest uppercase">
                  {activeAlerts.length} Actionable
                </span>
              </div>
            </div>

            <div className="admin-scrollbar mt-4 flex flex-1 flex-col gap-4 overflow-y-auto rounded-2xl border border-slate-200/80 bg-slate-50/90 p-4 shadow-inner ring-1 ring-white">
              {activeAlerts.map((alert, index) => (
                <AlertCard key={alert.id} alert={alert} index={index} loading={loadingAlerts.has(alert.id)} onOpen={() => setSelectedIncident(alert)} onNotify={() => notifyIT(alert.id)} />
              ))}
            </div>
          </Panel>

          <Panel className="flex h-[32%] min-h-64 shrink-0 flex-col overflow-hidden border-slate-200/80 bg-linear-to-br from-white via-slate-50 to-slate-100 shadow-xl ring-1 shadow-slate-900/5">
            <PanelHeader
              title="Historical Ledger (Resolved)"
              icon={FileText}
              right={<span className="bg-tanaw-green/10 text-tanaw-green rounded-full px-2.5 py-1 text-[9px] font-black tracking-widest uppercase">{resolvedAlerts.length} Cleared</span>}
            />
            <div className="admin-scrollbar flex-1 overflow-y-auto bg-white/55 p-3">
              <div className="space-y-2">
                {resolvedAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="group flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm ring-1 ring-slate-900/2 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50/40 hover:shadow-md"
                  >
                    <div className="bg-tanaw-green/10 text-tanaw-green flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
                      <CheckCircle2 size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[9px] font-bold tracking-widest text-slate-400 uppercase">{formatISOTime(alert.timestamp)}</span>
                        <span className="border-tanaw-green/15 bg-tanaw-green/10 text-tanaw-green rounded-full border px-2 py-0.5 text-[8px] font-black tracking-wide uppercase">Resolved</span>
                      </div>
                      <div className="text-tanaw-navy mt-1 truncate text-[11px] font-bold">
                        {alert.enterprise}
                        <span className="font-medium text-slate-500">
                          {" "}
                          - {alert.type} - {alert.desc}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        </main>

        <aside className="flex h-full flex-col gap-4 xl:col-span-4">
          <Panel className="flex min-h-0 flex-col overflow-hidden border-slate-200/80 bg-linear-to-br from-white via-red-50/30 to-red-100/50 shadow-xl ring-1 shadow-slate-900/5">
            <PanelHeader title="Critical Top Thresholds" icon={Activity} />
            <div className="admin-scrollbar flex flex-col gap-4 overflow-y-auto p-4">
              <TechnicalGauge label="San Pedro Apostol Parish Church" value={470} max={500} unit="PAX" status="Critical" />
              <TechnicalGauge label="Lolo Uweng Shrine" value={176} max={200} unit="PAX" status="Warning" />
              <TechnicalGauge label="Balaon ni Lolo Uweng" value={280} max={400} unit="PAX" status="Info" />
            </div>
          </Panel>

          <Panel className="flex flex-1 flex-col overflow-hidden border-slate-200/80 bg-linear-to-br from-white via-emerald-50/25 to-emerald-100/45 shadow-xl ring-1 shadow-slate-900/5">
            <PanelHeader title="System Gateway Status" icon={RadioTower} />
            <div className="admin-scrollbar space-y-3 overflow-y-auto p-4">
              {["Poblacion Node", "Pacita Edge Server", "Cuyab Sync Gateway", "San Antonio Cache"].map((node, index) => (
                <div
                  key={node}
                  className="group flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-3 py-2.5 shadow-sm ring-1 ring-white transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50/55 hover:shadow-md"
                >
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full shadow-[0_0_0_4px_rgba(5,91,37,0.08)] ${index === 2 ? "bg-tanaw-orange" : "bg-tanaw-green"}`} />
                    <span className="text-[11px] font-bold text-slate-700">{node}</span>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-1 font-mono text-[9px] font-bold tracking-wider text-slate-500 uppercase">{index === 2 ? "Sync Lag" : "Healthy"}</span>
                </div>
              ))}
            </div>
          </Panel>
        </aside>
      </div>

      <AnimatePresence>
        {selectedIncident && (
          <IncidentModal incident={selectedIncident} loading={loadingAlerts.has(selectedIncident.id)} onClose={() => setSelectedIncident(null)} onNotify={() => notifyIT(selectedIncident.id)} />
        )}
      </AnimatePresence>
    </PageMotion>
  );
}
