"use client";

import type { KeyboardEvent } from "react";

import { SignUpRoleScreenProps } from "./types";
import { useLanguage } from "./LanguageContext";
import { IcArrowLeft, IcCart, IcChevronRight, IcClose, IcStore, IcTruck } from "@/components/icons";

export default function SignUpRoleScreen({ onBack, onBackHome, onSelectRole }: SignUpRoleScreenProps) {
  const { t } = useLanguage();

  const handleRoleKeyDown = (
    e: KeyboardEvent<HTMLDivElement>,
    role: "buyer" | "farmer" | "transporter"
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelectRole(role);
    }
  };

  return (
    <div className="auth-wrapper" role="dialog" aria-modal="true" aria-labelledby="role-heading" onMouseDown={(e) => e.target === e.currentTarget && onBackHome?.()}>
      <div className="auth-card auth-card-narrow">
        <div className="auth-form-side">
          {onBackHome && <button className="auth-close" onClick={onBackHome} aria-label={t("login.closeAriaLabel")}><IcClose size={22} /></button>}
          <button className="auth-home-link" onClick={onBackHome}><IcArrowLeft size={16} /> {t("login.backToHome")}</button>
          <div className="auth-card-narrow-header">
            <button className="back-btn" onClick={onBack} aria-label={t("signupRole.goBackAriaLabel")}>
              <IcArrowLeft size={22} />
            </button>
            <h1 id="role-heading">{t("signupRole.header")}</h1>
          </div>

          <p className="role-selection-title">{t("signupRole.want")}</p>

          <div
            className="role-card"
            onClick={() => onSelectRole("buyer")}
            onKeyDown={(e) => handleRoleKeyDown(e, "buyer")}
            role="button"
            tabIndex={0}
            id="role-buyer"
          >
            <div className="role-card-icon">
              <IcCart size={24} />
            </div>
            <div className="role-card-content">
              <h3>{t("signupRole.buyerRole")}</h3>
              <p>{t("signupRole.buyerDescText")}</p>
            </div>
            <IcChevronRight size={20} className="role-card-arrow" />
          </div>

          <div className="role-card" onClick={() => onSelectRole("farmer")} onKeyDown={(e) => handleRoleKeyDown(e, "farmer")} role="button" tabIndex={0} id="role-farmer">
            <div className="role-card-icon">
              <IcStore size={24} />
            </div>
            <div className="role-card-content">
              <h3>{t("signupRole.farmerRole")}</h3>
              <p>{t("signupRole.farmerDescText")}</p>
            </div>
            <IcChevronRight size={20} className="role-card-arrow" />
          </div>

          <div className="role-card" onClick={() => onSelectRole("transporter")} onKeyDown={(e) => handleRoleKeyDown(e, "transporter")} role="button" tabIndex={0} id="role-transporter">
            <div className="role-card-icon">
              <IcTruck size={24} />
            </div>
            <div className="role-card-content">
              <h3>{t("signupRole.transporterRole")}</h3>
              <p>{t("signupRole.transporterDescText")}</p>
            </div>
            <IcChevronRight size={20} className="role-card-arrow" />
          </div>

          <div className="auth-footer">
            {t("signupRole.already")}{" "}
            <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }}>
              {t("signupRole.login")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
