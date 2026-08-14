import { expect, test } from "vitest";
import nextConfig from "./next.config.ts";

test("keeps the opener relationship required by OAuth popups", async () => {
  const headers = await nextConfig.headers?.();

  expect(headers).toEqual(expect.arrayContaining([
    {
      source: "/:path*",
      headers: [
        {
          key: "Cross-Origin-Opener-Policy",
          value: "same-origin-allow-popups",
        },
      ],
    },
  ]));
});
