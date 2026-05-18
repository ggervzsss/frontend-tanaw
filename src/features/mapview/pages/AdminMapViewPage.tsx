import { MapPin } from "lucide-react";
import { PageHeader } from "../../../shared/components/layout";
import { PageMotion } from "../../../shared/components/ui";
import { AdminEnterpriseMap } from "../components/AdminEnterpriseMap";

export function AdminMapViewPage() {
  return (
    <PageMotion>
      <PageHeader
        title="Geographic Telemetry"
        description="Interactive spatial overview of enterprise visitor activity and operational status."
        action={
          <span className="inline-flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-bold text-tanaw-blue">
            <MapPin size={12} /> GIS Engine Active
          </span>
        }
      />
      <AdminEnterpriseMap />
    </PageMotion>
  );
}
