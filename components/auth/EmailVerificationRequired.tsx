"use client";

import { useState } from "react";
import { useLanguage } from "@/components/LanguageContext";

type EmailVerificationRequiredProps = {
  email: string;
  error?: string;
  isSubmitting?: boolean;
  onResend(): Promise<void>;
  onRefresh(): Promise<void>;
  onBack: () => void;
};

export function EmailVerificationRequired({
  email,
  error = "",
  isSubmitting = false,
  onResend,
  onRefresh,
  onBack,
}: EmailVerificationRequiredProps) {
  const { t } = useLanguage();
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleResend() {
    setResendState("sending");
    try {
      await onResend();
      setResendState("sent");
    } catch {
      setResendState("error");
    }
  }

  return (
    <div className="auth-wrapper" role="dialog" aria-modal="true">
      <div className="auth-card auth-card-narrow">
        <div className="auth-form-side">
          <h1>{t("verify.title")}</h1>
          <p>
            {t("verify.lede").replace("{email}", email)}
          </p>
          {error ? <div className="auth-error" role="alert">{error}</div> : null}
          <button className="auth-btn" disabled={isSubmitting} onClick={() => void onRefresh()}>
            {isSubmitting ? t("verify.checking") : t("verify.done")}
          </button>
          <button
            className="auth-guest-btn"
            disabled={isSubmitting || resendState === "sending"}
            onClick={() => void handleResend()}
          >
            {resendState === "sending" ? t("forgot.sending") : t("verify.resend")}
          </button>
          {resendState === "sent" ? (
            <p role="status" style={{ color: "var(--success)", fontSize: "13px", textAlign: "center" }}>
              {t("verify.resent")}
            </p>
          ) : null}
          {resendState === "error" ? (
            <p role="alert" style={{ color: "var(--error-red)", fontSize: "13px", textAlign: "center" }}>
              {t("authError.generic")}
            </p>
          ) : null}
          <button className="auth-home-link" disabled={isSubmitting} onClick={onBack}>
            {t("signup.back")}
          </button>
        </div>
      </div>
    </div>
  );
}
