"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { GeoPoint } from "@/lib/geo/geo-point.ts";
import { OSM_ATTRIBUTION, OSM_TILE_URL } from "./map-config";

export interface FlyRequest {
  point: GeoPoint;
  zoom: number;
  /** Changes on every request so the same point can be flown to twice. */
  seq: number;
}

/** Flies to requested spots and reports only moves made by the user. */
function Controller({
  fly,
  onUserMove,
  disabled,
}: {
  fly: FlyRequest | null;
  onUserMove: (point: GeoPoint) => void;
  disabled: boolean;
}) {
  const map = useMap();
  const moveHandler = useRef(onUserMove);
  const disabledRef = useRef(disabled);
  useEffect(() => {
    moveHandler.current = onUserMove;
    disabledRef.current = disabled;
  }, [onUserMove, disabled]);

  // Only moves that follow a drag or an arrow key count as the user placing
  // the pin; fly-to, resizes and first render also fire `moveend` and must not.
  useEffect(() => {
    let gesture = false;
    const container = map.getContainer();
    const onDragStart = () => { gesture = true; };
    const onKey = (event: KeyboardEvent) => {
      if (event.key.startsWith("Arrow")) gesture = true;
    };
    const onEnd = () => {
      if (!gesture) return;
      gesture = false;
      if (disabledRef.current) return;
      const c = map.getCenter();
      moveHandler.current({ lat: c.lat, lng: c.lng });
    };
    map.on("dragstart", onDragStart);
    map.on("moveend", onEnd);
    container.addEventListener("keydown", onKey);
    return () => {
      map.off("dragstart", onDragStart);
      map.off("moveend", onEnd);
      container.removeEventListener("keydown", onKey);
    };
  }, [map]);

  useEffect(() => {
    if (!fly) return;
    map.setView([fly.point.lat, fly.point.lng], fly.zoom, { animate: true });
  }, [map, fly]);

  useEffect(() => {
    // Layout changes (tabs, dialogs, RTL) can leave Leaflet with a stale size.
    const id = window.setTimeout(() => map.invalidateSize(), 0);
    return () => window.clearTimeout(id);
  }, [map]);

  return null;
}

/** Leaflet map with OpenStreetMap tiles; the pin itself is drawn by the parent. */
export default function PinMapCanvas({
  center,
  zoom,
  fly,
  onUserMove,
  disabled,
  label,
}: {
  center: GeoPoint;
  zoom: number;
  fly: FlyRequest | null;
  onUserMove: (point: GeoPoint) => void;
  disabled: boolean;
  label: string;
}) {
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={zoom}
      minZoom={5}
      maxZoom={18}
      scrollWheelZoom="center"
      touchZoom="center"
      doubleClickZoom="center"
      dragging={!disabled}
      keyboard={!disabled}
      className="map-pin-leaflet"
      aria-label={label}
    >
      <TileLayer attribution={OSM_ATTRIBUTION} url={OSM_TILE_URL} maxZoom={19} />
      <Controller fly={fly} onUserMove={onUserMove} disabled={disabled} />
    </MapContainer>
  );
}
