"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { IcBell, IcClose } from "@/components/icons";
import { useLanguage } from "./LanguageContext";
import NotificationInbox, { INBOX_CHANGED } from "./NotificationInbox";
import { NotificationRepository } from "@/lib/notifications/notification-repository";

const POLL_MS = 60_000;

export default function NotificationBell({
  repository,
  role,
}: {
  repository?: NotificationRepository;
  role?: "transporter" | "admin";
}) {
  const { t, language } = useLanguage();
  const repo = useMemo(
    () => repository ?? new NotificationRepository(),
    [repository],
  );
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const bell = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    let active = true;
    let request = 0;
    const refresh = () => {
      const generation = ++request;
      void repo.unreadCount().then(
        (count) => {
          if (active && generation === request) setUnread(count);
        },
        () => undefined,
      );
    };
    refresh();
    const timer = setInterval(refresh, POLL_MS);
    window.addEventListener(INBOX_CHANGED, refresh);
    return () => {
      active = false;
      clearInterval(timer);
      window.removeEventListener(INBOX_CHANGED, refresh);
    };
  }, [repo]);
  const close = useCallback(() => setOpen(false), []);
  useEffect(() => {
    if (!open || !dialog.current) return;
    const node = dialog.current;
    const opener = bell.current;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (typeof node.showModal === "function") node.showModal();
    else node.setAttribute("open", "");
    return () => {
      document.body.style.overflow = overflow;
      opener?.focus();
    };
  }, [open]);
  return (
    <div className="notif-bell">
      <button
        ref={bell}
        type="button"
        className="topbar-icon-btn"
        aria-label={t("notifications.title")}
        aria-haspopup="dialog"
        aria-controls={open ? id : undefined}
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <IcBell size={20} />
        {unread > 0 && (
          <span className="notif-count">{unread > 99 ? "99+" : unread}</span>
        )}
      </button>
      {open &&
        createPortal(
          <dialog
            ref={dialog}
            id={id}
            className="notif-dialog"
            aria-labelledby={`${id}-title`}
            dir={language === "ur" ? "rtl" : "ltr"}
            onCancel={(event) => {
              event.preventDefault();
              close();
            }}
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                const rect = event.currentTarget.getBoundingClientRect();
                if (
                  event.clientX < rect.left ||
                  event.clientX > rect.right ||
                  event.clientY < rect.top ||
                  event.clientY > rect.bottom
                )
                  close();
              }
            }}
          >
            <header className="notif-dialog-head">
              <div>
                <h2 id={`${id}-title`}>{t("notifications.title")}</h2>
                <p>{t("notifications.subtitle")}</p>
              </div>
              <button
                type="button"
                className="notif-icon"
                aria-label={t("notifications.close")}
                onClick={close}
              >
                <IcClose size={20} />
              </button>
            </header>
            <div className="notif-dialog-body">
              <NotificationInbox repository={repo} role={role} onNavigate={close} />
            </div>
            <footer className="notif-dialog-foot">
              <Link href="/account#notifications" onClick={close}>
                {t("settings.notif.title")}
              </Link>
            </footer>
          </dialog>,
          document.body,
        )}
    </div>
  );
}
