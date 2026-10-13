"use client";
import { useEffect, useState } from "react";
import { ApiClient } from "@/lib/api/client";
import {
  pushOptInKey,
  createBrowserPushSession,
} from "@/lib/notifications/firebase-push";
import { useLanguage } from "./LanguageContext";

type Notice = { id: string; title: string; message: string; isRead: boolean };
const client = new ApiClient();
export default function NotificationSettings() {
  const { t } = useLanguage();
  const [items, setItems] = useState<Notice[]>([]);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [denied, setDenied] = useState(false);
  async function refresh() {
    setError(false);
    try {
      const page = await client.request<{ data: Notice[] }>(
        "/notifications?limit=50",
      );
      setItems(page.data);
    } catch {
      setError(true);
    }
  }
  useEffect(() => {
    void refresh();
    const key = pushOptInKey();
    setEnabled(
      Boolean(
        key &&
        localStorage.getItem(key) === "true" &&
        typeof Notification !== "undefined" &&
        Notification.permission === "granted",
      ),
    );
  }, []);
  async function toggle() {
    setBusy(true);
    setError(false);
    setDenied(false);
    try {
      const session = createBrowserPushSession();
      if (enabled) {
        await session.disable();
        setEnabled(false);
        const key = pushOptInKey();
        if (key) localStorage.removeItem(key);
      } else {
        const ok = await session.enable();
        setEnabled(ok);
        setDenied(!ok);
        const key = pushOptInKey();
        if (ok && key) localStorage.setItem(key, "true");
      }
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }
  async function readAll() {
    setBusy(true);
    setError(false);
    try {
      await client.request("/notifications/read-all", { method: "POST" });
      await refresh();
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="settings-list">
      <p>{t("push.description")}</p>
      <button
        type="button"
        className="settings-save-btn"
        disabled={busy}
        onClick={toggle}
      >
        {t(enabled ? "push.disable" : "push.enable")}
      </button>
      {denied && <p role="status">{t("push.denied")}</p>}
      {error && <p role="alert">{t("push.error")}</p>}
      <h3>{t("push.inbox")}</h3>
      <button type="button" disabled={busy} onClick={() => void refresh()}>
        {t("push.refresh")}
      </button>
      <button
        type="button"
        disabled={busy || !items.some((item) => !item.isRead)}
        onClick={readAll}
      >
        {t("push.readAll")}
      </button>
      {items.map((item) => (
        <article key={item.id} className="notification-row">
          <strong>{item.title}</strong>
          <p>{item.message}</p>
          {!item.isRead && <span>{t("push.unread")}</span>}
        </article>
      ))}
      {!items.length && !error && <p>{t("push.empty")}</p>}
    </div>
  );
}
