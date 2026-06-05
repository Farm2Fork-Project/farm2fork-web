"use client";

import { useState } from "react";
import {
  LuLeaf,
  LuEyeOff,
  LuEye,
} from "react-icons/lu";

import { LoginScreenProps } from "./types";
import { useLanguage } from "./LanguageContext";

export default function LoginScreen({ onLogin, onGoSignup }: LoginScreenProps) {
  const [showPw, setShowPw] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="auth-wrapper">
      <div className="auth-card auth-card-narrow">
        {/* Form */}
        <div className="auth-form-side">
          <h1>{t("login.title")}</h1>

          <div className="auth-form-group">
            <label htmlFor="login-email">{t("login.email")}</label>
            <input
              id="login-email"
              className="auth-input"
              type="text"
              placeholder={t("login.email")}
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
              />
              <button
                className="toggle-pw"
                onClick={() => setShowPw(!showPw)}
                type="button"
                aria-label="Toggle password visibility"
              >
                {showPw ? <LuEye size={18} /> : <LuEyeOff size={18} />}
              </button>
            </div>
            <div className="auth-forgot">
              <a href="#">{t("login.forgot")}</a>
            </div>
          </div>

          <button className="auth-btn" onClick={onLogin} id="login-btn">
            {t("login.submit")}
          </button>

          <div className="auth-footer">
            {t("login.noAccount")}{" "}
            <a href="#" onClick={(e) => { e.preventDefault(); onGoSignup(); }}>
              {t("login.signup")}
            </a>
          </div>

          <div className="auth-divider">{t("login.or")}</div>

          <button className="auth-guest-btn" onClick={onLogin}>
            {t("login.guest")}
          </button>
        </div>
      </div>
    </div>
  );
}
