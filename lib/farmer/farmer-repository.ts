import type { ApiRequestOptions } from "../api/client.ts";
import type {
  AiStatus,
  ApiOrder,
  ApiPage,
  ApiProduct,
  CreateFarmerProductRequest,
  GradableCrop,
  PriceSuggestion,
  PriceSuggestionRequest,
  QualityCheckResult,
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

  /** Soft delete: the listing becomes inactive (history and trace are kept). */
  deleteProduct(id: string): Promise<{ id: string; deleted: boolean }> {
    return this.client.request<{ id: string; deleted: boolean }>(
      `/products/${encodeURIComponent(id)}`,
      { method: "DELETE" },
    );
  }

  updateProductStatus(
    id: string,
    status: "active" | "inactive",
  ): Promise<ApiProduct> {
    return this.client.request<ApiProduct>(
      `/products/${encodeURIComponent(id)}`,
      { method: "PATCH", body: { status } },
    );
  }

  aiStatus(): Promise<AiStatus> {
    return this.client.request<AiStatus>("/ai/status");
  }

  suggestPrice(input: PriceSuggestionRequest): Promise<PriceSuggestion> {
    return this.client.request<PriceSuggestion>("/ai/price", {
      method: "POST",
      body: input,
    });
  }

  checkQuality(photo: File, crop: GradableCrop): Promise<QualityCheckResult> {
    const form = new FormData();
    form.append("crop", crop);
    form.append("image", photo);
    return this.client.request<QualityCheckResult>("/ai/quality", {
      method: "POST",
      body: form,
    });
  }
}
