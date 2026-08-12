"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FarmerDashboard from "@/components/farmer/FarmerDashboard";
import FarmerSignup from "@/components/farmer/FarmerSignup2";
import { LanguageProvider } from "@/components/LanguageContext";
import LoginScreen from "@/components/LoginScreen";
import { ApiClient } from "@/lib/api/client.ts";
import type { RegisterFarmerRequest } from "@/lib/api/contracts.ts";
import { RoleAuthRepository } from "@/lib/auth/role-auth-repository.ts";
import { type WebSession, webSession } from "@/lib/auth/web-session.ts";

function FarmerApp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const repository = useMemo(
    () => new RoleAuthRepository({ client: new ApiClient() }),
    [],
  );
  const [session, setSession] = useState<WebSession | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");

  const isSignup = searchParams.get("signup") === "true";

  useEffect(() => {
    let active = true;
    const restored = webSession.read();

    if (isSignup || !isFarmerSession(restored)) {
      setIsCheckingSession(false);
      return () => {
        active = false;
      };
    }

    repository.getCurrentUser("farmer")
      .then((user) => {
        if (active) setSession({ accessToken: restored.accessToken, user });
      })
      .catch((error) => {
        if (active) {
          setAuthError(error instanceof Error ? error.message : "Could not restore your session.");
        }
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
      setSession(await repository.login({ email, password }, "farmer"));
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Could not sign in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function register(input: RegisterFarmerRequest) {
    setIsSubmitting(true);
    setAuthError("");
    try {
      setSession(await repository.registerFarmer(input));
      router.replace("/farmer");
    } finally {
      setIsSubmitting(false);
    }
  }

  function logout() {
    webSession.clear();
    setSession(null);
    setAuthError("");
    router.replace("/farmer");
  }

  if (isCheckingSession) return <p>Loading…</p>;

  if (session?.user.role === "farmer") {
    return <FarmerDashboard onLogout={logout} />;
  }

  if (isSignup) {
    return (
      <FarmerSignup
        onBack={() => router.replace("/farmer")}
        onSubmit={register}
      />
    );
  }

  return (
    <LoginScreen
      isSubmitting={isSubmitting}
      loginError={authError}
      onBackHome={() => router.replace("/")}
      onGoSignup={() => {
        setAuthError("");
        router.replace("/farmer?signup=true");
      }}
      onLogin={login}
    />
  );
}

function isFarmerSession(session: WebSession | null): session is WebSession & {
  user: WebSession["user"] & { role: "farmer" };
} {
  return session?.user.role === "farmer";
}

export default function FarmerPage() {
  return (
    <LanguageProvider>
      <Suspense fallback={<p>Loading…</p>}>
        <FarmerApp />
      </Suspense>
    </LanguageProvider>
  );
}
