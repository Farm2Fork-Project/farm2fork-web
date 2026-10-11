"use client";
import { useEffect, useState, type FormEvent } from "react";
import type { ApiTransporterStatus } from "@/lib/api/contracts.ts";
import type { ShipmentRepository } from "@/lib/shipment/shipment-repository.ts";
import { useLanguage } from "./LanguageContext";
export function TransporterAvailability({
  repository,
  onRefresh,
  revision,
}: {
  repository: Pick<
    ShipmentRepository,
    "getTransporterStatus" | "setAvailability" | "updateLocation"
  >;
  onRefresh: () => Promise<void>;
  revision: number;
}) {
  const { t } = useLanguage();
  const [status, setStatus] = useState<ApiTransporterStatus | null>(null);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    repository
      .getTransporterStatus()
      .then((v) => {
        if (active) setStatus(v);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [repository, revision]);
  async function refresh() {
    if (busy) return;
    setBusy(true);
    setError(false);
    try {
      setStatus(await repository.getTransporterStatus());
      await onRefresh();
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }
  async function offline() {
    if (busy) return;
    setBusy(true);
    setError(false);
    try {
      setStatus(await repository.setAvailability(false));
      await onRefresh();
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy || !status) return;
    const location = { lat: Number(lat), lng: Number(lng) };
    if (
      !lat.trim() ||
      !lng.trim() ||
      !Number.isFinite(location.lat) ||
      !Number.isFinite(location.lng) ||
      location.lat < 23.5 ||
      location.lat > 37.2 ||
      location.lng < 60.5 ||
      location.lng > 77.9
    )
      return;
    setBusy(true);
    setError(false);
    try {
      if (status.online) {
        await repository.updateLocation(location);
        setStatus(await repository.getTransporterStatus());
      } else setStatus(await repository.setAvailability(true, location));
      await onRefresh();
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="checkout-panel dispatch-panel" onSubmit={submit}>
      <div className="dispatch-head">
        <h2>{t("dispatch.title")}</h2>
        <span
          role="status"
          className={`dispatch-status${status?.online ? " online" : ""}`}
        >
          {!status
            ? t("dispatch.loading")
            : status.online
              ? t("dispatch.online")
              : t("dispatch.offline")}
        </span>
      </div>
      {status ? (
        <ul className="dispatch-facts">
          <li>
            {status.locationFresh ? t("dispatch.fresh") : t("dispatch.stale")}
          </li>
          <li>
            {t("dispatch.radius")}: {status.radiusKm} km
          </li>
          {status.activeShipmentId ? <li>{t("dispatch.active")}</li> : null}
          {status.lastLocationAt ? (
            <li>
              {t("dispatch.updated")}:{" "}
              {new Date(status.lastLocationAt).toLocaleString()}
            </li>
          ) : null}
        </ul>
      ) : null}
      <p className="dispatch-help">{t("dispatch.help")}</p>
      <fieldset disabled={busy || !status} style={{ border: 0, padding: 0 }}>
        <div className="checkout-address-grid">
          <label>
            {t("dispatch.latitude")}
            <input
              required
              type="number"
              min="23.5"
              max="37.2"
              step="any"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
            />
          </label>
          <label>
            {t("dispatch.longitude")}
            <input
              required
              type="number"
              min="60.5"
              max="77.9"
              step="any"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
            />
          </label>
        </div>
      </fieldset>
      <div className="dispatch-actions">
        <button
          className="btn btn-primary"
          type="submit"
          disabled={busy || !status}
        >
          {status?.online
            ? t("dispatch.updateLocation")
            : t("dispatch.goOnline")}
        </button>
        {status?.online ? (
          <button
            className="btn btn-outline"
            type="button"
            disabled={busy || !status}
            onClick={offline}
          >
            {t("dispatch.goOffline")}
          </button>
        ) : null}
        <button
          className="btn btn-outline dispatch-refresh"
          type="button"
          disabled={busy}
          onClick={refresh}
        >
          {t("dispatch.refresh")}
        </button>
      </div>
      {error ? <p role="alert">{t("dispatch.error")}</p> : null}
    </form>
  );
}
