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
import { EmailVerificationRequired } from "@/components/auth/EmailVerificationRequired";
import { ApiClient } from "@/lib/api/client.ts";
import { BuyerRepository } from "@/lib/buyer/buyer-repository.ts";
import { ApiError, type RegisterBuyerRequest } from "@/lib/api/contracts.ts";
import {
  FirebaseWebAuthRepository,
  type FirebaseWebAuthResult,
} from "@/lib/auth/firebase-web-auth-repository.ts";
import {
  beginFirebaseOnboarding,
  firebaseOnboardingPortalPath,
  readMatchingFirebaseOnboardingEmail,
} from "@/lib/auth/firebase-onboarding-flow.ts";
import { firebaseOnboardingIntent } from "@/lib/auth/firebase-onboarding-intent.ts";
import { RoleAuthRepository } from "@/lib/auth/role-auth-repository.ts";
import {
  type BuyerSession,
  type WebSession,
  webSession,
} from "@/lib/auth/web-session.ts";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const repository = useMemo(
    () => new BuyerRepository({ client: new ApiClient() }),
    [],
  );
  const authRepository = useMemo(
    () => new FirebaseWebAuthRepository({ client: new ApiClient() }),
    [],
  );
  const roleRepository = useMemo(
    () => new RoleAuthRepository({ client: new ApiClient() }),
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
  const [verificationEmail, setVerificationEmail] = useState("");
  const [pendingOnboarding, setPendingOnboarding] = useState<
    Omit<RegisterBuyerRequest, "email" | "password"> | null
  >(null);
  const [googleIdentityEmail, setGoogleIdentityEmail] = useState("");

  const beginRoleSelection = useCallback((email: string) => {
    setGoogleIdentityEmail(beginFirebaseOnboarding(email));
    setAuthScreen("signup-role");
    router.replace("/?auth=signup&firebaseOnboarding=true");
  }, [router]);

  const closeAuth = useCallback(() => {
    firebaseOnboardingIntent.clear();
    setGoogleIdentityEmail("");
    void authRepository.discardFirebaseIdentity();
    setLoginError("");
    setAuthScreen("landing");
    router.replace("/");
  }, [authRepository, router]);

  const cancelFirebaseOnboarding = useCallback(() => {
    firebaseOnboardingIntent.clear();
    setGoogleIdentityEmail("");
    void authRepository.discardFirebaseIdentity();
    setAuthScreen("login");
    router.replace("/?auth=login");
  }, [authRepository, router]);

  const completeGoogleSignIn = useCallback((result: FirebaseWebAuthResult) => {
    if (result.kind === "verification_required") {
      setVerificationEmail(result.email);
      setAuthScreen("verification");
      return;
    }
    if (result.kind === "onboarding_required") {
      beginRoleSelection(result.email);
      return;
    }
    if (result.user.role !== "buyer") {
      throw new ApiError(403, "This account cannot access the buyer application.");
    }
    setSession({ user: result.user as BuyerSession["user"] });
    setAuthScreen("landing");
  }, [beginRoleSelection]);

  useEffect(() => {
    let active = true;
    roleRepository
      .getCurrentUser("buyer")
      .then((user) => {
        if (active) setSession({ user });
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setIsCheckingSession(false);
      });
    return () => {
      active = false;
    };
  }, [roleRepository]);

  useEffect(() => {
    let active = true;
    authRepository.resumeGoogleRedirect()
      .then((result) => {
        if (active && result) completeGoogleSignIn(result);
      })
      .catch((error) => {
        if (!active) return;
        setLoginError(error instanceof Error ? error.message : "Could not complete Google sign-in.");
        setAuthScreen("login");
      });
    return () => {
      active = false;
    };
  }, [authRepository, completeGoogleSignIn]);

  useEffect(() => {
    if (searchParams.get("firebaseOnboarding") !== "true") return;
    const email = readMatchingFirebaseOnboardingEmail(
      authRepository.getCurrentFirebaseIdentityEmail(),
    );
    if (!email) {
      setLoginError("Your Firebase onboarding session expired. Sign in again to choose a role.");
      setAuthScreen("login");
      return;
    }
    setGoogleIdentityEmail(email);
    setAuthScreen("signup-role");
  }, [authRepository, searchParams]);

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
      const result = await authRepository.signInWithEmail({ email, password });
      if (result.kind === "verification_required") {
        setVerificationEmail(result.email);
        setAuthScreen("verification");
        return;
      }
      if (result.kind === "onboarding_required") {
        beginRoleSelection(result.email);
        return;
      }
      if (result.user.role !== "buyer") {
        throw new ApiError(403, "This account cannot access the buyer application.");
      }
      setSession({ user: result.user as BuyerSession["user"] });
      setAuthScreen("landing");
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Could not sign in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function registerBuyer(input: RegisterBuyerRequest) {
    if (googleIdentityEmail) {
      const { email: _email, password: _password, ...onboarding } = input;
      const user = await authRepository.onboardBuyer(onboarding);
      if (user.role !== "buyer") {
        throw new ApiError(403, "This account cannot access the buyer application.");
      }
      setSession({ user: user as BuyerSession["user"] });
      setGoogleIdentityEmail("");
      firebaseOnboardingIntent.clear();
      setAuthScreen("landing");
      return;
    }
    const { email, password, ...onboarding } = input;
    const result = await authRepository.signUpWithEmail({ email, password });
    setPendingOnboarding(onboarding);
    setVerificationEmail(result.email);
    setAuthScreen("verification");
  }

  async function loginWithGoogle() {
    setIsSubmitting(true);
    setLoginError("");
    try {
      const result = await authRepository.signInWithGoogle();
      if (!result) return;
      completeGoogleSignIn(result);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Could not sign in with Google.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function requestPasswordReset(email: string) {
    if (!email.trim()) {
      setLoginError("Enter your email address before requesting a password reset.");
      return;
    }
    await authRepository.sendPasswordReset(email.trim());
    setLoginError("Password reset email sent. Check your inbox.");
  }

  async function logout() {
    await authRepository.logout();
    setSession(null);
    setAuthScreen("login");
  }

  async function refreshVerification() {
    setIsSubmitting(true);
    setLoginError("");
    try {
      const result = await authRepository.refreshEmailVerification();
      if (result.kind === "session") {
        if (result.user.role !== "buyer") throw new ApiError(403, "This account cannot access the buyer application.");
        setSession({ user: result.user as BuyerSession["user"] });
        setAuthScreen("landing");
        return;
      }
      if (result.kind === "onboarding_required") {
        if (!pendingOnboarding) {
          beginRoleSelection(result.email);
          return;
        }
        const user = await authRepository.onboardBuyer(pendingOnboarding);
        if (user.role !== "buyer") throw new ApiError(403, "This account cannot access the buyer application.");
        setSession({ user: user as BuyerSession["user"] });
        setAuthScreen("landing");
        return;
      }
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Could not verify your email.");
    } finally {
      setIsSubmitting(false);
    }
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
          onGoogleLogin={loginWithGoogle}
          onForgotPassword={requestPasswordReset}
        />
      ) : null}
      {authScreen === "signup-role" ? (
        <SignUpRoleScreen
          onBack={cancelFirebaseOnboarding}
          onBackHome={closeAuth}
          onSelectRole={(role) => {
            if (role === "buyer") setAuthScreen("signup-form");
            else {
              const path = firebaseOnboardingPortalPath(role);
              if (path && googleIdentityEmail) router.push(path);
              else if (role === "farmer") router.push("/farmer?signup=true");
              else router.push("/transporter?signup=true");
            }
          }}
        />
      ) : null}
      {authScreen === "signup-form" ? (
        <SignUpFormScreen
          identityEmail={googleIdentityEmail || undefined}
          onBack={() => setAuthScreen("signup-role")}
          onBackHome={closeAuth}
          onSubmit={registerBuyer}
        />
      ) : null}
      {authScreen === "verification" ? (
        <EmailVerificationRequired
          email={verificationEmail}
          error={loginError}
          isSubmitting={isSubmitting}
          onBack={() => setAuthScreen("signup-form")}
          onResend={() => authRepository.resendEmailVerification()}
          onRefresh={refreshVerification}
        />
      ) : null}
    </>
  );
}

function isBuyerSession(session: WebSession | null): session is BuyerSession {
  return session?.user.role === "buyer";
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
