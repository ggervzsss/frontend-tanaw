type TechnicalGaugeProps = {
  label: string;
  value: number;
  max: number;
  unit: string;
  status: "Critical" | "Warning" | "Info";
};

export function TechnicalGauge({ label, value, max, unit, status }: TechnicalGaugeProps) {
  const percent = Math.min(100, Math.round((value / max) * 100));
  const color = status === "Critical" ? "bg-tanaw-red" : status === "Warning" ? "bg-tanaw-orange" : "bg-tanaw-blue";

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm ring-1 ring-white">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-tanaw-navy text-sm font-black">{label}</p>
          <p className="mt-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
            Threshold: {max.toLocaleString()} {unit}
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-black tracking-widest text-slate-500 uppercase">{status}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${percent}%` }} />
      </div>
      <div className="mt-2 flex justify-between text-xs font-bold text-slate-500">
        <span>
          {value.toLocaleString()} {unit}
        </span>
        <span>{percent}%</span>
      </div>
    </div>
  );
}
