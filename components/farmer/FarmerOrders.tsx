"use client";

import React, { useState } from "react";
import { MapPin, Check, X } from "lucide-react";
import { useLanguage } from "./LanguageContext";

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  unit: string;
}

export interface Order {
  id: string;
  date: string;
  status: "Processing" | "Completed" | "Cancelled";
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  platformFee: number;
  grandTotal: number;
  address: string;
}

interface FarmerOrdersProps {
  orders: Order[];
  onCompleteOrder: (id: string) => void;
  onCancelOrder: (id: string) => void;
}

export default function FarmerOrders({
  orders,
  onCompleteOrder,
  onCancelOrder,
}: FarmerOrdersProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"Active" | "Completed">("Active");

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "Active") {
      return order.status === "Processing";
    } else {
      return order.status === "Completed" || order.status === "Cancelled";
    }
  });

  return (
    <div className="animate-in">
      {/* Page Header */}
      <div className="page-header mb-6">
        <h1>{t("farmer.orders.title")}</h1>
        <p>{t("farmer.orders.subtitle")}</p>
      </div>

      {/* Tabs Filter */}
      <div className="orders-tabs">
        <button
          className={`orders-tab ${activeTab === "Active" ? "active" : ""}`}
          onClick={() => setActiveTab("Active")}
        >
          {t("farmer.orders.tab.active")} ({orders.filter(o => o.status === "Processing").length})
        </button>
        <button
          className={`orders-tab ${activeTab === "Completed" ? "active" : ""}`}
          onClick={() => setActiveTab("Completed")}
        >
          {t("farmer.orders.tab.completed")} ({orders.filter(o => o.status !== "Processing").length})
        </button>
      </div>

      {/* Orders List */}
      <div className="orders-grid">
        {filteredOrders.length === 0 ? (
          <div className="card py-16 text-center">
            <h3 className="text-lg font-bold text-[var(--text-dark)]">{t("farmer.orders.noOrders")}</h3>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              {t("farmer.orders.noOrdersDesc").replace("{status}", activeTab === "Active" ? t("farmer.orders.tab.active").toLowerCase() : t("farmer.orders.tab.completed").toLowerCase())}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="order-card"
            >
              {/* Order Card Header */}
              <div className="order-card-header">
                <div>
                  <div className="order-card-id">
                    {t("farmer.orders.orderId").replace("{id}", order.id)}
                  </div>
                  <div className="order-card-date">
                    {t("farmer.orders.receivedDate").replace("{date}", order.date)}
                    <span style={{ margin: "0 8px" }}>•</span>
                    {t("farmer.orders.customer").replace("{name}", order.customerName)}
                  </div>
                </div>
                <span
                  className={`order-status ${
                    order.status === "Processing"
                      ? "processing"
                      : order.status === "Completed"
                      ? "completed"
                      : "cancelled"
                  }`}
                >
                  {order.status === "Processing"
                    ? t("orders.statusProcessing")
                    : order.status === "Completed"
                    ? t("orders.statusCompleted")
                    : t("orders.statusCancelled")}
                </span>
              </div>

              {/* Order Line Items */}
              <div className="order-items">
                {order.items.map((item, index) => {
                  let unitText = item.unit;
                  if (item.unit === "kg") unitText = t("unit.kg");
                  else if (item.unit === "dozen") unitText = t("unit.dozen");
                  else if (item.unit === "litre" || item.unit === "liter") unitText = t("unit.litre");

                  return (
                    <div key={index} className="order-item-row">
                      <div className="order-item-name">
                        {item.name}
                        <span className="order-item-qty">
                          x {item.quantity.toFixed(1)} {unitText}
                        </span>
                      </div>
                      <span className="order-item-price">
                        Rs {item.price * item.quantity}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Subtotal, fee, grand total */}
              <div className="order-totals">
                <div className="order-total-row">
                  <span>{t("farmer.orders.subtotal")}</span>
                  <span>Rs {order.subtotal}</span>
                </div>
                <div className="order-total-row">
                  <span>{t("farmer.orders.platformFee")}</span>
                  <span>Rs {order.platformFee}</span>
                </div>
                <div className="order-total-row grand">
                  <span>{t("farmer.orders.grandTotal")}</span>
                  <span>Rs {order.grandTotal}</span>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="order-location">
                <MapPin size={16} className="loc-icon" />
                <div>
                  <span className="loc-label">{t("farmer.orders.location")}</span>
                  <p style={{ marginTop: "4px" }}>{order.address}</p>
                </div>
              </div>

              {order.status === "Processing" && (
                <div style={{ display: "flex", gap: "12px", marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--surface-medium)" }}>
                  <button
                    className="btn btn-danger"
                    style={{ flex: 1, justifyContent: "center" }}
                    onClick={() => onCancelOrder(order.id)}
                  >
                    <X size={16} /> {t("farmer.orders.reject")}
                  </button>
                  <button
                    className="btn btn-success"
                    style={{ flex: 1, justifyContent: "center" }}
                    onClick={() => onCompleteOrder(order.id)}
                  >
                    <Check size={16} /> {t("farmer.orders.markCompleted")}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
