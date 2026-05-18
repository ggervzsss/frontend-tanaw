import L, { type GeoJSONOptions, type Layer } from "leaflet";
import { ArrowLeft, BarChart3, Building2, Map as MapIcon, MapPin, PanelLeftClose, PanelLeftOpen, Search, Users } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { mapEnterprises } from "../../../shared/data";
import type { EnterpriseStatus, MapEnterprise } from "../../../shared/types";

type GeoJsonFeatureCollection = GeoJSON.FeatureCollection;

type BarangayAnalytics = {
  totalVisitors: number;
  topSegment: string;
  localVisitors: number;
  nonLocalVisitors: number;
  maleVisitors: number;
  femaleVisitors: number;
  totalTourists: number;
  status: EnterpriseStatus | "No Data";
};

const SAN_PEDRO_BARANGAYS_URL = "/data/san_pedro_barangays_clean_v4.geojson";

const sanPedroFallbackCenter: L.LatLngTuple = [14.3413, 121.0446];

const sanPedroFallbackBounds: L.LatLngBoundsExpression = [
  [14.274, 120.985],
  [14.379, 121.091],
];

const barangayColors: Record<string, string> = {
  bagongsilang: "#C7E9F1",
  bayanbayanan: "#A6D8A8",
  calendola: "#BDE0B0",
  chrysanthemum: "#F6F1D1",
  cuyab: "#BDE0B0",
  estrella: "#C7E9F1",
  fatima: "#F6F1D1",
  gsis: "#B5D1FF",
  landayan: "#D8C9A7",
  langgam: "#FFC8A2",
  laram: "#B5D1FF",
  magsaysay: "#DCCCF5",
  maharlika: "#A2D9A1",
  narra: "#D8C9A7",
  nueva: "#C7E9F1",
  pacita1: "#DE802B",
  pacita2: "#A2D9A1",
  poblacion: "#F6F1D1",
  rosario: "#C084FC",
  riverside: "#BDE0B0",
  sampaguita: "#DCCCF5",
  sanantonio: "#5C6F2B",
  sanlorenzo: "#93C5FD",
  sanroque: "#B5D1FF",
  sanvicente: "#FFC8A2",
  santonino: "#FFD200",
  unitedbayanihan: "#A2D9A1",
  unitedbetterliving: "#B5D1FF",
};

const fallbackBarangayColors = ["#A2D9A1", "#F6F1D1", "#B5D1FF", "#FFC8A2", "#DCCCF5", "#C7E9F1"];

const barangayFilterAliases: Record<string, string> = {
  brgypacitai: "pacita1",
  brgypacitaii: "pacita2",
  pacitai: "pacita1",
  pacitaone: "pacita1",
  pacitaii: "pacita2",
  pacitatwo: "pacita2",
  sanlorenzoruiz: "sanlorenzo",
};

const statusPriority: Record<EnterpriseStatus, number> = {
  Normal: 1,
  Warning: 2,
  Critical: 3,
};

const activeBoundaryStyle: L.PathOptions = {
  color: "#2d5eff",
  fillOpacity: 0.82,
  weight: 3.2,
};

const dimmedBoundaryStyle: L.PathOptions = {
  color: "#2a3063",
  fillOpacity: 0.18,
  opacity: 0.55,
  weight: 1,
};

const hoverBoundaryStyle: L.PathOptions = {
  color: "#ffffff",
  fillOpacity: 0.74,
  weight: 2.4,
};

export function AdminEnterpriseMap() {
  const mapContainerId = "admin-enterprise-map";
  const mapRef = useRef<L.Map | null>(null);
  const boundaryLayerRef = useRef<L.GeoJSON | null>(null);
  const activeBoundaryRef = useRef<L.Path | null>(null);
  const markersRef = useRef<Record<number, L.Marker>>({});
  const selectedBarangayNameRef = useRef<string | null>(null);

  const [boundary, setBoundary] = useState<GeoJsonFeatureCollection | null>(null);
  const [isBoundaryLoading, setIsBoundaryLoading] = useState(true);
  const [isBoundaryError, setIsBoundaryError] = useState(false);
  const [isDirectoryCollapsed, setIsDirectoryCollapsed] = useState(false);
  const [showBoundaries, setShowBoundaries] = useState(true);
  const [barangaySearch, setBarangaySearch] = useState("");
  const [selectedBarangayName, setSelectedBarangayName] = useState<string | null>(null);
  const [selectedEnterpriseId, setSelectedEnterpriseId] = useState<number | null>(null);

  const boundaryFeatureCount = useMemo(() => boundary?.features.filter(isBoundaryPolygonFeature).length ?? 0, [boundary]);

  const enterpriseCountsByBarangay = useMemo(() => {
    const counts = new Map<string, { count: number; visitors: number }>();

    mapEnterprises.forEach((enterprise) => {
      const key = normalizeBarangayName(enterprise.barangay);
      const current = counts.get(key) ?? { count: 0, visitors: 0 };
      counts.set(key, {
        count: current.count + 1,
        visitors: current.visitors + enterprise.visitorCount,
      });
    });

    return counts;
  }, []);

  const barangayDirectoryItems = useMemo(() => {
    const searchKey = normalizeBarangayName(barangaySearch);

    return (boundary?.features ?? [])
      .filter(isBoundaryPolygonFeature)
      .map((featureItem) => {
        const label = getBarangayLabel(featureItem);
        const key = normalizeBarangayName(label);
        const enterpriseSummary = enterpriseCountsByBarangay.get(key) ?? { count: 0, visitors: 0 };

        return {
          feature: featureItem,
          label,
          key,
          subtitle: getFeatureValue(featureItem, ["official_barangay", "name"]),
          enterpriseCount: enterpriseSummary.count,
          visitorCount: enterpriseSummary.visitors,
        };
      })
      .filter((item) => item.key.includes(searchKey))
      .sort((left, right) => left.label.localeCompare(right.label));
  }, [barangaySearch, boundary, enterpriseCountsByBarangay]);

  const selectedBarangayEnterprises = useMemo(() => (selectedBarangayName ? getEnterprisesByBarangay(selectedBarangayName) : []), [selectedBarangayName]);
  const selectedBarangayAnalytics = useMemo(() => calculateBarangayAnalytics(selectedBarangayEnterprises), [selectedBarangayEnterprises]);
  const visibleEnterprises = selectedBarangayName ? selectedBarangayEnterprises : mapEnterprises;
  const selectedEnterprise = mapEnterprises.find((enterprise) => enterprise.id === selectedEnterpriseId);

  const applyBoundarySelection = useCallback((barangayName: string | null) => {
    const selectedKey = barangayName ? normalizeBarangayName(barangayName) : "";

    boundaryLayerRef.current?.getLayers().forEach((layer) => {
      if (!(layer instanceof L.Path)) return;

      if (!barangayName) {
        boundaryLayerRef.current?.resetStyle(layer);
        return;
      }

      const featureItem = "feature" in layer ? (layer.feature as GeoJSON.Feature | undefined) : undefined;
      const layerKey = normalizeBarangayName(getBarangayLabel(featureItem));

      if (layerKey === selectedKey) {
        layer.setStyle(activeBoundaryStyle);
        activeBoundaryRef.current = layer;
        layer.bringToFront();
        return;
      }

      layer.setStyle(dimmedBoundaryStyle);
    });
  }, []);

  const findBoundaryLayerByName = useCallback((barangayName: string) => {
    const selectedKey = normalizeBarangayName(barangayName);

    return boundaryLayerRef.current?.getLayers().find((layer) => {
      if (!("feature" in layer)) return false;

      const featureItem = layer.feature as GeoJSON.Feature | undefined;
      return normalizeBarangayName(getBarangayLabel(featureItem)) === selectedKey;
    }) as (L.Path & { feature?: GeoJSON.Feature }) | undefined;
  }, []);

  const selectBarangay = useCallback(
    (barangayName: string, layer?: L.Path) => {
      const targetLayer = layer ?? findBoundaryLayerByName(barangayName);
      const enterprises = getEnterprisesByBarangay(barangayName);
      setSelectedBarangayName(barangayName);
      setSelectedEnterpriseId(enterprises[0]?.id ?? null);
      applyBoundarySelection(barangayName);

      const map = mapRef.current;
      if (!map || !targetLayer || !(targetLayer instanceof L.Polygon)) return;

      const bounds = targetLayer.getBounds();
      if (!bounds?.isValid()) return;

      const shouldPadForDirectory = !isDirectoryCollapsed && map.getSize().x > 760;
      map.fitBounds(bounds.pad(0.24), {
        maxZoom: 15.4,
        paddingBottomRight: [24, 24],
        paddingTopLeft: [shouldPadForDirectory ? 370 : 28, 24],
      });
      targetLayer.openTooltip();
    },
    [applyBoundarySelection, findBoundaryLayerByName, isDirectoryCollapsed],
  );

  const clearSelectedBarangay = useCallback(() => {
    setSelectedBarangayName(null);
    setSelectedEnterpriseId(null);
    applyBoundarySelection(null);

    if (mapRef.current) {
      fitMapToSanPedroBounds(mapRef.current, boundaryLayerRef.current, isDirectoryCollapsed);
    }
  }, [applyBoundarySelection, isDirectoryCollapsed]);

  useEffect(() => {
    let isMounted = true;

    fetch(SAN_PEDRO_BARANGAYS_URL)
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load barangay boundary GeoJSON.");
        return response.json() as Promise<GeoJsonFeatureCollection>;
      })
      .then((payload) => {
        if (!isMounted) return;
        setBoundary(normalizeGeoJson(payload));
        setIsBoundaryError(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setBoundary(null);
        setIsBoundaryError(true);
      })
      .finally(() => {
        if (isMounted) setIsBoundaryLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    selectedBarangayNameRef.current = selectedBarangayName;
    applyBoundarySelection(selectedBarangayName);
  }, [applyBoundarySelection, selectedBarangayName]);

  useEffect(() => {
    if (mapRef.current) return undefined;

    const map = L.map(mapContainerId, {
      maxBounds: sanPedroFallbackBounds,
      maxBoundsViscosity: 0.95,
      maxZoom: 18,
      minZoom: 11.2,
      zoomControl: false,
    }).setView(sanPedroFallbackCenter, 11.65);
    mapRef.current = map;

    map.createPane("boundaryPane");
    const boundaryPane = map.getPane("boundaryPane");
    if (boundaryPane) {
      boundaryPane.style.zIndex = "410";
    }

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
    }).addTo(map);
    L.control.zoom({ position: "bottomright" }).addTo(map);

    return () => {
      Object.values(markersRef.current).forEach((marker) => marker.remove());
      markersRef.current = {};
      activeBoundaryRef.current = null;
      boundaryLayerRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !boundary) return;

    boundaryLayerRef.current?.remove();
    activeBoundaryRef.current = null;

    const boundaryStyle: GeoJSONOptions["style"] = (geoFeature) => {
      const name = getBarangayLabel(geoFeature);
      return {
        color: "#2a3063",
        weight: 1.15,
        opacity: 0.86,
        fillColor: getGeoJsonColor(name),
        fillOpacity: 0.5,
        pane: "boundaryPane",
        className: "outline-none",
      };
    };

    const onEachFeature: GeoJSONOptions["onEachFeature"] = (geoFeature, layer: Layer) => {
      const name = getBarangayLabel(geoFeature);
      layer.bindTooltip(createBoundaryTooltipHtml(name), {
        sticky: true,
        direction: "auto",
        opacity: 0.95,
      });
      layer.bindPopup(createBoundaryPopupHtml(geoFeature), {
        closeButton: false,
      });
      layer.on({
        mouseover: (event) => {
          const target = event.target as L.Path;
          const isActive = activeBoundaryRef.current === target;
          target.setStyle(isActive ? activeBoundaryStyle : hoverBoundaryStyle);
          target.bringToFront();
        },
        mouseout: (event) => {
          const target = event.target as L.Path;
          if (activeBoundaryRef.current === target) {
            target.setStyle(activeBoundaryStyle);
            return;
          }

          applyBoundarySelection(selectedBarangayNameRef.current);
        },
        click: (event) => selectBarangay(name, event.target as L.Path),
      });
    };

    boundaryLayerRef.current = L.geoJSON(boundary, {
      style: boundaryStyle,
      onEachFeature,
    });

    if (showBoundaries) {
      boundaryLayerRef.current.addTo(map);
    }

    applyBoundarySelection(selectedBarangayNameRef.current);
    fitMapToSanPedroBounds(map, boundaryLayerRef.current, isDirectoryCollapsed);
  }, [applyBoundarySelection, boundary, isDirectoryCollapsed, selectBarangay, showBoundaries]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return undefined;

    const timers = [0, 120, 280].map((delay) =>
      window.setTimeout(() => {
        map.invalidateSize({ pan: false });
        fitMapToSanPedroBounds(map, boundaryLayerRef.current, isDirectoryCollapsed);
        applyBoundarySelection(selectedBarangayNameRef.current);
      }, delay),
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [applyBoundarySelection, isDirectoryCollapsed]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    visibleEnterprises.forEach((enterprise) => {
      const color = getEnterpriseStatusColor(enterprise.status);
      const marker = L.marker([enterprise.lat, enterprise.lng], {
        icon: L.divIcon({
          className: enterprise.status === "Critical" ? "tanaw-map-pin animate-pulse" : "tanaw-map-pin",
          iconAnchor: [8, 8],
          popupAnchor: [0, -10],
          html: `<span style="background-color:${color};width:18px;height:18px;display:block;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.45);"></span>`,
        }),
      }).addTo(map);

      marker.bindTooltip(createTooltipHtml(enterprise, color), {
        direction: "top",
        offset: [0, -10],
        opacity: 0.95,
      });
      marker.bindPopup(createPopupHtml(enterprise, color), {
        closeButton: false,
      });
      marker.on("click", () => {
        selectBarangay(enterprise.barangay);
        setSelectedEnterpriseId(enterprise.id);
      });
      markersRef.current[enterprise.id] = marker;
    });
  }, [selectBarangay, visibleEnterprises]);

  useEffect(() => {
    if (!selectedEnterpriseId || !mapRef.current || !markersRef.current[selectedEnterpriseId]) return;

    const enterprise = mapEnterprises.find((item) => item.id === selectedEnterpriseId);
    if (!enterprise) return;

    mapRef.current.flyTo([enterprise.lat, enterprise.lng], 16, {
      duration: 1.1,
      easeLinearity: 0.25,
    });
    markersRef.current[selectedEnterpriseId].openPopup();
  }, [selectedEnterpriseId]);

  return (
    <div className="border-tanaw-gray bg-tanaw-gray relative min-h-155 overflow-hidden rounded-xl border shadow-sm">
      <div id={mapContainerId} className="absolute inset-0 z-0" />

      <AnimatePresence initial={false}>
        {!isDirectoryCollapsed && (
          <motion.aside
            id="spatial-directory-panel"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="absolute top-4 bottom-4 left-4 z-420 flex w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border border-white/10 bg-slate-950/40 shadow-2xl backdrop-blur-md"
          >
            <div className="flex shrink-0 flex-col gap-3 border-b border-white/10 bg-black/20 px-4 py-3">
              <div className="relative z-10 flex items-start justify-between gap-3">
                <div>
                  <span className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-white uppercase">
                    <MapIcon size={14} className="text-tanaw-sky" /> Spatial Directory
                  </span>
                  <p className="mt-1 text-[9px] font-semibold tracking-widest text-white/55 uppercase">
                    {selectedBarangayName
                      ? `${selectedBarangayEnterprises.length} registered enterprises`
                      : isBoundaryLoading
                        ? "Loading refined boundaries"
                        : isBoundaryError
                          ? "Boundary layer unavailable"
                          : `${boundaryFeatureCount} barangay boundaries`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    title={showBoundaries ? "Hide barangay boundaries" : "Show barangay boundaries"}
                    aria-pressed={showBoundaries}
                    onClick={() => setShowBoundaries((value) => !value)}
                    className={`focus:ring-tanaw-sky rounded border px-2 py-1 text-[9px] font-black tracking-widest uppercase transition focus:ring-2 focus:outline-none ${showBoundaries ? "border-emerald-400/40 bg-emerald-500/20 text-white" : "border-white/15 bg-white/10 text-white/70 hover:bg-white/20"}`}
                  >
                    Boundaries
                  </button>
                  <button
                    type="button"
                    aria-controls="spatial-directory-panel"
                    aria-label="Collapse spatial directory"
                    title="Collapse spatial directory"
                    onClick={() => setIsDirectoryCollapsed(true)}
                    className="focus:ring-tanaw-sky flex h-8 w-8 shrink-0 items-center justify-center rounded border border-white/15 bg-white/10 text-white transition hover:bg-white/20 focus:ring-2 focus:outline-none"
                  >
                    <PanelLeftClose size={15} />
                  </button>
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                {selectedBarangayName ? (
                  <motion.div
                    key="barangay-enterprises"
                    initial={{ opacity: 0, x: 28 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 28 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="flex h-full flex-col gap-3 overflow-y-auto p-3"
                  >
                    <button
                      type="button"
                      onClick={clearSelectedBarangay}
                      className="focus:ring-tanaw-sky flex w-full items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left text-[9px] font-black tracking-widest text-white/70 uppercase transition hover:bg-white/10 focus:ring-2 focus:outline-none"
                    >
                      <ArrowLeft size={13} className="text-tanaw-sky" />
                      Back to Barangay Directory
                    </button>

                    <section className="rounded-lg border border-white/10 bg-white/5 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-black tracking-wide text-white uppercase">Barangay {selectedBarangayName}</h3>
                          <p className="mt-1 text-[9px] font-bold tracking-widest text-white/55 uppercase">Enterprises within this barangay</p>
                        </div>
                        <span className={`shrink-0 rounded border px-2 py-1 text-[9px] font-black tracking-widest uppercase ${getDarkStatusBadgeClass(selectedBarangayAnalytics.status)}`}>
                          {selectedBarangayAnalytics.status}
                        </span>
                      </div>
                    </section>

                    <BarangayAnalyticsCard analytics={selectedBarangayAnalytics} />

                    <section className="rounded-lg border border-white/10 bg-white/5 p-3">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <h3 className="flex items-center gap-2 text-[9px] font-black tracking-widest text-white/70 uppercase">
                          <Building2 size={13} className="text-tanaw-sky" />
                          Enterprise List
                        </h3>
                        <span className="text-[9px] font-bold tracking-widest text-white/50 uppercase">{selectedBarangayEnterprises.length}</span>
                      </div>
                      <div className="space-y-2">
                        {selectedBarangayEnterprises.map((enterprise) => (
                          <EnterpriseMapCard key={enterprise.id} enterprise={enterprise} selected={selectedEnterpriseId === enterprise.id} onClick={() => setSelectedEnterpriseId(enterprise.id)} />
                        ))}
                      </div>
                      {selectedBarangayEnterprises.length === 0 && (
                        <div className="rounded-lg border border-white/10 bg-black/10 p-6 text-center text-[10px] font-bold tracking-widest text-white/50 uppercase">
                          No registered enterprises found for this barangay yet.
                        </div>
                      )}
                    </section>
                  </motion.div>
                ) : (
                  <motion.div
                    key="barangay-directory"
                    initial={{ opacity: 0, x: -18 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -18 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="flex h-full flex-col gap-3 overflow-y-auto p-3"
                  >
                    <section className="rounded-lg border border-white/10 bg-white/5 p-3">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                          <h3 className="text-[10px] font-black tracking-widest text-white uppercase">Barangay Directory</h3>
                          <p className="mt-1 text-[9px] font-bold tracking-widest text-white/50 uppercase">Showing barangay boundaries</p>
                        </div>
                        <span className="text-[9px] font-bold tracking-widest text-white/50 uppercase">{barangayDirectoryItems.length}</span>
                      </div>

                      <label className="focus-within:border-tanaw-sky mb-3 flex items-center gap-2 rounded-lg border border-white/15 bg-black/15 px-3 py-2 text-white">
                        <Search size={13} className="text-white/45" />
                        <input
                          value={barangaySearch}
                          onChange={(event) => setBarangaySearch(event.target.value)}
                          placeholder="Search barangay"
                          className="min-w-0 flex-1 bg-transparent text-[10px] font-bold tracking-widest text-white uppercase outline-none placeholder:text-white/35"
                        />
                      </label>

                      <div className="max-h-[calc(100vh-380px)] space-y-2 overflow-y-auto pr-1">
                        {barangayDirectoryItems.map((item) => (
                          <BarangayDirectoryCard
                            key={item.label}
                            title={item.label}
                            subtitle={item.subtitle}
                            enterpriseCount={item.enterpriseCount}
                            visitorCount={item.visitorCount}
                            onClick={() => selectBarangay(item.label)}
                          />
                        ))}
                      </div>
                    </section>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {isDirectoryCollapsed && (
        <motion.button
          type="button"
          aria-controls="spatial-directory-panel"
          aria-label="Expand spatial directory"
          title="Expand spatial directory"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          onClick={() => setIsDirectoryCollapsed(false)}
          className="focus:ring-tanaw-sky absolute top-4 left-4 z-430 flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-slate-950/50 text-white shadow-2xl backdrop-blur-md transition hover:bg-slate-950/65 focus:ring-2 focus:outline-none"
        >
          <PanelLeftOpen size={18} />
        </motion.button>
      )}

      {selectedEnterprise && (
        <div className="absolute right-4 bottom-4 z-420 hidden w-80 rounded-xl border border-white/80 bg-white/95 p-4 shadow-xl backdrop-blur md:block">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Selected Enterprise</p>
              <h3 className="text-tanaw-navy mt-1 text-sm font-black">{selectedEnterprise.name}</h3>
            </div>
            <span className={`rounded border px-2 py-1 text-[9px] font-black tracking-widest uppercase ${getLightStatusBadgeClass(selectedEnterprise.status)}`}>{selectedEnterprise.status}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <InfoTile label="Barangay" value={selectedEnterprise.barangay} />
            <InfoTile label="Type" value={selectedEnterprise.type} />
            <InfoTile label="Visitors" value={selectedEnterprise.visitorCount.toLocaleString()} />
            <InfoTile label="Tourists" value={selectedEnterprise.totalTourists.toLocaleString()} />
          </div>
        </div>
      )}
    </div>
  );
}

function BarangayDirectoryCard({ title, subtitle, enterpriseCount, visitorCount, onClick }: { title: string; subtitle: string; enterpriseCount: number; visitorCount: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="focus:ring-tanaw-sky w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left transition hover:bg-white/10 focus:ring-2 focus:outline-none"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-[11px] font-bold tracking-widest text-white uppercase">{title}</div>
          <div className="mt-1 truncate text-[9px] font-semibold tracking-widest text-white/55 uppercase">{subtitle}</div>
        </div>
        <span className="shrink-0 rounded border border-white/10 bg-black/15 px-1.5 py-0.5 text-[9px] font-black tracking-widest text-white/70 uppercase">{enterpriseCount}</span>
      </div>
      <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2 text-[9px] font-bold tracking-widest text-white/50 uppercase">
        <span>Registered Enterprises</span>
        <span className="font-mono text-white/70">{visitorCount.toLocaleString()} visitors</span>
      </div>
    </button>
  );
}

function BarangayAnalyticsCard({ analytics }: { analytics: BarangayAnalytics }) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/5 p-3">
      <div className="mb-3 flex items-center gap-2 text-[9px] font-black tracking-widest text-white/70 uppercase">
        <BarChart3 size={13} className="text-tanaw-sky" />
        Visitor Analytics
      </div>

      <div className="grid grid-cols-2 gap-2">
        <AnalyticsTile label="Total Visitors" value={analytics.totalVisitors.toLocaleString()} />
        <AnalyticsTile label="Top Segment" value={analytics.topSegment} />
        <AnalyticsTile label="Local / Non-Local" value={formatSplit(analytics.localVisitors, analytics.nonLocalVisitors)} />
        <AnalyticsTile label="Male / Female" value={formatSplit(analytics.maleVisitors, analytics.femaleVisitors)} />
        <AnalyticsTile label="Total Tourists" value={analytics.totalTourists.toLocaleString()} />
        <AnalyticsTile label="Status" value={analytics.status} />
      </div>
    </section>
  );
}

function AnalyticsTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/10 p-2">
      <div className="text-[8px] font-black tracking-widest text-white/45 uppercase">{label}</div>
      <div className="mt-1 text-[12px] leading-tight font-black wrap-break-word text-white">{value}</div>
    </div>
  );
}

function EnterpriseMapCard({ enterprise, selected, onClick }: { enterprise: MapEnterprise; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`focus:ring-tanaw-sky w-full rounded-lg border p-3 text-left transition-all hover:bg-white/10 focus:ring-2 focus:outline-none ${selected ? "border-tanaw-sky/50 bg-white/15" : "border-white/10 bg-white/5"}`}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h4 className="text-[12px] leading-tight font-bold text-white">{enterprise.name}</h4>
          <div className="mt-1 flex items-center gap-1.5 text-[9px] font-bold tracking-widest text-white/60 uppercase">
            <MapPin size={10} /> {enterprise.address}
          </div>
        </div>
        <span className={`flex shrink-0 items-center rounded border px-1.5 py-0.5 text-[9px] font-black tracking-widest uppercase ${getDarkStatusBadgeClass(enterprise.status)}`}>
          {enterprise.status}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/10 pt-2 font-mono text-[10px]">
        <span className="truncate text-white/60">{enterprise.type}</span>
        <span className="flex items-center justify-end gap-1 font-bold text-white">
          <Users size={12} className="text-tanaw-sky" />
          {enterprise.visitorCount.toLocaleString()}
        </span>
        <span className="text-white/60">Tourists</span>
        <span className="text-right font-bold text-white">{enterprise.totalTourists.toLocaleString()}</span>
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

function normalizeGeoJson(payload: GeoJsonFeatureCollection): GeoJsonFeatureCollection {
  return {
    ...payload,
    features: payload.features.map((featureItem) => {
      if (featureItem.geometry?.type !== "MultiPolygon" || !isPolygonCoordinates(featureItem.geometry.coordinates)) {
        return featureItem;
      }

      const coordinates = (featureItem.geometry.coordinates as unknown as GeoJSON.Position[][]).map((ring): GeoJSON.Position[][] => [ring]);

      return {
        ...featureItem,
        geometry: {
          ...featureItem.geometry,
          coordinates,
        },
      };
    }),
  };
}

function isPosition(value: unknown): value is GeoJSON.Position {
  return Array.isArray(value) && typeof value[0] === "number" && typeof value[1] === "number";
}

function isPolygonCoordinates(coordinates: unknown): coordinates is GeoJSON.Position[][] {
  return Array.isArray(coordinates) && coordinates.length > 0 && Array.isArray(coordinates[0]) && isPosition(coordinates[0][0]);
}

function isBoundaryPolygonFeature(featureItem: GeoJSON.Feature) {
  return featureItem.geometry?.type === "Polygon" || featureItem.geometry?.type === "MultiPolygon";
}

function normalizeBarangayName(value: string) {
  const normalized = value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\bbarangay\b/g, "")
    .replace(/\bbrgy\b/g, "")
    .replace(/\./g, "")
    .replace(/[^a-z0-9]/g, "");

  return barangayFilterAliases[normalized] ?? normalized;
}

function getGeoJsonColor(name: string) {
  const normalized = normalizeBarangayName(name);
  const mappedColor = barangayColors[normalized];
  if (mappedColor) return mappedColor;

  let hash = 0;
  for (let index = 0; index < normalized.length; index += 1) {
    hash = (hash << 5) - hash + normalized.charCodeAt(index);
    hash |= 0;
  }

  return fallbackBarangayColors[Math.abs(hash) % fallbackBarangayColors.length];
}

function getFeatureValue(featureItem: GeoJSON.Feature | undefined, keys: string[], fallback = "") {
  const properties = featureItem?.properties;
  if (!properties) return fallback;

  for (const key of keys) {
    const value = properties[key];
    if (typeof value === "string" || typeof value === "number") {
      return String(value);
    }
  }

  return fallback;
}

function getBarangayLabel(featureItem: GeoJSON.Feature | undefined) {
  return getFeatureValue(featureItem, ["display_name", "official_barangay", "name", "alt_name"], "Unnamed Barangay");
}

function getEnterprisesByBarangay(barangayName: string) {
  const selectedKey = normalizeBarangayName(barangayName);
  return mapEnterprises.filter((enterprise) => normalizeBarangayName(enterprise.barangay) === selectedKey);
}

function getHighestStatus(enterprises: MapEnterprise[]) {
  if (enterprises.length === 0) return "No Data" as const;

  return enterprises.reduce<EnterpriseStatus>((highest, enterprise) => (statusPriority[enterprise.status] > statusPriority[highest] ? enterprise.status : highest), enterprises[0].status);
}

function getTopSegment(enterprises: MapEnterprise[]) {
  if (enterprises.length === 0) return "Unavailable";

  const segmentTotals = enterprises.reduce<Record<string, number>>((totals, enterprise) => {
    totals[enterprise.topSegment] = (totals[enterprise.topSegment] ?? 0) + enterprise.visitorCount;
    return totals;
  }, {});

  return Object.entries(segmentTotals).sort((left, right) => right[1] - left[1])[0][0];
}

function calculateBarangayAnalytics(enterprises: MapEnterprise[]): BarangayAnalytics {
  return enterprises.reduce<BarangayAnalytics>(
    (analytics, enterprise) => ({
      totalVisitors: analytics.totalVisitors + enterprise.visitorCount,
      topSegment: getTopSegment(enterprises),
      localVisitors: analytics.localVisitors + enterprise.localVisitors,
      nonLocalVisitors: analytics.nonLocalVisitors + enterprise.nonLocalVisitors,
      maleVisitors: analytics.maleVisitors + enterprise.maleVisitors,
      femaleVisitors: analytics.femaleVisitors + enterprise.femaleVisitors,
      totalTourists: analytics.totalTourists + enterprise.totalTourists,
      status: getHighestStatus(enterprises),
    }),
    {
      totalVisitors: 0,
      topSegment: getTopSegment(enterprises),
      localVisitors: 0,
      nonLocalVisitors: 0,
      maleVisitors: 0,
      femaleVisitors: 0,
      totalTourists: 0,
      status: getHighestStatus(enterprises),
    },
  );
}

function fitMapToSanPedroBounds(map: L.Map, layer: L.GeoJSON | null, isDirectoryCollapsed: boolean) {
  if (!layer) return;

  const bounds = layer.getBounds();
  if (!bounds.isValid()) return;

  const mapSize = map.getSize();
  const shouldPadForDirectory = !isDirectoryCollapsed && mapSize.x > 760;
  const initialViewBounds = bounds.pad(0.36);
  const interactionBounds = bounds.pad(0.58);
  const minZoomReferenceBounds = bounds.pad(0.62);

  map.setMaxBounds(interactionBounds);
  map.setMinZoom(Math.max(11.2, map.getBoundsZoom(minZoomReferenceBounds, true) - 0.72));
  map.fitBounds(initialViewBounds, {
    maxZoom: 13.45,
    paddingBottomRight: [48, 48],
    paddingTopLeft: [shouldPadForDirectory ? 440 : 48, 48],
  });
}

function getEnterpriseStatusColor(status: EnterpriseStatus | "No Data") {
  if (status === "Critical") return "#a40e0e";
  if (status === "Warning") return "#ff6204";
  if (status === "Normal") return "#055b25";
  return "#64748b";
}

function getDarkStatusBadgeClass(status: EnterpriseStatus | "No Data") {
  if (status === "Critical") return "border-red-500/30 bg-red-900/40 text-[#ff8a8a]";
  if (status === "Warning") return "border-orange-500/30 bg-orange-900/40 text-[#ffb08a]";
  if (status === "Normal") return "border-green-500/30 bg-green-900/40 text-[#8affb0]";
  return "border-slate-400/25 bg-slate-900/45 text-slate-200";
}

function getLightStatusBadgeClass(status: EnterpriseStatus) {
  if (status === "Critical") return "border-red-200 bg-red-50 text-red-700";
  if (status === "Warning") return "border-orange-200 bg-orange-50 text-orange-700";
  return "border-green-200 bg-green-50 text-green-700";
}

function formatSplit(left: number, right: number) {
  return `${left.toLocaleString()} / ${right.toLocaleString()}`;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

function createBoundaryTooltipHtml(name: string) {
  return `<div style="font-family:Bai Jamjuree,sans-serif;font-size:11px;font-weight:800;color:#2a3063;padding:2px 4px;text-transform:uppercase;">${escapeHtml(name)}</div>`;
}

function createBoundaryPopupHtml(featureItem: GeoJSON.Feature) {
  const name = escapeHtml(getBarangayLabel(featureItem));
  const type = escapeHtml(getFeatureValue(featureItem, ["type"], "barangay"));
  const postalCode = escapeHtml(getFeatureValue(featureItem, ["postal_code", "addr:postcode"], "4023"));

  return `<div style="font-family:Bai Jamjuree,sans-serif;min-width:190px;padding:4px;"><h3 style="margin:0 0 2px;color:#2a3063;font-weight:800;font-size:13px;">${name}</h3><p style="margin:0 0 8px;font-size:9px;color:#666;text-transform:uppercase;letter-spacing:1px;">San Pedro, Laguna ${postalCode}</p><span style="font-size:9px;color:#055b25;font-weight:800;padding:2px 5px;border:1px solid #055b25;border-radius:3px;text-transform:uppercase;">${type} boundary</span></div>`;
}

function createTooltipHtml(enterprise: MapEnterprise, color: string) {
  const visitorCap = Math.max(1, enterprise.visitorCount);
  const touristShare = Math.min(100, Math.round((enterprise.totalTourists / visitorCap) * 100));

  return `<div style="font-family:Bai Jamjuree,sans-serif;min-width:140px;"><h4 style="margin:0;font-size:11px;font-weight:800;color:#2a3063;">${escapeHtml(enterprise.name)}</h4><p style="margin:2px 0 0;font-size:9px;color:#666;text-transform:uppercase;">${escapeHtml(enterprise.barangay)}</p><div style="margin-top:5px;height:4px;background:#e5e5e5;border-radius:2px;"><div style="height:100%;width:${touristShare}%;background:${color};border-radius:2px;"></div></div></div>`;
}

function createPopupHtml(enterprise: MapEnterprise, color: string) {
  return `<div style="font-family:Bai Jamjuree,sans-serif;min-width:220px;padding:4px;"><h3 style="margin:0 0 2px;color:#2a3063;font-weight:800;font-size:13px;">${escapeHtml(enterprise.name)}</h3><p style="font-size:9px;color:#666;text-transform:uppercase;letter-spacing:1px;">${escapeHtml(enterprise.type)} - ${escapeHtml(enterprise.barangay)}</p><p style="font-size:10px;color:#2a3063;font-weight:800;">${enterprise.visitorCount.toLocaleString()} visitors | ${enterprise.totalTourists.toLocaleString()} tourists</p><span style="font-size:9px;color:${color};font-weight:800;padding:2px 4px;border:1px solid ${color};border-radius:2px;text-transform:uppercase;">${enterprise.status}</span></div>`;
}
