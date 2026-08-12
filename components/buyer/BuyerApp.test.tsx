import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import type { ApiShipment } from "@/lib/api/contracts.ts";
import type { BuyerSession } from "@/lib/auth/web-session.ts";
import { BuyerApp } from "./BuyerApp";

afterEach(cleanup);

const session: BuyerSession = {
  accessToken: "buyer-token",
  user: {
    id: "buyer-1",
    email: "buyer@example.com",
    role: "buyer",
    isVerified: true,
    isActive: true,
  },
};

test("BuyerApp validates the session before it renders live marketplace data", async () => {
  const getCurrentBuyer = vi.fn().mockResolvedValue(session.user);
  const listProducts = vi.fn().mockResolvedValue({
    data: [
      {
        id: "product-1",
        farmerId: "farmer-1",
        name: "Roma Tomatoes",
        price: 120,
        quantity: 20,
        unit: "kg",
        images: [],
        qualityGrade: "A",
        status: "active",
      },
    ],
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const listOrders = vi.fn().mockResolvedValue({
    data: [
      {
        id: "order-1",
        status: "pending",
        items: [],
        grandTotal: 240,
        createdAt: "2026-08-12T00:00:00.000Z",
      },
    ],
  });
  const listPayments = vi.fn().mockResolvedValue({
    data: [
      {
        id: "payment-1",
        orderId: "order-1",
        status: "pending",
      },
    ],
  });
  const listShipments = vi.fn().mockResolvedValue([]);

  render(
    <BuyerApp
      session={session}
      repository={{
        getCurrentBuyer,
        listProducts,
        getProduct: vi.fn(),
        listOrders,
        listPayments,
        listShipments,
        createOrder: vi.fn(),
        initiatePayment: vi.fn(),
      }}
      onLogout={vi.fn()}
    />,
  );

  expect(screen.getByText("Loading your buyer account…")).toBeVisible();
  expect(getCurrentBuyer).toHaveBeenCalledOnce();
  expect(screen.queryByText("Roma Tomatoes")).not.toBeInTheDocument();

  expect(await screen.findByText("Roma Tomatoes")).toBeVisible();
  expect(screen.queryByText(/Hassan Organic Farm|Multan, Punjab|4\.8/)).not.toBeInTheDocument();

  await userEvent.click(screen.getByRole("button", { name: "Add Roma Tomatoes to cart" }));
  await userEvent.click(screen.getByRole("button", { name: /cart \(1\)/i }));
  expect(screen.getByText(/Roma Tomatoes/)).toBeVisible();
  expect(screen.getByText("Farmer group 1")).toBeVisible();

  await userEvent.click(screen.getByRole("button", { name: "Orders" }));
  expect(await screen.findByText("Payment: pending")).toBeVisible();
  expect(listPayments).toHaveBeenCalledOnce();
  expect(listShipments).toHaveBeenCalledOnce();

  await waitFor(() => expect(listProducts).toHaveBeenCalledOnce());
});

test("BuyerApp shows only the shipment scoped to each real order", async () => {
  const shipment: ApiShipment = {
    id: "shipment-1",
    orderId: "order-1",
    transporterId: "transporter-1",
    status: "in_transit",
    pickupAddress: {},
    deliveryAddress: {},
    statusHistory: [],
    createdAt: "2026-08-12T00:00:00.000Z",
    updatedAt: "2026-08-12T00:00:00.000Z",
  };

  render(
    <BuyerApp
      session={session}
      repository={{
        getCurrentBuyer: vi.fn().mockResolvedValue(session.user),
        listProducts: vi.fn().mockResolvedValue({ data: [] }),
        getProduct: vi.fn(),
        listOrders: vi.fn().mockResolvedValue({
          data: [{ id: "order-1", status: "paid", items: [], grandTotal: 240, createdAt: "2026-08-12T00:00:00.000Z" }],
        }),
        listPayments: vi.fn().mockResolvedValue({ data: [] }),
        listShipments: vi.fn().mockResolvedValue([
          shipment,
          { ...shipment, id: "shipment-2", orderId: "other-order", status: "delivered" },
        ]),
        createOrder: vi.fn(),
        initiatePayment: vi.fn(),
      }}
      onLogout={vi.fn()}
    />,
  );

  await userEvent.click(await screen.findByRole("button", { name: "Orders" }));

  expect(await screen.findByText("Shipment: in_transit")).toBeVisible();
  expect(screen.queryByText("Shipment: delivered")).not.toBeInTheDocument();
});
