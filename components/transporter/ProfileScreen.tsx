"use client";

import { useState } from "react";
import {
  LuShoppingCart,
  LuBell,
  LuGlobe,
  LuMessageSquare,
  LuCircleHelp,
  LuInfo,
  LuShield,
  LuFileText,
  LuLogOut,
  LuToggleRight,
  LuToggleLeft,
  LuChevronRight,
  LuTriangleAlert,
  LuLeaf
} from "react-icons/lu";

import { ProfileScreenProps } from "./types";
import { useLanguage, Language } from "./LanguageContext";

export default function ProfileScreen({ onLogout }: ProfileScreenProps) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [activeTab, setActiveTab] = useState("notifications");
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { t, language, setLanguage, fontSize, setFontSize } = useLanguage();

  const renderContent = () => {
    switch (activeTab) {
      case "notifications":
        return (
          <div className="profile-tab-content animation-fade-in">
            <h2>{t("settings.notif.title")}</h2>
            <p className="profile-tab-subtitle">{t("settings.notif.subtitle")}</p>

            <div className="settings-list">
              <div className="setting-item" onClick={() => setEmailNotif(!emailNotif)} style={{ cursor: "pointer" }}>
                <div className="setting-info">
                  <h3>{t("settings.notif.email")}</h3>
                  <p>{t("settings.notif.emailDesc")}</p>
                </div>
                <div className="setting-toggle">
                  {emailNotif ? <LuToggleRight size={28} color="var(--primary-green)" /> : <LuToggleLeft size={28} color="var(--primary-green)" />}
                </div>
              </div>
              <div className="setting-item" onClick={() => setPushNotif(!pushNotif)} style={{ cursor: "pointer" }}>
                <div className="setting-info">
                  <h3>{t("settings.notif.push")}</h3>
                  <p>{t("settings.notif.pushDesc")}</p>
                </div>
                <div className="setting-toggle">
                  {pushNotif ? <LuToggleRight size={28} color="var(--primary-green)" /> : <LuToggleLeft size={28} color="var(--primary-green)" />}
                </div>
              </div>
              <div className="setting-item" onClick={() => setSmsNotif(!smsNotif)} style={{ cursor: "pointer" }}>
                <div className="setting-info">
                  <h3>{t("settings.notif.sms")}</h3>
                  <p>{t("settings.notif.smsDesc")}</p>
                </div>
                <div className="setting-toggle">
                  {smsNotif ? <LuToggleRight size={28} color="var(--primary-green)" /> : <LuToggleLeft size={28} color="var(--primary-green)" />}
                </div>
              </div>
            </div>

            <button className="settings-save-btn">{t("settings.save")}</button>
          </div>
        );
      case "language":
        return (
          <div className="profile-tab-content animation-fade-in">
            <h2>{t("settings.lang.title")}</h2>
            <p className="profile-tab-subtitle">{t("settings.lang.subtitle")}</p>

            <div className="settings-list">
              <div className="setting-item" onClick={() => setLanguage(language === "en" ? "ur" : "en")} style={{ cursor: "pointer" }}>
                <div className="setting-info">
                  <h3>{t("settings.lang.language")}</h3>
                  <p>{t("settings.lang.languageDesc")}</p>
                </div>
                <div className="setting-action">
                  {language === "en" ? "English (US)" : "اردو"} <LuChevronRight size={16} />
                </div>
              </div>
              <div className="setting-item" onClick={() => {
                const nextSize = fontSize === "small" ? "medium" : fontSize === "medium" ? "large" : "small";
                setFontSize(nextSize);
              }} style={{ cursor: "pointer" }}>
                <div className="setting-info">
                  <h3>{t("settings.lang.fontsize")}</h3>
                  <p>{t("settings.lang.fontsizeDesc")}</p>
                </div>
                <div className="setting-action">
                  {fontSize === "small" ? t("settings.lang.fontSmall") : fontSize === "medium" ? t("settings.lang.fontMedium") : t("settings.lang.fontLarge")} <LuChevronRight size={16} />
                </div>
              </div>
              <div className="setting-item" onClick={() => setDarkMode(!darkMode)} style={{ cursor: "pointer" }}>
                <div className="setting-info">
                  <h3>{t("settings.lang.darkmode")}</h3>
                  <p>{t("settings.lang.darkmodeDesc")}</p>
                </div>
                <div className="setting-toggle">
                  {darkMode ? <LuToggleRight size={28} color="var(--primary-green)" /> : <LuToggleLeft size={28} color="var(--primary-green)" />}
                </div>
              </div>
            </div>
          </div>
        );
      case "contact":
        return (
          <div className="profile-tab-content animation-fade-in">
            <h2>{t("settings.contact.title")}</h2>
            <p className="profile-tab-subtitle">{t("settings.contact.subtitle")}</p>

            <form className="contact-form" style={{ display: "flex", flexDirection: "column", gap: "var(--sp-lg)", maxWidth: "500px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "var(--sp-xs)", fontSize: "14px", fontWeight: 600 }}>{t("settings.contact.subject")}</label>
                <input type="text" className="input" placeholder={t("settings.contact.subjectPlaceholder")} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "var(--sp-xs)", fontSize: "14px", fontWeight: 600 }}>{t("settings.contact.message")}</label>
                <textarea className="input" rows={5} placeholder={t("settings.contact.messagePlaceholder")}></textarea>
              </div>
              <button type="button" className="settings-save-btn" style={{ width: "fit-content" }}>{t("settings.contact.send")}</button>
            </form>
          </div>
        );
      case "faqs":
        return (
          <div className="profile-tab-content animation-fade-in">
            <h2>{t("settings.faqs.title")}</h2>
            <p className="profile-tab-subtitle">{t("settings.faqs.subtitle")}</p>

            <div className="settings-list">
              <div className="setting-item" style={{ flexDirection: "column", alignItems: "flex-start", gap: "var(--sp-xs)" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-dark)" }}>{t("settings.faqs.q1")}</h3>
                <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.5 }}>{t("settings.faqs.a1")}</p>
              </div>
              <div className="setting-item" style={{ flexDirection: "column", alignItems: "flex-start", gap: "var(--sp-xs)" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-dark)" }}>{t("settings.faqs.q2")}</h3>
                <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.5 }}>{t("settings.faqs.a2")}</p>
              </div>
              <div className="setting-item" style={{ flexDirection: "column", alignItems: "flex-start", gap: "var(--sp-xs)" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-dark)" }}>{t("settings.faqs.q3")}</h3>
                <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.5 }}>{t("settings.faqs.a3")}</p>
              </div>
            </div>
          </div>
        );
      case "about":
        return (
          <div className="profile-tab-content animation-fade-in">
            <h2>{t("settings.about.title")}</h2>
            <p className="profile-tab-subtitle">{t("settings.about.subtitle")}</p>

            <div style={{ textAlign: "center", padding: "40px 0", background: "linear-gradient(145deg, var(--surface-light), var(--surface-strong))", borderRadius: "24px", border: "1px solid var(--border-light)", boxShadow: "0 8px 30px rgba(0,0,0,0.04)" }}>
              <div style={{ width: "90px", height: "90px", background: "var(--primary-green-soft)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto var(--sp-lg)", boxShadow: "0 4px 15px rgba(39, 174, 96, 0.2)" }}>
                <LuLeaf size={44} color="var(--primary-green)" />
              </div>
              <h3 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-dark)", marginBottom: "var(--sp-xs)" }}>{t("settings.about.app")}</h3>
              <div style={{ display: "inline-block", background: "var(--primary-green)", color: "white", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600, marginBottom: "var(--sp-xl)" }}>
                {t("settings.about.version")}
              </div>

              <p style={{ fontSize: "16px", color: "var(--text-dark)", maxWidth: "480px", margin: "0 auto", lineHeight: 1.8 }}>
                {t("settings.about.desc")}
              </p>
            </div>
          </div>
        );
      case "terms":
        return (
          <div className="profile-tab-content animation-fade-in">
            <h2>{t("settings.terms.title")}</h2>
            <p className="profile-tab-subtitle">{t("settings.terms.subtitle")}</p>

            <div style={{ fontSize: "14px", color: "var(--text-dark)", lineHeight: 1.6, display: "flex", flexDirection: "column", gap: "var(--sp-lg)", background: "var(--surface-light)", padding: "24px", borderRadius: "16px", border: "1px solid var(--border-light)" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "var(--sp-xs)", color: "var(--primary-green)" }}>{t("settings.terms.s1t")}</h3>
                <p>{t("settings.terms.s1d")}</p>
              </div>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "var(--sp-xs)", color: "var(--primary-green)" }}>{t("settings.terms.s2t")}</h3>
                <p>{t("settings.terms.s2d")}</p>
              </div>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "var(--sp-xs)", color: "var(--primary-green)" }}>{t("settings.terms.s3t")}</h3>
                <p>{t("settings.terms.s3d")}</p>
              </div>
            </div>
          </div>
        );
      case "privacy":
        return (
          <div className="profile-tab-content animation-fade-in">
            <h2>{t("settings.privacy.title")}</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "var(--sp-md)" }}>
              <div style={{ padding: "8px", background: "var(--primary-green-soft)", borderRadius: "50%" }}>
                <LuShield size={24} color="var(--primary-green)" />
              </div>
              <p className="profile-tab-subtitle" style={{ margin: 0, fontWeight: 600, color: "var(--primary-green)" }}>{t("settings.privacy.dataProtection")}</p>
            </div>

            <div style={{ fontSize: "15px", color: "var(--text-dark)", lineHeight: 1.8, background: "var(--surface-light)", padding: "32px", borderRadius: "16px", border: "1px solid var(--border-light)", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
              <p>{t("settings.privacy.subtitle")}</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="profile-tab-content animation-fade-in">
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <LuInfo size={48} color="var(--surface-strong)" style={{ marginBottom: "16px" }} />
              <h2>{t("settings.uc.title")}</h2>
              <p className="profile-tab-subtitle" style={{ maxWidth: "300px", margin: "0 auto" }}>
                {t("settings.uc.subtitle")}
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <div className="profile-web-layout">
        {/* Sidebar */}
        <aside className="profile-sidebar">
          <div className="profile-user-card">
            <div className="profile-avatar">
              <LuShoppingCart size={28} />
            </div>
            <div>
              <div className="profile-user-name">{t("tTopBar.signedIn")}</div>
              <div className="profile-user-email">transporter@test.com</div>
            </div>
          </div>

          <div className="profile-nav-group">
            <div className="profile-nav-title">{t("settings.sidebar.appSettings")}</div>
            <button
              className={`profile-nav-item ${activeTab === "notifications" ? "active" : ""}`}
              onClick={() => setActiveTab("notifications")}
            >
              <LuBell size={18} /> {t("settings.sidebar.notif")}
            </button>
            <button
              className={`profile-nav-item ${activeTab === "language" ? "active" : ""}`}
              onClick={() => setActiveTab("language")}
            >
              <LuGlobe size={18} /> {t("settings.sidebar.lang")}
            </button>
          </div>

          <div className="profile-nav-group">
            <div className="profile-nav-title">{t("settings.sidebar.help")}</div>
            <button
              className={`profile-nav-item ${activeTab === "contact" ? "active" : ""}`}
              onClick={() => setActiveTab("contact")}
            >
              <LuMessageSquare size={18} /> {t("settings.sidebar.contact")}
            </button>
            <button
              className={`profile-nav-item ${activeTab === "faqs" ? "active" : ""}`}
              onClick={() => setActiveTab("faqs")}
            >
              <LuCircleHelp size={18} /> {t("settings.sidebar.faqs")}
            </button>
            <button
              className={`profile-nav-item ${activeTab === "about" ? "active" : ""}`}
              onClick={() => setActiveTab("about")}
            >
              <LuInfo size={18} /> {t("settings.sidebar.about")}
            </button>
            <button
              className={`profile-nav-item ${activeTab === "privacy" ? "active" : ""}`}
              onClick={() => setActiveTab("privacy")}
            >
              <LuShield size={18} /> {t("settings.sidebar.privacy")}
            </button>
            <button
              className={`profile-nav-item ${activeTab === "terms" ? "active" : ""}`}
              onClick={() => setActiveTab("terms")}
            >
              <LuFileText size={18} /> {t("settings.sidebar.terms")}
            </button>
          </div>

          <div className="profile-nav-group" style={{ marginTop: "auto", paddingTop: "24px" }}>
            <button
              className="profile-nav-item danger"
              onClick={() => setShowLogoutModal(true)}
              id="logout-btn"
            >
              <LuLogOut size={18} /> {t("settings.sidebar.logout")}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="profile-main-area">
          {renderContent()}
        </main>
      </div>

      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: "540px", padding: "32px", textAlign: "left" }}>
            <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
              <div style={{ width: "56px", height: "56px", flexShrink: 0, borderRadius: "50%", background: "#FEE2E2", color: "var(--error-red)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <LuTriangleAlert size={28} style={{ marginLeft: "2px" }} />
              </div>
              <div>
                <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-dark)", marginBottom: "8px", marginTop: "4px" }}>{t("settings.modal.title")}</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "15px", lineHeight: 1.6, margin: 0 }}>
                  {t("settings.modal.desc")}
                </p>
              </div>
            </div>

            <div className="modal-actions" style={{ justifyContent: "flex-end", marginTop: "32px" }}>
              <button
                className="modal-btn-cancel"
                onClick={() => setShowLogoutModal(false)}
              >
                {t("settings.modal.cancel")}
              </button>
              <button
                className="modal-btn-danger"
                onClick={onLogout}
              >
                {t("settings.modal.logout")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
