"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { LanguageProvider, useLanguage } from "@/components/LanguageContext";
import TracePageShell from "@/components/trace/TracePageShell";
import OrderTraceJourney from "@/components/trace/OrderTraceJourney";
import { ApiClient } from "@/lib/api/client";
import { ApiError } from "@/lib/api/contracts";
import { TraceRepository, type OrderTrace } from "@/lib/trace/trace-repository";
function Content() {
  const { id } = useParams<{ id: string }>();
  const { t, language } = useLanguage();
  const repository = useMemo(
    () => new TraceRepository({ client: new ApiClient() }),
    [],
  );
  const [state, setState] = useState<{
    id: string;
    trace?: OrderTrace;
    error?: "missing" | "error";
  }>({ id: "" });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    if (!/^[a-f0-9]{24}$/i.test(id)) {
      void Promise.resolve().then(() => {
        if (active) setState({ id, error: "missing" });
      });
      return () => {
        active = false;
      };
    }
    void repository.getOrderTrace(id).then(
      (trace) => {
        if (active) setState({ id, trace });
      },
      (error) => {
        if (active)
          setState({
            id,
            error:
              error instanceof ApiError && error.status === 404
                ? "missing"
                : "error",
          });
      },
    );
    return () => {
      active = false;
    };
  }, [id, repository, attempt]);
  const current = state.id === id ? state : { id };
  return (
    <TracePageShell>
      <div className="trace-page-intro">
        <h1>{language === "ur" ? "آرڈر کا سفر" : "Order journey"}</h1>
        <p>{t("trace.pageIntro")}</p>
      </div>
      {current.trace ? (
        <OrderTraceJourney trace={current.trace} />
      ) : current.error ? (
        <div className="trace-page-state" role="alert">
          <h2>
            {t(
              current.error === "missing"
                ? "trace.notFound.title"
                : "trace.error.title",
            )}
          </h2>
          <p>
            {t(
              current.error === "missing"
                ? "trace.notFound.desc"
                : "trace.error.desc",
            )}
          </p>
          <button
            className="btn btn-primary"
            onClick={() => {
              setState({ id });
              setAttempt((value) => value + 1);
            }}
          >
            {t("trace.retry")}
          </button>
        </div>
      ) : (
        <p role="status">{t("trace.loading")}</p>
      )}
    </TracePageShell>
  );
}
export default function OrderTracePage() {
  return (
    <LanguageProvider>
      <Content />
    </LanguageProvider>
  );
}
