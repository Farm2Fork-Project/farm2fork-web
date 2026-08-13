"use client";

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
  return (
    <div className="auth-wrapper" role="dialog" aria-modal="true">
      <div className="auth-card auth-card-narrow">
        <div className="auth-form-side">
          <h1>Verify your email</h1>
          <p>
            We sent a Firebase verification email to <strong>{email}</strong>.
            Verify it, then return here to continue securely.
          </p>
          {error ? <div className="auth-error" role="alert">{error}</div> : null}
          <button className="auth-btn" disabled={isSubmitting} onClick={() => void onRefresh()}>
            {isSubmitting ? "Checking…" : "I have verified my email"}
          </button>
          <button className="auth-guest-btn" disabled={isSubmitting} onClick={() => void onResend()}>
            Resend verification email
          </button>
          <button className="auth-home-link" disabled={isSubmitting} onClick={onBack}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
