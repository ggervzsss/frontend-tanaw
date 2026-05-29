import type { ReactNode } from "react";

type DetailFieldProps = {
  label: string;
  value: ReactNode;
};

export function DetailField({ label, value }: DetailFieldProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="mb-1 text-[10px] font-bold tracking-wide text-gray-500 uppercase">{label}</p>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}
