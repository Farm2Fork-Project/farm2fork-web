import { describe, expect, test } from "vitest";
import { ApiError } from "../api/contracts.ts";
import { authErrorKey, isCancelledSignIn } from "./auth-errors.ts";

const firebase = (code: string) => Object.assign(new Error(`Firebase: Error (${code}).`), { code });

describe("plain-language auth errors", () => {
  test("wrong credentials never reveal which half was wrong", () => {
    for (const code of ["auth/invalid-credential", "auth/wrong-password", "auth/user-not-found"]) {
      expect(authErrorKey(firebase(code))).toBe("authError.badCredentials");
    }
  });

  test("known Firebase codes map to their own message", () => {
    expect(authErrorKey(firebase("auth/email-already-in-use"))).toBe("authError.emailInUse");
    expect(authErrorKey(firebase("auth/weak-password"))).toBe("authError.weakPassword");
    expect(authErrorKey(firebase("auth/too-many-requests"))).toBe("authError.tooManyRequests");
    expect(authErrorKey(firebase("auth/network-request-failed"))).toBe("authError.network");
    expect(authErrorKey(firebase("auth/popup-blocked"))).toBe("authError.popupBlocked");
    expect(authErrorKey(firebase("auth/something-new"))).toBe("authError.generic");
  });

  test("API failures map by status and never echo server text", () => {
    expect(authErrorKey(new ApiError(0, "Network request failed."))).toBe("authError.network");
    expect(authErrorKey(new ApiError(401, "x"))).toBe("authError.sessionExpired");
    expect(authErrorKey(new ApiError(409, "dup key E11000"))).toBe("authError.conflict");
    expect(authErrorKey(new ApiError(429, "x"))).toBe("authError.tooManyRequests");
    expect(authErrorKey(new ApiError(500, "stack trace"))).toBe("authError.server");
    expect(authErrorKey(new ApiError(400, "cnic must be valid"))).toBe("authError.generic");
  });

  test("missing configuration and unknown errors are explained, not dumped", () => {
    expect(authErrorKey(new Error("NEXT_PUBLIC_FIREBASE_API_KEY must be configured."))).toBe("authError.notConfigured");
    expect(authErrorKey("boom")).toBe("authError.generic");
  });

  test("closing the Google window is not an error to show", () => {
    expect(isCancelledSignIn(firebase("auth/popup-closed-by-user"))).toBe(true);
    expect(isCancelledSignIn(firebase("auth/invalid-credential"))).toBe(false);
  });
});
