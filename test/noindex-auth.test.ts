import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, test } from "vitest";
import robots from "@/app/robots";

const root = resolve(__dirname, "..");

function files(dir: string): string[] {
  return readdirSync(join(root, dir)).flatMap((name) => {
    const path = join(dir, name);
    return statSync(join(root, path)).isDirectory() ? files(path) : [path];
  });
}

describe("signed-in and sign-in pages stay out of search results", () => {
  test.each(["app/(auth)/layout.tsx", "app/account/layout.tsx", "app/farmer/layout.tsx", "app/financial/layout.tsx", "app/admin/layout.tsx"])(
    "%s declares noindex",
    (layout) => {
      expect(readFileSync(join(root, layout), "utf8")).toMatch(/robots:\s*\{\s*index:\s*false/);
    },
  );

  test("no auth or account page overrides the noindex it inherits", () => {
    for (const file of [...files("app/(auth)"), ...files("app/account")].filter((f) => f.endsWith("page.tsx"))) {
      expect(readFileSync(join(root, file), "utf8"), file).not.toMatch(/index:\s*true/);
    }
  });

  test("the pages exist where links and redirects point", () => {
    for (const route of ["login", "signup", "signup/buyer", "signup/farmer", "verify-email", "forgot-password"]) {
      expect(existsSync(join(root, "app/(auth)", route, "page.tsx")), route).toBe(true);
    }
    expect(existsSync(join(root, "app/account/page.tsx"))).toBe(true);
    expect(existsSync(join(root, "app/account/edit/page.tsx"))).toBe(true);
  });

  test("robots.txt does not block them (a blocked URL's noindex would never be seen)", () => {
    const rules = robots().rules;
    const disallow = (Array.isArray(rules) ? rules : [rules]).flatMap((rule) => rule.disallow ?? []);
    for (const path of ["/login", "/signup", "/account"]) {
      expect(disallow.some((blocked) => path.startsWith(blocked) && blocked !== "/"), path).toBe(false);
    }
  });
});
