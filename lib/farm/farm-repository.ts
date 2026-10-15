import type { ApiRequestOptions } from "../api/client.ts";

type ApiRequester = {
  request<T>(path: string, options?: ApiRequestOptions): Promise<T>;
};

/** Mirrors the backend's public GET /farmers/:id/public contract. */
export interface FarmCertification {
  name: string;
  issuedBy?: string;
  issuedDate?: string;
  expiryDate?: string;
  expired: boolean;
}

export interface FarmProfile {
  farmerId: string;
  farmName: string;
  ownerName?: string;
  avatarUrl?: string;
  city?: string;
  province?: string;
  cropTypes: string[];
  landSizeAcres?: number;
  certifications: FarmCertification[];
  memberSince: string;
  stats: { activeListings: number; completedOrders: number };
}

export class FarmRepository {
  private readonly client: ApiRequester;

  constructor({ client }: { client: ApiRequester }) {
    this.client = client;
  }

  getFarmProfile(farmerId: string): Promise<FarmProfile> {
    return this.client.request<FarmProfile>(
      `/farmers/${encodeURIComponent(farmerId)}/public`,
    );
  }
}
