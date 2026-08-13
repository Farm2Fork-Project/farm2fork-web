"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FarmerDashboard from "@/components/farmer/FarmerDashboard";
import FarmerSignup from "@/components/farmer/FarmerSignup2";
import { EmailVerificationRequired } from "@/components/auth/EmailVerificationRequired";
import { LanguageProvider } from "@/components/LanguageContext";
import LoginScreen from "@/components/LoginScreen";
import { ApiClient } from "@/lib/api/client.ts";
import { ApiError, type RegisterFarmerRequest } from "@/lib/api/contracts.ts";
import { FirebaseWebAuthRepository } from "@/lib/auth/firebase-web-auth-repository.ts";
import { RoleAuthRepository } from "@/lib/auth/role-auth-repository.ts";
import { type WebSession, webSession } from "@/lib/auth/web-session.ts";

function FarmerApp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const repository = useMemo(
    () => new RoleAuthRepository({ client: new ApiClient() }),
    [],
  );
  const authRepository = useMemo(
    () => new FirebaseWebAuthRepository({ client: new ApiClient() }),
    [],
  );
  const [session, setSession] = useState<WebSession | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");
  const [verificationEmail, setVerificationEmail] = useState("");
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [pendingOnboarding, setPendingOnboarding] = useState<
    Omit<RegisterFarmerRequest, "email" | "password"> | null
  >(null);

  const isSignup = searchParams.get("signup") === "true";

  useEffect(() => {
    let active = true;
    if (isSignup) {
      setIsCheckingSession(false);
      return () => {
        active = false;
      };
    }

    repository.getCurrentUser("farmer")
      .then((user) => {
        if (active) setSession({ user });
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
      const result = await authRepository.signInWithEmail({ email, password });
      if (result.kind !== "session" || result.user.role !== "farmer") {
        throw new ApiError(403, "This account cannot access the farmer application.");
      }
      setSession({ user: result.user });
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
      const { email, password, ...onboarding } = input;
      const result = await authRepository.signUpWithEmail({ email, password });
      setPendingOnboarding(onboarding);
      setVerificationEmail(result.email);
      setIsVerifyingEmail(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function logout() {
    await authRepository.logout();
    setSession(null);
    setAuthError("");
    router.replace("/farmer");
  }

  async function refreshVerification() {
    setIsSubmitting(true);
    setAuthError("");
    try {
      const result = await authRepository.refreshEmailVerification();
      if (result.kind === "session") {
        if (result.user.role !== "farmer") throw new ApiError(403, "This account cannot access the farmer application.");
        setSession({ user: result.user });
        router.replace("/farmer");
        return;
      }
    } catch (error) {
      if (isOnboardingRequired(error) && pendingOnboarding) {
        const user = await authRepository.onboardFarmer(pendingOnboarding);
        if (user.role !== "farmer") throw new ApiError(403, "This account cannot access the farmer application.");
        setSession({ user });
        router.replace("/farmer");
        return;
      }
      setAuthError(error instanceof Error ? error.message : "Could not verify your email.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isCheckingSession) return <p>Loading…</p>;

  if (session?.user.role === "farmer") {
    return <FarmerDashboard onLogout={logout} />;
  }

  if (isVerifyingEmail) {
    return (
      <EmailVerificationRequired
        email={verificationEmail}
        error={authError}
        isSubmitting={isSubmitting}
        onBack={() => setIsVerifyingEmail(false)}
        onResend={() => authRepository.resendEmailVerification()}
        onRefresh={refreshVerification}
      />
    );
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

function isOnboardingRequired(error: unknown): boolean {
  return error instanceof ApiError &&
    !!error.body &&
    typeof error.body === "object" &&
    "code" in error.body &&
    error.body.code === "ONBOARDING_REQUIRED";
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
