"use client";

import { useState } from "react";
import TopBar from "../components/TopBar";
import ShipmentScreen from "../components/ShipmentScreen";
import ProfileScreen from "../components/ProfileScreen";
import TransporterSignup1Screen from "../components/TransporterSignup1Screen";
import TransporterSignup2Screen from "../components/TransporterSignup2Screen";
import LoginScreen from "../components/LoginScreen";
import SignUpRoleScreen from "../components/SignUpRoleScreen";
import OrdersScreen from "../components/OrdersScreen";
import ScanScreen from "../components/ScanScreen";
import { AppTab } from "../components/types";
import { LanguageProvider, useLanguage } from "../components/LanguageContext";

function MainApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup-role" | "signup1" | "signup2">("login");
  const [activeTab, setActiveTab] = useState<AppTab>("shipments");
  const { t } = useLanguage();

  if (!isLoggedIn) {
    return (
      <>
        {authMode === "signup-role" && (
          <SignUpRoleScreen
            onBack={() => setAuthMode("login")}
            onSelectRole={() => setAuthMode("signup1")}
          />
        )}
        {authMode === "login" && (
          <LoginScreen
            onLogin={() => setIsLoggedIn(true)}
            onGoSignup={() => setAuthMode("signup-role")}
          />
        )}
        {authMode === "signup1" && (
          <TransporterSignup1Screen
            onBack={() => setAuthMode("signup-role")}
            onNext={() => setAuthMode("signup2")}
          />
        )}
        {authMode === "signup2" && (
          <TransporterSignup2Screen
            onBack={() => setAuthMode("signup1")}
            onSubmit={() => setIsLoggedIn(true)}
          />
        )}
      </>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "shipments":
        return <ShipmentScreen />;
      case "orders":
        return <OrdersScreen />;
      case "scan":
        return <ScanScreen />;
      case "profile":
        return <ProfileScreen onLogout={() => setIsLoggedIn(false)} />;
      default:
        return <div>Screen not found</div>;
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

export default function Home() {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}
