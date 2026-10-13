"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AuthHeading, AuthMessage } from "@/components/auth/AuthShell";
import { useLanguage } from "@/components/LanguageContext";
import { IcCart, IcChevronRight, IcStore, IcTruck } from "@/components/icons";
import { readMatchingFirebaseOnboardingEmail } from "@/lib/auth/firebase-onboarding-flow.ts";
import { authErrorKey, isCancelledSignIn } from "@/lib/auth/auth-errors.ts";
import { useAuthFlow } from "@/lib/auth/use-auth-flow.ts";

/**
 * "What do you want to do?": one decision per screen. Also the landing spot
 * for a Google or just-verified account that still needs a role (`?continue=1`).
 */
export function RoleChooser() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const continuing = searchParams.get("continue") === "1";
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  // undefined while checking, null when the identity is gone (reload, expired).
  const [identityEmail, setIdentityEmail] = useState<string | null | undefined>(undefined);
  const { auth, afterResult, nextQuery } = useAuthFlow({
    resumeRedirect: !continuing,
    onError: (e) => setError(t(authErrorKey(e))),
  });

  useEffect(() => {
    if (!continuing) return;
    // The Firebase identity exists only in the browser, so it can only be read after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIdentityEmail(readMatchingFirebaseOnboardingEmail(auth.getCurrentFirebaseIdentityEmail()));
  }, [auth, continuing]);

  async function google() {
    setError("");
    setBusy(true);
    try {
      const result = await auth.signInWithGoogle();
      if (result) afterResult(result);
      else return;
    } catch (e) {
      if (!isCancelledSignIn(e)) setError(t(authErrorKey(e)));
      setBusy(false);
    }
  }

  const identitySuffix = continuing ? `?identity=1${nextQuery ? `&${nextQuery.slice(1)}` : ""}` : nextQuery;
  const expired = continuing && identityEmail === null;

  const roles = [
    { id: "buyer", href: `/signup/buyer${identitySuffix}`, icon: <IcCart size={26} />, title: t("signupRole.buyerRole"), body: t("signupRole.buyerDescText") },
    { id: "farmer", href: `/signup/farmer${identitySuffix}`, icon: <IcStore size={26} />, title: t("signupRole.farmerRole"), body: t("signupRole.farmerDescText") },
    { id: "transporter", href: "/transporter", icon: <IcTruck size={26} />, title: t("signupRole.transporterRole"), body: t("signupRole.transporterDescText") },
  ];

  return (
    <>
      <AuthHeading
        title={continuing ? t("signup.continueTitle") : t("signup.chooseTitle")}
        lede={continuing && identityEmail ? t("signup.continueLede").replace("{email}", identityEmail) : t("signup.chooseLede")}
      />
      {error ? <AuthMessage kind="error">{error}</AuthMessage> : null}
      {expired ? (
        <AuthMessage kind="info">
          {t("signup.identityExpired")} <Link className="af-inline-link" href="/login">{t("login.submit")}</Link>
        </AuthMessage>
      ) : (
        <ul className="af-roles">
          {roles.map((role) => (
            <li key={role.id}>
              <Link className="af-role" href={role.href} id={`role-${role.id}`}>
                <span className="af-role-icon">{role.icon}</span>
                <span className="af-role-text">
                  <strong>{role.title}</strong>
                  <span>{role.body}</span>
                </span>
                <IcChevronRight size={20} className="af-role-arrow" />
              </Link>
            </li>
          ))}
        </ul>
      )}

      {!continuing ? (
        <>
          <div className="af-divider"><span>{t("login.or")}</span></div>
          <button type="button" className="af-button af-button--outline" onClick={() => void google()} disabled={busy}>
            {t("login.continueWithGoogle")}
          </button>
          <p className="af-switch">
            {t("signupRole.already")} <Link className="af-inline-link" href={`/login${nextQuery}`}>{t("login.submit")}</Link>
          </p>
        </>
      ) : null}
    </>
  );
}
