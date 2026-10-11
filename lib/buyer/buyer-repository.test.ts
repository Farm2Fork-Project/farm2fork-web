import { expect, test } from "vitest";
import { BuyerRepository } from "./buyer-repository.ts";

test("BuyerRepository creates an order without client-calculated totals or farmer ids", async () => {
  const calls: Array<{ path: string; options?: unknown }> = [];
  const repository = new BuyerRepository({
    client: {
      request: async <T>(path: string, options?: unknown) => {
        calls.push({ path, options });
        return { id: "order-1" } as T;
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
      request: async <T>(path: string, options?: unknown) => {
        calls.push({ path, options });
        return { id: "payment-1", status: "success" } as T;
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

test("buyer browsing requests only active farmer listings", async () => {
  let requested = "";
  const repository = new BuyerRepository({
    client: {
      request: async <T>(path: string) => {
        requested = path;
        return { data: [] } as T;
      },
    },
  });
  await repository.listProducts({ search: "Mangoes" });
  expect(requested).toBe("/products?search=Mangoes&status=active");
});

test("BuyerRepository preserves the hosted checkout URL when initiating Safepay", async () => {
  const response = {
    payment: { id: "payment-1", status: "pending" },
    checkoutUrl: "https://sandbox.api.getsafepay.com/checkout/pay?tracker=test",
  };
  const calls: unknown[] = [];
  const repository = new BuyerRepository({
    client: {
      request: async <T>(path: string, options?: unknown) => {
        calls.push({ path, options });
        return response as T;
      },
    },
  });
  expect(await repository.initiatePayment("order-1", "safepay")).toEqual(
    response,
  );
  expect(calls).toEqual([
    {
      path: "/payments",
      options: {
        method: "POST",
        body: { orderId: "order-1", gateway: "safepay" },
      },
    },
  ]);
});
