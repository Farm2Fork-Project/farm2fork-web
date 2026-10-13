"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { useLanguage } from "@/components/LanguageContext";

/**
 * A short confirmation without a modal: the button turns into
 * "Are you sure?  Cancel | Confirm" in place. Focus lands on Cancel (the safe
 * choice), Escape or Cancel puts it back on the trigger, and the swap is
 * announced politely.
 */
export function InlineConfirm({
  label,
  prompt,
  confirmLabel,
  onConfirm,
  busy = false,
  disabled = false,
  tone = "danger",
  triggerClassName = "btn btn-outline",
  icon,
  iconOnly = false,
}: {
  label: string;
  /** The question shown while confirming. */
  prompt: string;
  confirmLabel: string;
  onConfirm: () => void | Promise<void>;
  busy?: boolean;
  disabled?: boolean;
  tone?: "danger" | "primary";
  triggerClassName?: string;
  icon?: ReactNode;
  /** Show only the icon on the trigger; `label` becomes its accessible name. */
  iconOnly?: boolean;
}) {
  const { t } = useLanguage();
  const [asking, setAsking] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const wasAsking = useRef(false);

  useEffect(() => {
    if (asking) cancelRef.current?.focus();
    else if (wasAsking.current) triggerRef.current?.focus();
    wasAsking.current = asking;
  }, [asking]);

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      event.stopPropagation();
      setAsking(false);
    }
  }

  return (
    <span className="ic-confirm" aria-live="polite" onKeyDown={onKeyDown}>
      {asking ? (
        <span className="ic-confirm-row" role="group" aria-label={prompt}>
          <span className="ic-confirm-prompt">{prompt}</span>
          <button ref={cancelRef} type="button" className="btn btn-outline" onClick={() => setAsking(false)} disabled={busy}>
            {t("confirm.cancel")}
          </button>
          <button
            type="button"
            className={tone === "danger" ? "btn btn-danger-solid" : "btn btn-primary"}
            onClick={() => void onConfirm()}
            disabled={busy}
          >
            {confirmLabel}
          </button>
        </span>
      ) : (
        <button
          ref={triggerRef}
          type="button"
          className={triggerClassName}
          onClick={() => setAsking(true)}
          disabled={disabled || busy}
          aria-label={iconOnly ? label : undefined}
          title={iconOnly ? label : undefined}
        >
          {icon}
          {iconOnly ? null : label}
        </button>
      )}
    </span>
  );
}
