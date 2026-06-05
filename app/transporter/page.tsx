"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/transporter/TopBar";
import ShipmentScreen from "@/components/transporter/ShipmentScreen";
import TransporterSignup1Screen from "@/components/transporter/TransporterSignup1Screen";
import TransporterSignup2Screen from "@/components/transporter/TransporterSignup2Screen";
import ScanScreen from "@/components/transporter/ScanScreen";
import { AppTab } from "@/components/transporter/types";
import { LanguageProvider, useLanguage } from "@/components/transporter/LanguageContext";
import TransporterOrdersScreen from "@/components/transporter/OrdersScreen";
import TransporterProfileScreen from "@/components/transporter/ProfileScreen";

// Mock transporter user
const TRANSPORTER_USER = { email: "transporter@test.com", password: "test1234" };

function MainApp() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup1" | "signup2">("login");
  const [activeTab, setActiveTab] = useState<AppTab>("shipments");
  const [loginError, setLoginError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const { t } = useLanguage();

  useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("signup") === "true") {
        setAuthMode("signup1");
      }
    }
  });

  if (!isLoggedIn) {
    if (authMode === "signup1") {
      return (
        <TransporterSignup1Screen
          onBack={() => setAuthMode("login")}
          onNext={() => setAuthMode("signup2")}
        />
      );
    }
    if (authMode === "signup2") {
      return (
        <TransporterSignup2Screen
          onBack={() => setAuthMode("signup1")}
          onSubmit={() => setIsLoggedIn(true)}
        />
      );
    }
    // Login screen — inline to avoid circular dependency
    return (
      <div className="auth-wrapper">
        <div className="auth-card auth-card-narrow">
          <div className="auth-form-side">
            <h1>{t("login.title")}</h1>
            <div className="auth-form-group">
              <label htmlFor="t-login-email">{t("login.email")}</label>
              <input id="t-login-email" className="auth-input" type="text"
                placeholder="transporter@test.com"
                value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="auth-form-group">
              <label htmlFor="t-login-password">{t("login.password")}</label>
              <div className="auth-input-wrapper">
                <input id="t-login-password" className="auth-input"
                  type={showPw ? "text" : "password"}
                  placeholder={t("login.password")}
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (!email || !password) { setLoginError("Please enter email and password."); return; }
                      if (email.toLowerCase() === TRANSPORTER_USER.email && password === TRANSPORTER_USER.password) {
                        setIsLoggedIn(true);
                      } else {
                        setLoginError("Invalid email or password.");
                      }
                    }
                  }}
                />
                <button className="toggle-pw" type="button" onClick={() => setShowPw(!showPw)}>
                  {showPw ? "🙈" : "👁"}
                </button>
              </div>
            </div>
            {loginError && (
              <div style={{ background: "#FEE2E2", color: "#C8463A", borderRadius: "var(--radius-md)", padding: "10px 14px", fontSize: "13px", fontWeight: 600, border: "1px solid #FECACA" }}>
                {loginError}
              </div>
            )}
            <button className="auth-btn" id="t-login-btn" onClick={() => {
              setLoginError("");
              if (!email || !password) { setLoginError("Please enter email and password."); return; }
              if (email.toLowerCase() === TRANSPORTER_USER.email && password === TRANSPORTER_USER.password) {
                setIsLoggedIn(true);
              } else {
                setLoginError("Invalid email or password.");
              }
            }}>{t("login.submit")}</button>
            <div className="auth-footer">
              {t("login.noAccount")}{" "}
              <a href="#" onClick={(e) => { e.preventDefault(); setAuthMode("signup1"); }}>{t("login.signup")}</a>
            </div>
            <div className="auth-divider">{t("login.or")}</div>
            <button className="auth-guest-btn" onClick={() => router.push("/")}>← Back to Buyer Login</button>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "shipments": return <ShipmentScreen />;
      case "orders": return <TransporterOrdersScreen />;
      case "scan": return <ScanScreen />;
      case "profile": return <TransporterProfileScreen onLogout={() => setIsLoggedIn(false)} />;
      default: return <div>Screen not found</div>;
    }
  };

  return (
    <div className="app-shell animation-fade-in" dir={t("app.title") === "فارم ٹو فورک" ? "rtl" : "ltr"}>
      <div className="app-main">
        <TopBar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="app-content">{renderContent()}</main>
      </div>
    </div>
  );
}

export default function TransporterPage() {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}
