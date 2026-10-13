"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { AuthHeading, AuthMessage } from "@/components/auth/AuthShell";
import { PasswordField, TextField } from "@/components/auth/fields";
import { useLanguage } from "@/components/LanguageContext";
import { IcArrowLeft, IcArrowRight } from "@/components/icons";
import { authErrorKey } from "@/lib/auth/auth-errors.ts";
import { onboardFromDraft } from "@/lib/auth/finish-onboarding.ts";
import { readMatchingFirebaseOnboardingEmail } from "@/lib/auth/firebase-onboarding-flow.ts";
import type { FieldErrors } from "@/lib/auth/onboarding-payload.ts";
import { resolvePostLoginPath } from "@/lib/auth/role-routes.ts";
import {
  pendingSignupRole,
  signupDraft,
  type DraftRole,
  type SignupDraft,
} from "@/lib/auth/signup-draft.ts";
import { useAuthFlow } from "@/lib/auth/use-auth-flow.ts";
import { isValidEmail, MIN_PASSWORD_LENGTH } from "@/lib/auth/validation.ts";

export type StepContext = {
  values: SignupDraft;
  text: (name: string) => string;
  list: (name: string) => string[];
  setValue: (name: string, value: string | string[]) => void;
  blur: (name: string) => void;
  /** Translated error for a field, once it has been touched or the step attempted. */
  error: (name: string) => string | undefined;
  disabled: boolean;
};

export type WizardStep = {
  id: string;
  title: string;
  /** Field names the step owns (for touched tracking and focus). */
  fields: string[];
  /** Errors are dictionary keys. */
  validate: (values: SignupDraft) => FieldErrors;
  render: (ctx: StepContext) => ReactNode;
  /** Shown under the fields on the last step only. */
  footer?: ReactNode;
};

type Props = {
  role: DraftRole;
  title: string;
  lede: string;
  submitLabel: string;
  steps: WizardStep[];
};

const ACCOUNT_FIELDS = ["email", "password", "confirmation"];

/**
 * One short step at a time. The step lives in `?step=` so browser Back and
 * Forward move between steps while the typed values stay in component state
 * and (everything but the password) in sessionStorage.
 */
export function SignupWizard({ role, title, lede, submitLabel, steps: roleSteps }: Props) {
  const { t } = useLanguage();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { auth, account, router, next, nextQuery } = useAuthFlow();

  const wantsIdentity = searchParams.get("identity") === "1";
  // undefined: checking, null: no usable Firebase identity (reload or expired).
  const [identityEmail, setIdentityEmail] = useState<string | null | undefined>(wantsIdentity ? undefined : null);
  useEffect(() => {
    if (!wantsIdentity) return;
    setIdentityEmail(readMatchingFirebaseOnboardingEmail(auth.getCurrentFirebaseIdentityEmail()));
  }, [auth, wantsIdentity]);
  const identityMode = wantsIdentity && !!identityEmail;
  const identityLost = wantsIdentity && identityEmail === null;

  const [values, setValues] = useState<SignupDraft>({});
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [passwordAgain, setPasswordAgain] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    setValues(signupDraft.read(role));
    setReady(true);
  }, [role]);

  useEffect(() => {
    if (ready) signupDraft.save(role, values);
  }, [ready, role, values]);

  const accountStep: WizardStep = useMemo(
    () => ({
      id: "account",
      title: t("signup.step.account"),
      fields: ACCOUNT_FIELDS,
      validate: (v) => {
        const errors: FieldErrors = {};
        if (!isValidEmail(typeof v.email === "string" ? v.email : "")) errors.email = "signup.err.email";
        if (password.length < MIN_PASSWORD_LENGTH) errors.password = "signup.err.password";
        if (confirmation !== password) errors.confirmation = "signup.err.confirm";
        return errors;
      },
      render: () => null,
    }),
    [confirmation, password, t],
  );
  const steps = useMemo(() => (identityMode ? roleSteps : [accountStep, ...roleSteps]), [accountStep, identityMode, roleSteps]);

  const total = steps.length;
  const current = Math.min(Math.max(Number(searchParams.get("step")) || 1, 1), total);
  const step = steps[current - 1];
  const isLast = current === total;

  const goTo = useCallback(
    (n: number, mode: "push" | "replace" = "push") => {
      const params = new URLSearchParams(searchParams.toString());
      if (n <= 1) params.delete("step");
      else params.set("step", String(n));
      const query = params.toString();
      router[mode](`${pathname}${query ? `?${query}` : ""}`);
    },
    [pathname, router, searchParams],
  );

  // Never show a step whose earlier steps are incomplete (reload, deep link).
  useEffect(() => {
    if (!ready || wantsIdentity && identityEmail === undefined) return;
    for (let i = 0; i < current - 1; i++) {
      if (Object.keys(steps[i].validate(values)).length) {
        if (!identityMode && i === 0 && typeof values.email === "string" && values.email && !password) setPasswordAgain(true);
        goTo(i + 1, "replace");
        return;
      }
    }
    // Only when the step or readiness changes, not on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, ready, identityEmail]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [current]);

  const stepErrors = useMemo(() => (step ? step.validate(values) : {}), [step, values]);

  const text = (name: string) => (typeof values[name] === "string" ? (values[name] as string) : "");
  const list = (name: string) => (Array.isArray(values[name]) ? (values[name] as string[]) : []);
  const setValue = (name: string, value: string | string[]) => {
    setValues((current) => ({ ...current, [name]: value }));
    setServerErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  };
  const blur = (name: string) => setTouched((current) => new Set(current).add(name));
  const fieldError = (name: string): string | undefined => {
    const key = serverErrors[name] ?? (touched.has(name) ? stepErrors[name] : undefined);
    return key ? t(key) : undefined;
  };

  function focusFirstInvalid() {
    // Wait for the error attributes to render.
    setTimeout(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"], [data-invalid="true"]')?.focus(), 0);
  }

  function advance() {
    setFormError("");
    if (Object.keys(stepErrors).length) {
      setTouched((c) => new Set([...c, ...Object.keys(stepErrors)]));
      focusFirstInvalid();
      return;
    }
    goTo(current + 1);
  }

  async function submit() {
    setFormError("");
    for (let i = 0; i < steps.length; i++) {
      const found = Object.keys(steps[i].validate(values));
      if (found.length) {
        setTouched((c) => new Set([...c, ...found]));
        if (i + 1 !== current) goTo(i + 1);
        else focusFirstInvalid();
        return;
      }
    }
    setBusy(true);
    try {
      if (identityMode) {
        const done = await onboardFromDraft(role, values, auth, account);
        if (!done.ok) return;
        router.replace(resolvePostLoginPath(done.user.role, next));
        return;
      }
      await auth.signUpWithEmail({ email: text("email").trim(), password });
      pendingSignupRole.save(role);
      signupDraft.save(role, values);
      router.push(`/verify-email${nextQuery}`);
    } catch (error) {
      const key = authErrorKey(error);
      if (key === "authError.emailInUse" || key === "authError.invalidEmail" || key === "authError.weakPassword") {
        const field = key === "authError.weakPassword" ? "password" : "email";
        setServerErrors({ [field]: key });
        goTo(1);
        focusFirstInvalid();
      } else {
        setFormError(t(key));
      }
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    if (isLast) void submit();
    else advance();
  }

  const ctx: StepContext = { values, text, list, setValue, blur, error: fieldError, disabled: busy };

  if (identityLost) {
    return (
      <>
        <AuthHeading title={title} />
        <AuthMessage kind="info">
          {t("signup.identityExpired")} <Link className="af-inline-link" href="/login">{t("login.submit")}</Link>
        </AuthMessage>
      </>
    );
  }

  if (!ready || !step || (wantsIdentity && identityEmail === undefined)) {
    return <AuthHeading title={title} lede={lede} />;
  }

  const backHref = current === 1 ? `/signup${wantsIdentity ? `?continue=1${next ? `&next=${encodeURIComponent(next)}` : ""}` : nextQuery}` : null;

  return (
    <>
      <AuthHeading title={title} lede={lede} />
      {identityMode ? (
        <AuthMessage kind="info">{t("signup.signedInAs").replace("{email}", identityEmail ?? "")}</AuthMessage>
      ) : null}
      {passwordAgain && current === 1 ? <AuthMessage kind="info">{t("signup.reenterPassword")}</AuthMessage> : null}

      <nav className="af-progress" aria-label={t("signup.progress")}>
        <ol>
          {steps.map((item, index) => (
            <li
              key={item.id}
              className={index + 1 < current ? "is-done" : index + 1 === current ? "is-current" : undefined}
              aria-current={index + 1 === current ? "step" : undefined}
            >
              <span className="af-progress-bar" aria-hidden="true" />
              <span className="af-progress-label">{item.title}</span>
            </li>
          ))}
        </ol>
        <p className="af-step-count">
          {t("signup.stepOf").replace("{current}", String(current)).replace("{total}", String(total))}
        </p>
      </nav>

      <form ref={formRef} className="af-form" onSubmit={onSubmit} noValidate>
        <h2 className="af-step-title" ref={headingRef} tabIndex={-1}>{step.title}</h2>
        {formError ? <AuthMessage kind="error">{formError}</AuthMessage> : null}

        {step.id === "account" ? (
          <>
            <TextField
              id="signup-email"
              label={t("login.emailLabel")}
              type="email"
              autoComplete="email"
              inputMode="email"
              dir="ltr"
              value={text("email")}
              onChange={(e) => setValue("email", e.target.value)}
              onBlur={() => blur("email")}
              error={fieldError("email")}
              disabled={busy}
            />
            <PasswordField
              id="signup-password"
              label={t("login.password")}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => blur("password")}
              hint={t("signup.passwordHint")}
              error={fieldError("password")}
              disabled={busy}
            />
            <PasswordField
              id="signup-confirmation"
              label={t("signup.confirmPassword")}
              autoComplete="new-password"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              onBlur={() => blur("confirmation")}
              error={fieldError("confirmation")}
              disabled={busy}
            />
          </>
        ) : (
          step.render(ctx)
        )}

        {isLast ? step.footer : null}

        <div className="af-actions">
          {backHref ? (
            <Link className="af-button af-button--ghost" href={backHref}>
              <IcArrowLeft size={18} className="af-flip" /> {t("signup.back")}
            </Link>
          ) : (
            <button type="button" className="af-button af-button--ghost" onClick={() => goTo(current - 1)} disabled={busy}>
              <IcArrowLeft size={18} className="af-flip" /> {t("signup.back")}
            </button>
          )}
          <button type="submit" className="af-button af-button--primary" disabled={busy}>
            {isLast ? (busy ? t("signup.creating") : submitLabel) : <>{t("signup.next")} <IcArrowRight size={18} className="af-flip" /></>}
          </button>
        </div>
      </form>
    </>
  );
}
