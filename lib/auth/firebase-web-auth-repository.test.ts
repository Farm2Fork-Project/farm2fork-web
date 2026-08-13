import { expect, test } from "vitest";
import { ApiError } from "../api/contracts.ts";
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

test("maps an unverified email sign-in into a verification-required outcome", async () => {
  const user = {
    email: "buyer@example.com",
    getIdToken: async () => "firebase-id-token",
    reload: async () => undefined,
  };
  const repository = new FirebaseWebAuthRepository({
    client: {
      request: async () => {
        throw new ApiError(401, "Verify your Firebase email before continuing.", {
          code: "EMAIL_VERIFICATION_REQUIRED",
        });
      },
    },
    firebase: {
      createUserWithEmail: async () => user,
      signInWithEmail: async () => user,
      signInWithGoogle: async () => user,
      currentUser: () => user,
      sendEmailVerification: async () => undefined,
      sendPasswordReset: async () => undefined,
      signOut: async () => undefined,
    },
  });

  await expect(
    repository.signInWithEmail({
      email: "buyer@example.com",
      password: "Password1!",
    }),
  ).resolves.toEqual({
    kind: "verification_required",
    email: "buyer@example.com",
  });
});

test("exchanges a Google identity and preserves onboarding-required state", async () => {
  const user = {
    email: "new@example.com",
    getIdToken: async () => "google-id-token",
    reload: async () => undefined,
  };
  const repository = new FirebaseWebAuthRepository({
    client: {
      request: async () => {
        throw new ApiError(409, "Complete onboarding.", {
          code: "ONBOARDING_REQUIRED",
        });
      },
    },
    firebase: {
      createUserWithEmail: async () => user,
      signInWithEmail: async () => user,
      signInWithGoogle: async () => user,
      currentUser: () => user,
      sendEmailVerification: async () => undefined,
      sendPasswordReset: async () => undefined,
      signOut: async () => undefined,
    },
  });

  await expect(repository.signInWithGoogle()).resolves.toEqual({
    kind: "onboarding_required",
    email: "new@example.com",
  });
});
