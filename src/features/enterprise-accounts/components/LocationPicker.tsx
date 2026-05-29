import L from "leaflet";
import { MapPin } from "lucide-react";
import { useEffect, useRef } from "react";
import type { LocationDraft } from "../types";

const mapContainerId = "enterprise-location-picker";
const sanPedroFallbackCenter: L.LatLngTuple = [14.3413, 121.0446];
const sanPedroRelaxedFallbackBounds: L.LatLngBoundsExpression = [
  [14.235, 120.945],
  [14.418, 121.131],
];

type LocationPickerProps = {
  location: LocationDraft | null;
  onChange: (location: LocationDraft) => void;
};

export function LocationPicker({ location, onChange }: LocationPickerProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const latestLocationRef = useRef<LocationDraft | null>(location);

  useEffect(() => {
    latestLocationRef.current = location;
  }, [location]);

  useEffect(() => {
    if (mapRef.current) return undefined;

    const map = L.map(mapContainerId, {
      center: sanPedroFallbackCenter,
      zoom: 13,
      maxBounds: sanPedroRelaxedFallbackBounds,
      maxBoundsViscosity: 0.45,
      minZoom: 11.2,
      maxZoom: 18,
      zoomControl: false,
    });
    mapRef.current = map;

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
    }).addTo(map);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    map.on("click", (event) => {
      onChange({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
        source: markerRef.current ? "adjusted" : "manual",
      });
    });

    const timers = [0, 160, 320].map((delay) =>
      window.setTimeout(() => {
        map.invalidateSize({ pan: false });
      }, delay),
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      markerRef.current?.remove();
      markerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, [onChange]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !location) return;

    const nextLatLng: L.LatLngTuple = [location.latitude, location.longitude];
    if (!markerRef.current) {
      markerRef.current = L.marker(nextLatLng, {
        draggable: true,
        icon: L.divIcon({
          className: "tanaw-location-preview-pin",
          iconAnchor: [10, 10],
          html: `<span style="background:#065f46;width:22px;height:22px;display:block;border-radius:50%;border:4px solid #fff;box-shadow:0 2px 12px rgba(0,0,0,.35);"></span>`,
        }),
      }).addTo(map);

      markerRef.current.on("dragend", () => {
        const position = markerRef.current?.getLatLng();
        const latestLocation = latestLocationRef.current;
        if (!position) return;
        onChange({
          ...(latestLocation ?? {}),
          latitude: position.lat,
          longitude: position.lng,
          source: latestLocation?.source === "manual" ? "manual" : "adjusted",
        });
      });
    } else {
      markerRef.current.setLatLng(nextLatLng);
    }

    map.flyTo(nextLatLng, Math.max(map.getZoom(), 15), { animate: true, duration: 0.55 });
  }, [location, onChange]);

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
      <div id={mapContainerId} className="h-72 w-full" />
      <div className="flex items-center gap-2 border-t border-gray-200 bg-white px-3 py-2 text-xs text-gray-500">
        <MapPin size={14} className="text-tgreen-dark shrink-0" />
        <span className="truncate">{location?.displayAddress ?? "Click the map to place a marker, or drag the marker to correct it."}</span>
      </div>
    </div>
  );
}

