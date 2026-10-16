"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  IcCrate,
  IcQr,
  IcReceipt,
  IcRefresh,
  IcStore,
} from "@/components/icons";
import { DeliveryTracking } from "@/components/orders/DeliveryTracking";
import { InlineConfirm } from "@/components/ui/InlineConfirm";
import type { ApiOrder, ApiPayment, ApiShipment } from "@/lib/api/contracts.ts";
import {
  orderBucket,
  orderStages,
  paymentStateLabel,
  paymentStateTone,
  type OrderBucket,
} from "@/lib/buyer/order-progress.ts";
import type { PaymentReturn } from "@/lib/buyer/payment-checkout.ts";
import { useBuyerCopy } from "@/lib/buyer/use-buyer-copy";
import type {
  FarmProfile,
  FarmRepository,
} from "@/lib/farm/farm-repository.ts";
import { orderStatusClass } from "@/lib/status.ts";
import { farmPlace } from "./farm-label";
import { OrderTimeline } from "./OrderTimeline";

const rupees = new Intl.NumberFormat("en-PK");

export type PaymentActions = {
  onCancelOrder?: (id: string) => Promise<void>;
  cancellingOrderId?: string | null;
  cancelErrors?: Record<string, string>;
  onContinuePayment: (orderId: string) => void;
  simulatorEnabled: boolean;
  checkoutLinks: Record<string, string>;
  paymentErrors: Record<string, string>;
  initiatingOrderId: string | null;
};

type Filter = "all" | OrderBucket;

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: "all", label: "All" },
  { id: "to_pay", label: "To pay" },
  { id: "in_progress", label: "In progress" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
];

/** Farm names for the farms behind a set of orders, looked up once each. */
function useFarms(
  farmRepository: Pick<FarmRepository, "getFarmProfile"> | undefined,
  farmerIds: string[],
): Record<string, FarmProfile | null> {
  const [farms, setFarms] = useState<Record<string, FarmProfile | null>>({});
  const key = farmerIds.join("|");

  useEffect(() => {
    if (!farmRepository) return;
    let cancelled = false;
    for (const id of key.split("|").filter(Boolean)) {
      farmRepository.getFarmProfile(id).then(
        (profile) => {
          if (!cancelled)
            setFarms((current) => ({ ...current, [id]: profile }));
        },
        () => {
          if (!cancelled) setFarms((current) => ({ ...current, [id]: null }));
        },
      );
    }
    return () => {
      cancelled = true;
    };
  }, [farmRepository, key]);

  return farms;
}

export function OrdersView({
  paymentsUnavailable,
  shipmentsUnavailable,
  loading,
  error,
  onRefresh,
  paymentReturn,
  onSimulatePayment,
  onBrowse,
  orders,
  payments,
  settlingPaymentId,
  shipments,
  farmRepository,
  ...paymentActions
}: PaymentActions & {
  error: string | null;
  paymentsUnavailable: boolean;
  shipmentsUnavailable: boolean;
  loading: boolean;
  onBrowse?: () => void;
  onRefresh: () => void;
  paymentReturn?: PaymentReturn;
  onSimulatePayment: (paymentId: string) => void;
  orders: ApiOrder[] | null;
  payments: ApiPayment[] | null;
  settlingPaymentId: string | null;
  shipments: ApiShipment[] | null;
  farmRepository?: Pick<FarmRepository, "getFarmProfile">;
}) {
  const copy = useBuyerCopy();
  const [filter, setFilter] = useState<Filter>("all");
  const farmerIds = useMemo(
    () => [
      ...new Set((orders ?? []).map((order) => order.farmerId).filter(Boolean)),
    ],
    [orders],
  );
  const farms = useFarms(farmRepository, farmerIds);

  const header = (
    <div className="page-header-row orders-header">
      <div className="page-header">
        <h1>{copy("Orders")}</h1>
        <p>
          {copy("Track payment and delivery for every order you have placed.")}
        </p>
      </div>
      <button
        className="btn btn-secondary ov-refresh"
        type="button"
        onClick={onRefresh}
        disabled={loading}
      >
        <IcRefresh size={18} />
        {loading ? copy("Refreshing…") : copy("Refresh payment status")}
      </button>
    </div>
  );

  if (!orders || !payments || !shipments)
    return (
      <section>
        {header}
        {error ? (
          <p role="alert">{error}</p>
        ) : (
          <div role="status" className="ov-loading">
            <span className="sr-only">
              {copy("Loading orders and payments…")}
            </span>
            <span className="ov-skel" aria-hidden="true" />
            <span className="ov-skel" aria-hidden="true" />
          </div>
        )}
      </section>
    );

  const shipmentsByOrder = new Map(
    shipments.map((shipment) => [shipment.orderId, shipment]),
  );
  const paymentFor = (order: ApiOrder) =>
    payments.find((candidate) => candidate.orderId === order.id);

  const newestFirst = [...orders].sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt) || 0,
  );
  const bucketOf = (order: ApiOrder) =>
    orderBucket(order, paymentFor(order), shipmentsByOrder.get(order.id));
  const counts = new Map<Filter, number>([["all", orders.length]]);
  for (const order of orders)
    counts.set(bucketOf(order), (counts.get(bucketOf(order)) ?? 0) + 1);
  const visible =
    filter === "all"
      ? newestFirst
      : newestFirst.filter((order) => bucketOf(order) === filter);

  return (
    <section>
      {header}
      {paymentReturn ? (
        <p role="status" className="orders-notice">
          {paymentReturn === "cancel"
            ? copy(
                "Checkout was closed. Your saved orders remain available below.",
              )
            : copy(
                "You returned from checkout. Payment status below comes from the server; confirmation may take a moment.",
              )}
        </p>
      ) : null}
      {error ? <p role="alert">{error}</p> : null}
      {orders.length === 0 ? (
        <div className="empty-state">
          <IcCrate size={56} />
          <h2>{copy("No orders yet")}</h2>
          <p>
            {copy(
              "Orders you place from the marketplace show up here with live payment and delivery status.",
            )}
          </p>
          {onBrowse ? (
            <button
              className="btn btn-primary"
              type="button"
              onClick={onBrowse}
            >
              {copy("Browse the marketplace")}
            </button>
          ) : null}
        </div>
      ) : (
        <>
          {orders.length > 1 ? (
            <div
              className="ov-filters"
              role="group"
              aria-label={copy("Filter orders")}
            >
              {FILTERS.filter(
                ({ id }) => id === "all" || (counts.get(id) ?? 0) > 0,
              ).map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={filter === id}
                  onClick={() => setFilter(id)}
                >
                  {copy(label)}
                  <b>{counts.get(id) ?? 0}</b>
                </button>
              ))}
            </div>
          ) : null}
          <div className="orders-grid">
            {visible.map((order) => (
              <OrderCard
                key={order.id}
                {...paymentActions}
                paymentsUnavailable={paymentsUnavailable}
                shipmentsUnavailable={shipmentsUnavailable}
                onSimulatePayment={onSimulatePayment}
                order={order}
                farm={farms[order.farmerId] ?? undefined}
                payment={paymentFor(order)}
                settlingPaymentId={settlingPaymentId}
                shipment={shipmentsByOrder.get(order.id)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function OrderCard({
  onCancelOrder,
  cancellingOrderId,
  cancelErrors,
  paymentsUnavailable,
  shipmentsUnavailable,
  onSimulatePayment,
  order,
  farm,
  payment,
  settlingPaymentId,
  shipment,
  onContinuePayment,
  simulatorEnabled,
  checkoutLinks,
  paymentErrors,
  initiatingOrderId,
}: PaymentActions & {
  onSimulatePayment: (paymentId: string) => void;
  paymentsUnavailable: boolean;
  shipmentsUnavailable: boolean;
  order: ApiOrder;
  farm: FarmProfile | undefined;
  payment: ApiPayment | undefined;
  settlingPaymentId: string | null;
  shipment: ApiShipment | undefined;
}) {
  const copy = useBuyerCopy();
  const stages = orderStages(order, payment, shipment);
  const paymentLabel = paymentsUnavailable
    ? "Status unavailable — refresh to retry"
    : paymentStateLabel(payment?.status);
  const place = farm ? farmPlace(farm) : "";
  const delivery = order.deliveryFee ?? 0;

  return (
    <article className="order-card ov-card">
      <div className="order-card-header">
        <div>
          <div className="order-card-id" title={order.id}>
            <IcReceipt size={18} />
            {copy("Order {id}", { id: `#${order.id.slice(-6).toUpperCase()}` })}
          </div>
          <div className="order-card-date">
            {new Date(order.createdAt).toLocaleDateString()}
          </div>
        </div>
        <span className={`order-status ${orderStatusClass(order.status)}`}>
          {copy(order.status)}
        </span>
      </div>

      {farm ? (
        <p className="ov-farm">
          <IcStore size={18} />
          <span>
            <strong>{farm.farmName}</strong>
            {place ? ` · ${place}` : ""}
          </span>
        </p>
      ) : null}

      <div className="order-items">
        {order.items.map((item) => (
          <div className="order-item-row ov-item" key={item.productId}>
            <span>
              {item.productName} × {item.quantity}
              <Link
                className="ov-trace"
                href={`/trace/${item.productId}`}
                aria-label={copy("See the journey of {name}", {
                  name: item.productName,
                })}
              >
                <IcQr size={16} />
                {copy("Journey")}
              </Link>
            </span>
            <span>{item.subtotal} PKR</span>
          </div>
        ))}
      </div>
      <div className="order-totals">
        {order.platformFeeAmount > 0 || delivery > 0 ? (
          <>
            <div className="order-total-row ov-fee">
              <span>{copy("Items")}</span>
              <span>{rupees.format(order.totalAmount)} PKR</span>
            </div>
            {order.platformFeeAmount > 0 ? (
              <div className="order-total-row ov-fee">
                <span>{copy("Service fee")}</span>
                <span>{rupees.format(order.platformFeeAmount)} PKR</span>
              </div>
            ) : null}
            {delivery > 0 ? (
              <div className="order-total-row ov-fee">
                <span>
                  {order.deliveryDistanceKm
                    ? copy("Delivery ({distance} km)", {
                        distance: order.deliveryDistanceKm,
                      })
                    : copy("Delivery")}
                </span>
                <span>{rupees.format(delivery)} PKR</span>
              </div>
            ) : null}
          </>
        ) : null}
        <div className="order-total-row grand">
          <span>{copy("Grand total")}</span>
          <span>{order.grandTotal} PKR</span>
        </div>
      </div>

      <OrderTimeline stages={stages} shipment={shipment} />

      {order.status === "cancelled" && !payment ? null : (
        <div
          className="order-payment ov-payment"
          data-status={payment?.status ?? "not initiated"}
        >
          <span>{copy("Payment")}</span>
          <span
            className="ov-pay-badge"
            data-tone={
              paymentsUnavailable ? "grey" : paymentStateTone(payment?.status)
            }
          >
            {copy(paymentLabel)}
          </span>
        </div>
      )}
      {simulatorEnabled &&
      payment?.status === "pending" &&
      payment.gateway !== "safepay" ? (
        <>
          <p className="ov-test-note">
            {copy("Test mode: this payment is simulated and no money moves.")}
          </p>
          <button
            className="cart-shop-btn"
            disabled={settlingPaymentId === payment.id}
            onClick={() => onSimulatePayment(payment.id)}
            type="button"
          >
            {settlingPaymentId === payment.id
              ? copy("Settling payment…")
              : copy("Simulate payment success")}
          </button>
        </>
      ) : null}
      {!paymentsUnavailable &&
      order.status === "pending" &&
      payment?.status !== "success" &&
      payment?.status !== "refunded" ? (
        <div className="order-actions">
          <button
            className="cart-shop-btn"
            type="button"
            disabled={initiatingOrderId !== null || Boolean(cancellingOrderId)}
            onClick={() => onContinuePayment(order.id)}
          >
            {initiatingOrderId === order.id
              ? copy("Preparing checkout…")
              : copy("Continue payment")}
          </button>
          {payment?.status === "pending" && checkoutLinks[order.id] ? (
            <a className="btn btn-primary" href={checkoutLinks[order.id]}>
              {copy("Open Safepay checkout")}
            </a>
          ) : null}
          {paymentErrors[order.id] ? (
            <p role="alert">{paymentErrors[order.id]}</p>
          ) : null}
        </div>
      ) : null}
      {order.canCancel && onCancelOrder ? (
        <div className="order-actions">
          <InlineConfirm
            label={copy("Cancel order")}
            prompt={copy("Cancel this unpaid order?")}
            confirmLabel={copy("Cancel order")}
            onConfirm={() => onCancelOrder(order.id)}
            busy={cancellingOrderId === order.id}
            disabled={Boolean(initiatingOrderId || cancellingOrderId)}
          />
        </div>
      ) : null}
      {cancelErrors?.[order.id] ? (
        <p role="alert">{cancelErrors[order.id]}</p>
      ) : null}
      <DeliveryTracking
        showDeliveryCode
        unavailable={shipmentsUnavailable}
        shipment={shipment}
        orderStatus={order.status}
        address={order.shippingAddress}
        showHistory={false}
      />
    </article>
  );
}
