"use client";

import { useState } from "react";
import {
  LuEyeOff,
  LuEye,
  LuArrowLeft,
} from "react-icons/lu";

import { SignUpFormScreenProps } from "./types";
import { useLanguage } from "./LanguageContext";

export default function SignUpFormScreen({ onBack, onSubmit }: SignUpFormScreenProps) {
  const [showPw, setShowPw] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="auth-wrapper">
      <div className="auth-card auth-card-narrow">
        <div className="auth-form-side">
          <div className="auth-card-narrow-header">
            <button className="back-btn" onClick={onBack} aria-label="Go back">
              <LuArrowLeft size={22} />
            </button>
            <h1>{t("signupForm.header")}</h1>
          </div>

          <div className="auth-form-group">
            <label htmlFor="signup-name">{t("signupForm.fullName")}</label>
            <input id="signup-name" className="auth-input" type="text" placeholder={t("signupForm.fullName")} />
          </div>

          <div className="auth-form-group">
            <label htmlFor="signup-email">{t("signupForm.email")}</label>
            <input id="signup-email" className="auth-input" type="text" placeholder={t("signupForm.email")} />
          </div>

          <div className="auth-form-group">
            <label htmlFor="signup-phone">{t("signupForm.phone")}</label>
            <input id="signup-phone" className="auth-input" type="tel" placeholder={t("signupForm.phone")} />
          </div>

          <div className="auth-form-group">
            <label htmlFor="signup-password">{t("signupForm.password")}</label>
            <div className="auth-input-wrapper">
              <input
                id="signup-password"
                className="auth-input"
                type={showPw ? "text" : "password"}
                placeholder={t("signupForm.password")}
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
          </div>

          <div className="auth-form-group">
            <label htmlFor="signup-confirm">{t("signupForm.confirm")}</label>
            <input
              id="signup-confirm"
              className="auth-input"
              type="password"
              placeholder={t("signupForm.confirm")}
            />
          </div>

          <button className="auth-btn" onClick={onSubmit} id="signup-submit-btn">
            {t("signupForm.create")}
          </button>
        </div>
      </div>
    </div>
  );
}
