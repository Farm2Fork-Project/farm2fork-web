import { expect, test } from "vitest";
import { ShipmentRepository } from "./shipment-repository.ts";

test("ShipmentRepository requests only redacted available deliveries", async () => {
  const calls: Array<{ path: string; options?: unknown }> = [];
  const repository = new ShipmentRepository({
    client: {
      request: async (path, options) => {
        calls.push({ path, options });
        return [];
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
      request: async (path, options) => {
        calls.push({ path, options });
        return { id: "shipment-1" };
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
      request: async (path, options) => {
        calls.push({ path, options });
        return { id: "shipment-1" };
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
