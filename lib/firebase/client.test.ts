import { expect, test } from "vitest";
import * as client from "./client.ts";

test("builds Firebase client configuration from the statically exposed public environment", () => {
  const environment = {
    NEXT_PUBLIC_FIREBASE_API_KEY: "api-key",
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "farm2fork.example.com",
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: "farm2fork",
    NEXT_PUBLIC_FIREBASE_APP_ID: "web-app-id",
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "sender-id",
  };

  const clientModule = client as Record<string, unknown>;
  expect(clientModule.firebasePublicEnvironment).toEqual({
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  });
  expect(client.getFirebaseClientConfig(environment)).toEqual({
    apiKey: "api-key",
    authDomain: "farm2fork.example.com",
    projectId: "farm2fork",
    appId: "web-app-id",
    messagingSenderId: "sender-id",
  });
});

test("uses the redirect flow for mobile Google sign-in", () => {
  const clientModule = client as Record<string, unknown>;
  const shouldUseGoogleRedirect = clientModule.shouldUseGoogleRedirect as (
    userAgent: string,
  ) => boolean;

  expect(
    shouldUseGoogleRedirect(
      "Mozilla/5.0 (Linux; Android 16; Pixel 10) AppleWebKit/537.36 Chrome/151.0",
    ),
  ).toBe(true);
  expect(
    shouldUseGoogleRedirect(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/151.0",
    ),
  ).toBe(false);
});
