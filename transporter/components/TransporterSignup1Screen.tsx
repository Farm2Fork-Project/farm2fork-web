"use client";

import { LuArrowLeft, LuEyeOff, LuTruck } from "react-icons/lu";
import { useLanguage } from "./LanguageContext";

export interface TransporterSignup1ScreenProps {
  onBack: () => void;
  onNext: () => void;
}

export default function TransporterSignup1Screen({ onBack, onNext }: TransporterSignup1ScreenProps) {
  const { t } = useLanguage();

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
              <input type="text" className="auth-input" placeholder={t("tsignup.firstName")} style={{ flex: 1 }} />
              <input type="text" className="auth-input" placeholder={t("tsignup.lastName")} style={{ flex: 1 }} />
            </div>
            <input type="text" className="auth-input" placeholder={t("tsignup.email")} />
            <input type="text" className="auth-input" placeholder={t("tsignup.phone")} />
            
            <div className="auth-input-wrapper">
              <input type="password" className="auth-input" placeholder={t("tsignup.password")} />
              <button type="button" className="toggle-pw">
                <LuEyeOff size={20} />
              </button>
            </div>

            <button 
              className="auth-btn" 
              style={{ marginTop: "16px" }}
              onClick={onNext}
            >
              {t("tsignup.next")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
