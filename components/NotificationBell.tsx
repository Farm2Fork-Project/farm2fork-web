"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LuBell } from "react-icons/lu";
import { useLanguage } from "./LanguageContext";
import {
  NotificationRepository,
  type AppNotification,
} from "@/lib/notifications/notification-repository.ts";

const POLL_MS = 60_000;

function relativeTime(iso: string, locale: string): string {
  const seconds = Math.round((new Date(iso).getTime() - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
  ];
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return rtf.format(seconds, "second");
}

/**
 * The signed-in user's real notifications (the same inbox the mobile app
 * and push notifications use). Polls the unread count once a minute.
 */
export default function NotificationBell({
  repository,
}: {
  repository?: NotificationRepository;
}) {
  const { t, language } = useLanguage();
  const repo = useMemo(() => repository ?? new NotificationRepository(), [repository]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[] | null>(null);
  const [failed, setFailed] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);

  const refreshCount = useCallback(() => {
    repo.unreadCount().then(setUnread, () => undefined);
  }, [repo]);

  useEffect(() => {
    refreshCount();
    const timer = setInterval(refreshCount, POLL_MS);
    return () => clearInterval(timer);
  }, [refreshCount]);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) {
      setFailed(false);
      repo.list().then(setItems, () => setFailed(true));
    }
  };

  const markAll = async () => {
    await repo.markAllRead().catch(() => undefined);
    setItems((current) => current?.map((n) => ({ ...n, isRead: true })) ?? null);
    setUnread(0);
  };

  const markOne = (n: AppNotification) => {
    if (n.isRead) return;
    void repo.markRead(n.id).catch(() => undefined);
    setItems((current) => current?.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)) ?? null);
    setUnread((count) => Math.max(0, count - 1));
  };

  return (
    <div className="notif-bell" ref={wrapper}>
      <button
        type="button"
        className="topbar-icon-btn"
        aria-label={t("notifications.title")}
        aria-expanded={open}
        onClick={toggle}
      >
        <LuBell size={19} />
        {unread > 0 ? (
          <span className="notif-count" aria-label={`${unread}`}>
            {unread > 99 ? "99+" : unread}
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="notif-panel" role="dialog" aria-label={t("notifications.title")}>
          <div className="notif-panel-head">
            <strong>{t("notifications.title")}</strong>
            <button type="button" className="notif-link" onClick={() => void markAll()}>
              {t("notifications.markAllRead")}
            </button>
          </div>
          {failed ? (
            <p className="notif-empty">{t("notifications.loadFailed")}</p>
          ) : items === null ? (
            <p className="notif-empty">…</p>
          ) : items.length === 0 ? (
            <p className="notif-empty">{t("notifications.empty")}</p>
          ) : (
            <ul className="notif-list">
              {items.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    className={n.isRead ? "notif-item" : "notif-item notif-item--unread"}
                    onClick={() => markOne(n)}
                  >
                    <strong>{n.title}</strong>
                    <span>{n.message}</span>
                    <time dateTime={n.createdAt}>
                      {relativeTime(n.createdAt, language === "ur" ? "ur-PK" : "en-PK")}
                    </time>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
