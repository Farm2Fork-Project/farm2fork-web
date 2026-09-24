"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { LuSearchX, LuTriangleAlert } from "react-icons/lu";
import { LanguageProvider, useLanguage } from "@/components/LanguageContext";
import TraceJourney from "@/components/trace/TraceJourney";
import TracePageShell from "@/components/trace/TracePageShell";
import { ApiClient } from "@/lib/api/client.ts";
import { ApiError } from "@/lib/api/contracts.ts";
import {
  type ProductTrace,
  TraceRepository,
  parseTraceProductId,
} from "@/lib/trace/trace-repository.ts";

type PageState =
  | { kind: "loading" }
  | { kind: "not_found" }
  | { kind: "error" }
  | { kind: "loaded"; trace: ProductTrace };

function TraceProductContent() {
  const { t } = useLanguage();
  const params = useParams<{ id: string }>();
  const productId = parseTraceProductId(params.id ?? "");
  const repository = useMemo(
    () => new TraceRepository({ client: new ApiClient() }),
    [],
  );
  const [state, setState] = useState<PageState>(
    productId ? { kind: "loading" } : { kind: "not_found" },
  );

  // Resolves to the next state without touching state itself, so the effect
  // below only sets state after the request settles.
  const fetchState = useCallback(async (): Promise<PageState> => {
    if (!productId) return { kind: "not_found" };
    try {
      return { kind: "loaded", trace: await repository.getProductTrace(productId) };
    } catch (error) {
      return error instanceof ApiError && error.status === 404
        ? { kind: "not_found" }
        : { kind: "error" };
    }
  }, [productId, repository]);

  useEffect(() => {
    let cancelled = false;
    void fetchState().then((next) => {
      if (!cancelled) setState(next);
    });
    return () => {
      cancelled = true;
    };
  }, [fetchState]);

  const retry = () => {
    setState({ kind: "loading" });
    void fetchState().then(setState);
  };

  return (
    <TracePageShell>
      <div className="trace-page-intro">
        <h1>{t("trace.pageTitle")}</h1>
        <p>{t("trace.pageIntro")}</p>
      </div>

      {state.kind === "loading" ? (
        <div className="trace-page-state" role="status">
          <div className="app-spinner" aria-hidden="true" />
          <p>{t("trace.loading")}</p>
        </div>
      ) : null}

      {state.kind === "not_found" ? (
        <div className="trace-page-state">
          <LuSearchX size={40} aria-hidden="true" />
          <h2>{t("trace.notFound.title")}</h2>
          <p>{t("trace.notFound.desc")}</p>
          <Link href="/trace" className="btn btn-primary">
            {t("trace.searchAnother")}
          </Link>
        </div>
      ) : null}

      {state.kind === "error" ? (
        <div className="trace-page-state" role="alert">
          <LuTriangleAlert size={40} aria-hidden="true" />
          <h2>{t("trace.error.title")}</h2>
          <p>{t("trace.error.desc")}</p>
          <button type="button" className="btn btn-primary" onClick={retry}>
            {t("trace.retry")}
          </button>
        </div>
      ) : null}

      {state.kind === "loaded" ? <TraceJourney trace={state.trace} /> : null}
    </TracePageShell>
  );
}

export default function TraceProductPage() {
  return (
    <LanguageProvider>
      <TraceProductContent />
    </LanguageProvider>
  );
}
