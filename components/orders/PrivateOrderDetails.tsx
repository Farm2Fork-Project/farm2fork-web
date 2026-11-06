"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { OrderQr } from "./OrderQr";
import { PortalGate } from "@/components/auth/PortalGate";
import { useLanguage } from "@/components/LanguageContext";
import { ApiClient } from "@/lib/api/client";
import { ApiError, type ApiOrder } from "@/lib/api/contracts";

export default function PrivateOrderDetails({ orderId }: { orderId: string }) {
  return (
    <PortalGate role={null}>
      {(user) => (
        <OrderContent key={`${user.id}:${orderId}`} orderId={orderId} />
      )}
    </PortalGate>
  );
}

function OrderContent({ orderId }: { orderId: string }) {
  const { language, t } = useLanguage();
  const copy = (en: string, ur: string) => (language === "ur" ? ur : en);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{ order?: ApiOrder; error?: number }>({});
  useEffect(() => {
    const controller = new AbortController();
    new ApiClient()
      .request<ApiOrder>(`/orders/${encodeURIComponent(orderId)}`, {
        signal: controller.signal,
      })
      .then((order) => {
        if (!controller.signal.aborted) setState({ order });
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setState({ error: error instanceof ApiError ? error.status : 0 });
      });
    return () => controller.abort();
  }, [orderId, attempt]);
  const money = (value: number) =>
    new Intl.NumberFormat(language === "ur" ? "ur-PK" : "en-PK", {
      style: "currency",
      currency: "PKR",
      maximumFractionDigits: 0,
    }).format(value);
  const order = state.order;
  if (!order) {
    if (state.error !== undefined)
      return (
        <div className="trace-page-state" role="alert">
          <h1>
            {state.error === 403
              ? copy(
                  "You do not have access to this order",
                  "آپ کو اس آرڈر تک رسائی حاصل نہیں",
                )
              : state.error === 404
                ? copy("Order not found", "آرڈر نہیں ملا")
                : copy("Could not load this order", "آرڈر لوڈ نہیں ہو سکا")}
          </h1>
          <p>
            {copy(
              "Use the account that placed or manages this order.",
              "وہ اکاؤنٹ استعمال کریں جس نے یہ آرڈر دیا یا جو اسے سنبھالتا ہے۔",
            )}
          </p>
          {state.error === 401 ? (
            <Link
              className="btn btn-primary"
              href={`/login?next=${encodeURIComponent(`/orders/${orderId}`)}`}
            >
              {copy("Sign in", "لاگ ان کریں")}
            </Link>
          ) : (
            <button
              className="btn btn-outline"
              onClick={() => {
                setState({});
                setAttempt((value) => value + 1);
              }}
            >
              {t("trace.retry")}
            </button>
          )}
        </div>
      );
    return (
      <div className="trace-page-state" role="status">
        <div className="app-spinner" />
        <p>{t("trace.loading")}</p>
      </div>
    );
  }
  const status = {
    pending: copy("Awaiting payment", "ادائیگی کا انتظار"),
    paid: copy("Paid", "ادا شدہ"),
    processing: copy("Preparing", "تیاری جاری"),
    shipped: copy("In transit", "راستے میں"),
    delivered: copy("Delivered", "ڈیلیور ہو گیا"),
    cancelled: copy("Cancelled", "منسوخ"),
  }[order.status];
  return (
    <div className="private-order-details">
      <header className="trace-page-intro">
        <p>{copy("Private order details", "آرڈر کی نجی تفصیلات")}</p>
        <h1>
          {copy("Order", "آرڈر")} <bdi>#{order.id.slice(-6).toUpperCase()}</bdi>
        </h1>
        <p>{status}</p>
      </header>
      <section
        className="scan-product-card"
        aria-label={copy("Order details", "آرڈر کی تفصیلات")}
      >
        <h2>{copy("Items", "اشیاء")}</h2>
        <ul>
          {order.items.map((item, index) => (
            <li key={`${item.productId}:${index}`}>
              <strong>{item.productName}</strong> ·{" "}
              <bdi>
                {item.quantity} {item.unit}
              </bdi>{" "}
              · <bdi>{money(item.subtotal)}</bdi>
            </li>
          ))}
        </ul>
        <dl>
          <dt>{copy("Subtotal", "ذیلی مجموعہ")}</dt>
          <dd>{money(order.totalAmount)}</dd>
          <dt>{copy("Platform fee", "پلیٹ فارم فیس")}</dt>
          <dd>{money(order.platformFeeAmount)}</dd>
          <dt>{copy("Delivery fee", "ڈیلیوری فیس")}</dt>
          <dd>{money(order.deliveryFee ?? 0)}</dd>
          <dt>
            <strong>{copy("Total", "کل رقم")}</strong>
          </dt>
          <dd>
            <strong>{money(order.grandTotal)}</strong>
          </dd>
        </dl>
        <h2>{copy("Delivery address", "ڈیلیوری کا پتہ")}</h2>
        <p>
          {[
            order.shippingAddress.street,
            order.shippingAddress.city,
            order.shippingAddress.province,
            order.shippingAddress.zip,
          ]
            .filter(Boolean)
            .join(", ")}
        </p>
        <div className="order-qr-actions">
          <OrderQr orderId={order.id} eligible={order.canViewQr === true} />
          {order.canViewQr === true ? (
            <Link
              href={`/trace/orders/${order.id}`}
              className="btn btn-outline"
            >
              {copy("View journey", "سفر دیکھیں")}
            </Link>
          ) : null}
          <Link href="/" className="btn btn-outline">
            {copy("Back to marketplace", "مارکیٹ میں واپس جائیں")}
          </Link>
        </div>
      </section>
    </div>
  );
}
