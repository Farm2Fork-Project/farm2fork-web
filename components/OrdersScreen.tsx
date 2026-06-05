"use client";

import { useState } from "react";
import {
  LuClipboardList,
  LuMapPin,
} from "react-icons/lu";
import { useLanguage } from "./LanguageContext";

export default function OrdersScreen() {
  const [orderTab, setOrderTab] = useState<"active" | "completed">("active");
  const { t } = useLanguage();

  return (
    <>


      <div className="orders-tabs">
        <button
          className={`orders-tab${orderTab === "active" ? " active" : ""}`}
          onClick={() => setOrderTab("active")}
        >
          {t("orders.active")}
        </button>
        <button
          className={`orders-tab${orderTab === "completed" ? " active" : ""}`}
          onClick={() => setOrderTab("completed")}
        >
          {t("orders.completed")}
        </button>
      </div>

      {orderTab === "active" ? (
        <div className="order-card" id="order-1001">
          <div className="order-card-header">
            <div>
              <div className="order-card-id">{t("orders.orderIdPrefix")}ord_1001</div>
              <div className="order-card-date">3/6/2026</div>
            </div>
            <span className="order-status processing">{t("orders.statusProcessing")}</span>
          </div>

          <div className="order-items">
            <div className="order-item-row">
              <div>
                <span className="order-item-name">Organic Tomatoes</span>
                <span className="order-item-qty"> x 10.0 kg</span>
              </div>
              <span className="order-item-price">Rs 1200</span>
            </div>
            <div className="order-item-row">
              <div>
                <span className="order-item-name">Fresh Spinach</span>
                <span className="order-item-qty"> x 5.0 kg</span>
              </div>
              <span className="order-item-price">Rs 400</span>
            </div>
          </div>

          <div className="order-totals">
            <div className="order-total-row">
              <span>{t("cart.subtotal")}</span>
              <span>Rs 1600</span>
            </div>
            <div className="order-total-row">
              <span>{t("orders.platformFee")}</span>
              <span>Rs 80</span>
            </div>
            <div className="order-total-row grand">
              <span>{t("orders.grandTotal")}</span>
              <span>Rs 1680</span>
            </div>
          </div>

          <div className="order-location">
            <LuMapPin size={16} className="loc-icon" />
            <div>
              <span className="loc-label">{t("orders.locationLabel")}</span>
              Building 14B, Gulberg III, Lahore, Punjab
            </div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
          <LuClipboardList size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p>{t("orders.noCompleted")}</p>
        </div>
      )}
    </>
  );
}
