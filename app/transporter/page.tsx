"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import TopBar from "@/components/transporter/TopBar";
import ShipmentScreen from "@/components/transporter/ShipmentScreen";
import TransporterSignup1Screen, { type TransporterPersonalInput } from "@/components/transporter/TransporterSignup1Screen";
import TransporterSignup2Screen, { type TransporterVehicleInput } from "@/components/transporter/TransporterSignup2Screen";
import ScanScreen from "@/components/transporter/ScanScreen";
import { type AppTab } from "@/components/transporter/types";
import { LanguageProvider, useLanguage } from "@/components/transporter/LanguageContext";
import TransporterOrdersScreen from "@/components/transporter/OrdersScreen";
import TransporterProfileScreen from "@/components/transporter/ProfileScreen";
import LoginScreen from "@/components/LoginScreen";
import { ApiClient } from "@/lib/api/client.ts";
import { RoleAuthRepository } from "@/lib/auth/role-auth-repository.ts";
import { type WebSession, webSession } from "@/lib/auth/web-session.ts";

function TransporterApp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const repository = useMemo(
    () => new RoleAuthRepository({ client: new ApiClient() }),
    [],
  );
  const [session, setSession] = useState<WebSession | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "signup1" | "signup2">("login");
  const [draft, setDraft] = useState<TransporterPersonalInput | null>(null);
  const [activeTab, setActiveTab] = useState<AppTab>("shipments");
  const [authError, setAuthError] = useState("");
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSignup = searchParams.get("signup") === "true";

  useEffect(() => {
    let active = true;
    const restored = webSession.read();

    if (isSignup) {
      setAuthMode("signup1");
      setIsCheckingSession(false);
      return () => {
        active = false;
      };
    }

    if (!isTransporterSession(restored)) {
      setAuthMode("login");
      setIsCheckingSession(false);
      return () => {
        active = false;
      };
    }

    repository.getCurrentUser("transporter")
      .then((user) => {
        if (active) setSession({ accessToken: restored.accessToken, user });
      })
      .catch((error) => {
        if (active) setAuthError(error instanceof Error ? error.message : "Could not restore your session.");
      })
      .finally(() => {
        if (active) setIsCheckingSession(false);
      });

    return () => {
      active = false;
    };
  }, [isSignup, repository]);

  async function login(email: string, password: string) {
    if (!email || !password) {
      setAuthError("Please enter your email and password.");
      return;
    }
    setIsSubmitting(true);
    setAuthError("");
    try {
      setSession(await repository.login({ email, password }, "transporter"));
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Could not sign in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function advanceSignup(input: TransporterPersonalInput) {
    setDraft(input);
    setAuthError("");
    setAuthMode("signup2");
  }

  async function register(input: TransporterVehicleInput) {
    if (!draft) {
      setAuthMode("signup1");
      return;
    }
    setIsSubmitting(true);
    setAuthError("");
    try {
      setSession(await repository.registerTransporter({ ...draft, ...input }));
      router.replace("/transporter");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Could not create your transporter account.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function logout() {
    webSession.clear();
    setSession(null);
    setAuthError("");
    router.replace("/transporter");
  }

  if (isCheckingSession) return <p>Loading…</p>;

  if (!session || session.user.role !== "transporter") {
    if (authMode === "signup1") {
      return <TransporterSignup1Screen onBack={() => router.replace("/transporter")} onNext={advanceSignup} />;
    }
    if (authMode === "signup2") {
      return (
        <TransporterSignup2Screen
          isSubmitting={isSubmitting}
          onBack={() => setAuthMode("signup1")}
          onSubmit={register}
          submitError={authError}
        />
      );
    }
    return (
      <LoginScreen
        isSubmitting={isSubmitting}
        loginError={authError}
        onBackHome={() => router.replace("/")}
        onGoSignup={() => router.replace("/transporter?signup=true")}
        onLogin={login}
      />
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "shipments": return <ShipmentScreen />;
      case "orders": return <TransporterOrdersScreen />;
      case "scan": return <ScanScreen />;
      case "profile": return <TransporterProfileScreen onLogout={logout} />;
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

function isTransporterSession(session: WebSession | null): session is WebSession & {
  user: WebSession["user"] & { role: "transporter" };
} {
  return session?.user.role === "transporter";
}

export default function TransporterPage() {
  return (
    <LanguageProvider>
      <Suspense fallback={<p>Loading…</p>}>
        <TransporterApp />
      </Suspense>
    </LanguageProvider>
  );
}
