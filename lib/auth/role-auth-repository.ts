import type { ApiRequestOptions } from "../api/client.ts";
import {
  ApiError,
  type ApiAuthUser,
  type WebRole,
} from "../api/contracts.ts";
import { type WebSession, webSession } from "./web-session.ts";

type ApiRequester = {
  request<T>(path: string, options?: ApiRequestOptions): Promise<T>;
};

type SessionStore = Pick<typeof webSession, "clear" | "read" | "save">;

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

  async getCurrentUser<Role extends WebRole>(
    expectedRole: Role,
  ): Promise<WebSession["user"] & { role: Role }> {
    try {
      const user = this.toExpectedUser(
        await this.client.request<ApiAuthUser>("/auth/me"),
        expectedRole,
      );
      this.session.save({ user });
      return user;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        this.session.clear();
      }
      throw error;
    }
  }

  private toExpectedUser<Role extends WebRole>(
    user: ApiAuthUser,
    expectedRole: Role,
  ): WebSession["user"] & { role: Role } {
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
