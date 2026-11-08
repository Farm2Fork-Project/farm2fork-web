"use client";
import Link from "next/link";
import { useLanguage } from "../LanguageContext";
import { TraceEventItem } from "./TraceJourney";
import type { OrderTrace } from "@/lib/trace/trace-repository";
import { loginPathFor } from "@/lib/auth/role-routes";

export default function OrderTraceJourney({ trace }: { trace: OrderTrace }) {
  const { language, t } = useLanguage();
  const copy = (en: string, ur: string) => (language === "ur" ? ur : en);
  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat(language === "ur" ? "ur-PK" : "en-PK", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  return (
    <div className="scan-results-container">
      <aside className="scan-product-sidebar">
        <div className="scan-product-card">
          <div className="scan-product-info">
            <h2>
              {copy("Order journey", "آرڈر کا سفر")} · {trace.order.reference}
            </h2>
            <p>
              {copy("Payment confirmed", "ادائیگی کی تصدیق")} ·{" "}
              {formatDate(trace.order.paidAt)}
            </p>
            <p>
              {copy("Order status", "آرڈر کی حالت")}:{" "}
              {(
                {
                  pending: copy("Pending", "زیر التوا"),
                  paid: copy("Paid", "ادا شدہ"),
                  confirmed: copy("Confirmed", "تصدیق شدہ"),
                  processing: copy("Processing", "تیاری جاری"),
                  shipped: copy("Shipped", "روانہ"),
                  delivered: copy("Delivered", "پہنچا دیا گیا"),
                  cancelled: copy("Cancelled", "منسوخ"),
                } as Record<string, string>
              )[trace.order.status] ?? copy("In progress", "جاری")}
            </p>
            <ul>
              {trace.order.items.map((item, index) => (
                <li key={`${item.productId}-${index}`}>
                  <Link href={`/trace/${item.productId}`}>
                    {item.productName}
                  </Link>{" "}
                  × {item.quantity} {item.unit}
                </li>
              ))}
            </ul>
            <div className="scan-divider" />
            <p>
              <strong>{t("trace.farm")}</strong>
              <br />
              {trace.farmer
                ? [
                    trace.farmer.farmName,
                    trace.farmer.city,
                    trace.farmer.province,
                  ]
                    .filter(Boolean)
                    .join(" · ")
                : t("trace.farmUnknown")}
            </p>
            <Link
              className="btn btn-outline"
              href={loginPathFor(`/orders/${trace.order.id}`)}
            >
              {copy("Private order details", "آرڈر کی نجی تفصیلات")}
            </Link>
          </div>
        </div>
      </aside>
      <section
        className="scan-timeline-container"
        aria-label={t("trace.journey")}
      >
        <h2 className="timeline-title">{t("trace.journey")}</h2>
        <p>
          {trace.summary.confirmedEvents} / {trace.summary.totalEvents}{" "}
          {copy("ledger records confirmed", "لیجر ریکارڈ کی تصدیق ہوئی")}
        </p>
        <p className="trace-check-note">
          {trace.summary.ledgerCheck === "checked"
            ? copy(
                "Independent ledger readback completed. Each event shows its result below.",
                "لیجر سے آزادانہ دوبارہ جانچ مکمل ہوئی۔ ہر واقعے کا نتیجہ نیچے ہے۔",
              )
            : copy(
                "Independent ledger readback is unavailable. Confirmation status alone does not establish independent verification.",
                "لیجر سے آزادانہ دوبارہ جانچ دستیاب نہیں۔ صرف تصدیقی حالت آزادانہ تصدیق ثابت نہیں کرتی۔",
              )}
        </p>
        {trace.events.length ? (
          <ol className="scan-timeline">
            {trace.events.map((event) => (
              <TraceEventItem
                key={event.id}
                event={event}
                formatDate={formatDate}
              />
            ))}
          </ol>
        ) : (
          <p>{t("trace.empty")}</p>
        )}
      </section>
    </div>
  );
}
