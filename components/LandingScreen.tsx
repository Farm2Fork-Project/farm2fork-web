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
  const { language, setLanguage } = useLanguage();

  return (
    <div className="market-landing" dir={language === "ur" ? "rtl" : "ltr"}>
      <header className="market-header">
        <button className="market-brand" onClick={() => scrollTo("home")} aria-label="Farm2Fork home">
          <span className="market-brand-mark"><LuLeaf size={22} /></span>
          <span>Farm2Fork</span>
        </button>

        <nav className="market-nav" aria-label="Main navigation">
          <button onClick={() => scrollTo("how-it-works")}>How it works</button>
          <button onClick={() => scrollTo("people")}>Who it&apos;s for</button>
          <button onClick={() => scrollTo("traceability")}>Trace produce</button>
        </nav>

        <div className="market-header-actions">
          <button
            className="market-language"
            onClick={() => setLanguage(language === "en" ? "ur" : "en")}
            aria-label="Change language"
          >
            <LuGlobe size={17} /> {language === "en" ? "اردو" : "English"}
          </button>
          <button className="market-signin" onClick={onLogin}>Sign in</button>
          <button className="market-primary market-header-cta" onClick={onGetStarted}>Get started</button>
        </div>
      </header>

      <main id="home">
        <section className="market-hero">
          <div className="market-hero-copy">
            <h1>A fairer market<br />starts <em>at the farm.</em></h1>
            <p>Sell and source fresh produce directly, with clear prices, verified origins, and dependable delivery.</p>
            <div className="market-hero-actions">
              <button className="market-primary" onClick={onGetStarted}>Get started <LuArrowRight size={18} /></button>
              <button className="market-text-link" onClick={() => scrollTo("how-it-works")}>See how it works</button>
            </div>
            <div className="market-audience-strip" aria-label="Farm2Fork users">
              <span><LuSprout /> Farmers</span>
              <span><LuShoppingBasket /> Buyers</span>
              <span><LuTruck /> Transport partners</span>
            </div>
          </div>
          <div className="market-hero-image" role="img" aria-label="Pakistani farmer with fresh produce at a local market">
            <div className="market-photo-caption">
              <LuMapPin size={17} /> Direct from local farms
            </div>
          </div>
        </section>

        <section id="how-it-works" className="market-process market-section">
          <div className="market-section-heading">
            <p>Simple from the first listing</p>
            <h2>From harvest to buyer, <em>without the guesswork.</em></h2>
          </div>
          <div className="market-process-row">
            <article>
              <span>01</span><LuSprout size={28} />
              <h3>List what is ready</h3>
              <p>Add your produce, quantity, and asking price in a few clear steps.</p>
            </article>
            <article>
              <span>02</span><LuUsers size={28} />
              <h3>Agree directly</h3>
              <p>Buyers see the farm, quality details, and price before ordering.</p>
            </article>
            <article>
              <span>03</span><LuTruck size={28} />
              <h3>Move it with confidence</h3>
              <p>A transport partner carries the order while each handoff is tracked.</p>
            </article>
          </div>
        </section>

        <section id="traceability" className="market-trace market-section">
          <div className="market-trace-copy">
            <LuScanLine className="market-large-icon" size={36} />
            <h2>Every handoff, <em>recorded.</em></h2>
            <p>A buyer can scan the Farm2Fork QR code and follow the produce from its farm record to collection, transport, and delivery.</p>
            <button className="market-text-link" onClick={onLogin}>Open produce tracing <LuArrowRight size={17} /></button>
          </div>
          <ol className="market-route" aria-label="Produce journey">
            <li><span><LuSprout /></span><div><strong>Harvested</strong><small>Farm details recorded</small></div></li>
            <li><span><LuShoppingBasket /></span><div><strong>Collected</strong><small>Order and quality checked</small></div></li>
            <li><span><LuTruck /></span><div><strong>In transit</strong><small>Shipment progress updated</small></div></li>
            <li><span><LuBadgeCheck /></span><div><strong>Delivered</strong><small>Journey ready to verify</small></div></li>
          </ol>
        </section>

        <section id="people" className="market-people market-section">
          <div className="market-section-heading">
            <p>One market, three practical roles</p>
            <h2>Built for the people who <em>move food.</em></h2>
          </div>
          <div className="market-people-list">
            <article><LuSprout /><h3>For farmers</h3><p>List produce, get fair-price guidance, manage orders, and apply for financing.</p></article>
            <article><LuShoppingBasket /><h3>For buyers</h3><p>Source fresh produce with clear origin, quality, and delivery information.</p></article>
            <article><LuTruck /><h3>For transport partners</h3><p>Find assigned loads, follow clear routes, and update each delivery step.</p></article>
          </div>
        </section>

        <section className="market-final-cta">
          <div><h2>Ready to sell smarter or source better?</h2><p>Join a more transparent food market, built around the people doing the work.</p></div>
          <button className="market-primary market-primary-light" onClick={onGetStarted}>Choose your role <LuArrowRight size={18} /></button>
        </section>
      </main>

      <footer className="market-footer">
        <div className="market-brand"><span className="market-brand-mark"><LuLeaf size={20} /></span><span>Farm2Fork</span></div>
        <p>Transparent agriculture, from farm to fork.</p>
        <span>Final Year Project · UCP</span>
      </footer>
    </div>
  );
}
