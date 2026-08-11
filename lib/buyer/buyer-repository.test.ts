import assert from "node:assert/strict";
import test from "node:test";
import { ApiError } from "../api/contracts.ts";
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

  assert.deepEqual(calls, [
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

test("BuyerRepository rejects non-buyer logins before saving a session", async () => {
  let saved = 0;
  const repository = new BuyerRepository({
    client: {
      request: async () => ({
        accessToken: "other-role-token",
        user: {
          id: "farmer-1",
          email: "farmer@example.com",
          role: "farmer",
          isVerified: true,
          isActive: true,
        },
      }),
    },
    session: {
      save: () => {
        saved += 1;
      },
      read: () => null,
      clear: () => undefined,
    },
  });

  await assert.rejects(
    () => repository.login({ email: "farmer@example.com", password: "password" }),
    (error: unknown) => {
      assert.ok(error instanceof ApiError);
      assert.equal(error.status, 403);
      return true;
    },
  );
  assert.equal(saved, 0);
});
