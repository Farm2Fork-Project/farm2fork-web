import type { ApiRequestOptions } from "../api/client.ts";
import {
  ApiError,
  type ApiAuthResult,
  type ApiAuthUser,
  type RegisterBuyerRequest,
  type RegisterFarmerRequest,
  type RegisterTransporterRequest,
  type WebRole,
} from "../api/contracts.ts";
import { type WebSession, webSession } from "./web-session.ts";

type ApiRequester = {
  request<T>(path: string, options?: ApiRequestOptions): Promise<T>;
};

type SessionStore = Pick<typeof webSession, "clear" | "read" | "save">;

type Credentials = {
  email: string;
  password: string;
};

export class RoleAuthRepository {
  private readonly client: ApiRequester;
  private readonly session: SessionStore;

  constructor({
    client,
    session = webSession,
  }: {
    client: ApiRequester;
    session?: SessionStore;
  }) {
    this.client = client;
    this.session = session;
  }

  async login(input: Credentials, expectedRole: WebRole): Promise<WebSession> {
    return this.persistExpectedRole(
      await this.client.request<ApiAuthResult>("/auth/login", {
        method: "POST",
        body: input,
      }),
      expectedRole,
    );
  }

  async registerBuyer(input: RegisterBuyerRequest): Promise<WebSession> {
    return this.persistExpectedRole(
      await this.client.request<ApiAuthResult>("/auth/register/buyer", {
        method: "POST",
        body: input,
      }),
      "buyer",
    );
  }

  async registerFarmer(input: RegisterFarmerRequest): Promise<WebSession> {
    return this.persistExpectedRole(
      await this.client.request<ApiAuthResult>("/auth/register/farmer", {
        method: "POST",
        body: input,
      }),
      "farmer",
    );
  }

  async registerTransporter(input: RegisterTransporterRequest): Promise<WebSession> {
    return this.persistExpectedRole(
      await this.client.request<ApiAuthResult>("/auth/register/transporter", {
        method: "POST",
        body: input,
      }),
      "transporter",
    );
  }

  async getCurrentUser(expectedRole: WebRole): Promise<WebSession["user"]> {
    try {
      return this.toExpectedUser(
        await this.client.request<ApiAuthUser>("/auth/me"),
        expectedRole,
      );
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        this.session.clear();
      }
      throw error;
    }
  }

  private persistExpectedRole(
    result: ApiAuthResult,
    expectedRole: WebRole,
  ): WebSession {
    const session: WebSession = {
      accessToken: result.accessToken,
      user: this.toExpectedUser(result.user, expectedRole),
    };
    this.session.save(session);
    return session;
  }

  private toExpectedUser(
    user: ApiAuthUser,
    expectedRole: WebRole,
  ): WebSession["user"] {
    if (user.role !== expectedRole) {
      throw new ApiError(
        403,
        `This account cannot access the ${expectedRole} application.`,
      );
    }

    return {
      id: user.id,
      email: user.email,
      role: expectedRole,
      isVerified: user.isVerified,
      isActive: user.isActive,
    };
  }
}
