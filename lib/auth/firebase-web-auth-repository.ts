import type { ApiRequestOptions } from "../api/client.ts";
import type {
  ApiAuthUser,
  BuyerOnboardingRequest,
  FarmerOnboardingRequest,
  TransporterOnboardingRequest,
} from "../api/contracts.ts";
import {
  createFirebaseWebAuthGateway,
  type FirebaseWebAuthGateway,
  type FirebaseWebUser,
} from "../firebase/client.ts";
import { webSession } from "./web-session.ts";

type ApiRequester = {
  request<T>(path: string, options?: ApiRequestOptions): Promise<T>;
};

type Credentials = { email: string; password: string };

export type FirebaseWebAuthResult =
  | { kind: "session"; user: ApiAuthUser }
  | { kind: "verification_required"; email: string };

export class FirebaseWebAuthRepository {
  private readonly client: ApiRequester;
  private readonly firebase: FirebaseWebAuthGateway;

  constructor({
    client,
    firebase = createFirebaseWebAuthGateway(),
  }: {
    client: ApiRequester;
    firebase?: FirebaseWebAuthGateway;
  }) {
    this.client = client;
    this.firebase = firebase;
  }

  async signInWithEmail(input: Credentials): Promise<FirebaseWebAuthResult> {
    return this.exchangeForSession(
      await this.firebase.signInWithEmail(input.email, input.password),
    );
  }

  async signUpWithEmail(
    input: Credentials,
  ): Promise<{ kind: "verification_required"; email: string }> {
    const user = await this.firebase.createUserWithEmail(input.email, input.password);
    await this.firebase.sendEmailVerification(user);
    return { kind: "verification_required", email: user.email ?? input.email };
  }

  async resendEmailVerification(): Promise<void> {
    await this.firebase.sendEmailVerification(this.requireCurrentUser());
  }

  async refreshEmailVerification(): Promise<FirebaseWebAuthResult> {
    const user = this.requireCurrentUser();
    await user.reload();
    return this.exchangeForSession(user);
  }

  sendPasswordReset(email: string): Promise<void> {
    return this.firebase.sendPasswordReset(email);
  }

  onboardBuyer(input: BuyerOnboardingRequest): Promise<ApiAuthUser> {
    return this.onboard("/auth/web/onboard/buyer", input);
  }

  onboardFarmer(input: FarmerOnboardingRequest): Promise<ApiAuthUser> {
    return this.onboard("/auth/web/onboard/farmer", input);
  }

  onboardTransporter(input: TransporterOnboardingRequest): Promise<ApiAuthUser> {
    return this.onboard("/auth/web/onboard/transporter", input);
  }

  async logout(): Promise<void> {
    await this.client.request("/auth/web/logout", { method: "POST" });
    await this.firebase.signOut();
    webSession.clear();
  }

  private async exchangeForSession(
    firebaseUser: FirebaseWebUser,
  ): Promise<FirebaseWebAuthResult> {
    const user = await this.client.request<ApiAuthUser>("/auth/web/session", {
      method: "POST",
      body: { idToken: await firebaseUser.getIdToken(true) },
    });
    await this.firebase.signOut();
    webSession.save({ user });
    return { kind: "session", user };
  }

  private async onboard(
    path: string,
    input: BuyerOnboardingRequest | FarmerOnboardingRequest | TransporterOnboardingRequest,
  ): Promise<ApiAuthUser> {
    const firebaseUser = this.requireCurrentUser();
    const user = await this.client.request<ApiAuthUser>(path, {
      method: "POST",
      body: { ...input, idToken: await firebaseUser.getIdToken(true) },
    });
    await this.firebase.signOut();
    webSession.save({ user });
    return user;
  }

  private requireCurrentUser(): FirebaseWebUser {
    const user = this.firebase.currentUser();
    if (!user) {
      throw new Error("Sign in with Firebase before continuing.");
    }
    return user;
  }
}
