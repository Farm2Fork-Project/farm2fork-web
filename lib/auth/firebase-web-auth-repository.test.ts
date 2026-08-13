import { expect, test } from "vitest";
import { FirebaseWebAuthRepository } from "./firebase-web-auth-repository.ts";

test("exchanges a Firebase ID token for a cookie session and signs Firebase out", async () => {
  const calls: Array<{ path: string; options?: unknown }> = [];
  let signedOut = 0;
  const user = {
    email: "buyer@example.com",
    getIdToken: async () => "firebase-id-token",
    reload: async () => undefined,
  };
  const repository = new FirebaseWebAuthRepository({
    client: {
      request: async (path, options) => {
        calls.push({ path, options });
        return {
          id: "buyer-1",
          email: "buyer@example.com",
          role: "buyer",
          isVerified: true,
          isActive: true,
        };
      },
    },
    firebase: {
      createUserWithEmail: async () => user,
      signInWithEmail: async () => user,
      currentUser: () => user,
      sendEmailVerification: async () => undefined,
      sendPasswordReset: async () => undefined,
      signOut: async () => {
        signedOut += 1;
      },
    },
  });

  await expect(
    repository.signInWithEmail({
      email: "buyer@example.com",
      password: "Password1!",
    }),
  ).resolves.toEqual({
    kind: "session",
    user: {
      id: "buyer-1",
      email: "buyer@example.com",
      role: "buyer",
      isVerified: true,
      isActive: true,
    },
  });
  expect(calls).toEqual([
    {
      path: "/auth/web/session",
      options: { method: "POST", body: { idToken: "firebase-id-token" } },
    },
  ]);
  expect(signedOut).toBe(1);
});

test("creates an email/password Firebase identity and sends verification before onboarding", async () => {
  let verificationSent = 0;
  const user = {
    email: "buyer@example.com",
    getIdToken: async () => "firebase-id-token",
    reload: async () => undefined,
  };
  const repository = new FirebaseWebAuthRepository({
    client: { request: async () => ({}) },
    firebase: {
      createUserWithEmail: async () => user,
      signInWithEmail: async () => user,
      currentUser: () => user,
      sendEmailVerification: async () => {
        verificationSent += 1;
      },
      sendPasswordReset: async () => undefined,
      signOut: async () => undefined,
    },
  });

  await expect(
    repository.signUpWithEmail({
      email: "buyer@example.com",
      password: "Password1!",
    }),
  ).resolves.toEqual({ kind: "verification_required", email: "buyer@example.com" });
  expect(verificationSent).toBe(1);
});
