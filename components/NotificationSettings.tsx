"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { NotificationRepository } from "@/lib/notifications/notification-repository";
import {
  pushOptInKey,
  createBrowserPushSession,
} from "@/lib/notifications/firebase-push";
import { useLanguage } from "./LanguageContext";
import NotificationInbox from "./NotificationInbox";
import { IcBell } from "@/components/icons";

export default function NotificationSettings() {
  const { t } = useLanguage();
  const repository = useMemo(() => new NotificationRepository(), []);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [denied, setDenied] = useState(false);
  const [ready, setReady] = useState(false);
  const lock = useRef(false);
  useEffect(() => {
    try {
      const key = pushOptInKey();
      setEnabled(
        Boolean(
          key &&
          localStorage.getItem(key) === "true" &&
          typeof Notification !== "undefined" &&
          Notification.permission === "granted",
        ),
      );
    } catch {
      /* Browser storage is optional. */
    }
    setReady(true);
  }, []);
  async function toggle() {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError(false);
    setDenied(false);
    try {
      const session = createBrowserPushSession();
      const next = enabled
        ? (await session.disable(), false)
        : await session.enable();
      setEnabled(next);
      setDenied(!enabled && !next);
      try {
        const key = pushOptInKey();
        if (key) {
          if (next) localStorage.setItem(key, "true");
          else localStorage.removeItem(key);
        }
      } catch {
        /* Do not misreport a successful push update as a failure. */
      }
    } catch {
      setError(true);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <div className="notification-settings">
      <div className="notification-preference">
        <span className="notification-preference-icon">
          <IcBell size={23} />
        </span>
        <div>
          <h3>{t("notifications.browserAlerts")}</h3>
          <p className="ac-sub">{t("push.description")}</p>
          <span className="notification-preference-state">
            {t(enabled ? "notifications.enabled" : "notifications.disabled")}
          </span>
        </div>
        <button
          type="button"
          className="btn btn-outline"
          disabled={busy || !ready}
          onClick={() => void toggle()}
        >
          {t(
            busy
              ? "notifications.updating"
              : enabled
                ? "push.disable"
                : "push.enable",
          )}
        </button>
      </div>
      {denied && (
        <p className="flow-notice" role="status">
          {t("push.denied")}
        </p>
      )}
      {error && (
        <p className="notif-error" role="alert">
          {t("push.error")}
        </p>
      )}
      <h3 className="notification-inbox-title">{t("push.inbox")}</h3>
      <NotificationInbox repository={repository} />
    </div>
  );
}
