import { Archive, Building2, CheckCircle2, FileSignature, FileText, Search } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../../app/store/authStore";
import { useReportStore } from "../../../app/store/reportStore";
import { MetricCard } from "../../../shared/components/cards";
import { PageHeader } from "../../../shared/components/layout";
import { Panel } from "../../../shared/components/panel";
import { PageMotion } from "../../../shared/components/ui";
import { reportEnterprises } from "../../../shared/data";
import type { IntakeReport, ReportEnterprise, ReportStatus } from "../../../shared/types";
import { ReportReviewModal, ReportStatusBadge } from "../components";

type ComplianceFilter = "All" | ReportStatus | "Archived";

export function StaffBatchReportsPage() {
  const authUser = useAuthStore((state) => state.user);
  const reports = useReportStore((state) => state.reports);
  const updateReportStatus = useReportStore((state) => state.updateReportStatus);
  const generateFinalReport = useReportStore((state) => state.generateFinalReport);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ComplianceFilter>("All");
  const [selectedEnterprise, setSelectedEnterprise] = useState<ReportEnterprise | null>(null);
  const [selectedReport, setSelectedReport] = useState<IntakeReport | null>(null);
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([]);

  const currentReports = reports.filter((report) => report.month === "October");
  const archivedReports = reports.filter((report) => report.month !== "October" || report.status === "Consolidated");
  const readyReports = currentReports.filter((report) => report.status === "Ready to Consolidate");
  const missingReports = currentReports.filter((report) => report.status === "Missing");

  const enterpriseRows = useMemo(
    () =>
      reportEnterprises
        .map((enterprise) => {
          const currentReport = currentReports.find((report) => report.enterpriseId === enterprise.id);
          const enterpriseArchives = archivedReports.filter((report) => report.enterpriseId === enterprise.id);

          return {
            enterprise,
            currentReport,
            archivedReports: enterpriseArchives,
            status: currentReport?.status ?? "Missing",
          };
        })
        .filter((row) => {
          const normalizedQuery = query.trim().toLowerCase();
          const matchesQuery =
            !normalizedQuery || [row.enterprise.name, row.enterprise.category, row.enterprise.barangay, row.currentReport?.id ?? ""].some((value) => value.toLowerCase().includes(normalizedQuery));
          const matchesFilter = filter === "All" || (filter === "Archived" ? row.archivedReports.length > 0 : row.status === filter);
          return matchesQuery && matchesFilter;
        }),
    [archivedReports, currentReports, filter, query],
  );

  const toggleReportSelection = (reportId: string) => {
    setSelectedReportIds((current) => (current.includes(reportId) ? current.filter((id) => id !== reportId) : [...current, reportId]));
  };

  const handleGenerate = () => {
    const selectedReadyReportIds = selectedReportIds.filter((id) => readyReports.some((report) => report.id === id));
    const fallbackReadyReportIds = readyReports.map((report) => report.id);
    const finalReport = generateFinalReport(selectedReadyReportIds.length > 0 ? selectedReadyReportIds : fallbackReadyReportIds, authUser?.displayName ?? "Staff User");

    if (!finalReport) {
      toast.error("No ready reports available for consolidation.");
      return;
    }

    setSelectedReportIds([]);
    toast.success(`${finalReport.id} generated for Final Reports Audit.`);
  };

  const handleAccept = (report: IntakeReport) => {
    updateReportStatus(report.id, "Ready to Consolidate", "Accepted for consolidation.");
    setSelectedReport(null);
    toast.success(`${report.id} marked ready for consolidation.`);
  };

  const handleReturn = (report: IntakeReport) => {
    updateReportStatus(report.id, "Returned", "Returned for revision after staff review.");
    setSelectedReport(null);
    toast.success(`${report.id} returned for revision.`);
  };

  return (
    <PageMotion>
      <PageHeader
        title="Batch Reports"
        description="Enterprise-level compliance review before DOT report consolidation."
        action={
          <button onClick={handleGenerate} className="bg-tgreen-dark hover:bg-tgreen-light inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-md transition">
            <FileSignature size={16} /> Generate Final Report
          </button>
        }
      />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <MetricCard label="Registered Enterprises" value={reportEnterprises.length} foot="Required to submit" color="#065f46" icon={Building2} />
        <MetricCard label="Ready Reports" value={readyReports.length} foot="Available for consolidation" color="#10b981" icon={CheckCircle2} />
        <MetricCard label="Missing Submissions" value={missingReports.length} foot="Needs follow-up" color="#dc2626" footClassName="text-red-600" icon={FileText} />
        <MetricCard label="Archived Reports" value={archivedReports.length} foot="Past submissions" color="#2563eb" icon={Archive} />
      </section>

      <Panel className="mt-6 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 bg-gray-50 p-4">
          <div className="relative min-w-65 flex-1">
            <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search enterprise, barangay, category, or report ID"
              className="focus:ring-tgreen-dark w-full rounded-lg border border-gray-300 bg-white py-2 pr-4 pl-9 text-sm text-gray-900 transition outline-none focus:ring-1"
            />
          </div>
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value as ComplianceFilter)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none"
          >
            {["All", "Pending Review", "Ready to Consolidate", "Returned", "Missing", "Archived"].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-[10px] font-bold tracking-wider text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-4">Consolidate</th>
                <th className="px-6 py-4">Enterprise</th>
                <th className="px-6 py-4">Barangay</th>
                <th className="px-6 py-4">Current Submission</th>
                <th className="px-6 py-4">Archived</th>
                <th className="px-6 py-4">Compliance Owner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-800">
              {enterpriseRows.map(({ enterprise, currentReport, archivedReports: enterpriseArchives, status }) => {
                const canConsolidate = currentReport?.status === "Ready to Consolidate";
                return (
                  <tr key={enterprise.id} onClick={() => setSelectedEnterprise(enterprise)} className="group hover:bg-tgreen-dark/5 cursor-pointer transition">
                    <td className="px-6 py-4" onClick={(event) => event.stopPropagation()}>
                      <input
                        type="checkbox"
                        disabled={!canConsolidate}
                        checked={Boolean(currentReport && selectedReportIds.includes(currentReport.id))}
                        onChange={() => currentReport && toggleReportSelection(currentReport.id)}
                        className="text-tgreen-dark h-4 w-4 cursor-pointer rounded border-gray-300 disabled:cursor-not-allowed disabled:opacity-30"
                      />
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      {enterprise.name}
                      <div className="mt-1 text-[10px] font-normal text-gray-500">{enterprise.category}</div>
                    </td>
                    <td className="px-6 py-4 text-xs">{enterprise.barangay}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <ReportStatusBadge status={status} />
                        <span className="font-mono text-[10px] text-gray-500">{currentReport?.id ?? "No current report"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-600">{enterpriseArchives.length} submissions</td>
                    <td className="px-6 py-4 text-xs">{enterprise.complianceOwner}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      {selectedEnterprise && (
        <EnterpriseReportsDrawer
          enterprise={selectedEnterprise}
          reports={reports.filter((report) => report.enterpriseId === selectedEnterprise.id)}
          onClose={() => setSelectedEnterprise(null)}
          onOpenReport={setSelectedReport}
        />
      )}

      <AnimatePresence>{selectedReport && <ReportReviewModal report={selectedReport} onClose={() => setSelectedReport(null)} onAccept={handleAccept} onReturn={handleReturn} />}</AnimatePresence>
    </PageMotion>
  );
}

function EnterpriseReportsDrawer({
  enterprise,
  reports,
  onClose,
  onOpenReport,
}: {
  enterprise: ReportEnterprise;
  reports: IntakeReport[];
  onClose: () => void;
  onOpenReport: (report: IntakeReport) => void;
}) {
  const currentReports = reports.filter((report) => report.month === "October");
  const archivedReports = reports.filter((report) => report.month !== "October" || report.status === "Consolidated");

  return (
    <div className="bg-charcoal-950/50 fixed inset-0 z-40 backdrop-blur-sm" onClick={onClose}>
      <aside className="ml-auto flex h-full w-full max-w-3xl flex-col bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <header className="border-b border-gray-200 bg-gray-50 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{enterprise.name}</h2>
              <p className="mt-1 text-sm text-gray-500">
                {enterprise.category} - {enterprise.barangay}
              </p>
            </div>
            <button onClick={onClose} className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-500 transition hover:bg-white hover:text-gray-900">
              Close
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <ReportSection title="Current Reporting Period" reports={currentReports} empty="No current report is available." onOpenReport={onOpenReport} />
          <ReportSection title="Archived Submissions" reports={archivedReports} empty="No archived submissions yet." onOpenReport={onOpenReport} />
        </div>
      </aside>
    </div>
  );
}

function ReportSection({ title, reports, empty, onOpenReport }: { title: string; reports: IntakeReport[]; empty: string; onOpenReport: (report: IntakeReport) => void }) {
  return (
    <section className="mb-8">
      <h3 className="mb-3 text-xs font-bold tracking-widest text-gray-500 uppercase">{title}</h3>
      <div className="space-y-3">
        {reports.map((report) => (
          <button
            key={report.id}
            onClick={() => onOpenReport(report)}
            className="hover:border-tgreen-dark hover:bg-tgreen-dark/5 w-full rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs font-bold text-gray-500">{report.id}</p>
                <p className="mt-1 text-sm font-bold text-gray-900">{report.period}</p>
                <p className="mt-1 text-xs text-gray-500">Submitted: {report.submitted}</p>
              </div>
              <ReportStatusBadge status={report.status} />
            </div>
          </button>
        ))}
        {reports.length === 0 && <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">{empty}</div>}
      </div>
    </section>
  );
}
