"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AuthHeading, AuthMessage } from "@/components/auth/AuthShell";
import { useLanguage } from "@/components/LanguageContext";
import { IcMail } from "@/components/icons";
import { authErrorKey } from "@/lib/auth/auth-errors.ts";
import { beginFirebaseOnboarding } from "@/lib/auth/firebase-onboarding-flow.ts";
import { onboardFromDraft } from "@/lib/auth/finish-onboarding.ts";
import { resolvePostLoginPath } from "@/lib/auth/role-routes.ts";
import { pendingSignupRole, signupDraft } from "@/lib/auth/signup-draft.ts";
import { useAuthFlow } from "@/lib/auth/use-auth-flow.ts";
import { useCooldown } from "@/lib/auth/use-cooldown.ts";

type Notice = "" | "notYet" | "resent" | "resendFailed";

/**
 * Waits for the person to confirm their email. The Firebase identity lives in
 * memory only, so after a reload there is nothing to check: the page then
 * asks them to sign in again instead of pretending to work.
 */
export function VerifyEmail() {
  const { t } = useLanguage();
  const { auth, account, router, next, nextQuery } = useAuthFlow();
  // undefined until mounted (the Firebase identity is client-only).
  const [email, setEmail] = useState<string | null | undefined>(undefined);
  const [checking, setChecking] = useState(false);
  const [notice, setNotice] = useState<Notice>("");
  const [error, setError] = useState("");
  const cooldown = useCooldown(60);
  const checkingRef = useRef(false);

  useEffect(() => {
    setEmail(auth.getCurrentFirebaseIdentityEmail());
  }, [auth]);

  const check = useCallback(
    async (quiet: boolean) => {
      if (checkingRef.current) return;
      checkingRef.current = true;
      setChecking(true);
      setError("");
      try {
        const result = await auth.refreshEmailVerification();
        if (result.kind === "session") {
          router.replace(resolvePostLoginPath(result.user.role, next));
          return;
        }
        if (result.kind === "verification_required") {
          if (!quiet) setNotice("notYet");
          return;
        }
        // Verified, but there is no profile yet: finish it from the sign-up draft.
        const role = pendingSignupRole.read();
        if (role) {
          const done = await onboardFromDraft(role, signupDraft.read(role), auth, account);
          if (done.ok) {
            router.replace(resolvePostLoginPath(done.user.role, next));
            return;
          }
        }
        beginFirebaseOnboarding(result.email);
        const suffix = next ? `&next=${encodeURIComponent(next)}` : "";
        router.replace(role ? `/signup/${role}?identity=1${suffix}` : `/signup?continue=1${suffix}`);
      } catch (e) {
        if (!quiet) setError(t(authErrorKey(e)));
      } finally {
        checkingRef.current = false;
        setChecking(false);
      }
    },
    [account, auth, next, router, t],
  );

  // Coming back from the inbox tab is the usual moment verification finishes.
  useEffect(() => {
    if (!email) return;
    const onFocus = () => void check(true);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [check, email]);

  async function resend() {
    setError("");
    setNotice("");
    try {
      await auth.resendEmailVerification();
      setNotice("resent");
      cooldown.start();
    } catch (e) {
      setNotice("resendFailed");
      setError(t(authErrorKey(e)));
    }
  }

  if (email === undefined) return <AuthHeading title={t("verify.title")} />;

  if (email === null) {
    return (
      <>
        <AuthHeading title={t("verify.lostTitle")} lede={t("verify.lostLede")} />
        <Link className="af-button af-button--primary" href={`/login${nextQuery}`}>{t("verify.signInAgain")}</Link>
      </>
    );
  }

  return (
    <>
      <span className="af-badge-icon"><IcMail size={28} /></span>
      <AuthHeading title={t("verify.title")} lede={t("verify.lede").replace("{email}", email)} />
      {error ? <AuthMessage kind="error">{error}</AuthMessage> : null}
      {notice === "notYet" ? <AuthMessage kind="info">{t("verify.notYet")}</AuthMessage> : null}
      {notice === "resent" ? <AuthMessage kind="success">{t("verify.resent")}</AuthMessage> : null}
      <div className="af-form">
        <button type="button" className="af-button af-button--primary" onClick={() => void check(false)} disabled={checking}>
          {checking ? t("verify.checking") : t("verify.done")}
        </button>
        <button type="button" className="af-button af-button--outline" onClick={() => void resend()} disabled={cooldown.active || checking}>
          {cooldown.active ? t("verify.resendIn").replace("{seconds}", String(cooldown.remaining)) : t("verify.resend")}
        </button>
      </div>
      <p className="af-footnote">{t("verify.spam")}</p>
      <p className="af-switch"><Link className="af-inline-link" href="/login">{t("verify.differentAccount")}</Link></p>
    </>
  );
}
