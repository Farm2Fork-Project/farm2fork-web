"use client";

import {
  LuBell,
  LuClipboardList,
  LuUser,
  LuLeaf,
  LuQrCode,
} from "react-icons/lu";
import { AppTab, TopBarProps } from "./types";
import { useLanguage } from "./LanguageContext";

export default function TopBar({ activeTab, setActiveTab }: TopBarProps) {
  const { t } = useLanguage();

  const links: { tab: AppTab; icon: React.ReactNode; label: string }[] = [
    { tab: "shipments", icon: <LuClipboardList size={18} />, label: t("tship.pageTitle") },
    { tab: "scan", icon: <LuQrCode size={18} />, label: t("topbar.trace") },
    { tab: "orders", icon: <LuClipboardList size={18} />, label: t("topbar.orders") },
    { tab: "profile", icon: <LuUser size={18} />, label: t("topbar.profile") },
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

        <div className="topbar-user">
          <div className="topbar-avatar" style={{ background: "linear-gradient(135deg, var(--primary-green), #14492a)" }}>T</div>
          <div className="topbar-user-info">
            <span className="topbar-user-name">Transporter</span>
            <span className="topbar-user-role">transporter@test.com</span>
          </div>
        </div>
      </div>
    </header>
  );
}
