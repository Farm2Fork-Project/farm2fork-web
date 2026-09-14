"use client";

import { useState } from "react";
import {
  LuArrowLeft,
  LuMapPin,
  LuLock,
  LuTruck,
  LuCircleCheckBig,
  LuCreditCard,
  LuStore,
  LuInfo,
} from "react-icons/lu";
import { useLanguage } from "./LanguageContext";

// Live traceability isn't wired to a backend yet (see PROGRESS.md); this ID
// is the only query that returns the example journey below, so the screen
// is honest about not being a real lookup instead of faking one for anything typed in.
const DEMO_PRODUCT_ID = "DEMO-1001";

export default function ScanScreen() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState<string | null>(null);
  const { t } = useLanguage();

  const found =
    submittedQuery !== null &&
    submittedQuery.trim().toLowerCase() === DEMO_PRODUCT_ID.toLowerCase();
  const notFound = submittedQuery !== null && !found;

  if (!found) {
    return (
      <>
        <div className="qr-scanner-area">
          <div style={{ display: "flex", gap: "12px", width: "100%", maxWidth: "480px" }}>
            <input
              type="text"
              id="searchById"
              placeholder={t("scan.placeholder")}
              className="auth-input"
              style={{ flex: 1, marginBottom: 0 }}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setSubmittedQuery(query);
              }}
            />
            <button
              className="qr-simulate-btn"
              onClick={() => setSubmittedQuery(query)}
            >
              {t("scan.searchBtn")}
            </button>
          </div>
          {notFound ? (
            <p className="qr-description" style={{ display: "flex", alignItems: "flex-start", gap: "8px", textAlign: "left" }}>
              <LuInfo size={24} style={{ flexShrink: 0, marginTop: "2px", color: "var(--error-red)" }} />
              <span>
                <strong style={{ display: "block" }}>
                  {t("scan.notFoundTitle").replace("{query}", submittedQuery ?? "")}
                </strong>
                {t("scan.notFoundDesc").replace("{demoId}", DEMO_PRODUCT_ID)}
              </span>
            </p>
          ) : (
            <p className="qr-description" style={{ display: "flex", alignItems: "center", gap: "8px", textAlign: "left" }}>
              <LuInfo size={24} style={{ flexShrink: 0, color: "var(--primary-green)" }} />
              <span>{t("scan.tryDemo").replace("{demoId}", DEMO_PRODUCT_ID)}</span>
            </p>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <button className="pd-back-btn" onClick={() => setSubmittedQuery(null)}>
        <LuArrowLeft size={18} /> {t("scan.back")}
      </button>

      <div className="scan-header">
        <h1>{t("scan.traceTitle")}</h1>
      </div>

      <div className="scan-product-banner">
        <div className="verified-icon">
          <LuCircleCheckBig size={24} />
        </div>
        <div>
          <h2>{t("product.title")}</h2>
          <p>{t("scan.verified")}</p>
        </div>
      </div>

      <div className="scan-timeline">
        {/* Product Listing */}
        <div className="scan-tl-item" style={{ animationDelay: "0.1s" }}>
          <div className="scan-tl-dot active">
            <LuStore size={16} />
          </div>
          <div className="scan-tl-card">
            <div className="scan-tl-card-header">
              <h3>{t("scanResult.event1")}</h3>
              <span className="tl-role-badge farmer">{t("scanResult.role1")}</span>
            </div>
            <div className="tl-location">
              <LuMapPin size={14} /> Multan, Punjab (Hassan Organic Farm)
            </div>
            <p className="tl-desc">
              Crops listed on marketplace. Quality grade: A. Initial batch size: 200 kg.
            </p>
            <div className="tl-hash">
              <LuLock size={12} className="lock-icon" />
              tx_fabric_f2f_819ab0d2b99210cfa0981…
            </div>
          </div>
        </div>

        {/* Payment Confirmed */}
        <div className="scan-tl-item" style={{ animationDelay: "0.2s" }}>
          <div className="scan-tl-dot active">
            <LuCreditCard size={16} />
          </div>
          <div className="scan-tl-card">
            <div className="scan-tl-card-header">
              <h3>{t("scanResult.event2")}</h3>
              <span className="tl-role-badge buyer">{t("scanResult.role2")}</span>
            </div>
            <div className="tl-location">
              <LuMapPin size={14} /> Lahore, Punjab (JazzCash Gateway)
            </div>
            <p className="tl-desc">
              Payment of Rs 1,680 confirmed. Platform fee of 5% collected
              successfully.
            </p>
            <div className="tl-hash">
              <LuLock size={12} className="lock-icon" />
              tx_fabric_f2f_a119c4d92ee88a912bb09…
            </div>
          </div>
        </div>

        {/* Shipment Dispatch */}
        <div className="scan-tl-item" style={{ animationDelay: "0.3s" }}>
          <div className="scan-tl-dot active">
            <LuTruck size={16} />
          </div>
          <div className="scan-tl-card">
            <div className="scan-tl-card-header">
              <h3>{t("scanResult.event3")}</h3>
              <span className="tl-role-badge transporter">{t("scanResult.role3")}</span>
            </div>
            <div className="tl-location">
              <LuMapPin size={14} /> Multan, Punjab (Hassan Organic Farm)
            </div>
            <p className="tl-desc">
              Shipment loaded successfully. License number: LHR-2026-DESI.
            </p>
            <div className="tl-hash">
              <LuLock size={12} className="lock-icon" />
              tx_fabric_f2f_c0199ddb2ee90e11ba099…
            </div>
          </div>
        </div>

        {/* Delivery Completed */}
        <div className="scan-tl-item" style={{ animationDelay: "0.4s" }}>
          <div className="scan-tl-dot active">
            <LuCircleCheckBig size={16} />
          </div>
          <div className="scan-tl-card">
            <div className="scan-tl-card-header">
              <h3>{t("scanResult.event4")}</h3>
              <span className="tl-role-badge transporter">{t("scanResult.role3")}</span>
            </div>
            <div className="tl-location">
              <LuMapPin size={14} /> Lahore, Punjab (Gulberg III Warehouse)
            </div>
            <p className="tl-desc">
              Produce hand-delivered to buyer. Quality check at delivery
              verified: Fresh.
            </p>
            <div className="tl-hash">
              <LuLock size={12} className="lock-icon" />
              tx_fabric_f2f_d991bce98c21a00a12bb7…
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
