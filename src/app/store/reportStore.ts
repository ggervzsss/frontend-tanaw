import { create } from "zustand";
import { persist } from "zustand/middleware";
import { finalReports as initialFinalReports, intakeReports as initialReports, reportEnterprises } from "../../shared/data";
import type { FinalReport, FinalReportStatus, IntakeReport, ReportStatus } from "../../shared/types";

type ReportState = {
  reports: IntakeReport[];
  finalReports: FinalReport[];
  updateReportStatus: (reportId: string, status: ReportStatus, remarks?: string) => void;
  updateFinalReportStatus: (reportId: string, status: FinalReportStatus) => void;
  generateFinalReport: (reportIds: string[], preparedBy: string) => FinalReport | null;
  openNewSubmissionPeriod: () => boolean;
};

export const useReportStore = create<ReportState>()(
  persist(
    (set, get) => ({
      reports: initialReports,
      finalReports: initialFinalReports,
      updateReportStatus: (reportId, status, remarks) =>
        set((state) => ({
          reports: state.reports.map((report) => (report.id === reportId ? { ...report, status, remarks: remarks ?? report.remarks } : report)),
        })),
      updateFinalReportStatus: (reportId, status) =>
        set((state) => ({
          finalReports: state.finalReports.map((report) => (report.id === reportId ? { ...report, status } : report)),
        })),
      generateFinalReport: (reportIds, preparedBy) => {
        const selectedReports = get().reports.filter((report) => reportIds.includes(report.id));
        if (selectedReports.length === 0) return null;

        const periodMonth = selectedReports[0].month;
        const year = selectedReports[0].period.match(/\d{4}/)?.[0] ?? new Date().getFullYear().toString();
        const id = `CON-${periodMonth.slice(0, 3).toUpperCase()}-${year}-${Date.now().toString().slice(-4)}`;
        const finalReport: FinalReport = {
          id,
          title: "Citywide Tourism Aggregation",
          period: `${periodMonth} ${year}`,
          generatedOn: new Date().toISOString().slice(0, 10),
          preparedBy,
          preparedRole: "Staff Processing Division",
          status: "Draft",
          totalEntry: selectedReports.reduce((total, report) => total + report.metrics.entry, 0),
          totalExit: selectedReports.reduce((total, report) => total + report.metrics.exit, 0),
          totalUnique: selectedReports.reduce((total, report) => total + report.metrics.unique, 0),
          enterpriseCount: new Set(selectedReports.map((report) => report.enterpriseId)).size,
          sources: selectedReports.map((report) => ({
            id: report.id,
            enterprise: report.enterprise,
            code: report.code,
            unique: report.metrics.unique,
            entry: report.metrics.entry,
            exit: report.metrics.exit,
          })),
        };

        set((state) => ({
          reports: state.reports.map((report) => (reportIds.includes(report.id) ? { ...report, status: "Consolidated" } : report)),
          finalReports: [finalReport, ...state.finalReports],
        }));

        return finalReport;
      },
      openNewSubmissionPeriod: () => {
        const currentDate = new Date();
        const month = currentDate.toLocaleString("en-US", { month: "long" });
        const year = currentDate.getFullYear().toString();

        // Guard against duplicate reports for the actual current submission period.
        const existing = get().reports.some((r) => {
          const yearMatch = r.period.match(/\d{4}/);
          return r.month === month && yearMatch?.[0] === year;
        });
        if (existing) return false;

        const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
        const lastDay = new Date(Number(year), monthIndex + 1, 0).getDate();
        const shortMonth = month.slice(0, 3);
        const period = `${shortMonth} 1 - ${shortMonth} ${lastDay}, ${year}`;
        const timestamp = Date.now().toString().slice(-4);

        const newReports: IntakeReport[] = reportEnterprises.map((ent, idx) => ({
          id: `REP-${timestamp}${idx}`,
          enterpriseId: ent.id,
          enterprise: ent.name,
          category: ent.category,
          barangay: ent.barangay,
          month,
          period,
          submitted: "Not submitted",
          status: "Missing" as const,
          code: `AT-${String(idx + 1).padStart(3, "0")}`,
          remarks: "Pending enterprise submission.",
          metrics: { entry: 0, exit: 0, unique: 0, peak: "N/A" },
        }));

        set((state) => ({ reports: [...state.reports, ...newReports] }));
        return true;
      },
    }),
    {
      name: "tanaw-report-workflow",
      partialize: (state) => ({
        reports: mergeReportsWithBaseline(state.reports),
        finalReports: state.finalReports,
      }),
    },
  ),
);

function mergeReportsWithBaseline(reports: IntakeReport[]) {
  const reportMap = new Map(reports.map((report) => [report.id, report]));
  const baselineIds = new Set(initialReports.map((report) => report.id));
  const baselineReports = initialReports.map((report) => reportMap.get(report.id) ?? report);
  const openedPeriodReports = reports.filter((report) => !baselineIds.has(report.id));

  return [...baselineReports, ...openedPeriodReports];
}

export function getReportEnterpriseName(enterpriseId: string) {
  return reportEnterprises.find((enterprise) => enterprise.id === enterpriseId)?.name ?? enterpriseId;
}
