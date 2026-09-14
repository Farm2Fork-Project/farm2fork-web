"use client";

import {
  LuShoppingCart,
  LuStore,
  LuTruck,
  LuChevronRight,
  LuArrowLeft,
  LuX,
} from "react-icons/lu";

import { SignUpRoleScreenProps } from "./types";
import { useLanguage } from "./LanguageContext";

export default function SignUpRoleScreen({ onBack, onBackHome, onSelectRole }: SignUpRoleScreenProps) {
  const { t } = useLanguage();

  return (
    <div className="auth-wrapper" role="dialog" aria-modal="true" aria-labelledby="role-heading" onMouseDown={(e) => e.target === e.currentTarget && onBackHome?.()}>
      <div className="auth-card auth-card-narrow">
        <div className="auth-form-side">
          {onBackHome && <button className="auth-close" onClick={onBackHome} aria-label={t("login.closeAriaLabel")}><LuX size={22} /></button>}
          <button className="auth-home-link" onClick={onBackHome}><LuArrowLeft size={16} /> {t("login.backToHome")}</button>
          <div className="auth-card-narrow-header">
            <button className="back-btn" onClick={onBack} aria-label={t("signupRole.goBackAriaLabel")}>
              <LuArrowLeft size={22} />
            </button>
            <h1 id="role-heading">{t("signupRole.header")}</h1>
          </div>

          <p className="role-selection-title">{t("signupRole.want")}</p>

          <div
            className="role-card"
            onClick={() => onSelectRole("buyer")}
            role="button"
            tabIndex={0}
            id="role-buyer"
          >
            <div className="role-card-icon">
              <LuShoppingCart size={24} />
            </div>
            <div className="role-card-content">
              <h3>{t("signupRole.buyerRole")}</h3>
              <p>{t("signupRole.buyerDescText")}</p>
            </div>
            <LuChevronRight size={20} className="role-card-arrow" />
          </div>

          <div className="role-card" onClick={() => onSelectRole("farmer")} role="button" tabIndex={0} id="role-farmer">
            <div className="role-card-icon">
              <LuStore size={24} />
            </div>
            <div className="role-card-content">
              <h3>{t("signupRole.farmerRole")}</h3>
              <p>{t("signupRole.farmerDescText")}</p>
            </div>
            <LuChevronRight size={20} className="role-card-arrow" />
          </div>

          <div className="role-card" onClick={() => onSelectRole("transporter")} role="button" tabIndex={0} id="role-transporter">
            <div className="role-card-icon">
              <LuTruck size={24} />
            </div>
            <div className="role-card-content">
              <h3>{t("signupRole.transporterRole")}</h3>
              <p>{t("signupRole.transporterDescText")}</p>
            </div>
            <LuChevronRight size={20} className="role-card-arrow" />
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
