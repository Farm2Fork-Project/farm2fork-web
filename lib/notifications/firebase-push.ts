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
        return getToken(getMessaging(firebaseApp()), {
          vapidKey,
          serviceWorkerRegistration: registration,
        });
      },
      async deleteToken() {
        if (await isSupported()) await deleteToken(getMessaging(firebaseApp()));
      },
    },
    new ApiClient(),
    () => sameOwner() && generation === lifecycleGeneration,
  );
  return {
    enable() {
      const pending = session.enable();
      pendingEnables.add(pending);
      void pending.finally(() => pendingEnables.delete(pending)).catch(() => undefined);
      return pending;
    },
    async disable() {
      if (!sameOwner()) throw new Error("The signed-in account changed.");
      lifecycleGeneration++;
      // Drain earlier registrations before deleting the server binding, so a
      // late enable cannot restore the token after logout or explicit opt-out.
      await Promise.allSettled([...pendingEnables]);
      if (!sameOwner()) throw new Error("The signed-in account changed.");
      await session.disable();
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
export async function clearBrowserPushOnLogout() {
  const key = pushOptInKey();
  if (!key || localStorage.getItem(key) !== "true") return;
  await createBrowserPushSession().disable();
  localStorage.removeItem(key);
}
