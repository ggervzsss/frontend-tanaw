import { AlertTriangle, Download, FileText, Search, ShieldCheck, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { MetricCard } from "../../../shared/components/cards";
import { PageHeader } from "../../../shared/components/layout";
import { Panel } from "../../../shared/components/panel";
import { PageMotion, stagger } from "../../../shared/components/ui";
import { technicalLogs } from "../../../shared/data";
import type { AlertSeverity, TechnicalLog } from "../../../shared/types";

type SeverityFilter = "All Severities" | AlertSeverity;
type EventFilter = "All Event Types" | string;

const severityFilters: SeverityFilter[] = ["All Severities", "Info", "Warning", "Critical"];

export function ITSystemLogsPage() {
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState<SeverityFilter>("All Severities");
  const [eventType, setEventType] = useState<EventFilter>("All Event Types");
  const [enterprise, setEnterprise] = useState("All Enterprises");
  const [selectedLog, setSelectedLog] = useState<TechnicalLog | null>(null);

  const eventTypes = useMemo(() => ["All Event Types", ...new Set(technicalLogs.map((log) => log.eventType))], []);
  const enterprises = useMemo(() => ["All Enterprises", ...new Set(technicalLogs.map((log) => log.enterprise).filter(Boolean) as string[])], []);
  const filteredLogs = useMemo(
    () =>
      technicalLogs.filter((log) => {
        const haystack = `${log.desc} ${log.performedBy} ${log.enterprise ?? ""} ${log.device ?? ""} ${log.eventType}`.toLowerCase();
        const matchesSearch = haystack.includes(search.trim().toLowerCase());
        const matchesSeverity = severity === "All Severities" || log.severity === severity;
        const matchesType = eventType === "All Event Types" || log.eventType === eventType;
        const matchesEnterprise = enterprise === "All Enterprises" || log.enterprise === enterprise;
        return matchesSearch && matchesSeverity && matchesType && matchesEnterprise;
      }),
    [enterprise, eventType, search, severity],
  );

  return (
    <PageMotion>
      <PageHeader
        title="System Logs"
        description="Review technical events across accounts, gateways, cameras, sync jobs, and edge services."
        action={
          <button
            type="button"
            onClick={() => toast.success("Filtered technical logs export prepared.")}
            className="bg-tgreen-dark hover:bg-tgreen-light inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-md transition"
          >
            <Download size={16} /> Export Logs
          </button>
        }
      />

      <motion.section className="grid grid-cols-1 gap-4 md:grid-cols-4" variants={stagger}>
        <MetricCard label="Filtered Logs" value={filteredLogs.length} foot="Matching current view" color="#2563eb" icon={FileText} />
        <MetricCard
          label="Critical"
          value={filteredLogs.filter((log) => log.severity === "Critical").length}
          foot="Immediate attention"
          color="#dc2626"
          footClassName="text-red-600"
          icon={AlertTriangle}
        />
        <MetricCard
          label="Camera Events"
          value={filteredLogs.filter((log) => log.eventType === "Camera").length}
          foot="Device health trail"
          color="#f59e0b"
          footClassName="text-yellow-600"
          icon={ShieldCheck}
        />
        <MetricCard label="Sync Events" value={filteredLogs.filter((log) => log.eventType === "Sync").length} foot="Gateway transfer trail" color="#065f46" icon={Download} />
      </motion.section>

      <Panel className="mt-6 overflow-hidden">
        <div className="grid grid-cols-1 gap-3 border-b border-gray-200 bg-gray-50 p-4 xl:grid-cols-[minmax(260px,1fr)_auto_auto_auto_auto]">
          <div className="relative">
            <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search logs, operators, enterprise, or device"
              className="focus:ring-tgreen-dark w-full rounded-lg border border-gray-300 bg-white py-2 pr-4 pl-9 text-sm text-gray-900 transition outline-none focus:ring-1"
            />
          </div>
          <FilterSelect value={severity} onChange={(value) => setSeverity(value as SeverityFilter)} options={severityFilters} />
          <FilterSelect value={eventType} onChange={setEventType} options={eventTypes} />
          <FilterSelect value={enterprise} onChange={setEnterprise} options={enterprises} />
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setSeverity("All Severities");
              setEventType("All Event Types");
              setEnterprise("All Enterprises");
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-bold text-gray-600 transition hover:bg-gray-50"
          >
            <X size={14} /> Reset
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-[10px] font-bold tracking-wider text-gray-500 uppercase">
              <tr>
                {["Time", "Severity", "Event Type", "Enterprise", "Device", "Description", "Performed By", "Action"].map((heading) => (
                  <th key={heading} className="px-5 py-4">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-800">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-tgreen-dark/5 transition">
                  <td className="px-5 py-4 font-mono text-xs text-gray-500">{log.time}</td>
                  <td className="px-5 py-4">
                    <SeverityBadge severity={log.severity} />
                  </td>
                  <td className="px-5 py-4 text-xs font-bold text-gray-900">{log.eventType}</td>
                  <td className="px-5 py-4 text-xs">{log.enterprise ?? "Not applicable"}</td>
                  <td className="px-5 py-4 text-xs">{log.device ?? "Not applicable"}</td>
                  <td className="max-w-md px-5 py-4 text-xs leading-relaxed text-gray-600">{log.desc}</td>
                  <td className="px-5 py-4 text-xs">{log.performedBy}</td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="text-tgreen-dark hover:bg-tgreen-dark/5 inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-[10px] font-bold transition"
                    >
                      <FileText size={13} /> View
                    </button>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-gray-500">
                    No technical logs match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <AnimatePresence>{selectedLog && <TechnicalLogModal log={selectedLog} onClose={() => setSelectedLog(null)} />}</AnimatePresence>
    </PageMotion>
  );
}

function TechnicalLogModal({ log, onClose }: { log: TechnicalLog; onClose: () => void }) {
  return (
    <motion.div className="bg-charcoal-950/70 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.section
        className="w-full max-w-3xl overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl"
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      >
        <header className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4">
          <div>
            <p className="font-mono text-[10px] font-bold text-gray-400">{log.id}</p>
            <h2 className="text-lg font-bold text-gray-900">Technical Log Detail</h2>
          </div>
          <button onClick={onClose} className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-500 transition hover:bg-white hover:text-gray-900">
            Close
          </button>
        </header>
        <div className="grid gap-4 p-6 md:grid-cols-2">
          <Detail label="Severity" value={log.severity} />
          <Detail label="Event Type" value={log.eventType} />
          <Detail label="Time" value={log.time} />
          <Detail label="Performed By" value={log.performedBy} />
          <Detail label="Enterprise" value={log.enterprise ?? "Not applicable"} />
          <Detail label="Device" value={log.device ?? "Not applicable"} />
          <div className="md:col-span-2">
            <Detail label="Technical Description" value={log.desc} />
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}

function FilterSelect({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: readonly string[] }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none">
      {options.map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>
  );
}

function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  const classes: Record<AlertSeverity, string> = {
    Info: "bg-blue-50 text-blue-700",
    Warning: "bg-yellow-50 text-yellow-700",
    Critical: "bg-red-50 text-red-700",
  };
  return <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${classes[severity]}`}>{severity}</span>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <p className="mb-1 text-[10px] font-bold tracking-wide text-gray-500 uppercase">{label}</p>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}
