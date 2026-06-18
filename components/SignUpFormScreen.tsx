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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const { t } = useLanguage();

  const handleSignUp = () => {
    setError("");
    if (!name.trim()) {
      setError("Full Name is required.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!phone.trim()) {
      setError("Phone number is required.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    // Call onSubmit on successful validation
    onSubmit();
  };

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

          {error && (
            <div style={{ color: "#d32f2f", backgroundColor: "#ffebee", padding: "10px", borderRadius: "6px", marginBottom: "16px", fontSize: "14px", border: "1px solid #ffcdd2" }}>
              {error}
            </div>
          )}

          <div className="auth-form-group">
            <label htmlFor="signup-name">{t("signupForm.fullName")}</label>
            <input
              id="signup-name"
              className="auth-input"
              type="text"
              placeholder={t("signupForm.fullName")}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="signup-email">{t("signupForm.email")}</label>
            <input
              id="signup-email"
              className="auth-input"
              type="text"
              placeholder={t("signupForm.email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="signup-phone">{t("signupForm.phone")}</label>
            <input
              id="signup-phone"
              className="auth-input"
              type="tel"
              placeholder={t("signupForm.phone")}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="signup-password">{t("signupForm.password")}</label>
            <div className="auth-input-wrapper">
              <input
                id="signup-password"
                className="auth-input"
                type={showPw ? "text" : "password"}
                placeholder={t("signupForm.password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          <button className="auth-btn" onClick={handleSignUp} id="signup-submit-btn">
            {t("signupForm.create")}
          </button>
        </div>
      </div>
    </div>
  );
}
