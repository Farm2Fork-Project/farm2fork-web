"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FarmerDashboard from "@/components/farmer/FarmerDashboard";
import FarmerSignup from "@/components/farmer/FarmerSignup2";
import { EmailVerificationRequired } from "@/components/auth/EmailVerificationRequired";
import { LanguageProvider } from "@/components/LanguageContext";
import LoginScreen from "@/components/LoginScreen";
import { ApiClient } from "@/lib/api/client.ts";
import { ApiError, type RegisterFarmerRequest } from "@/lib/api/contracts.ts";
import {
  FirebaseWebAuthRepository,
  type FirebaseWebAuthResult,
} from "@/lib/auth/firebase-web-auth-repository.ts";
import {
  beginFirebaseOnboarding,
  readMatchingFirebaseOnboardingEmail,
} from "@/lib/auth/firebase-onboarding-flow.ts";
import { firebaseOnboardingIntent } from "@/lib/auth/firebase-onboarding-intent.ts";
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
  const [googleIdentityEmail, setGoogleIdentityEmail] = useState("");

  const isSignup = searchParams.get("signup") === "true";
  const isFirebaseOnboarding = searchParams.get("firebaseOnboarding") === "true";

  const beginRoleSelection = useCallback((email: string) => {
    beginFirebaseOnboarding(email);
    router.replace("/?auth=signup&firebaseOnboarding=true");
  }, [router]);

  const completeGoogleSignIn = useCallback((result: FirebaseWebAuthResult) => {
    if (result.kind === "onboarding_required") {
      beginRoleSelection(result.email);
      return;
    }
    if (result.kind === "verification_required") {
      setVerificationEmail(result.email);
      setIsVerifyingEmail(true);
      return;
    }
    if (result.user.role !== "farmer") {
      throw new ApiError(403, "This account cannot access the farmer application.");
    }
    setSession({ user: result.user as WebSession["user"] & { role: "farmer" } });
  }, [beginRoleSelection]);

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

  useEffect(() => {
    let active = true;
    authRepository.resumeGoogleRedirect()
      .then((result) => {
        if (active && result) completeGoogleSignIn(result);
      })
      .catch((error) => {
        if (active) setAuthError(error instanceof Error ? error.message : "Could not complete Google sign-in.");
      });
    return () => {
      active = false;
    };
  }, [authRepository, completeGoogleSignIn]);

  useEffect(() => {
    if (!isFirebaseOnboarding) return;
    const email = readMatchingFirebaseOnboardingEmail(
      authRepository.getCurrentFirebaseIdentityEmail(),
    );
    if (!email) {
      setAuthError("Your Firebase onboarding session expired. Sign in again to choose a role.");
      router.replace("/?auth=login");
      return;
    }
    setGoogleIdentityEmail(email);
    setIsGoogleOnboarding(true);
  }, [authRepository, isFirebaseOnboarding, router]);

  async function login(email: string, password: string) {
    if (!email || !password) {
      setAuthError("Please enter your email and password.");
      return;
    }

    setIsSubmitting(true);
    setAuthError("");
    try {
      const result = await authRepository.signInWithEmail({ email, password });
      if (result.kind === "verification_required") {
        setVerificationEmail(result.email);
        setIsVerifyingEmail(true);
        return;
      }
      if (result.kind === "onboarding_required") {
        beginRoleSelection(result.email);
        return;
      }
      if (result.user.role !== "farmer") {
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
      if (googleIdentityEmail) {
        const { email: _email, password: _password, ...onboarding } = input;
        const user = await authRepository.onboardFarmer(onboarding);
        if (user.role !== "farmer") throw new ApiError(403, "This account cannot access the farmer application.");
        setSession({ user });
        setGoogleIdentityEmail("");
        firebaseOnboardingIntent.clear();
        setIsGoogleOnboarding(false);
        router.replace("/farmer");
        return;
      }
      const { email, password, ...onboarding } = input;
      const result = await authRepository.signUpWithEmail({ email, password });
      setPendingOnboarding(onboarding);
      setVerificationEmail(result.email);
      setIsVerifyingEmail(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  const [isGoogleOnboarding, setIsGoogleOnboarding] = useState(false);

  async function loginWithGoogle() {
    setIsSubmitting(true);
    setAuthError("");
    try {
      const result = await authRepository.signInWithGoogle();
      if (!result) return;
      completeGoogleSignIn(result);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Could not sign in with Google.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function requestPasswordReset(email: string) {
    if (!email.trim()) {
      setAuthError("Enter your email address before requesting a password reset.");
      return;
    }
    await authRepository.sendPasswordReset(email.trim());
    setAuthError("Password reset email sent. Check your inbox.");
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
      if (result.kind === "onboarding_required") {
        if (!pendingOnboarding) {
          beginRoleSelection(result.email);
          return;
        }
        const user = await authRepository.onboardFarmer(pendingOnboarding);
        if (user.role !== "farmer") throw new ApiError(403, "This account cannot access the farmer application.");
        setSession({ user });
        router.replace("/farmer");
        return;
      }
    } catch (error) {
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

  if (isSignup || isGoogleOnboarding) {
    return (
      <FarmerSignup
        identityEmail={googleIdentityEmail || undefined}
        onBack={() => {
          setIsGoogleOnboarding(false);
          router.replace(
            googleIdentityEmail
              ? "/?auth=signup&firebaseOnboarding=true"
              : "/farmer",
          );
        }}
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
      onGoogleLogin={loginWithGoogle}
      onForgotPassword={requestPasswordReset}
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
