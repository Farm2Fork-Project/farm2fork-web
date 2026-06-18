"use client";

import {
  LuSearch,
  LuBell,
  LuShoppingCart,
  LuLeaf,
  LuHouse,
  LuQrCode,
  LuClipboardList,
  LuUser,
} from "react-icons/lu";
import { AppTab, TopBarProps } from "./types";
import { useLanguage } from "./LanguageContext";

export default function TopBar({ activeTab, setActiveTab }: TopBarProps) {
  const { t } = useLanguage();

  const links: { tab: AppTab; icon: React.ReactNode; label: string }[] = [
    { tab: "marketplace", icon: <LuHouse size={18} />, label: t("topbar.marketplace") },
    { tab: "scan", icon: <LuQrCode size={18} />, label: t("topbar.trace") },
    { tab: "cart", icon: <LuShoppingCart size={18} />, label: t("topbar.cart") },
    { tab: "orders", icon: <LuClipboardList size={18} />, label: t("topbar.orders") },
  ];

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-logo">
          <LuLeaf size={24} className="logo-icon" />
          <h2>{t("app.title")}</h2>
        </div>
      </div>

      <nav className="topbar-nav">
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
          <LuBell size={20} />
          <span className="badge-dot" />
        </button>

        <div 
          className="topbar-user" 
          onClick={() => setActiveTab("profile")}
          style={{ cursor: "pointer" }}
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
