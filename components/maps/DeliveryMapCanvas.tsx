"use client";

import { useEffect } from "react";
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet";
import { latLngBounds } from "leaflet";
import "leaflet/dist/leaflet.css";
import type { GeoPoint } from "@/lib/geo/geo-point.ts";
import { OSM_ATTRIBUTION, OSM_TILE_URL } from "./map-config";

export type CanvasPoint = {
  id: string;
  point: GeoPoint;
  kind: "pickup" | "dropoff" | "transporter";
  label: string;
};

export const MARKER_COLOURS: Record<CanvasPoint["kind"], string> = {
  pickup: "#2f7d32",
  dropoff: "#e07b00",
  transporter: "#6a3fb5",
};

/** Keeps every point in view as they change (e.g. a moving transporter). */
function FitPoints({ points }: { points: CanvasPoint[] }) {
  const map = useMap();
  const key = points.map((p) => `${p.point.lat},${p.point.lng}`).join("|");
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView([points[0].point.lat, points[0].point.lng], 14);
      return;
    }
    map.fitBounds(
      latLngBounds(points.map((p) => [p.point.lat, p.point.lng] as [number, number])),
      { padding: [48, 48], maxZoom: 15 },
    );
    // Points are compared by value through `key`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, key]);
  useEffect(() => {
    const id = window.setTimeout(() => map.invalidateSize(), 0);
    return () => window.clearTimeout(id);
  }, [map]);
  return null;
}

/** Pickup, drop-off and transporter on OpenStreetMap, joined by a route line. */
export default function DeliveryMapCanvas({
  points,
  title,
}: {
  points: CanvasPoint[];
  title: string;
}) {
  const pickup = points.find((p) => p.kind === "pickup");
  const dropoff = points.find((p) => p.kind === "dropoff");
  return (
    <MapContainer
      center={[points[0].point.lat, points[0].point.lng]}
      zoom={12}
      minZoom={5}
      maxZoom={18}
      scrollWheelZoom={false}
      className="delivery-map-leaflet"
      aria-label={title}
    >
      <TileLayer attribution={OSM_ATTRIBUTION} url={OSM_TILE_URL} maxZoom={19} />
      {pickup && dropoff ? (
        <Polyline
          positions={[
            [pickup.point.lat, pickup.point.lng],
            [dropoff.point.lat, dropoff.point.lng],
          ]}
          pathOptions={{ color: "#386c51", weight: 4, opacity: 0.75, dashArray: "8 8" }}
        />
      ) : null}
      {points.map((p) => (
        <CircleMarker
          key={p.id}
          center={[p.point.lat, p.point.lng]}
          radius={p.kind === "transporter" ? 10 : 9}
          pathOptions={{
            color: "#ffffff",
            weight: 3,
            fillColor: MARKER_COLOURS[p.kind],
            fillOpacity: 1,
          }}
        >
          <Tooltip direction="top" offset={[0, -8]}>{p.label}</Tooltip>
        </CircleMarker>
      ))}
      <FitPoints points={points} />
    </MapContainer>
  );
}
