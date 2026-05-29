import { Bell, FileText } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import toast from "react-hot-toast";
import { EmptyState, ModalPortal } from "@/shared/components/ui";
import type { IntakeReport, ReportEnterprise } from "@/shared/types";
import { ReportStatusBadge } from "./ReportStatusBadge";

type EnterpriseReportsModalProps = {
  enterprise: ReportEnterprise;
  reports: IntakeReport[];
  onClose: () => void;
  onOpenReport: (report: IntakeReport) => void;
};

export function EnterpriseReportsModal({ enterprise, reports, onClose, onOpenReport }: EnterpriseReportsModalProps) {
  const [notified, setNotified] = useState(false);
  const activeReports = reports.filter((report) => report.status !== "Consolidated");
  const archivedReports = reports.filter((report) => report.status === "Consolidated");
  const needsNotification = !activeReports.some((report) => report.status === "Ready to Consolidate");

  const handleNotify = () => {
    setNotified(true);
    toast.success(`${enterprise.name} has been notified to submit their compliance report.`);
  };

  return (
    <ModalPortal>
      <motion.div className="bg-charcoal-950/70 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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
                {enterprise.category} - {enterprise.barangay}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {needsNotification && (
                <button
                  onClick={handleNotify}
                  disabled={notified}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    notified ? "cursor-default bg-gray-100 text-gray-400" : "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
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
        {reports.length === 0 && <EmptyState icon={FileText} title={empty} description="Relevant submissions will appear here once reports are received from enterprises." minHeightClassName="min-h-40" />}
      </div>
    </section>
  );
}

