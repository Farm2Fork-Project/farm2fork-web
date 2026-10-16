import { ApiClient } from "@/lib/api/client";
import type {
  ShipmentStatus,
  ApiShipmentStatusHistory,
} from "@/lib/api/contracts";
import type { Page } from "./admin-repository";
export interface AdminPerson {
  _id: string;
  fullName?: string;
  email?: string;
  role?: string;
}
export interface AdminProduct {
  id: string;
  name: string;
  category: string;
  description?: string;
  farmerId?: AdminPerson | string;
  price: number;
  quantity: number;
  unit: string;
  qualityGrade?: string;
  images?: string[];
  status: string;
  adminHidden?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
export interface AdminComment {
  id: string;
  authorId?: AdminPerson | string;
  content: string;
  status: string;
  createdAt: string;
}
export interface AdminPost {
  id: string;
  title: string;
  content: string;
  authorId?: AdminPerson | string;
  tags: string[];
  status: string;
  commentCount: number;
  images?: string[];
  comments?: AdminComment[];
  commentsLimit?: number;
  createdAt: string;
}
export interface AdminOrder {
  id: string;
  buyerId?: AdminPerson | string;
  farmerId?: AdminPerson | string;
  status: string;
  totalAmount: number;
  platformFeePercent: number;
  platformFeeAmount: number;
  deliveryFee: number;
  grandTotal: number;
  items: {
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }[];
  shippingAddress?: { street?: string; city?: string; province?: string };
  paymentId?:
    | string
    | {
        _id: string;
        status: string;
        amount: number;
        gateway: string;
        paidAt?: string;
        refundedAt?: string;
      };
  shipmentId?:
    | string
    | {
        _id: string;
        status: ShipmentStatus;
        transporterId?: AdminPerson | string;
        actualDelivery?: string;
        statusHistory: ApiShipmentStatusHistory[];
        assignmentHistory?: {
          fromTransporterId?: string;
          transporterId: string;
          assignedBy: string;
          reason: string;
          timestamp: string;
        }[];
        issue?: {
          reason: string;
          note?: string;
          stage: string;
          reportedAt: string;
          resolvedAt?: string;
          resolution?: string;
        };
      };
  createdAt: string;
}
export interface ExternalRefundEvidence { id: string; orderId: string; amount: number; reference: string; paidAt: string; createdAt: string; recordedBy: string }
export interface ContentQuery {
  deliveryIssue?: 'unresolved' | 'resolved' | 'active';
  assignment?: 'assigned' | 'unassigned';
  page: number;
  search?: string;
  status?: string;
  visibility?: string;
}
function params(query: ContentQuery) {
  const p = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== "") p.set(k, String(v));
  });
  return p;
}
export class AdminContentRepository {
  constructor(
    private readonly client: Pick<ApiClient, "request"> = new ApiClient(),
  ) {}
  products(query: ContentQuery) {
    return this.client.request<Page<AdminProduct>>(
      `/admin/products?${params(query)}`,
    );
  }
  product(id: string) {
    return this.client.request<AdminProduct>(
      `/admin/products/${encodeURIComponent(id)}`,
    );
  }
  orders(query: ContentQuery) {
    return this.client.request<Page<AdminOrder>>(
      `/admin/orders?${params(query)}`,
    );
  }
  order(id: string) {
    return this.client.request<AdminOrder>(
      `/admin/orders/${encodeURIComponent(id)}`,
    );
  }
  posts(query: ContentQuery) {
    return this.client.request<Page<AdminPost>>(
      `/admin/community/posts?${params(query)}`,
    );
  }
  post(id: string) {
    return this.client.request<AdminPost>(
      `/admin/community/posts/${encodeURIComponent(id)}`,
    );
  }
  visibility(
    kind: "products" | "community/posts" | "community/comments",
    id: string,
    hidden: boolean,
    reason: string,
  ) {
    return this.client.request<{ id: string; hidden: boolean }>(
      `/admin/${kind}/${encodeURIComponent(id)}/visibility`,
      { method: "PATCH", body: { hidden, reason } },
    );
  }
  refund(id: string) { return this.client.request<ExternalRefundEvidence | null>(`/delivery/admin/orders/${encodeURIComponent(id)}/refund`); }
  recordRefund(
    id: string,
    body: {
      amount: number;
      reference: string;
      paidAt: string;
      reason: string;
      requestId: string;
    },
  ) {
    return this.client.request<{
      id: string;
      reference: string;
      paidAt: string;
      amount: number;
    }>(`/delivery/admin/orders/${encodeURIComponent(id)}/refund`, {
      method: "POST",
      body,
    });
  }
}
export const adminContentRepository = new AdminContentRepository();
