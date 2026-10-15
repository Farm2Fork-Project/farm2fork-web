import type {
  ApiOrder,
  ApiPayment,
  ApiShipment,
  ShipmentStatus,
} from "../api/contracts.ts";

export type StageId =
  "placed" | "paid" | "picked_up" | "in_transit" | "delivered" | "cancelled";

export type StageState = "done" | "current" | "upcoming" | "problem";

export type OrderStage = {
  id: StageId;
  state: StageState;
  /** When the server recorded this step; absent for steps not reached yet. */
  at?: string;
};

export type OrderBucket = "to_pay" | "in_progress" | "delivered" | "cancelled";

const SHIPMENT_ORDER: ShipmentStatus[] = [
  "assigned",
  "picked_up",
  "in_transit",
  "delivered",
];

function shipmentReached(
  shipment: ApiShipment | undefined,
  status: ShipmentStatus,
): { reached: boolean; at?: string } {
  if (!shipment || shipment.status === "failed") return { reached: false };
  const entry = shipment.statusHistory.find((item) => item.status === status);
  const reached =
    SHIPMENT_ORDER.indexOf(shipment.status) >= SHIPMENT_ORDER.indexOf(status);
  return { reached, at: entry?.timestamp };
}

/** True once the order has been paid for, whichever record shows it first. */
export function isPaid(order: ApiOrder, payment?: ApiPayment): boolean {
  return (
    payment?.status === "success" ||
    ["paid", "processing", "shipped", "delivered"].includes(order.status)
  );
}

/**
 * The five steps an order passes through, from what the server has recorded:
 * the order itself, its payment and its shipment history. A cancelled order
 * stops after "placed"; a failed payment or delivery marks that step.
 */
export function orderStages(
  order: ApiOrder,
  payment: ApiPayment | undefined,
  shipment: ApiShipment | undefined,
): OrderStage[] {
  if (order.status === "cancelled") {
    return [
      { id: "placed", state: "done", at: order.createdAt },
      { id: "cancelled", state: "problem", at: order.updatedAt },
    ];
  }
  const paid = isPaid(order, payment);
  const picked = shipmentReached(shipment, "picked_up");
  const transit = shipmentReached(shipment, "in_transit");
  const delivered =
    order.status === "delivered"
      ? { reached: true, at: shipment?.actualDelivery }
      : shipmentReached(shipment, "delivered");

  const stages: OrderStage[] = [
    { id: "placed", state: "done", at: order.createdAt },
    {
      id: "paid",
      state: paid
        ? "done"
        : payment?.status === "failed"
          ? "problem"
          : "upcoming",
      at: paid ? payment?.paidAt : undefined,
    },
    {
      id: "picked_up",
      state:
        picked.reached || transit.reached || delivered.reached
          ? "done"
          : "upcoming",
      at: picked.at,
    },
    {
      id: "in_transit",
      state: transit.reached || delivered.reached ? "done" : "upcoming",
      at: transit.at,
    },
    {
      id: "delivered",
      state:
        shipment?.status === "failed"
          ? "problem"
          : delivered.reached
            ? "done"
            : "upcoming",
      at: delivered.at ?? shipment?.actualDelivery,
    },
  ];

  const firstOpen = stages.findIndex((stage) => stage.state === "upcoming");
  if (firstOpen !== -1 && !stages.some((stage) => stage.state === "problem")) {
    stages[firstOpen] = { ...stages[firstOpen], state: "current" };
  }
  return stages;
}

/** Which Orders filter an order belongs under. */
export function orderBucket(
  order: ApiOrder,
  payment: ApiPayment | undefined,
  shipment: ApiShipment | undefined,
): OrderBucket {
  if (order.status === "cancelled") return "cancelled";
  if (order.status === "delivered" || shipment?.status === "delivered")
    return "delivered";
  if (!isPaid(order, payment)) return "to_pay";
  return "in_progress";
}

/** What a buyer reads for a payment state; the raw API value is not shown. */
export function paymentStateLabel(status: string | undefined): string {
  switch (status) {
    case "success":
      return "Paid";
    case "pending":
      return "Awaiting payment";
    case "failed":
      return "Payment failed";
    case "refunded":
      return "Refunded";
    default:
      return "Payment not started";
  }
}

/** Badge colour family for a payment state (matches the checkout receipt). */
export function paymentStateTone(
  status: string | undefined,
): "green" | "red" | "blue" | "yellow" {
  if (status === "success") return "green";
  if (status === "failed") return "red";
  if (status === "refunded") return "blue";
  return "yellow";
}
