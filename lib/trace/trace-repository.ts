import type { ApiRequestOptions } from "../api/client.ts";

type ApiRequester = {
  request<T>(path: string, options?: ApiRequestOptions): Promise<T>;
};

/** Mirrors the backend's public GET /trace/products/:id contract. */
export type TraceEventType =
  | "listed"
  | "payment_confirmed"
  | "shipment_assigned"
  | "shipment_picked_up"
  | "shipment_in_transit"
  | "shipment_delivered"
  | "shipment_failed";

export type TraceLedgerStatus = "pending" | "confirmed" | "failed";

export interface TraceLedger {
  status: TraceLedgerStatus;
  txHash?: string;
  blockNumber?: number;
  channelName?: string;
  confirmedAt?: string;
  /** Present when the backend re-read this event from the Fabric peer. */
  onChain?: "verified" | "mismatch" | "not_found";
}

export interface TraceEvent {
  id: string;
  type: TraceEventType;
  occurredAt: string;
  location?: string;
  reference?: string;
  ledger: TraceLedger;
}

export interface ProductTrace {
  product: {
    id: string;
    name: string;
    category: string;
    unit: string;
    qualityGrade?: "A" | "B" | "C";
    status: "active" | "inactive" | "sold_out";
    imageUrl?: string;
    listedAt: string;
  };
  farmer: { farmName: string; city?: string; province?: string } | null;
  events: TraceEvent[];
  summary: {
    totalEvents: number;
    confirmedEvents: number;
    originVerified: boolean;
    /** checked = confirmed events were re-read from Fabric just now. */
    ledgerCheck?: "checked" | "unavailable";
  };
}

const OBJECT_ID = /^[a-f0-9]{24}$/i;

export interface OrderTrace {
  order: {
    id: string;
    reference: string;
    status: string;
    paidAt: string;
    items: Array<{
      productId: string;
      productName: string;
      quantity: number;
      unit?: string;
    }>;
  };
  farmer: ProductTrace["farmer"];
  events: TraceEvent[];
  summary: ProductTrace["summary"];
}
export interface OrderQr {
  orderId: string;
  qrCode: string;
  qrImageDataUri: string;
}
export type TraceLink = { kind: "product" | "order"; id: string };

/** Only our exact trace routes and trusted origins are scan targets. */
export function parseTraceLink(
  input: string,
  options: { currentOrigin?: string; canonicalOrigin?: string } = {},
): TraceLink | null {
  const value = input.trim();
  if (OBJECT_ID.test(value))
    return { kind: "product", id: value.toLowerCase() };
  try {
    const url = new URL(value);
    if (url.username || url.password) return null;
    if (url.protocol === "farm2fork:") {
      if (url.hostname !== "app" || url.port) return null;
    } else {
      if (!["https:", "http:"].includes(url.protocol)) return null;
      const origins = [
        "https://farm2fork.com",
        options.canonicalOrigin ??
          process.env.NEXT_PUBLIC_SITE_URL ??
          "https://farm2fork.tech",
        options.currentOrigin ??
          (typeof window !== "undefined" ? window.location.origin : undefined),
      ];
      if (
        !origins.some((origin) => {
          try {
            return origin && new URL(origin).origin === url.origin;
          } catch {
            return false;
          }
        })
      )
        return null;
    }
    const match = /^\/trace\/(?:(orders|products)\/)?([a-f0-9]{24})\/?$/i.exec(
      url.pathname,
    );
    return match
      ? {
          kind: match[1] === "orders" ? "order" : "product",
          id: match[2].toLowerCase(),
        }
      : null;
  } catch {
    return null;
  }
}

export function parseTraceProductId(input: string): string | null {
  const target = parseTraceLink(input);
  return target?.kind === "product" ? target.id : null;
}

export class TraceRepository {
  private readonly client: ApiRequester;

  constructor({ client }: { client: ApiRequester }) {
    this.client = client;
  }

  getOrderTrace(id: string): Promise<OrderTrace> {
    return this.client.request<OrderTrace>(
      `/trace/orders/${encodeURIComponent(id)}`,
    );
  }
  getOrderQr(id: string): Promise<OrderQr> {
    return this.client.request<OrderQr>(`/orders/${encodeURIComponent(id)}/qr`);
  }

  getProductTrace(productId: string): Promise<ProductTrace> {
    return this.client.request<ProductTrace>(
      `/trace/products/${encodeURIComponent(productId)}`,
    );
  }
}

/** First/last characters of a Fabric tx id, readable but still checkable. */
export function shortenTxHash(txHash: string): string {
  return txHash.length <= 20
    ? txHash
    : `${txHash.slice(0, 10)}…${txHash.slice(-8)}`;
}
