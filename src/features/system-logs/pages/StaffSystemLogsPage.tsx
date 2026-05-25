import { Activity, Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { PageHeader } from "../../../shared/components/layout";
import { Panel } from "../../../shared/components/panel";
import { EmptyState, ModalPortal, PageMotion } from "../../../shared/components/ui";
import { useActivityLogs } from "../../../shared/hooks/useActivityLogs";
import type { LogSeverity, SystemLog, SystemLogCategory } from "../../../shared/types";
import { activityTimeRanges, isWithinActivityTimeRange } from "../../../shared/utils";
import type { ActivityTimeRange } from "../../../shared/utils";

type CategoryFilter = "All Categories" | SystemLogCategory;
type SeverityFilter = "All Severities" | LogSeverity;

const categoryFilters: CategoryFilter[] = ["All Categories", "Staff Submission", "Staff Operation"];
const severityFilters: SeverityFilter[] = ["All Severities", "Critical", "Warning", "Info", "Success"];

export function StaffSystemLogsPage() {
  const { logs, isLoading } = useActivityLogs();
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("All Categories");
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("All Severities");
  const [timeRange, setTimeRange] = useState<ActivityTimeRange>("All Time");
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);

  const filteredLogs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return [...logs]
      .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
      .filter((log) => {
        const searchable = [log.id, log.category, log.severity, log.actor, log.action, log.target, log.summary, log.sourceId ?? ""].join(" ").toLowerCase();
        const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
        const matchesCategory = categoryFilter === "All Categories" || log.category === categoryFilter;
        const matchesSeverity = severityFilter === "All Severities" || log.severity === severityFilter;
        const matchesTimeRange = isWithinActivityTimeRange(log.timestamp, timeRange);
        return matchesQuery && matchesCategory && matchesSeverity && matchesTimeRange;
      });
  }, [categoryFilter, logs, query, severityFilter, timeRange]);

  return (
    <PageMotion>
      <PageHeader title="Activity Logs" description="Submission and report-processing activity visible to LGU Staff accounts." />

      <Panel className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 bg-gray-50 p-4">
          <div className="relative min-w-65 flex-1">
            <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search report, action, target, or summary"
              className="focus:ring-tgreen-dark w-full rounded-lg border border-gray-300 bg-white py-2 pr-4 pl-9 text-sm text-gray-900 transition outline-none focus:ring-1"
            />
          </div>
          <FilterSelect value={categoryFilter} onChange={(value) => setCategoryFilter(value as CategoryFilter)} options={categoryFilters} />
          <FilterSelect value={severityFilter} onChange={(value) => setSeverityFilter(value as SeverityFilter)} options={severityFilters} />
          <FilterSelect value={timeRange} onChange={(value) => setTimeRange(value as ActivityTimeRange)} options={activityTimeRanges} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-190 table-fixed text-left text-sm">
            <colgroup>
              <col className="w-[18%]" />
              <col className="w-[16%]" />
              <col className="w-[14%]" />
              <col className="w-[22%]" />
              <col className="w-[30%]" />
            </colgroup>
            <thead className="bg-gray-50 text-[10px] font-bold tracking-wider text-gray-500 uppercase">
              <tr>
                {["Timestamp", "Category", "Severity", "Action / Target", "Summary"].map((heading) => (
                  <th key={heading} className="px-4 py-4 whitespace-nowrap">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-800">
              {filteredLogs.map((log) => (
                <tr key={log.id} onClick={() => setSelectedLog(log)} className="hover:bg-tgreen-dark/5 cursor-pointer transition">
                  <td className="px-4 py-4 font-mono text-xs text-gray-500">{formatLogTimestamp(log.timestamp)}</td>
                  <td className="px-4 py-4">
                    <Badge value={log.category} tone={log.category === "Staff Operation" ? "green" : "teal"} />
                  </td>
                  <td className="px-4 py-4">
                    <Badge value={log.severity} tone={log.severity === "Warning" || log.severity === "Critical" ? "amber" : "blue"} />
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-semibold text-gray-900">{log.action}</div>
                    <div className="mt-1 truncate text-xs text-gray-500">{log.target}</div>
                  </td>
                  <td className="px-4 py-4 text-xs leading-relaxed text-gray-600">{log.summary}</td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      icon={Activity}
                      title={isLoading ? "Loading activity logs" : "No staff activity logs"}
                      description={isLoading ? "Fetching live submission activity." : "Submission and report-processing logs will appear here once staff activity is recorded."}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <AnimatePresence>{selectedLog && <LogDetailsModal log={selectedLog} onClose={() => setSelectedLog(null)} />}</AnimatePresence>
    </PageMotion>
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

function Badge({ value, tone }: { value: string; tone: "green" | "teal" | "blue" | "amber" }) {
  const classes = {
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    teal: "border-teal-200 bg-teal-50 text-teal-700",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
  };
  return <span className={`rounded border px-2.5 py-1 text-[10px] font-bold tracking-wide whitespace-nowrap uppercase ${classes[tone]}`}>{value}</span>;
}

function LogDetailsModal({ log, onClose }: { log: SystemLog; onClose: () => void }) {
  return (
    <ModalPortal>
      <motion.div className="bg-charcoal-950/70 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.section
          className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-2xl"
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
        >
          <header className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4">
            <div>
              <p className="font-mono text-[10px] font-bold text-gray-400">{log.id}</p>
              <h2 className="text-lg font-bold text-gray-900">Activity Details</h2>
            </div>
            <button onClick={onClose} className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-500 transition hover:bg-white hover:text-gray-900">
              Close
            </button>
          </header>
          <div className="grid gap-4 p-6 md:grid-cols-2">
            <Detail label="Timestamp" value={formatLogTimestamp(log.timestamp)} />
            <Detail label="Category" value={log.category} />
            <Detail label="Actor" value={`${log.actor} (${log.actorRole})`} />
            <Detail label="Action" value={log.action} />
            <Detail label="Target" value={log.target} />
            <Detail label="Severity" value={log.severity} />
            <div className="md:col-span-2">
              <Detail label="Summary" value={log.summary} />
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

function formatLogTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? timestamp : date.toLocaleString();
}
