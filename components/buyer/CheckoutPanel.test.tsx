import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import { LanguageProvider } from "@/components/LanguageContext";
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

const LAHORE = { lat: 31.5204, lng: 74.3587 };

function stubGeolocation() {
  vi.stubGlobal("navigator", {
    ...navigator,
    geolocation: {
      getCurrentPosition: (ok: PositionCallback) =>
        ok({ coords: { latitude: LAHORE.lat, longitude: LAHORE.lng } } as GeolocationPosition),
    },
  });
}

function renderPanel(repository: Parameters<typeof CheckoutPanel>[0]["repository"]) {
  const onConfirmedFarmers = vi.fn();
  const onViewOrders = vi.fn();
  render(
    <LanguageProvider>
      <CheckoutPanel
        groups={groups}
        repository={repository}
        onConfirmedFarmers={onConfirmedFarmers}
        onViewOrders={onViewOrders}
      />
    </LanguageProvider>,
  );
  return { onConfirmedFarmers, onViewOrders, user: userEvent.setup() };
}

async function fillAddress(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Street"), "12 Mall Road");
  await user.type(screen.getByLabelText("City"), "Lahore");
  await user.selectOptions(screen.getByLabelText("Province"), "Punjab");
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

test("CheckoutPanel prices each farmer group once the drop-off is pinned, then orders and pays", async () => {
  stubGeolocation();
  const quoteOrder = vi.fn().mockResolvedValue({
    totalAmount: 240,
    platformFeePercent: 5,
    platformFeeAmount: 12,
    deliveryFee: 1150,
    deliveryDistanceKm: 39.7,
    grandTotal: 1402,
  });
  const createOrder = vi
    .fn()
    .mockResolvedValueOnce({ id: "order-1" })
    .mockResolvedValueOnce({ id: "order-2" });
  const initiatePayment = vi
    .fn()
    .mockResolvedValueOnce({ id: "payment-1", status: "pending" })
    .mockResolvedValueOnce({ id: "payment-2", status: "pending" });
  const { onConfirmedFarmers, onViewOrders, user } = renderPanel({
    createOrder,
    initiatePayment,
    quoteOrder,
  });

  await fillAddress(user);
  expect(screen.getAllByText("Pin the drop-off to see the delivery fee")).toHaveLength(2);

  await user.click(screen.getByRole("button", { name: /Use my current location/ }));
  expect(await screen.findAllByText("Rs 1,402")).toHaveLength(2);
  expect(quoteOrder).toHaveBeenCalledTimes(2);
  expect(quoteOrder.mock.calls[0][0].shippingAddress).toMatchObject(LAHORE);

  await user.click(screen.getByRole("button", { name: "Place orders" }));

  const shippingAddress = {
    street: "12 Mall Road",
    city: "Lahore",
    province: "Punjab",
    ...LAHORE,
  };
  expect(createOrder).toHaveBeenNthCalledWith(1, {
    items: [{ productId: "product-1", quantity: 2 }],
    shippingAddress,
  });
  expect(createOrder).toHaveBeenNthCalledWith(2, {
    items: [{ productId: "product-2", quantity: 1 }],
    shippingAddress,
  });
  expect(initiatePayment).toHaveBeenNthCalledWith(1, "order-1", "jazzcash");
  expect(initiatePayment).toHaveBeenNthCalledWith(2, "order-2", "jazzcash");
  expect(onConfirmedFarmers).toHaveBeenCalledWith(["farmer-1", "farmer-2"]);
  expect(screen.getByText("2 orders placed")).toBeVisible();
  expect(screen.getAllByText("pending")).toHaveLength(2);

  await user.click(screen.getByRole("button", { name: "View orders" }));
  expect(onViewOrders).toHaveBeenCalled();
});

test("CheckoutPanel refuses to order without a drop-off pin", async () => {
  const createOrder = vi.fn();
  const { user } = renderPanel({
    createOrder,
    initiatePayment: vi.fn(),
    quoteOrder: vi.fn(),
  });
  await fillAddress(user);
  await user.click(screen.getByRole("button", { name: "Place orders" }));
  expect(screen.getByRole("alert")).toHaveTextContent("Pin the drop-off location");
  expect(createOrder).not.toHaveBeenCalled();
});

test("CheckoutPanel explains when a farm can't be priced yet", async () => {
  stubGeolocation();
  const { user } = renderPanel({
    createOrder: vi.fn(),
    initiatePayment: vi.fn(),
    quoteOrder: vi.fn().mockRejectedValue(new Error("400")),
  });
  await user.click(screen.getByRole("button", { name: /Use my current location/ }));
  expect(await screen.findAllByText(/hasn.t pinned its pickup location/)).toHaveLength(2);
});
