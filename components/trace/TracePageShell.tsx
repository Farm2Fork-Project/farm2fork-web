"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { LuGlobe, LuLeaf } from "react-icons/lu";
import { useLanguage } from "../LanguageContext";

/**
 * Minimal public chrome for trace pages: a consumer who scanned a QR on
 * produce lands here without an account, so there is no portal navigation -
 * just the brand, a language switch, and a way into the marketplace.
 */
export default function TracePageShell({ children }: { children: ReactNode }) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="trace-page" dir={language === "ur" ? "rtl" : "ltr"}>
      <header className="trace-page-bar">
        <Link href="/" className="trace-brand">
          <LuLeaf size={22} aria-hidden="true" />
          <span>{t("app.title")}</span>
        </Link>
        <button
          type="button"
          className="market-language"
          onClick={() => setLanguage(language === "en" ? "ur" : "en")}
          aria-label={t("trace.changeLanguage")}
        >
          <LuGlobe size={17} aria-hidden="true" /> {language === "en" ? "اردو" : "English"}
        </button>
      </header>
      <main className="trace-page-main">
        {children}
        <footer className="trace-page-footer">
          <span>{t("trace.poweredBy")}</span>
          <Link href="/" className="btn btn-outline">
            {t("trace.openMarketplace")}
          </Link>
        </footer>
      </main>
    </div>
  );
}
