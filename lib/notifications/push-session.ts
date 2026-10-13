import type { ApiRequestOptions } from "../api/client";

export interface PushGateway {
  permission(): Promise<boolean>;
  token(): Promise<string | null>;
  deleteToken(): Promise<void>;
}
export class PushSession {
  constructor(
    private readonly gateway: PushGateway,
    private readonly api: {
      request<T>(path: string, options?: ApiRequestOptions): Promise<T>;
    },
    private readonly isCurrent: () => boolean = () => true,
  ) {}
  async enable(): Promise<boolean> {
    if (!this.isCurrent() || !(await this.gateway.permission()) || !this.isCurrent()) return false;
    const token = await this.gateway.token();
    if (!token || !this.isCurrent()) return false;
    await this.api.request("/notifications/device-token", {
      method: "PUT",
      body: { token },
    });
    return this.isCurrent();
  }
  async disable(): Promise<void> {
    await this.api.request("/notifications/device-token", { method: "DELETE" });
    await this.gateway.deleteToken();
  }
}
