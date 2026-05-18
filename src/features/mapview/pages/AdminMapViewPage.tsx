import { MapPin } from "lucide-react";
import { PageMotion } from "../../../shared/components/ui";
import { AdminEnterpriseMap } from "../components/AdminEnterpriseMap";

export function AdminMapViewPage() {
  return (
    <PageMotion>
      <div className="mb-4 flex items-end justify-between gap-6 border-b border-slate-200 pb-5 max-md:flex-col max-md:items-start">
        <div>
          <h2 className="text-tanaw-navy m-0 text-3xl font-black tracking-wide uppercase">Geographic Telemetry</h2>
          <p className="mt-1 mb-0 text-base font-semibold text-slate-500">Interactive spatial overview of enterprise activity.</p>
        </div>
        <span className="inline-flex items-center gap-3 rounded-full border border-white/80 bg-white px-7 py-3 text-sm font-black tracking-widest text-slate-500 uppercase shadow-sm">
          <MapPin size={16} className="text-tanaw-blue" /> GIS Engine Active
        </span>
      </div>
      <AdminEnterpriseMap />
    </PageMotion>
  );
}
