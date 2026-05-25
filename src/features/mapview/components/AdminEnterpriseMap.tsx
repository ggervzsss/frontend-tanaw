import L, { type GeoJSONOptions, type Layer } from "leaflet";
import { Activity, ArrowLeft, Building2, ChevronDown, Clock, Map as MapIcon, MapPin, PanelLeftClose, PanelLeftOpen, Phone, Radio, Search, TrendingUp, Users, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ModalPortal } from "../../../shared/components/ui";
import { listEnterpriseAccounts, type AccountSummary } from "../../../shared/services/accountManagement";
import type { EnterpriseStatus, GatewayStatus, MapEnterprise } from "../../../shared/types";

type GeoJsonFeatureCollection = GeoJSON.FeatureCollection;

const SAN_PEDRO_BARANGAYS_URL = "/data/san_pedro_barangays_clean_v4.geojson";

const sanPedroFallbackCenter: L.LatLngTuple = [14.3413, 121.0446];

const sanPedroRelaxedFallbackBounds: L.LatLngBoundsExpression = [
  [14.235, 120.945],
  [14.418, 121.131],
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

const activeBoundaryStyle: L.PathOptions = {
  color: "#4f7cff",
  fillOpacity: 0.62,
  opacity: 0.94,
  weight: 2.6,
};

const dimmedBoundaryStyle: L.PathOptions = {
  color: "#2a3063",
  fillOpacity: 0.26,
  opacity: 0.68,
  weight: 1.05,
};

const hoverBoundaryStyle: L.PathOptions = {
  color: "#d7e4ff",
  fillOpacity: 0.58,
  opacity: 0.92,
  weight: 2,
};

export function AdminEnterpriseMap() {
  const mapContainerId = "admin-enterprise-map";
  const mapRef = useRef<L.Map | null>(null);
  const boundaryLayerRef = useRef<L.GeoJSON | null>(null);
  const activeBoundaryRef = useRef<L.Path | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const selectedBarangayNameRef = useRef<string | null>(null);
  const hasInitialOverviewFitRef = useRef(false);

  const [boundary, setBoundary] = useState<GeoJsonFeatureCollection | null>(null);
  const [isBoundaryLoading, setIsBoundaryLoading] = useState(true);
  const [isBoundaryError, setIsBoundaryError] = useState(false);
  const [isDirectoryCollapsed, setIsDirectoryCollapsed] = useState(false);
  const [showBoundaries, setShowBoundaries] = useState(true);
  const [barangaySearch, setBarangaySearch] = useState("");
  const [selectedBarangayName, setSelectedBarangayName] = useState<string | null>(null);
  const [selectedEnterpriseId, setSelectedEnterpriseId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const enterpriseAccountsQuery = useQuery({ queryKey: ["enterprise-accounts"], queryFn: listEnterpriseAccounts });
  const enterpriseAccounts = enterpriseAccountsQuery.data ?? [];
  const mapEnterprises = useMemo(() => enterpriseAccounts.map(toMapEnterprise).filter((enterprise): enterprise is MapEnterprise => enterprise !== null), [enterpriseAccounts]);
  const unpinnedEnterpriseCount = enterpriseAccounts.filter((enterprise) => enterprise.latitude === null || enterprise.longitude === null).length;

  const boundaryFeatureCount = useMemo(() => boundary?.features.filter(isBoundaryPolygonFeature).length ?? 0, [boundary]);

  const enterpriseCountsByBarangay = useMemo(() => {
    const counts = new Map<string, number>();

    mapEnterprises.forEach((enterprise) => {
      const key = normalizeBarangayName(enterprise.barangay);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });

    return counts;
  }, [mapEnterprises]);

  const barangayDirectoryItems = useMemo(() => {
    const searchKey = normalizeBarangayName(barangaySearch);

    return (boundary?.features ?? [])
      .filter(isBoundaryPolygonFeature)
      .map((featureItem) => {
        const label = getBarangayLabel(featureItem);
        const key = normalizeBarangayName(label);
        const enterpriseCount = enterpriseCountsByBarangay.get(key) ?? 0;

        return {
          feature: featureItem,
          label,
          key,
          subtitle: getFeatureValue(featureItem, ["official_barangay", "name"]),
          enterpriseCount,
        };
      })
      .filter((item) => item.key.includes(searchKey))
      .sort((left, right) => left.label.localeCompare(right.label));
  }, [barangaySearch, boundary, enterpriseCountsByBarangay]);

  const selectedBarangayEnterprises = useMemo(() => (selectedBarangayName ? getEnterprisesByBarangay(mapEnterprises, selectedBarangayName) : []), [mapEnterprises, selectedBarangayName]);
  const visibleEnterprises = selectedBarangayName ? selectedBarangayEnterprises : mapEnterprises;
  const selectedEnterprise = selectedEnterpriseId === null ? null : (mapEnterprises.find((enterprise) => enterprise.id === selectedEnterpriseId) ?? null);

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
      selectedBarangayNameRef.current = barangayName;
      setSelectedBarangayName(barangayName);
      setSelectedEnterpriseId(null);
      applyBoundarySelection(barangayName);

      const map = mapRef.current;
      if (!map || !targetLayer || !(targetLayer instanceof L.Polygon)) return;

      const bounds = targetLayer.getBounds();
      if (!bounds?.isValid()) return;

      const mapSize = map.getSize();
      const shouldOffsetForSidebar = !isDirectoryCollapsed && mapSize.x >= 820;

      map.stop();
      map.flyToBounds(bounds.pad(0.38), {
        animate: true,
        duration: 0.95,
        easeLinearity: 0.18,
        maxZoom: 14.35,
        paddingTopLeft: shouldOffsetForSidebar ? [410, 56] : [36, 36],
        paddingBottomRight: [56, 56],
      });
      targetLayer.openTooltip();
    },
    [applyBoundarySelection, findBoundaryLayerByName, isDirectoryCollapsed],
  );

  const clearSelectedBarangay = useCallback(() => {
    selectedBarangayNameRef.current = null;
    setSelectedBarangayName(null);
    setSelectedEnterpriseId(null);
    applyBoundarySelection(null);

    if (mapRef.current) {
      fitMapToSanPedroBounds(mapRef.current, boundaryLayerRef.current);
    }
  }, [applyBoundarySelection]);

  const closeEnterpriseDetails = useCallback(() => {
    setSelectedEnterpriseId(null);
    mapRef.current?.closePopup();
  }, []);

  useEffect(() => {
    if (!selectedEnterprise) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeEnterpriseDetails();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeEnterpriseDetails, selectedEnterprise]);

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
      maxBounds: sanPedroRelaxedFallbackBounds,
      maxBoundsViscosity: 0.35,
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
        fillOpacity: 0.48,
        pane: "boundaryPane",
        className: "tanaw-boundary-path outline-none",
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
    if (!selectedBarangayNameRef.current && !hasInitialOverviewFitRef.current) {
      fitMapToSanPedroBounds(map, boundaryLayerRef.current);
      hasInitialOverviewFitRef.current = true;
    }
  }, [applyBoundarySelection, boundary, selectBarangay, showBoundaries]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return undefined;

    const timers = [0, 120, 280].map((delay) =>
      window.setTimeout(() => {
        map.invalidateSize({ pan: false });
        const boundaryLayer = boundaryLayerRef.current;

        if (!selectedBarangayNameRef.current && boundaryLayer) {
          fitMapToSanPedroBounds(map, boundaryLayer);
          hasInitialOverviewFitRef.current = true;
        }
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
  }, [mapEnterprises, selectedEnterpriseId]);

  return (
    <div className="border-tanaw-gray bg-tanaw-gray relative min-h-0 flex-1 overflow-hidden rounded-xl border shadow-sm max-sm:min-h-140">
      <style>
        {`
          #${mapContainerId} .tanaw-boundary-path {
            transition:
              fill-opacity 280ms cubic-bezier(0.22, 1, 0.36, 1),
              stroke-opacity 280ms cubic-bezier(0.22, 1, 0.36, 1),
              stroke-width 280ms cubic-bezier(0.22, 1, 0.36, 1),
              stroke 280ms cubic-bezier(0.22, 1, 0.36, 1);
          }

          #${mapContainerId} .leaflet-marker-icon,
          #${mapContainerId} .leaflet-popup {
            transition:
              opacity 220ms ease-out,
              transform 220ms ease-out;
          }
        `}
      </style>
      <div className="absolute inset-0 z-0">
        <div id={mapContainerId} className="h-full w-full" />
      </div>

      <AnimatePresence initial={false}>
        {!isDirectoryCollapsed && (
          <motion.aside
            id="spatial-directory-panel"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="absolute top-4 bottom-4 left-4 z-420 flex w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border border-white/15 bg-slate-950/65 shadow-[0_24px_70px_rgba(2,6,23,0.48)] backdrop-blur-md"
          >
            {/* Header section (Fixed size, shrink-0) */}
            <div className="flex shrink-0 flex-col gap-3 border-b border-white/15 bg-black/30 px-4 py-3">
              <div className="relative z-10 flex items-start justify-between gap-3">
                <div>
                  <span className="flex items-center gap-2 text-[10px] font-black tracking-widest text-white uppercase">
                    <MapIcon size={14} className="text-tanaw-sky" /> Spatial Directory
                  </span>
                  <p className="mt-1 text-[9px] font-bold tracking-widest text-white/65 uppercase">
                    {selectedBarangayName
                      ? `${selectedBarangayEnterprises.length} registered enterprises`
                      : isBoundaryLoading
                        ? "Loading refined boundaries"
                        : isBoundaryError
                          ? "Boundary layer unavailable"
                          : enterpriseAccountsQuery.isLoading
                            ? "Loading enterprises"
                            : `${boundaryFeatureCount} barangay boundaries`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    title={showBoundaries ? "Hide barangay boundaries" : "Show barangay boundaries"}
                    aria-pressed={showBoundaries}
                    onClick={() => setShowBoundaries((value) => !value)}
                    className={`focus:ring-tanaw-sky rounded border px-2 py-1 text-[9px] font-black tracking-widest uppercase transition focus:ring-2 focus:outline-none ${showBoundaries ? "border-emerald-400/45 bg-emerald-500/25 text-white shadow-sm shadow-emerald-950/30" : "border-white/20 bg-white/10 text-white/75 hover:border-white/30 hover:bg-white/15 hover:text-white"}`}
                  >
                    Boundaries
                  </button>
                  <button
                    type="button"
                    aria-controls="spatial-directory-panel"
                    aria-label="Collapse spatial directory"
                    title="Collapse spatial directory"
                    onClick={() => setIsDirectoryCollapsed(true)}
                    className="focus:ring-tanaw-sky flex h-8 w-8 shrink-0 items-center justify-center rounded border border-white/20 bg-white/10 text-white/80 transition hover:border-white/30 hover:bg-white/15 hover:text-white focus:ring-2 focus:outline-none"
                  >
                    <PanelLeftClose size={15} />
                  </button>
                </div>
              </div>
            </div>

            {/* Dropdown Selector section (Fixed size, shrink-0, overflow-visible for dropdown menu) */}
            <div className="relative z-20 shrink-0 overflow-visible border-b border-white/15 bg-black/20 px-4 py-3">
              <label className="mb-1 block text-[9px] font-black tracking-widest text-white/65 uppercase">Select Barangay</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="focus:ring-tanaw-sky flex w-full items-center justify-between gap-2 rounded-lg border border-white/15 bg-slate-950/45 px-3 py-2 text-left shadow-inner shadow-black/20 transition hover:border-white/25 hover:bg-slate-950/55 focus:ring-2 focus:outline-none"
                >
                  <span className="truncate text-[10px] font-bold tracking-widest text-white uppercase">{selectedBarangayName ? `Barangay ${selectedBarangayName}` : "All Barangays"}</span>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {selectedBarangayName && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearSelectedBarangay();
                        }}
                        className="rounded p-0.5 text-white/55 transition hover:bg-white/10 hover:text-white"
                        title="Clear selection"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
                    <ChevronDown size={14} className={["text-white/65 transition-transform duration-200", isDropdownOpen ? "rotate-180" : ""].join(" ")} />
                  </div>
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <>
                      {/* Dropdown overlay/backdrop */}
                      <div className="fixed inset-0 z-30" onClick={() => setIsDropdownOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 left-0 z-40 mt-1 flex max-h-64 flex-col overflow-hidden rounded-lg border border-white/15 bg-slate-950/95 shadow-2xl backdrop-blur-md"
                      >
                        <div className="shrink-0 border-b border-white/10 bg-black/30 p-2">
                          <label className="flex items-center gap-2 rounded-md border border-white/15 bg-black/35 px-2 py-1 text-white">
                            <Search size={11} className="text-white/55" />
                            <input
                              value={barangaySearch}
                              onChange={(event) => setBarangaySearch(event.target.value)}
                              placeholder="Search barangay..."
                              className="min-w-0 flex-1 bg-transparent text-[10px] font-bold tracking-widest text-white uppercase outline-none placeholder:text-white/40"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </label>
                        </div>

                        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              clearSelectedBarangay();
                              setIsDropdownOpen(false);
                            }}
                            className={[
                              "focus:ring-tanaw-sky flex w-full items-center justify-between rounded-md border border-transparent px-2 py-1.5 text-left text-[9px] font-black tracking-widest uppercase transition focus:ring-1 focus:outline-none",
                              !selectedBarangayName ? "border-tanaw-sky/35 bg-tanaw-sky/25 text-white" : "text-white/70 hover:border-white/10 hover:bg-white/10 hover:text-white",
                            ].join(" ")}
                          >
                            <span>All Barangays</span>
                            <span className="rounded-sm bg-black/35 px-1.5 py-0.5 font-mono text-[8px] font-bold opacity-60">{mapEnterprises.length}</span>
                          </button>
                          {barangayDirectoryItems.map((item) => (
                            <button
                              key={item.label}
                              type="button"
                              onClick={() => {
                                selectBarangay(item.label);
                                setIsDropdownOpen(false);
                              }}
                              className={[
                                "focus:ring-tanaw-sky flex w-full items-center justify-between rounded-md border border-transparent px-2 py-1.5 text-left text-[9px] font-black tracking-widest uppercase transition focus:ring-1 focus:outline-none",
                                selectedBarangayName === item.label ? "border-tanaw-sky/35 bg-tanaw-sky/25 text-white" : "text-white/70 hover:border-white/10 hover:bg-white/10 hover:text-white",
                              ].join(" ")}
                            >
                              <span className="truncate">Barangay {item.label}</span>
                              <span className="rounded-sm bg-black/35 px-1.5 py-0.5 font-mono text-[8px] font-bold opacity-60">{item.enterpriseCount}</span>
                            </button>
                          ))}
                          {barangayDirectoryItems.length === 0 && <div className="py-4 text-center text-[9px] font-bold tracking-widest text-white/30 uppercase">No matching barangays</div>}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Scrollable details and enterprise list container */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                {selectedBarangayName ? (
                  <motion.div
                    key={`barangay-enterprises-${normalizeBarangayName(selectedBarangayName)}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.24, ease: "easeOut" }}
                    className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-3"
                  >
                    <button
                      type="button"
                      onClick={clearSelectedBarangay}
                      className="focus:ring-tanaw-sky flex shrink-0 items-center gap-2 rounded-lg border border-white/15 bg-slate-950/35 px-3 py-2 text-left text-[9px] font-black tracking-widest text-white/75 uppercase transition hover:border-white/25 hover:bg-slate-950/50 hover:text-white focus:ring-2 focus:outline-none"
                    >
                      <ArrowLeft size={12} className="text-tanaw-sky" />
                      Back to Barangay Directory
                    </button>

                    {/* Selected Barangay Info */}
                    <div className="shrink-0 rounded-lg border border-white/15 bg-white/8 p-3 shadow-sm shadow-black/20">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-black tracking-wide text-white uppercase">Barangay {selectedBarangayName}</h3>
                          <p className="mt-1 text-[9px] font-bold tracking-widest text-white/65 uppercase">Enterprises within this barangay</p>
                        </div>
                        <span className="shrink-0 rounded border border-white/15 bg-black/35 px-2 py-1 font-mono text-[9px] font-black tracking-widest text-white uppercase">
                          {selectedBarangayEnterprises.length}
                        </span>
                      </div>
                    </div>

                    {/* Dedicated Enterprise List section at the bottom */}
                    <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-white/15 bg-white/8 p-3 shadow-sm shadow-black/20">
                      <div className="mb-2 flex shrink-0 items-center justify-between gap-3">
                        <h3 className="flex items-center gap-2 text-[9px] font-black tracking-widest text-white/80 uppercase">
                          <Building2 size={13} className="text-tanaw-sky" />
                          Enterprises within this Barangay
                        </h3>
                        <span className="text-[9px] font-bold tracking-widest text-white/65 uppercase">{selectedBarangayEnterprises.length}</span>
                      </div>
                      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                        {selectedBarangayEnterprises.map((enterprise, index) => (
                          <motion.div
                            key={enterprise.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.22, delay: Math.min(index * 0.025, 0.12), ease: "easeOut" }}
                          >
                            <EnterpriseMapCard enterprise={enterprise} selected={selectedEnterpriseId === enterprise.id} onClick={() => setSelectedEnterpriseId(enterprise.id)} />
                          </motion.div>
                        ))}
                        {selectedBarangayEnterprises.length === 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.22, ease: "easeOut" }}
                            className="rounded-lg border border-white/15 bg-black/20 p-6 text-center text-[10px] font-bold tracking-widest text-white/65 uppercase"
                          >
                            No registered enterprises found for this barangay yet.
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="all-enterprises-view"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-3"
                  >
                    {/* Prompt card */}
                    <div className="shrink-0 rounded-lg border border-white/15 bg-white/8 p-3 text-center shadow-sm shadow-black/20">
                      <MapPin size={18} className="text-tanaw-sky mx-auto mb-1.5 animate-bounce" style={{ animationDuration: "3s" }} />
                      <h4 className="text-[10px] font-black tracking-widest text-white uppercase">No Barangay Selected</h4>
                      <p className="mt-1 text-[9px] leading-normal font-bold tracking-widest text-white/65 uppercase">Click a barangay boundary on the map or use the dropdown above to filter.</p>
                    </div>

                    {/* Dedicated Enterprise List section showing all enterprises */}
                    <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-white/15 bg-white/8 p-3 shadow-sm shadow-black/20">
                      <div className="mb-2 flex shrink-0 items-center justify-between gap-3">
                        <h3 className="flex items-center gap-2 text-[9px] font-black tracking-widest text-white/80 uppercase">
                          <Building2 size={13} className="text-tanaw-sky" />
                          All Enterprises
                        </h3>
                        <span className="text-[9px] font-bold tracking-widest text-white/65 uppercase">
                          {mapEnterprises.length}
                          {unpinnedEnterpriseCount > 0 ? ` pinned / ${unpinnedEnterpriseCount} unpinned` : ""}
                        </span>
                      </div>
                      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                        {mapEnterprises.map((enterprise) => (
                          <EnterpriseMapCard
                            key={enterprise.id}
                            enterprise={enterprise}
                            selected={selectedEnterpriseId === enterprise.id}
                            onClick={() => {
                              selectBarangay(enterprise.barangay);
                              setSelectedEnterpriseId(enterprise.id);
                            }}
                          />
                        ))}
                        {mapEnterprises.length === 0 && (
                          <div className="rounded-lg border border-white/15 bg-black/20 p-6 text-center text-[10px] font-bold tracking-widest text-white/65 uppercase">
                            {enterpriseAccountsQuery.isLoading ? "Loading enterprises..." : "No pinned enterprise locations yet."}
                          </div>
                        )}
                      </div>
                    </div>
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

      <AnimatePresence>{selectedEnterprise && <EnterpriseDetailsModal enterprise={selectedEnterprise} onClose={closeEnterpriseDetails} />}</AnimatePresence>
    </div>
  );
}

function EnterpriseDetailsModal({ enterprise, onClose }: { enterprise: MapEnterprise; onClose: () => void }) {
  return (
    <ModalPortal>
      <motion.div
        className="fixed inset-0 z-999 flex min-h-dvh items-center justify-center overflow-y-auto bg-slate-950/55 p-3 backdrop-blur-[3px] sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        onClick={onClose}
      >
        <motion.section
          role="dialog"
          aria-modal="true"
          aria-labelledby="enterprise-details-title"
          className="my-auto flex max-h-[calc(100dvh-1.5rem)] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-white/10 bg-slate-950/70 text-white shadow-2xl backdrop-blur-md sm:max-h-[calc(100dvh-3rem)]"
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="shrink-0 border-b border-white/10 bg-black/25 px-4 py-4 sm:px-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-[10px] font-black tracking-widest text-white/70 uppercase">
                  <Building2 size={14} className="text-tanaw-sky" />
                  Enterprise Details
                </p>
                <h3 id="enterprise-details-title" className="mt-1 text-lg leading-tight font-black text-white sm:text-xl">
                  {enterprise.name}
                </h3>
                <p className="mt-1 text-[10px] leading-relaxed font-bold tracking-widest text-white/75 uppercase sm:text-[11px]">
                  {enterprise.category} - Barangay {enterprise.barangay}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close enterprise details"
                className="focus:ring-tanaw-sky flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-white/75 transition hover:bg-white/20 hover:text-white focus:ring-2 focus:outline-none"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="min-h-0 overflow-y-auto bg-black/10 p-4 sm:p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <EnterpriseMetricCard icon={<Activity size={16} />} label="Total Live Occupancy" value={enterprise.totalLiveOccupancy.toLocaleString()} />
              <EnterpriseMetricCard icon={<Users size={16} />} label="Est. Unique Count" value={enterprise.estimatedUniqueCount.toLocaleString()} />
              <EnterpriseMetricCard icon={<Building2 size={16} />} label="Category" value={enterprise.category} />
              <EnterpriseMetricCard
                icon={<Radio size={16} />}
                label="Status"
                value={
                  <span className={`inline-flex rounded border px-2 py-1 text-[10px] font-black tracking-widest uppercase ${getDarkStatusBadgeClass(enterprise.status)}`}>{enterprise.status}</span>
                }
              />
              <EnterpriseMetricCard className="sm:col-span-2" icon={<MapPin size={16} />} label="Full Address" value={enterprise.fullAddress} />
            </div>

            <div className="mt-4 grid gap-3 rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-white sm:grid-cols-2">
              <EnterpriseDetailRow icon={<Radio size={14} />} label="Gateway" value={enterprise.gatewayStatus ?? "Not Linked"} />
              <EnterpriseDetailRow icon={<Clock size={14} />} label="Last sync" value={enterprise.lastSync ?? "No sync recorded"} />
              <EnterpriseDetailRow icon={<Phone size={14} />} label="Contact" value={enterprise.contact ?? "No contact listed"} />
              <EnterpriseDetailRow icon={<TrendingUp size={14} />} label="Trend" value={enterprise.trend ?? "Stable"} />
              <EnterpriseDetailRow className="sm:col-span-2" icon={<Clock size={14} />} label="Operating hours" value={enterprise.operatingHours ?? "Not specified"} />
            </div>
          </div>
        </motion.section>
      </motion.div>
    </ModalPortal>
  );
}

function EnterpriseMapCard({ enterprise, selected, onClick }: { enterprise: MapEnterprise; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`focus:ring-tanaw-sky w-full rounded-lg border p-3 text-left shadow-sm shadow-black/15 transition-all hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/10 focus:ring-2 focus:outline-none ${selected ? "border-tanaw-sky/60 bg-tanaw-sky/15" : "border-white/15 bg-slate-950/35"}`}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h4 className="text-[12px] leading-tight font-bold text-white">{enterprise.name}</h4>
          <div className="mt-1 flex items-center gap-1.5 text-[9px] font-bold tracking-widest text-white/70 uppercase">
            <MapPin size={10} className="shrink-0" />
            <span className="truncate">{enterprise.fullAddress}</span>
          </div>
        </div>
        <span className={`flex shrink-0 items-center rounded border px-1.5 py-0.5 text-[9px] font-black tracking-widest uppercase ${getDarkStatusBadgeClass(enterprise.status)}`}>
          {enterprise.status}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/15 pt-2 font-mono text-[10px]">
        <span className="truncate text-white/70">{enterprise.category}</span>
        <span className="flex items-center justify-end gap-1 font-bold text-white">
          <Activity size={12} className="text-tanaw-sky" />
          {enterprise.totalLiveOccupancy.toLocaleString()}
        </span>
        <span className="text-white/70">Est. Unique</span>
        <span className="text-right font-bold text-white">{enterprise.estimatedUniqueCount.toLocaleString()}</span>
      </div>
    </button>
  );
}

function EnterpriseMetricCard({ icon, label, value, className = "" }: { icon: ReactNode; label: string; value: ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-white/10 bg-white/5 p-4 shadow-sm ${className}`}>
      <div className="text-tanaw-sky flex items-center gap-2">
        {icon}
        <p className="text-[10px] font-black tracking-widest text-white/60 uppercase">{label}</p>
      </div>
      <div className="mt-2 text-lg leading-tight font-black text-white max-sm:text-base">{value}</div>
    </div>
  );
}

function EnterpriseDetailRow({ icon, label, value, className = "" }: { icon: ReactNode; label: string; value: string; className?: string }) {
  return (
    <div className={`flex min-w-0 items-start gap-2 ${className}`}>
      <span className="text-tanaw-sky mt-0.5">{icon}</span>
      <div className="min-w-0">
        <p className="text-[9px] font-black tracking-widest text-white/50 uppercase">{label}</p>
        <p className="mt-0.5 font-bold wrap-break-word text-white/90">{value}</p>
      </div>
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

function getEnterprisesByBarangay(enterprises: MapEnterprise[], barangayName: string) {
  const selectedKey = normalizeBarangayName(barangayName);
  return enterprises.filter((enterprise) => normalizeBarangayName(enterprise.barangay) === selectedKey);
}

function toMapEnterprise(account: AccountSummary): MapEnterprise | null {
  if (account.latitude === null || account.longitude === null) return null;

  return {
    id: account.id,
    name: account.enterpriseName ?? account.displayName,
    barangay: account.barangay ?? "Unassigned",
    category: account.category ?? "Uncategorized",
    fullAddress: account.address ?? account.geocodedAddress ?? "Address not provided",
    lat: account.latitude,
    lng: account.longitude,
    totalLiveOccupancy: 0,
    estimatedUniqueCount: 0,
    status: getEnterpriseMapStatus(account),
    contact: account.phone ?? account.email,
    lastSync: account.locationUpdatedAt ? new Date(account.locationUpdatedAt).toLocaleString() : undefined,
    gatewayStatus: getGatewayStatus(account.gatewayStatus),
  };
}

function getEnterpriseMapStatus(account: AccountSummary): EnterpriseStatus {
  if (account.status === "inactive") return "Warning";
  return "Normal";
}

function getGatewayStatus(value: string | null): GatewayStatus {
  const statuses: GatewayStatus[] = ["Connected", "Sync Delayed", "Offline", "Not Linked", "Closed"];
  return statuses.find((status) => status === value) ?? "Not Linked";
}

function fitMapToSanPedroBounds(map: L.Map, layer: L.GeoJSON | null) {
  if (!layer) return;

  const bounds = layer.getBounds();
  if (!bounds.isValid()) return;

  const initialViewBounds = bounds.pad(0.36);
  const interactionBounds = bounds.pad(1.05);
  const minZoomReferenceBounds = bounds.pad(0.62);

  map.setMaxBounds(interactionBounds);
  map.setMinZoom(Math.max(11.2, map.getBoundsZoom(minZoomReferenceBounds, true) - 0.72));
  map.fitBounds(initialViewBounds, {
    maxZoom: 13.45,
    padding: [48, 48],
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
  const occupancyShare = Math.min(100, Math.round((enterprise.totalLiveOccupancy / Math.max(1, enterprise.estimatedUniqueCount)) * 100));

  return `<div style="font-family:Bai Jamjuree,sans-serif;min-width:140px;"><h4 style="margin:0;font-size:11px;font-weight:800;color:#2a3063;">${escapeHtml(enterprise.name)}</h4><p style="margin:2px 0 0;font-size:9px;color:#666;text-transform:uppercase;">${escapeHtml(enterprise.category)} - ${escapeHtml(enterprise.barangay)}</p><div style="margin-top:5px;height:4px;background:#e5e5e5;border-radius:2px;"><div style="height:100%;width:${occupancyShare}%;background:${color};border-radius:2px;"></div></div></div>`;
}

function createPopupHtml(enterprise: MapEnterprise, color: string) {
  return `<div style="font-family:Bai Jamjuree,sans-serif;min-width:220px;padding:4px;"><h3 style="margin:0 0 2px;color:#2a3063;font-weight:800;font-size:13px;">${escapeHtml(enterprise.name)}</h3><p style="font-size:9px;color:#666;text-transform:uppercase;letter-spacing:1px;">${escapeHtml(enterprise.category)} - ${escapeHtml(enterprise.barangay)}</p><p style="font-size:10px;color:#2a3063;font-weight:800;">${enterprise.totalLiveOccupancy.toLocaleString()} live occupancy | ${enterprise.estimatedUniqueCount.toLocaleString()} est. unique</p><span style="font-size:9px;color:${color};font-weight:800;padding:2px 4px;border:1px solid ${color};border-radius:2px;text-transform:uppercase;">${enterprise.status}</span></div>`;
}
