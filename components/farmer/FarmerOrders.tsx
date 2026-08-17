"use client";

import { useState } from "react";
import type { ApiOrder } from "@/lib/api/contracts.ts";
import { useLanguage } from "./LanguageContext";

type OrderTab = "active" | "completed";

export default function FarmerOrders({ orders }: { orders: ApiOrder[] }) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<OrderTab>("active");
  const visibleOrders = orders.filter((order) =>
    activeTab === "active"
      ? !["delivered", "cancelled"].includes(order.status)
      : ["delivered", "cancelled"].includes(order.status),
  );

  return (
    <div className="animate-in">
      <div className="page-header mb-6">
        <h1>{t("farmer.orders.title")}</h1>
        <p>{t("farmer.orders.subtitle")}</p>
      </div>

      <div className="orders-tabs">
        <button
          className={`orders-tab ${activeTab === "active" ? "active" : ""}`}
          onClick={() => setActiveTab("active")}
          type="button"
        >
          {t("farmer.orders.tab.active")} ({orders.filter((order) => !["delivered", "cancelled"].includes(order.status)).length})
        </button>
        <button
          className={`orders-tab ${activeTab === "completed" ? "active" : ""}`}
          onClick={() => setActiveTab("completed")}
          type="button"
        >
          {t("farmer.orders.tab.completed")} ({orders.filter((order) => ["delivered", "cancelled"].includes(order.status)).length})
        </button>
      </div>

      <div className="orders-grid">
        {visibleOrders.length === 0 ? (
          <div className="card py-16 text-center">
            <h3 className="text-lg font-bold text-[var(--text-dark)]">
              {t("farmer.orders.noOrders")}
            </h3>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              {t("farmer.orders.noOrdersDesc").replace(
                "{status}",
                activeTab === "active"
                  ? t("farmer.orders.tab.active").toLowerCase()
                  : t("farmer.orders.tab.completed").toLowerCase(),
              )}
            </p>
          </div>
        ) : (
          visibleOrders.map((order) => <FarmerOrderCard key={order.id} order={order} />)
        )}
      </div>
    </div>
  );
}

function FarmerOrderCard({ order }: { order: ApiOrder }) {
  const { t } = useLanguage();

  return (
    <article className="order-card">
      <div className="order-card-header">
        <div>
          <div className="order-card-id">
            {t("farmer.orders.orderId").replace("{id}", order.id)}
          </div>
          <div className="order-card-date">
            {t("farmer.orders.receivedDate").replace(
              "{date}",
              new Date(order.createdAt).toLocaleDateString(),
            )}
          </div>
        </div>
        <span className="order-status processing">{order.status}</span>
      </div>

      <div className="order-items">
        {order.items.map((item) => (
          <div className="order-item-row" key={item.productId}>
            <div className="order-item-name">
              {item.productName}
              <span className="order-item-qty"> x {item.quantity}</span>
            </div>
            <span className="order-item-price">Rs {item.subtotal}</span>
          </div>
        ))}
      </div>

      <div className="order-totals">
        <div className="order-total-row">
          <span>{t("farmer.orders.subtotal")}</span>
          <span>Rs {order.totalAmount}</span>
        </div>
        <div className="order-total-row">
          <span>{t("farmer.orders.platformFee")}</span>
          <span>Rs {order.platformFeeAmount}</span>
        </div>
        <div className="order-total-row grand">
          <span>{t("farmer.orders.grandTotal")}</span>
          <span>Rs {order.grandTotal}</span>
        </div>
      </div>
    </article>
  );
}
