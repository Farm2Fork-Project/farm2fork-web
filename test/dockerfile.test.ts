import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { expect, test } from "vitest";

test("Docker dependency stage persists pnpm downloads and installs offline", async () => {
  const dockerfile = await readFile(resolve(process.cwd(), "Dockerfile"), "utf8");

  expect(dockerfile).toContain(
    "--mount=type=cache,id=farm2fork-web-pnpm-store,target=/pnpm/store",
  );
  expect(dockerfile).toContain("pnpm fetch --frozen-lockfile");
  expect(dockerfile).toContain("pnpm install --offline --frozen-lockfile");
  expect(dockerfile).toContain("--fetch-timeout=120000");
  expect(dockerfile).toContain("--fetch-retries=5");
});
