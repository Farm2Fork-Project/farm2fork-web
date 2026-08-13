import type { ApiRequestOptions } from "../api/client.ts";
import {
  ApiError,
  type ApiAuthUser,
  type ApiOrder,
  type ApiPage,
  type ApiPayment,
  type ApiProduct,
  type ApiShipment,
  type BuyerProduct,
  type CreateOrderRequest,
  type InitiatePaymentResponse,
  type PaymentGateway,
  toBuyerProduct,
} from "../api/contracts.ts";
import type { BuyerSession } from "../auth/web-session.ts";

type ApiRequester = {
  request<T>(path: string, options?: ApiRequestOptions): Promise<T>;
};

export type ProductQuery = {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  qualityGrade?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export type PaginationQuery = {
  page?: number;
  limit?: number;
};

export type PaymentQuery = PaginationQuery & {
  status?: string;
  gateway?: PaymentGateway;
};

export class BuyerRepository {
  private readonly client: ApiRequester;

  constructor({ client }: { client: ApiRequester }) {
    this.client = client;
  }

  async getCurrentBuyer(): Promise<BuyerSession["user"]> {
    const user = await this.client.request<ApiAuthUser>("/auth/me");
    if (user.role !== "buyer") {
      throw new ApiError(403, "This account cannot access the buyer application.");
    }
    return user as BuyerSession["user"];
  }

  async listProducts(query: ProductQuery = {}): Promise<ApiPage<BuyerProduct>> {
    const response = await this.client.request<ApiPage<ApiProduct>>(
      withQuery("/products", query),
    );
    return { ...response, data: response.data.map(toBuyerProduct) };
  }

  async getProduct(id: string): Promise<BuyerProduct> {
    return toBuyerProduct(
      await this.client.request<ApiProduct>(`/products/${id}`),
    );
  }

  createOrder(input: CreateOrderRequest): Promise<ApiOrder> {
    return this.client.request<ApiOrder>("/orders", {
      method: "POST",
      body: input,
    });
  }

  listOrders(query: PaginationQuery = {}): Promise<ApiPage<ApiOrder>> {
    return this.client.request<ApiPage<ApiOrder>>(withQuery("/orders", query));
  }

  async initiatePayment(
    orderId: string,
    gateway: PaymentGateway,
  ): Promise<ApiPayment> {
    const response = await this.client.request<InitiatePaymentResponse>(
      "/payments",
      {
        method: "POST",
        body: { orderId, gateway },
      },
    );
    return response.payment;
  }

  listPayments(query: PaymentQuery = {}): Promise<ApiPage<ApiPayment>> {
    return this.client.request<ApiPage<ApiPayment>>(
      withQuery("/payments", query),
    );
  }

  listShipments(): Promise<ApiShipment[]> {
    return this.client.request<ApiShipment[]>("/shipments");
  }

  getPayment(id: string): Promise<ApiPayment> {
    return this.client.request<ApiPayment>(`/payments/${id}`);
  }
}

function withQuery(
  path: string,
  query: Record<string, string | number | undefined>,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) params.set(key, String(value));
  }

  const search = params.toString();
  return search ? `${path}?${search}` : path;
}
