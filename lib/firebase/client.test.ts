import { beforeEach, expect, test, vi } from "vitest";

const firebaseAuth = vi.hoisted(() => ({
  createUserWithEmailAndPassword: vi.fn(),
  getAuth: vi.fn(),
  getRedirectResult: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  sendEmailVerification: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  setPersistence: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  signInWithRedirect: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("firebase/app", () => ({
  getApp: vi.fn(),
  getApps: vi.fn(),
  initializeApp: vi.fn(),
}));

vi.mock("firebase/auth", () => ({
  ...firebaseAuth,
  inMemoryPersistence: {},
}));

import * as client from "./client.ts";

beforeEach(() => {
  vi.clearAllMocks();
});

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

test("derives the hosted Firebase auth domain for local HTTP", () => {
  const environment = {
    NEXT_PUBLIC_FIREBASE_API_KEY: "api-key",
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "farm2fork.example.com",
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: "farm2fork",
    NEXT_PUBLIC_FIREBASE_APP_ID: "web-app-id",
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "sender-id",
  };

  expect(
    client.resolveFirebaseAuthDomain(environment, {
      protocol: "http:",
      hostname: "localhost",
    }),
  ).toBe("farm2fork.firebaseapp.com");
});

test("keeps the configured app auth domain for HTTPS", () => {
  const environment = {
    NEXT_PUBLIC_FIREBASE_API_KEY: "api-key",
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "farm2fork.example.com",
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: "farm2fork",
    NEXT_PUBLIC_FIREBASE_APP_ID: "web-app-id",
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "sender-id",
  };

  expect(
    client.resolveFirebaseAuthDomain(environment, {
      protocol: "https:",
      hostname: "farm2fork.example.com",
    }),
  ).toBe("farm2fork.example.com");
});

test("uses a Google popup from local HTTP", async () => {
  const user = { email: "farmer@example.com" };
  firebaseAuth.signInWithPopup.mockResolvedValue({ user });

  await expect(
    client.signInWithGoogleForOrigin(
      {} as never,
      {} as never,
      { protocol: "http:", hostname: "127.0.0.1" },
    ),
  ).resolves.toBe(user);

  expect(firebaseAuth.signInWithPopup).toHaveBeenCalledOnce();
  expect(firebaseAuth.signInWithRedirect).not.toHaveBeenCalled();
});

test("uses a Google redirect from HTTPS", async () => {
  firebaseAuth.signInWithRedirect.mockResolvedValue(undefined);

  await expect(
    client.signInWithGoogleForOrigin(
      {} as never,
      {} as never,
      { protocol: "https:", hostname: "farm2fork.example.com" },
    ),
  ).resolves.toBeNull();

  expect(firebaseAuth.signInWithRedirect).toHaveBeenCalledOnce();
  expect(firebaseAuth.signInWithPopup).not.toHaveBeenCalled();
});
