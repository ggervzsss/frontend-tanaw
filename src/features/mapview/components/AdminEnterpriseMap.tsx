import L from "leaflet";
import { Building2, MapPin, Search, Users } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { mapEnterprises } from "../../../shared/data";
import type { EnterpriseStatus, MapEnterprise } from "../../../shared/types";

const sanPedroCenter: L.LatLngTuple = [14.3413, 121.0446];

const statusColor: Record<EnterpriseStatus, string> = {
  Normal: "#055b25",
  Warning: "#ff6204",
  Critical: "#a40e0e",
};

export function AdminEnterpriseMap() {
  const mapContainerId = "admin-enterprise-map";
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<number, L.Marker>>({});
  const [query, setQuery] = useState("");
  const [selectedEnterpriseId, setSelectedEnterpriseId] = useState<number>(mapEnterprises[0].id);

  const filteredEnterprises = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return mapEnterprises;

    return mapEnterprises.filter((enterprise) =>
      [enterprise.name, enterprise.barangay, enterprise.type].some((value) => value.toLowerCase().includes(normalizedQuery)),
    );
  }, [query]);

  const selectedEnterprise = mapEnterprises.find((enterprise) => enterprise.id === selectedEnterpriseId) ?? mapEnterprises[0];

  useEffect(() => {
    if (mapRef.current) return undefined;

    const map = L.map(mapContainerId, {
      zoomControl: false,
      scrollWheelZoom: true,
    }).setView(sanPedroCenter, 13);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
    }).addTo(map);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    mapRef.current = map;

    return () => {
      Object.values(markersRef.current).forEach((marker) => marker.remove());
      markersRef.current = {};
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    mapEnterprises.forEach((enterprise) => {
      const color = statusColor[enterprise.status];
      const marker = L.marker([enterprise.lat, enterprise.lng], {
        icon: L.divIcon({
          className: "tanaw-map-pin",
          iconAnchor: [8, 8],
          html: `<span style="background:${color};width:16px;height:16px;display:block;border-radius:999px;border:2px solid #fff;box-shadow:0 8px 20px rgba(15,23,42,.35);"></span>`,
        }),
      }).addTo(map);

      marker.bindPopup(createPopupHtml(enterprise, color), { closeButton: false });
      marker.on("click", () => setSelectedEnterpriseId(enterprise.id));
      markersRef.current[enterprise.id] = marker;
    });
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const marker = markersRef.current[selectedEnterpriseId];
    if (!map || !marker) return;

    map.flyTo(marker.getLatLng(), 15, { duration: 0.8 });
    marker.openPopup();
  }, [selectedEnterpriseId]);

  return (
    <div className="relative min-h-[620px] overflow-hidden rounded-xl border border-tanaw-gray bg-tanaw-gray shadow-sm">
      <div id={mapContainerId} className="absolute inset-0 z-0" />

      <motion.aside
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="absolute top-4 bottom-4 left-4 z-[400] flex w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border border-white/10 bg-slate-950/45 shadow-2xl backdrop-blur-md"
      >
        <div className="border-b border-white/10 bg-black/20 px-4 py-3">
          <span className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-white uppercase">
            <MapPin size={14} className="text-tanaw-sky" /> Spatial Directory
          </span>
          <p className="mt-1 text-[9px] font-semibold tracking-widest text-white/55 uppercase">{filteredEnterprises.length} registered enterprises</p>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3">
          <label className="flex items-center gap-2 rounded-lg border border-white/15 bg-black/15 px-3 py-2 text-white focus-within:border-tanaw-sky">
            <Search size={13} className="text-white/45" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search enterprise"
              className="min-w-0 flex-1 bg-transparent text-[10px] font-bold tracking-widest text-white uppercase outline-none placeholder:text-white/35"
            />
          </label>

          <section className="rounded-lg border border-white/10 bg-white/5 p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-[9px] font-black tracking-widest text-white/70 uppercase">
                <Building2 size={13} className="text-tanaw-sky" />
                Enterprise List
              </h3>
              <span className="text-[9px] font-bold tracking-widest text-white/50 uppercase">{filteredEnterprises.length}</span>
            </div>
            <div className="space-y-2">
              {filteredEnterprises.map((enterprise) => (
                <EnterpriseMapCard
                  key={enterprise.id}
                  enterprise={enterprise}
                  selected={selectedEnterpriseId === enterprise.id}
                  onClick={() => setSelectedEnterpriseId(enterprise.id)}
                />
              ))}
            </div>
          </section>
        </div>
      </motion.aside>

      <div className="absolute right-4 bottom-4 z-[400] hidden w-80 rounded-xl border border-white/80 bg-white/95 p-4 shadow-xl backdrop-blur md:block">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Selected Enterprise</p>
            <h3 className="mt-1 text-sm font-black text-tanaw-navy">{selectedEnterprise.name}</h3>
          </div>
          <span className={`rounded border px-2 py-1 text-[9px] font-black tracking-widest uppercase ${getStatusBadgeClass(selectedEnterprise.status)}`}>
            {selectedEnterprise.status}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <InfoTile label="Barangay" value={selectedEnterprise.barangay} />
          <InfoTile label="Type" value={selectedEnterprise.type} />
          <InfoTile label="Visitors" value={selectedEnterprise.visitorCount.toLocaleString()} />
          <InfoTile label="Tourists" value={selectedEnterprise.totalTourists.toLocaleString()} />
        </div>
      </div>
    </div>
  );
}

function EnterpriseMapCard({ enterprise, selected, onClick }: { enterprise: MapEnterprise; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-lg border p-3 text-left transition-all hover:bg-white/10 focus:ring-2 focus:ring-tanaw-sky focus:outline-none ${selected ? "border-tanaw-sky/50 bg-white/15" : "border-white/10 bg-white/5"}`}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h4 className="text-[12px] leading-tight font-bold text-white">{enterprise.name}</h4>
          <div className="mt-1 flex items-center gap-1.5 text-[9px] font-bold tracking-widest text-white/60 uppercase">
            <MapPin size={10} /> {enterprise.barangay}
          </div>
        </div>
        <span className={`flex shrink-0 items-center rounded border px-1.5 py-0.5 text-[9px] font-black tracking-widest uppercase ${getStatusBadgeClass(enterprise.status)}`}>
          {enterprise.status}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/10 pt-2 font-mono text-[10px]">
        <span className="truncate text-white/60">{enterprise.type}</span>
        <span className="flex items-center justify-end gap-1 font-bold text-white">
          <Users size={12} className="text-tanaw-sky" />
          {enterprise.visitorCount.toLocaleString()}
        </span>
      </div>
    </button>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
      <p className="text-[9px] font-black tracking-widest text-slate-400 uppercase">{label}</p>
      <p className="mt-1 text-sm font-black text-slate-900">{value}</p>
    </div>
  );
}

function getStatusBadgeClass(status: EnterpriseStatus) {
  if (status === "Critical") return "border-red-200 bg-red-50 text-red-700";
  if (status === "Warning") return "border-orange-200 bg-orange-50 text-orange-700";
  return "border-green-200 bg-green-50 text-green-700";
}

function createPopupHtml(enterprise: MapEnterprise, color: string) {
  return `<div style="font-family:Bai Jamjuree,sans-serif;min-width:220px;padding:4px;"><h3 style="margin:0 0 2px;color:#2a3063;font-weight:800;font-size:13px;">${enterprise.name}</h3><p style="font-size:9px;color:#666;text-transform:uppercase;letter-spacing:1px;">${enterprise.type} - ${enterprise.barangay}</p><p style="font-size:10px;color:#2a3063;font-weight:800;">${enterprise.visitorCount.toLocaleString()} visitors | ${enterprise.totalTourists.toLocaleString()} tourists</p><span style="font-size:9px;color:${color};font-weight:800;padding:2px 4px;border:1px solid ${color};border-radius:2px;text-transform:uppercase;">${enterprise.status}</span></div>`;
}
