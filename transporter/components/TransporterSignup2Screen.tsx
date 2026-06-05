"use client";

import { LuArrowLeft, LuTruck } from "react-icons/lu";
import { useLanguage } from "./LanguageContext";

export interface TransporterSignup2ScreenProps {
  onBack: () => void;
  onSubmit: () => void;
}

export default function TransporterSignup2Screen({ onBack, onSubmit }: TransporterSignup2ScreenProps) {
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
              <span>{t("tsignup.step2")}</span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: "100%" }}></div>
            </div>
          </div>

          <div className="animation-fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-dark)" }}>{t("tsignup.vehicleInfo")}</h3>
            
            <select className="auth-input select" defaultValue="">
              <option value="" disabled>{t("tsignup.vehicleType")}</option>
              <option value="truck">{t("tsignup.truck")}</option>
              <option value="pickup">{t("tsignup.pickup")}</option>
              <option value="van">{t("tsignup.van")}</option>
            </select>
            
            <input type="text" className="auth-input" placeholder={t("tsignup.license")} />
            <input type="text" className="auth-input" placeholder={t("tsignup.serviceArea")} />
            
            <div style={{ display: "flex", gap: "16px", marginTop: "16px" }}>
              <button 
                className="auth-guest-btn" 
                style={{ flex: 1, borderColor: "var(--border-medium)" }}
                onClick={onBack}
              >
                {t("tsignup.back")}
              </button>
              <button 
                className="auth-btn" 
                style={{ flex: 1, margin: 0 }}
                onClick={onSubmit}
              >
                {t("tsignup.create")}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
