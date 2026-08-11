import type { ApiAuthUser } from "../api/contracts.ts";

export const WEB_SESSION_KEY = "farm2fork.web.session.v1";

export type BuyerSession = {
  accessToken: string;
  user: Pick<ApiAuthUser, "id" | "email" | "isVerified" | "isActive"> & {
    role: "buyer";
  };
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

function isBuyerSession(value: unknown): value is BuyerSession {
  if (!value || typeof value !== "object") return false;

  const session = value as Partial<BuyerSession>;
  return (
    typeof session.accessToken === "string" &&
    session.accessToken.length > 0 &&
    !!session.user &&
    typeof session.user.id === "string" &&
    typeof session.user.email === "string" &&
    session.user.role === "buyer" &&
    typeof session.user.isVerified === "boolean" &&
    typeof session.user.isActive === "boolean"
  );
}

export const webSession = {
  read(): BuyerSession | null {
    const storage = getSessionStorage();
    if (!storage) return null;

    const value = storage.getItem(WEB_SESSION_KEY);
    if (!value) return null;

    try {
      const session = JSON.parse(value) as unknown;
      if (isBuyerSession(session)) return session;
    } catch {
      // Malformed browser state is discarded below.
    }

    storage.removeItem(WEB_SESSION_KEY);
    return null;
  },

  save(session: BuyerSession): void {
    const storage = getSessionStorage();
    if (!storage) return;
    storage.setItem(WEB_SESSION_KEY, JSON.stringify(session));
  },

  clear(): void {
    getSessionStorage()?.removeItem(WEB_SESSION_KEY);
  },
};
