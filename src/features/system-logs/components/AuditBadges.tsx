import type { AuditEvent, AuditRole } from "../../../shared/types";

export function RoleBadge({ role }: { role: AuditRole }) {
  const classes: Record<AuditRole, string> = {
    Admin: "bg-tanaw-navy/10 text-tanaw-navy border-tanaw-navy/20",
    "IT Personnel": "bg-tanaw-green/10 text-tanaw-green border-tanaw-green/20",
    Staff: "bg-tanaw-blue/10 text-tanaw-blue border-tanaw-blue/20",
    Enterprise: "bg-slate-100 text-slate-700 border-slate-300",
    System: "bg-slate-100 text-slate-600 border-slate-200",
  };

  return <span className={`inline-flex min-w-20.5 items-center justify-center rounded-full border px-2 py-1 text-[9px] font-black tracking-wider uppercase shadow-sm ${classes[role]}`}>{role}</span>;
}

export function EventBadge({ event }: { event: AuditEvent }) {
  const color =
    event === "Error"
      ? "text-tanaw-red font-black"
      : event === "Update"
        ? "text-tanaw-orange font-bold"
        : ["Submit", "Export"].includes(event)
          ? "text-tanaw-green font-bold"
          : event === "Login"
            ? "text-tanaw-blue font-bold"
            : "text-gray-500 font-bold";

  const eventBg =
    event === "Error"
      ? "border-red-100 bg-red-50"
      : event === "Update"
        ? "border-orange-100 bg-orange-50"
        : ["Submit", "Export"].includes(event)
          ? "border-green-100 bg-green-50"
          : event === "Login"
            ? "border-blue-100 bg-blue-50"
            : "border-slate-200 bg-slate-50";

  return <span className={`inline-flex min-w-18.5 items-center justify-center rounded-full border px-2 py-1 text-[9px] tracking-widest uppercase shadow-sm ${eventBg} ${color}`}>{event}</span>;
}
