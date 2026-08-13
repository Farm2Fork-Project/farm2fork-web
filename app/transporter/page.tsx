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
import { EmailVerificationRequired } from "@/components/auth/EmailVerificationRequired";
import { ApiClient } from "@/lib/api/client.ts";
import { ApiError, type RegisterTransporterRequest } from "@/lib/api/contracts.ts";
import { FirebaseWebAuthRepository } from "@/lib/auth/firebase-web-auth-repository.ts";
import { RoleAuthRepository } from "@/lib/auth/role-auth-repository.ts";
import { type WebSession, webSession } from "@/lib/auth/web-session.ts";
import { ShipmentRepository } from "@/lib/shipment/shipment-repository.ts";

function TransporterApp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const authRepository = useMemo(
    () => new RoleAuthRepository({ client: new ApiClient() }),
    [],
  );
  const firebaseAuthRepository = useMemo(
    () => new FirebaseWebAuthRepository({ client: new ApiClient() }),
    [],
  );
  const shipmentRepository = useMemo(
    () => new ShipmentRepository({ client: new ApiClient() }),
    [],
  );
  const [session, setSession] = useState<WebSession | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "signup1" | "signup2">("login");
  const [draft, setDraft] = useState<TransporterPersonalInput | null>(null);
  const [activeTab, setActiveTab] = useState<AppTab>("shipments");
  const [authError, setAuthError] = useState("");
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [pendingOnboarding, setPendingOnboarding] = useState<
    Omit<RegisterTransporterRequest, "email" | "password"> | null
  >(null);
  const isSignup = searchParams.get("signup") === "true";

  useEffect(() => {
    let active = true;
    if (isSignup) {
      setAuthMode("signup1");
      setIsCheckingSession(false);
      return () => {
        active = false;
      };
    }

    authRepository.getCurrentUser("transporter")
      .then((user) => {
        if (active) setSession({ user });
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
  }, [authRepository, isSignup]);

  async function login(email: string, password: string) {
    if (!email || !password) {
      setAuthError("Please enter your email and password.");
      return;
    }
    setIsSubmitting(true);
    setAuthError("");
    try {
      const result = await firebaseAuthRepository.signInWithEmail({ email, password });
      if (result.kind !== "session" || result.user.role !== "transporter") {
        throw new ApiError(403, "This account cannot access the transporter application.");
      }
      setSession({ user: result.user });
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
      const { email, password, ...onboarding } = { ...draft, ...input };
      const result = await firebaseAuthRepository.signUpWithEmail({ email, password });
      setPendingOnboarding(onboarding);
      setVerificationEmail(result.email);
      setIsVerifyingEmail(true);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Could not create your transporter account.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function logout() {
    await firebaseAuthRepository.logout();
    setSession(null);
    setAuthError("");
    router.replace("/transporter");
  }

  async function refreshVerification() {
    setIsSubmitting(true);
    setAuthError("");
    try {
      const result = await firebaseAuthRepository.refreshEmailVerification();
      if (result.kind === "session") {
        if (result.user.role !== "transporter") throw new ApiError(403, "This account cannot access the transporter application.");
        setSession({ user: result.user });
        return;
      }
    } catch (error) {
      if (isOnboardingRequired(error) && pendingOnboarding) {
        const user = await firebaseAuthRepository.onboardTransporter(pendingOnboarding);
        if (user.role !== "transporter") throw new ApiError(403, "This account cannot access the transporter application.");
        setSession({ user });
        return;
      }
      setAuthError(error instanceof Error ? error.message : "Could not verify your email.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isCheckingSession) return <p>Loading…</p>;

  if (!session || session.user.role !== "transporter") {
    if (isVerifyingEmail) {
      return (
        <EmailVerificationRequired
          email={verificationEmail}
          error={authError}
          isSubmitting={isSubmitting}
          onBack={() => setIsVerifyingEmail(false)}
          onResend={() => firebaseAuthRepository.resendEmailVerification()}
          onRefresh={refreshVerification}
        />
      );
    }
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
      case "shipments": return <ShipmentScreen repository={shipmentRepository} />;
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

function isOnboardingRequired(error: unknown): boolean {
  return error instanceof ApiError &&
    !!error.body &&
    typeof error.body === "object" &&
    "code" in error.body &&
    error.body.code === "ONBOARDING_REQUIRED";
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
