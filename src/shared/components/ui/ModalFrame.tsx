import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { motion } from "motion/react";
import { ModalPortal } from "./ModalPortal";

type ModalFrameProps = {
  title: string;
  children: ReactNode;
  onClose: () => void;
  maxWidthClassName?: string;
  eyebrow?: ReactNode;
};

export function ModalFrame({ title, children, onClose, maxWidthClassName = "max-w-3xl", eyebrow }: ModalFrameProps) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.key !== "Escape") return;
      onClose();
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return (
    <ModalPortal>
      <motion.div
        className="fixed inset-0 z-[1100] flex min-h-dvh items-center justify-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onPointerDown={onClose}
      >
        <motion.section
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className={`my-auto max-h-[92vh] w-full overflow-y-auto rounded-2xl border border-white/80 bg-white shadow-[0_28px_80px_rgba(2,6,23,0.36)] ring-1 ring-slate-900/6 ${maxWidthClassName}`}
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <div className="h-1.5 bg-gradient-to-r from-tanaw-green via-emerald-500 to-tanaw-lime" />
          <header className="flex items-start justify-between gap-4 border-b border-slate-200/80 bg-linear-to-r from-emerald-50/80 via-white to-white px-6 py-5">
            <div className="min-w-0">
              {eyebrow && <p className="mb-1 font-mono text-[10px] font-bold tracking-wide text-emerald-700/80 uppercase">{eyebrow}</p>}
              <h2 className="text-tanaw-navy text-xl font-bold tracking-tight">{title}</h2>
            </div>
            <button
              type="button"
              aria-label="Close modal"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-500 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-100 hover:bg-emerald-50 hover:text-tanaw-green focus:ring-4 focus:ring-tanaw-green/15 focus:outline-none"
            >
              <X size={17} />
            </button>
          </header>
          <div className="p-6 max-sm:p-5">{children}</div>
        </motion.section>
      </motion.div>
    </ModalPortal>
  );
}
