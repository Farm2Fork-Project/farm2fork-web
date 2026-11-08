"use client";

import dynamic from "next/dynamic";
import type { GeoPoint } from "@/lib/geo/geo-point.ts";

// Leaflet touches `window`, so the map is loaded in the browser only.
const DeliveryMapCanvas = dynamic(() => import("./DeliveryMapCanvas"), {
  ssr: false,
  loading: () => <div className="map-pin-loading" aria-hidden="true" />,
});

export type DeliveryMapPoint = {
  id: string;
  point: GeoPoint;
  kind: "pickup" | "dropoff" | "transporter";
  label: string;
};

export function googleMapsPlaceUrl(point: GeoPoint): string {
  return `https://www.google.com/maps/search/?api=1&query=${point.lat},${point.lng}`;
}

export function googleMapsDirectionsUrl(point: GeoPoint): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${point.lat},${point.lng}&travelmode=driving`;
}

/**
 * Read-only OpenStreetMap of a delivery's places (no API key). The legend
 * lists the same places with an "open in Google Maps" link for navigation.
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
      <div className="delivery-map-canvas" dir="ltr">
        <DeliveryMapCanvas points={points} title={title} />
      </div>
      <ul className="delivery-map-legend">
        {points.map((p) => (
          <li key={p.id}>
            <span className={`delivery-map-dot delivery-map-dot--${p.kind}`} aria-hidden="true" />
            <span>{p.label}</span>
            <a href={googleMapsPlaceUrl(p.point)} target="_blank" rel="noopener noreferrer">
              {openLabel}
            </a>
          </li>
        ))}
      </ul>
      {caption ? <p className="delivery-map-caption">{caption}</p> : null}
    </section>
  );
}
