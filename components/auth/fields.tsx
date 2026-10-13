"use client";

import { useId, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react";
import { useLanguage } from "@/components/LanguageContext";
import { IcCheck, IcEye, IcEyeOff } from "@/components/icons";

type FrameProps = {
  id: string;
  label: string;
  hint?: ReactNode;
  /** Already translated. */
  error?: string;
  optional?: boolean;
  children: (aria: { id: string; "aria-describedby"?: string; "aria-invalid"?: true }) => ReactNode;
};

/** Label, control, hint and inline error wired together with aria-describedby. */
export function FieldFrame({ id, label, hint, error, optional, children }: FrameProps) {
  const { t } = useLanguage();
  const hintId = hint && !error ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={`af-field${error ? " af-field--invalid" : ""}`}>
      <label htmlFor={id}>
        {label}
        {optional ? <span className="af-optional"> {t("auth.optional")}</span> : null}
      </label>
      {children({ id, "aria-describedby": describedBy, "aria-invalid": error ? true : undefined })}
      {hint && !error ? <p className="af-hint" id={hintId}>{hint}</p> : null}
      {error ? <p className="af-error" id={errorId}>{error}</p> : null}
    </div>
  );
}

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
};

export function TextField({ id, label, hint, error, optional, className, ...input }: TextFieldProps) {
  return (
    <FieldFrame id={id} label={label} hint={hint} error={error} optional={optional}>
      {(aria) => <input {...aria} {...input} className={`af-input${className ? ` ${className}` : ""}`} />}
    </FieldFrame>
  );
}

type PasswordFieldProps = Omit<TextFieldProps, "type">;

export function PasswordField({ id, label, hint, error, optional, ...input }: PasswordFieldProps) {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);
  return (
    <FieldFrame id={id} label={label} hint={hint} error={error} optional={optional}>
      {(aria) => (
        <div className="af-input-wrap">
          <input {...aria} {...input} className="af-input af-input--with-action" type={visible ? "text" : "password"} />
          <button
            type="button"
            className="af-input-action"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? t("auth.hidePassword") : t("auth.showPassword")}
            aria-pressed={visible}
          >
            {visible ? <IcEye size={20} /> : <IcEyeOff size={20} />}
          </button>
        </div>
      )}
    </FieldFrame>
  );
}

type SelectFieldProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "id"> & {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
  children: ReactNode;
};

export function SelectField({ id, label, hint, error, optional, children, ...select }: SelectFieldProps) {
  return (
    <FieldFrame id={id} label={label} hint={hint} error={error} optional={optional}>
      {(aria) => (
        <select {...aria} {...select} className="af-input af-select">
          {children}
        </select>
      )}
    </FieldFrame>
  );
}

type ChoiceOption = { value: string; label: string };

/** A group of mutually exclusive pills (native radios, so arrow keys work). */
export function ChoiceGroup({
  legend,
  name,
  options,
  value,
  onChange,
  error,
  disabled,
}: {
  legend: string;
  name: string;
  options: ChoiceOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}) {
  const uid = useId();
  const errorId = error ? `${uid}-error` : undefined;
  return (
    <fieldset className="af-choice" aria-describedby={errorId} data-invalid={error ? "true" : undefined} tabIndex={-1}>
      <legend>{legend}</legend>
      <div className="af-chips">
        {options.map((option) => (
          <label key={option.value} className="af-chip">
            <input
              type="radio"
              name={`${uid}-${name}`}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              disabled={disabled}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
      {error ? <p className="af-error" id={errorId}>{error}</p> : null}
    </fieldset>
  );
}

/** A group of independent pills (native checkboxes). */
export function MultiChoiceGroup({
  legend,
  hint,
  options,
  values,
  onToggle,
  disabled,
}: {
  legend: string;
  hint?: string;
  options: ChoiceOption[];
  values: string[];
  onToggle: (value: string) => void;
  disabled?: boolean;
}) {
  const uid = useId();
  return (
    <fieldset className="af-choice" aria-describedby={hint ? `${uid}-hint` : undefined}>
      <legend>{legend}</legend>
      <div className="af-chips">
        {options.map((option) => {
          const checked = values.includes(option.value);
          return (
            <label key={option.value} className="af-chip">
              <input type="checkbox" checked={checked} onChange={() => onToggle(option.value)} disabled={disabled} />
              <span>
                {checked ? <IcCheck size={16} /> : null}
                {option.label}
              </span>
            </label>
          );
        })}
      </div>
      {hint ? <p className="af-hint" id={`${uid}-hint`}>{hint}</p> : null}
    </fieldset>
  );
}
