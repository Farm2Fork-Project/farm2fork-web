import type { LoanStatus } from "@/lib/loans/loan-repository.ts";

const pkr = new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 });

export const money = (amount: number) => `Rs ${pkr.format(amount)}`;

export const shortDate = (iso: string) =>
  new Intl.DateTimeFormat("en-PK", { dateStyle: "medium" }).format(new Date(iso));

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
