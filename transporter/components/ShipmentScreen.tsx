"use client";

import { useState } from "react";
import { LuStore, LuMapPin, LuSearch, LuChevronRight, LuTruck } from "react-icons/lu";
import { useLanguage } from "./LanguageContext";

const initialShipments = [
  {
    id: "ship_3001",
    date: "3/6/2026",
    status: "assigned",
    pickup: "Hassan Organic Farm, Multan Road, Multan",
    destination: "Building 14B, Gulberg III, Lahore",
    assignedTime: "11:44"
  },
  {
    id: "ship_3002",
    date: "2/6/2026",
    status: "delivered",
    pickup: "Sindh Mango Estate, VIP Road, Hyderabad",
    destination: "Building 14B, Gulberg III, Lahore",
    assignedTime: "15:44",
    deliveredTime: "19:30"
  }
];

export default function ShipmentScreen() {
  const [tab, setTab] = useState<"assigned" | "in-transit" | "delivered">("assigned");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [shipments, setShipments] = useState(initialShipments);
  const { t } = useLanguage();

  const handleAction = (id: string, currentStatus: string) => {
    setShipments(prev => prev.map(s => {
      if (s.id === id) {
        if (currentStatus === "assigned") {
          return { ...s, status: "in-transit" };
        } else if (currentStatus === "in-transit") {
          const now = new Date();
          const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
          return { ...s, status: "delivered", deliveredTime: timeStr };
        }
      }
      return s;
    }));
  };

  const filteredShipments = shipments.filter((shipment) => {
    const matchesTab = shipment.status === tab;
    const matchesSearch = 
      shipment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.pickup.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.destination.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = dateFilter === "all" || shipment.date === dateFilter;

    return matchesTab && matchesSearch && matchesDate;
  });

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <div className="page-header" style={{ marginBottom: "32px" }}>
        <div className="page-header-row" style={{ alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "28px", display: "flex", alignItems: "center", gap: "12px", margin: 0 }}>
              <LuTruck color="var(--primary-green)" /> {t("tship.pageTitle")}
            </h1>
            <p style={{ marginTop: "4px" }}>{t("tship.pageSubtitle")}</p>
          </div>

          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <div className="marketplace-search" style={{ margin: 0, width: "320px" }}>
              <input 
                type="text" 
                placeholder="Search by ID, Location..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <LuSearch size={20} className="search-icon" />
            </div>
            <select 
              className="select" 
              value={dateFilter} 
              onChange={(e) => setDateFilter(e.target.value)}
              style={{ height: "46px", borderRadius: "var(--radius-xl)" }}
            >
              <option value="all">All Dates</option>
              <option value="3/6/2026">3/6/2026</option>
              <option value="2/6/2026">2/6/2026</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "16px", marginBottom: "24px", borderBottom: "1px solid var(--surface-medium)", paddingBottom: "16px" }}>
        <button 
          className={`btn ${tab === "assigned" ? "btn-primary" : "btn-outline"}`} 
          onClick={() => setTab("assigned")}
          style={{ borderRadius: "var(--radius-pill)" }}
        >
          {t("tship.assignedTab")}
        </button>
        <button 
          className={`btn ${tab === "in-transit" ? "btn-primary" : "btn-outline"}`} 
          onClick={() => setTab("in-transit")}
          style={{ borderRadius: "var(--radius-pill)" }}
        >
          {t("tship.inTransitTab")}
        </button>
        <button 
          className={`btn ${tab === "delivered" ? "btn-primary" : "btn-outline"}`} 
          onClick={() => setTab("delivered")}
          style={{ borderRadius: "var(--radius-pill)" }}
        >
          {t("tship.deliveredTab")}
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
        {filteredShipments.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t("tship.shipmentId")}</th>
                  <th>Date</th>
                  <th>Route Details</th>
                  <th>Status & Time</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredShipments.map((shipment) => (
                  <tr key={shipment.id}>
                    <td style={{ fontWeight: 600, color: "var(--primary-green-dark)" }}>
                      {shipment.id}
                    </td>
                    <td>
                      <span style={{ fontWeight: 500 }}>{shipment.date}</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
                          <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "var(--surface-medium)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <LuStore size={14} color="var(--primary-green)" />
                          </div>
                          <span style={{ fontWeight: 600, color: "var(--text-dark)" }}>{shipment.pickup}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
                          <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "var(--surface-medium)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <LuMapPin size={14} color="var(--error-red)" />
                          </div>
                          <span style={{ fontWeight: 600, color: "var(--text-dark)" }}>{shipment.destination}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-start" }}>
                        <span className={`badge ${shipment.status === "assigned" ? "badge-soft-yellow" : shipment.status === "in-transit" ? "badge-soft-blue" : "badge-soft-green"}`}>
                          {shipment.status === "assigned" ? t("tship.assigned") : shipment.status === "in-transit" ? t("tship.inTransit") : t("tship.delivered")}
                        </span>
                        <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                          {shipment.status === "assigned" || shipment.status === "in-transit" ? shipment.assignedTime : shipment.deliveredTime}
                        </span>
                      </div>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {shipment.status === "assigned" ? (
                        <button className="btn btn-primary" style={{ padding: "8px 20px" }} onClick={() => handleAction(shipment.id, shipment.status)}>
                          {t("tship.confirmPickUp")}
                        </button>
                      ) : shipment.status === "in-transit" ? (
                        <button className="btn btn-primary" style={{ padding: "8px 20px" }} onClick={() => handleAction(shipment.id, shipment.status)}>
                          {t("tship.markDelivered")}
                        </button>
                      ) : (
                        <button className="btn btn-outline" style={{ padding: "8px 16px" }}>
                          {t("tship.viewDetails")} <LuChevronRight />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--text-muted)" }}>
            <LuSearch size={48} color="var(--surface-strong)" style={{ marginBottom: "16px" }} />
            <h3 style={{ fontSize: "18px", color: "var(--text-dark)", marginBottom: "8px", fontWeight: 700 }}>No shipments found</h3>
            <p>We couldn't find any shipments matching your current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
