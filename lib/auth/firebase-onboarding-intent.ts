const STORAGE_KEY = "farm2fork.firebase-onboarding-intent.v1";

export type FirebaseOnboardingIntent = { email: string };

/**
 * Carries only the Firebase identity email between the shared role chooser and
 * a portal-specific onboarding form. Firebase Auth retains the credential in
 * memory; this storage must never contain a token or a backend session.
 */
export const firebaseOnboardingIntent = {
  save(email: string): void {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) throw new Error("A Firebase email is required for onboarding.");
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ email: normalizedEmail }));
  },

  read(): FirebaseOnboardingIntent | null {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    try {
      const value: unknown = JSON.parse(raw);
      if (
        value &&
        typeof value === "object" &&
        "email" in value &&
        typeof value.email === "string" &&
        value.email.trim()
      ) {
        return { email: value.email.trim().toLowerCase() };
      }
    } catch {
      // Treat invalid browser storage as an expired onboarding attempt.
    }

    sessionStorage.removeItem(STORAGE_KEY);
    return null;
  },

  clear(): void {
    sessionStorage.removeItem(STORAGE_KEY);
  },
};
