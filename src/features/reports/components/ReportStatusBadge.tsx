import type { FinalReportStatus, ReportStatus } from "../../../shared/types";

export function ReportStatusBadge({ status }: { status: ReportStatus | FinalReportStatus }) {
  const classes =
    status === "Pending Review"
      ? "bg-yellow-50 text-yellow-700 border-yellow-200"
      : status === "Ready to Consolidate" || status === "Approved"
        ? "bg-green-50 text-green-700 border-green-200"
        : status === "Returned" || status === "Missing"
          ? "bg-red-50 text-red-700 border-red-200"
          : status === "Consolidated" || status === "Draft"
            ? "bg-blue-50 text-blue-700 border-blue-200"
            : "bg-gray-200 text-gray-700 border-gray-300";

  return <span className={`rounded border px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase ${classes}`}>{status}</span>;
}
