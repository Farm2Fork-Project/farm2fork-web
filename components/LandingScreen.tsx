"use client";

import Image from "next/image";
import Link from "next/link";
import { LandingScreenProps } from "./types";
import LandingProducts from "./LandingProducts";
import { useLanguage } from "./LanguageContext";
import { IcArrowRight, IcBadgeCheck, IcCrate, IcGlobe, IcLeaf, IcMapPin, IcScan, IcSprout, IcTruck, IcUsers } from "@/components/icons";

export default function LandingScreen({ onGetStarted, onLogin, seoContent, footerContent }: LandingScreenProps) {
  const { language, setLanguage, t } = useLanguage();

  const isRtl = language === "ur";

  return (
    <div className="market-landing" dir={isRtl ? "rtl" : "ltr"}>
      <header className="market-header">
        <Link className="market-brand" href="/" aria-label="Farm2Fork home">
          <span className="market-brand-mark"><IcLeaf size={22} /></span>
          <span>{t("app.title")}</span>
        </Link>

        <nav className="market-nav" aria-label="Main navigation">
          <Link className="market-nav-item" href="/how-it-works">
            {t("landing.nav.howItWorks")}
          </Link>
          <a className="market-nav-item" href="#people">
            {t("landing.nav.whosItFor")}
          </a>
          <Link className="market-nav-item" href="/traceability">
            {t("landing.nav.traceProduce")}
          </Link>
          <Link className="market-nav-item" href="/guides">
            {t("landing.nav.guides")}
          </Link>
        </nav>

        <div className="market-header-actions">
          <button
            className="market-language"
            onClick={() => setLanguage(language === "en" ? "ur" : "en")}
            aria-label="Change language"
          >
            <IcGlobe size={17} /> {language === "en" ? "اردو" : "English"}
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
                <IcArrowRight
                  size={18}
                  style={{ transform: isRtl ? "scaleX(-1)" : "none", transition: "transform 0.2s" }}
                />
              </button>
              <a className="market-text-link" href="#how-it-works">
                {t("landing.hero.seeHowItWorks")}
              </a>
            </div>
            <div className="market-audience-strip" aria-label="Farm2Fork users">
              <span><IcSprout /> {t("landing.hero.farmers")}</span>
              <span><IcCrate /> {t("landing.hero.buyers")}</span>
              <span><IcTruck /> {t("landing.hero.transporters")}</span>
            </div>
          </div>
          <div className="market-hero-image">
            <Image
              src="/landing/farmer-market-hero.png"
              alt="A Pakistani farmer in a white shalwar kameez sits beside crates of tomatoes, cauliflower and okra, with a decorated truck behind him at dawn"
              fill
              priority
              sizes="(max-width: 1040px) 100vw, 600px"
              className="market-hero-photo"
            />
            <div className="market-photo-caption">
              <IcMapPin size={17} /> {t("landing.hero.badge")}
            </div>
          </div>
        </section>

        <LandingProducts onSignIn={onLogin} />

        <section id="how-it-works" className="market-process market-section">
          <div className="market-section-heading">
            <p>{t("landing.process.pretitle")}</p>
            <h2>
              {t("landing.process.title1")} <em>{t("landing.process.title2")}</em>
            </h2>
          </div>
          <div className="market-process-row">
            <article>
              <IcSprout size={28} />
              <h3>{t("landing.process.step1.title")}</h3>
              <p>{t("landing.process.step1.desc")}</p>
            </article>
            <article>
              <IcUsers size={28} />
              <h3>{t("landing.process.step2.title")}</h3>
              <p>{t("landing.process.step2.desc")}</p>
            </article>
            <article>
              <IcTruck size={28} />
              <h3>{t("landing.process.step3.title")}</h3>
              <p>{t("landing.process.step3.desc")}</p>
            </article>
          </div>
        </section>

        <section id="traceability" className="market-trace market-section">
          <div className="market-trace-copy">
            <IcScan className="market-large-icon" size={36} />
            <h2>
              {t("landing.trace.title1")} <em>{t("landing.trace.title2")}</em>
            </h2>
            <p>{t("landing.trace.desc")}</p>
            <Link className="market-text-link" href="/traceability">
              {t("landing.trace.btn")}{" "}
              <IcArrowRight
                size={17}
                style={{ transform: isRtl ? "scaleX(-1)" : "none", transition: "transform 0.2s" }}
              />
            </Link>
          </div>
          <ol className="market-route" aria-label="Produce journey">
            <li>
              <span><IcSprout /></span>
              <div>
                <strong>{t("landing.trace.step1")}</strong>
                <small>{t("landing.trace.step1.sub")}</small>
              </div>
            </li>
            <li>
              <span><IcCrate /></span>
              <div>
                <strong>{t("landing.trace.step2")}</strong>
                <small>{t("landing.trace.step2.sub")}</small>
              </div>
            </li>
            <li>
              <span><IcTruck /></span>
              <div>
                <strong>{t("landing.trace.step3")}</strong>
                <small>{t("landing.trace.step3.sub")}</small>
              </div>
            </li>
            <li>
              <span><IcBadgeCheck /></span>
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
              <IcSprout />
              <h3><Link href="/for-farmers">{t("landing.people.farmers.title")}</Link></h3>
              <p>{t("landing.people.farmers.desc")}</p>
            </article>
            <article>
              <IcCrate />
              <h3><Link href="/for-buyers">{t("landing.people.buyers.title")}</Link></h3>
              <p>{t("landing.people.buyers.desc")}</p>
            </article>
            <article>
              <IcTruck />
              <h3><Link href="/for-transporters">{t("landing.people.transporters.title")}</Link></h3>
              <p>{t("landing.people.transporters.desc")}</p>
            </article>
          </div>
        </section>

        {seoContent}

        <section className="market-final-cta">
          <div>
            <h2>{t("landing.cta.titleNew")}</h2>
            <p>{t("landing.cta.desc")}</p>
          </div>
          <button className="market-primary market-primary-light" onClick={onGetStarted}>
            {t("landing.cta.btn")}{" "}
            <IcArrowRight
              size={18}
              style={{ transform: isRtl ? "scaleX(-1)" : "none", transition: "transform 0.2s" }}
            />
          </button>
        </section>
      </main>

      {footerContent ?? (
        <footer className="market-footer">
          <div className="market-brand">
            <span className="market-brand-mark"><IcLeaf size={20} /></span>
            <span>{t("app.title")}</span>
          </div>
          <p>{t("landing.footer.desc")}</p>
          <span>{t("landing.footer.fyp")}</span>
        </footer>
      )}
    </div>
  );
}
