"use client";

import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { LuArrowLeft, LuInfo, LuRefreshCw, LuSearch } from "react-icons/lu";
import { ApiClient } from "@/lib/api/client.ts";
import { ApiError } from "@/lib/api/contracts.ts";
import {
  type ProductTrace,
  type OrderTrace,
  type TraceLink,
  TraceRepository,
  parseTraceLink,
} from "@/lib/trace/trace-repository.ts";
import { useLanguage } from "./LanguageContext";
import TraceCamera from "./trace/TraceCamera";
import OrderTraceJourney from "./trace/OrderTraceJourney";
import TraceJourney from "./trace/TraceJourney";

type LookupState =
  | { kind: "idle" }
  | { kind: "invalid" }
  | { kind: "loading"; target: TraceLink }
  | { kind: "not_found"; target: TraceLink }
  | { kind: "error"; target: TraceLink }
  | { kind: "loaded"; trace: ProductTrace | OrderTrace };

/**
 * In-app product trace lookup (buyer, farmer and transporter portals).
 * Accepts a product id or a pasted QR trace link and shows the real,
 * ledger-backed journey from the public trace API.
 */
export default function ScanScreen() {
  const { t, language } = useLanguage();
  const repository = useMemo(
    () => new TraceRepository({ client: new ApiClient() }),
    [],
  );
  const [query, setQuery] = useState("");
  const [state, setState] = useState<LookupState>({ kind: "idle" });

  const [camera, setCamera] = useState(false);
  const inFlight = useRef(false);
  const active = useRef(true);
  useEffect(() => {active.current = true; return () => {active.current = false;};}, []);
  const lookup = async (target: TraceLink) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setCamera(false);
    setState({ kind: "loading", target });
    try {
      const trace = target.kind === "order" ? await repository.getOrderTrace(target.id) : await repository.getProductTrace(target.id);
      if (active.current) setState({ kind: "loaded", trace });
    } catch (error) {
      if (active.current) setState(error instanceof ApiError && error.status === 404 ? { kind: "not_found", target } : { kind: "error", target });
    } finally {inFlight.current = false;}
  };
  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const target = parseTraceLink(query);
    if (!target) {setState({ kind: "invalid" }); return;}
    void lookup(target);
  };

  if (state.kind === "loaded") {
    return (
      <>
        <button className="pd-back-btn" onClick={() => setState({ kind: "idle" })}>
          <LuArrowLeft size={18} className="rtl-flip" /> {t("scan.back")}
        </button>
        <div className="scan-header">
          <h1>{t("scan.traceTitle")}</h1>
        </div>
        {"order" in state.trace ? <OrderTraceJourney trace={state.trace} /> : <TraceJourney trace={state.trace} />}
      </>
    );
  }

  const busy = state.kind === "loading";
  return (
    <div className="qr-scanner-area">
      {camera ? <TraceCamera onAccept={target => void lookup(target)} onStop={() => setCamera(false)} /> : <button type="button" className="btn btn-primary" disabled={busy} onClick={() => setCamera(true)}>{language === "ur" ? "کیمرے سے اسکین کریں" : "Scan with camera"}</button>}
      <form className="trace-search" onSubmit={onSubmit} role="search">
        <label htmlFor="trace-search-input" className="sr-only">
          {t("scan.placeholder")}
        </label>
        <input
          id="trace-search-input"
          type="text"
          dir="ltr"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("scan.placeholder")}
          className="auth-input"
          autoComplete="off"
          spellCheck={false}
          aria-invalid={state.kind === "invalid"}
          aria-describedby="trace-search-feedback"
        />
        <button type="submit" className="qr-simulate-btn" disabled={busy}>
          {busy ? (
            <LuRefreshCw size={16} className="spin" aria-hidden="true" />
          ) : (
            <LuSearch size={16} aria-hidden="true" />
          )}
          {busy ? t("trace.loading") : t("scan.searchBtn")}
        </button>
      </form>

      <div id="trace-search-feedback" aria-live="polite" className="trace-feedback-slot">
        {state.kind === "invalid" ? (
          <p className="trace-feedback trace-feedback--warn">{t("trace.invalid")}</p>
        ) : null}
        {state.kind === "not_found" ? (
          <div className="trace-feedback trace-feedback--warn">
            <strong>{t("trace.notFound.title")}</strong>
            <p>{t("trace.notFound.desc")}</p>
          </div>
        ) : null}
        {state.kind === "error" ? (
          <div className="trace-feedback trace-feedback--error">
            <strong>{t("trace.error.title")}</strong>
            <p>{t("trace.error.desc")}</p>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => void lookup(state.target)}
            >
              {t("trace.retry")}
            </button>
          </div>
        ) : null}
      </div>

      <p className="qr-description trace-hint">
        <LuInfo size={20} aria-hidden="true" />
        <span>{t("scan.desc")}</span>
      </p>
    </div>
  );
}
