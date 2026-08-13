import type { ApiAuthUser } from "../api/contracts.ts";

export type WebSession = {
  user: ApiAuthUser;
};

export type BuyerSession = WebSession & {
  user: WebSession["user"] & { role: "buyer" };
};

let currentSession: WebSession | null = null;

/**
 * UI-only state for the current document. Browser authentication belongs to
 * the HTTP-only Firebase session cookie, so this value is never persisted.
 */
export const webSession = {
  read(): WebSession | null {
    return currentSession;
  },

  save(session: WebSession): void {
    currentSession = session;
  },

  clear(): void {
    currentSession = null;
  },
};
