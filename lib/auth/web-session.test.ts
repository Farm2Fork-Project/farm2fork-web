import { expect, test } from "vitest";
import { WEB_SESSION_KEY, webSession } from "./web-session.ts";

class MemoryStorage {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

test("webSession saves, reads, and clears an exact buyer session", () => {
  const storage = new MemoryStorage();
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: storage,
  });

  const session = {
    accessToken: "buyer-token",
    user: {
      id: "buyer-1",
      email: "buyer@example.com",
      role: "buyer" as const,
      isVerified: true,
      isActive: true,
    },
  };

  webSession.save(session);

  expect(storage.getItem(WEB_SESSION_KEY)).toBe(JSON.stringify(session));
  expect(webSession.read()).toEqual(session);

  webSession.clear();
  expect(webSession.read()).toBeNull();
});
