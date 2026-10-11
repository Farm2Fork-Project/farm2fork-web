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

export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//.test(path)) return path;
  const normalised = path.startsWith("/") ? path : `/${path}`;
  return normalised === "/" ? SITE_URL : `${SITE_URL}${normalised}`;
}
