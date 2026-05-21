import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, ClipboardCheck, Clock, Users } from "lucide-react";
import { motion } from "motion/react";
import { MetricCard } from "../../../shared/components/cards";
import { PageHeader } from "../../../shared/components/layout";
import { PageMotion, stagger } from "../../../shared/components/ui";
import { analyticsPeriods } from "../../../shared/data";
import type { AnalyticsPeriod } from "../../../shared/types";

export function StaffAnalyticsPage() {
  const [period, setPeriod] = useState<AnalyticsPeriod>("October 2023");
  const activeData = analyticsPeriods[period];

  return (
    <PageMotion>
      <PageHeader
        title="Comparative Analytics & Anomalies"
        description="Compare enterprise performance to identify discrepancies before consolidation."
      />

      <motion.section className="grid grid-cols-1 gap-4 md:grid-cols-4" variants={stagger}>
        <MetricCard color="#065f46" label="Total Aggregated Entries" value={activeData.entries} foot={activeData.trend} footClassName="text-tgreen-light" icon={Activity} />
        <MetricCard color="#2563eb" label="Est. Unique People" value={activeData.unique} foot="Deduplicated Baseline" icon={Users} />
        <MetricCard color="#f59e0b" label="Reports Compliance" value={activeData.compliance} foot={activeData.complianceRate} footClassName="text-yellow-600" icon={ClipboardCheck} />
        <div className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Reporting Period</span>
            <p className="mt-1 text-[11px] text-gray-500 leading-snug">Filter comparative data and telemetry logs by calendar month.</p>
          </div>
          <div className="mt-4">
            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value as AnalyticsPeriod)}
              className="w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition outline-none hover:border-gray-400 focus:ring-1 focus:ring-tgreen-dark focus:border-tgreen-dark"
            >
              <option value="October 2023">October 2023</option>
              <option value="September 2023">September 2023</option>
            </select>
          </div>
        </div>
      </motion.section>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="col-span-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-6 text-sm font-semibold text-gray-900">Enterprise Traffic Comparison</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeData.chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,0.04)" }}
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                <Bar dataKey="entries" name="Total Entries" fill="#065f46" radius={[2, 2, 0, 0]} maxBarSize={40} />
                <Bar dataKey="unique" name="Unique Pax" fill="#3b82f6" radius={[2, 2, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Real-time Submission Log</h3>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <div className="space-y-4 overflow-y-auto max-h-75 pr-1">
            <SubmissionLogItem enterprise="Lolo Uweng Shrine" timestamp="Just now" />
            <SubmissionLogItem enterprise="San Pedro Town Center" timestamp="4 mins ago" />
            <SubmissionLogItem enterprise="Plaza Pacita Commercial Hub" timestamp="12 mins ago" />
            <SubmissionLogItem enterprise="Archies" timestamp="35 mins ago" />
          </div>
        </section>
      </div>
    </PageMotion>
  );
}

function SubmissionLogItem({ enterprise, timestamp }: { enterprise: string; timestamp: string }) {
  return (
    <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3.5 transition hover:shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold tracking-wide uppercase text-emerald-800">{enterprise}</span>
        <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
          <Clock size={10} /> {timestamp}
        </span>
      </div>
      <p className="mt-1 text-xs text-emerald-700 leading-normal">Submitted monthly report.</p>
    </div>
  );
}
