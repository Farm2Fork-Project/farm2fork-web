/**
 * Public pages exist in English (the default, at the root) and Urdu (under
 * `/ur`). "Registry paths" such as `/about` are always the English path and act
 * as the key that ties a page to its translation; `localePath` turns one into
 * the URL for a given locale.
 */
export type Locale = "en" | "ur";

export const LOCALES: readonly Locale[] = ["en", "ur"];
export const DEFAULT_LOCALE: Locale = "en";
export const URDU_PREFIX = "/ur";

export const LOCALE_META: Record<Locale, { lang: string; dir: "ltr" | "rtl"; ogLocale: string; label: string }> = {
  en: { lang: "en", dir: "ltr", ogLocale: "en_PK", label: "English" },
  ur: { lang: "ur", dir: "rtl", ogLocale: "ur_PK", label: "اردو" },
};

/** "/about" -> "/ur/about", "/" -> "/ur". English paths are returned unchanged. */
export function localePath(path: string, locale: Locale): string {
  if (locale === "en") return path;
  return path === "/" ? URDU_PREFIX : `${URDU_PREFIX}${path}`;
}

/** "/ur/about" -> "/about", "/ur" -> "/". Paths without the prefix are returned unchanged. */
export function stripLocalePrefix(path: string): string {
  if (path === URDU_PREFIX) return "/";
  return path.startsWith(`${URDU_PREFIX}/`) ? path.slice(URDU_PREFIX.length) : path;
}

export function localeOfPath(path: string): Locale {
  return path === URDU_PREFIX || path.startsWith(`${URDU_PREFIX}/`) ? "ur" : "en";
}
