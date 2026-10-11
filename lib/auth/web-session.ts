import type { ApiAuthUser } from "../api/contracts.ts";

export type WebSession = {
  user: ApiAuthUser;
};

export type BuyerSession = WebSession & {
  user: WebSession["user"] & { role: "buyer" };
};

let currentSession: WebSession | null = null;
const listeners = new Set<() => void>();

/**
 * UI-only state for the current document. Browser authentication belongs to
 * the HTTP-only Firebase session cookie, so this value is never persisted.
 */
export const webSession = {
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  read(): WebSession | null {
    return currentSession;
  },

  save(session: WebSession): void {
    currentSession = session;
    listeners.forEach((listener) => listener());
  },

  clear(): void {
    currentSession = null;
    listeners.forEach((listener) => listener());
  },
};
