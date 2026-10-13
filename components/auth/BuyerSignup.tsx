"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ChoiceGroup, TextField } from "@/components/auth/fields";
import { SignupWizard, type StepContext, type WizardStep } from "@/components/auth/SignupWizard";
import { useLanguage } from "@/components/LanguageContext";
import {
  BUSINESS_TYPES,
  validateBuyerAbout,
  validateIdentity,
} from "@/lib/auth/onboarding-payload.ts";
import { formatCnic, normalizePkPhone, displayPhone } from "@/lib/auth/validation.ts";

export function BuyerSignup() {
  const { t } = useLanguage();

  const steps = useMemo<WizardStep[]>(() => {
    const pick = (errors: Record<string, string>, keys: string[]) =>
      Object.fromEntries(Object.entries(errors).filter(([key]) => keys.includes(key)));

    const about = (ctx: StepContext) => {
      const phone = normalizePkPhone(ctx.text("phone"));
      return (
        <>
          <TextField
            id="buyer-name"
            label={t("signup.fullName")}
            autoComplete="name"
            value={ctx.text("fullName")}
            onChange={(e) => ctx.setValue("fullName", e.target.value)}
            onBlur={() => ctx.blur("fullName")}
            error={ctx.error("fullName")}
            disabled={ctx.disabled}
          />
          <TextField
            id="buyer-phone"
            label={t("signup.phone")}
            optional
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            dir="ltr"
            placeholder="0300 1234567"
            value={ctx.text("phone")}
            onChange={(e) => ctx.setValue("phone", e.target.value)}
            onBlur={() => ctx.blur("phone")}
            hint={phone ? t("signup.phoneSavedAs").replace("{phone}", displayPhone(phone)) : t("signup.phoneHint")}
            error={ctx.error("phone")}
            disabled={ctx.disabled}
          />
          <ChoiceGroup
            legend={t("signup.buyingAs")}
            name="businessType"
            options={BUSINESS_TYPES.map((value) => ({ value, label: t(`signup.businessType.${value}`) }))}
            value={ctx.text("businessType")}
            onChange={(value) => {
              ctx.setValue("businessType", value);
              ctx.blur("businessType");
            }}
            error={ctx.error("businessType")}
            disabled={ctx.disabled}
          />
          {ctx.text("businessType") && ctx.text("businessType") !== "individual" ? (
            <TextField
              id="buyer-business"
              label={t("signup.businessName")}
              autoComplete="organization"
              value={ctx.text("businessName")}
              onChange={(e) => ctx.setValue("businessName", e.target.value)}
              onBlur={() => ctx.blur("businessName")}
              error={ctx.error("businessName")}
              disabled={ctx.disabled}
            />
          ) : null}
        </>
      );
    };

    const identity = (ctx: StepContext) => (
      <TextField
        id="buyer-cnic"
        label={t("signup.cnic")}
        inputMode="numeric"
        autoComplete="off"
        dir="ltr"
        placeholder="35202-1234567-1"
        value={ctx.text("cnic")}
        onChange={(e) => ctx.setValue("cnic", formatCnic(e.target.value))}
        onBlur={() => ctx.blur("cnic")}
        hint={t("signup.cnicHint")}
        error={ctx.error("cnic")}
        disabled={ctx.disabled}
      />
    );

    return [
      {
        id: "about",
        title: t("signup.step.aboutYou"),
        fields: ["fullName", "phone", "businessType", "businessName"],
        validate: (v) => pick({ ...validateIdentity(v), ...validateBuyerAbout(v) }, ["fullName", "phone", "businessType", "businessName"]),
        render: about,
      },
      {
        id: "identity",
        title: t("signup.step.identity"),
        fields: ["cnic"],
        validate: (v) => pick(validateIdentity(v), ["cnic"]),
        render: identity,
        footer: <TermsNote />,
      },
    ];
  }, [t]);

  return (
    <SignupWizard
      role="buyer"
      title={t("signup.buyerTitle")}
      lede={t("signup.buyerLede")}
      submitLabel={t("signup.createAccount")}
      steps={steps}
    />
  );
}

export function TermsNote() {
  const { t } = useLanguage();
  return (
    <p className="af-footnote af-terms">
      {t("signup.termsPre")}{" "}
      <Link className="af-inline-link" href="/terms" target="_blank" rel="noopener">{t("signup.termsLink")}</Link>{" "}
      {t("signup.termsAnd")}{" "}
      <Link className="af-inline-link" href="/privacy" target="_blank" rel="noopener">{t("signup.privacyLink")}</Link>.
    </p>
  );
}
