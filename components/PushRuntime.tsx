"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getMessaging, isSupported, onMessage } from "firebase/messaging";
import { webSession } from "@/lib/auth/web-session";
import { getFirebaseClientConfig } from "@/lib/firebase/client";
import {
  createBrowserPushSession,
  pushOptInKey,
} from "@/lib/notifications/firebase-push";

export default function PushRuntime() {
  const session = useSyncExternalStore(
    webSession.subscribe,
    webSession.read,
    () => null,
  );
  const [notice, setNotice] = useState<{ owner: typeof session; text: string } | null>(null);
  useEffect(() => {
    if (!session) return;
    let stopped = false;
    let unsubscribe: (() => void) | undefined;
    async function listen() {
      if (!(await isSupported()) || stopped) return;
      const app = getApps().length
        ? getApp()
        : initializeApp(getFirebaseClientConfig());
      unsubscribe = onMessage(getMessaging(app), (message) => {
        if (!stopped && webSession.read() === session)
          setNotice({ owner: session, text: [message.notification?.title, message.notification?.body].filter(Boolean).join(" — ") });
      });
    }
    async function refreshToken() {
      if (stopped || webSession.read() !== session) return;
      const key = pushOptInKey();
      if (
        key &&
        localStorage.getItem(key) === "true" &&
        typeof Notification !== "undefined" &&
        Notification.permission === "granted"
      )
        await createBrowserPushSession().enable();
    }
    const resume = () => {
      if (document.visibilityState === "visible")
        void refreshToken().catch(() => undefined);
    };
    void listen().catch(() => undefined);
    void refreshToken().catch(() => undefined);
    document.addEventListener("visibilitychange", resume);
    return () => {
      stopped = true;
      unsubscribe?.();
      document.removeEventListener("visibilitychange", resume);
    };
  }, [session]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 8000);
    return () => clearTimeout(timer);
  }, [notice]);
  return session && notice?.owner === session ? (
    <div className="toast-alert" role="status">
      {notice.text}
    </div>
  ) : null;
}
