import { getApp, getApps, initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  inMemoryPersistence,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
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
  signInWithGoogle(): Promise<FirebaseWebUser>;
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

let authPromise: Promise<Auth> | undefined;
let initializedAuth: Auth | undefined;

export function getFirebaseClientConfig(
  environment: NodeJS.ProcessEnv = process.env,
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
      return (await signInWithPopup(await getFirebaseAuth(), new GoogleAuthProvider()))
        .user;
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
  environment: NodeJS.ProcessEnv,
  name: string,
): string {
  const value = environment[name]?.trim();
  if (!value) throw new Error(`${name} must be configured.`);
  return value;
}
