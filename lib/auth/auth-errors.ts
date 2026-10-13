import { ApiError } from "../api/contracts.ts";

/**
 * Maps Firebase and API failures to a dictionary key with a plain-language
 * message. Never surfaces raw codes such as "auth/invalid-credential".
 */
export function authErrorKey(error: unknown): string {
  const code = firebaseCode(error);
  if (code) {
    switch (code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
      case "auth/invalid-login-credentials":
        return "authError.badCredentials";
      case "auth/invalid-email":
        return "authError.invalidEmail";
      case "auth/user-disabled":
        return "authError.disabled";
      case "auth/email-already-in-use":
        return "authError.emailInUse";
      case "auth/weak-password":
        return "authError.weakPassword";
      case "auth/too-many-requests":
        return "authError.tooManyRequests";
      case "auth/network-request-failed":
        return "authError.network";
      case "auth/popup-closed-by-user":
      case "auth/cancelled-popup-request":
        return "authError.cancelled";
      case "auth/popup-blocked":
        return "authError.popupBlocked";
      case "auth/account-exists-with-different-credential":
        return "authError.differentCredential";
      case "auth/unauthorized-domain":
      case "auth/operation-not-allowed":
        return "authError.notConfigured";
      default:
        return "authError.generic";
    }
  }
  if (error instanceof ApiError) {
    switch (error.status) {
      case 0:
        return "authError.network";
      case 401:
        return "authError.sessionExpired";
      case 403:
        return "authError.forbidden";
      case 409:
        return "authError.conflict";
      case 429:
        return "authError.tooManyRequests";
      default:
        return error.status >= 500 ? "authError.server" : "authError.generic";
    }
  }
  if (error instanceof Error && /NEXT_PUBLIC_|must be configured/.test(error.message)) {
    return "authError.notConfigured";
  }
  return "authError.generic";
}

/** True when the user closed the Google popup themselves: show nothing. */
export function isCancelledSignIn(error: unknown): boolean {
  return authErrorKey(error) === "authError.cancelled";
}

function firebaseCode(error: unknown): string | null {
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as { code?: unknown }).code;
    if (typeof code === "string" && code.startsWith("auth/")) return code;
  }
  return null;
}
