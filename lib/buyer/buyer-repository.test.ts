import { expect, test } from "vitest";
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

  await expect(
    repository.login({ email: "farmer@example.com", password: "password" }),
  ).rejects.toMatchObject(new ApiError(403, "This account cannot access the buyer application."));
  expect(saved).toBe(0);
});

test("BuyerRepository registers a buyer through the backend and saves the session", async () => {
  const calls: Array<{ path: string; options?: unknown }> = [];
  const savedSessions: unknown[] = [];
  const repository = new BuyerRepository({
    client: {
      request: async (path, options) => {
        calls.push({ path, options });
        return {
          accessToken: "buyer-token",
          user: {
            id: "buyer-1",
            email: "buyer@example.com",
            role: "buyer",
            isVerified: false,
            isActive: true,
          },
        };
      },
    },
    session: {
      save: (session) => savedSessions.push(session),
      read: () => null,
      clear: () => undefined,
    },
  });

  const session = await repository.registerBuyer({
    businessName: "Fresh Mart",
    businessType: "retailer",
    cnic: "35202-1234567-1",
    email: "buyer@example.com",
    password: "StrongP@ss1",
    phone: "+923001234567",
  });

  expect(calls).toEqual([
    {
      path: "/auth/register/buyer",
      options: {
        method: "POST",
        body: {
          businessName: "Fresh Mart",
          businessType: "retailer",
          cnic: "35202-1234567-1",
          email: "buyer@example.com",
          password: "StrongP@ss1",
          phone: "+923001234567",
        },
      },
    },
  ]);
  expect(session).toEqual({
    accessToken: "buyer-token",
    user: {
      id: "buyer-1",
      email: "buyer@example.com",
      role: "buyer",
      isVerified: false,
      isActive: true,
    },
  });
  expect(savedSessions).toEqual([session]);
});
