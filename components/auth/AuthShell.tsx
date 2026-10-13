"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useLanguage } from "@/components/LanguageContext";
import { IcGlobe, IcLeaf } from "@/components/icons";

/**
 * Shared frame for every sign-in and sign-up page: brand and language switch
 * on top, a calm form column, and (from 960px) a quiet photo panel with one
 * honest line about the product.
 */
export function AuthShell({ children, panel = true }: { children: ReactNode; panel?: boolean }) {
  const { language, setLanguage, t } = useLanguage();
  const rtl = language === "ur";
  return (
    <div className="af-page" dir={rtl ? "rtl" : "ltr"} lang={rtl ? "ur" : "en"}>
      <header className="af-top">
        <Link className="af-brand" href="/" aria-label={t("auth.homeAria")}>
          <span className="af-brand-mark"><IcLeaf size={22} /></span>
          <span>{t("app.title")}</span>
        </Link>
        <button
          type="button"
          className="af-lang"
          onClick={() => setLanguage(language === "en" ? "ur" : "en")}
          aria-label={t("auth.changeLanguage")}
        >
          <IcGlobe size={17} /> {language === "en" ? "اردو" : "English"}
        </button>
      </header>
      <div className={`af-body${panel ? " af-body--panel" : ""}`}>
        <main className="af-main" id="main">
          <div className="af-column">{children}</div>
        </main>
        {panel ? (
          <aside className="af-panel" aria-label={t("auth.panelAria")}>
            <Image
              src="/landing/farmer-market-hero.png"
              alt=""
              fill
              sizes="(min-width: 960px) 45vw, 0px"
              className="af-panel-image"
              priority={false}
            />
            <p className="af-panel-line">{t("auth.trustLine")}</p>
          </aside>
        ) : null}
      </div>
    </div>
  );
}

export function AuthHeading({ title, lede, id = "af-title" }: { title: string; lede?: string; id?: string }) {
  return (
    <div className="af-heading">
      <h1 id={id} tabIndex={-1}>{title}</h1>
      {lede ? <p>{lede}</p> : null}
    </div>
  );
}

/** A form-level message. Errors are announced; notices are polite. */
export function AuthMessage({ kind, children }: { kind: "error" | "info" | "success"; children: ReactNode }) {
  return (
    <div className={`af-message af-message--${kind}`} role={kind === "error" ? "alert" : "status"}>
      {children}
    </div>
  );
}
