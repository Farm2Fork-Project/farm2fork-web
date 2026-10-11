import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import type { CartFarmerGroup } from "@/lib/cart/cart.ts";
import { CheckoutPanel } from "./CheckoutPanel";

afterEach(cleanup);

const groups: CartFarmerGroup[] = [
  {
    farmerId: "farmer-1",
    items: [
      {
        productId: "product-1",
        farmerId: "farmer-1",
        quantity: 2,
        product: {
          id: "product-1",
          farmerId: "farmer-1",
          name: "Roma Tomatoes",
          price: 120,
          quantity: 20,
          unit: "kg",
          images: [],
          status: "active",
        },
      },
    ],
  },
  {
    farmerId: "farmer-2",
    items: [
      {
        productId: "product-2",
        farmerId: "farmer-2",
        quantity: 1,
        product: {
          id: "product-2",
          farmerId: "farmer-2",
          name: "Kinnow Oranges",
          price: 150,
          quantity: 20,
          unit: "kg",
          images: [],
          status: "active",
        },
      },
    ],
  },
];

test("CheckoutPanel creates one order and pending payment for each farmer group", async () => {
  const createOrder = vi
    .fn()
    .mockResolvedValueOnce({ id: "order-1" })
    .mockResolvedValueOnce({ id: "order-2" });
  const initiatePayment = vi
    .fn()
    .mockResolvedValueOnce({
      payment: { id: "payment-1", status: "pending", gateway: "safepay" },
      checkoutUrl:
        "https://sandbox.api.getsafepay.com/checkout/pay?tracker=one",
    })
    .mockResolvedValueOnce({
      payment: { id: "payment-2", status: "pending", gateway: "safepay" },
      checkoutUrl:
        "https://sandbox.api.getsafepay.com/checkout/pay?tracker=two",
    });
  const onConfirmedFarmers = vi.fn();
  const onViewOrders = vi.fn();

  render(
    <CheckoutPanel
      groups={groups}
      repository={{ createOrder, initiatePayment }}
      onConfirmedFarmers={onConfirmedFarmers}
      onViewOrders={onViewOrders}
    />,
  );

  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Street"), "12 Mall Road");
  await user.type(screen.getByLabelText("City"), "Lahore");
  await user.type(screen.getByLabelText("Province"), "Punjab");
  await user.click(screen.getByRole("button", { name: "Place orders" }));

  expect(createOrder).toHaveBeenNthCalledWith(1, {
    items: [{ productId: "product-1", quantity: 2 }],
    shippingAddress: {
      street: "12 Mall Road",
      city: "Lahore",
      province: "Punjab",
    },
  });
  expect(createOrder).toHaveBeenNthCalledWith(2, {
    items: [{ productId: "product-2", quantity: 1 }],
    shippingAddress: {
      street: "12 Mall Road",
      city: "Lahore",
      province: "Punjab",
    },
  });
  expect(initiatePayment).toHaveBeenNthCalledWith(1, "order-1", "safepay");
  expect(initiatePayment).toHaveBeenNthCalledWith(2, "order-2", "safepay");
  expect(onConfirmedFarmers).toHaveBeenCalledWith(["farmer-1", "farmer-2"]);
  expect(screen.getByText("2 orders placed")).toBeVisible();
  expect(screen.getAllByText("pending")).toHaveLength(2);
  expect(
    screen.getByRole("link", { name: "Pay farmer group 1 with Safepay" }),
  ).toHaveAttribute(
    "href",
    "https://sandbox.api.getsafepay.com/checkout/pay?tracker=one",
  );
  expect(
    screen.getByRole("link", { name: "Pay farmer group 2 with Safepay" }),
  ).toHaveAttribute(
    "href",
    "https://sandbox.api.getsafepay.com/checkout/pay?tracker=two",
  );
  expect(
    screen.queryByRole("option", { name: "JazzCash" }),
  ).not.toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "View orders" }));
  expect(onViewOrders).toHaveBeenCalled();
});

async function fillAndSubmit() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Street"), "12 Mall Road");
  await user.type(screen.getByLabelText("City"), "Lahore");
  await user.type(screen.getByLabelText("Province"), "Punjab");
  await user.click(screen.getByRole("button", { name: "Place orders" }));
}

test("keeps a created order recoverable when payment initiation fails", async () => {
  const createOrder = vi.fn().mockResolvedValue({ id: "order-1" });
  const initiatePayment = vi
    .fn()
    .mockRejectedValue(new Error("Safepay unavailable"));
  const onConfirmedFarmers = vi.fn();
  render(
    <CheckoutPanel
      groups={groups}
      repository={{ createOrder, initiatePayment }}
      onConfirmedFarmers={onConfirmedFarmers}
      onViewOrders={vi.fn()}
    />,
  );
  await fillAndSubmit();
  expect(screen.getByText("Order placed")).toBeVisible();
  expect(screen.getByRole("alert")).toHaveTextContent("Safepay unavailable");
  expect(screen.getByRole("button", { name: "View orders" })).toBeVisible();
  expect(onConfirmedFarmers).toHaveBeenCalledWith(["farmer-1"]);
  expect(createOrder).toHaveBeenCalledOnce();
});

test.each([undefined, "javascript:alert(1)", "https://untrusted.example/pay"])(
  "does not expose an unusable checkout URL: %s",
  async (checkoutUrl) => {
    render(
      <CheckoutPanel
        groups={[groups[0]]}
        repository={{
          createOrder: vi.fn().mockResolvedValue({ id: "order-1" }),
          initiatePayment: vi
            .fn()
            .mockResolvedValue({
              payment: {
                id: "payment-1",
                status: "pending",
                gateway: "safepay",
              },
              checkoutUrl,
            }),
        }}
        onConfirmedFarmers={vi.fn()}
        onViewOrders={vi.fn()}
      />,
    );
    await fillAndSubmit();
    expect(screen.getByRole("alert")).toHaveTextContent("checkout link");
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  },
);
