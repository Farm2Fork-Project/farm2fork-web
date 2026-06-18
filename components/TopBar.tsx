"use client";

import {
  LuBell,
  LuLeaf,
  LuHouse,
  LuQrCode,
  LuShoppingCart,
  LuClipboardList,
} from "react-icons/lu";
import { AppTab, TopBarProps } from "./types";
import { useLanguage } from "./LanguageContext";

export default function TopBar({ activeTab, setActiveTab }: TopBarProps) {
  const { t } = useLanguage();

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
        <button className="topbar-icon-btn" aria-label="Notifications">
          <LuBell size={19} />
          <span className="badge-dot" />
        </button>

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
