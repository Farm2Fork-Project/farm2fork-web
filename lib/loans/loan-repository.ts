import { ApiClient } from "../api/client.ts";

export type LoanStatus =
  | "pending"
  | "under_review"
  | "approved"
  | "rejected"
  | "repaid";

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

export interface LoanLimits {
  minAmount: number;
  maxAmount: number;
  maxDurationMonths: number;
  maxDocuments: number;
}

/** Role-scoped loan API. */
export class LoanRepository {
  private readonly client: Pick<ApiClient, "request">;

  constructor({ client }: { client?: Pick<ApiClient, "request"> } = {}) {
    this.client = client ?? new ApiClient();
  }

  limits(): Promise<LoanLimits> {
    return this.client.request<LoanLimits>("/loans/limits");
  }

  async listAll(): Promise<LoanApplication[]> {
    const result: LoanApplication[] = [];
    let page = 1;
    let total = 0;
    do {
      const response = await this.list(undefined, page++);
      result.push(...response.data);
      total = response.total;
      if (!response.data.length) break;
    } while (result.length < total);
    return result;
  }

  apply(input: {
    amount: number;
    purpose: string;
    durationMonths: number;
    documents: File[];
  }): Promise<LoanApplication> {
    const form = new FormData();
    form.set("amount", String(input.amount));
    form.set("purpose", input.purpose);
    form.set("durationMonths", String(input.durationMonths));
    input.documents.forEach((file) => form.append("documents", file));
    return this.client.request<LoanApplication>("/loans", {
      method: "POST",
      body: form,
    });
  }

  list(status?: LoanStatus, page?: number): Promise<LoanPage> {
    const query = new URLSearchParams({ limit: "50" });
    if (status) query.set("status", status);
    if (page) query.set("page", String(page));
    return this.client.request<LoanPage>(`/loans?${query.toString()}`);
  }

  get(id: string): Promise<LoanApplication> {
    return this.client.request<LoanApplication>(
      `/loans/${encodeURIComponent(id)}`,
    );
  }

  startReview(id: string): Promise<LoanApplication> {
    return this.client.request<LoanApplication>(
      `/loans/${encodeURIComponent(id)}/review`,
      {
        method: "POST",
      },
    );
  }

  decide(
    id: string,
    decision: "approved" | "rejected",
    note?: string,
  ): Promise<LoanApplication> {
    return this.client.request<LoanApplication>(
      `/loans/${encodeURIComponent(id)}/decision`,
      {
        method: "POST",
        body: { decision, ...(note ? { note } : {}) },
      },
    );
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
