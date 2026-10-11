// Runs only via backend scripts/test/web-checkout-e2e.ts.
// The fixture uses test JWT identities and local Safepay API responses.
import { createHmac } from "node:crypto";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test } from "vitest";
import { ApiClient } from "../lib/api/client.ts";
import { BuyerRepository } from "../lib/buyer/buyer-repository.ts";
import { FarmerRepository } from "../lib/farmer/farmer-repository.ts";
import { ApiError } from "../lib/api/contracts.ts";
import { CheckoutPanel } from "../components/buyer/CheckoutPanel";
import { BuyerApp } from "../components/buyer/BuyerApp";
import type { BuyerSession } from "../lib/auth/web-session.ts";

const baseUrl = process.env.CHECKOUT_TEST_API;
afterEach(cleanup);

test.skipIf(!baseUrl)(
  "web checkout, cancel/resume and signed settlement persist through the real backend",
  async () => {
    const session: BuyerSession = {
      user: {
        id: process.env.CHECKOUT_TEST_BUYER_ID!,
        email: "checkout-buyer@example.test",
        role: "buyer",
        isActive: true,
        isVerified: true,
      },
    };
    const client = (token: string) =>
      new ApiClient({
        baseUrl,
        fetchFn: (input, init) => {
          const headers = new Headers(init?.headers);
          headers.set("Authorization", `Bearer ${token}`);
          // Exercise the real browser-origin/CSRF checks, with seeded bearer auth.
          headers.set("Origin", "http://checkout.example.test");
          return fetch(input, { ...init, headers });
        },
      });
    const buyer = new BuyerRepository({
      client: client(process.env.CHECKOUT_TEST_BUYER_TOKEN!),
    });
    const otherBuyer = new BuyerRepository({
      client: client(process.env.CHECKOUT_TEST_OTHER_TOKEN!),
    });
    const farmer = new BuyerRepository({
      client: client(process.env.CHECKOUT_TEST_FARMER_TOKEN!),
    });
    const products = (await buyer.listProducts()).data;
    expect(products).toHaveLength(2);
    const groups = products.map((product) => ({
      farmerId: product.farmerId,
      items: [
        {
          productId: product.id,
          farmerId: product.farmerId,
          quantity: 2,
          product,
        },
      ],
    }));
    const request = {
      items: [{ productId: products[0].id, quantity: 2 }],
      shippingAddress: {
        street: "12 Mall Road",
        city: "Lahore",
        province: "Punjab",
        lat: 31.5204,
        lng: 74.3587,
      },
    };
    const pickup = {
      address: "Fixture farm road",
      city: "Lahore",
      province: "Punjab",
      lat: 31.5104,
      lng: 74.35,
    };
    const farmerProfile = new FarmerRepository({
      client: client(process.env.CHECKOUT_TEST_FARMER_TOKEN!),
    });
    const secondFarmerProfile = new FarmerRepository({
      client: client(process.env.CHECKOUT_TEST_SECOND_FARMER_TOKEN!),
    });
    expect((await farmerProfile.getFarmLocation()).complete).toBe(false);
    await expect(buyer.quoteOrder(request)).rejects.toMatchObject({
      status: 400,
    });
    await expect(
      new FarmerRepository({
        client: client(process.env.CHECKOUT_TEST_BUYER_TOKEN!),
      }).updateFarmLocation(pickup),
    ).rejects.toMatchObject({ status: 403 });
    await expect(
      farmerProfile.updateFarmLocation({ ...pickup, lat: 0 }),
    ).rejects.toMatchObject({ status: 400 });
    expect((await farmerProfile.updateFarmLocation(pickup)).complete).toBe(
      true,
    );
    expect(
      (
        await secondFarmerProfile.updateFarmLocation({
          ...pickup,
          lat: 31.5304,
          lng: 74.37,
        })
      ).complete,
    ).toBe(true);
    const quote = await buyer.quoteOrder(request);
    expect(quote.deliveryFee).toBeGreaterThan(0);
    expect((await buyer.listOrders()).data).toHaveLength(0);
    await expect(farmer.createOrder(request)).rejects.toMatchObject({
      status: 403,
    });

    render(
      <CheckoutPanel
        groups={groups}
        repository={buyer}
        onConfirmedFarmers={() => undefined}
        onViewOrders={() => undefined}
      />,
    );
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Street"), "12 Mall Road");
    await user.type(screen.getByLabelText("City"), "Lahore");
    await user.type(screen.getByLabelText("Province"), "Punjab");
    await user.type(screen.getByLabelText("Delivery latitude"), "31.5204");
    await user.type(screen.getByLabelText("Delivery longitude"), "74.3587");
    await user.click(
      screen.getByRole("button", { name: "Get delivery quote" }),
    );
    await user.click(
      await screen.findByRole("button", { name: "Place orders" }),
    );
    const firstLink = await screen.findByRole("link", {
      name: "Pay farmer group 1 with Safepay",
    });
    const secondLink = screen.getByRole("link", {
      name: "Pay farmer group 2 with Safepay",
    });
    const firstUrl = new URL(firstLink.getAttribute("href")!);
    const secondUrl = new URL(secondLink.getAttribute("href")!);
    expect(firstUrl.searchParams.get("redirect_url")).toBe(
      "http://checkout.example.test/order/complete",
    );
    expect(firstUrl.searchParams.get("cancel_url")).toBe(
      "http://checkout.example.test/order/cancel",
    );
    let orders = (await buyer.listOrders()).data;
    expect(orders).toHaveLength(2);
    expect(
      orders.every(
        (order) =>
          order.grandTotal ===
            order.totalAmount + order.platformFeeAmount + order.deliveryFee! &&
          order.deliveryFee! > 0 &&
          order.status === "pending",
      ),
    ).toBe(true);
    let payments = (await buyer.listPayments()).data;
    expect(payments).toHaveLength(2);
    await expect(otherBuyer.getPayment(payments[0].id)).rejects.toMatchObject({
      status: 403,
    });
    await expect(
      otherBuyer.initiatePayment(orders[0].id, "safepay"),
    ).rejects.toMatchObject({ status: 403 });
    expect((await otherBuyer.listPayments()).data).toHaveLength(0);

    const port = {
      quoteOrder: buyer.quoteOrder.bind(buyer),
      createOrder: buyer.createOrder.bind(buyer),
      initiatePayment: buyer.initiatePayment.bind(buyer),
      getCurrentBuyer: async () => session.user,
      getProduct: buyer.getProduct.bind(buyer),
      listProducts: buyer.listProducts.bind(buyer),
      listOrders: buyer.listOrders.bind(buyer),
      listPayments: buyer.listPayments.bind(buyer),
      listShipments: async () => [],
      simulatePaymentSuccess: buyer.simulatePaymentSuccess.bind(buyer),
    };
    cleanup();
    render(
      <BuyerApp
        paymentReturn="cancel"
        session={session}
        repository={port}
        onLogout={() => undefined}
      />,
    );
    await screen.findByText(/Checkout was closed/);
    expect(screen.getAllByText("Payment: pending")).toHaveLength(2);
    const firstOrderId = firstUrl.searchParams.get("order_id")!;
    // Both orders remain server-owned and the resume path reuses one of them.
    await user.click(
      screen.getAllByRole("button", { name: "Continue payment" })[0],
    );
    const resumedLink = await screen.findByRole("link", {
      name: "Open Safepay checkout",
    });
    const resumedUrl = new URL(resumedLink.getAttribute("href")!);
    const resumedOrderId = resumedUrl.searchParams.get("order_id")!;
    expect(orders.some((order) => order.id === resumedOrderId)).toBe(true);
    expect((await buyer.listOrders()).data).toHaveLength(2);
    const untouchedUrl = resumedOrderId === firstOrderId ? secondUrl : firstUrl;

    async function callback(url: URL, type: string, valid = true) {
      const data = { tracker: { token: url.searchParams.get("tracker") } };
      const signature = createHmac(
        "sha512",
        process.env.CHECKOUT_TEST_WEBHOOK_SECRET!,
      )
        .update(JSON.stringify(data))
        .digest("hex");
      return fetch(`${baseUrl}/payments/webhook/safepay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-sfpy-signature": valid ? signature : "invalid",
        },
        body: JSON.stringify({ type, data }),
      });
    }
    expect(
      (await callback(resumedUrl, "payment.succeeded", false)).status,
    ).toBe(403);
    expect(
      (await buyer.listPayments()).data.every(
        (payment) => payment.status === "pending",
      ),
    ).toBe(true);
    expect((await callback(resumedUrl, "payment.succeeded")).status).toBe(201);
    expect((await callback(resumedUrl, "payment.succeeded")).status).toBe(201);
    expect((await callback(untouchedUrl, "payment.failed")).status).toBe(201);

    cleanup();
    render(
      <BuyerApp
        paymentReturn="complete"
        session={session}
        repository={port}
        onLogout={() => undefined}
      />,
    );
    expect(await screen.findByText("Payment: success")).toBeVisible();
    expect(screen.getByText("Payment: failed")).toBeVisible();
    // A failed payment can be retried against its existing order.
    await user.click(screen.getByRole("button", { name: "Continue payment" }));
    const retryUrl = new URL(
      (
        await screen.findByRole("link", { name: "Open Safepay checkout" })
      ).getAttribute("href")!,
    );
    expect(retryUrl.searchParams.get("order_id")).toBe(
      untouchedUrl.searchParams.get("order_id"),
    );
    expect((await callback(retryUrl, "payment.succeeded")).status).toBe(201);
    await user.click(
      screen.getByRole("button", { name: "Refresh payment status" }),
    );
    await waitFor(() =>
      expect(screen.getAllByText("Payment: success")).toHaveLength(2),
    );
    payments = (await buyer.listPayments()).data;
    orders = (await buyer.listOrders()).data;
    expect(payments).toHaveLength(2);
    expect(orders).toHaveLength(2);
    expect(payments.every((payment) => payment.status === "success")).toBe(
      true,
    );
    expect(orders.every((order) => order.status === "paid")).toBe(true);
    expect((await buyer.listProducts()).data).toHaveLength(0);
    await expect(
      buyer.simulatePaymentSuccess(payments[0].id),
    ).rejects.toBeInstanceOf(ApiError);
  },
  30_000,
);
