import type { ApiAuthUser, WebRole } from "../api/contracts.ts";

export const WEB_SESSION_KEY = "farm2fork.web.session.v1";

export type WebSession = {
  accessToken: string;
  user: Pick<ApiAuthUser, "id" | "email" | "isVerified" | "isActive"> & {
    role: WebRole;
  };
};

export type BuyerSession = WebSession & {
  user: WebSession["user"] & { role: "buyer" };
};

type SessionStorageLike = Pick<Storage, "getItem" | "removeItem" | "setItem">;

function getSessionStorage(): SessionStorageLike | null {
  try {
    return typeof globalThis.sessionStorage === "undefined"
      ? null
      : globalThis.sessionStorage;
  } catch {
    return null;
  }
}

function isWebSession(value: unknown): value is WebSession {
  if (!value || typeof value !== "object") return false;

  const session = value as Partial<WebSession>;
  return (
    typeof session.accessToken === "string" &&
    session.accessToken.length > 0 &&
    !!session.user &&
    typeof session.user.id === "string" &&
    session.user.id.length > 0 &&
    typeof session.user.email === "string" &&
    session.user.email.length > 0 &&
    isWebRole(session.user.role) &&
    typeof session.user.isVerified === "boolean" &&
    typeof session.user.isActive === "boolean"
  );
}

function isWebRole(value: unknown): value is WebRole {
  return value === "buyer" || value === "farmer" || value === "transporter";
}

export const webSession = {
  read(): WebSession | null {
    const storage = getSessionStorage();
    if (!storage) return null;

    const value = storage.getItem(WEB_SESSION_KEY);
    if (!value) return null;

    try {
      const session = JSON.parse(value) as unknown;
      if (isWebSession(session)) return session;
    } catch {
      // Malformed browser state is discarded below.
    }

    storage.removeItem(WEB_SESSION_KEY);
    return null;
  },

  save(session: WebSession): void {
    const storage = getSessionStorage();
    if (!storage) return;
    storage.setItem(WEB_SESSION_KEY, JSON.stringify(session));
  },

  clear(): void {
    getSessionStorage()?.removeItem(WEB_SESSION_KEY);
  },
};
