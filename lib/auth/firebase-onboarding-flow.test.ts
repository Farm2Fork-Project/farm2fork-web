import { afterEach, expect, test } from "vitest";
import {
  beginFirebaseOnboarding,
  firebaseOnboardingPortalPath,
  readMatchingFirebaseOnboardingEmail,
} from "./firebase-onboarding-flow.ts";

afterEach(() => {
  sessionStorage.clear();
});

test("starts role selection with the Firebase onboarding email", () => {
  expect(beginFirebaseOnboarding(" Farmer@Example.com ")).toBe(
    "farmer@example.com",
  );
  expect(sessionStorage.getItem("farm2fork.firebase-onboarding-intent.v1")).toBe(
    JSON.stringify({ email: "farmer@example.com" }),
  );
});

test("builds a portal handoff only for roles with separate onboarding routes", () => {
  expect(firebaseOnboardingPortalPath("buyer")).toBeNull();
  expect(firebaseOnboardingPortalPath("farmer")).toBe(
    "/farmer?signup=true&firebaseOnboarding=true",
  );
  expect(firebaseOnboardingPortalPath("transporter")).toBe(
    "/transporter?signup=true&firebaseOnboarding=true",
  );
});

test("rejects a pending email when it does not match the active Firebase identity", () => {
  beginFirebaseOnboarding("buyer@example.com");

  expect(readMatchingFirebaseOnboardingEmail("other@example.com")).toBeNull();
  expect(sessionStorage.getItem("farm2fork.firebase-onboarding-intent.v1")).toBeNull();
});
