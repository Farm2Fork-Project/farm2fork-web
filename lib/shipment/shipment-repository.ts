import type { ApiRequestOptions } from "../api/client.ts";
import type {
  ApiAvailableDelivery,
  ApiShipment,
  UpdateShipmentStatusRequest,
} from "../api/contracts.ts";

type ApiRequester = {
  request<T>(path: string, options?: ApiRequestOptions): Promise<T>;
};

export class ShipmentRepository {
  private readonly client: ApiRequester;

  constructor({ client }: { client: ApiRequester }) {
    this.client = client;
  }

  listAvailable(): Promise<ApiAvailableDelivery[]> {
    return this.client.request<ApiAvailableDelivery[]>("/shipments/available");
  }

  claim(orderId: string): Promise<ApiShipment> {
    return this.client.request<ApiShipment>("/shipments/claims", {
      method: "POST",
      body: { orderId },
    });
  }

  listShipments(): Promise<ApiShipment[]> {
    return this.client.request<ApiShipment[]>("/shipments");
  }

  updateStatus(
    id: string,
    input: UpdateShipmentStatusRequest,
  ): Promise<ApiShipment> {
    return this.client.request<ApiShipment>(`/shipments/${id}/status`, {
      method: "PATCH",
      body: input,
    });
  }
}
