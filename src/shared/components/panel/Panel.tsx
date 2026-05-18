import type { ComponentType, PropsWithChildren, ReactNode } from "react";
import type { LucideProps } from "lucide-react";

type PanelProps = PropsWithChildren<{
  className?: string;
}>;

export function Panel({ children, className = "" }: PanelProps) {
  return <section className={["rounded-xl border border-white/70 bg-white/95 shadow-panel ring-1 ring-slate-900/3 backdrop-blur-sm", className].join(" ")}>{children}</section>;
}

type PanelHeaderProps = {
  title: string;
  icon?: ComponentType<LucideProps>;
  right?: ReactNode;
};

export function PanelHeader({ title, icon: Icon, right }: PanelHeaderProps) {
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-slate-200/80 bg-linear-to-r from-slate-50 to-white px-4 py-3">
      <span className="flex items-center gap-2 text-[10px] font-black tracking-widest text-tanaw-navy uppercase">
        {Icon && <Icon size={13} className="text-tanaw-green" />}
        {title}
      </span>
      {right}
    </div>
  );
}
