import { DeliveryRepository } from '../lib/delivery/delivery-repository';
// Runs only via backend scripts/test/web-checkout-e2e.ts.
// The fixture uses test JWT identities and local Safepay API responses.
import { createHmac } from "node:crypto";
import {
  cleanup,
  render as testingRender,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import { ApiClient } from "../lib/api/client.ts";
import { BuyerRepository } from "../lib/buyer/buyer-repository.ts";
import { FarmerRepository } from "../lib/farmer/farmer-repository.ts";
import { ShipmentRepository } from "../lib/shipment/shipment-repository.ts";
import ShipmentScreen from "../components/transporter/ShipmentScreen";
import { LanguageProvider } from "../components/LanguageContext";
import { ApiError } from "../lib/api/contracts.ts";
import { CheckoutPanel } from "../components/buyer/CheckoutPanel";
import { BuyerApp } from "../components/buyer/BuyerApp";
import type { BuyerSession } from "../lib/auth/web-session.ts";

const baseUrl = process.env.CHECKOUT_TEST_API;
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
const render = (ui: React.ReactNode) =>
  testingRender(<LanguageProvider>{ui}</LanguageProvider>);

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
      province: "Punjab" as const,
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
    await user.selectOptions(screen.getByLabelText("Province"), "Punjab");
    vi.stubGlobal("navigator", {
      ...navigator,
      geolocation: {
        getCurrentPosition: (ok: PositionCallback) =>
          ok({
            coords: { latitude: 31.5204, longitude: 74.3587 },
          } as GeolocationPosition),
      },
    });
    await user.click(
      screen.getByRole("button", { name: /Use my current location/ }),
    );
    const placeOrders = screen.getByRole("button", {
      name: /^Place \d+ orders/,
    });
    await waitFor(() => expect(placeOrders).toBeEnabled());
    await user.click(placeOrders);
    const [firstLink, secondLink] = await screen.findAllByRole("link", {
      name: /^Pay/,
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
      listShipments: () =>
        new ShipmentRepository({
          client: client(process.env.CHECKOUT_TEST_BUYER_TOKEN!),
        }).listShipments(),
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
    expect(await screen.findAllByText("Awaiting payment")).toHaveLength(2);
    // Checkout URLs carry only the tracker; the gateway fixture maps it back to its order.
    const orderIdOf = async (url: URL) =>
      (
        (await (
          await fetch(`${process.env.CHECKOUT_TEST_GATEWAY}/__trackers`)
        ).json()) as Record<string, string>
      )[url.searchParams.get("tracker")!];
    const firstOrderId = await orderIdOf(firstUrl);
    // Both orders remain server-owned and the resume path reuses one of them.
    await user.click(
      screen.getAllByRole("button", { name: "Continue payment" })[0],
    );
    const resumedLink = await screen.findByRole("link", {
      name: "Open Safepay checkout",
    });
    const resumedUrl = new URL(resumedLink.getAttribute("href")!);
    const resumedOrderId = await orderIdOf(resumedUrl);
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
    await waitFor(() => expect(document.querySelectorAll('.order-payment[data-status="success"]')).toHaveLength(1));
    expect(await screen.findByText('Payment failed')).toBeVisible();
    // A failed payment can be retried against its existing order.
    await user.click(screen.getByRole("button", { name: "Continue payment" }));
    const retryUrl = new URL(
      (
        await screen.findByRole("link", { name: "Open Safepay checkout" })
      ).getAttribute("href")!,
    );
    expect(await orderIdOf(retryUrl)).toBe(await orderIdOf(untouchedUrl));
    expect((await callback(retryUrl, "payment.succeeded")).status).toBe(201);
    await user.click(
      screen.getByRole("button", { name: "Refresh payment status" }),
    );
    await waitFor(() =>
      expect(document.querySelectorAll('.order-payment[data-status="success"]')).toHaveLength(2),
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
    if (process.env.CHECKOUT_TEST_DELIVERY === "true") {
      const transport = new ShipmentRepository({
        client: client(process.env.CHECKOUT_TEST_TRANSPORTER_TOKEN!),
      });
      const competitor = new ShipmentRepository({
        client: client(process.env.CHECKOUT_TEST_SECOND_TRANSPORTER_TOKEN!),
      });
      expect((await transport.getTransporterStatus()).online).toBe(false);
      expect(await transport.listAvailable()).toHaveLength(0);
      await expect(
        new ShipmentRepository({
          client: client(process.env.CHECKOUT_TEST_BUYER_TOKEN!),
        }).setAvailability(true, { lat: 31.52, lng: 74.35 }),
      ).rejects.toMatchObject({ status: 403 });
      await expect(
        transport.setAvailability(true, { lat: 0, lng: 74.35 }),
      ).rejects.toMatchObject({ status: 400 });
      await competitor.setAvailability(true, { lat: 31.52, lng: 74.35 });
      const declined = (await competitor.listAvailable())[0];
      await competitor.decline(declined.orderId);
      expect(
        (await competitor.listAvailable()).some(
          (o) => o.orderId === declined.orderId,
        ),
      ).toBe(false);
      cleanup();
      render(
        <LanguageProvider>
          <ShipmentScreen repository={transport} handoverRepository={new DeliveryRepository(client(process.env.CHECKOUT_TEST_TRANSPORTER_TOKEN!))} />
        </LanguageProvider>,
      );
      await screen.findByText("Offline");
      await user.type(screen.getByLabelText("Current latitude"), "31.52");
      await user.type(screen.getByLabelText("Current longitude"), "74.35");
      await user.click(screen.getByRole("button", { name: "Go online" }));
      await screen.findByText("Online");
      await waitFor(() =>
        expect(
          screen.getAllByRole("button", { name: "Claim delivery" }),
        ).toHaveLength(2),
      );
      expect(screen.queryByText(/12 Mall Road/)).not.toBeInTheDocument();
      expect(screen.getAllByText(/Delivery earning/)).toHaveLength(2);
      await user.click(
        screen.getByRole("button", { name: "Share current location" }),
      );
      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: "Share current location" }),
        ).toBeEnabled(),
      );
      for (let i = 0; i < 2; i++) {
        if (i > 0)
          await user.click(
            screen.getByRole("button", { name: "Available deliveries" }),
          );
        await user.click(
          (await screen.findAllByRole("button", { name: "Claim delivery" }))[0],
        );
        await screen.findByRole("button", { name: "Confirm Pick Up" });
        const active = (await transport.getTransporterStatus())
          .activeShipmentId!;
        const shipment = (await transport.listShipments()).find(
          (s) => s.id === active,
        )!;
        await expect(competitor.claim(shipment.orderId)).rejects.toMatchObject({
          status: 409,
        });
        await expect(
          competitor.updateStatus(active, {
            status: "picked_up",
            note: "wrong owner",
          }),
        ).rejects.toMatchObject({ status: 403 });
        expect(await transport.listAvailable()).toHaveLength(0);
        await expect(
          transport.updateStatus(active, {
            status: "delivered",
            note: "skip pickup",
          }),
        ).rejects.toMatchObject({ status: 400 });
        for (const action of [
          "Confirm Pick Up",
          "Start Transit",
        ]) {
          await waitFor(() =>
            expect(screen.getByLabelText("Delivery note")).not.toHaveAttribute(
              "disabled",
            ),
          );
          await user.clear(screen.getByLabelText("Delivery note"));
          await user.type(
            screen.getByLabelText("Delivery note"),
            `Fixture ${action}`,
          );
          await user.click(screen.getByRole("button", { name: action }));
          await waitFor(() =>
            expect(
              screen.queryByRole("button", { name: action }),
            ).not.toBeInTheDocument(),
          );
        }
        const { code } = await new DeliveryRepository(client(process.env.CHECKOUT_TEST_BUYER_TOKEN!)).code(active);
        await user.type(await screen.findByLabelText('Buyer delivery code'), code);
        await user.click(screen.getByRole('button', {name: 'Verify code and complete delivery'}));
        await waitFor(async () => {
          expect(
            (await transport.getTransporterStatus()).activeShipmentId,
          ).toBeUndefined();
        });
      }
      await user.click(screen.getByRole("button", { name: "Go offline" }));
      await screen.findByText("Offline");
      const buyerShipments = await new ShipmentRepository({
        client: client(process.env.CHECKOUT_TEST_BUYER_TOKEN!),
      }).listShipments();
      expect(buyerShipments).toHaveLength(2);
      expect(
        buyerShipments.every(
          (s) => s.status === "delivered" && s.statusHistory.length === 4,
        ),
      ).toBe(true);
      expect(
        await new ShipmentRepository({
          client: client(process.env.CHECKOUT_TEST_FARMER_TOKEN!),
        }).listShipments(),
      ).toHaveLength(1);
      expect(
        (await buyer.listOrders()).data.every((o) => o.status === "delivered"),
      ).toBe(true);
      cleanup();
      render(
        <BuyerApp
          paymentReturn="complete"
          session={session}
          repository={port}
          onLogout={() => undefined}
        />,
      );
      await waitFor(() =>
        expect(screen.getAllByText("Shipment: Delivered")).toHaveLength(2),
      );
    }
  },
  30_000,
);
