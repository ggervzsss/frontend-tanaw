import { MapPin } from "lucide-react";
import { PageMotion } from "../../../shared/components/ui";
import { AdminEnterpriseMap } from "../components/AdminEnterpriseMap";

export function AdminMapViewPage() {
  return (
    <PageMotion>
      <div className="-mb-12 flex h-[calc(100vh-9rem)] min-h-130 flex-col max-xl:h-[calc(100vh-8rem)] max-sm:h-auto max-sm:min-h-0">
        <div className="mb-4 flex shrink-0 items-end justify-between gap-6 border-b border-slate-200 pb-3 max-md:flex-col max-md:items-start">
          <div>
            <h2 className="text-charcoal-800 m-0 text-2xl font-bold tracking-normal">Geographic Telemetry</h2>
            <p className="mt-1 mb-0 text-sm text-[#6b7280]">Interactive spatial overview of enterprise activity.</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-lg border border-white/80 bg-white px-4 py-2 text-xs font-bold tracking-wide text-slate-500 uppercase shadow-sm">
            <MapPin size={14} className="text-tanaw-blue" /> GIS Engine Active
          </span>
        </div>
        <AdminEnterpriseMap />
      </div>
    </PageMotion>
  );
}
