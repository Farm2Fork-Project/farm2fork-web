"use client";

import { LuLeaf, LuArrowRight } from "react-icons/lu";
import { LandingScreenProps } from "./types";
import { useLanguage } from "./LanguageContext";

export default function LandingScreen({
  onGetStarted,
  onLogin,
}: LandingScreenProps) {
  const { t } = useLanguage();

  return (
    <div className="landing-wrapper">
      <div className="landing-bg"></div>
      <div className="landing-overlay"></div>

      <div className="landing-content-layer">
        <nav className="landing-nav">
          <div className="landing-logo">
            <LuLeaf size={28} className="logo-icon" />
            <h2>{t("app.title")}</h2>
          </div>
          <button className="landing-nav-login" onClick={onLogin}>
            {t("landing.login")}
          </button>
        </nav>

        <main className="landing-hero">
          <div className="landing-hero-content">
            <h1 className="landing-title">
              {t("landing.title1")} <span>{t("landing.title2")}</span>
            </h1>
            <p className="landing-subtitle">
              {t("landing.subtitle")}
            </p>
            <div className="landing-actions">
              <button className="landing-btn-primary" onClick={onGetStarted}>
                {t("landing.getStarted")} <LuArrowRight size={20} />
              </button>
              <button className="landing-btn-secondary" onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}>
                {t("landing.learnMore")}
              </button>
            </div>
          </div>
        </main>
      </div>

      <section id="features" className="landing-features">
        <div className="feature-card">
          <div className="feature-icon">🔍</div>
          <h3>{t("landing.f1.title")}</h3>
          <p>{t("landing.f1.desc")}</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">👨‍🌾</div>
          <h3>{t("landing.f2.title")}</h3>
          <p>{t("landing.f2.desc")}</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🛡️</div>
          <h3>{t("landing.f3.title")}</h3>
          <p>{t("landing.f3.desc")}</p>
        </div>
      </section>
    </div>
  );
}
