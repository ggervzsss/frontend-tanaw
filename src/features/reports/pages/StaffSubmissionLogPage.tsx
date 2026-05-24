import { Building2, CalendarDays, ClipboardCheck, FileText, Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useReportStore } from "../../../app/store";
import { MetricCard } from "../../../shared/components/cards";
import { PageHeader } from "../../../shared/components/layout";
import { Panel } from "../../../shared/components/panel";
import { ModalPortal, PageMotion, stagger } from "../../../shared/components/ui";
import type { IntakeReport } from "../../../shared/types";
import { ReportStatusBadge } from "../components";

const MONTH_ORDER = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function StaffSubmissionLogPage() {
  const reports = useReportStore((state) => state.reports);
  const [query, setQuery] = useState("");
  const [monthFilter, setMonthFilter] = useState("All Months");
  const [yearFilter, setYearFilter] = useState("All Years");
  const [selectedReport, setSelectedReport] = useState<IntakeReport | null>(null);

  const submittedReports = useMemo(() => reports.filter((report) => report.submitted !== "Not submitted"), [reports]);

  const availableMonths = useMemo(() => {
    return Array.from(new Set(submittedReports.map((report) => report.month))).sort((a, b) => MONTH_ORDER.indexOf(a) - MONTH_ORDER.indexOf(b));
  }, [submittedReports]);

  const availableYears = useMemo(() => {
    return Array.from(new Set(submittedReports.map((report) => getReportYear(report)).filter(Boolean) as string[])).sort((a, b) => Number(b) - Number(a));
  }, [submittedReports]);

  const filteredReports = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return submittedReports
      .filter((report) => {
        const reportYear = getReportYear(report);
        const matchesQuery =
          !normalizedQuery ||
          [report.id, report.enterprise, report.category, report.barangay, report.period, report.code, report.status, report.remarks ?? ""].some((value) => value.toLowerCase().includes(normalizedQuery));
        const matchesMonth = monthFilter === "All Months" || report.month === monthFilter;
        const matchesYear = yearFilter === "All Years" || reportYear === yearFilter;
        return matchesQuery && matchesMonth && matchesYear;
      })
      .sort((a, b) => b.submitted.localeCompare(a.submitted));
  }, [monthFilter, query, submittedReports, yearFilter]);

  const readyCount = submittedReports.filter((report) => report.status === "Ready to Consolidate").length;
  const consolidatedCount = submittedReports.filter((report) => report.status === "Consolidated").length;
  const enterpriseCount = new Set(submittedReports.map((report) => report.enterpriseId)).size;

  return (
    <PageMotion>
      <PageHeader title="Submission Log" description="Staff review log for enterprise report submissions across reporting periods." />

      <motion.section className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4" variants={stagger}>
        <MetricCard label="Total Submissions" value={submittedReports.length} foot="Recorded enterprise reports" color="#2563eb" icon={FileText} />
        <MetricCard label="Ready Reports" value={readyCount} foot="Available for consolidation" color="#10b981" icon={ClipboardCheck} />
        <MetricCard label="Consolidated" value={consolidatedCount} foot="Included in final reports" color="#065f46" icon={CalendarDays} />
        <MetricCard label="Enterprises" value={enterpriseCount} foot="With submission history" color="#f59e0b" footClassName="text-yellow-700" icon={Building2} />
      </motion.section>

      <Panel className="mt-6 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 bg-gray-50 p-4">
          <div className="relative min-w-65 flex-1">
            <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search enterprise, report ID, barangay, period, or status"
              className="focus:ring-tgreen-dark w-full rounded-lg border border-gray-300 bg-white py-2 pr-4 pl-9 text-sm text-gray-900 transition outline-none focus:ring-1"
            />
          </div>
          <FilterSelect value={monthFilter} onChange={setMonthFilter} options={["All Months", ...availableMonths]} />
          <FilterSelect value={yearFilter} onChange={setYearFilter} options={["All Years", ...availableYears]} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-220 table-fixed text-left text-sm">
            <colgroup>
              <col className="w-[15%]" />
              <col className="w-[20%]" />
              <col className="w-[13%]" />
              <col className="w-[17%]" />
              <col className="w-[13%]" />
              <col className="w-[22%]" />
            </colgroup>
            <thead className="bg-gray-50 text-[10px] font-bold tracking-wider text-gray-500 uppercase">
              <tr>
                {["Submitted", "Enterprise", "Barangay", "Report / Period", "Status", "Metrics"].map((heading) => (
                  <th key={heading} className="px-4 py-4 whitespace-nowrap">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-800">
              {filteredReports.map((report) => (
                <tr key={report.id} onClick={() => setSelectedReport(report)} className="group hover:bg-tgreen-dark/5 cursor-pointer transition">
                  <td className="px-4 py-4 font-mono text-xs text-gray-500">{report.submitted}</td>
                  <td className="px-4 py-4">
                    <div className="font-semibold text-gray-900">{report.enterprise}</div>
                    <div className="mt-1 text-[10px] font-bold tracking-wide text-gray-500 uppercase">{report.category}</div>
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-600">{report.barangay}</td>
                  <td className="px-4 py-4">
                    <div className="font-mono text-xs font-bold text-gray-700">{report.id}</div>
                    <div className="mt-1 text-xs text-gray-500">{report.period}</div>
                  </td>
                  <td className="px-4 py-4">
                    <ReportStatusBadge status={report.status} />
                  </td>
                  <td className="px-4 py-4 font-mono text-xs text-gray-600">
                    <div>Entry: {report.metrics.entry.toLocaleString()}</div>
                    <div>Unique: {report.metrics.unique.toLocaleString()}</div>
                  </td>
                </tr>
              ))}
              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No submissions match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-4 py-3 text-[10px] font-bold tracking-wide text-gray-500 uppercase">
          <span>Showing {filteredReports.length} submissions</span>
          <span>{monthFilter} / {yearFilter}</span>
        </div>
      </Panel>

      <AnimatePresence>{selectedReport && <SubmissionDetailsModal report={selectedReport} onClose={() => setSelectedReport(null)} />}</AnimatePresence>
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

function SubmissionDetailsModal({ report, onClose }: { report: IntakeReport; onClose: () => void }) {
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
              <p className="font-mono text-[10px] font-bold text-gray-400">{report.id}</p>
              <h2 className="text-lg font-bold text-gray-900">Submission Details</h2>
            </div>
            <button onClick={onClose} className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-500 transition hover:bg-white hover:text-gray-900">
              Close
            </button>
          </header>
          <div className="grid gap-4 p-6 md:grid-cols-2">
            <Detail label="Enterprise" value={report.enterprise} />
            <Detail label="Submitted" value={report.submitted} />
            <Detail label="Period" value={report.period} />
            <Detail label="Barangay" value={report.barangay} />
            <Detail label="Category" value={report.category} />
            <Detail label="Status" value={<ReportStatusBadge status={report.status} />} />
            <Detail label="Entry / Exit" value={`${report.metrics.entry.toLocaleString()} / ${report.metrics.exit.toLocaleString()}`} />
            <Detail label="Unique / Peak" value={`${report.metrics.unique.toLocaleString()} / ${report.metrics.peak}`} />
            <div className="md:col-span-2">
              <Detail label="Remarks" value={report.remarks ?? "No remarks recorded."} />
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

function getReportYear(report: IntakeReport) {
  return report.period.match(/\d{4}/)?.[0] ?? null;
}
