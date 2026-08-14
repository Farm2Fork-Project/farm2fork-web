import { firebaseOnboardingIntent } from "./firebase-onboarding-intent.ts";

export type FirebaseSelfServiceRole = "buyer" | "farmer" | "transporter";

export function beginFirebaseOnboarding(email: string): string {
  firebaseOnboardingIntent.save(email);
  return firebaseOnboardingIntent.read()?.email ?? "";
}

export function firebaseOnboardingPortalPath(
  role: FirebaseSelfServiceRole,
): string | null {
  if (role === "farmer") return "/farmer?signup=true&firebaseOnboarding=true";
  if (role === "transporter") {
    return "/transporter?signup=true&firebaseOnboarding=true";
  }
  return null;
}

/**
 * A stored email alone never authorizes onboarding. It must match the active
 * Firebase identity retained in this browser document.
 */
export function readMatchingFirebaseOnboardingEmail(
  currentFirebaseEmail: string | null,
): string | null {
  const intent = firebaseOnboardingIntent.read();
  const normalizedCurrentEmail = currentFirebaseEmail?.trim().toLowerCase();
  if (!intent || !normalizedCurrentEmail || intent.email !== normalizedCurrentEmail) {
    firebaseOnboardingIntent.clear();
    return null;
  }
  return intent.email;
}
