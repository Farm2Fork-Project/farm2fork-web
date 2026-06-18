"use client";

import { useState } from "react";
import {
  LuLeaf,
  LuArrowRight,
  LuTruck,
  LuShoppingBag,
  LuQrCode,
  LuShieldCheck,
  LuUsers,
  LuGlobe,
  LuDatabase,
  LuMapPin,
  LuClock,
  LuThermometer,
  LuCheck,
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
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      key: "harvest",
      icon: LuLeaf,
      titleKey: "landing.provenance.step1",
      descKey: "landing.provenance.step1.desc",
      hash: "0x8f3c9b7e1d5a6c3f2b8e901a2d3c4b5a6982f1bc3d4e5f6a7b8c9d0e1f2a3b4c",
      operator: "Hassan Organic Farm (PK-FMR-042)",
      status: "Harvested & Graded (Grade A)",
      temp: "22°C (Ambient)",
      location: "Sargodha, Punjab",
      timestamp: "2026-06-15 06:30:12 UTC",
    },
    {
      key: "transit",
      icon: LuTruck,
      titleKey: "landing.provenance.step2",
      descKey: "landing.provenance.step2.desc",
      hash: "0x4c9e5fa32b810d7c9a6f3b0e1d8c7a6e5b4d3c2b1a0e9f8d7c6b5a4f3e2d1c0b",
      operator: "Rehan Logistics (PK-TRN-109)",
      status: "Cold Chain Active & In Transit",
      temp: "4.5°C (Refrigerated Van)",
      location: "Lahore-Islamabad Motorway (M-2)",
      timestamp: "2026-06-15 09:15:45 UTC",
    },
    {
      key: "marketplace",
      icon: LuShoppingBag,
      titleKey: "landing.provenance.step3",
      descKey: "landing.provenance.step3.desc",
      hash: "0x1a8b0d9f8e7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a",
      operator: "Farm2Fork Marketplace Smart Contract",
      status: "Listed on Smart Ledger",
      temp: "18°C (Hub Storage)",
      location: "Main Distribution Center, Islamabad",
      timestamp: "2026-06-15 11:00:00 UTC",
    },
    {
      key: "fork",
      icon: LuQrCode,
      titleKey: "landing.provenance.step4",
      descKey: "landing.provenance.step4.desc",
      hash: "0xe7d288cba1b9d0c8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4",
      operator: "Consumer App Scan (PK-BYR-772)",
      status: "Trace Verified & Delivered",
      temp: "N/A (Delivered)",
      location: "F-11, Islamabad",
      timestamp: "2026-06-16 10:00:00 UTC",
    },
  ];

  const currentStepData = steps[activeStep];
  const StepIcon = currentStepData.icon;

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
              <div className="landing-hero-badge">
                <LuShieldCheck size={16} />
                <span>{t("landing.hero.badge")}</span>
              </div>
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
                  onClick={() => document.getElementById("provenance-showcase")?.scrollIntoView({ behavior: "smooth" })}
                >
                  {t("landing.learnMore")}
                </button>
              </div>
            </div>

            <div className="landing-hero-visual">
              <div className="hero-mockup-card">
                <div className="mockup-header">
                  <div className="mockup-header-dot red"></div>
                  <div className="mockup-header-dot yellow"></div>
                  <div className="mockup-header-dot green"></div>
                  <span className="mockup-title">F2F Ledger Registry</span>
                </div>
                <div className="mockup-body">
                  <div className="mockup-product-row">
                    <div className="mockup-product-img">
                      <LuLeaf size={32} />
                    </div>
                    <div className="mockup-product-info">
                      <span className="mockup-p-badge">Featured Produce</span>
                      <h4>Sindhri Mangoes</h4>
                      <p>Sindh Mango Estate</p>
                    </div>
                    <div className="mockup-p-price">
                      <span>Rs. 350</span>
                      <small>/ dozen</small>
                    </div>
                  </div>
                  
                  <div className="mockup-ledger-trace">
                    <div className="trace-item completed">
                      <span className="trace-dot"></span>
                      <div className="trace-details">
                        <h5>Harvested</h5>
                        <p>Grade A | Sargodha, Punjab</p>
                      </div>
                    </div>
                    <div className="trace-item completed">
                      <span className="trace-dot"></span>
                      <div className="trace-details">
                        <h5>In Transit</h5>
                        <p>Cold chain active | 4.5°C</p>
                      </div>
                    </div>
                    <div className="trace-item verification-pulse">
                      <span className="trace-dot"></span>
                      <div className="trace-details">
                        <h5>Blockchain Verification</h5>
                        <p>Ledger Hash Locked</p>
                      </div>
                    </div>
                  </div>

                  <div className="mockup-qr-scan">
                    <LuQrCode size={20} className="qr-pulse-icon" />
                    <span>Scan provenance certificate via App</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Interactive Supply Chain Provenance Section */}
      <section id="provenance-showcase" className="landing-provenance-section">
        <div className="section-header">
          <h2>{t("landing.provenance.title")}</h2>
          <p>{t("landing.provenance.subtitle")}</p>
        </div>

        <div className="provenance-grid">
          <div className="provenance-stepper">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.key}
                  className={`provenance-step-card ${activeStep === index ? "active" : ""}`}
                  onClick={() => setActiveStep(index)}
                >
                  <div className="step-number">0{index + 1}</div>
                  <div className="step-icon-box">
                    <Icon size={24} />
                  </div>
                  <div className="step-info">
                    <h3>{t(step.titleKey)}</h3>
                    <p>{t(step.descKey)}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="blockchain-terminal-container">
            <div className="blockchain-terminal">
              <div className="terminal-header">
                <div className="terminal-leds">
                  <span className="led green pulse"></span>
                  <span className="led blue"></span>
                </div>
                <div className="terminal-title">
                  <LuDatabase size={14} />
                  <span>BLOCKCHAIN LEDGER CERTIFICATE</span>
                </div>
                <div className="terminal-badge">{t("landing.provenance.verified")}</div>
              </div>

              <div className="terminal-body">
                <div className="terminal-row">
                  <span className="terminal-label">{t("landing.provenance.hash")}</span>
                  <span className="terminal-value hash">{currentStepData.hash}</span>
                </div>
                <div className="terminal-row">
                  <span className="terminal-label">{t("landing.provenance.status")}</span>
                  <span className="terminal-value status-badge">{currentStepData.status}</span>
                </div>
                <div className="terminal-row">
                  <span className="terminal-label">{t("landing.provenance.operator")}</span>
                  <span className="terminal-value">{currentStepData.operator}</span>
                </div>
                <div className="terminal-row">
                  <span className="terminal-label">Location GPS</span>
                  <span className="terminal-value flex-align">
                    <LuMapPin size={14} className="terminal-icon" />
                    {currentStepData.location}
                  </span>
                </div>
                <div className="terminal-row">
                  <span className="terminal-label">{t("landing.provenance.temp")}</span>
                  <span className="terminal-value flex-align">
                    <LuThermometer size={14} className="terminal-icon" />
                    {currentStepData.temp}
                  </span>
                </div>
                <div className="terminal-row">
                  <span className="terminal-label">{t("landing.provenance.timestamp")}</span>
                  <span className="terminal-value flex-align">
                    <LuClock size={14} className="terminal-icon" />
                    {currentStepData.timestamp}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stakeholder Benefits Section */}
      <section className="landing-benefits-section">
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
          <div className="stat-card">
            <div className="stat-value">100%</div>
            <div className="stat-label">{t("landing.stats.provenance")}</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">Rs. 0</div>
            <div className="stat-label">{t("landing.stats.middlemen")}</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">500+</div>
            <div className="stat-label">{t("landing.stats.farmers")}</div>
          </div>
          <div className="stat-card">
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
              <a href="#" onClick={(e) => { e.preventDefault(); }}>Blockchain Ledger</a>
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
