"use client";

import { type FormEvent, useMemo, useState } from "react";
import { LuArrowLeft, LuInfo, LuRefreshCw, LuSearch } from "react-icons/lu";
import { ApiClient } from "@/lib/api/client.ts";
import { ApiError } from "@/lib/api/contracts.ts";
import {
  type ProductTrace,
  TraceRepository,
  parseTraceProductId,
} from "@/lib/trace/trace-repository.ts";
import { useLanguage } from "./LanguageContext";
import TraceJourney from "./trace/TraceJourney";

type LookupState =
  | { kind: "idle" }
  | { kind: "invalid" }
  | { kind: "loading"; productId: string }
  | { kind: "not_found"; productId: string }
  | { kind: "error"; productId: string }
  | { kind: "loaded"; trace: ProductTrace };

/**
 * In-app product trace lookup (buyer, farmer and transporter portals).
 * Accepts a product id or a pasted QR trace link and shows the real,
 * ledger-backed journey from the public trace API.
 */
export default function ScanScreen() {
  const { t } = useLanguage();
  const repository = useMemo(
    () => new TraceRepository({ client: new ApiClient() }),
    [],
  );
  const [query, setQuery] = useState("");
  const [state, setState] = useState<LookupState>({ kind: "idle" });

  const lookup = async (productId: string) => {
    setState({ kind: "loading", productId });
    try {
      setState({ kind: "loaded", trace: await repository.getProductTrace(productId) });
    } catch (error) {
      setState(
        error instanceof ApiError && error.status === 404
          ? { kind: "not_found", productId }
          : { kind: "error", productId },
      );
    }
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const productId = parseTraceProductId(query);
    if (!productId) {
      setState({ kind: "invalid" });
      return;
    }
    void lookup(productId);
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
        <TraceJourney trace={state.trace} />
      </>
    );
  }

  const busy = state.kind === "loading";
  return (
    <div className="qr-scanner-area">
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
              onClick={() => void lookup(state.productId)}
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
