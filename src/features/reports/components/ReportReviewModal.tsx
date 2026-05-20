import { Printer, X } from "lucide-react";
import { motion } from "motion/react";
import { ModalPortal } from "../../../shared/components/ui";
import type { IntakeReport } from "../../../shared/types";
import { DotSingleReportTable } from "./DotReportTable";
import { ReportStatusBadge } from "./ReportStatusBadge";

type ReportReviewModalProps = {
  report: IntakeReport;
  onClose: () => void;
  onAccept: (report: IntakeReport) => void;
  onReturn: (report: IntakeReport) => void;
};

export function ReportReviewModal({ report, onClose, onAccept, onReturn }: ReportReviewModalProps) {
  return (
    <ModalPortal>
      <motion.div
        className="bg-charcoal-950/80 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm print:bg-white print:p-0 print:backdrop-blur-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.section
          className="flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl print:max-h-none print:border-none print:shadow-none"
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <div className="print-hide flex items-center justify-between border-b border-gray-200 bg-gray-50 p-5">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <h3 className="text-lg font-bold text-gray-900">Review DOT Form Generation</h3>
                <ReportStatusBadge status={report.status} />
              </div>
              <p className="text-xs text-gray-500">
                {report.enterprise} - {report.period}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-white"
              >
                <Printer size={15} /> Print PDF
              </button>
              <button onClick={onClose} aria-label="Close report review" className="rounded-lg p-2 text-gray-400 transition hover:bg-white hover:text-gray-800">
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="grow overflow-y-auto bg-gray-100 p-6 print:bg-white print:p-0">
            <section className="bg-white p-6 text-black shadow-sm print:shadow-none">
              <DotSingleReportTable report={report} />
            </section>

            <div className="print-hide mt-6 rounded-xl border border-gray-200 bg-white p-5">
              <h4 className="mb-4 text-sm font-semibold text-gray-900">Data Lineage & Telemetry Sources</h4>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-gray-200 text-gray-500">
                    <tr>
                      <th className="pb-2 font-semibold">Source Node / Camera</th>
                      <th className="pb-2 font-semibold">Last Timestamp Sync</th>
                      <th className="pb-2 text-right font-semibold">Unique Pax Contributed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="py-2 font-medium text-gray-800">Zone A - Main Entrance</td>
                      <td className="py-2 font-mono text-gray-500">{report.month} 31, 23:55:01</td>
                      <td className="text-tgreen-dark py-2 text-right font-mono font-bold">{Math.floor(report.metrics.unique * 0.7).toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-medium text-gray-800">Zone B - Rear Exit</td>
                      <td className="py-2 font-mono text-gray-500">{report.month} 31, 23:58:12</td>
                      <td className="text-tgreen-dark py-2 text-right font-mono font-bold">{(report.metrics.unique - Math.floor(report.metrics.unique * 0.7)).toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="print-hide mt-6 rounded-xl border border-gray-200 bg-white p-5">
              <h4 className="mb-2 text-sm font-semibold text-gray-900">Data Protection & Remarks</h4>
              <p className="mb-4 text-xs text-gray-500">Values in the DOT form are read-only and populated directly from edge node telemetry.</p>
              <textarea
                defaultValue={report.remarks}
                className="focus:ring-tgreen-dark w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-sm text-gray-900 outline-none focus:ring-1"
                rows={3}
                placeholder="Add remarks for revision or consolidation notes..."
              />
            </div>
          </div>

          <div className="print-hide flex justify-end gap-3 border-t border-gray-200 bg-white p-5">
            <button onClick={() => onReturn(report)} className="rounded-lg border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50">
              Return for Revision
            </button>
            <button onClick={() => onAccept(report)} className="bg-tgreen-dark hover:bg-tgreen-light rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition">
              Accept & Mark Ready
            </button>
          </div>
        </motion.section>
      </motion.div>
    </ModalPortal>
  );
}
