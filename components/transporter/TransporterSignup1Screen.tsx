"use client";

import { useState } from "react";
import { LuArrowLeft, LuEyeOff, LuEye, LuTruck } from "react-icons/lu";
import { useLanguage } from "./LanguageContext";

export interface TransporterSignup1ScreenProps {
  onBack: () => void;
  onNext: () => void;
}

export default function TransporterSignup1Screen({ onBack, onNext }: TransporterSignup1ScreenProps) {
  const { t } = useLanguage();
  const [showPw, setShowPw] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleNext = () => {
    setError("");
    if (!firstName.trim() || !lastName.trim()) {
      setError("First and Last name are required.");
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
    onNext();
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-illustration-side">
          <div className="auth-illustration-content">
            <LuTruck size={64} color="var(--primary-green)" style={{ marginBottom: "24px" }} />
            <h1 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "16px", lineHeight: 1.2 }}>
              {t("tsignup.title1")} <br/>{t("tsignup.title2")}
            </h1>
            <p style={{ fontSize: "18px", opacity: 0.9, lineHeight: 1.6, maxWidth: "320px" }}>
              {t("tsignup.subtitle")}
            </p>
          </div>
        </div>

        <div className="auth-form-side" style={{ padding: "48px" }}>
          
          <div style={{ display: "flex", alignItems: "center", marginBottom: "32px" }}>
            <button className="back-btn" onClick={onBack} aria-label="Go back" style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}>
              <LuArrowLeft size={24} color="var(--text-dark)" />
            </button>
            <h2 style={{ fontSize: "24px", fontWeight: 800, marginLeft: "16px", color: "var(--text-dark)" }}>
              {t("tsignup.header")}
            </h2>
          </div>

          {error && (
            <div style={{ color: "#d32f2f", backgroundColor: "#ffebee", padding: "10px", borderRadius: "6px", marginBottom: "16px", fontSize: "14px", border: "1px solid #ffcdd2" }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: "32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: 600, color: "var(--primary-green)", marginBottom: "12px" }}>
              <span>{t("tsignup.step1")}</span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: "50%" }}></div>
            </div>
          </div>

          <div className="animation-fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-dark)" }}>{t("tsignup.personalInfo")}</h3>
            
            <div style={{ display: "flex", gap: "16px" }}>
              <input
                type="text"
                className="auth-input"
                placeholder={t("tsignup.firstName")}
                style={{ flex: 1 }}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <input
                type="text"
                className="auth-input"
                placeholder={t("tsignup.lastName")}
                style={{ flex: 1 }}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <input
              type="text"
              className="auth-input"
              placeholder={t("tsignup.email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="text"
              className="auth-input"
              placeholder={t("tsignup.phone")}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            
            <div className="auth-input-wrapper">
              <input
                type={showPw ? "text" : "password"}
                className="auth-input"
                placeholder={t("tsignup.password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" className="toggle-pw" onClick={() => setShowPw(!showPw)}>
                {showPw ? <LuEye size={20} /> : <LuEyeOff size={20} />}
              </button>
            </div>

            <button 
              className="auth-btn" 
              style={{ marginTop: "16px" }}
              onClick={handleNext}
            >
              {t("tsignup.next")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
