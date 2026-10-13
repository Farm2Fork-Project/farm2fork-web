"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useLanguage } from "@/components/LanguageContext";
import { IcArrowLeft, IcLeaf } from "@/components/icons";
import type { UserRole } from "@/lib/api/contracts.ts";
import { portalPathForRole } from "@/lib/auth/role-routes.ts";

const BACK_LABELS: Record<UserRole, string> = {
  buyer: "account.backBuyer",
  farmer: "account.backFarmer",
  transporter: "account.backGeneric",
  financial_partner: "account.backGeneric",
  admin: "account.backGeneric",
};

/** Header and page container shared by /account and /account/edit. */
export function AccountFrame({ role, children }: { role: UserRole; children: ReactNode }) {
  const { t, language } = useLanguage();
  return (
    <div className="ac-page" dir={language === "ur" ? "rtl" : "ltr"}>
      <header className="ac-top">
        <Link className="ac-brand" href={portalPathForRole(role)} aria-label={t("auth.homeAria")}>
          <IcLeaf size={22} /> <span>{t("app.title")}</span>
        </Link>
        <Link className="ac-back" href={portalPathForRole(role)} aria-label={t(BACK_LABELS[role])}>
          <IcArrowLeft size={18} className="ac-flip" /> <span className="ac-back-label">{t(BACK_LABELS[role])}</span>
        </Link>
      </header>
      <main className="ac-main" id="main">{children}</main>
    </div>
  );
}
