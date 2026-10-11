import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import type { ApiShipment } from "@/lib/api/contracts.ts";
import type { BuyerSession } from "@/lib/auth/web-session.ts";
import { BuyerApp } from "./BuyerApp";

afterEach(cleanup);

const session: BuyerSession = {
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
        simulatePaymentSuccess: vi.fn(),
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
        simulatePaymentSuccess: vi.fn(),
      }}
      onLogout={vi.fn()}
    />,
  );

  await userEvent.click(await screen.findByRole("button", { name: "Orders" }));

  expect(await screen.findByText("Shipment: in_transit")).toBeVisible();
  expect(screen.queryByText("Shipment: delivered")).not.toBeInTheDocument();
});

test("BuyerApp settles a pending payment and refreshes its timeline", async () => {
  const simulatePaymentSuccess = vi.fn().mockResolvedValue({
    id: "payment-1",
    status: "success",
  });
  const listPayments = vi
    .fn()
    .mockResolvedValueOnce({ data: [{ id: "payment-1", orderId: "order-1", status: "pending" }] })
    .mockResolvedValueOnce({ data: [{ id: "payment-1", orderId: "order-1", status: "success" }] });

  render(
    <BuyerApp simulatorEnabled={true}
      session={session}
      repository={{
        getCurrentBuyer: vi.fn().mockResolvedValue(session.user),
        listProducts: vi.fn().mockResolvedValue({ data: [] }),
        getProduct: vi.fn(),
        listOrders: vi.fn().mockResolvedValue({
          data: [{ id: "order-1", status: "pending", items: [], grandTotal: 240, createdAt: "2026-08-12T00:00:00.000Z" }],
        }),
        listPayments,
        listShipments: vi.fn().mockResolvedValue([]),
        createOrder: vi.fn(),
        initiatePayment: vi.fn(),
        simulatePaymentSuccess,
      }}
      onLogout={vi.fn()}
    />,
  );

  await userEvent.click(await screen.findByRole("button", { name: "Orders" }));
  await userEvent.click(await screen.findByRole("button", { name: "Simulate payment success" }));

  expect(simulatePaymentSuccess).toHaveBeenCalledWith("payment-1");
  expect(await screen.findByText("Payment: success")).toBeVisible();
  expect(listPayments).toHaveBeenCalledTimes(2);
});

test("BuyerApp disables a payment settlement action while it is pending", async () => {
  const simulatePaymentSuccess = vi.fn(
    () => new Promise<never>(() => undefined),
  );

  render(
    <BuyerApp simulatorEnabled={true}
      session={session}
      repository={{
        getCurrentBuyer: vi.fn().mockResolvedValue(session.user),
        listProducts: vi.fn().mockResolvedValue({ data: [] }),
        getProduct: vi.fn(),
        listOrders: vi.fn().mockResolvedValue({
          data: [{ id: "order-1", status: "pending", items: [], grandTotal: 240, createdAt: "2026-08-12T00:00:00.000Z" }],
        }),
        listPayments: vi.fn().mockResolvedValue({
          data: [{ id: "payment-1", orderId: "order-1", status: "pending" }],
        }),
        listShipments: vi.fn().mockResolvedValue([]),
        createOrder: vi.fn(),
        initiatePayment: vi.fn(),
        simulatePaymentSuccess,
      }}
      onLogout={vi.fn()}
    />,
  );

  await userEvent.click(await screen.findByRole("button", { name: "Orders" }));
  const button = await screen.findByRole("button", { name: "Simulate payment success" });
  await userEvent.click(button);

  expect(simulatePaymentSuccess).toHaveBeenCalledOnce();
  expect(button).toBeDisabled();
});


test("Safepay return reads persisted status and resumes the existing order", async () => {
  const listOrders = vi.fn().mockResolvedValue({ data: [{ id: "order-1", status: "pending", items: [], grandTotal: 240, createdAt: "2026-08-12T00:00:00.000Z" }] });
  const listPayments = vi.fn().mockResolvedValue({ data: [{ id: "payment-1", orderId: "order-1", status: "pending", gateway: "safepay" }] });
  const createOrder = vi.fn();
  const initiatePayment = vi.fn().mockResolvedValue({ payment: { id: "payment-1", status: "pending", gateway: "safepay" }, checkoutUrl: "https://sandbox.api.getsafepay.com/checkout/pay?tracker=resume" });
  render(<BuyerApp paymentReturn="complete" session={session} onLogout={vi.fn()} repository={{
    getCurrentBuyer: vi.fn().mockResolvedValue(session.user), listProducts: vi.fn().mockResolvedValue({ data: [] }), getProduct: vi.fn(), listOrders, listPayments,
    listShipments: vi.fn().mockResolvedValue([]), createOrder, initiatePayment, simulatePaymentSuccess: vi.fn(),
  }} />);
  expect(await screen.findByText("Payment: pending")).toBeVisible();
  expect(screen.queryByText("Payment: success")).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Simulate payment success" })).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Continue payment" }));
  expect(initiatePayment).toHaveBeenCalledWith("order-1", "safepay");
  expect(createOrder).not.toHaveBeenCalled();
  expect(await screen.findByRole("link", { name: "Open Safepay checkout" })).toHaveAttribute("href", "https://sandbox.api.getsafepay.com/checkout/pay?tracker=resume");
  listPayments.mockResolvedValue({ data: [{ id: "payment-1", orderId: "order-1", status: "success", gateway: "safepay" }] });
  listOrders.mockResolvedValue({ data: [{ id: "order-1", status: "paid", items: [], grandTotal: 240, createdAt: "2026-08-12T00:00:00.000Z" }] });
  await userEvent.click(screen.getByRole("button", { name: "Refresh payment status" }));
  expect(await screen.findByText("Payment: success")).toBeVisible();
  expect(screen.queryByRole("link", { name: "Open Safepay checkout" })).not.toBeInTheDocument();
});

test("cancel return preserves a pending order and offers payment retry", async () => {
  render(<BuyerApp paymentReturn="cancel" session={session} onLogout={vi.fn()} repository={{
    getCurrentBuyer: vi.fn().mockResolvedValue(session.user), listProducts: vi.fn().mockResolvedValue({ data: [] }), getProduct: vi.fn(),
    listOrders: vi.fn().mockResolvedValue({ data: [{ id: "order-1", status: "pending", items: [], grandTotal: 240, createdAt: "2026-08-12T00:00:00.000Z" }] }),
    listPayments: vi.fn().mockResolvedValue({ data: [] }), listShipments: vi.fn().mockResolvedValue([]), createOrder: vi.fn(), initiatePayment: vi.fn(), simulatePaymentSuccess: vi.fn(),
  }} />);
  expect(await screen.findByText("Payment: not initiated")).toBeVisible();
  expect(screen.getByText(/Checkout was closed/)).toBeVisible();
  expect(screen.getByRole("button", { name: "Continue payment" })).toBeVisible();
});

test("clearing a confirmed cart keeps the hosted checkout receipt visible", async () => {
  const product = { id: "product-1", farmerId: "farmer-1", name: "Roma Tomatoes", price: 120, quantity: 20, unit: "kg", images: [], status: "active" };
  render(<BuyerApp session={session} onLogout={vi.fn()} repository={{
    getCurrentBuyer: vi.fn().mockResolvedValue(session.user), listProducts: vi.fn().mockResolvedValue({ data: [product] }), getProduct: vi.fn(),
    listOrders: vi.fn().mockResolvedValue({ data: [] }), listPayments: vi.fn().mockResolvedValue({ data: [] }), listShipments: vi.fn().mockResolvedValue([]),
    createOrder: vi.fn().mockResolvedValue({ id: "order-1" }),
    initiatePayment: vi.fn().mockResolvedValue({ payment: { id: "payment-1", status: "pending", gateway: "safepay" }, checkoutUrl: "https://sandbox.api.getsafepay.com/checkout/pay?tracker=one" }), simulatePaymentSuccess: vi.fn(),
  }} />);
  const user = userEvent.setup();
  await user.click(await screen.findByRole("button", { name: "Add Roma Tomatoes to cart" }));
  await user.click(screen.getByRole("button", { name: /cart \(1\)/i }));
  await user.type(screen.getByLabelText("Street"), "12 Mall Road");
  await user.type(screen.getByLabelText("City"), "Lahore");
  await user.type(screen.getByLabelText("Province"), "Punjab");
  await user.click(screen.getByRole("button", { name: "Place orders" }));
  expect(await screen.findByRole("link", { name: "Pay farmer group 1 with Safepay" })).toBeVisible();
  expect(screen.getByRole("button", { name: /cart \(0\)/i })).toBeVisible();
});

test("resume failure preserves the order and supports a deliberate retry", async () => {
  const initiatePayment = vi.fn().mockRejectedValueOnce(new Error("Safepay unavailable"))
    .mockResolvedValueOnce({ payment: { id: "payment-1", status: "pending", gateway: "safepay" }, checkoutUrl: "https://sandbox.api.getsafepay.com/checkout/pay?tracker=retry" });
  const createOrder = vi.fn();
  render(<BuyerApp paymentReturn="cancel" session={session} onLogout={vi.fn()} repository={{
    getCurrentBuyer: vi.fn().mockResolvedValue(session.user), listProducts: vi.fn().mockResolvedValue({ data: [] }), getProduct: vi.fn(),
    listOrders: vi.fn().mockResolvedValue({ data: [{ id: "order-1", status: "pending", items: [], grandTotal: 240, createdAt: "2026-08-12T00:00:00.000Z" }] }),
    listPayments: vi.fn().mockResolvedValueOnce({ data: [] }).mockResolvedValue({ data: [{ id: "payment-1", orderId: "order-1", status: "pending", gateway: "safepay" }] }), listShipments: vi.fn().mockResolvedValue([]), createOrder, initiatePayment, simulatePaymentSuccess: vi.fn(),
  }} />);
  const user = userEvent.setup();
  await user.click(await screen.findByRole("button", { name: "Continue payment" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Safepay unavailable");
  expect(screen.queryByRole("link", { name: "Open Safepay checkout" })).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Continue payment" }));
  expect(await screen.findByRole("link", { name: "Open Safepay checkout" })).toBeVisible();
  expect(initiatePayment.mock.calls).toEqual([["order-1", "safepay"], ["order-1", "safepay"]]);
  expect(createOrder).not.toHaveBeenCalled();
});

test("disables resume while the gateway request is pending", async () => {
  const initiatePayment = vi.fn(() => new Promise<never>(() => undefined));
  render(<BuyerApp paymentReturn="cancel" session={session} onLogout={vi.fn()} repository={{
    getCurrentBuyer: vi.fn().mockResolvedValue(session.user), listProducts: vi.fn().mockResolvedValue({ data: [] }), getProduct: vi.fn(),
    listOrders: vi.fn().mockResolvedValue({ data: [{ id: "order-1", status: "pending", items: [], grandTotal: 240, createdAt: "2026-08-12T00:00:00.000Z" }] }),
    listPayments: vi.fn().mockResolvedValue({ data: [] }), listShipments: vi.fn().mockResolvedValue([]), createOrder: vi.fn(), initiatePayment, simulatePaymentSuccess: vi.fn(),
  }} />);
  await userEvent.click(await screen.findByRole("button", { name: "Continue payment" }));
  const preparing = screen.getByRole("button", { name: "Preparing checkout…" });
  expect(preparing).toBeDisabled();
  await userEvent.click(preparing);
  expect(initiatePayment).toHaveBeenCalledOnce();
});

test("a failed status refresh removes the previous hosted checkout link", async () => {
  const listPayments = vi.fn().mockResolvedValue({ data: [{ id: "payment-1", orderId: "order-1", status: "pending", gateway: "safepay" }] });
  render(<BuyerApp paymentReturn="complete" session={session} onLogout={vi.fn()} repository={{
    getCurrentBuyer: vi.fn().mockResolvedValue(session.user), listProducts: vi.fn().mockResolvedValue({ data: [] }), getProduct: vi.fn(),
    listOrders: vi.fn().mockResolvedValue({ data: [{ id: "order-1", status: "pending", items: [], grandTotal: 240, createdAt: "2026-08-12T00:00:00.000Z" }] }),
    listPayments, listShipments: vi.fn().mockResolvedValue([]), createOrder: vi.fn(),
    initiatePayment: vi.fn().mockResolvedValue({ payment: { id: "payment-1", orderId: "order-1", status: "pending", gateway: "safepay" }, checkoutUrl: "https://sandbox.api.getsafepay.com/checkout/pay?tracker=old" }), simulatePaymentSuccess: vi.fn(),
  }} />);
  await userEvent.click(await screen.findByRole("button", { name: "Continue payment" }));
  expect(await screen.findByRole("link", { name: "Open Safepay checkout" })).toBeVisible();
  listPayments.mockResolvedValue({ data: [{ id: "payment-1", orderId: "order-1", status: "failed", gateway: "safepay" }] });
  await userEvent.click(screen.getByRole("button", { name: "Refresh payment status" }));
  expect(await screen.findByText("Payment: failed")).toBeVisible();
  expect(screen.queryByRole("link", { name: "Open Safepay checkout" })).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Continue payment" })).toBeVisible();
});
