"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
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
  const { t, language } = useLanguage();
  const ur = language === "ur";
  const [status, setStatus] = useState<ApiTransporterStatus | null>(null);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [gpsEnabled, setGpsEnabled] = useState(false);
  const visibilityEpoch = useRef(0);
  const [gpsError, setGpsError] = useState("");
  const lock = useRef(false);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  async function locate() {
    if (lock.current) return;
    lock.current = true; const epoch = visibilityEpoch.current; setBusy(true); setGpsError("");
    try {
      if (!navigator.geolocation) throw new Error(ur ? "براؤزر میں مقام دستیاب نہیں۔ نیچے دستی نقاط درج کریں۔" : "Browser location is unavailable. Enter a manual pin below.");
      const position = await new Promise<GeolocationPosition>((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }));
      if (!alive.current || epoch !== visibilityEpoch.current || document.visibilityState === "hidden") return;
      const location = { lat: position.coords.latitude, lng: position.coords.longitude };
      if (Date.now() - position.timestamp > 60000) throw new Error(ur ? "مقام پرانا ہے۔ GPS دوبارہ آزمائیں۔" : "Location is stale. Try GPS again.");
      setGpsEnabled(true);
      if (status?.online) { await repository.updateLocation(location); const next = await repository.getTransporterStatus(); if (alive.current) setStatus(next); }
      else { const next = await repository.setAvailability(true, location); if (alive.current) setStatus(next); }
      if (!alive.current) return;
      try { await onRefresh(); } catch { setGpsError(ur ? "مقام محفوظ ہے۔ پیشکشیں تازہ کریں۔" : "Location saved. Refresh to load current offers."); }
    } catch (e) { if (alive.current) setGpsError(e instanceof Error ? e.message : "Location permission denied or GPS unavailable. Allow location in browser settings and retry, or enter a manual pin."); }
    finally { lock.current = false; if (alive.current) setBusy(false); }
  }
  useEffect(() => {
    const changed = () => { visibilityEpoch.current++; };
    document.addEventListener('visibilitychange', changed);
    return () => document.removeEventListener('visibilitychange', changed);
  }, []);
  useEffect(() => {
    if (!status?.online || !gpsEnabled) return;
    let cancelled = false;
    let running = false;
    const measure = async () => {
      if (cancelled || running || lock.current || document.visibilityState === 'hidden') return;
      running = true; const epoch = visibilityEpoch.current;
      try {
        const position = await new Promise<GeolocationPosition>((resolve,reject) => navigator.geolocation.getCurrentPosition(resolve,reject,{enableHighAccuracy:true,maximumAge:0,timeout:15000}));
        if (cancelled || !alive.current || epoch !== visibilityEpoch.current || document.hidden) return;
        if (Date.now() - position.timestamp > 60000) throw new Error('Location is stale. Retry current GPS location.');
        await repository.updateLocation({lat:position.coords.latitude,lng:position.coords.longitude});
        if (cancelled) return;
        const next = await repository.getTransporterStatus(); if (!cancelled) setStatus(next);
        try { await onRefresh(); } catch { setGpsError(ur ? "تبدیلی محفوظ ہے۔ فہرست تازہ کریں۔" : "Change saved. Refresh to update delivery offers."); }
      } catch { if (!cancelled) setGpsError(ur ? 'مقام تازہ نہیں ہو سکا۔ GPS دوبارہ آزمائیں۔' : 'Current GPS could not be refreshed. Retry location before accepting work.'); }
      finally { running = false; }
    };
    const resume = () => { if (document.visibilityState !== 'hidden') void measure(); };
    const timer = setInterval(() => void measure(),45000);
    document.addEventListener('visibilitychange', resume);
    return () => { cancelled = true; clearInterval(timer); document.removeEventListener('visibilitychange',resume); };
  }, [status?.online, gpsEnabled, repository, onRefresh, ur]);
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
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError(false);
    try {
      setStatus(await repository.getTransporterStatus());
      try { await onRefresh(); } catch { setGpsError(ur ? "تبدیلی محفوظ ہے۔ فہرست تازہ کریں۔" : "Change saved. Refresh to update delivery offers."); }
    } catch {
      setError(true);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function offline() {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError(false);
    try {
      setStatus(await repository.setAvailability(false));
      setGpsEnabled(false);
      try { await onRefresh(); } catch { setGpsError(ur ? "تبدیلی محفوظ ہے۔ فہرست تازہ کریں۔" : "Change saved. Refresh to update delivery offers."); }
    } catch {
      setError(true);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (lock.current || !status) return;
    setGpsEnabled(false);
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
    lock.current = true;
    setBusy(true);
    setError(false);
    try {
      if (status.online) {
        await repository.updateLocation(location);
        setStatus(await repository.getTransporterStatus());
      } else setStatus(await repository.setAvailability(true, location));
      try { await onRefresh(); } catch { setGpsError(ur ? "تبدیلی محفوظ ہے۔ فہرست تازہ کریں۔" : "Change saved. Refresh to update delivery offers."); }
    } catch {
      setError(true);
    } finally {
      lock.current = false;
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
      <button type="button" className="btn btn-primary" disabled={busy || !status} onClick={() => void locate()}>{busy ? (ur ? "مقام تلاش ہو رہا ہے…" : "Checking location…") : (ur ? "موجودہ GPS مقام استعمال کریں" : "Use current GPS location")}</button>
      {gpsError && <p role="alert">{gpsError}</p>}
      <p>{ur ? "مقام صرف کھلے اور نظر آنے والے صفحے پر بھیجا جاتا ہے۔ واپس آنے پر GPS تازہ کریں۔" : "Location is shared only while this page is open and visible. Refresh GPS after returning to this page."}</p>
      <h3>{ur ? "دستی مقام" : "Manual pin fallback"}</h3><p>{ur ? "درج کیے گئے نقاط دستی مقام ہیں، براہ راست GPS نہیں۔" : "Coordinates entered below are a manual location, not live GPS."}</p>
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
