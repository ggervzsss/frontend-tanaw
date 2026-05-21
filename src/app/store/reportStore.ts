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
  syncCurrentSubmissionPeriod: () => void;
};

const REPORT_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

type SubmissionPeriod = {
  month: string;
  monthIndex: number;
  period: string;
  periodKey: string;
  year: string;
};

export const useReportStore = create<ReportState>()(
  persist(
    (set, get) => ({
      reports: includeCurrentSubmissionPeriod(initialReports),
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
      syncCurrentSubmissionPeriod: () =>
        set((state) => {
          const reports = includeCurrentSubmissionPeriod(state.reports);
          return reports === state.reports ? state : { reports };
        }),
    }),
    {
      name: "tanaw-report-workflow",
      version: 1,
      migrate: () => ({
        reports: includeCurrentSubmissionPeriod(initialReports),
        finalReports: initialFinalReports,
      }),
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

function includeCurrentSubmissionPeriod(reports: IntakeReport[]) {
  const currentPeriod = getCurrentSubmissionPeriod();
  const periodExists = reports.some((report) => report.month === currentPeriod.month && report.period.match(/\d{4}/)?.[0] === currentPeriod.year);

  return periodExists ? reports : [...reports, ...createMissingReports(currentPeriod)];
}

function getCurrentSubmissionPeriod(date = new Date()): SubmissionPeriod {
  const monthIndex = date.getMonth();
  const month = REPORT_MONTHS[monthIndex];
  const year = String(date.getFullYear());
  const lastDay = new Date(date.getFullYear(), monthIndex + 1, 0).getDate();
  const shortMonth = month.slice(0, 3);

  return {
    month,
    monthIndex,
    period: `${shortMonth} 1 - ${shortMonth} ${lastDay}, ${year}`,
    periodKey: `${year}${String(monthIndex + 1).padStart(2, "0")}`,
    year,
  };
}

function createMissingReports(period: SubmissionPeriod): IntakeReport[] {
  return reportEnterprises.map((enterprise, index) => ({
    id: `REP-${period.periodKey}-${String(index + 1).padStart(2, "0")}`,
    enterpriseId: enterprise.id,
    enterprise: enterprise.name,
    category: enterprise.category,
    barangay: enterprise.barangay,
    month: period.month,
    period: period.period,
    submitted: "Not submitted",
    status: "Missing",
    code: `AT-${String(index + 1).padStart(3, "0")}`,
    remarks: "Pending enterprise submission.",
    metrics: { entry: 0, exit: 0, unique: 0, peak: "N/A" },
  }));
}

export function getReportEnterpriseName(enterpriseId: string) {
  return reportEnterprises.find((enterprise) => enterprise.id === enterpriseId)?.name ?? enterpriseId;
}
