import { Download, Printer, X } from "lucide-react";
import { motion } from "motion/react";
import { ModalPortal } from "../../../shared/components/ui";
import { CITY_SEAL } from "../../../shared/constants/branding";
import type { FinalReport } from "../../../shared/types";
import { DotFinalReportTable } from "./DotReportTable";

type FinalReportViewerProps = {
  report: FinalReport;
  onClose: () => void;
};

export function FinalReportViewer({ report, onClose }: FinalReportViewerProps) {
  const downloadReport = () => {
    const html = `<!doctype html><html><head><title>${report.id}</title></head><body><h1>${report.title}</h1><p>${report.period}</p><p>Total Unique: ${report.totalUnique.toLocaleString()}</p></body></html>`;
    const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${report.id}.html`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ModalPortal>
      <motion.div
        className="bg-charcoal-950/80 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm print:bg-white print:p-0 print:backdrop-blur-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.section
          className="print-container relative flex max-h-[95vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl print:max-h-none print:border-none print:shadow-none"
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <div className="print-hide flex items-center justify-between border-b border-gray-200 bg-gray-50 p-4 text-black">
            <div>
              <h3 className="text-lg font-bold">Official Artifact Viewer</h3>
              <p className="text-xs text-gray-500">LGU official format with data lineage.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={downloadReport} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold transition hover:bg-gray-100">
                <Download size={15} /> Download
              </button>
              <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold transition hover:bg-gray-100">
                <Printer size={15} /> Print to PDF
              </button>
              <button onClick={onClose} aria-label="Close final report" className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-black">
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="flex grow flex-col overflow-y-auto bg-white p-8 text-black print:overflow-visible print:p-0">
            <div className="print-hide mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h4 className="mb-3 text-sm font-bold text-gray-800">Version History & Audit Trail</h4>
              <ul className="space-y-2 font-mono text-xs text-gray-600">
                <li className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <span>v1.0 Draft aggregated by System Pipeline</span>
                  <span>{report.generatedOn} 04:15 AM</span>
                </li>
                <li className="flex items-center justify-between pt-1">
                  <span>v1.1 Finalized and authorized by {report.preparedBy}</span>
                  <span>{report.generatedOn} 09:30 AM</span>
                </li>
              </ul>
            </div>

            <div className="mb-6 border-b-2 border-black pb-4 text-center">
              <img src={CITY_SEAL} className="mx-auto mb-3 h-16 w-16 grayscale" alt="San Pedro Seal" />
              <h1 className="font-serif text-lg font-bold tracking-widest uppercase">City Government of San Pedro</h1>
              <p className="mt-1 text-xs tracking-wider uppercase">Tourism & Economic Development Office</p>
              <h2 className="mt-5 text-xl font-bold underline">{report.title}</h2>
              <p className="mt-1 font-mono text-sm">Reporting Period: {report.period}</p>
            </div>

            <p className="mb-6 text-justify text-sm leading-relaxed">
              This document certifies the consolidated visitor analytics derived from the TANAW Edge Intelligence Network for the stated period. Aggregation relies on immutable edge telemetry over{" "}
              {report.enterpriseCount} monitored enterprise nodes.
            </p>

            <DotFinalReportTable report={report} />

            <div className="mt-auto pt-10">
              <div className="mb-8 flex items-end justify-between">
                <Signature label="Prepared By" sub={report.preparedRole} />
                <div className="flex h-24 w-48 -rotate-12 items-center justify-center rounded-lg border-4 border-gray-100 p-2 text-center text-xl leading-snug font-bold tracking-widest text-gray-200 uppercase select-none">
                  Verified By
                  <br />
                  TANAW AI
                </div>
              </div>
              <div className="flex items-end justify-between">
                <Signature label="Checked By" sub="Tourism Audit Officer" />
                <Signature label="Approved By" sub="Head of Department" />
              </div>
            </div>
          </div>
        </motion.section>
      </motion.div>
    </ModalPortal>
  );
}

function Signature({ label, sub }: { label: string; sub: string }) {
  return (
    <div className="w-56 text-center">
      <div className="flex h-8 items-end justify-center border-b border-black" />
      <p className="mt-2 text-xs font-bold tracking-wide uppercase">{label}</p>
      <p className="mt-1 text-[10px] text-gray-500">{sub}</p>
    </div>
  );
}
