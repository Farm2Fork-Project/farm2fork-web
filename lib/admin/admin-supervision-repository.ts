import { ApiClient } from "@/lib/api/client";
import type { AdminPerson } from "./admin-content-repository";
import type { Page } from "./admin-repository";

export type RateListStatus = "draft" | "published" | "withdrawn";
export interface RateEntry {
  commodity: string;
  unit: string;
  minPrice: number;
  maxPrice: number;
  fairPrice?: number;
}
export interface RateListSummary {
  id: string;
  tradingDate: string;
  market: string;
  source: string;
  sourceUrl: string;
  status: RateListStatus;
  entryCount: number;
  fileName?: string;
  publishedAt?: string;
  createdAt: string;
}
export interface RateListDetail extends RateListSummary {
  entries: RateEntry[];
  /** Short-lived link to the scanned original, when one was attached. */
  documentUrl?: string;
}
export interface RateListPage {
  data: RateListSummary[];
  total: number;
  page: number;
  limit: number;
}
export interface RateListUpload {
  file: File;
  document?: File;
  tradingDate: string;
  market: string;
  source: string;
  sourceUrl: string;
}

export type ReportTarget = "post" | "comment" | "review";
export type ReportStatus = "open" | "actioned" | "dismissed";
export interface ReportGroup {
  targetType: ReportTarget;
  targetId: string;
  reportCount: number;
  reasons: string[];
  notes: string[];
  latestAt: string;
  content: {
    title?: string;
    text: string;
    author?: AdminPerson | string;
    postId?: string;
    hidden: boolean;
  } | null;
}
export interface AdminReview {
  id: string;
  orderId: string;
  buyerId?: AdminPerson | string;
  farmerId?: AdminPerson | string;
  productNames: string[];
  rating: number;
  comment?: string;
  farmerReply?: string;
  status: "published" | "removed";
  createdAt: string;
}

const query = (values: Record<string, string | number | undefined>) => {
  const p = new URLSearchParams();
  for (const [key, value] of Object.entries(values))
    if (value !== undefined && value !== "") p.set(key, String(value));
  return p.toString();
};

/** Admin supervision: rate lists, member reports and buyer reviews. */
export class AdminSupervisionRepository {
  constructor(
    private readonly client: Pick<ApiClient, "request"> = new ApiClient(),
  ) {}

  rateLists(q: { status?: string; page: number }) {
    return this.client.request<RateListPage>(`/admin/rate-lists?${query(q)}`);
  }
  rateList(id: string) {
    return this.client.request<RateListDetail>(
      `/admin/rate-lists/${encodeURIComponent(id)}`,
    );
  }
  uploadRateList(upload: RateListUpload) {
    const body = new FormData();
    body.set("file", upload.file);
    if (upload.document) body.set("document", upload.document);
    body.set("tradingDate", upload.tradingDate);
    body.set("market", upload.market);
    body.set("source", upload.source);
    body.set("sourceUrl", upload.sourceUrl);
    return this.client.request<RateListDetail>("/admin/rate-lists", {
      method: "POST",
      body,
    });
  }
  setRateListStatus(
    id: string,
    status: "published" | "withdrawn",
    reason: string,
  ) {
    return this.client.request<RateListDetail>(
      `/admin/rate-lists/${encodeURIComponent(id)}/status`,
      { method: "PATCH", body: { status, reason } },
    );
  }

  reports(q: { status?: string; page: number }) {
    return this.client.request<Page<ReportGroup>>(
      `/admin/community/reports?${query(q)}`,
    );
  }
  resolveReports(
    targetType: ReportTarget,
    targetId: string,
    action: "hide" | "dismiss",
    reason: string,
  ) {
    return this.client.request<{ resolved: number }>(
      `/admin/community/reports/${targetType}/${encodeURIComponent(targetId)}`,
      { method: "PATCH", body: { action, reason } },
    );
  }

  reviews(q: { status?: string; search?: string; page: number }) {
    return this.client.request<Page<AdminReview>>(`/admin/reviews?${query(q)}`);
  }
  reviewVisibility(id: string, hidden: boolean, reason: string) {
    return this.client.request<{ id: string; hidden: boolean }>(
      `/admin/reviews/${encodeURIComponent(id)}/visibility`,
      { method: "PATCH", body: { hidden, reason } },
    );
  }
}
export const adminSupervisionRepository = new AdminSupervisionRepository();
