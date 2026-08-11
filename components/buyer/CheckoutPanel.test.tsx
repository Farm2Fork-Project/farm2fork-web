import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import type { CartFarmerGroup } from "@/lib/cart/cart.ts";
import { CheckoutPanel } from "./CheckoutPanel";

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
    .mockResolvedValueOnce({ id: "payment-1", status: "pending" })
    .mockResolvedValueOnce({ id: "payment-2", status: "pending" });
  const onConfirmedFarmers = vi.fn();

  render(
    <CheckoutPanel
      groups={groups}
      repository={{ createOrder, initiatePayment }}
      onConfirmedFarmers={onConfirmedFarmers}
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
  expect(initiatePayment).toHaveBeenNthCalledWith(1, "order-1", "jazzcash");
  expect(initiatePayment).toHaveBeenNthCalledWith(2, "order-2", "jazzcash");
  expect(onConfirmedFarmers).toHaveBeenCalledWith(["farmer-1", "farmer-2"]);
  expect(screen.getByText("2 payments are pending.")).toBeVisible();
});
