import type { MetadataRoute } from "next";
import { LOCALES, localePath } from "@/lib/seo/locale";
import { languageAlternates } from "@/lib/seo/metadata";
import { ALL_PAGES } from "@/lib/seo/pages";
import { absoluteUrl } from "@/lib/seo/site";

/**
 * Every page is listed once per language, and each entry carries the full set
 * of hreflang alternates (English, Urdu and x-default) so the pairs are
 * reciprocal. English entries come first, then Urdu.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return LOCALES.flatMap((locale) =>
    ALL_PAGES.map((page) => ({
      url: absoluteUrl(localePath(page.path, locale)),
      lastModified: page.lastModified,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: { languages: languageAlternates(page.path) },
    })),
  );
}
