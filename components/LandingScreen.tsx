"use client";

import {
  LuArrowRight,
  LuBadgeCheck,
  LuGlobe,
  LuLeaf,
  LuMapPin,
  LuScanLine,
  LuShoppingBasket,
  LuSprout,
  LuTruck,
  LuUsers,
} from "react-icons/lu";
import { LandingScreenProps } from "./types";
import { useLanguage } from "./LanguageContext";

const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

export default function LandingScreen({ onGetStarted, onLogin }: LandingScreenProps) {
  const { language, setLanguage, t } = useLanguage();

  const isRtl = language === "ur";

  return (
    <div className="market-landing" dir={isRtl ? "rtl" : "ltr"}>
      <header className="market-header">
        <button className="market-brand" onClick={() => scrollTo("home")} aria-label="Farm2Fork home">
          <span className="market-brand-mark"><LuLeaf size={22} /></span>
          <span>{t("app.title")}</span>
        </button>

        <nav className="market-nav" aria-label="Main navigation">
          <button className="market-nav-item" onClick={() => scrollTo("how-it-works")}>
            {t("landing.nav.howItWorks")}
          </button>
          <button className="market-nav-item" onClick={() => scrollTo("people")}>
            {t("landing.nav.whosItFor")}
          </button>
          <button className="market-nav-item" onClick={() => scrollTo("traceability")}>
            {t("landing.nav.traceProduce")}
          </button>
        </nav>

        <div className="market-header-actions">
          <button
            className="market-language"
            onClick={() => setLanguage(language === "en" ? "ur" : "en")}
            aria-label="Change language"
          >
            <LuGlobe size={17} /> {language === "en" ? "اردو" : "English"}
          </button>
          <button className="market-signin" onClick={onLogin}>
            {t("landing.nav.signIn")}
          </button>
          <button className="market-primary market-header-cta" onClick={onGetStarted}>
            {t("landing.getStarted")}
          </button>
        </div>
      </header>

      <main id="home">
        <section className="market-hero">
          <div className="market-hero-copy">
            <h1>
              {t("landing.hero.title1")}
              <br />
              <em>{t("landing.hero.title2")}</em>
            </h1>
            <p>{t("landing.hero.desc")}</p>
            <div className="market-hero-actions">
              <button className="market-primary" onClick={onGetStarted}>
                {t("landing.getStarted")}{" "}
                <LuArrowRight 
                  size={18} 
                  style={{ transform: isRtl ? "scaleX(-1)" : "none", transition: "transform 0.2s" }} 
                />
              </button>
              <button className="market-text-link" onClick={() => scrollTo("how-it-works")}>
                {t("landing.hero.seeHowItWorks")}
              </button>
            </div>
            <div className="market-audience-strip" aria-label="Farm2Fork users">
              <span><LuSprout /> {t("landing.hero.farmers")}</span>
              <span><LuShoppingBasket /> {t("landing.hero.buyers")}</span>
              <span><LuTruck /> {t("landing.hero.transporters")}</span>
            </div>
          </div>
          <div className="market-hero-image" role="img" aria-label="Pakistani farmer with fresh produce at a local market">
            <div className="market-photo-caption">
              <LuMapPin size={17} /> {t("landing.hero.badge")}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="market-process market-section">
          <div className="market-section-heading">
            <p>{t("landing.process.pretitle")}</p>
            <h2>
              {t("landing.process.title1")} <em>{t("landing.process.title2")}</em>
            </h2>
          </div>
          <div className="market-process-row">
            <article>
              <span>01</span><LuSprout size={28} />
              <h3>{t("landing.process.step1.title")}</h3>
              <p>{t("landing.process.step1.desc")}</p>
            </article>
            <article>
              <span>02</span><LuUsers size={28} />
              <h3>{t("landing.process.step2.title")}</h3>
              <p>{t("landing.process.step2.desc")}</p>
            </article>
            <article>
              <span>03</span><LuTruck size={28} />
              <h3>{t("landing.process.step3.title")}</h3>
              <p>{t("landing.process.step3.desc")}</p>
            </article>
          </div>
        </section>

        <section id="traceability" className="market-trace market-section">
          <div className="market-trace-copy">
            <LuScanLine className="market-large-icon" size={36} />
            <h2>
              {t("landing.trace.title1")} <em>{t("landing.trace.title2")}</em>
            </h2>
            <p>{t("landing.trace.desc")}</p>
            <button className="market-text-link" onClick={onLogin}>
              {t("landing.trace.btn")}{" "}
              <LuArrowRight 
                size={17} 
                style={{ transform: isRtl ? "scaleX(-1)" : "none", transition: "transform 0.2s" }} 
              />
            </button>
          </div>
          <ol className="market-route" aria-label="Produce journey">
            <li>
              <span><LuSprout /></span>
              <div>
                <strong>{t("landing.trace.step1")}</strong>
                <small>{t("landing.trace.step1.sub")}</small>
              </div>
            </li>
            <li>
              <span><LuShoppingBasket /></span>
              <div>
                <strong>{t("landing.trace.step2")}</strong>
                <small>{t("landing.trace.step2.sub")}</small>
              </div>
            </li>
            <li>
              <span><LuTruck /></span>
              <div>
                <strong>{t("landing.trace.step3")}</strong>
                <small>{t("landing.trace.step3.sub")}</small>
              </div>
            </li>
            <li>
              <span><LuBadgeCheck /></span>
              <div>
                <strong>{t("landing.trace.step4")}</strong>
                <small>{t("landing.trace.step4.sub")}</small>
              </div>
            </li>
          </ol>
        </section>

        <section id="people" className="market-people market-section">
          <div className="market-section-heading">
            <p>{t("landing.people.pretitle")}</p>
            <h2>
              {t("landing.people.title1")} <em>{t("landing.people.title2")}</em>
            </h2>
          </div>
          <div className="market-people-list">
            <article>
              <LuSprout />
              <h3>{t("landing.people.farmers.title")}</h3>
              <p>{t("landing.people.farmers.desc")}</p>
            </article>
            <article>
              <LuShoppingBasket />
              <h3>{t("landing.people.buyers.title")}</h3>
              <p>{t("landing.people.buyers.desc")}</p>
            </article>
            <article>
              <LuTruck />
              <h3>{t("landing.people.transporters.title")}</h3>
              <p>{t("landing.people.transporters.desc")}</p>
            </article>
          </div>
        </section>

        <section className="market-final-cta">
          <div>
            <h2>{t("landing.cta.titleNew")}</h2>
            <p>{t("landing.cta.desc")}</p>
          </div>
          <button className="market-primary market-primary-light" onClick={onGetStarted}>
            {t("landing.cta.btn")}{" "}
            <LuArrowRight 
              size={18} 
              style={{ transform: isRtl ? "scaleX(-1)" : "none", transition: "transform 0.2s" }} 
            />
          </button>
        </section>
      </main>

      <footer className="market-footer">
        <div className="market-brand">
          <span className="market-brand-mark"><LuLeaf size={20} /></span>
          <span>{t("app.title")}</span>
        </div>
        <p>{t("landing.footer.desc")}</p>
        <span>{t("landing.footer.fyp")}</span>
      </footer>
    </div>
  );
}
