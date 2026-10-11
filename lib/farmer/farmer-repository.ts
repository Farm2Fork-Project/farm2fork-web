import type { ApiRequestOptions } from "../api/client.ts";
import type {
  ApiOrder,
  ApiPage,
  ApiProduct,
  CreateFarmerProductRequest,
} from "../api/contracts.ts";

export type FarmLocation = {
  address?: string;
  city?: string;
  province?: string;
  lat?: number;
  lng?: number;
  complete: boolean;
};
export type FarmLocationInput = {
  address: string;
  city: string;
  province: string;
  lat: number;
  lng: number;
};

type ApiRequester = {
  request<T>(path: string, options?: ApiRequestOptions): Promise<T>;
};

export class FarmerRepository {
  private readonly client: ApiRequester;

  constructor({ client }: { client: ApiRequester }) {
    this.client = client;
  }

  getFarmLocation(): Promise<FarmLocation> {
    return this.client.request<FarmLocation>("/farmers/me/farm-location");
  }
  updateFarmLocation(input: FarmLocationInput): Promise<FarmLocation> {
    return this.client.request<FarmLocation>("/farmers/me/farm-location", {
      method: "PATCH",
      body: input,
    });
  }

  listMyProducts(): Promise<ApiPage<ApiProduct>> {
    return this.client.request<ApiPage<ApiProduct>>("/products/mine?limit=100");
  }

  listOrders(): Promise<ApiPage<ApiOrder>> {
    return this.client.request<ApiPage<ApiOrder>>("/orders?limit=20");
  }

  createProduct(input: CreateFarmerProductRequest): Promise<ApiProduct> {
    return this.client.request<ApiProduct>("/products", {
      method: "POST",
      body: input,
    });
  }
}
