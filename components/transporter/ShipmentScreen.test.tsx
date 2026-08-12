import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import { ApiError, type ApiShipment } from "@/lib/api/contracts.ts";
import { LanguageProvider } from "./LanguageContext";
import ShipmentScreen from "./ShipmentScreen";

afterEach(cleanup);

const claimedShipment: ApiShipment = {
  id: "shipment-1",
  orderId: "order-1",
  transporterId: "transporter-1",
  status: "assigned",
  pickupAddress: { street: "Farm Road 1", city: "Multan", province: "Punjab" },
  deliveryAddress: { street: "Mall Road 2", city: "Lahore", province: "Punjab" },
  statusHistory: [],
  createdAt: "2026-08-12T00:00:00.000Z",
  updatedAt: "2026-08-12T00:00:00.000Z",
};

test("ShipmentScreen reveals only redacted delivery details until a transporter claims it", async () => {
  const claim = vi.fn().mockResolvedValue(claimedShipment);

  render(
    <LanguageProvider>
      <ShipmentScreen
        repository={{
          listAvailable: vi.fn().mockResolvedValue([
            {
              orderId: "order-1",
              pickupCity: "Multan",
              pickupProvince: "Punjab",
              deliveryCity: "Lahore",
              deliveryProvince: "Punjab",
              itemCount: 3,
              createdAt: "2026-08-12T00:00:00.000Z",
            },
          ]),
          listShipments: vi.fn().mockResolvedValue([]),
          claim,
          updateStatus: vi.fn(),
        }}
      />
    </LanguageProvider>,
  );

  expect(await screen.findByText("Multan, Punjab → Lahore, Punjab")).toBeVisible();
  expect(screen.queryByText(/Farm Road 1/)).not.toBeInTheDocument();

  await userEvent.click(screen.getByRole("button", { name: "Claim delivery" }));

  expect(claim).toHaveBeenCalledWith("order-1");
  expect(await screen.findByText("Farm Road 1, Multan, Punjab")).toBeVisible();
});

test("ShipmentScreen requires a note and renders the persisted next shipment status", async () => {
  const updateStatus = vi.fn().mockResolvedValue({
    ...claimedShipment,
    status: "picked_up",
    statusHistory: [
      {
        status: "picked_up",
        timestamp: "2026-08-12T01:00:00.000Z",
        note: "Collected at farm gate",
      },
    ],
  });

  render(
    <LanguageProvider>
      <ShipmentScreen
        repository={{
          listAvailable: vi.fn().mockResolvedValue([]),
          listShipments: vi.fn().mockResolvedValue([claimedShipment]),
          claim: vi.fn(),
          updateStatus,
        }}
      />
    </LanguageProvider>,
  );

  await userEvent.click(await screen.findByRole("button", { name: "My shipments" }));
  const pickup = await screen.findByRole("button", { name: "Confirm Pick Up" });
  expect(pickup).toBeDisabled();

  await userEvent.type(screen.getByLabelText("Delivery note"), "Collected at farm gate");
  await userEvent.click(pickup);

  expect(updateStatus).toHaveBeenCalledWith("shipment-1", {
    status: "picked_up",
    note: "Collected at farm gate",
  });
  expect(await screen.findByText("Picked up")).toBeVisible();
  expect(screen.getByText(/Collected at farm gate/)).toBeVisible();
});

test("ShipmentScreen refreshes availability after a claim conflict without adding a shipment", async () => {
  const listAvailable = vi
    .fn()
    .mockResolvedValueOnce([
      {
        orderId: "order-1",
        pickupCity: "Multan",
        pickupProvince: "Punjab",
        deliveryCity: "Lahore",
        deliveryProvince: "Punjab",
        itemCount: 3,
        createdAt: "2026-08-12T00:00:00.000Z",
      },
    ])
    .mockResolvedValueOnce([]);

  render(
    <LanguageProvider>
      <ShipmentScreen
        repository={{
          listAvailable,
          listShipments: vi.fn().mockResolvedValue([]),
          claim: vi.fn().mockRejectedValue(new ApiError(409, "Delivery is no longer available")),
          updateStatus: vi.fn(),
        }}
      />
    </LanguageProvider>,
  );

  await userEvent.click(await screen.findByRole("button", { name: "Claim delivery" }));

  expect(await screen.findByRole("alert")).toHaveTextContent("Delivery is no longer available");
  await waitFor(() => expect(listAvailable).toHaveBeenCalledTimes(2));
  expect(screen.queryByText("Farm Road 1, Multan, Punjab")).not.toBeInTheDocument();
});

test("ShipmentScreen preserves note and status after a rejected delivery update", async () => {
  render(
    <LanguageProvider>
      <ShipmentScreen
        repository={{
          listAvailable: vi.fn().mockResolvedValue([]),
          listShipments: vi.fn().mockResolvedValue([{ ...claimedShipment, status: "in_transit" }]),
          claim: vi.fn(),
          updateStatus: vi.fn().mockRejectedValue(new Error("Invalid status transition")),
        }}
      />
    </LanguageProvider>,
  );

  await userEvent.click(await screen.findByRole("button", { name: "My shipments" }));
  await userEvent.type(await screen.findByLabelText("Delivery note"), "Reached customer address");
  await userEvent.click(screen.getByRole("button", { name: "Mark Delivered" }));

  expect(await screen.findByRole("alert")).toHaveTextContent("Invalid status transition");
  expect(screen.getByDisplayValue("Reached customer address")).toBeVisible();
  expect(screen.getByText("In transit")).toBeVisible();
});
