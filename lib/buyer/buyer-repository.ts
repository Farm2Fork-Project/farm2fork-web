import type { ApiRequestOptions } from "../api/client.ts";
import {
  ApiError,
  type ApiAuthResult,
  type ApiAuthUser,
  type ApiOrder,
  type ApiPage,
  type ApiPayment,
  type ApiProduct,
  type BuyerProduct,
  type CreateOrderRequest,
  type InitiatePaymentResponse,
  type PaymentGateway,
  type RegisterBuyerRequest,
  toBuyerProduct,
} from "../api/contracts.ts";
import {
  type BuyerSession,
  webSession,
} from "../auth/web-session.ts";

type ApiRequester = {
  request<T>(path: string, options?: ApiRequestOptions): Promise<T>;
};

type BuyerSessionStore = Pick<typeof webSession, "clear" | "read" | "save">;

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
  private readonly session: BuyerSessionStore;

  constructor({
    client,
    session = webSession,
  }: {
    client: ApiRequester;
    session?: BuyerSessionStore;
  }) {
    this.client = client;
    this.session = session;
  }

  async login(input: { email: string; password: string }): Promise<BuyerSession> {
    const result = await this.client.request<ApiAuthResult>("/auth/login", {
      method: "POST",
      body: input,
    });
    const session = toBuyerSession(result);
    this.session.save(session);
    return session;
  }

  async registerBuyer(input: RegisterBuyerRequest): Promise<BuyerSession> {
    const result = await this.client.request<ApiAuthResult>("/auth/register/buyer", {
      method: "POST",
      body: input,
    });
    const session = toBuyerSession(result);
    this.session.save(session);
    return session;
  }

  async getCurrentBuyer(): Promise<BuyerSession["user"]> {
    return toBuyerUser(await this.client.request<ApiAuthUser>("/auth/me"));
  }

  async listProducts(query: ProductQuery = {}): Promise<ApiPage<BuyerProduct>> {
    const response = await this.client.request<ApiPage<ApiProduct>>(
      withQuery("/products", query),
    );
    return { ...response, data: response.data.map(toBuyerProduct) };
  }

  async getProduct(id: string): Promise<BuyerProduct> {
    return toBuyerProduct(await this.client.request<ApiProduct>(`/products/${id}`));
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
    const response = await this.client.request<InitiatePaymentResponse>("/payments", {
      method: "POST",
      body: { orderId, gateway },
    });
    return response.payment;
  }

  listPayments(query: PaymentQuery = {}): Promise<ApiPage<ApiPayment>> {
    return this.client.request<ApiPage<ApiPayment>>(withQuery("/payments", query));
  }

  getPayment(id: string): Promise<ApiPayment> {
    return this.client.request<ApiPayment>(`/payments/${id}`);
  }
}

function toBuyerSession(result: ApiAuthResult): BuyerSession {
  return {
    accessToken: result.accessToken,
    user: toBuyerUser(result.user),
  };
}

function toBuyerUser(user: ApiAuthUser): BuyerSession["user"] {
  if (user.role !== "buyer") {
    throw new ApiError(403, "This account cannot access the buyer application.");
  }

  return {
    id: user.id,
    email: user.email,
    role: "buyer",
    isVerified: user.isVerified,
    isActive: user.isActive,
  };
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
