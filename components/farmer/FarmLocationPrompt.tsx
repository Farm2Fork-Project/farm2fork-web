"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { useLanguage } from "./LanguageContext";
import {
  PAKISTAN_PROVINCES,
  provinceKey,
  type FarmLocation,
  type FarmLocationStatus,
  type PakistanProvince,
} from "@/lib/farmer/farm-location.ts";

export type FarmLocationClient = {
  getFarmLocation(): Promise<FarmLocationStatus>;
  updateFarmLocation(location: FarmLocation): Promise<FarmLocationStatus>;
};

/**
 * Shown only when the farmer's pickup location is incomplete - in that state
 * transporters cannot see or collect any of their paid orders, so it is the
 * one thing blocking delivery. Disappears once saved.
 */
export default function FarmLocationPrompt({ client }: { client: FarmLocationClient }) {
  const { t } = useLanguage();
  const [status, setStatus] = useState<FarmLocationStatus | null>(null);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState<PakistanProvince | "">("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    client
      .getFarmLocation()
      .then((result) => {
        if (!active) return;
        setStatus(result);
        setAddress(result.address ?? "");
        setCity(result.city ?? "");
        setProvince(
          (PAKISTAN_PROVINCES as readonly string[]).includes(result.province ?? "")
            ? (result.province as PakistanProvince)
            : "",
        );
      })
      .catch(() => undefined); // Never block the dashboard on this check.
    return () => {
      active = false;
    };
  }, [client]);

  if (!status || status.complete) return null;

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!address.trim() || !city.trim() || !province) {
      setError(t("farmLocation.required"));
      return;
    }
    setSaving(true);
    setError("");
    try {
      setStatus(
        await client.updateFarmLocation({ address: address.trim(), city: city.trim(), province }),
      );
    } catch {
      setError(t("farmer.toast.actionFailed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="farm-location-prompt" role="region" aria-labelledby="farm-location-title">
      <div className="farm-location-head">
        <MapPin size={18} aria-hidden="true" />
        <div>
          <h2 id="farm-location-title">{t("farmLocation.promptTitle")}</h2>
          <p>{t("farmLocation.promptBody")}</p>
        </div>
      </div>
      <form className="farm-location-form" onSubmit={(e) => void save(e)}>
        <label>
          <span>{t("farmLocation.address")}</span>
          <input className="auth-input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t("farmLocation.addressPlaceholder")} />
        </label>
        <label>
          <span>{t("farmLocation.city")}</span>
          <input className="auth-input" value={city} onChange={(e) => setCity(e.target.value)} />
        </label>
        <label>
          <span>{t("farmLocation.province")}</span>
          <select className="auth-input" value={province} onChange={(e) => setProvince(e.target.value as PakistanProvince | "")}>
            <option value="">{t("farmLocation.provincePlaceholder")}</option>
            {PAKISTAN_PROVINCES.map((option) => (
              <option key={option} value={option}>{t(provinceKey(option))}</option>
            ))}
          </select>
        </label>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? t("farmer.ai.working") : t("farmLocation.save")}
        </button>
      </form>
      {error ? <p className="ai-note ai-note--error" role="alert">{error}</p> : null}
    </section>
  );
}
