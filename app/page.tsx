"use client";

import { useState } from "react";
import type { AuthScreen, AppTab } from "@/components/types";
import { TAB_TITLES } from "@/components/types";
import LoginScreen from "@/components/LoginScreen";
import SignUpRoleScreen from "@/components/SignUpRoleScreen";
import SignUpFormScreen from "@/components/SignUpFormScreen";
import LandingScreen from "@/components/LandingScreen";
import TopBar from "@/components/TopBar";
import MarketplaceScreen from "@/components/MarketplaceScreen";
import ProductDetailScreen from "@/components/ProductDetailScreen";
import CartScreen from "@/components/CartScreen";
import OrdersScreen from "@/components/OrdersScreen";
import ProfileScreen from "@/components/ProfileScreen";
import ScanScreen from "@/components/ScanScreen";
import { LanguageProvider, useLanguage } from "@/components/LanguageContext";

function HomeContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authScreen, setAuthScreen] = useState<AuthScreen>("landing");
  const [activeTab, setActiveTab] = useState<AppTab>("marketplace");
  const [viewingProduct, setViewingProduct] = useState(false);
  const { language } = useLanguage();

  /* ── Auth flow ── */
  if (!isLoggedIn) {
    if (authScreen === "landing") {
      return (
        <LandingScreen
          onGetStarted={() => setAuthScreen("signup-role")}
          onLogin={() => setAuthScreen("login")}
        />
      );
    }
    if (authScreen === "login") {
      return (
        <LoginScreen
          onLogin={() => setIsLoggedIn(true)}
          onGoSignup={() => setAuthScreen("signup-role")}
        />
      );
    }
    if (authScreen === "signup-role") {
      return (
        <SignUpRoleScreen
          onBack={() => setAuthScreen("login")}
          onSelectRole={() => setAuthScreen("signup-form")}
        />
      );
    }
    return (
      <SignUpFormScreen
        onBack={() => setAuthScreen("signup-role")}
        onSubmit={() => setIsLoggedIn(true)}
      />
    );
  }

  /* ── Main app ── */
  const renderContent = () => {
    if (activeTab === "marketplace" && viewingProduct) {
      return (
        <ProductDetailScreen onBack={() => setViewingProduct(false)} />
      );
    }

    switch (activeTab) {
      case "marketplace":
        return (
          <MarketplaceScreen
            onViewProduct={() => setViewingProduct(true)}
          />
        );
      case "scan":
        return <ScanScreen />;
      case "cart":
        return (
          <CartScreen
            onShopNow={() => {
              setActiveTab("marketplace");
              setViewingProduct(false);
            }}
          />
        );
      case "orders":
        return <OrdersScreen />;
      case "profile":
        return (
          <ProfileScreen
            onLogout={() => {
              setIsLoggedIn(false);
              setAuthScreen("login");
              setActiveTab("marketplace");
            }}
          />
        );
    }
  };

  return (
    <div className="app-shell" dir={language === "ur" ? "rtl" : "ltr"}>
      <div className="app-main">
        <TopBar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setViewingProduct(false);
          }}
        />
        <main className="app-content">{renderContent()}</main>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <LanguageProvider>
      <HomeContent />
    </LanguageProvider>
  );
}
