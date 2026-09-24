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

/**
 * Accepts what a person can actually paste or scan: a bare product id, or a
 * full QR trace URL (`https://…/trace/<id>`, with or without a trailing slash
 * or query string). Returns null when the input can't be a product id, so the
 * UI can say so without a pointless network round trip.
 */
export function parseTraceProductId(input: string): string | null {
  const value = input.trim();
  if (!value) return null;
  if (OBJECT_ID.test(value)) return value.toLowerCase();

  const candidate = value
    .split(/[?#]/)[0]
    .replace(/\/+$/, "")
    .split("/")
    .pop();
  return candidate && OBJECT_ID.test(candidate) ? candidate.toLowerCase() : null;
}

export class TraceRepository {
  private readonly client: ApiRequester;

  constructor({ client }: { client: ApiRequester }) {
    this.client = client;
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
