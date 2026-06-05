"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AuthScreen, AppTab } from "@/components/types";
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

// ── Mock users ──
const USERS = [
  { email: "buyer@test.com", password: "test1234", role: "buyer" },
  { email: "transporter@test.com", password: "test1234", role: "transporter" },
  { email: "admin@test.com", password: "test1234", role: "admin" },
];

function HomeContent() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authScreen, setAuthScreen] = useState<AuthScreen>("landing");
  const [activeTab, setActiveTab] = useState<AppTab>("marketplace");
  const [viewingProduct, setViewingProduct] = useState(false);
  const [loginError, setLoginError] = useState("");
  const { language } = useLanguage();

  useState(() => {
    // Initial check (non-blocking / client-safe)
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("role");
      if (role === "buyer") {
        setIsLoggedIn(true);
      }
    }
  });

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
          onLogin={(email, password) => {
            setLoginError("");
            if (!email || !password) {
              setLoginError("Please enter your email and password.");
              return;
            }
            const user = USERS.find(
              (u) =>
                u.email.toLowerCase() === email.toLowerCase() &&
                u.password === password
            );
            if (!user) {
              setLoginError("Invalid email or password.");
              return;
            }
            if (user.role === "transporter") {
              localStorage.setItem("role", "transporter");
              router.push("/transporter");
            } else if (user.role === "admin") {
              localStorage.setItem("role", "admin");
              localStorage.setItem("userName", "Admin User");
              router.push("/admin/dashboard");
            } else {
              localStorage.setItem("role", "buyer");
              setIsLoggedIn(true);
            }
          }}
          loginError={loginError}
          onGoSignup={() => {
            setLoginError("");
            setAuthScreen("signup-role");
          }}
        />
      );
    }
    if (authScreen === "signup-role") {
      return (
        <SignUpRoleScreen
          onBack={() => setAuthScreen("login")}
          onSelectRole={(role) => {
            if (role === "transporter") {
              router.push("/transporter?signup=true");
            } else {
              setAuthScreen("signup-form");
            }
          }}
        />
      );
    }
    return (
      <SignUpFormScreen
        onBack={() => setAuthScreen("signup-role")}
        onSubmit={() => {
          localStorage.setItem("role", "buyer");
          setIsLoggedIn(true);
        }}
      />
    );
  }

  /* ── Main buyer app ── */
  const renderContent = () => {
    if (activeTab === "marketplace" && viewingProduct) {
      return <ProductDetailScreen onBack={() => setViewingProduct(false)} />;
    }
    switch (activeTab) {
      case "marketplace":
        return <MarketplaceScreen onViewProduct={() => setViewingProduct(true)} />;
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
              localStorage.removeItem("role");
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
