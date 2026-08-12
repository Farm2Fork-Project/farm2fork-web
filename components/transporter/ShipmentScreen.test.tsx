import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import type { ApiShipment } from "@/lib/api/contracts.ts";
import { LanguageProvider } from "./LanguageContext";
import ShipmentScreen from "./ShipmentScreen";

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
