import type { IntakeReport, ReportEnterprise, ReportStatus } from "@/shared/types";

export const MONTH_ORDER = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export type SubmissionPeriod = {
  month: string;
  year: string;
};

export type EnterpriseReportRow = {
  enterprise: ReportEnterprise;
  currentReport: IntakeReport | undefined;
  archivedReports: IntakeReport[];
  status: ReportStatus | "Missing";
};

export function getReportYear(report: IntakeReport) {
  return report.period.match(/\d{4}/)?.[0] ?? null;
}

export function reportMatchesPeriod(report: IntakeReport, month: string, year: string) {
  return report.month === month && getReportYear(report) === year;
}

export function getCurrentSubmissionPeriod(): SubmissionPeriod {
  const currentDate = new Date();
  return {
    month: MONTH_ORDER[currentDate.getMonth()],
    year: String(currentDate.getFullYear()),
  };
}

export function getLatestSubmissionPeriod(reports: IntakeReport[]) {
  return reports.reduce<SubmissionPeriod | null>((latestPeriod, report) => {
    const year = getReportYear(report);
    const monthIndex = MONTH_ORDER.indexOf(report.month);
    if (!year || monthIndex === -1) return latestPeriod;

    if (!latestPeriod) {
      return { month: report.month, year };
    }

    const latestMonthIndex = MONTH_ORDER.indexOf(latestPeriod.month);
    if (Number(year) > Number(latestPeriod.year) || (year === latestPeriod.year && monthIndex > latestMonthIndex)) {
      return { month: report.month, year };
    }

    return latestPeriod;
  }, null);
}

export function getDefaultSubmissionPeriod(reports: IntakeReport[], currentPeriod: SubmissionPeriod) {
  if (reports.some((report) => reportMatchesPeriod(report, currentPeriod.month, currentPeriod.year))) {
    return currentPeriod;
  }

  return getLatestSubmissionPeriod(reports) ?? currentPeriod;
}

export function getAvailableMonths(reports: IntakeReport[], currentPeriod: SubmissionPeriod) {
  const months = Array.from(new Set([currentPeriod.month, ...reports.map((report) => report.month)]));
  return months.sort((left, right) => MONTH_ORDER.indexOf(left) - MONTH_ORDER.indexOf(right));
}

export function getAvailableYears(reports: IntakeReport[], currentPeriod: SubmissionPeriod) {
  const years = Array.from(new Set([currentPeriod.year, ...reports.map(getReportYear).filter((year): year is string => Boolean(year))]));
  return years.sort((left, right) => Number(right) - Number(left));
}

export function getEnterpriseReportRows(reportEnterprises: ReportEnterprise[], filteredByPeriod: IntakeReport[], nonPeriodReports: IntakeReport[], query: string): EnterpriseReportRow[] {
  const normalizedQuery = query.trim().toLowerCase();

  return reportEnterprises
    .map((enterprise) => {
      const currentReport = filteredByPeriod.find((report) => report.enterpriseId === enterprise.id);
      const archivedReports = nonPeriodReports.filter((report) => report.enterpriseId === enterprise.id);
      return {
        enterprise,
        currentReport,
        archivedReports,
        status: currentReport?.status ?? "Missing",
      };
    })
    .filter((row) => !normalizedQuery || [row.enterprise.name, row.enterprise.category, row.enterprise.barangay, row.currentReport?.id ?? ""].some((value) => value.toLowerCase().includes(normalizedQuery)));
}

