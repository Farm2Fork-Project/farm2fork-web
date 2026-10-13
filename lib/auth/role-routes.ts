import type { UserRole } from "../api/contracts.ts";

/** Where each role lands after signing in. */
export const PORTAL_PATHS: Record<UserRole, string> = {
  buyer: "/",
  farmer: "/farmer",
  financial_partner: "/financial",
  admin: "/admin/dashboard",
  transporter: "/transporter",
};

export function portalPathForRole(role: UserRole): string {
  return PORTAL_PATHS[role] ?? "/";
}

/** The role that owns a portal area, or null for areas open to every signed-in role. */
function areaOwner(path: string): UserRole | null {
  if (/^\/farmer(\/|$)/.test(path)) return "farmer";
  if (/^\/financial(\/|$)/.test(path)) return "financial_partner";
  if (/^\/admin(\/|$)/.test(path)) return "admin";
  if (/^\/transporter(\/|$)/.test(path)) return "transporter";
  return null;
}

/**
 * A `?next=` value is honoured only when it is a same-site path, is not an
 * auth page (no loops), and does not belong to another role's portal.
 */
export function safeNextPath(next: string | null | undefined, role: UserRole): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return null;
  const pathname = next.split(/[?#]/)[0];
  if (/^\/(login|signup|verify-email|forgot-password)(\/|$)/.test(pathname)) return null;
  const owner = areaOwner(pathname);
  if (owner && owner !== role) return null;
  // "/" is the buyer marketplace; for other roles it is only the public landing page.
  if (pathname === "/" && role !== "buyer") return null;
  return next;
}

export function resolvePostLoginPath(role: UserRole, next?: string | null): string {
  return safeNextPath(next, role) ?? portalPathForRole(role);
}

/** The login page a signed-out visitor to a portal is sent to. */
export function loginPathFor(next: string): string {
  return `/login?next=${encodeURIComponent(next)}`;
}
