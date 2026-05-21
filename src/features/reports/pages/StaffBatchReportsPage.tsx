import { Archive, Bell, Building2, CheckCircle2, FileSignature, FileText, FolderPlus, Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../../app/store/authStore";
import { useReportStore } from "../../../app/store/reportStore";
import { MetricCard } from "../../../shared/components/cards";
import { PageHeader } from "../../../shared/components/layout";
import { Panel } from "../../../shared/components/panel";
import { PageMotion, ModalPortal } from "../../../shared/components/ui";
import { reportEnterprises } from "../../../shared/data";
import type { IntakeReport, ReportEnterprise } from "../../../shared/types";
import { ReportReviewModal, ReportStatusBadge } from "../components";

const MONTH_ORDER = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function StaffBatchReportsPage() {
  const authUser = useAuthStore((state) => state.user);
  const reports = useReportStore((state) => state.reports);
  const updateReportStatus = useReportStore((state) => state.updateReportStatus);
  const generateFinalReport = useReportStore((state) => state.generateFinalReport);
  const openNewSubmissionPeriod = useReportStore((state) => state.openNewSubmissionPeriod);
  const [query, setQuery] = useState("");
  const [monthFilter, setMonthFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [selectedEnterprise, setSelectedEnterprise] = useState<ReportEnterprise | null>(null);
  const [selectedReport, setSelectedReport] = useState<IntakeReport | null>(null);
  const [showCycleModal, setShowCycleModal] = useState(false);


  // Derive unique months and years dynamically from live intake report data
  const availableMonths = useMemo(() => {
    const months = Array.from(new Set(reports.map((r) => r.month)));
    return months.sort((a, b) => MONTH_ORDER.indexOf(a) - MONTH_ORDER.indexOf(b));
  }, [reports]);

  const availableYears = useMemo(() => {
    const years = Array.from(
      new Set(
        reports
          .map((r) => {
            const match = r.period.match(/\d{4}/);
            return match ? match[0] : null;
          })
          .filter(Boolean) as string[],
      ),
    );
    return years.sort((a, b) => Number(b) - Number(a));
  }, [reports]);

  // Reports matching the active month/year filters
  const filteredByPeriod = useMemo(() => {
    return reports.filter((r) => {
      const yearMatch = r.period.match(/\d{4}/);
      const reportYear = yearMatch ? yearMatch[0] : null;
      const matchesMonth = monthFilter === "All" || r.month === monthFilter;
      const matchesYear = yearFilter === "All" || reportYear === yearFilter;
      return matchesMonth && matchesYear;
    });
  }, [reports, monthFilter, yearFilter]);

  // Reports outside the filtered period (used for archived count)
  const nonPeriodReports = useMemo(() => {
    return reports.filter((r) => !filteredByPeriod.includes(r) || r.status === "Consolidated");
  }, [reports, filteredByPeriod]);

  const readyReports = filteredByPeriod.filter((r) => r.status === "Ready to Consolidate");
  const missingReports = filteredByPeriod.filter((r) => r.status === "Missing");

  // Generate is only enabled when every enterprise has a Ready to Consolidate report
  const allReady =
    filteredByPeriod.length > 0 &&
    reportEnterprises.every((ent) => {
      const report = filteredByPeriod.find((r) => r.enterpriseId === ent.id);
      return report?.status === "Ready to Consolidate";
    });

  // All consolidated — cycle is complete
  const allConsolidated =
    filteredByPeriod.length > 0 &&
    reportEnterprises.every((ent) => {
      const report = filteredByPeriod.find((r) => r.enterpriseId === ent.id);
      return report?.status === "Consolidated";
    });

  const enterpriseRows = useMemo(
    () =>
      reportEnterprises
        .map((enterprise) => {
          const currentReport = filteredByPeriod.find((r) => r.enterpriseId === enterprise.id);
          const enterpriseArchives = nonPeriodReports.filter((r) => r.enterpriseId === enterprise.id);
          return {
            enterprise,
            currentReport,
            archivedReports: enterpriseArchives,
            status: currentReport?.status ?? "Missing",
          };
        })
        .filter((row) => {
          const normalizedQuery = query.trim().toLowerCase();
          return (
            !normalizedQuery ||
            [row.enterprise.name, row.enterprise.category, row.enterprise.barangay, row.currentReport?.id ?? ""].some((v) =>
              v.toLowerCase().includes(normalizedQuery),
            )
          );
        }),
    [filteredByPeriod, nonPeriodReports, query],
  );



  const handleGenerate = () => {
    if (!allReady) return;
    const finalReport = generateFinalReport(readyReports.map((r) => r.id), authUser?.displayName ?? "Staff User");
    if (!finalReport) {
      toast.error("No ready reports available for consolidation.");
      return;
    }
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
      <PageHeader title="Batch Reports" description="Enterprise-level compliance review before DOT report consolidation." />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <MetricCard label="Registered Enterprises" value={reportEnterprises.length} foot="Required to submit" color="#065f46" icon={Building2} />
        <MetricCard label="Ready Reports" value={readyReports.length} foot="Available for consolidation" color="#10b981" icon={CheckCircle2} />
        <MetricCard label="Missing Submissions" value={missingReports.length} foot="Needs follow-up" color="#dc2626" footClassName="text-red-600" icon={FileText} />
        <MetricCard label="Archived Reports" value={nonPeriodReports.length} foot="Past submissions" color="#2563eb" icon={Archive} />
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
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none"
          >
            <option value="All">All Months</option>
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none"
          >
            <option value="All">All Years</option>
            {availableYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          {allConsolidated ? (
            <button
              onClick={() => setShowCycleModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 inline-flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition"
            >
              <FolderPlus size={15} /> Open New Submission Period
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={!allReady}
              title={!allReady ? "All enterprises must be Ready to Consolidate before generating." : "Generate Final Report"}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition ${
                allReady ? "bg-tgreen-dark hover:bg-tgreen-light cursor-pointer text-white" : "cursor-not-allowed bg-gray-200 text-gray-400"
              }`}
            >
              <FileSignature size={15} /> Generate Final Report
            </button>
          )}
        </div>

        {allConsolidated ? (
          <div className="flex items-center gap-2 border-b border-emerald-100 bg-emerald-50 px-5 py-2.5 text-xs text-emerald-700">
            <CheckCircle2 size={14} className="shrink-0" />
            <span><span className="font-semibold">Reporting cycle complete —</span> All reports have been consolidated and the final report has been generated. You may now open a new submission period.</span>
          </div>
        ) : !allReady && filteredByPeriod.length > 0 ? (
          <div className="flex items-center gap-2 border-b border-amber-100 bg-amber-50 px-5 py-2.5 text-xs text-amber-700">
            <span className="font-semibold">Not ready to generate —</span>
            {readyReports.length} of {reportEnterprises.length} enterprises are marked Ready to Consolidate. All must be ready before a final report can be generated.
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-[10px] font-bold tracking-wider text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-4">Enterprise</th>
                <th className="px-6 py-4">Barangay</th>
                <th className="px-6 py-4">Current Submission</th>
                <th className="px-6 py-4">Archived</th>
                <th className="px-6 py-4">Compliance Owner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-800">
              {enterpriseRows.map(({ enterprise, currentReport, archivedReports: enterpriseArchives, status }) => {
                return (
                  <tr key={enterprise.id} onClick={() => setSelectedEnterprise(enterprise)} className="group hover:bg-tgreen-dark/5 cursor-pointer transition">
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

      <AnimatePresence>
        {selectedEnterprise && (
          <EnterpriseReportsModal
            enterprise={selectedEnterprise}
            reports={reports.filter((report) => report.enterpriseId === selectedEnterprise.id)}
            onClose={() => setSelectedEnterprise(null)}
            onOpenReport={setSelectedReport}
          />
        )}
        {selectedReport && (
          <ReportReviewModal
            report={selectedReport}
            onClose={() => setSelectedReport(null)}
            onAccept={handleAccept}
            onReturn={handleReturn}
          />
        )}
        {showCycleModal && (
          <NewCycleModal
            currentMonth={monthFilter !== "All" ? monthFilter : undefined}
            onConfirm={(month, year) => {
              const success = openNewSubmissionPeriod(month, year);
              if (!success) {
                toast.error(`A submission period for ${month} ${year} already exists.`);
                return;
              }
              setShowCycleModal(false);
              setMonthFilter(month);
              setYearFilter(year);
              toast.success(`New submission period opened for ${month} ${year}.`);
            }}
            onClose={() => setShowCycleModal(false)}
          />
        )}
      </AnimatePresence>
    </PageMotion>
  );
}

function EnterpriseReportsModal({
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
  const [notified, setNotified] = useState(false);
  const activeReports = reports.filter((r) => r.status !== "Consolidated");
  const archivedReports = reports.filter((r) => r.status === "Consolidated");

  // Notify is relevant when enterprise has no ready report yet
  const needsNotification = !activeReports.some((r) => r.status === "Ready to Consolidate");

  const handleNotify = () => {
    setNotified(true);
    toast.success(`${enterprise.name} has been notified to submit their compliance report.`);
  };

  return (
    <ModalPortal>
      <motion.div
        className="bg-charcoal-950/70 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.section
          className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <header className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{enterprise.name}</h2>
              <p className="mt-1 text-sm text-gray-500">
                {enterprise.category} — {enterprise.barangay}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {needsNotification && (
                <button
                  onClick={handleNotify}
                  disabled={notified}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    notified
                      ? "cursor-default bg-gray-100 text-gray-400"
                      : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                  }`}
                >
                  <Bell size={14} />
                  {notified ? "Notified" : "Notify"}
                </button>
              )}
              <button onClick={onClose} className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-500 transition hover:bg-white hover:text-gray-900">
                Close
              </button>
            </div>
          </header>

          <div className="grow overflow-y-auto p-6">
            <ReportSection title="Current Submissions" reports={activeReports} empty="No active reports found." onOpenReport={onOpenReport} />
            <ReportSection title="Archived Submissions" reports={archivedReports} empty="No archived submissions yet." onOpenReport={onOpenReport} />
          </div>
        </motion.section>
      </motion.div>
    </ModalPortal>
  );
}

function ReportSection({
  title,
  reports,
  empty,
  onOpenReport,
}: {
  title: string;
  reports: IntakeReport[];
  empty: string;
  onOpenReport: (report: IntakeReport) => void;
}) {
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

function NewCycleModal({
  currentMonth,
  onConfirm,
  onClose,
}: {
  currentMonth?: string;
  onConfirm: (month: string, year: string) => void;
  onClose: () => void;
}) {
  const currentMonthIndex = currentMonth ? MONTH_ORDER.indexOf(currentMonth) : new Date().getMonth();
  const nextMonthIndex = (currentMonthIndex + 1) % 12;
  const nextYear = currentMonthIndex === 11 ? new Date().getFullYear() + 1 : new Date().getFullYear();

  const [month, setMonth] = useState(MONTH_ORDER[nextMonthIndex]);
  const [year, setYear] = useState(String(nextYear));

  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear - 1, currentYear, currentYear + 1].map(String);

  return (
    <ModalPortal>
      <motion.div
        className="bg-charcoal-950/70 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.section
          className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <header className="border-b border-gray-200 bg-gray-50 px-6 py-5">
            <h2 className="text-lg font-bold text-gray-900">Open New Submission Period</h2>
            <p className="mt-1 text-sm text-gray-500">
              Create placeholder reports for all registered enterprises. They will appear as "Missing" until each enterprise submits.
            </p>
          </header>

          <div className="space-y-4 px-6 py-5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-wide text-gray-600 uppercase">Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {MONTH_ORDER.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-wide text-gray-600 uppercase">Year</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <footer className="flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
            <button
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(month, year)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              <FolderPlus size={15} /> Open Period
            </button>
          </footer>
        </motion.section>
      </motion.div>
    </ModalPortal>
  );
}
