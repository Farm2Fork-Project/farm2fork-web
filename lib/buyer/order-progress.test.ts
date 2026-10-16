import { expect, test } from "vitest";
import type { ApiOrder, ApiPayment, ApiShipment } from "../api/contracts.ts";
import { orderBucket, orderStages } from "./order-progress.ts";

const order = {
  id: "o1",
  status: "pending",
  createdAt: "2026-10-01T08:00:00.000Z",
} as ApiOrder;
const payment = (status: ApiPayment["status"], paidAt?: string) =>
  ({ id: "pay1", orderId: "o1", status, paidAt }) as ApiPayment;
const shipment = (
  status: ApiShipment["status"],
  history: Array<[ApiShipment["status"], string]> = [],
) =>
  ({
    id: "s1",
    orderId: "o1",
    status,
    statusHistory: history.map(([entryStatus, timestamp]) => ({
      status: entryStatus,
      timestamp,
    })),
  }) as ApiShipment;

const states = (stages: ReturnType<typeof orderStages>) =>
  stages.map((stage) => `${stage.id}:${stage.state}`);

test("an unpaid order waits at payment", () => {
  expect(states(orderStages(order, undefined, undefined))).toEqual([
    "placed:done",
    "paid:current",
    "picked_up:upcoming",
    "in_transit:upcoming",
    "delivered:upcoming",
  ]);
  expect(orderBucket(order, undefined, undefined)).toBe("to_pay");
});

test("a paid order in transit carries the times the server recorded", () => {
  const paid = { ...order, status: "shipped" } as ApiOrder;
  const stages = orderStages(
    paid,
    payment("success", "2026-10-01T09:00:00.000Z"),
    shipment("in_transit", [
      ["picked_up", "2026-10-02T07:00:00.000Z"],
      ["in_transit", "2026-10-02T08:00:00.000Z"],
    ]),
  );
  expect(states(stages)).toEqual([
    "placed:done",
    "paid:done",
    "picked_up:done",
    "in_transit:done",
    "delivered:current",
  ]);
  expect(stages[1].at).toBe("2026-10-01T09:00:00.000Z");
  expect(stages[3].at).toBe("2026-10-02T08:00:00.000Z");
  expect(orderBucket(paid, payment("success"), shipment("in_transit"))).toBe(
    "in_progress",
  );
});

test("cancelled orders stop after placed and failed payments are marked", () => {
  const cancelled = { ...order, status: "cancelled" } as ApiOrder;
  expect(states(orderStages(cancelled, undefined, undefined))).toEqual([
    "placed:done",
    "cancelled:problem",
  ]);
  expect(orderBucket(cancelled, undefined, undefined)).toBe("cancelled");
  expect(states(orderStages(order, payment("failed"), undefined))[1]).toBe(
    "paid:problem",
  );
});

test("a delivered order is complete without a shipment record", () => {
  const delivered = { ...order, status: "delivered" } as ApiOrder;
  expect(
    states(orderStages(delivered, payment("success"), undefined)).every(
      (item) => item.endsWith(":done"),
    ),
  ).toBe(true);
  expect(orderBucket(delivered, undefined, undefined)).toBe("delivered");
});
