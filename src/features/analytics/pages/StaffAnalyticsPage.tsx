import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, ClipboardCheck, Users, Zap } from "lucide-react";
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
        action={
          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value as AnalyticsPeriod)}
            className="cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition outline-none hover:border-gray-400"
          >
            <option value="October 2023">October 2023</option>
            <option value="September 2023">September 2023</option>
          </select>
        }
      />

      <motion.section className="grid grid-cols-1 gap-4 md:grid-cols-4" variants={stagger}>
        <MetricCard color="#065f46" label="Total Aggregated Entries" value={activeData.entries} foot={activeData.trend} footClassName="text-tgreen-light" icon={Activity} />
        <MetricCard color="#2563eb" label="Est. Unique People" value={activeData.unique} foot="Deduplicated Baseline" icon={Users} />
        <MetricCard color="#f59e0b" label="Reports Compliance" value={activeData.compliance} foot={activeData.complianceRate} footClassName="text-yellow-600" icon={ClipboardCheck} />
        <MetricCard color="#9ca3af" label="Avg. Peak Utilization" value={activeData.utilization} foot="Across registered zones" icon={Zap} />
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

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-6 text-sm font-semibold text-gray-900">Detected Anomalies</h3>
          <div className="space-y-4">
            <Anomaly color="red" title="Missing Edge Data">
              <strong>Town Center Park</strong> reports exactly 0 exits on {period.split(" ")[0]} 5. High variance detected against historical baseline.
            </Anomaly>
            <Anomaly color="yellow" title="Utilization Spike">
              <strong>Plaza Mall San Pedro</strong> exceeded 90% utilization multiple times over the weekend period.
            </Anomaly>
            <Anomaly color="blue" title="Status Discrepancy">
              2 reports in the current batch remain in Pending Review status.
            </Anomaly>
          </div>
        </section>
      </div>
    </PageMotion>
  );
}

function Anomaly({ color, title, children }: { color: "red" | "yellow" | "blue"; title: string; children: React.ReactNode }) {
  const colors = {
    red: "bg-red-50 border-red-100 text-red-700",
    yellow: "bg-yellow-50 border-yellow-100 text-yellow-700",
    blue: "bg-blue-50 border-blue-100 text-blue-700",
  };

  return (
    <div className={`rounded-lg border p-4 ${colors[color]}`}>
      <div className="mb-1.5 text-xs font-bold tracking-wide uppercase">{title}</div>
      <p className="text-xs leading-relaxed text-gray-700">{children}</p>
    </div>
  );
}
