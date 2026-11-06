"use client";

import { useEffect } from "react";
import { APIProvider, Map, Marker, useMap } from "@vis.gl/react-google-maps";
import type { GeoPoint } from "@/lib/geo/geo-point.ts";

const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

export type DeliveryMapPoint = {
  id: string;
  point: GeoPoint;
  kind: "pickup" | "dropoff" | "transporter";
  label: string;
};

const MARKER_COLOURS: Record<DeliveryMapPoint["kind"], string> = {
  pickup: "#2f7d32",
  dropoff: "#e07b00",
  transporter: "#6a3fb5",
};

export function googleMapsPlaceUrl(point: GeoPoint): string {
  return `https://www.google.com/maps/search/?api=1&query=${point.lat},${point.lng}`;
}

export function googleMapsDirectionsUrl(point: GeoPoint): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${point.lat},${point.lng}&travelmode=driving`;
}

/** Keeps every point in view as they change (e.g. a moving transporter). */
function FitPoints({ points }: { points: DeliveryMapPoint[] }) {
  const map = useMap();
  const key = points.map((p) => `${p.point.lat},${p.point.lng}`).join("|");
  useEffect(() => {
    if (!map || points.length === 0) return;
    if (points.length === 1) {
      map.setCenter(points[0].point);
      map.setZoom(14);
      return;
    }
    const lats = points.map((p) => p.point.lat);
    const lngs = points.map((p) => p.point.lng);
    map.fitBounds(
      {
        north: Math.max(...lats),
        south: Math.min(...lats),
        east: Math.max(...lngs),
        west: Math.min(...lngs),
      },
      48,
    );
    // Points are compared by value through `key`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, key]);
  return null;
}

// google.maps.SymbolPath.CIRCLE; the global namespace is only loaded at runtime.
const CIRCLE_PATH = 0;

function markerIcon(kind: DeliveryMapPoint["kind"]) {
  return {
    path: CIRCLE_PATH,
    scale: kind === "transporter" ? 9 : 8,
    fillColor: MARKER_COLOURS[kind],
    fillOpacity: 1,
    strokeColor: "#ffffff",
    strokeWeight: 2,
  };
}

/**
 * Read-only map of a delivery's places. Without a Maps key it lists the same
 * places as Google Maps links, so the page never shows an empty box.
 */
export default function DeliveryMap({
  points,
  caption,
  openLabel,
  title,
}: {
  points: DeliveryMapPoint[];
  caption?: string;
  /** "Open in Google Maps" in the viewer's language. */
  openLabel: string;
  /** Accessible name for the map region. */
  title: string;
}) {
  if (points.length === 0) return null;
  return (
    <section className="delivery-map" aria-label={title}>
      {MAPS_KEY ? (
        <div className="delivery-map-canvas">
          <APIProvider apiKey={MAPS_KEY}>
            <Map
              defaultCenter={points[0].point}
              defaultZoom={12}
              gestureHandling="cooperative"
              disableDefaultUI
              zoomControl
            >
              {points.map((p) => (
                <Marker key={p.id} position={p.point} title={p.label} icon={markerIcon(p.kind)} />
              ))}
              <FitPoints points={points} />
            </Map>
          </APIProvider>
        </div>
      ) : null}
      <ul className="delivery-map-legend">
        {points.map((p) => (
          <li key={p.id}>
            <span className={`delivery-map-dot delivery-map-dot--${p.kind}`} aria-hidden="true" />
            <span>{p.label}</span>
            {MAPS_KEY ? null : (
              <a href={googleMapsPlaceUrl(p.point)} target="_blank" rel="noopener noreferrer">
                {openLabel}
              </a>
            )}
          </li>
        ))}
      </ul>
      {caption ? <p className="delivery-map-caption">{caption}</p> : null}
    </section>
  );
}
