"use client";

import type { ReactNode } from "react";
import {
  LuCircleCheckBig,
  LuCircleX,
  LuClock,
  LuCreditCard,
  LuHourglass,
  LuLock,
  LuMapPin,
  LuPackage,
  LuShieldAlert,
  LuShieldCheck,
  LuStore,
  LuTriangleAlert,
  LuTruck,
  LuUserCheck,
} from "react-icons/lu";
import { useLanguage } from "../LanguageContext";
import {
  type ProductTrace,
  type TraceEvent,
  type TraceEventType,
  type TraceLedgerStatus,
  shortenTxHash,
} from "@/lib/trace/trace-repository.ts";

type Role = "farmer" | "buyer" | "transporter";

const EVENT_META: Record<TraceEventType, { icon: ReactNode; role: Role }> = {
  listed: { icon: <LuStore size={16} />, role: "farmer" },
  payment_confirmed: { icon: <LuCreditCard size={16} />, role: "buyer" },
  shipment_assigned: { icon: <LuUserCheck size={16} />, role: "transporter" },
  shipment_picked_up: { icon: <LuPackage size={16} />, role: "transporter" },
  shipment_in_transit: { icon: <LuTruck size={16} />, role: "transporter" },
  shipment_delivered: { icon: <LuCircleCheckBig size={16} />, role: "transporter" },
  shipment_failed: { icon: <LuCircleX size={16} />, role: "transporter" },
};

/** Replaces `{name}` placeholders in a translated template. */
function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

/**
 * Renders a product's public provenance: the listing and its farm, the
 * ledger-verification state of its origin, and every supply-chain event with
 * its own Hyperledger Fabric proof. Pending/failed ledger states are shown as
 * exactly that, never as verified.
 */
export default function TraceJourney({ trace }: { trace: ProductTrace }) {
  const { t, language } = useLanguage();
  const dateFormat = new Intl.DateTimeFormat(language === "ur" ? "ur-PK" : "en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const formatDate = (iso: string) => dateFormat.format(new Date(iso));

  const { product, farmer, events, summary } = trace;
  const listedEvent = events.find((event) => event.type === "listed");
  const origin: "verified" | "pending" | "missing" = summary.originVerified
    ? "verified"
    : listedEvent
      ? "pending"
      : "missing";
  const farmPlace = [farmer?.city, farmer?.province].filter(Boolean).join(", ");

  return (
    <div className="scan-results-container">
      <aside className="scan-product-sidebar">
        <div className="scan-product-card">
          <div className={`trace-origin trace-origin--${origin}`} role="status">
            <span className="trace-origin-icon" aria-hidden="true">
              {origin === "verified" ? (
                <LuShieldCheck size={22} />
              ) : origin === "pending" ? (
                <LuHourglass size={22} />
              ) : (
                <LuShieldAlert size={22} />
              )}
            </span>
            <div>
              <strong>{t(`trace.origin.${origin}`)}</strong>
              <p>{t(`trace.origin.${origin}Desc`)}</p>
            </div>
          </div>

          {product.imageUrl ? (
            // Product images are arbitrary external URLs from the listing.
            // eslint-disable-next-line @next/next/no-img-element
            <img className="trace-product-image" src={product.imageUrl} alt="" />
          ) : null}

          <div className="scan-product-info">
            <h2>{product.name}</h2>
            <p className="scan-product-status">
              {t(`trace.status.${product.status}`)}
            </p>

            <div className="scan-divider" />

            <div className="scan-detail-row">
              <span className="detail-label">{t("trace.farm")}</span>
              <span className="detail-value">
                {farmer ? (
                  <>
                    {farmer.farmName}
                    {farmPlace ? <span className="trace-muted"> · {farmPlace}</span> : null}
                  </>
                ) : (
                  <span className="trace-muted">{t("trace.farmUnknown")}</span>
                )}
              </span>
            </div>
            <div className="scan-detail-row">
              <span className="detail-label">{t("trace.grade")}</span>
              <span className="detail-value">
                {product.qualityGrade
                  ? fill(t("trace.gradeValue"), { grade: product.qualityGrade })
                  : t("trace.gradeNone")}
              </span>
            </div>
            <div className="scan-detail-row">
              <span className="detail-label">{t("trace.listedOn")}</span>
              <span className="detail-value">{formatDate(product.listedAt)}</span>
            </div>
            <div className="scan-detail-row">
              <span className="detail-label">{t("trace.productId")}</span>
              <span className="detail-value trace-mono" dir="ltr">
                {product.id}
              </span>
            </div>
          </div>
        </div>
      </aside>

      <section className="scan-timeline-container" aria-labelledby="trace-journey-title">
        <div className="trace-journey-head">
          <h3 id="trace-journey-title" className="timeline-title">
            {t("trace.journey")}
          </h3>
          {summary.totalEvents > 0 ? (
            <span className="trace-progress">
              {fill(t("trace.ledgerProgress"), {
                confirmed: summary.confirmedEvents,
                total: summary.totalEvents,
              })}
            </span>
          ) : null}
        </div>

        {events.length === 0 ? (
          <p className="trace-empty">{t("trace.empty")}</p>
        ) : (
          <ol className="scan-timeline">
            {events.map((event) => (
              <TraceEventItem key={event.id} event={event} formatDate={formatDate} />
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

function TraceEventItem({
  event,
  formatDate,
}: {
  event: TraceEvent;
  formatDate: (iso: string) => string;
}) {
  const { t } = useLanguage();
  const meta = EVENT_META[event.type];
  const failedEvent = event.type === "shipment_failed";
  const referenceKey =
    event.type === "payment_confirmed" ? "trace.reference.sale" : "trace.reference.delivery";

  return (
    <li className="scan-tl-item">
      <div
        className={`scan-tl-dot ${
          event.ledger.status === "confirmed" && !failedEvent ? "active" : ""
        } ${failedEvent ? "trace-dot--failed" : ""}`}
        aria-hidden="true"
      >
        {meta.icon}
      </div>
      <div className="scan-tl-card">
        <div className="scan-tl-card-header">
          <div>
            <h3>{t(`trace.event.${event.type}`)}</h3>
            <div className="trace-event-time">
              <LuClock size={13} aria-hidden="true" />
              <time dateTime={event.occurredAt}>{formatDate(event.occurredAt)}</time>
            </div>
          </div>
          <span className={`tl-role-badge ${meta.role}`}>{t(`trace.role.${meta.role}`)}</span>
        </div>

        {event.location || event.reference ? (
          <div className="tl-location">
            {event.location ? (
              <>
                <LuMapPin size={14} aria-hidden="true" /> {event.location}
              </>
            ) : null}
            {event.location && event.reference ? <span aria-hidden="true">·</span> : null}
            {event.reference ? (
              <span dir="ltr">{fill(t(referenceKey), { ref: event.reference })}</span>
            ) : null}
          </div>
        ) : null}

        <LedgerProof status={event.ledger.status} ledger={event.ledger} />
      </div>
    </li>
  );
}

function LedgerProof({
  status,
  ledger,
}: {
  status: TraceLedgerStatus;
  ledger: TraceEvent["ledger"];
}) {
  const { t } = useLanguage();

  if (status === "confirmed") {
    return (
      <div className="tl-hash" title={ledger.txHash}>
        <LuLock size={12} className="lock-icon" aria-hidden="true" />
        <span>{t("trace.ledger.confirmed")}</span>
        {ledger.txHash ? (
          <code dir="ltr">{shortenTxHash(ledger.txHash)}</code>
        ) : null}
        {ledger.blockNumber !== undefined ? (
          <span>{fill(t("trace.ledger.block"), { block: ledger.blockNumber })}</span>
        ) : null}
      </div>
    );
  }

  return (
    <div className={`tl-hash trace-ledger--${status}`}>
      {status === "pending" ? (
        <LuHourglass size={12} aria-hidden="true" />
      ) : (
        <LuTriangleAlert size={12} aria-hidden="true" />
      )}
      <span>{t(`trace.ledger.${status}`)}</span>
    </div>
  );
}
