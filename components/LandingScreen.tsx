"use client";

import {
  LuLeaf,
  LuArrowRight,
  LuUsers,
  LuGlobe,
  LuCheck,
  LuTruck,
  LuLinkedin,
  LuTwitter,
  LuGithub
} from "react-icons/lu";
import { LandingScreenProps } from "./types";
import { useLanguage } from "./LanguageContext";

export default function LandingScreen({
  onGetStarted,
  onLogin,
}: LandingScreenProps) {
  const { t, language, setLanguage } = useLanguage();

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
          <div className="landing-nav-actions">
            <button
              className="landing-lang-btn"
              onClick={() => setLanguage(language === "en" ? "ur" : "en")}
              aria-label="Toggle Language"
            >
              <LuGlobe size={18} />
              <span>{language === "en" ? "اردو" : "English"}</span>
            </button>
            <button className="landing-nav-login" onClick={onLogin}>
              {t("landing.login")}
            </button>
          </div>
        </nav>

        <main className="landing-hero">
          <div className="landing-hero-grid">
            <div className="landing-hero-text">
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
                <button
                  className="landing-btn-secondary"
                  onClick={() => document.getElementById("benefits-showcase")?.scrollIntoView({ behavior: "smooth" })}
                >
                  {t("landing.learnMore")}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Stakeholder Benefits Section */}
      <section id="benefits-showcase" className="landing-benefits-section">
        <div className="section-header">
          <h2>{t("landing.benefits.title")}</h2>
          <p>{t("landing.benefits.subtitle")}</p>
        </div>

        <div className="benefits-grid">
          {/* For Buyers */}
          <div className="benefit-stakeholder-card">
            <div className="stakeholder-header">
              <div className="stakeholder-icon-box buyer">
                <LuUsers size={32} />
              </div>
              <h3>{t("landing.benefits.buyer")}</h3>
            </div>
            <p className="stakeholder-desc">{t("landing.benefits.buyer.desc")}</p>
            <ul className="stakeholder-bullets">
              <li>
                <LuCheck className="check-icon" />
                <span>100% Verified Provenance</span>
              </li>
              <li>
                <LuCheck className="check-icon" />
                <span>Cold Chain Delivery Safeguards</span>
              </li>
              <li>
                <LuCheck className="check-icon" />
                <span>Secure Digital Checkout</span>
              </li>
            </ul>
          </div>

          {/* For Farmers */}
          <div className="benefit-stakeholder-card">
            <div className="stakeholder-header">
              <div className="stakeholder-icon-box farmer">
                <LuLeaf size={32} />
              </div>
              <h3>{t("landing.benefits.farmer")}</h3>
            </div>
            <p className="stakeholder-desc">{t("landing.benefits.farmer.desc")}</p>
            <ul className="stakeholder-bullets">
              <li>
                <LuCheck className="check-icon" />
                <span>0% Commission Middlemen Policies</span>
              </li>
              <li>
                <LuCheck className="check-icon" />
                <span>Direct Marketplace Publishing</span>
              </li>
              <li>
                <LuCheck className="check-icon" />
                <span>Prompt Escrow Disbursements</span>
              </li>
            </ul>
          </div>

          {/* For Transporters */}
          <div className="benefit-stakeholder-card">
            <div className="stakeholder-header">
              <div className="stakeholder-icon-box transporter">
                <LuTruck size={32} />
              </div>
              <h3>{t("landing.benefits.transporter")}</h3>
            </div>
            <p className="stakeholder-desc">{t("landing.benefits.transporter.desc")}</p>
            <ul className="stakeholder-bullets">
              <li>
                <LuCheck className="check-icon" />
                <span>Transparent Trip Invoicing</span>
              </li>
              <li>
                <LuCheck className="check-icon" />
                <span>QR Dispatch Manifest Handling</span>
              </li>
              <li>
                <LuCheck className="check-icon" />
                <span>Smart Dispatch Router Systems</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Trust & Stats Section */}
      <section className="landing-stats-section">
        <div className="stats-container">
          <div className="landing-stat-card">
            <div className="stat-value">100%</div>
            <div className="stat-label">{t("landing.stats.provenance")}</div>
          </div>
          <div className="landing-stat-card">
            <div className="stat-value">Rs. 0</div>
            <div className="stat-label">{t("landing.stats.middlemen")}</div>
          </div>
          <div className="landing-stat-card">
            <div className="stat-value">500+</div>
            <div className="stat-label">{t("landing.stats.farmers")}</div>
          </div>
          <div className="landing-stat-card">
            <div className="stat-value">12k+</div>
            <div className="stat-label">{t("landing.stats.deliveries")}</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta-section">
        <div className="cta-container">
          <h2>{t("landing.cta.title")}</h2>
          <p>{t("landing.cta.subtitle")}</p>
          <div className="cta-actions">
            <button className="landing-btn-primary" onClick={onGetStarted}>
              {t("landing.getStarted")} <LuArrowRight size={20} />
            </button>
            <button className="landing-btn-secondary focus-white" onClick={onLogin}>
              {t("landing.login")}
            </button>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <div className="landing-logo">
              <LuLeaf size={24} className="logo-icon" />
              <h2>{t("app.title")}</h2>
            </div>
            <p className="footer-tagline">
              Securing agrarian trade pipelines directly from soil to plate.
            </p>
          </div>

          <div className="footer-links-grid">
            <div className="footer-links-col">
              <h4>Platform</h4>
              <a href="#" onClick={(e) => { e.preventDefault(); onGetStarted(); }}>{t("landing.getStarted")}</a>
              <a href="#" onClick={(e) => { e.preventDefault(); onLogin(); }}>{t("landing.login")}</a>
            </div>
            <div className="footer-links-col">
              <h4>Stakeholders</h4>
              <a href="#" onClick={(e) => { e.preventDefault(); onGetStarted(); }}>Farmers</a>
              <a href="#" onClick={(e) => { e.preventDefault(); onGetStarted(); }}>Transporters</a>
              <a href="#" onClick={(e) => { e.preventDefault(); onGetStarted(); }}>Buyers</a>
            </div>
            <div className="footer-links-col">
              <h4>Security</h4>
              <a href="#" onClick={(e) => { e.preventDefault(); }}>Verification System</a>
              <a href="#" onClick={(e) => { e.preventDefault(); }}>Privacy Policy</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} {t("landing.footer.copyright")}</p>
          <div className="footer-socials">
            <a href="#" aria-label="Twitter" onClick={(e) => e.preventDefault()}><LuTwitter size={18} /></a>
            <a href="#" aria-label="Github" onClick={(e) => e.preventDefault()}><LuGithub size={18} /></a>
            <a href="#" aria-label="LinkedIn" onClick={(e) => e.preventDefault()}><LuLinkedin size={18} /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
