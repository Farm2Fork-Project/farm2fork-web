import type { ApiRequestOptions } from "../api/client.ts";
import type {
  ApiOrder,
  ApiPage,
  ApiProduct,
  CreateFarmerProductRequest,
} from "../api/contracts.ts";

type ApiRequester = {
  request<T>(path: string, options?: ApiRequestOptions): Promise<T>;
};

export class FarmerRepository {
  private readonly client: ApiRequester;

  constructor({ client }: { client: ApiRequester }) {
    this.client = client;
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
