import { ApiClient } from "../api/client.ts";

export type NotificationType =
  | "order_placed"
  | "payment_confirmed"
  | "shipment_assigned"
  | "delivery_update"
  | "loan_update"
  | "admin_action"
  | "delivery_offer";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityId?: string;
  relatedEntityModel?: string;
  isRead: boolean;
  createdAt: string;
}

export class NotificationRepository {
  private readonly client: Pick<ApiClient, "request">;

  constructor({ client }: { client?: Pick<ApiClient, "request"> } = {}) {
    this.client = client ?? new ApiClient();
  }

  async list(limit = 15): Promise<AppNotification[]> {
    const page = await this.client.request<{ data: AppNotification[] }>(
      `/notifications?limit=${limit}`,
    );
    return page.data;
  }

  async unreadCount(): Promise<number> {
    return (await this.client.request<{ unread: number }>("/notifications/unread-count")).unread;
  }

  markRead(id: string): Promise<unknown> {
    return this.client.request(`/notifications/${encodeURIComponent(id)}/read`, { method: "PATCH" });
  }

  markAllRead(): Promise<unknown> {
    return this.client.request("/notifications/read-all", { method: "POST" });
  }
}
