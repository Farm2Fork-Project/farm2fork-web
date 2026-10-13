import { getApp, getApps, initializeApp } from "firebase/app";
import {
  deleteToken,
  getMessaging,
  getToken,
  isSupported,
} from "firebase/messaging";
import { ApiClient } from "../api/client";
import { getFirebaseClientConfig } from "../firebase/client";
import { webSession } from "../auth/web-session";
import { PushSession } from "./push-session";

let lifecycleGeneration = 0;
const pendingEnables = new Set<Promise<boolean>>();
const touchedAccounts = new Set<string>();
let cleanup: Promise<void> | null = null;
let loggingOutAccount: string | null = null;

webSession.subscribe(() => {
  // Keep the logout barrier through the cookie logout request. A successful
  // logout clears the document session; a failed logout stays retryable.
  if (!webSession.read()) loggingOutAccount = null;
});

export function createBrowserPushSession() {
  const owner = webSession.read();
  const generation = lifecycleGeneration;
  const sameOwner = () => owner !== null && webSession.read() === owner;
  const session = new PushSession(
    {
      async permission() {
        if (!(await isSupported())) return false;
        return (
          (Notification.permission === "granted"
            ? "granted"
            : await Notification.requestPermission()) === "granted"
        );
      },
      async token() {
        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY?.trim();
        if (!vapidKey) throw new Error("Push is not configured.");
        const registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw",
        );
        // Wait for this worker, rather than an unrelated service worker's ready promise.
        if (!registration.active)
          await new Promise<void>((done, reject) => {
            const worker = registration.installing ?? registration.waiting;
            if (!worker) return reject(new Error("Push worker unavailable."));
            worker.addEventListener("statechange", () => {
              if (worker.state === "activated") done();
              if (worker.state === "redundant")
                reject(new Error("Push worker failed."));
            });
          });
        const token = await getToken(getMessaging(firebaseApp()), {
          vapidKey,
          serviceWorkerRegistration: registration,
        });
        if (token && owner) touchedAccounts.add(owner.user.id);
        return token;
      },
      async deleteToken() {
        if (await isSupported()) await deleteToken(getMessaging(firebaseApp()));
      },
    },
    new ApiClient(),
    () => sameOwner() && generation === lifecycleGeneration && !cleanup && loggingOutAccount !== owner?.user.id,
  );
  return {
    enable() {
      if (cleanup || loggingOutAccount === owner?.user.id) return Promise.resolve(false);
      const pending = session.enable();
      pendingEnables.add(pending);
      void pending.finally(() => pendingEnables.delete(pending)).catch(() => undefined);
      return pending;
    },
    revokeForLogout(force: boolean) {
      if (!owner || !sameOwner()) return Promise.reject(new Error("The signed-in account changed."));
      return revokeBrowserPush(owner, session, force);
    },
    async disable() {
      if (!sameOwner()) throw new Error("The signed-in account changed.");
      await revokeBrowserPush(owner!, session, true);
    },
  };
}
function firebaseApp() {
  return getApps().length ? getApp() : initializeApp(getFirebaseClientConfig());
}

export function pushOptInKey() {
  const user = webSession.read()?.user;
  return user ? `push.enabled.${user.id}` : null;
}
async function revokeBrowserPush(
  owner: NonNullable<ReturnType<typeof webSession.read>>,
  session: PushSession,
  force: boolean,
): Promise<void> {
  if (cleanup) return cleanup;
  lifecycleGeneration++;
  const pending = (async () => {
    // Revocation rejects new enables while draining permission, token and PUT
    // operations that were already started. Only then is DELETE safe.
    await Promise.allSettled([...pendingEnables]);
    if (webSession.read() !== owner) throw new Error("The signed-in account changed.");
    if (force || touchedAccounts.has(owner.user.id)) {
      await session.disable();
      touchedAccounts.delete(owner.user.id);
    }
    localStorage.removeItem(`push.enabled.${owner.user.id}`);
  })();
  cleanup = pending;
  try {
    await pending;
  } finally {
    // A wrapper constructed during revocation cannot start a later stale enable.
    lifecycleGeneration++;
    cleanup = null;
  }
}

export async function clearBrowserPushOnLogout() {
  const owner = webSession.read();
  if (!owner) {
    lifecycleGeneration++;
    await Promise.allSettled([...pendingEnables]);
    return;
  }
  loggingOutAccount = owner.user.id;
  const key = `push.enabled.${owner.user.id}`;
  // The first opt-in may still be waiting on the SDK before its preference is
  // persisted. Drain it even when the preference has never been written.
  const force = localStorage.getItem(key) === "true";
  const browser = createBrowserPushSession();
  // Use the same guarded revocation as opt-out without requiring Firebase on
  // ordinary logout when no SDK token or persisted registration ever existed.
  await browser.revokeForLogout(force);
}
