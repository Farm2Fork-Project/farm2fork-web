import type { ReactNode } from "react";
import { JsonLd, organizationNode, websiteNode } from "@/lib/seo/jsonld";
import { type Locale, LOCALE_META } from "@/lib/seo/locale";
import { UI } from "@/lib/seo/ui";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

type JsonNode = Record<string, unknown>;

type Props = {
  children: ReactNode;
  jsonLd?: JsonNode[];
  locale?: Locale;
  /** Registry (English) path of the page, so the header and footer can link to its translation. */
  path?: string;
};

/**
 * Shared frame for public, indexable pages: skip link, header, main landmark, footer, JSON-LD graph.
 * Urdu pages set `lang="ur" dir="rtl"` here, on the outermost element of the page.
 */
export function PageShell({ children, jsonLd = [], locale = "en", path = "/" }: Props) {
  const meta = LOCALE_META[locale];
  const rtl = meta.dir === "rtl";
  return (
    <div
      className={rtl ? "market-landing site-shell site-rtl" : "market-landing site-shell"}
      {...(rtl ? { lang: meta.lang, dir: meta.dir } : {})}
    >
      <a className="site-skip" href="#main">
        {UI[locale].skip}
      </a>
      <SiteHeader locale={locale} path={path} />
      <main id="main">{children}</main>
      <SiteFooter locale={locale} path={path} />
      <JsonLd data={[organizationNode(locale), websiteNode(locale), ...jsonLd]} />
    </div>
  );
}
