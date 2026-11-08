import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import type { ApiShipment } from "@/lib/api/contracts.ts";
import { LanguageProvider } from "../LanguageContext";
import { DeliveryTracking } from "./DeliveryTracking";

afterEach(cleanup);

const NOW = Date.parse("2026-10-22T12:00:00Z");

const shipment = (overrides: Partial<ApiShipment> = {}): ApiShipment => ({
  id: "s1",
  orderId: "o1",
  transporterId: "t1",
  status: "in_transit",
  pickupAddress: { street: "Green Farm", city: "Faisalabad", lat: 31.41, lng: 73.08 },
  deliveryAddress: { street: "Market Road", city: "Lahore", lat: 31.52, lng: 74.35 },
  statusHistory: [],
  createdAt: "2026-10-22T09:00:00Z",
  updatedAt: "2026-10-22T11:00:00Z",
  ...overrides,
});

function renderTracking(props: Parameters<typeof DeliveryTracking>[0]) {
  return render(
    <LanguageProvider>
      <DeliveryTracking {...props} now={NOW} />
    </LanguageProvider>,
  );
}

test("buyer follows the transporter towards their drop-off", () => {
  renderTracking({
    orderStatus: "shipped",
    liveMapFor: "buyer",
    shipment: shipment({
      transporterLocation: { lat: 31.45, lng: 74.0, at: "2026-10-22T11:54:00Z" },
    }),
  });
  expect(screen.getByRole("region", { name: "Live delivery map" })).toBeInTheDocument();
  expect(screen.getByText("Your drop-off")).toBeInTheDocument();
  expect(screen.getByText("Transporter")).toBeInTheDocument();
  expect(screen.queryByText("Your farm")).toBeNull();
  expect(screen.getByText("Transporter position updated 6 min ago.")).toBeInTheDocument();
  // No Maps key in tests: places stay reachable through Google Maps links.
  const links = screen.getAllByRole("link", { name: "Open in Google Maps" });
  expect(links[0].getAttribute("href")).toContain("query=31.52,74.35");
});

test("buyer waits for a position without one being invented", () => {
  renderTracking({ orderStatus: "shipped", liveMapFor: "buyer", shipment: shipment() });
  expect(screen.getByText(/appears here while their app is open/)).toBeInTheDocument();
  expect(screen.queryByText("Transporter")).toBeNull();
});

test("farmer sees the transporter heading to the farm only before pickup", () => {
  const { rerender } = renderTracking({
    orderStatus: "paid",
    liveMapFor: "farmer",
    shipment: shipment({
      status: "assigned",
      transporterLocation: { lat: 31.3, lng: 73.0, at: "2026-10-22T12:00:00Z" },
    }),
  });
  expect(screen.getByText("Your farm")).toBeInTheDocument();
  expect(screen.getByText("Transporter position updated just now.")).toBeInTheDocument();

  rerender(
    <LanguageProvider>
      <DeliveryTracking orderStatus="shipped" liveMapFor="farmer" now={NOW} shipment={shipment()} />
    </LanguageProvider>,
  );
  expect(screen.queryByRole("region", { name: "Live delivery map" })).toBeNull();
});

test("no live map without a viewer or after delivery", () => {
  renderTracking({ orderStatus: "shipped", shipment: shipment() });
  expect(screen.queryByRole("region", { name: "Live delivery map" })).toBeNull();
  cleanup();
  renderTracking({ orderStatus: "delivered", liveMapFor: "buyer", shipment: shipment({ status: "delivered" }) });
  expect(screen.queryByRole("region", { name: "Live delivery map" })).toBeNull();
});
