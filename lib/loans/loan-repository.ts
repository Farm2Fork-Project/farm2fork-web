import { ApiClient } from "../api/client.ts";

export type LoanStatus = "pending" | "under_review" | "approved" | "rejected" | "repaid";

export const LOAN_STATUSES: LoanStatus[] = [
  "pending",
  "under_review",
  "approved",
  "rejected",
  "repaid",
];

export interface LoanInstalment {
  index: number;
  dueDate: string;
  amount: number;
  isPaid: boolean;
  paidAt?: string;
}

/** Farm summary for reviewers; no CNIC or bank details are ever included. */
export interface LoanApplicant {
  farmName: string;
  city?: string;
  province?: string;
  landSizeAcres?: number;
  cropTypes: string[];
  deliveredOrders: number;
  deliveredRevenue: number;
}

export interface LoanApplication {
  id: string;
  applicantId: string;
  amount: number;
  purpose: string;
  durationMonths: number;
  status: LoanStatus;
  reviewNote?: string;
  documentCount: number;
  repaymentSchedule: LoanInstalment[];
  applicant?: LoanApplicant;
  /** Short-lived signed links (single-application read only). */
  documents?: { index: number; url: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface LoanPage {
  data: LoanApplication[];
  total: number;
  page: number;
  limit: number;
}

/** Financial-partner side of /loans. */
export class LoanRepository {
  private readonly client: Pick<ApiClient, "request">;

  constructor({ client }: { client?: Pick<ApiClient, "request"> } = {}) {
    this.client = client ?? new ApiClient();
  }

  list(status?: LoanStatus): Promise<LoanPage> {
    const query = new URLSearchParams({ limit: "50" });
    if (status) query.set("status", status);
    return this.client.request<LoanPage>(`/loans?${query.toString()}`);
  }

  get(id: string): Promise<LoanApplication> {
    return this.client.request<LoanApplication>(`/loans/${encodeURIComponent(id)}`);
  }

  startReview(id: string): Promise<LoanApplication> {
    return this.client.request<LoanApplication>(`/loans/${encodeURIComponent(id)}/review`, {
      method: "POST",
    });
  }

  decide(
    id: string,
    decision: "approved" | "rejected",
    note?: string,
  ): Promise<LoanApplication> {
    return this.client.request<LoanApplication>(`/loans/${encodeURIComponent(id)}/decision`, {
      method: "POST",
      body: { decision, ...(note ? { note } : {}) },
    });
  }

  markInstalmentPaid(id: string, index: number): Promise<LoanApplication> {
    return this.client.request<LoanApplication>(
      `/loans/${encodeURIComponent(id)}/instalments/${index}/paid`,
      { method: "POST" },
    );
  }
}

/** Relative (local-dev) document links resolve against the API origin. */
export function resolveApiUrl(url: string): string {
  if (!url.startsWith("/")) return url;
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  try {
    return new URL(url, base).toString();
  } catch {
    return url;
  }
}
