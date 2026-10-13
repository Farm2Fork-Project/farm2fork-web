"use client";

import { useMemo } from "react";
import { FarmLocationFields } from "@/components/auth/FarmLocationFields";
import { MultiChoiceGroup, TextField } from "@/components/auth/fields";
import { TermsNote } from "@/components/auth/BuyerSignup";
import { SignupWizard, type StepContext, type WizardStep } from "@/components/auth/SignupWizard";
import { useLanguage } from "@/components/LanguageContext";
import {
  CROP_OPTIONS,
  validateFarmerFarm,
  validateIdentity,
} from "@/lib/auth/onboarding-payload.ts";
import { displayPhone, formatCnic, normalizePkPhone } from "@/lib/auth/validation.ts";

export function FarmerSignup() {
  const { t } = useLanguage();

  const steps = useMemo<WizardStep[]>(() => {
    const pick = (errors: Record<string, string>, keys: string[]) =>
      Object.fromEntries(Object.entries(errors).filter(([key]) => keys.includes(key)));

    const farm = (ctx: StepContext) => {
      const phone = normalizePkPhone(ctx.text("phone"));
      const crops = ctx.list("cropTypes");
      return (
        <>
          <TextField
            id="farmer-name"
            label={t("signup.fullName")}
            autoComplete="name"
            value={ctx.text("fullName")}
            onChange={(e) => ctx.setValue("fullName", e.target.value)}
            onBlur={() => ctx.blur("fullName")}
            error={ctx.error("fullName")}
            disabled={ctx.disabled}
          />
          <TextField
            id="farmer-phone"
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
          <TextField
            id="farmer-farm-name"
            label={t("signup.farmName")}
            value={ctx.text("farmName")}
            onChange={(e) => ctx.setValue("farmName", e.target.value)}
            onBlur={() => ctx.blur("farmName")}
            error={ctx.error("farmName")}
            disabled={ctx.disabled}
          />
          <TextField
            id="farmer-land"
            label={t("signup.landSize")}
            optional
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            dir="ltr"
            value={ctx.text("landSizeAcres")}
            onChange={(e) => ctx.setValue("landSizeAcres", e.target.value)}
            onBlur={() => ctx.blur("landSizeAcres")}
            error={ctx.error("landSizeAcres")}
            disabled={ctx.disabled}
          />
          <MultiChoiceGroup
            legend={t("signup.crops")}
            hint={t("signup.cropsHint")}
            options={CROP_OPTIONS.map((value) => ({ value, label: t(`signup.crop.${value}`) }))}
            values={crops}
            onToggle={(value) =>
              ctx.setValue("cropTypes", crops.includes(value) ? crops.filter((c) => c !== value) : [...crops, value])
            }
            disabled={ctx.disabled}
          />
        </>
      );
    };

    const place = (ctx: StepContext) => {
      return (
        <>
          <p className="af-step-lede">{t("signup.locationLede")}</p>
          <FarmLocationFields
            idPrefix="farmer"
            text={ctx.text}
            setValue={ctx.setValue}
            blur={ctx.blur}
            error={ctx.error}
            disabled={ctx.disabled}
          />
          <TextField
            id="farmer-cnic"
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
        </>
      );
    };

    return [
      {
        id: "farm",
        title: t("signup.step.yourFarm"),
        fields: ["fullName", "phone", "farmName", "landSizeAcres", "cropTypes"],
        validate: (v) =>
          pick({ ...validateIdentity(v), ...validateFarmerFarm(v) }, ["fullName", "phone", "farmName", "landSizeAcres"]),
        render: farm,
      },
      {
        id: "place",
        title: t("signup.step.locationId"),
        fields: ["address", "city", "province", "location", "cnic"],
        validate: (v) => pick({ ...validateIdentity(v), ...validateFarmerFarm(v) }, ["address", "city", "province", "location", "cnic"]),
        render: place,
        footer: <TermsNote />,
      },
    ];
  }, [t]);

  return (
    <SignupWizard
      role="farmer"
      title={t("signup.farmerTitle")}
      lede={t("signup.farmerLede")}
      submitLabel={t("signup.createAccount")}
      steps={steps}
    />
  );
}
