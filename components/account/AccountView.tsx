"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { AccountFrame } from "@/components/account/AccountFrame";
import { Avatar } from "@/components/account/Avatar";
import { InlineConfirm } from "@/components/ui/InlineConfirm";
import NotificationSettings from "@/components/NotificationSettings";
import {
  useLanguage,
  type FontSize,
  type Language,
} from "@/components/LanguageContext";
import { IcBadgeCheck, IcAlert, IcEdit, IcLogOut } from "@/components/icons";
import type { ApiProfile } from "@/lib/api/contracts.ts";
import { displayPhone } from "@/lib/auth/validation.ts";
import { useProfile } from "@/lib/account/use-profile.ts";
import { useSignOut } from "@/lib/auth/use-sign-out.ts";

const HAS_CONTACT = !!process.env.NEXT_PUBLIC_CONTACT_EMAIL;

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="ac-row">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

const dash = <span className="ac-empty">—</span>;

function RoleDetails({ profile }: { profile: ApiProfile }) {
  const { t } = useLanguage();
  const d = profile.profile;
  const crops = (d.cropTypes ?? []).map((c) => {
    const key = `signup.crop.${c}`;
    return t(key) === key ? c : t(key);
  });
  const place = d.farmLocation;

  if (d.kind === "buyer") {
    return (
      <section className="ac-card" aria-labelledby="ac-business">
        <h2 id="ac-business">{t("account.business")}</h2>
        <dl className="ac-list">
          <Row label={t("signup.businessName")}>{d.businessName || dash}</Row>
          <Row label={t("account.businessType")}>
            {d.businessType ? t(`signup.businessType.${d.businessType}`) : dash}
          </Row>
        </dl>
      </section>
    );
  }
  if (d.kind === "farmer") {
    return (
      <section className="ac-card" aria-labelledby="ac-farm">
        <h2 id="ac-farm">{t("account.farm")}</h2>
        <dl className="ac-list">
          <Row label={t("signup.farmName")}>{d.farmName || dash}</Row>
          <Row label={t("signup.landSize")}>
            {d.landSizeAcres === undefined ? dash : d.landSizeAcres}
          </Row>
          <Row label={t("account.crops")}>
            {crops.length ? crops.join(", ") : dash}
          </Row>
          <Row label={t("account.pickup")}>
            {place?.complete ? (
              [place.address, place.city, place.province]
                .filter(Boolean)
                .join(", ")
            ) : (
              <span className="ac-warn">
                <IcAlert size={16} /> {t("account.pickupMissing")}{" "}
                <Link className="ac-link" href="/account/edit">
                  {t("account.addPickup")}
                </Link>
              </span>
            )}
          </Row>
        </dl>
      </section>
    );
  }
  if (d.kind === "transporter") {
    return (
      <section className="ac-card" aria-labelledby="ac-vehicle">
        <h2 id="ac-vehicle">{t("account.vehicle")}</h2>
        <dl className="ac-list">
          <Row label={t("account.vehicleType")}>{d.vehicleType || dash}</Row>
          <Row label={t("account.vehicleNumber")}>
            {d.vehicleNumber || dash}
          </Row>
          <Row label={t("account.serviceAreas")}>
            {d.serviceAreas?.length ? d.serviceAreas.join(", ") : dash}
          </Row>
        </dl>
      </section>
    );
  }
  if (d.kind === "financial_partner") {
    return (
      <section className="ac-card" aria-labelledby="ac-institution">
        <h2 id="ac-institution">{t("account.institution")}</h2>
        <dl className="ac-list">
          <Row label={t("account.institutionName")}>
            {d.institutionName || dash}
          </Row>
          <Row label={t("account.institutionType")}>
            {d.institutionType || dash}
          </Row>
        </dl>
      </section>
    );
  }
  return null;
}

const LANGUAGES: Array<{ value: Language; label: string }> = [
  { value: "en", label: "English" },
  { value: "ur", label: "اردو" },
];

export function AccountView() {
  const { t, language, setLanguage, fontSize, setFontSize } = useLanguage();
  const { state, reload } = useProfile();
  const signOut = useSignOut();
  const saved = useSearchParams().get("saved") === "1";

  if (state.status === "loading") {
    return (
      <div className="app-boundary" role="status" aria-live="polite">
        <div className="app-spinner" />
        <p>{t("account.loading")}</p>
      </div>
    );
  }
  if (state.status === "error") {
    return (
      <div className="app-boundary" role="alert">
        <h1>{t("account.errorTitle")}</h1>
        <p>{t("portal.errorBody")}</p>
        <button type="button" className="btn btn-primary" onClick={reload}>
          {t("portal.retry")}
        </button>
      </div>
    );
  }

  const { profile } = state;
  const user = profile.user;
  const role = user.role;
  const sizes: Array<{ value: FontSize; label: string }> = [
    { value: "small", label: t("settings.lang.fontSmall") },
    { value: "medium", label: t("settings.lang.fontMedium") },
    { value: "large", label: t("settings.lang.fontLarge") },
  ];

  return (
    <AccountFrame role={role}>
      {saved ? (
        <p className="ac-toast" role="status">
          {t("account.saved")}
        </p>
      ) : null}

      <header className="ac-hero" id="overview">
        <Avatar
          user={{ ...user, fullName: user.fullName || profile.displayName }}
          size={88}
        />
        <div className="ac-hero-text">
          <h1>{profile.displayName}</h1>
          <p className="ac-hero-description">{t("account.subtitle")}</p>
          <p className="ac-hero-meta">
            <span className="ac-role">{t(`account.role.${role}`)}</span>
            <span className="ac-email" dir="ltr">
              {user.email}
            </span>
            {user.isVerified ? (
              <span className="ac-verified">
                <IcBadgeCheck size={16} /> {t("account.verified")}
              </span>
            ) : (
              <span className="ac-unverified">
                <IcAlert size={16} /> {t("account.unverified")}
              </span>
            )}
          </p>
        </div>
        <Link className="btn btn-outline ac-edit" href="/account/edit">
          <IcEdit size={16} /> {t("account.edit")}
        </Link>
      </header>

      <div className="ac-account-layout">
        <nav className="ac-section-nav" aria-label={t("account.navigation")}>
          <a href="#overview">{t("account.overview")}</a>
          <a href="#personal">{t("account.details")}</a>
          <a href="#preferences">{t("account.preferences")}</a>
          <a href="#notifications">{t("notifications.title")}</a>
          <a href="#help">{t("settings.sidebar.help")}</a>
        </nav>
        <div className="ac-account-content">
          <section
            id="personal"
            className="ac-card"
            aria-labelledby="ac-personal"
          >
            <h2 id="ac-personal">{t("account.personal")}</h2>
            <dl className="ac-list">
              <Row label={t("signup.fullName")}>{user.fullName || dash}</Row>
              <Row label={t("signup.phone")}>
                {user.phone ? (
                  <span dir="ltr">{displayPhone(user.phone)}</span>
                ) : (
                  dash
                )}
              </Row>
              <Row label={t("login.emailLabel")}>
                <span dir="ltr">{user.email}</span>
              </Row>
              {profile.profile.cnicMasked ? (
                <Row label={t("signup.cnic")}>
                  <span dir="ltr">{profile.profile.cnicMasked}</span>
                </Row>
              ) : null}
            </dl>
          </section>

          <RoleDetails profile={profile} />

          <section
            id="preferences"
            className="ac-card"
            aria-labelledby="ac-prefs"
          >
            <h2 id="ac-prefs">{t("account.preferences")}</h2>
            <fieldset className="ac-pref">
              <legend>{t("settings.lang.language")}</legend>
              <div className="ac-segment">
                {LANGUAGES.map((option) => (
                  <label key={option.value}>
                    <input
                      type="radio"
                      name="ac-language"
                      checked={language === option.value}
                      onChange={() => setLanguage(option.value)}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset className="ac-pref">
              <legend>{t("settings.lang.fontsize")}</legend>
              <div className="ac-segment">
                {sizes.map((option) => (
                  <label key={option.value}>
                    <input
                      type="radio"
                      name="ac-fontsize"
                      checked={fontSize === option.value}
                      onChange={() => setFontSize(option.value)}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </section>

          <section
            id="notifications"
            className="ac-card"
            aria-labelledby="ac-notifs"
          >
            <h2 id="ac-notifs">{t("settings.notif.title")}</h2>
            <p className="ac-sub">{t("settings.notif.subtitle")}</p>
            <NotificationSettings />
          </section>

          <section id="help" className="ac-card" aria-labelledby="ac-help">
            <h2 id="ac-help">{t("settings.sidebar.help")}</h2>
            <ul className="ac-links">
              <li>
                <Link href="/faq">{t("settings.sidebar.faqs")}</Link>
              </li>
              <li>
                <Link href="/about">{t("settings.sidebar.about")}</Link>
              </li>
              <li>
                <Link href="/privacy">{t("settings.sidebar.privacy")}</Link>
              </li>
              <li>
                <Link href="/terms">{t("settings.sidebar.terms")}</Link>
              </li>
              {HAS_CONTACT ? (
                <li>
                  <Link href="/contact">{t("settings.sidebar.contact")}</Link>
                </li>
              ) : null}
            </ul>
          </section>

          <section className="ac-signout">
            <InlineConfirm
              label={t("account.signOut")}
              prompt={t("account.signOutPrompt")}
              confirmLabel={t("account.signOutConfirm")}
              onConfirm={signOut}
              icon={<IcLogOut size={16} />}
              tone="danger"
            />
          </section>
        </div>
      </div>
    </AccountFrame>
  );
}
