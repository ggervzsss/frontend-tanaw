import type { ReactNode } from "react";

type DetailFieldProps = {
  label: string;
  value: ReactNode;
};

export function DetailField({ label, value }: DetailFieldProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 ring-1 ring-white">
      <p className="mb-1.5 text-[10px] font-bold tracking-wide text-slate-500 uppercase">{label}</p>
      <p className="text-sm leading-relaxed font-semibold text-slate-900">{value}</p>
    </div>
  );
}
