/** Pakistani CNIC: 13 digits, optionally written 12345-1234567-1. */
export function cnicDigits(input: string): string {
  return input.replace(/\D/g, "").slice(0, 13);
}

export function isValidCnic(input: string): boolean {
  return /^\d{13}$/.test(input.replace(/[\s-]/g, ""));
}

/** Formats as the user types: 35202-1234567-1. */
export function formatCnic(input: string): string {
  const d = cnicDigits(input);
  if (d.length <= 5) return d;
  if (d.length <= 12) return `${d.slice(0, 5)}-${d.slice(5)}`;
  return `${d.slice(0, 5)}-${d.slice(5, 12)}-${d.slice(12)}`;
}

/**
 * Normalises a Pakistani phone number to E.164 (+923001234567). Accepts
 * 0300 1234567, 0092 300 1234567, 92300…, 300… and +92-300-1234567.
 * Returns null when it cannot be a Pakistani number.
 */
export function normalizePkPhone(input: string): string | null {
  let digits = input.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  else if (digits.startsWith("00")) digits = digits.slice(2);
  digits = digits.replace(/\D/g, "");
  if (digits.startsWith("92")) digits = digits.slice(2);
  else if (digits.startsWith("0")) digits = digits.slice(1);
  // Mobile numbers are 3xx xxxxxxx (10 digits); landlines are 2-3 digit area codes + number.
  if (!/^[1-9]\d{9}$/.test(digits)) return null;
  return `+92${digits}`;
}

export function isValidPhone(input: string): boolean {
  return normalizePkPhone(input) !== null;
}

export function isValidEmail(input: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.trim());
}

export const MIN_PASSWORD_LENGTH = 8;

/** Display form of a stored E.164 number: +92 300 1234567. */
export function displayPhone(e164: string | undefined): string {
  if (!e164) return "";
  const m = /^\+92(\d{3})(\d{7})$/.exec(e164);
  return m ? `+92 ${m[1]} ${m[2]}` : e164;
}
