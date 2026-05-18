import { Activity, AlertTriangle, Calendar, Filter, MonitorCheck, Search, Settings2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { MetricCard } from "../../../shared/components/cards";
import { PageHeader } from "../../../shared/components/layout";
import { Panel } from "../../../shared/components/panel";
import { PageMotion, stagger } from "../../../shared/components/ui";
import { auditLogs } from "../../../shared/data";
import type { AuditEvent, AuditLog, AuditRole } from "../../../shared/types";
import { EventBadge, LogDetailsModal, RoleBadge } from "../components";

type EventFilter = "All Events" | "Logins" | "Config Changes" | "Reports" | "Errors";
type RoleFilter = "All Roles" | AuditRole;

const roleFilters: RoleFilter[] = ["All Roles", "Admin", "IT Personnel", "Staff", "Enterprise", "System"];
const eventFilters: EventFilter[] = ["All Events", "Logins", "Config Changes", "Reports", "Errors"];

export function AdminSystemLogsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("All Roles");
  const [eventFilter, setEventFilter] = useState<EventFilter>("All Events");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const filteredLogs = useMemo(
    () =>
      auditLogs.filter((log) => {
        const search = searchTerm.toLowerCase();
        const matchSearch = log.user.toLowerCase().includes(search) || log.desc.toLowerCase().includes(search) || log.module.toLowerCase().includes(search);
        const matchRole = roleFilter === "All Roles" || log.role === roleFilter;
        const matchEvent = matchesEventFilter(log.event, eventFilter);

        return matchSearch && matchRole && matchEvent;
      }),
    [eventFilter, roleFilter, searchTerm],
  );

  const errorCount = auditLogs.filter((log) => log.event === "Error").length;
  const activeSessions = new Set(auditLogs.filter((log) => log.event === "Login").map((log) => log.sessionId)).size + 42;

  return (
    <PageMotion>
      <PageHeader title="System Logs" description="Auditable activity ledger for authentication, configuration, reports, and system events." />

      <motion.section className="grid grid-cols-1 gap-4 xl:grid-cols-4" variants={stagger}>
        <MetricCard label="Total Events (24h)" value="8,421" foot="System-wide activity" color="#2563eb" icon={Activity} />
        <MetricCard label="System Alerts" value={errorCount + 13} foot={`${errorCount} auth error, 13 warnings`} color="#dc2626" footClassName="text-red-600" icon={AlertTriangle} />
        <MetricCard label="Active Sessions" value={activeSessions} foot="Across all user roles" color="#065f46" icon={MonitorCheck} />
        <MetricCard label="Last Config Change" value="11:05 AM" foot="By jdelacruz (IT)" color="#ff6204" footClassName="text-orange-600" icon={Settings2} />
      </motion.section>

      <Panel className="relative mt-6 flex min-h-155 flex-col overflow-hidden">
        <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-slate-200/80 bg-linear-to-r from-white via-slate-50 to-emerald-50/40 p-4">
          <div className="relative min-w-62.5 flex-1">
            <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search user, description, or module..."
              className="focus:border-tanaw-green focus:ring-tanaw-green/10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 pl-9 text-[11px] font-semibold tracking-wide text-slate-600 uppercase shadow-sm transition-all outline-none focus:ring-2"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <select className="admin-select" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value as RoleFilter)}>
            {roleFilters.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
          <select className="admin-select" value={eventFilter} onChange={(event) => setEventFilter(event.target.value as EventFilter)}>
            {eventFilters.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
          <input type="date" className="admin-select" />
          <button
            type="button"
            className="bg-tanaw-green hover:bg-tanaw-lime flex items-center gap-2 rounded-lg px-4 py-2 text-[10px] font-black tracking-widest text-white uppercase shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
          >
            <Filter size={12} /> Filter
          </button>
        </div>

        <div className="admin-scrollbar flex-1 overflow-auto bg-white">
          <table className="w-full border-separate border-spacing-0 text-left whitespace-nowrap">
            <thead className="sticky top-0 z-10 bg-white/95 shadow-sm backdrop-blur">
              <tr>
                {["Timestamp", "User Identifier", "Role", "Module", "Event", "Technical Description"].map((header) => (
                  <th key={header} className="border-b border-slate-200 bg-slate-50/95 p-3 text-[9px] font-black tracking-widest text-slate-500 uppercase">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-[11px] font-medium text-slate-700">
              {filteredLogs.map((log) => (
                <tr key={log.id} onClick={() => setSelectedLog(log)} className="group cursor-pointer transition-all duration-150 hover:bg-emerald-50/55">
                  <td className="border-r border-b border-slate-100 p-3 font-mono text-[10px] text-slate-500 transition-colors group-hover:border-emerald-100">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={10} /> {log.time}
                    </div>
                  </td>
                  <td className="text-tanaw-navy group-hover:text-tanaw-green border-b border-slate-100 p-3 font-bold transition-colors group-hover:border-emerald-100">{log.user}</td>
                  <td className="border-b border-slate-100 p-3 transition-colors group-hover:border-emerald-100">
                    <RoleBadge role={log.role} />
                  </td>
                  <td className="border-b border-slate-100 p-3 text-[10px] font-black tracking-wide text-slate-500 uppercase transition-colors group-hover:border-emerald-100">{log.module}</td>
                  <td className="border-b border-slate-100 p-3 transition-colors group-hover:border-emerald-100">
                    <EventBadge event={log.event} />
                  </td>
                  <td className="min-w-75 border-b border-slate-100 p-3 leading-relaxed whitespace-normal text-slate-600 transition-colors group-hover:border-emerald-100">{log.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex shrink-0 items-center justify-between border-t border-slate-200/80 bg-slate-50 px-4 py-3 text-[9px] font-black tracking-widest text-slate-400 uppercase">
          <span>End of ledger</span>
          <span>Showing {filteredLogs.length} Events</span>
        </div>
      </Panel>

      <AnimatePresence>{selectedLog && <LogDetailsModal log={selectedLog} onClose={() => setSelectedLog(null)} />}</AnimatePresence>
    </PageMotion>
  );
}

function matchesEventFilter(event: AuditEvent, filter: EventFilter) {
  return (
    filter === "All Events" ||
    (filter === "Logins" && event === "Login") ||
    (filter === "Config Changes" && event === "Update") ||
    (filter === "Reports" && ["Submit", "Export"].includes(event)) ||
    (filter === "Errors" && event === "Error")
  );
}
