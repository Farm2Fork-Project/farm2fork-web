import type { ApiRequestOptions } from "../api/client.ts";
import type {
  ApiAvailableDelivery,
  ApiTransporterStatus,
  ApiCoordinates,
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

  getTransporterStatus(): Promise<ApiTransporterStatus> {
    return this.client.request<ApiTransporterStatus>(
      "/shipments/transporter/status",
    );
  }
  setAvailability(
    online: boolean,
    location?: ApiCoordinates,
  ): Promise<ApiTransporterStatus> {
    return this.client.request<ApiTransporterStatus>(
      "/shipments/transporter/availability",
      { method: "PUT", body: { online, ...(online ? { location } : {}) } },
    );
  }
  updateLocation(location: ApiCoordinates): Promise<void> {
    return this.client.request<void>("/shipments/transporter/location", {
      method: "PUT",
      body: location,
    });
  }
  decline(orderId: string): Promise<void> {
    return this.client.request<void>(`/shipments/offers/${orderId}/decline`, {
      method: "POST",
    });
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
