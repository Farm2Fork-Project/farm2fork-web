"use client";

import { useState } from "react";
import { LoginScreenProps } from "./types";
import { useLanguage } from "./LanguageContext";
import { IcArrowLeft, IcClose, IcEye, IcEyeOff } from "@/components/icons";

export default function LoginScreen({
  onLogin,
  onGoogleLogin,
  onForgotPassword,
  onGoSignup,
  onBackHome,
  loginError,
  isSubmitting = false,
}: LoginScreenProps) {
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { t } = useLanguage();

  return (
    <div className="auth-wrapper" role="dialog" aria-modal="true" aria-labelledby="login-heading" onMouseDown={(e) => e.target === e.currentTarget && onBackHome?.()}>
      <div className="auth-card auth-card-narrow">
        <div className="auth-form-side">
          {onBackHome && <button className="auth-close" onClick={onBackHome} aria-label={t("login.closeAriaLabel")}><IcClose size={22} /></button>}
          <button className="auth-home-link" onClick={onBackHome}><IcArrowLeft size={16} /> {t("login.backToHome")}</button>
          <div className="auth-heading"><h1 id="login-heading">{t("login.heading")}</h1><p>{t("login.description")}</p></div>

          <div className="auth-form-group">
            <label htmlFor="login-email">{t("login.email")}</label>
            <input
              id="login-email"
              className="auth-input"
              type="text"
              placeholder={t("login.email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="login-password">{t("login.password")}</label>
            <div className="auth-input-wrapper">
              <input
                id="login-password"
                className="auth-input"
                type={showPw ? "text" : "password"}
                placeholder={t("login.password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onLogin(email, password)}
                disabled={isSubmitting}
              />
              <button
                className="toggle-pw"
                onClick={() => setShowPw(!showPw)}
                type="button"
                aria-label={t("login.togglePasswordVisibility")}
              >
                {showPw ? <IcEye size={18} /> : <IcEyeOff size={18} />}
              </button>
            </div>
            <div className="auth-forgot">
              <a
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  if (onForgotPassword) void onForgotPassword(email);
                }}
              >
                {t("login.forgot")}
              </a>
            </div>
          </div>

          {loginError && <div className="auth-error" role="alert">{loginError}</div>}

          <button className="auth-btn" disabled={isSubmitting} onClick={() => onLogin(email, password)} id="login-btn">
            {isSubmitting ? t("login.signingIn") : t("login.submit")}
          </button>

          {onGoogleLogin ? (
            <button
              className="auth-guest-btn"
              disabled={isSubmitting}
              onClick={() => void onGoogleLogin()}
              type="button"
            >
              {t("login.continueWithGoogle")}
            </button>
          ) : null}

          <div className="auth-footer">
            {t("login.noAccount")}{" "}
            <a href="#" onClick={(e) => { e.preventDefault(); onGoSignup(); }}>
              {t("login.signup")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
