import { AlertTriangle, Bell, Building2, FileText, Search, Users, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { MetricCard } from "../../../shared/components/cards";
import { PageHeader } from "../../../shared/components/layout";
import { Panel } from "../../../shared/components/panel";
import { ModalPortal, PageMotion, stagger } from "../../../shared/components/ui";
import { enterpriseAccounts, systemActivities } from "../../../shared/data";
import type { AlertSeverity, SystemActivity, SystemActivityStatus, SystemActivityType } from "../../../shared/types";

type SeverityFilter = "All Severities" | AlertSeverity;
type ActivityFilter = "All Activities" | "Account Activity" | "Enterprise Setup" | "Technical Incident" | "System Settings" | "Notifications" | "Sync Events";

const severityFilters: SeverityFilter[] = ["All Severities", "Info", "Warning", "Critical"];
const activityFilters: ActivityFilter[] = ["All Activities", "Account Activity", "Enterprise Setup", "Technical Incident", "System Settings", "Notifications", "Sync Events"];
const unresolvedStatuses = new Set<SystemActivityStatus>(["Open", "Pending", "Acknowledged"]);

export function ITSystemLogsPage() {
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState<SeverityFilter>("All Severities");
  const [activityType, setActivityType] = useState<ActivityFilter>("All Activities");
  const [enterprise, setEnterprise] = useState("All Enterprises");
  const [selectedActivity, setSelectedActivity] = useState<SystemActivity | null>(null);

  const enterpriseFilters = useMemo(() => ["All Enterprises", ...new Set(enterpriseAccounts.map((account) => account.enterpriseName))], []);
  const filteredActivities = useMemo(
    () =>
      systemActivities.filter((activity) => {
        const haystack = `${activity.summary} ${activity.accountName ?? ""} ${activity.initiatedBy} ${activity.enterprise ?? ""} ${activity.device ?? ""} ${activity.type}`.toLowerCase();
        const matchesSearch = haystack.includes(search.trim().toLowerCase());
        const matchesSeverity = severity === "All Severities" || activity.severity === severity;
        const matchesType = matchesActivityTypeFilter(activity.type, activityType);
        const matchesEnterprise = enterprise === "All Enterprises" || activity.enterprise === enterprise;
        return matchesSearch && matchesSeverity && matchesType && matchesEnterprise;
      }),
    [activityType, enterprise, search, severity],
  );
  const openAlerts = systemActivities.filter((activity) => isUnresolved(activity.status) && isTechnicalAlert(activity)).length;
  const offlineDevices = new Set(systemActivities.filter((activity) => isUnresolved(activity.status) && activity.device && activity.deviceState === "Offline").map((activity) => activity.device)).size;
  const accountChangesToday = systemActivities.filter((activity) => activity.type === "Account Activity" && activity.timePeriod === "Today").length;
  const pendingEnterpriseAttention = systemActivities.filter((activity) => isUnresolved(activity.status) && activity.requiresEnterpriseAttention).length;

  return (
    <PageMotion>
      <PageHeader title="System Activity" description="Review recent operational events, account activities, and technical incidents requiring attention." />

      <motion.section className="grid grid-cols-1 gap-4 md:grid-cols-4" variants={stagger}>
        <MetricCard label="Open Alerts" value={openAlerts} foot="Unresolved technical issues" color="#dc2626" footClassName="text-red-600" icon={Bell} />
        <MetricCard label="Offline Devices" value={offlineDevices} foot="Cameras and gateways" color="#f59e0b" footClassName="text-yellow-600" icon={AlertTriangle} />
        <MetricCard label="Account Changes Today" value={accountChangesToday} foot="Recent access updates" color="#2563eb" icon={Users} />
        <MetricCard label="Pending Enterprise Attention" value={pendingEnterpriseAttention} foot="Coordination still needed" color="#065f46" icon={Building2} />
      </motion.section>

      <Panel className="mt-6 overflow-hidden">
        <div className="grid grid-cols-1 gap-3 border-b border-gray-200 bg-gray-50 p-4 xl:grid-cols-[minmax(260px,1fr)_auto_auto_auto_auto]">
          <div className="relative">
            <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search activities, enterprises, accounts..."
              className="focus:ring-tgreen-dark w-full rounded-lg border border-gray-300 bg-white py-2 pr-4 pl-9 text-sm text-gray-900 transition outline-none focus:ring-1"
            />
          </div>
          <FilterSelect value={severity} onChange={(value) => setSeverity(value as SeverityFilter)} options={severityFilters} />
          <FilterSelect value={activityType} onChange={(value) => setActivityType(value as ActivityFilter)} options={activityFilters} />
          <FilterSelect value={enterprise} onChange={setEnterprise} options={enterpriseFilters} />
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setSeverity("All Severities");
              setActivityType("All Activities");
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
                {["Time", "Severity", "Activity Type", "Enterprise", "Affected Device", "Summary", "Initiated By", "Status", "Action"].map((heading) => (
                  <th key={heading} className="px-5 py-4">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-800">
              {filteredActivities.map((activity) => (
                <tr key={activity.id} className="hover:bg-tgreen-dark/5 transition">
                  <td className="px-5 py-4 font-mono text-xs text-gray-500">{activity.time}</td>
                  <td className="px-5 py-4">
                    <SeverityBadge severity={activity.severity} />
                  </td>
                  <td className="px-5 py-4 text-xs font-bold text-gray-900">{activity.type}</td>
                  <td className="px-5 py-4 text-xs">{activity.enterprise ?? "N/A"}</td>
                  <td className="px-5 py-4 text-xs">{activity.device ?? "N/A"}</td>
                  <td className="max-w-md px-5 py-4 text-xs leading-relaxed text-gray-600">{activity.summary}</td>
                  <td className="px-5 py-4 text-xs">{activity.initiatedBy}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={activity.status} />
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => setSelectedActivity(activity)}
                      className="text-tgreen-dark hover:bg-tgreen-dark/5 inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-[10px] font-bold transition"
                    >
                      <FileText size={13} /> View
                    </button>
                  </td>
                </tr>
              ))}
              {filteredActivities.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-5 py-8 text-center text-gray-500">
                    No activities match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <AnimatePresence>{selectedActivity && <ActivityDetailsModal activity={selectedActivity} onClose={() => setSelectedActivity(null)} />}</AnimatePresence>
    </PageMotion>
  );
}

function ActivityDetailsModal({ activity, onClose }: { activity: SystemActivity; onClose: () => void }) {
  return (
    <ModalPortal>
      <motion.div className="bg-charcoal-950/70 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.section
          className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl"
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <header className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4">
            <div>
              <p className="font-mono text-[10px] font-bold text-gray-400">{activity.id}</p>
              <h2 className="text-lg font-bold text-gray-900">Activity Details</h2>
            </div>
            <button onClick={onClose} className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-500 transition hover:bg-white hover:text-gray-900">
              Close
            </button>
          </header>
          <div className="grow overflow-y-auto p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Detail label="Activity ID" value={activity.id} />
              <Detail label="Severity" value={activity.severity} />
              <Detail label="Activity Type" value={activity.type} />
              <Detail label="Time" value={activity.time} />
              <Detail label="Initiated By" value={activity.initiatedBy} />
              <Detail label="Status" value={activity.status} />
              <Detail label="Enterprise" value={activity.enterprise ?? "N/A"} />
              <Detail label="Affected Device" value={activity.device ?? "N/A"} />
              <div className="md:col-span-2">
                <Detail label="Summary" value={activity.summary} />
              </div>
              <div className="md:col-span-2">
                <Detail label="Recommended Action" value={activity.recommendedAction} />
              </div>
            </div>
          </div>
        </motion.section>
      </motion.div>
    </ModalPortal>
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

function StatusBadge({ status }: { status: SystemActivityStatus }) {
  const classes: Record<SystemActivityStatus, string> = {
    Open: "bg-red-50 text-red-700",
    Resolved: "bg-emerald-50 text-emerald-700",
    Completed: "bg-blue-50 text-blue-700",
    Pending: "bg-yellow-50 text-yellow-700",
    Acknowledged: "bg-slate-100 text-slate-700",
  };
  return <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${classes[status]}`}>{status}</span>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <p className="mb-1 text-[10px] font-bold tracking-wide text-gray-500 uppercase">{label}</p>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function matchesActivityTypeFilter(type: SystemActivityType, filter: ActivityFilter) {
  return filter === "All Activities" || (filter === "Notifications" && type === "Notification") || (filter === "Sync Events" && type === "Sync Event") || type === filter;
}

function isTechnicalAlert(activity: SystemActivity) {
  return activity.type === "Technical Incident" || activity.type === "Sync Event";
}

function isUnresolved(status: SystemActivityStatus) {
  return unresolvedStatuses.has(status);
}
