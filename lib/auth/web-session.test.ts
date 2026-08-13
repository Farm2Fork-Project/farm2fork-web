import { expect, test } from "vitest";
import { webSession } from "./web-session.ts";

test("webSession keeps only a sanitized user in memory", () => {
  const session = {
    user: {
      id: "buyer-1",
      email: "buyer@example.com",
      role: "buyer" as const,
      isVerified: true,
      isActive: true,
    },
  };

  webSession.save(session);
  expect(webSession.read()).toEqual(session);

  webSession.clear();
});
