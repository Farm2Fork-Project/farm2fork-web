"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AuthHeading, AuthMessage } from "@/components/auth/AuthShell";
import { TextField } from "@/components/auth/fields";
import { useLanguage } from "@/components/LanguageContext";
import { authErrorKey } from "@/lib/auth/auth-errors.ts";
import { useAuthFlow } from "@/lib/auth/use-auth-flow.ts";
import { useCooldown } from "@/lib/auth/use-cooldown.ts";
import { isValidEmail } from "@/lib/auth/validation.ts";

export function ForgotPasswordForm() {
  const { t } = useLanguage();
  const { auth } = useAuthFlow();
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [formError, setFormError] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [busy, setBusy] = useState(false);
  const cooldown = useCooldown(30);

  function submit(event: FormEvent) {
    event.preventDefault();
    void send();
  }

  async function send() {
    setFormError("");
    if (!isValidEmail(email)) {
      setFieldError(email.trim() ? t("authError.invalidEmail") : t("login.err.email"));
      return;
    }
    setFieldError("");
    setBusy(true);
    try {
      await auth.sendPasswordReset(email.trim());
      setSentTo(email.trim());
      cooldown.start();
    } catch (error) {
      setFormError(t(authErrorKey(error)));
    } finally {
      setBusy(false);
    }
  }

  if (sentTo) {
    return (
      <>
        <AuthHeading title={t("forgot.sentTitle")} lede={t("forgot.sentLede").replace("{email}", sentTo)} />
        <AuthMessage kind="success">{t("forgot.sentNote")}</AuthMessage>
        <button
          type="button"
          className="af-button af-button--outline"
          disabled={cooldown.active || busy}
          onClick={() => void send()}
        >
          {cooldown.active ? t("verify.resendIn").replace("{seconds}", String(cooldown.remaining)) : t("forgot.sendAgain")}
        </button>
        <p className="af-switch"><Link className="af-inline-link" href="/login">{t("forgot.backToLogin")}</Link></p>
      </>
    );
  }

  return (
    <>
      <AuthHeading title={t("forgot.title")} lede={t("forgot.lede")} />
      {formError ? <AuthMessage kind="error">{formError}</AuthMessage> : null}
      <form className="af-form" onSubmit={submit} noValidate>
        <TextField
          id="forgot-email"
          label={t("login.emailLabel")}
          type="email"
          autoComplete="username"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldError}
          disabled={busy}
          dir="ltr"
        />
        <button type="submit" className="af-button af-button--primary" disabled={busy}>
          {busy ? t("forgot.sending") : t("forgot.submit")}
        </button>
      </form>
      <p className="af-switch"><Link className="af-inline-link" href="/login">{t("forgot.backToLogin")}</Link></p>
    </>
  );
}
