import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, test } from "vitest";
import { accountDictionary } from "@/lib/dictionaries-account";
import { authDictionary } from "@/lib/dictionaries-auth";
import { dictionaries } from "@/lib/dictionaries";
import { BUSINESS_TYPES, CROP_OPTIONS } from "@/lib/auth/onboarding-payload.ts";
import { PAKISTAN_PROVINCES, provinceKey } from "@/lib/farmer/farm-location.ts";

const root = resolve(__dirname, "..");

function sources(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(join(root, dir))) {
    const path = join(dir, name);
    if (statSync(join(root, path)).isDirectory()) out.push(...sources(path));
    else if (/\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name)) out.push(path);
  }
  return out;
}

const SCANNED = [
  ...sources("components/auth"),
  ...sources("components/account"),
  "components/ui/InlineConfirm.tsx",
  "components/LandingScreen.tsx",
  "app/(auth)/layout.tsx",
];

/** Keys written as t("…"), plus the string-literal key tables in the auth and account libraries. */
function usedKeys(): Set<string> {
  const keys = new Set<string>();
  for (const file of SCANNED) {
    const text = readFileSync(join(root, file), "utf8");
    for (const m of text.matchAll(/\bt\(\s*"([^"$]+)"\s*\)/g)) keys.add(m[1]);
    for (const m of text.matchAll(/"((?:account\.back\w+))"/g)) keys.add(m[1]);
  }
  for (const file of [...sources("lib/auth"), ...sources("lib/account")]) {
    const text = readFileSync(join(root, file), "utf8");
    for (const m of text.matchAll(/"((?:signup\.err|account\.err|authError)\.\w+)"/g)) keys.add(m[1]);
  }
  // Strings added to the listings screen (inline delete and detail panel). Its older banner
  // still has untranslated placeholder text of its own, so the file is not scanned as a whole.
  for (const key of ["deleteTitle", "delete", "cancel", "grade", "soldOut", "price", "gradeLabel", "stockLabel", "statusLabel", "available", "descriptionLabel", "noDescription"]) {
    keys.add(`farmer.listings.${key}`);
  }
  for (const crop of CROP_OPTIONS) keys.add(`signup.crop.${crop}`);
  for (const type of BUSINESS_TYPES) keys.add(`signup.businessType.${type}`);
  for (const role of ["buyer", "farmer", "transporter", "financial_partner", "admin"]) keys.add(`account.role.${role}`);
  for (const province of PAKISTAN_PROVINCES) keys.add(provinceKey(province));
  return keys;
}

describe("sign-in, sign-up and account strings", () => {
  test("English and Urdu define exactly the same keys", () => {
    for (const set of [authDictionary, accountDictionary]) {
      expect(Object.keys(set.ur).sort()).toEqual(Object.keys(set.en).sort());
    }
  });

  test("every key the screens use exists in both languages", () => {
    const missing: string[] = [];
    for (const key of usedKeys()) {
      for (const lang of ["en", "ur"] as const) {
        if (!dictionaries[lang][key]) missing.push(`${lang}: ${key}`);
      }
    }
    expect(missing).toEqual([]);
  });

  test("Urdu strings are actually Urdu, apart from brand names and placeholders", () => {
    const ARABIC = /[؀-ۿ]/;
    const untranslated = Object.entries({ ...authDictionary.ur, ...accountDictionary.ur })
      .filter(([, value]) => !ARABIC.test(value))
      .map(([key]) => key);
    expect(untranslated).toEqual([]);
  });

  test("placeholders match between languages", () => {
    for (const set of [authDictionary, accountDictionary]) {
      for (const [key, en] of Object.entries(set.en)) {
        const placeholders = (text: string) => (text.match(/\{\w+\}/g) ?? []).sort();
        expect(placeholders(set.ur[key]), key).toEqual(placeholders(en));
      }
    }
  });

  test("no sign-in or sign-up screen keeps hard-coded English labels", () => {
    // The old SignUpFormScreen and FarmerSignup2 had inline English; the new ones must not.
    const offenders: string[] = [];
    for (const file of [...sources("components/auth"), ...sources("components/account")]) {
      const text = readFileSync(join(root, file), "utf8");
      for (const m of text.matchAll(/>\s*([A-Z][a-z]+(?: [A-Za-z']+){0,4})\s*</g)) offenders.push(`${file}: ${m[1]}`);
    }
    expect(offenders).toEqual([]);
  });
});
