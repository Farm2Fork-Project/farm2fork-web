"use client";

import { useState } from "react";

type EmailVerificationRequiredProps = {
  email: string;
  error?: string;
  isSubmitting?: boolean;
  onResend: () => Promise<void>;
  onRefresh: () => Promise<void>;
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
          <h1>Verify your email</h1>
          <p>
            We sent a verification email to <strong>{email}</strong>.
            Verify it, then return here to continue securely.
          </p>
          {error ? <div className="auth-error" role="alert">{error}</div> : null}
          <button className="auth-btn" disabled={isSubmitting} onClick={() => void onRefresh()}>
            {isSubmitting ? "Checking…" : "I have verified my email"}
          </button>
          <button
            className="auth-guest-btn"
            disabled={isSubmitting || resendState === "sending"}
            onClick={() => void handleResend()}
          >
            {resendState === "sending" ? "Sending…" : "Resend verification email"}
          </button>
          {resendState === "sent" ? (
            <p role="status" style={{ color: "var(--success)", fontSize: "13px", textAlign: "center" }}>
              Verification email sent.
            </p>
          ) : null}
          {resendState === "error" ? (
            <p role="alert" style={{ color: "var(--error-red)", fontSize: "13px", textAlign: "center" }}>
              Couldn&apos;t resend the email. Please try again.
            </p>
          ) : null}
          <button className="auth-home-link" disabled={isSubmitting} onClick={onBack}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
