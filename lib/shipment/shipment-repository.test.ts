import { expect, test } from "vitest";
import { ShipmentRepository } from "./shipment-repository.ts";

test("ShipmentRepository requests only redacted available deliveries", async () => {
  const calls: Array<{ path: string; options?: unknown }> = [];
  const repository = new ShipmentRepository({
    client: {
      request: async <T>(path: string, options?: unknown) => {
        calls.push({ path, options });
        return [] as T;
      },
    },
  });

  await repository.listAvailable();

  expect(calls).toEqual([{ path: "/shipments/available", options: undefined }]);
});

test("ShipmentRepository claims only the selected available order", async () => {
  const calls: Array<{ path: string; options?: unknown }> = [];
  const repository = new ShipmentRepository({
    client: {
      request: async <T>(path: string, options?: unknown) => {
        calls.push({ path, options });
        return { id: "shipment-1" } as T;
      },
    },
  });

  await repository.claim("order-1");

  expect(calls).toEqual([
    {
      path: "/shipments/claims",
      options: { method: "POST", body: { orderId: "order-1" } },
    },
  ]);
});

test("ShipmentRepository sends the exact status and note to the assigned shipment", async () => {
  const calls: Array<{ path: string; options?: unknown }> = [];
  const repository = new ShipmentRepository({
    client: {
      request: async <T>(path: string, options?: unknown) => {
        calls.push({ path, options });
        return { id: "shipment-1" } as T;
      },
    },
  });

  await repository.updateStatus("shipment-1", {
    status: "picked_up",
    note: "Collected from farm gate",
  });

  expect(calls).toEqual([
    {
      path: "/shipments/shipment-1/status",
      options: {
        method: "PATCH",
        body: { status: "picked_up", note: "Collected from farm gate" },
      },
    },
  ]);
});

test("availability, location and decline use caller-scoped endpoints", async () => {
  const calls: Array<{ path: string; options?: unknown }> = [];
  const repo = new ShipmentRepository({
    client: {
      request: async <T>(path: string, options?: unknown) => {
        calls.push({ path, options });
        return {} as T;
      },
    },
  });
  await repo.getTransporterStatus();
  await repo.setAvailability(true, { lat: 31.52, lng: 74.35 });
  await repo.updateLocation({ lat: 31.53, lng: 74.36 });
  await repo.decline("order-1");
  await repo.setAvailability(false);
  expect(calls).toEqual([
    { path: "/shipments/transporter/status", options: undefined },
    {
      path: "/shipments/transporter/availability",
      options: {
        method: "PUT",
        body: { online: true, location: { lat: 31.52, lng: 74.35 } },
      },
    },
    {
      path: "/shipments/transporter/location",
      options: { method: "PUT", body: { lat: 31.53, lng: 74.36 } },
    },
    { path: "/shipments/offers/order-1/decline", options: { method: "POST" } },
    {
      path: "/shipments/transporter/availability",
      options: { method: "PUT", body: { online: false } },
    },
  ]);
});
