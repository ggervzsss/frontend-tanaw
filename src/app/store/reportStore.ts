import { create } from "zustand";
import { persist } from "zustand/middleware";
import { finalReports as initialFinalReports, intakeReports as initialReports, reportEnterprises } from "../../shared/data";
import type { FinalReport, IntakeReport, ReportStatus } from "../../shared/types";

type ReportState = {
  reports: IntakeReport[];
  finalReports: FinalReport[];
  updateReportStatus: (reportId: string, status: ReportStatus, remarks?: string) => void;
  generateFinalReport: (reportIds: string[], preparedBy: string) => FinalReport | null;
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
  return initialReports.map((report) => reportMap.get(report.id) ?? report);
}

export function getReportEnterpriseName(enterpriseId: string) {
  return reportEnterprises.find((enterprise) => enterprise.id === enterpriseId)?.name ?? enterpriseId;
}
