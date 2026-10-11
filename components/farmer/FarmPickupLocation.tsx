"use client";
import { useEffect, useState, type FormEvent } from "react";
import type {
  FarmerRepository,
  FarmLocation,
} from "@/lib/farmer/farmer-repository.ts";
import { IcMapPin } from "@/components/icons";
import { useLanguage } from "./LanguageContext";

const provinces = [
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Gilgit-Baltistan",
  "Azad Jammu and Kashmir",
  "Islamabad Capital Territory",
];
export function FarmPickupLocation({
  repository,
}: {
  repository: Pick<FarmerRepository, "getFarmLocation" | "updateFarmLocation">;
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
  const [editing, setEditing] = useState(false);
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
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const value = await repository.updateFarmLocation({
        address: location.address!.trim(),
        city: location.city!.trim(),
        province: location.province!,
        lat: location.lat!,
        lng: location.lng!,
      });
      if (!value.complete) throw new Error("Incomplete pickup location");
      setLocation(value);
      setSaved(true);
      setEditing(false);
    } catch {
      setError("save");
    } finally {
      setSaving(false);
    }
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
          ? "ترسیل کی قیمت اور وصولی کے لیے اپنے فارم کا درست پتہ اور نقشے کے نقاط محفوظ کریں۔"
          : "Save your farm address and coordinates so buyers can price delivery and transporters can collect orders."}
      </p>
      <fieldset
        disabled={loading || saving || !loaded}
        style={{ border: 0, padding: 0 }}
      >
        <div className="checkout-address-grid">
          <label>
            {ur ? "گلی یا گاؤں" : "Street or village"}
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
          <label>
            {ur ? "شہر" : "Farm city"}
            <input
              required
              maxLength={80}
              value={location.city ?? ""}
              onChange={(e) => {
                setSaved(false);
                setLocation((v) => ({ ...v, city: e.target.value }));
              }}
            />
          </label>
          <label>
            {ur ? "صوبہ" : "Farm province"}
            <select
              required
              value={location.province ?? ""}
              onChange={(e) => {
                setSaved(false);
                setLocation((v) => ({ ...v, province: e.target.value }));
              }}
            >
              <option value="">
                {ur ? "صوبہ منتخب کریں" : "Select province"}
              </option>
              {provinces.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
          <label>
            {ur ? "عرض بلد" : "Farm latitude"}
            <input
              required
              type="number"
              step="any"
              min="23.5"
              max="37.2"
              value={location.lat ?? ""}
              onChange={(e) => {
                setSaved(false);
                setLocation((v) => ({
                  ...v,
                  lat:
                    e.target.value === "" ? undefined : Number(e.target.value),
                }));
              }}
            />
          </label>
          <label>
            {ur ? "طول بلد" : "Farm longitude"}
            <input
              required
              type="number"
              step="any"
              min="60.5"
              max="77.9"
              value={location.lng ?? ""}
              onChange={(e) => {
                setSaved(false);
                setLocation((v) => ({
                  ...v,
                  lng:
                    e.target.value === "" ? undefined : Number(e.target.value),
                }));
              }}
            />
          </label>
        </div>
        <p>
          {ur
            ? "اپنی نقشہ ایپ سے فارم کے نقاط کاپی کریں۔"
            : "Copy your farm coordinates from your map app."}
        </p>
        <button type="submit" className="btn btn-primary">
          {saving
            ? ur
              ? "محفوظ ہو رہا ہے…"
              : "Saving…"
            : ur
              ? "وصولی کی جگہ محفوظ کریں"
              : "Save pickup location"}
        </button>
        {editing ? (
          <button
            type="button"
            className="pickup-summary-edit"
            onClick={() => {
              setEditing(false);
              setLoadAttempt((v) => v + 1);
            }}
          >
            {ur ? "منسوخ کریں" : "Cancel"}
          </button>
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
