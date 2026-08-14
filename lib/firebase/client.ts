import { getApp, getApps, initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  getRedirectResult,
  GoogleAuthProvider,
  inMemoryPersistence,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithRedirect,
  signOut,
  type Auth,
  type User,
} from "firebase/auth";

export type FirebaseWebUser = Pick<User, "email" | "getIdToken"> & {
  reload(): Promise<void>;
};

export type FirebaseWebAuthGateway = {
  createUserWithEmail(email: string, password: string): Promise<FirebaseWebUser>;
  signInWithEmail(email: string, password: string): Promise<FirebaseWebUser>;
  signInWithGoogle(): Promise<FirebaseWebUser | null>;
  getGoogleRedirectResult(): Promise<FirebaseWebUser | null>;
  currentUser(): FirebaseWebUser | null;
  sendEmailVerification(user: FirebaseWebUser): Promise<void>;
  sendPasswordReset(email: string): Promise<void>;
  signOut(): Promise<void>;
};

type FirebaseClientConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
  messagingSenderId: string;
};

type FirebasePublicEnvironmentKey =
  | "NEXT_PUBLIC_FIREBASE_API_KEY"
  | "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
  | "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
  | "NEXT_PUBLIC_FIREBASE_APP_ID"
  | "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID";

type FirebasePublicEnvironment = Partial<
  Record<FirebasePublicEnvironmentKey, string>
>;

// Next.js only exposes public client environment variables when they are read
// directly. Do not replace these with dynamic `process.env[name]` access.
export const firebasePublicEnvironment: FirebasePublicEnvironment = {
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
};

let authPromise: Promise<Auth> | undefined;
let initializedAuth: Auth | undefined;

export function getFirebaseClientConfig(
  environment: FirebasePublicEnvironment = firebasePublicEnvironment,
): FirebaseClientConfig {
  return {
    apiKey: requirePublicFirebaseValue(environment, "NEXT_PUBLIC_FIREBASE_API_KEY"),
    authDomain: requirePublicFirebaseValue(
      environment,
      "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    ),
    projectId: requirePublicFirebaseValue(
      environment,
      "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    ),
    appId: requirePublicFirebaseValue(environment, "NEXT_PUBLIC_FIREBASE_APP_ID"),
    messagingSenderId: requirePublicFirebaseValue(
      environment,
      "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    ),
  };
}

export function createFirebaseWebAuthGateway(): FirebaseWebAuthGateway {
  return {
    async createUserWithEmail(email, password) {
      return (await createUserWithEmailAndPassword(await getFirebaseAuth(), email, password))
        .user;
    },
    async signInWithEmail(email, password) {
      return (await signInWithEmailAndPassword(await getFirebaseAuth(), email, password))
        .user;
    },
    async signInWithGoogle() {
      await signInWithRedirect(await getFirebaseAuth(), new GoogleAuthProvider());
      return null;
    },
    async getGoogleRedirectResult() {
      return (await getRedirectResult(await getFirebaseAuth()))?.user ?? null;
    },
    currentUser() {
      return initializedAuth?.currentUser ?? null;
    },
    async sendEmailVerification(user) {
      await sendEmailVerification(user as User);
    },
    async sendPasswordReset(email) {
      await sendPasswordResetEmail(await getFirebaseAuth(), email);
    },
    async signOut() {
      await signOut(await getFirebaseAuth());
    },
  };
}

async function getFirebaseAuth(): Promise<Auth> {
  authPromise ??= (async () => {
    const config = getFirebaseClientConfig();
    const app = getApps().length > 0 ? getApp() : initializeApp(config);
    const auth = getAuth(app);
    await setPersistence(auth, inMemoryPersistence);
    initializedAuth = auth;
    return auth;
  })();
  return authPromise;
}

function requirePublicFirebaseValue(
  environment: FirebasePublicEnvironment,
  name: FirebasePublicEnvironmentKey,
): string {
  const value = environment[name]?.trim();
  if (!value) throw new Error(`${name} must be configured.`);
  return value;
}
