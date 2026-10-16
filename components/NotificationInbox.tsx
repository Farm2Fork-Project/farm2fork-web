"use client";

import "@/app/notifications.css";

import { useEffect, useRef, useState } from "react";
import { IcBell, IcCheck } from "@/components/icons";
import { useLanguage } from "./LanguageContext";
import type {
  AppNotification,
  NotificationRepository,
} from "@/lib/notifications/notification-repository";

export const INBOX_CHANGED = "f2f:notifications-changed";
export function notifyInboxChanged() {
  window.dispatchEvent(new Event(INBOX_CHANGED));
}

export function notificationTime(iso: string, locale: string): string {
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return "";
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  for (const [unit, size] of [
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ] as const) {
    if (Math.abs(seconds) >= size)
      return rtf.format(Math.round(seconds / size), unit);
  }
  return rtf.format(seconds, "second");
}

/** Shared real inbox: only confirmed writes change the displayed read state. */
export default function NotificationInbox({
  repository,
  onRead,
  role, onNavigate,
}: {
  repository: NotificationRepository;
  onRead?: () => void;
  role?: "transporter" | "admin";
  onNavigate?: () => void;
}) {
  const { t, language } = useLanguage();
  const [items, setItems] = useState<AppNotification[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [actionError, setActionError] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [reload, setReload] = useState(0);
  const alive = useRef(true);
  const locked = useRef(false);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  useEffect(() => {
    let active = true;
    repository.list().then(
      (list) => {
        if (active) {
          setItems(list);
          setLoadError(false);
          setLoading(false);
        }
      },
      () => {
        if (active) {
          setLoadError(true);
          setLoading(false);
        }
      },
    );
    return () => {
      active = false;
    };
  }, [repository, reload]);
  useEffect(() => {
    const changedElsewhere = () => {
      if (!locked.current) {
        setLoading(true);
        setReload((n) => n + 1);
      }
    };
    window.addEventListener(INBOX_CHANGED, changedElsewhere);
    return () => window.removeEventListener(INBOX_CHANGED, changedElsewhere);
  }, []);
  const refresh = () => {
    if (locked.current) return;
    setLoading(true);
    setReload((n) => n + 1);
  };
  async function mark(id?: string) {
    if (locked.current || loading) return;
    locked.current = true;
    setBusy(id ?? "all");
    setActionError(false);
    try {
      if (id) await repository.markRead(id);
      else await repository.markAllRead();
      if (alive.current) {
        setItems(
          (list) =>
            list?.map((n) =>
              !id || n.id === id ? { ...n, isRead: true } : n,
            ) ?? null,
        );
        onRead?.();
      }
      notifyInboxChanged();
    } catch {
      if (alive.current) setActionError(true);
    } finally {
      locked.current = false;
      if (alive.current) setBusy(null);
    }
  }
  const unread = items?.filter((n) => !n.isRead).length ?? 0;
  const visible = filter === "unread" ? items?.filter((n) => !n.isRead) : items;
  return (
    <div className="notification-inbox" aria-busy={loading || busy !== null}>
      <div className="notif-toolbar">
        <div
          className="notif-filters"
          role="group"
          aria-label={t("notifications.filter")}
        >
          <button
            type="button"
            aria-pressed={filter === "all"}
            onClick={() => setFilter("all")}
          >
            {t("notifications.all")}
          </button>
          <button
            type="button"
            aria-pressed={filter === "unread"}
            onClick={() => setFilter("unread")}
          >
            {t("push.unread")}
            {items ? ` (${unread})` : ""}
          </button>
        </div>
        <button
          type="button"
          className="notif-icon"
          aria-label={t("push.refresh")}
          disabled={loading || busy !== null}
          onClick={refresh}
        >
          {t("push.refresh")}
        </button>
      </div>
      <div className="notif-status-row">
        <p className="ac-sub">{t("notifications.inboxHint")}</p>
        <button
          type="button"
          className="notif-link"
          disabled={loading || busy !== null || unread === 0}
          onClick={() => void mark()}
        >
          {t(
            busy === "all"
              ? "notifications.updating"
              : "notifications.markAllRead",
          )}
        </button>
      </div>
      {actionError && (
        <p role="alert" className="notif-error">
          {t("push.error")}
        </p>
      )}
      {loading ? (
        <div className="notif-state" role="status">
          <span className="app-spinner" />
          <p>{t("notifications.loading")}</p>
        </div>
      ) : loadError ? (
        <div className="notif-state">
          <p role="alert">{t("notifications.loadFailed")}</p>
          <button className="btn btn-secondary" onClick={refresh}>
            {t("portal.retry")}
          </button>
        </div>
      ) : !visible?.length ? (
        <div className="notif-state">
          <IcBell size={32} />
          <h3>
            {t(
              filter === "unread"
                ? "notifications.caughtUp"
                : "notifications.empty",
            )}
          </h3>
          <p>
            {t(
              filter === "unread"
                ? "notifications.caughtUpHint"
                : "notifications.emptyHint",
            )}
          </p>
        </div>
      ) : (
        <ul className="notif-list">
          {visible.map((n) => (
            <li
              key={n.id}
              className={
                n.isRead ? "notif-entry" : "notif-entry notif-entry--unread"
              }
            >
              <div className="notif-entry-icon">
                <IcBell size={19} />
              </div>
              <div className="notif-entry-content">
                <div className="notif-entry-heading">
                  <strong dir="auto">{n.title}</strong>
                  {role === "admin" && <a className="notif-link" href="/admin/orders" onClick={onNavigate}>Inspect delivery operations</a>}
                  {!n.isRead && (
                    <span className="notif-unread-label">
                      {t("push.unread")}
                    </span>
                  )}
                </div>
                <p dir="auto">{n.message}</p>
                <div className="notif-entry-footer">
                  <time dateTime={n.createdAt} title={n.createdAt}>
                    {notificationTime(
                      n.createdAt,
                      language === "ur" ? "ur-PK" : "en-PK",
                    )}
                  </time>
                  {role === "transporter" && <a className="notif-link" href={n.type === "payout_recorded" ? "/transporter?tab=earnings" : "/transporter?tab=shipments"} onClick={onNavigate}>{language === "ur" ? "موجودہ تفصیل کھولیں" : "Open current details"}</a>}
                  {role === "admin" && <a className="notif-link" href="/admin/orders" onClick={onNavigate}>Inspect delivery operations</a>}
                  {!n.isRead && (
                    <button
                      type="button"
                      className="notif-link"
                      disabled={busy !== null}
                      onClick={() => void mark(n.id)}
                    >
                      <IcCheck size={15} />
                      {t(
                        busy === n.id
                          ? "notifications.updating"
                          : "notifications.markRead",
                      )}
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
