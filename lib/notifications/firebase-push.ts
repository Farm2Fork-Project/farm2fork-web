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

export function createBrowserPushSession() {
  return new PushSession(
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
  );
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
