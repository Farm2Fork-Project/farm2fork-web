import type { Metadata } from "next";
import { LOCALES, LOCALE_META, type Locale, localePath } from "./locale";
import { SITE_NAME, absoluteUrl } from "./site";
import { pageFor } from "./pages";

type Options = {
  /** Registry path (always the English path). Title and description come from the registry. */
  path: string;
  /** Language of the page being described. Defaults to English. */
  locale?: Locale;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  /** Overrides the default per-site Open Graph image. */
  image?: { url: string; alt: string };
};

const DEFAULT_IMAGE_ALT: Record<Locale, string> = {
  en: "Farm2Fork: fresh produce direct from Pakistani farmers",
  ur: "Farm2Fork: پاکستانی کسانوں سے براہِ راست تازہ پیداوار",
};

/** hreflang alternates for a registry path: every language plus x-default (English). */
export function languageAlternates(path: string): Record<string, string> {
  return {
    ...Object.fromEntries(LOCALES.map((locale) => [LOCALE_META[locale].lang, absoluteUrl(localePath(path, locale))])),
    "x-default": absoluteUrl(path),
  };
}

/**
 * Builds page metadata with a canonical URL, hreflang alternates, Open Graph
 * and Twitter tags. Open Graph is spelled out because a page-level `openGraph`
 * replaces the parent's, so inherited values would be lost.
 */
export function buildMetadata({ path, locale = "en", type = "website", publishedTime, modifiedTime, image }: Options): Metadata {
  const page = pageFor(path, locale);
  const url = absoluteUrl(localePath(path, locale));
  const isHome = path === "/";
  const socialTitle = isHome ? page.title : `${page.title} | ${SITE_NAME}`;
  const images = [
    image
      ? { url: image.url, width: 1200, height: 630, alt: image.alt }
      : {
          url: absoluteUrl("/opengraph-image"),
          width: 1200,
          height: 630,
          alt: DEFAULT_IMAGE_ALT[locale],
        },
  ];

  return {
    title: isHome ? { absolute: page.title } : page.title,
    description: page.description,
    alternates: { canonical: url, languages: languageAlternates(path) },
    openGraph: {
      type,
      url,
      siteName: SITE_NAME,
      locale: LOCALE_META[locale].ogLocale,
      alternateLocale: LOCALES.filter((other) => other !== locale).map((other) => LOCALE_META[other].ogLocale),
      title: socialTitle,
      description: page.description,
      images,
      ...(type === "article" ? { publishedTime, modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: page.description,
      images: images.map((entry) => entry.url),
    },
  };
}
