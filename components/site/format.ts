import type { Locale } from "@/lib/seo/locale";

const FORMAT_LOCALE: Record<Locale, string> = { en: "en-GB", ur: "ur-PK-u-nu-latn" };

/** "2026-10-12" -> "12 October 2026" / "12 اکتوبر 2026", independent of the server's time zone. */
export function formatDate(iso: string, locale: Locale = "en"): string {
  const formatted = new Intl.DateTimeFormat(FORMAT_LOCALE[locale], { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${iso}T00:00:00Z`),
  );
  // Urdu puts a comma after the month ("12 اکتوبر، 2026"); the plain form reads better.
  return locale === "ur" ? formatted.replace("،", "") : formatted;
}
