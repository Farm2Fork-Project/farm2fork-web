"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { AuthHeading, AuthMessage } from "@/components/auth/AuthShell";
import { PasswordField, TextField } from "@/components/auth/fields";
import { useLanguage } from "@/components/LanguageContext";
import { ApiClient } from "@/lib/api/client.ts";
import type { ApiAuthUser } from "@/lib/api/contracts.ts";
import { authErrorKey, isCancelledSignIn } from "@/lib/auth/auth-errors.ts";
import { resolvePostLoginPath } from "@/lib/auth/role-routes.ts";
import { useAuthFlow } from "@/lib/auth/use-auth-flow.ts";
import { isValidEmail } from "@/lib/auth/validation.ts";

type Errors = { email?: string; password?: string };

export function LoginForm() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState<"email" | "google" | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { auth, afterResult, next, router } = useAuthFlow({
    resumeRedirect: true,
    onError: (error) => setFormError(t(authErrorKey(error))),
  });

  // Someone who is already signed in has no use for the form: send them on.
  // (Not right after signing out, in case the sign-out could not reach the server.)
  const justSignedOut = !!searchParams.get("signedout");
  useEffect(() => {
    if (justSignedOut) return;
    let active = true;
    new ApiClient()
      .request<ApiAuthUser>("/auth/me")
      .then((user) => {
        if (active) router.replace(resolvePostLoginPath(user.role, next));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [justSignedOut, next, router]);

  function validate(): Errors {
    const next: Errors = {};
    if (!email.trim()) next.email = t("login.err.email");
    else if (!isValidEmail(email)) next.email = t("authError.invalidEmail");
    if (!password) next.password = t("login.err.password");
    return next;
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setFormError("");
    const found = validate();
    setErrors(found);
    if (found.email || found.password) {
      setTimeout(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), 0);
      return;
    }
    setBusy("email");
    try {
      afterResult(await auth.signInWithEmail({ email: email.trim(), password }));
    } catch (error) {
      setFormError(t(authErrorKey(error)));
      setBusy(null);
    }
  }

  async function google() {
    setFormError("");
    setBusy("google");
    try {
      const result = await auth.signInWithGoogle();
      // Redirect sign-in (deployed HTTPS) returns null here and finishes after the redirect.
      if (result) afterResult(result);
      else return;
    } catch (error) {
      if (!isCancelledSignIn(error)) setFormError(t(authErrorKey(error)));
      setBusy(null);
    }
  }

  const nextParam = searchParams.get("next");
  const signupHref = "/signup";
  const disabled = busy !== null;

  return (
    <>
      <AuthHeading title={t("login.heading")} lede={t("login.lede")} />
      {searchParams.get("signedout") ? <AuthMessage kind="success">{t("login.signedOut")}</AuthMessage> : null}
      {nextParam && !searchParams.get("signedout") ? <AuthMessage kind="info">{t("login.nextNotice")}</AuthMessage> : null}
      {formError ? <AuthMessage kind="error">{formError}</AuthMessage> : null}

      <form ref={formRef} className="af-form" onSubmit={submit} noValidate>
        <TextField
          id="login-email"
          label={t("login.emailLabel")}
          type="email"
          autoComplete="username"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          disabled={disabled}
          dir="ltr"
        />
        <div className="af-password-row">
          <PasswordField
            id="login-password"
            label={t("login.password")}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            disabled={disabled}
          />
          <Link className="af-inline-link af-forgot" href="/forgot-password">{t("login.forgot")}</Link>
        </div>
        <button type="submit" className="af-button af-button--primary" disabled={disabled}>
          {busy === "email" ? t("login.signingIn") : t("login.submit")}
        </button>
      </form>

      <div className="af-divider"><span>{t("login.or")}</span></div>

      <button type="button" className="af-button af-button--outline" onClick={() => void google()} disabled={disabled}>
        <GoogleMark /> {busy === "google" ? t("login.signingIn") : t("login.continueWithGoogle")}
      </button>

      <p className="af-footnote">{t("login.staffNote")}</p>
      <p className="af-switch">
        {t("login.noAccount")} <Link className="af-inline-link" href={signupHref}>{t("login.createAccount")}</Link>
      </p>
    </>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.1 5.3-4.5 7l7.3 5.7c4.3-4 6.9-9.9 6.9-17.2z" />
      <path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.3-5.7c-2 1.4-4.7 2.3-8.6 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}
