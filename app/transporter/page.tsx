"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("signup") === "true") {
      setAuthMode("signup1");
    } else if (typeof window !== "undefined" && localStorage.getItem("role") === "transporter") {
      setIsLoggedIn(true);
    } else {
      router.push("/login");
    }
  }, [searchParams, router]);

  if (!isLoggedIn) {
    if (authMode === "signup1") {
      return (
        <TransporterSignup1Screen
          onBack={() => router.push("/login")}
          onNext={() => setAuthMode("signup2")}
        />
      );
    }
    if (authMode === "signup2") {
      return (
        <TransporterSignup2Screen
          onBack={() => setAuthMode("signup1")}
          onSubmit={() => {
            localStorage.setItem("role", "transporter");
            setIsLoggedIn(true);
          }}
        />
      );
    }
    return null; // Will redirect via useEffect
  }

  const renderContent = () => {
    switch (activeTab) {
      case "shipments": return <ShipmentScreen />;
      case "orders": return <TransporterOrdersScreen />;
      case "scan": return <ScanScreen />;
      case "profile": return <TransporterProfileScreen onLogout={() => {
        localStorage.removeItem("role");
        localStorage.removeItem("userName");
        localStorage.removeItem("avatarUrl");
        setIsLoggedIn(false);
        router.push("/login");
      }} />;
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
      <Suspense fallback={<div>Loading...</div>}>
        <MainApp />
      </Suspense>
    </LanguageProvider>
  );
}
