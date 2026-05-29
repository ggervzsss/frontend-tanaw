import { AnimatePresence } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/app/store/authStore";
import { useReportStore } from "@/app/store/reportStore";
import { PageHeader } from "@/shared/components/layout";
import { Panel } from "@/shared/components/panel";
import { PageMotion } from "@/shared/components/ui";
import { recordActivityLog } from "@/shared/services/activityLogs";
import { listReportEnterprises } from "@/shared/services/reporting";
import type { IntakeReport, ReportEnterprise } from "@/shared/types";
import { BatchReportsMetrics, BatchReportsStatusNotice, BatchReportsTable, BatchReportsToolbar, EnterpriseReportsModal, ReportReviewModal } from "../components";
import { getAvailableMonths, getAvailableYears, getCurrentSubmissionPeriod, getDefaultSubmissionPeriod, getEnterpriseReportRows, reportMatchesPeriod } from "../utils";

const EMPTY_REPORT_ENTERPRISES: ReportEnterprise[] = [];

export function StaffBatchReportsPage() {
  const authUser = useAuthStore((state) => state.user);
  const reports = useReportStore((state) => state.reports);
  const updateReportStatus = useReportStore((state) => state.updateReportStatus);
  const generateFinalReport = useReportStore((state) => state.generateFinalReport);
  const reportEnterprisesQuery = useQuery({ queryKey: ["report-enterprises"], queryFn: listReportEnterprises });
  const reportEnterprises = reportEnterprisesQuery.data ?? EMPTY_REPORT_ENTERPRISES;
  const currentPeriod = getCurrentSubmissionPeriod();
  const defaultPeriod = getDefaultSubmissionPeriod(reports, currentPeriod);
  const [query, setQuery] = useState("");
  const [monthFilter, setMonthFilter] = useState(defaultPeriod.month);
  const [yearFilter, setYearFilter] = useState(defaultPeriod.year);
  const [selectedEnterprise, setSelectedEnterprise] = useState<ReportEnterprise | null>(null);
  const [selectedReport, setSelectedReport] = useState<IntakeReport | null>(null);

  const availableMonths = useMemo(() => getAvailableMonths(reports, currentPeriod), [currentPeriod, reports]);
  const availableYears = useMemo(() => getAvailableYears(reports, currentPeriod), [currentPeriod, reports]);
  const filteredByPeriod = useMemo(() => reports.filter((report) => reportMatchesPeriod(report, monthFilter, yearFilter)), [reports, monthFilter, yearFilter]);
  const nonPeriodReports = useMemo(() => reports.filter((report) => !filteredByPeriod.includes(report) || report.status === "Consolidated"), [reports, filteredByPeriod]);
  const readyReports = filteredByPeriod.filter((report) => report.status === "Ready to Consolidate");
  const enterpriseRows = useMemo(() => getEnterpriseReportRows(reportEnterprises, filteredByPeriod, nonPeriodReports, query), [filteredByPeriod, nonPeriodReports, query, reportEnterprises]);
  const missingReports = enterpriseRows.filter((row) => row.status === "Missing");
  const allReady = reportEnterprises.length > 0 && reportEnterprises.every((enterprise) => filteredByPeriod.find((report) => report.enterpriseId === enterprise.id)?.status === "Ready to Consolidate");
  const allConsolidated = reportEnterprises.length > 0 && reportEnterprises.every((enterprise) => filteredByPeriod.find((report) => report.enterpriseId === enterprise.id)?.status === "Consolidated");

  const handleGenerate = () => {
    if (!allReady) return;
    const finalReport = generateFinalReport(
      readyReports.map((report) => report.id),
      authUser?.displayName ?? "LGU Staff",
    );
    if (!finalReport) {
      toast.error("No ready reports available for consolidation.");
      return;
    }
    void recordActivityLog({
      category: "Staff Operation",
      severity: "Success",
      action: "Generate Final Report",
      target: finalReport.id,
      summary: `${authUser?.displayName ?? "LGU Staff"} generated ${finalReport.id} from ${readyReports.length} ready submissions.`,
      sourceId: finalReport.id,
      metadata: {
        reportCount: readyReports.length,
        period: finalReport.period,
      },
    });
    toast.success(`${finalReport.id} generated for Final Reports Audit.`);
  };

  const handleAccept = (report: IntakeReport) => {
    updateReportStatus(report.id, "Ready to Consolidate", "Accepted for consolidation.");
    void recordActivityLog({
      category: "Staff Operation",
      severity: "Success",
      action: "Accept Report",
      target: report.enterprise,
      summary: `${authUser?.displayName ?? "LGU Staff"} marked ${report.id} from ${report.enterprise} ready for consolidation.`,
      sourceId: report.id,
      metadata: {
        reportStatus: "Ready to Consolidate",
        period: report.period,
      },
    });
    setSelectedReport(null);
    toast.success(`${report.id} marked ready for consolidation.`);
  };

  const handleReturn = (report: IntakeReport) => {
    updateReportStatus(report.id, "Returned", "Returned for revision after staff review.");
    void recordActivityLog({
      category: "Staff Operation",
      severity: "Warning",
      action: "Return Report",
      target: report.enterprise,
      summary: `${authUser?.displayName ?? "LGU Staff"} returned ${report.id} from ${report.enterprise} for revision.`,
      sourceId: report.id,
      metadata: {
        reportStatus: "Returned",
        period: report.period,
      },
    });
    setSelectedReport(null);
    toast.success(`${report.id} returned for revision.`);
  };

  return (
    <PageMotion>
      <PageHeader title="Batch Reports" description="Enterprise-level compliance review before DOT report consolidation." />

      <BatchReportsMetrics reportEnterprises={reportEnterprises} readyReports={readyReports} missingReports={missingReports} archivedReports={nonPeriodReports} isLoadingRegistry={reportEnterprisesQuery.isLoading} />

      <Panel className="mt-6 overflow-hidden">
        <BatchReportsToolbar
          query={query}
          monthFilter={monthFilter}
          yearFilter={yearFilter}
          availableMonths={availableMonths}
          availableYears={availableYears}
          allReady={allReady}
          onQueryChange={setQuery}
          onMonthChange={setMonthFilter}
          onYearChange={setYearFilter}
          onGenerate={handleGenerate}
        />
        <BatchReportsStatusNotice
          allConsolidated={allConsolidated}
          allReady={allReady}
          filteredReportCount={filteredByPeriod.length}
          readyReportCount={readyReports.length}
          enterpriseCount={reportEnterprises.length}
        />
        <BatchReportsTable rows={enterpriseRows} isLoading={reportEnterprisesQuery.isLoading} onSelectEnterprise={setSelectedEnterprise} />
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
        {selectedReport && <ReportReviewModal report={selectedReport} onClose={() => setSelectedReport(null)} onAccept={handleAccept} onReturn={handleReturn} />}
      </AnimatePresence>
    </PageMotion>
  );
}
