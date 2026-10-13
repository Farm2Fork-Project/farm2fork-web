"use client";

import type { ReactNode } from "react";
import { useLanguage } from "@/components/LanguageContext";
import type { UserRole, ApiAuthUser } from "@/lib/api/contracts.ts";
import { usePortalSession } from "@/lib/auth/use-portal-session.ts";

/**
 * Renders `children(user)` once the visitor is signed in with the right role;
 * otherwise redirects (see usePortalSession) or shows a retryable error.
 */
export function PortalGate({
  role,
  children,
}: {
  role: UserRole | null;
  children: (user: ApiAuthUser) => ReactNode;
}) {
  const { t } = useLanguage();
  const session = usePortalSession(role);

  if (session.status === "ready") return <>{children(session.user)}</>;

  if (session.status === "error") {
    return (
      <div className="app-boundary" role="alert">
        <h1>{t("portal.errorTitle")}</h1>
        <p>{t("portal.errorBody")}</p>
        <button type="button" className="btn btn-primary" onClick={session.retry}>
          {t("portal.retry")}
        </button>
      </div>
    );
  }

  return (
    <div className="app-boundary" role="status" aria-live="polite">
      <div className="app-spinner" />
      <p>{t("portal.checking")}</p>
    </div>
  );
}
