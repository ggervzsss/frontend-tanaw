import { Activity, Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { PageHeader } from "../../../shared/components/layout";
import { Panel } from "../../../shared/components/panel";
import { EmptyState, ModalPortal, PageMotion } from "../../../shared/components/ui";
import { systemActivities } from "../../../shared/data";
import type { SystemActivity, SystemActivityType } from "../../../shared/types";
import { activityTimeRanges, isWithinActivityTimeRange } from "../../../shared/utils";
import type { ActivityTimeRange } from "../../../shared/utils";

const defaultTypeOptions = ["All Types", "LOGIN", "CONNECTION", "ACCOUNT CONFIG", "ENTERPRISE CONFIG", "IT ACTION", "SYSTEM"];
const defaultAccountOptions = ["All Accounts", "LGU Account", "Enterprise Account", "IT Personnel", "System"];

export function ITSystemLogsPage() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [accountFilter, setAccountFilter] = useState("All Accounts");
  const [timeRange, setTimeRange] = useState<ActivityTimeRange>("All Time");
  const [selectedActivity, setSelectedActivity] = useState<SystemActivity | null>(null);

  const dynamicTypeOptions = useMemo(() => getTypeOptions(accountFilter), [accountFilter]);
  const dynamicAccountOptions = useMemo(() => getAccountOptions(typeFilter), [typeFilter]);

  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value);
    if (!getAccountOptions(value).includes(accountFilter)) {
      setAccountFilter("All Accounts");
    }
  };

  const handleAccountFilterChange = (value: string) => {
    setAccountFilter(value);
    if (!getTypeOptions(value).includes(typeFilter)) {
      setTypeFilter("All Types");
    }
  };

  const filteredActivities = useMemo(() => {
    return systemActivities.filter((activity) => {
      const displayName = activity.enterprise ?? activity.accountName ?? activity.initiatedBy;
      const haystack = `${activity.summary} ${displayName}`.toLowerCase();
      const matchesQuery = haystack.includes(query.trim().toLowerCase());
      const matchesType = typeFilter === "All Types" || activity.type === typeFilter;
      const matchesAccount = accountFilter === "All Accounts" || activity.actorType === accountFilter;
      const matchesTimeRange = isWithinActivityTimeRange(activity.time, timeRange);
      return matchesQuery && matchesType && matchesAccount && matchesTimeRange;
    });
  }, [query, typeFilter, accountFilter, timeRange]);

  return (
    <PageMotion>
      <PageHeader title="System Activity" description="IT-visible activity stream for account events, enterprise connectivity, configuration changes, and automated system actions." />

      <Panel className="overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-0 flex-1 sm:min-w-64">
              <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search summary or name"
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pr-4 pl-9 text-sm text-gray-900 transition outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>
            <FilterSelect value={typeFilter} onChange={handleTypeFilterChange} options={dynamicTypeOptions} />
            <FilterSelect value={accountFilter} onChange={handleAccountFilterChange} options={dynamicAccountOptions} />
            <FilterSelect value={timeRange} onChange={(value) => setTimeRange(value as ActivityTimeRange)} options={activityTimeRanges} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-190 table-fixed text-left text-sm">
            <colgroup>
              <col className="w-[18%]" />
              <col className="w-[15%]" />
              <col className="w-[18%]" />
              <col className="w-[20%]" />
              <col className="w-[29%]" />
            </colgroup>
            <thead className="bg-gray-50 text-[10px] font-bold tracking-wider text-gray-500 uppercase">
              <tr>
                {["Timestamp", "Type", "Actor", "Target", "Summary"].map((heading) => (
                  <th key={heading} className="px-3 py-4 whitespace-nowrap lg:px-4">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-800">
              {filteredActivities.map((activity) => (
                <tr key={activity.id} onClick={() => setSelectedActivity(activity)} className="hover:bg-tgreen-dark/5 cursor-pointer transition">
                  <td className="px-3 py-4 font-mono text-xs whitespace-nowrap text-gray-500 lg:px-4">{activity.time}</td>
                  <td className="px-3 py-4 whitespace-nowrap lg:px-4">
                    <TypeBadge type={activity.type} />
                  </td>
                  <td className="px-3 py-4 text-xs whitespace-nowrap lg:px-4">
                    <span className="block truncate font-bold text-gray-900">{activity.initiatedBy}</span>
                    <span className="text-[10px] font-semibold text-gray-500 uppercase">{activity.actorType}</span>
                  </td>
                  <td className="truncate px-3 py-4 text-xs whitespace-nowrap text-gray-600 lg:px-4">{activity.target ?? activity.enterprise ?? activity.accountName ?? "System"}</td>
                  <td className="px-3 py-4 text-xs leading-relaxed text-gray-600 lg:px-4">{activity.summary}</td>
                </tr>
              ))}
              {filteredActivities.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <EmptyState icon={Activity} title="No system activity" description="System activity records will appear here once users, devices, and automated events are connected." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-4 py-3 text-[10px] font-bold tracking-wide text-gray-500 uppercase">
          <span>Showing {filteredActivities.length} activities</span>
          <span>{timeRange}</span>
        </div>
      </Panel>

      <AnimatePresence>{selectedActivity && <ActivityDetailsModal activity={selectedActivity} onClose={() => setSelectedActivity(null)} />}</AnimatePresence>
    </PageMotion>
  );
}

function getTypeOptions(accountFilter: string) {
  if (accountFilter === "All Accounts") return defaultTypeOptions;
  const relevantActivities = systemActivities.filter((activity) => activity.actorType === accountFilter);
  const types = new Set(relevantActivities.map((activity) => activity.type));
  return ["All Types", ...Array.from(types).sort()];
}

function getAccountOptions(typeFilter: string) {
  if (typeFilter === "All Types") return defaultAccountOptions;
  const relevantActivities = systemActivities.filter((activity) => activity.type === typeFilter);
  const accounts = new Set(relevantActivities.map((activity) => activity.actorType));
  return ["All Accounts", ...Array.from(accounts).sort()];
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

function ActivityDetailsModal({ activity, onClose }: { activity: SystemActivity; onClose: () => void }) {
  const relatedEntity = activity.enterprise ? <Detail label="Enterprise" value={activity.enterprise} /> : activity.accountName ? <Detail label="Account" value={activity.accountName} /> : null;

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
            <Detail label="Type" value={activity.type} />
            <Detail label="Actor" value={`${activity.initiatedBy} (${activity.actorType})`} />
            <Detail label="Timestamp" value={activity.time} />
            <Detail label="Target" value={activity.target ?? "N/A"} />
            {relatedEntity}
            {activity.device && <Detail label="Device" value={activity.device} />}
            <div className="md:col-span-2">
              <Detail label="Summary" value={activity.summary} />
            </div>
          </div>
        </motion.section>
      </motion.div>
    </ModalPortal>
  );
}

function TypeBadge({ type }: { type: SystemActivityType }) {
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

function Detail({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <p className="mb-1 text-[10px] font-bold tracking-wide text-gray-500 uppercase">{label}</p>
      <p className="text-sm leading-relaxed font-semibold text-gray-900">{value}</p>
    </div>
  );
}
