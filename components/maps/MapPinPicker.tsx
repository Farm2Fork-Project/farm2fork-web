"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { LuCrosshair } from "react-icons/lu";
import { IcMapPin } from "@/components/icons";
import { useLanguage } from "../LanguageContext";
import {
  DEFAULT_MAP_CENTER,
  currentPosition,
  isInPakistan,
  type GeoPoint,
} from "@/lib/geo/geo-point.ts";
import { isPinFarFromCity } from "@/lib/geo/pakistan-locations.ts";
import type { FlyRequest } from "./PinMapCanvas";

// Leaflet touches `window`, so the map is loaded in the browser only.
const PinMapCanvas = dynamic(() => import("./PinMapCanvas"), {
  ssr: false,
  loading: () => <div className="map-pin-loading" aria-hidden="true" />,
});

/** The city chosen in the dropdowns; the pin is checked against its centre. */
export interface PickerCity {
  name: string;
  center: GeoPoint;
}

const HINTS = {
  farm: "map.farmHint",
  dropoff: "map.dropoffHint",
  transporter: "map.transporterHint",
} as const;

const CITY_ZOOM = 12;
const PIN_ZOOM = 16;

/**
 * Pin a location by dragging the map under a fixed centre pin, or with the
 * browser's location. Uses OpenStreetMap tiles, so it needs no API key.
 * Nobody types coordinates: lat/lng are only values handed to `onChange`.
 */
export default function MapPinPicker({
  value,
  onChange,
  purpose,
  disabled = false,
  city = null,
}: {
  value: GeoPoint | null;
  onChange: (point: GeoPoint) => void;
  purpose: "farm" | "dropoff" | "transporter";
  disabled?: boolean;
  city?: PickerCity | null;
}) {
  const { t } = useLanguage();
  const [fly, setFly] = useState<FlyRequest | null>(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState<GeoPoint | null>(null);
  const disabledRef = useRef(disabled);
  const mountedRef = useRef(true);
  const seq = useRef(0);
  const initial = useRef(value ?? city?.center ?? null);
  const valueRef = useRef(value);
  useEffect(() => {
    disabledRef.current = disabled;
    valueRef.current = value;
  }, [disabled, value]);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const flyTo = useCallback((point: GeoPoint, zoom: number) => {
    seq.current += 1;
    setFly({ point, zoom, seq: seq.current });
  }, []);

  // Choosing a (different) city moves the map there. A pin left over from the
  // previous city is not kept silently.
  const cityKey = city ? `${city.name}|${city.center.lat}|${city.center.lng}` : "";
  const lastCity = useRef(cityKey);
  useEffect(() => {
    if (cityKey === lastCity.current) return;
    lastCity.current = cityKey;
    setPending(null);
    if (!city) return;
    flyTo(city.center, CITY_ZOOM);
    const current = valueRef.current;
    if (current && isPinFarFromCity(current, city.center)) setPending(current);
  }, [cityKey, city, flyTo]);

  /** Validates a point; far-from-city pins wait for the user's confirmation. */
  const propose = useCallback(
    (point: GeoPoint) => {
      if (!isInPakistan(point)) {
        setError(t("map.outsidePakistan"));
        return;
      }
      setError("");
      if (city && isPinFarFromCity(point, city.center)) {
        setPending(point);
        return;
      }
      setPending(null);
      onChange(point);
    },
    [city, onChange, t],
  );

  const onUserMove = useCallback(
    (point: GeoPoint) => {
      if (!disabledRef.current) propose(point);
    },
    [propose],
  );

  const useMyLocation = async () => {
    if (disabled) return;
    setLocating(true);
    setError("");
    try {
      const here = await currentPosition();
      if (!mountedRef.current || disabledRef.current) return;
      if (!isInPakistan(here)) {
        setError(t("map.outsidePakistan"));
        return;
      }
      flyTo(here, PIN_ZOOM);
      propose(here);
    } catch (e) {
      if (mountedRef.current && !disabledRef.current) {
        setError(t(e instanceof Error ? e.message : "map.locationUnavailable"));
      }
    } finally {
      if (mountedRef.current) setLocating(false);
    }
  };

  const keepPending = () => {
    if (pending && pending !== value) onChange(pending);
    setPending(null);
  };

  const backToCity = () => {
    if (!city) return;
    flyTo(city.center, CITY_ZOOM);
    setPending(null);
    onChange(city.center);
  };

  const start = initial.current ?? DEFAULT_MAP_CENTER;
  const startZoom = value ? PIN_ZOOM : city ? CITY_ZOOM : 6;

  return (
    <div className="map-pin-picker">
      <p className="map-pin-hint">
        {t(HINTS[purpose])}
      </p>
      <div className="map-pin-canvas" dir="ltr">
        <PinMapCanvas
          center={start}
          zoom={startZoom}
          fly={fly}
          onUserMove={onUserMove}
          disabled={disabled}
          label={t("map.mapLabel")}
        />
        <IcMapPin className="map-pin-marker" size={40} aria-hidden="true" />
      </div>
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
        <span
          className={value ? "map-pin-value map-pin-value--set" : "map-pin-value"}
          role="status"
        >
          {value ? t("map.pinned") : t("map.notPinned")}
        </span>
      </div>
      {pending && city ? (
        <div className="map-pin-confirm" role="alertdialog" aria-label={t("map.farTitle")}>
          <p>{t("map.farFromCity").replaceAll("{city}", city.name)}</p>
          <div className="map-pin-confirm-actions">
            <button type="button" className="btn btn-primary" onClick={keepPending} disabled={disabled}>
              {t("map.farKeep")}
            </button>
            <button type="button" className="btn btn-outline" onClick={backToCity} disabled={disabled}>
              {t("map.farMove").replaceAll("{city}", city.name)}
            </button>
          </div>
        </div>
      ) : null}
      {error ? (
        <p className="map-pin-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
