import type { LoanStatus } from "@/lib/loans/loan-repository.ts";

export const money = (amount: number, language = "en") =>
  `${language === "ur" ? "روپے" : "Rs"} ${new Intl.NumberFormat(language === "ur" ? "ur-PK" : "en-PK", { maximumFractionDigits: 0 }).format(amount)}`;

export const shortDate = (iso: string, language = "en") => {
  const date = new Date(iso);
  return Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat(language === "ur" ? "ur-PK" : "en-PK", { dateStyle: "medium" }).format(date)
    : "—";
};

export const STATUS_LABEL: Record<LoanStatus, string> = {
  pending: "Submitted",
  under_review: "Under review",
  approved: "Approved",
  rejected: "Rejected",
  repaid: "Repaid",
};

export const STATUS_BADGE: Record<LoanStatus, string> = {
  pending: "badge-soft-yellow",
  under_review: "badge-soft-blue",
  approved: "badge-soft-green",
  rejected: "badge-soft-red",
  repaid: "badge-soft-green",
};
