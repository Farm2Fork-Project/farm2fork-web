"use client";

import Link from "next/link";
import { LuScanLine, LuSmartphone, LuTruck } from "react-icons/lu";
import { LanguageProvider, useLanguage } from "@/components/LanguageContext";

/**
 * Transporters work from the Farm2Fork mobile app: delivery offers need the
 * phone's live location, push notifications and turn-by-turn navigation.
 * Old links (and the sign-up role card) land here.
 */
function TransporterMobileOnly() {
  const { t } = useLanguage();
  return (
    <main className="mobile-only-page">
      <div className="mobile-only-card">
        <span className="mobile-only-icon" aria-hidden="true">
          <LuTruck size={32} />
        </span>
        <h1>{t("transporterMobile.title")}</h1>
        <p>{t("transporterMobile.body")}</p>
        <ul>
          <li>{t("transporterMobile.point.offers")}</li>
          <li>{t("transporterMobile.point.navigation")}</li>
          <li>{t("transporterMobile.point.updates")}</li>
        </ul>
        <p className="mobile-only-note">
          <LuSmartphone size={16} aria-hidden="true" /> {t("transporterMobile.install")}
        </p>
        <div className="mobile-only-actions">
          <Link className="btn btn-primary" href="/">
            {t("transporterMobile.home")}
          </Link>
          <Link className="btn btn-outline" href="/trace">
            <LuScanLine size={16} aria-hidden="true" /> {t("transporterMobile.trace")}
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function TransporterPage() {
  return (
    <LanguageProvider>
      <TransporterMobileOnly />
    </LanguageProvider>
  );
}
