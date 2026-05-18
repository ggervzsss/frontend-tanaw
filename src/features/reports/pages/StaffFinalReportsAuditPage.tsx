import { Archive, Download, FileCheck2, Printer, Search } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useMemo, useState } from "react";
import { MetricCard } from "../../../shared/components/cards";
import { PageHeader } from "../../../shared/components/layout";
import { Panel } from "../../../shared/components/panel";
import { PageMotion } from "../../../shared/components/ui";
import { useReportStore } from "../../../app/store/reportStore";
import type { FinalReport, FinalReportStatus } from "../../../shared/types";
import { FinalReportViewer, ReportStatusBadge } from "../components";

type AuditFilter = "All" | FinalReportStatus;

export function StaffFinalReportsAuditPage() {
  const finalReports = useReportStore((state) => state.finalReports);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<AuditFilter>("All");
  const [selectedReport, setSelectedReport] = useState<FinalReport | null>(null);

  const filteredReports = useMemo(
    () =>
      finalReports.filter((report) => {
        const normalizedQuery = query.trim().toLowerCase();
        const matchesQuery = !normalizedQuery || [report.id, report.title, report.period, report.preparedBy].some((value) => value.toLowerCase().includes(normalizedQuery));
        const matchesFilter = filter === "All" || report.status === filter;
        return matchesQuery && matchesFilter;
      }),
    [filter, finalReports, query],
  );

  const draftCount = finalReports.filter((report) => report.status === "Draft").length;
  const archivedCount = finalReports.filter((report) => report.status === "Archived").length;
  const totalUnique = finalReports.reduce((total, report) => total + report.totalUnique, 0);

  return (
    <PageMotion>
      <PageHeader title="Final Reports Audit" description="Review, print, and download official consolidated reports for DOT submission." />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <MetricCard label="Final Artifacts" value={finalReports.length} foot="Generated reports" color="#065f46" icon={FileCheck2} />
        <MetricCard label="Draft Reports" value={draftCount} foot="Awaiting review" color="#2563eb" icon={Printer} />
        <MetricCard label="Archived Reports" value={archivedCount} foot="Historical submissions" color="#9ca3af" icon={Archive} />
        <MetricCard label="Aggregated Unique Pax" value={totalUnique.toLocaleString()} foot="Across all artifacts" color="#f59e0b" icon={Download} />
      </section>

      <Panel className="mt-6 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 bg-gray-50 p-4">
          <div className="relative min-w-65 flex-1">
            <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search artifact, period, or prepared by"
              className="focus:ring-tgreen-dark w-full rounded-lg border border-gray-300 bg-white py-2 pr-4 pl-9 text-sm text-gray-900 transition outline-none focus:ring-1"
            />
          </div>
          <select value={filter} onChange={(event) => setFilter(event.target.value as AuditFilter)} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none">
            {["All", "Draft", "Approved", "Archived"].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-4">Artifact ID</th>
                <th className="px-6 py-4">Report Title & Period</th>
                <th className="px-6 py-4">Generated On</th>
                <th className="px-6 py-4">Prepared By</th>
                <th className="px-6 py-4">Totals</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-800">
              {filteredReports.map((report) => (
                <tr key={report.id} onClick={() => setSelectedReport(report)} className="group hover:bg-tgreen-dark/5 cursor-pointer transition">
                  <td className="group-hover:text-tgreen-dark px-6 py-4 font-mono text-xs font-bold text-gray-600 transition-colors">{report.id}</td>
                  <td className="px-6 py-4 font-medium">
                    {report.title}
                    <div className="mt-0.5 text-[10px] font-normal text-gray-500">
                      Coverage: {report.period} | Aggregated from {report.enterpriseCount} nodes
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs">{report.generatedOn}</td>
                  <td className="px-6 py-4 text-xs">{report.preparedBy}</td>
                  <td className="px-6 py-4 font-mono text-xs">
                    <div>Entry: {report.totalEntry.toLocaleString()}</div>
                    <div>Unique: {report.totalUnique.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <ReportStatusBadge status={report.status} />
                  </td>
                </tr>
              ))}
              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No final reports match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <AnimatePresence>{selectedReport && <FinalReportViewer report={selectedReport} onClose={() => setSelectedReport(null)} />}</AnimatePresence>
    </PageMotion>
  );
}
