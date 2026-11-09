"use client";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import type {
  FarmerRepository,
  FarmLocation,
} from "@/lib/farmer/farmer-repository.ts";
import { IcMapPin } from "@/components/icons";
import { useLanguage } from "./LanguageContext";

import MapPinPicker from "@/components/maps/MapPinPicker";
import ProvinceCityFields from "@/components/maps/ProvinceCityFields";
import { cityTarget } from "@/lib/geo/pakistan-locations.ts";
import { type PakistanProvince } from "@/lib/farmer/farm-location.ts";

/**
 * `card` is the compact dashboard summary that links to the full screen;
 * `form` is the full Province > City > map > street form for /farmer/location.
 */
export function FarmPickupLocation({
  repository,
  variant = "form",
  onSaved,
}: {
  repository: Pick<FarmerRepository, "getFarmLocation" | "updateFarmLocation">;
  variant?: "card" | "form";
  onSaved?: () => void;
}) {
  const { language } = useLanguage();
  const ur = language === "ur";
  const [location, setLocation] = useState<FarmLocation>({ complete: false });
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<"load" | "save" | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(variant === "form");
  useEffect(() => {
    let active = true;
    repository
      .getFarmLocation()
      .then((value) => {
        if (active) {
          setLocation(value);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (active) setError("load");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [repository, loadAttempt]);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (saving || !loaded) return;
    if (typeof location.lat !== "number" || typeof location.lng !== "number") {
      setError("save");
      return;
    }
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const value = await repository.updateFarmLocation({
        address: location.address!.trim(),
        city: location.city!.trim(),
        province: location.province! as PakistanProvince,
        lat: location.lat!,
        lng: location.lng!,
      });
      if (!value.complete) throw new Error("Incomplete pickup location");
      setLocation(value);
      setSaved(true);
      setEditing(false);
      onSaved?.();
    } catch {
      setError("save");
    } finally {
      setSaving(false);
    }
  }
  if (variant === "card") {
    if (loading) return null;
    const title = ur ? "فارم سے وصولی کی جگہ" : "Farm pickup location";
    const complete = loaded && location.complete;
    return (
      <section className="pickup-summary" aria-label={title}>
        <span className="pickup-summary-icon">
          <IcMapPin size={22} />
        </span>
        <div className="pickup-summary-text">
          <strong>{title}</strong>
          <span>
            {error === "load"
              ? ur
                ? "فارم کی جگہ لوڈ نہیں ہو سکی۔"
                : "Could not load your pickup location."
              : complete
                ? [location.address, location.city, location.province].filter(Boolean).join(", ")
                : ur
                  ? "ابھی طے نہیں۔ ٹرانسپورٹر آپ کے آرڈر تب ہی اٹھا سکتے ہیں جب یہ محفوظ ہو۔"
                  : "Not set yet. Transporters can only collect your orders once this is saved."}
          </span>
        </div>
        <Link className="pickup-summary-edit" href="/farmer/location">
          {complete ? (ur ? "ترمیم کریں" : "Edit") : ur ? "جگہ مقرر کریں" : "Set location"}
        </Link>
      </section>
    );
  }
  if (loaded && location.complete && !editing) {
    const title = ur ? "فارم سے وصولی کی جگہ" : "Farm pickup location";
    return (
      <section className="pickup-summary" aria-label={title}>
        <span className="pickup-summary-icon">
          <IcMapPin size={22} />
        </span>
        <div className="pickup-summary-text">
          <strong>{title}</strong>
          <span>
            {[location.address, location.city, location.province]
              .filter(Boolean)
              .join(", ")}
          </span>
        </div>
        <button
          type="button"
          className="pickup-summary-edit"
          onClick={() => {
            setSaved(false);
            setEditing(true);
          }}
        >
          {ur ? "ترمیم کریں" : "Edit"}
        </button>
        {saved ? (
          <p role="status" className="pickup-summary-status">
            {ur ? "وصولی کی جگہ محفوظ ہو گئی۔" : "Pickup location saved."}
          </p>
        ) : null}
      </section>
    );
  }
  return (
    <form className="checkout-panel" onSubmit={submit}>
      <h3>{ur ? "فارم سے وصولی کی جگہ" : "Farm pickup location"}</h3>
      <p>
        {ur
          ? "ترسیل کی قیمت اور وصولی کے لیے اپنے فارم کا شہر منتخب کریں، نقشے پر پن لگائیں اور گلی کا پتہ لکھیں۔"
          : "Choose your farm city, pin it on the map and add your street so buyers can price delivery and transporters can collect orders."}
      </p>
      <fieldset
        disabled={loading || saving || !loaded}
        style={{ border: 0, padding: 0 }}
      >
        <ProvinceCityFields
          idPrefix="pickup"
          province={location.province ?? ""}
          city={location.city ?? ""}
          onChange={({ province, city }) => {
            setSaved(false);
            setLocation((v) => ({ ...v, province, city }));
          }}
        />
        <MapPinPicker
          value={typeof location.lat === "number" && typeof location.lng === "number" ? { lat: location.lat, lng: location.lng } : null}
          onChange={(point) => { setSaved(false); setLocation((current) => ({ ...current, ...point })); }}
          purpose="farm"
          disabled={loading || saving || !loaded}
          city={cityTarget(location.province ?? "", location.city ?? "")}
        />
        <div className="checkout-address-grid">
          <label>
            {ur ? "گلی، گاؤں یا کوئی مشہور نشانی" : "Street, village or landmark"}
            <input
              required
              maxLength={200}
              value={location.address ?? ""}
              onChange={(e) => {
                setSaved(false);
                setLocation((v) => ({ ...v, address: e.target.value }));
              }}
            />
          </label>
        </div>
        <button type="submit" className="btn btn-primary">
          {saving
            ? ur
              ? "محفوظ ہو رہا ہے…"
              : "Saving…"
            : ur
              ? "وصولی کی جگہ محفوظ کریں"
              : "Save pickup location"}
        </button>
        {editing && variant === "form" ? (
          <Link className="pickup-summary-edit" href="/farmer">
            {ur ? "منسوخ کریں" : "Cancel"}
          </Link>
        ) : null}
      </fieldset>
      {loading ? (
        <p role="status">{ur ? "لوڈ ہو رہا ہے…" : "Loading…"}</p>
      ) : null}
      {error ? (
        <p role="alert">
          {error === "load"
            ? ur
              ? "فارم کی جگہ لوڈ نہیں ہو سکی۔ دوبارہ کوشش کریں۔"
              : "Could not load pickup location. Retry to load it."
            : ur
              ? "فارم کی جگہ محفوظ نہیں ہو سکی۔ معلومات چیک کر کے دوبارہ کوشش کریں۔"
              : "Could not save pickup location. Check the details and retry."}
        </p>
      ) : null}
      {error === "load" ? (
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            setError(null);
            setLoadAttempt((v) => v + 1);
          }}
        >
          {ur ? "دوبارہ کوشش کریں" : "Retry loading"}
        </button>
      ) : null}
      {saved ? (
        <p role="status">
          {ur ? "وصولی کی جگہ محفوظ ہو گئی۔" : "Pickup location saved."}
        </p>
      ) : null}
    </form>
  );
}
