import type { ReactNode } from "react";
import { motion } from "motion/react";
import { ModalPortal } from "./ModalPortal";

type ModalFrameProps = {
  title: string;
  children: ReactNode;
  onClose: () => void;
  maxWidthClassName?: string;
};

export function ModalFrame({ title, children, onClose, maxWidthClassName = "max-w-3xl" }: ModalFrameProps) {
  return (
    <ModalPortal>
      <motion.div className="bg-charcoal-950/70 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.section
          className={`max-h-[92vh] w-full overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-2xl ${maxWidthClassName}`}
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <header className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            <button onClick={onClose} className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-500 transition hover:bg-white hover:text-gray-900">
              Close
            </button>
          </header>
          <div className="p-6">{children}</div>
        </motion.section>
      </motion.div>
    </ModalPortal>
  );
}
