"use client";

import { useEffect, useRef, useState } from "react";
import { APIProvider, Map, useMap } from "@vis.gl/react-google-maps";
import { LuCrosshair, LuMapPin } from "react-icons/lu";
import { useLanguage } from "../LanguageContext";
import {
  DEFAULT_MAP_CENTER,
  currentPosition,
  formatPoint,
  isInPakistan,
  type GeoPoint,
} from "@/lib/geo/geo-point.ts";

const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

/** Moves the camera when "use my location" picks a new spot. */
function Recenter({ target }: { target: GeoPoint | null }) {
  const map = useMap();
  useEffect(() => {
    if (map && target) {
      map.panTo(target);
      map.setZoom(16);
    }
  }, [map, target]);
  return null;
}

/**
 * Pin a location by panning the map under a fixed centre pin, or by using
 * the browser's location. Works without a Maps key too: then only "use my
 * location" is offered, which is enough to set an accurate pin.
 */
export default function MapPinPicker({
  value,
  onChange,
  purpose,
  disabled = false,
}: {
  value: GeoPoint | null;
  onChange: (point: GeoPoint) => void;
  purpose: "farm" | "dropoff";
  disabled?: boolean;
}) {
  const { t } = useLanguage();
  const [jumpTo, setJumpTo] = useState<GeoPoint | null>(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const disabledRef = useRef(disabled);
  const mountedRef = useRef(true);
  useEffect(() => { disabledRef.current = disabled; }, [disabled]);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);


  const accept = (point: GeoPoint) => {
    if (!isInPakistan(point)) {
      setError(t("map.outsidePakistan"));
      return;
    }
    setError("");
    onChange(point);
  };

  const useMyLocation = async () => {
    if (disabled) return;
    setLocating(true);
    setError("");
    try {
      const here = await currentPosition();
      if (!mountedRef.current || disabledRef.current) return;
      setJumpTo(here);
      accept(here);
    } catch (e) {
      if (mountedRef.current && !disabledRef.current) setError(t(e instanceof Error ? e.message : "map.locationUnavailable"));
    } finally {
      if (mountedRef.current) setLocating(false);
    }
  };

  return (
    <div className="map-pin-picker">
      <p className="map-pin-hint">
        {t(purpose === "farm" ? "map.farmHint" : "map.dropoffHint")}
      </p>
      {MAPS_KEY ? (
        <div className="map-pin-canvas">
          <APIProvider apiKey={MAPS_KEY}>
            <Map
              defaultCenter={value ?? DEFAULT_MAP_CENTER}
              defaultZoom={value ? 16 : 6}
              gestureHandling="greedy"
              disableDefaultUI
              zoomControl
              clickableIcons={false}
              onCameraChanged={(event) => {
                if (!disabled) accept(event.detail.center);
              }}
            />
            <Recenter target={jumpTo} />
          </APIProvider>
          <LuMapPin className="map-pin-marker" size={40} aria-hidden="true" />
        </div>
      ) : (
        <p className="map-pin-nokey">{t("map.noKey")}</p>
      )}
      <div className="map-pin-actions">
        <button
          type="button"
          className="btn btn-outline"
          onClick={useMyLocation}
          disabled={disabled || locating}
        >
          <LuCrosshair size={16} aria-hidden="true" />{" "}
          {locating ? t("map.locating") : t("map.useMyLocation")}
        </button>
        <span className={value ? "map-pin-value map-pin-value--set" : "map-pin-value"} dir="ltr">
          {value ? formatPoint(value) : t("map.notPinned")}
        </span>
      </div>
      <details className="map-pin-manual">
        <summary>{t("map.enterCoordinates")}</summary>
        <p>{t("map.coordinateHint")}</p>
        <div className="checkout-address-grid">
          <label>
            {t("map.latitude")}
            <input type="number" step="any" min="23.5" max="37.2" value={latitude} onChange={(event) => setLatitude(event.target.value)} disabled={disabled} />
          </label>
          <label>
            {t("map.longitude")}
            <input type="number" step="any" min="60.5" max="77.9" value={longitude} onChange={(event) => setLongitude(event.target.value)} disabled={disabled} />
          </label>
        </div>
        <button type="button" className="btn btn-outline" disabled={disabled} onClick={() => {
          if (!latitude.trim() || !longitude.trim()) { setError(t("map.outsidePakistan")); return; }
          const point = { lat: Number(latitude), lng: Number(longitude) };
          if (isInPakistan(point)) setJumpTo(point);
          accept(point);
        }}>{t("map.setCoordinates")}</button>
      </details>
      {error ? (
        <p className="map-pin-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
