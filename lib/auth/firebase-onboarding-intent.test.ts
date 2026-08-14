import { afterEach, expect, test } from "vitest";
import { firebaseOnboardingIntent } from "./firebase-onboarding-intent.ts";

afterEach(() => {
  sessionStorage.clear();
});

test("keeps only a normalized email for a pending Firebase onboarding", () => {
  firebaseOnboardingIntent.save(" New.User@Example.COM ");

  expect(firebaseOnboardingIntent.read()).toEqual({
    email: "new.user@example.com",
  });
  expect(sessionStorage.getItem("farm2fork.firebase-onboarding-intent.v1")).toBe(
    JSON.stringify({ email: "new.user@example.com" }),
  );
});

test("rejects malformed pending onboarding storage", () => {
  sessionStorage.setItem(
    "farm2fork.firebase-onboarding-intent.v1",
    JSON.stringify({ email: 42 }),
  );

  expect(firebaseOnboardingIntent.read()).toBeNull();
  expect(sessionStorage.getItem("farm2fork.firebase-onboarding-intent.v1")).toBeNull();
});
