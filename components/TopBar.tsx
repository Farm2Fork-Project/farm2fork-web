"use client";

import { useState, useRef, useEffect } from "react";

import {
  LuBell,
  LuLeaf,
  LuHouse,
  LuQrCode,
  LuShoppingCart,
  LuClipboardList,
  LuPackage,
  LuMessageSquare,
  LuTrendingDown,
} from "react-icons/lu";
import { AppTab, TopBarProps } from "./types";
import { useLanguage } from "./LanguageContext";

export default function TopBar({ activeTab, setActiveTab }: TopBarProps) {
  const { t } = useLanguage();
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotif(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const links: { tab: AppTab; icon: React.ReactNode; label: string }[] = [
    { tab: "marketplace", icon: <LuHouse size={17} />, label: t("topbar.marketplace") },
    { tab: "scan", icon: <LuQrCode size={17} />, label: t("topbar.trace") },
    { tab: "cart", icon: <LuShoppingCart size={17} />, label: t("topbar.cart") },
    { tab: "orders", icon: <LuClipboardList size={17} />, label: t("topbar.orders") },
  ];

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-logo" onClick={() => setActiveTab("marketplace")} style={{ cursor: "pointer" }}>
          <LuLeaf size={22} className="logo-icon" />
          <h2>{t("app.title")}</h2>
        </div>
      </div>

      <nav className="topbar-nav" aria-label="App navigation">
        {links.map((l) => (
          <a
            key={l.tab}
            href="#"
            className={`topbar-link${activeTab === l.tab ? " active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab(l.tab);
            }}
            id={`nav-${l.tab}`}
          >
            <span className="icon">{l.icon}</span>
            <span className="label">{l.label}</span>
          </a>
        ))}
      </nav>

      <div className="topbar-right">
        <div style={{ position: "relative" }} ref={notifRef}>
          <button 
            className="topbar-icon-btn" 
            aria-label="Notifications"
            onClick={() => setShowNotif(!showNotif)}
          >
            <LuBell size={19} />
            <span className="badge-dot" />
          </button>
          
          {showNotif && (
            <div style={{
              position: "absolute",
              top: "100%",
              right: 0,
              marginTop: "12px",
              backgroundColor: "var(--white)",
              border: "1px solid var(--border-color)",
              borderRadius: "12px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
              width: "360px",
              zIndex: 100,
              padding: "16px",
              color: "var(--text-main)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>Notifications</h4>
                <span style={{ fontSize: "13px", color: "var(--primary-green)", cursor: "pointer", fontWeight: 500 }}>Mark all as read</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxHeight: "350px", overflowY: "auto", margin: "0 -8px" }}>
                
                <div style={{ display: "flex", gap: "12px", padding: "12px 8px", borderRadius: "8px", background: "rgba(34, 197, 94, 0.05)", cursor: "pointer" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(34, 197, 94, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary-green)", flexShrink: 0 }}>
                    <LuPackage size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <strong style={{ fontSize: "14px", color: "var(--text-main)" }}>Order Shipped</strong>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--primary-green)", marginTop: "4px" }}></span>
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px", lineHeight: "1.4" }}>Your order #1024 from Hassan Organic Farm has been shipped and is on its way.</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px", fontWeight: 500 }}>2 hours ago</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px", padding: "12px 8px", borderRadius: "8px", cursor: "pointer" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(59, 130, 246, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#3b82f6", flexShrink: 0 }}>
                    <LuMessageSquare size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <strong style={{ fontSize: "14px", color: "var(--text-main)" }}>New Message</strong>
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px", lineHeight: "1.4" }}>Ali Hassan replied to your inquiry about Sindhri Mangoes quality.</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px", fontWeight: 500 }}>Yesterday</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px", padding: "12px 8px", borderRadius: "8px", cursor: "pointer" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(239, 68, 68, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444", flexShrink: 0 }}>
                    <LuTrendingDown size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <strong style={{ fontSize: "14px", color: "var(--text-main)" }}>Price Drop Alert</strong>
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px", lineHeight: "1.4" }}>Desi Onions are now 10% off for the next 24 hours. Grab them while stock lasts!</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px", fontWeight: 500 }}>2 days ago</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div 
          className={`topbar-user${activeTab === "profile" ? " active" : ""}`} 
          onClick={() => setActiveTab("profile")}
          style={{ cursor: "pointer" }}
          role="button"
          aria-label="User profile"
        >
          <div className="topbar-avatar">B</div>
          <div className="topbar-user-info">
            <span className="topbar-user-name">Buyer</span>
            <span className="topbar-user-role">buyer@test.com</span>
          </div>
        </div>
      </div>
    </header>
  );
}
