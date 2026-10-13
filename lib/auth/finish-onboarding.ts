import type { ApiAuthUser, UpdateProfileRequest } from "../api/contracts.ts";
import type { FirebaseWebAuthRepository } from "./firebase-web-auth-repository.ts";
import {
  buildBuyerOnboarding,
  buildFarmerOnboarding,
} from "./onboarding-payload.ts";
import { firebaseOnboardingIntent } from "./firebase-onboarding-intent.ts";
import {
  pendingSignupRole,
  signupDraft,
  type DraftRole,
  type SignupDraft,
} from "./signup-draft.ts";

type Onboarder = Pick<FirebaseWebAuthRepository, "onboardBuyer" | "onboardFarmer">;
type ProfileWriter = { updateProfile(changes: UpdateProfileRequest): Promise<unknown> };

/**
 * Creates the backend account for the signed-in Firebase identity from a
 * sign-up draft. The onboarding endpoints take no name, so the person's name
 * is saved with a follow-up profile edit; if that fails the account still
 * exists and the name can be added on the profile page.
 */
export async function onboardFromDraft(
  role: DraftRole,
  draft: SignupDraft,
  auth: Onboarder,
  profile: ProfileWriter,
): Promise<{ ok: true; user: ApiAuthUser } | { ok: false; errors: Record<string, string> }> {
  const built = role === "buyer" ? buildBuyerOnboarding(draft) : buildFarmerOnboarding(draft);
  if (!built.ok) return built;
  const user =
    role === "buyer"
      ? await auth.onboardBuyer(built.payload as Parameters<Onboarder["onboardBuyer"]>[0])
      : await auth.onboardFarmer(built.payload as Parameters<Onboarder["onboardFarmer"]>[0]);
  try {
    await profile.updateProfile({ fullName: built.fullName });
  } catch {
    // Non-fatal, see above.
  }
  signupDraft.clear(role);
  pendingSignupRole.clear();
  firebaseOnboardingIntent.clear();
  return { ok: true, user: { ...user, fullName: user.fullName ?? built.fullName } };
}
