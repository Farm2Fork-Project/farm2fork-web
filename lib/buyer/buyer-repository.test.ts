import { expect, test } from "vitest";
import { BuyerRepository } from "./buyer-repository.ts";

test("BuyerRepository creates an order without client-calculated totals or farmer ids", async () => {
  const calls: Array<{ path: string; options?: unknown }> = [];
  const repository = new BuyerRepository({
    client: {
      request: async (path, options) => {
        calls.push({ path, options });
        return { id: "order-1" };
      },
    },
  });

  await repository.createOrder({
    items: [{ productId: "product-1", quantity: 2 }],
    shippingAddress: {
      street: "12 Mall Road",
      city: "Lahore",
      province: "Punjab",
    },
  });

  expect(calls).toEqual([
    {
      path: "/orders",
      options: {
        method: "POST",
        body: {
          items: [{ productId: "product-1", quantity: 2 }],
          shippingAddress: {
            street: "12 Mall Road",
            city: "Lahore",
            province: "Punjab",
          },
        },
      },
    },
  ]);
});

test("BuyerRepository settles a pending payment through the local simulator", async () => {
  const calls: Array<{ path: string; options?: unknown }> = [];
  const repository = new BuyerRepository({
    client: {
      request: async (path, options) => {
        calls.push({ path, options });
        return { id: "payment-1", status: "success" };
      },
    },
  });

  await repository.simulatePaymentSuccess("payment-1");

  expect(calls).toEqual([
    {
      path: "/payments/payment-1/simulate",
      options: { method: "POST", body: { status: "success" } },
    },
  ]);
});
