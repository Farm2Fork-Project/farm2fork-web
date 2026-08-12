"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { AuthScreen } from "@/components/types";
import LandingScreen from "@/components/LandingScreen";
import LoginScreen from "@/components/LoginScreen";
import SignUpFormScreen from "@/components/SignUpFormScreen";
import SignUpRoleScreen from "@/components/SignUpRoleScreen";
import { LanguageProvider } from "@/components/LanguageContext";
import { BuyerApp } from "@/components/buyer/BuyerApp";
import { ApiClient } from "@/lib/api/client.ts";
import { BuyerRepository } from "@/lib/buyer/buyer-repository.ts";
import type { RegisterBuyerRequest } from "@/lib/api/contracts.ts";
import { type BuyerSession, webSession } from "@/lib/auth/web-session.ts";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const repository = useMemo(
    () => new BuyerRepository({ client: new ApiClient() }),
    [],
  );
  const [session, setSession] = useState<BuyerSession | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [authScreen, setAuthScreen] = useState<AuthScreen>(() => {
    if (searchParams.get("auth") === "login") return "login";
    if (searchParams.get("auth") === "signup") return "signup-role";
    return "landing";
  });
  const [loginError, setLoginError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const closeAuth = useCallback(() => {
    setLoginError("");
    setAuthScreen("landing");
    router.replace("/");
  }, [router]);

  useEffect(() => {
    setSession(webSession.read());
    setIsCheckingSession(false);
  }, []);

  useEffect(() => {
    if (session || authScreen === "landing") return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeAuth();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [authScreen, closeAuth, session]);

  async function login(email: string, password: string) {
    if (!email || !password) {
      setLoginError("Please enter your email and password.");
      return;
    }

    setIsSubmitting(true);
    setLoginError("");
    try {
      const nextSession = await repository.login({ email, password });
      setSession(nextSession);
      setAuthScreen("landing");
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Could not sign in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function registerBuyer(input: RegisterBuyerRequest) {
    const nextSession = await repository.registerBuyer(input);
    setSession(nextSession);
    setAuthScreen("landing");
    router.replace("/");
  }

  function logout() {
    webSession.clear();
    setSession(null);
    setAuthScreen("login");
  }

  if (isCheckingSession) return <p>Loading…</p>;

  if (session) {
    return <BuyerApp onLogout={logout} repository={repository} session={session} />;
  }

  return (
    <>
      <LandingScreen
        onGetStarted={() => setAuthScreen("signup-role")}
        onLogin={() => setAuthScreen("login")}
      />
      {authScreen === "login" ? (
        <LoginScreen
          isSubmitting={isSubmitting}
          loginError={loginError}
          onBackHome={closeAuth}
          onGoSignup={() => {
            setLoginError("");
            setAuthScreen("signup-role");
          }}
          onLogin={login}
        />
      ) : null}
      {authScreen === "signup-role" ? (
        <SignUpRoleScreen
          onBack={() => setAuthScreen("login")}
          onBackHome={closeAuth}
          onSelectRole={(role) => {
            if (role === "buyer") setAuthScreen("signup-form");
            else if (role === "farmer") router.push("/farmer?signup=true");
            else if (role === "transporter") router.push("/transporter?signup=true");
          }}
        />
      ) : null}
      {authScreen === "signup-form" ? (
        <SignUpFormScreen
          onBack={() => setAuthScreen("signup-role")}
          onBackHome={closeAuth}
          onSubmit={registerBuyer}
        />
      ) : null}
    </>
  );
}

export default function Home() {
  return (
    <LanguageProvider>
      <Suspense fallback={<p>Loading…</p>}>
        <HomeContent />
      </Suspense>
    </LanguageProvider>
  );
}
