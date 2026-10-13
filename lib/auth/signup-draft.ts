/**
 * Sign-up drafts live in sessionStorage so Back/Forward and an accidental
 * reload do not lose what was typed. The password is never stored: callers
 * pass only the fields they want kept.
 */
const PREFIX = "farm2fork.signup-draft.v1.";

export type DraftRole = "buyer" | "farmer";
export type SignupDraft = Record<string, string | string[]>;

const FORBIDDEN = new Set(["password", "confirmation", "confirmPassword"]);

function storage(): Storage | null {
  try {
    return typeof sessionStorage === "undefined" ? null : sessionStorage;
  } catch {
    return null;
  }
}

export const signupDraft = {
  read(role: DraftRole): SignupDraft {
    try {
      const raw = storage()?.getItem(PREFIX + role);
      if (!raw) return {};
      const value: unknown = JSON.parse(raw);
      if (!value || typeof value !== "object" || Array.isArray(value)) return {};
      const out: SignupDraft = {};
      for (const [key, v] of Object.entries(value)) {
        if (FORBIDDEN.has(key)) continue;
        if (typeof v === "string" || (Array.isArray(v) && v.every((x) => typeof x === "string"))) {
          out[key] = v as string | string[];
        }
      }
      return out;
    } catch {
      return {};
    }
  },

  save(role: DraftRole, values: SignupDraft): void {
    const safe: SignupDraft = {};
    for (const [key, v] of Object.entries(values)) if (!FORBIDDEN.has(key)) safe[key] = v;
    try {
      storage()?.setItem(PREFIX + role, JSON.stringify(safe));
    } catch {
      // Private mode or a full quota: the form still works, it just cannot be restored.
    }
  },

  clear(role: DraftRole): void {
    try {
      storage()?.removeItem(PREFIX + role);
    } catch {
      // Nothing to clear.
    }
  },
};

const ROLE_KEY = "farm2fork.signup-role.v1";

/** Which role's draft to finish once the email is verified (or the page reloaded). */
export const pendingSignupRole = {
  read(): DraftRole | null {
    try {
      const value = storage()?.getItem(ROLE_KEY);
      return value === "buyer" || value === "farmer" ? value : null;
    } catch {
      return null;
    }
  },
  save(role: DraftRole): void {
    try {
      storage()?.setItem(ROLE_KEY, role);
    } catch {
      // See signupDraft.save.
    }
  },
  clear(): void {
    try {
      storage()?.removeItem(ROLE_KEY);
    } catch {
      // Nothing to clear.
    }
  },
};
