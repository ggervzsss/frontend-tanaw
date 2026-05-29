import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, ClipboardCheck, Clock, Users } from "lucide-react";
import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { useReportStore } from "@/app/store/reportStore";
import { MetricCard } from "@/shared/components/cards";
import { PageHeader } from "@/shared/components/layout";
import { EmptyState, PageMotion, stagger } from "@/shared/components/ui";
import { listReportEnterprises } from "@/shared/services/reporting";
import type { IntakeReport, ReportEnterprise } from "@/shared/types";

const MONTH_ORDER = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const EMPTY_REPORT_ENTERPRISES: ReportEnterprise[] = [];
const EMPTY_INTAKE_REPORTS: IntakeReport[] = [];

type AnalyticsPeriod = {
  key: string;
  label: string;
  monthIndex: number;
  reports: IntakeReport[];
  year: string;
};

type EnterpriseReportRow = {
  enterprise: ReportEnterprise;
  report: IntakeReport | null;
};

function getReportYear(report: IntakeReport) {
  return report.period.match(/\d{4}/)?.[0] ?? null;
}

function getAnalyticsPeriods(reports: IntakeReport[], currentPeriod: AnalyticsPeriod) {
  const periodMap = new Map<string, AnalyticsPeriod>();
  periodMap.set(currentPeriod.key, currentPeriod);

  reports.forEach((report) => {
    const year = getReportYear(report);
    const monthIndex = MONTH_ORDER.indexOf(report.month);
    if (!year || monthIndex === -1) return;

    const key = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
    const period = periodMap.get(key) ?? {
      key,
      label: `${report.month} ${year}`,
      monthIndex,
      reports: [],
      year,
    };

    period.reports.push(report);
    periodMap.set(key, period);
  });

  return Array.from(periodMap.values()).sort((a, b) => Number(b.year) - Number(a.year) || b.monthIndex - a.monthIndex);
}

function sumMetric(reports: IntakeReport[], metric: "entry" | "unique") {
  return reports.reduce((total, report) => total + report.metrics[metric], 0);
}

function reportHasSubmission(report: IntakeReport) {
  return report.submitted !== "Not submitted";
}

function getCurrentAnalyticsPeriod(date = new Date()): AnalyticsPeriod {
  const monthIndex = date.getMonth();
  const month = MONTH_ORDER[monthIndex];
  const year = String(date.getFullYear());

  return {
    key: `${year}-${String(monthIndex + 1).padStart(2, "0")}`,
    label: `${month} ${year}`,
    monthIndex,
    reports: [],
    year,
  };
}

function getTrendLabel(activeReports: IntakeReport[], comparisonPeriod?: AnalyticsPeriod) {
  if (!comparisonPeriod) return "No earlier reporting period";

  const activeEntries = sumMetric(activeReports, "entry");
  const comparisonEntries = sumMetric(comparisonPeriod.reports, "entry");
  if (comparisonEntries === 0) return `Compared with ${comparisonPeriod.label}`;

  const difference = Math.round(((activeEntries - comparisonEntries) / comparisonEntries) * 100);
  const sign = difference > 0 ? "+" : "";
  return `${sign}${difference}% vs ${comparisonPeriod.label}`;
}

export function StaffAnalyticsPage() {
  const reports = useReportStore((state) => state.reports);
  const reportEnterprisesQuery = useQuery({ queryKey: ["report-enterprises"], queryFn: listReportEnterprises });
  const reportEnterprises = reportEnterprisesQuery.data ?? EMPTY_REPORT_ENTERPRISES;
  const [selectedPeriodKey, setSelectedPeriodKey] = useState<string | null>(null);

  const currentPeriod = useMemo(() => getCurrentAnalyticsPeriod(), []);
  const periods = useMemo(() => getAnalyticsPeriods(reports, currentPeriod), [currentPeriod, reports]);
  const activePeriodIndex = Math.max(
    periods.findIndex((period) => period.key === selectedPeriodKey),
    0,
  );
  const activePeriod = periods[activePeriodIndex];
  const activeReports = activePeriod?.reports ?? EMPTY_INTAKE_REPORTS;
  const enterpriseRows = useMemo(() => getEnterpriseReportRows(reportEnterprises, activeReports), [activeReports, reportEnterprises]);
  const submittedRows = enterpriseRows.filter((row) => row.report && reportHasSubmission(row.report));
  const submittedReports = submittedRows.map((row) => row.report).filter((report): report is IntakeReport => report !== null);
  const totalReports = reportEnterprises.length;
  const submissionRate = totalReports === 0 ? 0 : Math.round((submittedReports.length / totalReports) * 100);
  const comparisonPeriod = periods[activePeriodIndex + 1];
  const chartData = enterpriseRows.map(({ enterprise, report }) => ({
    name: enterprise.name,
    entries: report?.metrics.entry ?? 0,
    unique: report?.metrics.unique ?? 0,
    status: report && reportHasSubmission(report) ? "Submitted" : "Missing",
  }));
  const complianceRows = [...enterpriseRows].sort(
    (a, b) => Number(Boolean(b.report && reportHasSubmission(b.report))) - Number(Boolean(a.report && reportHasSubmission(a.report))) || a.enterprise.name.localeCompare(b.enterprise.name),
  );

  return (
    <PageMotion>
      <PageHeader title="Comparative Analytics & Anomalies" description="Compare enterprise performance to identify discrepancies before consolidation." />

      <motion.section className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4" variants={stagger}>
        <MetricCard
          color="#065f46"
          label="Total Aggregated Entries"
          value={sumMetric(activeReports, "entry")}
          foot={getTrendLabel(activeReports, comparisonPeriod)}
          footClassName="text-tgreen-light"
          icon={Activity}
        />
        <MetricCard color="#2563eb" label="Est. Unique People" value={sumMetric(activeReports, "unique")} foot="From reporting submissions" icon={Users} />
        <MetricCard
          color="#f59e0b"
          label="Reports Compliance"
          value={`${submittedReports.length} / ${totalReports}`}
          foot={`${submissionRate}% Submission Rate`}
          footClassName="text-yellow-600"
          icon={ClipboardCheck}
        />
        <div className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div>
            <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">Reporting Period</span>
            <p className="mt-1 text-[11px] leading-snug text-gray-500">Filter comparative data and telemetry logs by calendar month.</p>
          </div>
          <div className="mt-4">
            <select
              value={activePeriod?.key ?? ""}
              onChange={(event) => setSelectedPeriodKey(event.target.value)}
              className="focus:ring-tgreen-dark focus:border-tgreen-dark w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition outline-none hover:border-gray-400 focus:ring-1"
            >
              {periods.map((period) => (
                <option key={period.key} value={period.key}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.section>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="col-span-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-6 text-sm font-semibold text-gray-900">Enterprise Traffic Comparison</h3>
          <div className="h-72">
            {reportEnterprisesQuery.isLoading ? (
              <EmptyState icon={Activity} title="Loading enterprises" description="Fetching registered enterprise accounts for analytics." minHeightClassName="min-h-72" />
            ) : chartData.length === 0 ? (
              <EmptyState
                icon={Activity}
                title="No registered enterprises"
                description="Enterprise traffic comparisons will appear here once enterprise accounts are registered."
                minHeightClassName="min-h-72"
              />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
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
            )}
          </div>
        </section>

        <section className="flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Compliance Status</h3>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
          </div>
          <div className="max-h-75 space-y-4 overflow-y-auto pr-1">
            {complianceRows.map(({ enterprise, report }) => (
              <ComplianceStatusItem key={enterprise.id} enterprise={enterprise} report={report} />
            ))}
            {reportEnterprisesQuery.isLoading && <EmptyState icon={ClipboardCheck} title="Loading registry" description="Fetching registered enterprise accounts." minHeightClassName="min-h-45" />}
            {!reportEnterprisesQuery.isLoading && complianceRows.length === 0 && (
              <EmptyState icon={ClipboardCheck} title="No registered enterprises" description="Compliance status will appear once enterprise accounts are registered." minHeightClassName="min-h-45" />
            )}
          </div>
        </section>
      </div>
    </PageMotion>
  );
}

function getEnterpriseReportRows(enterprises: ReportEnterprise[], reports: IntakeReport[]): EnterpriseReportRow[] {
  return enterprises.map((enterprise) => ({
    enterprise,
    report: reports.find((report) => report.enterpriseId === enterprise.id) ?? null,
  }));
}

function ComplianceStatusItem({ enterprise, report }: { enterprise: ReportEnterprise; report: IntakeReport | null }) {
  const submitted = Boolean(report && reportHasSubmission(report));

  return (
    <div className={`rounded-lg border p-3.5 transition hover:shadow-sm ${submitted ? "border-emerald-100 bg-emerald-50" : "border-amber-100 bg-amber-50"}`}>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-bold tracking-wide uppercase ${submitted ? "text-emerald-800" : "text-amber-800"}`}>{enterprise.name}</span>
        <span className="flex shrink-0 items-center gap-1 font-mono text-[10px] text-gray-500">
          <Clock size={10} /> {report?.submitted ?? "Missing"}
        </span>
      </div>
      <p className={`mt-1 text-xs leading-normal ${submitted ? "text-emerald-700" : "text-amber-700"}`}>
        {submitted ? `Submitted ${report?.id ?? "report"}.` : `No submission recorded for ${enterprise.barangay}.`}
      </p>
    </div>
  );
}
