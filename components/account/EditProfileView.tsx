"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, type FormEvent } from "react";
import { AccountFrame } from "@/components/account/AccountFrame";
import { AvatarEditor } from "@/components/account/AvatarEditor";
import { FarmLocationFields } from "@/components/auth/FarmLocationFields";
import { ChoiceGroup, MultiChoiceGroup, TextField } from "@/components/auth/fields";
import { InlineConfirm } from "@/components/ui/InlineConfirm";
import { useLanguage } from "@/components/LanguageContext";
import { ApiError, type ApiProfile } from "@/lib/api/contracts.ts";
import type { AccountRepository } from "@/lib/account/account-repository.ts";
import {
  diffProfile,
  initialForm,
  isDirty,
  splitApiFieldErrors,
  validateProfileForm,
  type ProfileForm,
} from "@/lib/account/profile-form.ts";
import { useDirtyGuard } from "@/lib/account/use-dirty-guard.ts";
import { useProfile } from "@/lib/account/use-profile.ts";
import { BUSINESS_TYPES, CROP_OPTIONS } from "@/lib/auth/onboarding-payload.ts";
import { displayPhone, normalizePkPhone } from "@/lib/auth/validation.ts";

export function EditProfileView() {
  const { t } = useLanguage();
  const { repository, state, reload, replace } = useProfile();

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
        <button type="button" className="btn btn-primary" onClick={reload}>{t("portal.retry")}</button>
      </div>
    );
  }
  return <EditForm profile={state.profile} repository={repository} onProfile={replace} />;
}

export function EditForm({
  profile,
  repository,
  onProfile,
}: {
  profile: ApiProfile;
  repository: Pick<AccountRepository, "updateProfile" | "updateFarmLocation" | "uploadAvatar" | "removeAvatar">;
  onProfile: (profile: ApiProfile) => void;
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const kind = profile.profile.kind;
  const [form, setForm] = useState<ProfileForm>(() => initialForm(profile));
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [serverFields, setServerFields] = useState<Set<string>>(new Set());
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const dirty = isDirty(profile, form);
  const errors = useMemo(() => validateProfileForm(profile, form), [profile, form]);
  const guard = useDirtyGuard(dirty, (href) => router.push(href));

  const set = <K extends keyof ProfileForm>(name: K, value: ProfileForm[K]) => {
    setForm((current) => ({ ...current, [name]: value }));
    setServerFields((current) => {
      if (!current.has(name)) return current;
      const next = new Set(current);
      next.delete(name);
      return next;
    });
  };
  const blur = (name: string) => setTouched((current) => new Set(current).add(name));
  const text = (name: string) => {
    const value = form[name as keyof ProfileForm];
    return typeof value === "string" ? value : "";
  };
  const fieldError = (name: string): string | undefined => {
    if (serverFields.has(name)) return t("account.err.rejected");
    const key = touched.has(name) ? errors[name] : undefined;
    return key ? t(key) : undefined;
  };

  const phone = normalizePkPhone(form.phone);
  const customCrops = form.cropTypes.filter((crop) => !(CROP_OPTIONS as readonly string[]).includes(crop));
  const cropOptions = [
    ...CROP_OPTIONS.map((value) => ({ value: value as string, label: t(`signup.crop.${value}`) })),
    ...customCrops.map((value) => ({ value, label: value })),
  ];

  async function save(event: FormEvent) {
    event.preventDefault();
    if (saving) return;
    setFormError("");
    if (Object.keys(errors).length) {
      setTouched((current) => new Set([...current, ...Object.keys(errors)]));
      setTimeout(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"], [data-invalid="true"]')?.focus(), 0);
      return;
    }
    const { changes, location } = diffProfile(profile, form);
    if (!Object.keys(changes).length && !location) return;
    setSaving(true);
    try {
      let next = profile;
      if (Object.keys(changes).length) next = await repository.updateProfile(changes);
      if (location) await repository.updateFarmLocation(location);
      onProfile(next);
      guard.allowNavigation();
      router.push("/account?saved=1");
    } catch (error) {
      if (error instanceof ApiError && error.status === 400) {
        const { fields, other } = splitApiFieldErrors(error.message);
        if (fields.length) setServerFields(new Set(fields));
        setFormError(other.length ? `${t("account.err.rejected")} ${other.join(" ")}` : t("account.err.checkFields"));
      } else if (error instanceof ApiError && error.status === 0) {
        setFormError(t("authError.network"));
      } else {
        setFormError(t("account.err.saveFailed"));
      }
      setSaving(false);
    }
  }

  return (
    <AccountFrame role={profile.user.role}>
      <div className="ac-pagehead">
        <h1>{t("account.editTitle")}</h1>
        <p className="ac-sub">{t("account.editLede")}</p>
      </div>

      <AvatarEditor user={profile.user} repository={repository} onUpdated={onProfile} />

      <form ref={formRef} className="ac-form" onSubmit={save} noValidate>
        <section className="ac-card" aria-labelledby="ed-personal">
          <h2 id="ed-personal">{t("account.personal")}</h2>
          <div className="ac-fields">
            <TextField
              id="ed-name"
              label={t("signup.fullName")}
              autoComplete="name"
              value={form.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              onBlur={() => blur("fullName")}
              error={fieldError("fullName")}
              disabled={saving}
            />
            <TextField
              id="ed-phone"
              label={t("signup.phone")}
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              dir="ltr"
              placeholder="0300 1234567"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              onBlur={() => blur("phone")}
              hint={phone && phone !== profile.user.phone ? t("signup.phoneSavedAs").replace("{phone}", displayPhone(phone)) : t("signup.phoneHint")}
              error={fieldError("phone")}
              disabled={saving}
            />
            <TextField id="ed-email" label={t("login.emailLabel")} value={profile.user.email} readOnly dir="ltr" hint={t("account.readOnlyEmail")} />
            {profile.profile.cnicMasked ? (
              <TextField id="ed-cnic" label={t("signup.cnic")} value={profile.profile.cnicMasked} readOnly dir="ltr" hint={t("account.readOnlyCnic")} />
            ) : null}
          </div>
        </section>

        {kind === "buyer" ? (
          <section className="ac-card" aria-labelledby="ed-business">
            <h2 id="ed-business">{t("account.business")}</h2>
            <div className="ac-fields">
              <ChoiceGroup
                legend={t("signup.buyingAs")}
                name="businessType"
                options={BUSINESS_TYPES.map((value) => ({ value, label: t(`signup.businessType.${value}`) }))}
                value={form.businessType}
                onChange={(value) => { set("businessType", value); blur("businessType"); }}
                error={fieldError("businessType")}
                disabled={saving}
              />
              {form.businessType && form.businessType !== "individual" ? (
                <TextField
                  id="ed-business-name"
                  label={t("signup.businessName")}
                  value={form.businessName}
                  onChange={(e) => set("businessName", e.target.value)}
                  onBlur={() => blur("businessName")}
                  error={fieldError("businessName")}
                  disabled={saving}
                />
              ) : null}
            </div>
          </section>
        ) : null}

        {kind === "farmer" ? (
          <>
            <section className="ac-card" aria-labelledby="ed-farm">
              <h2 id="ed-farm">{t("account.farm")}</h2>
              <div className="ac-fields">
                <TextField
                  id="ed-farm-name"
                  label={t("signup.farmName")}
                  value={form.farmName}
                  onChange={(e) => set("farmName", e.target.value)}
                  onBlur={() => blur("farmName")}
                  error={fieldError("farmName")}
                  disabled={saving}
                />
                <TextField
                  id="ed-land"
                  label={t("signup.landSize")}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  dir="ltr"
                  value={form.landSizeAcres}
                  onChange={(e) => set("landSizeAcres", e.target.value)}
                  onBlur={() => blur("landSizeAcres")}
                  error={fieldError("landSizeAcres")}
                  disabled={saving}
                />
                <MultiChoiceGroup
                  legend={t("signup.crops")}
                  options={cropOptions}
                  values={form.cropTypes}
                  onToggle={(value) =>
                    set("cropTypes", form.cropTypes.includes(value) ? form.cropTypes.filter((c) => c !== value) : [...form.cropTypes, value])
                  }
                  disabled={saving}
                />
              </div>
            </section>
            <section className="ac-card" aria-labelledby="ed-pickup">
              <h2 id="ed-pickup">{t("account.pickup")}</h2>
              <p className="ac-sub">{t("signup.locationLede")}</p>
              <div className="ac-fields">
                <FarmLocationFields
                  idPrefix="ed"
                  text={text}
                  setValue={(name, value) => { if (name !== "location") set(name, value); }}
                  blur={blur}
                  error={fieldError}
                  disabled={saving}
                />
              </div>
            </section>
          </>
        ) : null}

        <div className="ac-savebar" role="region" aria-label={t("account.saveBar")}>
          {guard.pendingHref ? (
            <>
              <p className="ac-savebar-text" role="alert">{t("account.leavePrompt")}</p>
              <button type="button" className="btn btn-outline" onClick={guard.stay}>{t("account.stay")}</button>
              <button type="button" className="btn btn-danger-solid" onClick={() => guard.leave()}>{t("account.leave")}</button>
            </>
          ) : (
            <>
              <p className="ac-savebar-text" role="status">
                {formError ? <span className="ac-error-inline">{formError}</span> : dirty ? t("account.unsaved") : t("account.noChanges")}
              </p>
              {dirty ? (
                <InlineConfirm
                  label={t("account.discard")}
                  prompt={t("account.discardPrompt")}
                  confirmLabel={t("account.discardConfirm")}
                  onConfirm={() => router.push("/account")}
                  triggerClassName="btn btn-outline"
                />
              ) : (
                <Link className="btn btn-outline" href="/account">{t("account.cancel")}</Link>
              )}
              <button type="submit" className="btn btn-primary" disabled={!dirty || saving}>
                {saving ? t("account.saving") : t("account.save")}
              </button>
            </>
          )}
        </div>
      </form>
    </AccountFrame>
  );
}
