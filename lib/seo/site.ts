export const SITE_NAME = "Farm2Fork";
export const SITE_TAGLINE = "Fresh produce, direct from Pakistani farmers";
export const SITE_DESCRIPTION =
  "Farm2Fork is a Pakistani farm-to-buyer marketplace where farmers list produce, buyers order directly, transport partners deliver, and every handoff can be traced with a QR code.";

/**
 * Canonical origin used for canonical URLs, the sitemap, Open Graph and
 * JSON-LD. Set NEXT_PUBLIC_SITE_URL to the deployed HTTPS origin; the
 * localhost fallback only keeps local development working.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3001"
).replace(/\/+$/, "");

/** Public contact address. Pages that need it stay hidden until it is set. */
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || undefined;

/** Date the public content was last reviewed as a whole (ISO 8601). */
export const CONTENT_REVIEWED = "2026-10-12";

export const ORGANIZATION = {
  name: SITE_NAME,
  description:
    "Farm2Fork is a blockchain-backed, AI-assisted platform that connects Pakistani farmers directly to buyers, with transport management and QR-based produce traceability. It is a final year project of the Faculty of Information Technology and Computer Science at the University of Central Punjab.",
  country: "PK",
  institution: "University of Central Punjab",
} as const;

/** Urdu counterparts of the site-wide descriptions, used on /ur pages. */
export const SITE_DESCRIPTION_UR =
  "Farm2Fork پاکستان کی کسان سے خریدار تک براہِ راست منڈی ہے جہاں کسان اپنی پیداوار لسٹ کرتے ہیں، خریدار براہِ راست آرڈر دیتے ہیں، ٹرانسپورٹ پارٹنر ڈیلیوری کرتے ہیں، اور ہر مرحلہ QR کوڈ کے ذریعے دیکھا جا سکتا ہے۔";

export const ORGANIZATION_DESCRIPTION_UR =
  "Farm2Fork بلاک چین پر مبنی اور مصنوعی ذہانت سے مدد لینے والا پلیٹ فارم ہے جو پاکستانی کسانوں کو براہِ راست خریداروں سے جوڑتا ہے، اور ٹرانسپورٹ مینجمنٹ اور QR پر مبنی ٹریس ایبلٹی فراہم کرتا ہے۔ یہ یونیورسٹی آف سینٹرل پنجاب کی فیکلٹی آف انفارمیشن ٹیکنالوجی اینڈ کمپیوٹر سائنس کا فائنل ایئر پروجیکٹ ہے۔";

export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//.test(path)) return path;
  const normalised = path.startsWith("/") ? path : `/${path}`;
  return normalised === "/" ? SITE_URL : `${SITE_URL}${normalised}`;
}
