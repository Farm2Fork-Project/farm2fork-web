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
  type RegisterBuyerRequest,
  toBuyerProduct,
} from "../api/contracts.ts";
import {
  type BuyerSession,
  webSession,
} from "../auth/web-session.ts";
import { RoleAuthRepository } from "../auth/role-auth-repository.ts";

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
  private readonly auth: RoleAuthRepository;

  constructor({
    client,
    session = webSession,
  }: {
    client: ApiRequester;
    session?: BuyerSessionStore;
  }) {
    this.client = client;
    this.session = session;
    this.auth = new RoleAuthRepository({ client, session });
  }

  async login(input: { email: string; password: string }): Promise<BuyerSession> {
    return toBuyerSession(await this.auth.login(input, "buyer"));
  }

  async registerBuyer(input: RegisterBuyerRequest): Promise<BuyerSession> {
    return toBuyerSession(await this.auth.registerBuyer(input));
  }

  async getCurrentBuyer(): Promise<BuyerSession["user"]> {
    return toBuyerUser(await this.auth.getCurrentUser("buyer"));
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

  listShipments(): Promise<ApiShipment[]> {
    return this.client.request<ApiShipment[]>("/shipments");
  }

  getPayment(id: string): Promise<ApiPayment> {
    return this.client.request<ApiPayment>(`/payments/${id}`);
  }
}

function toBuyerSession(session: { accessToken: string; user: ApiAuthUser }): BuyerSession {
  return { accessToken: session.accessToken, user: toBuyerUser(session.user) };
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
