import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import type { ApiOrder } from "@/lib/api/contracts.ts";
import { LanguageProvider } from "../LanguageContext";
import FarmerOrders from "./FarmerOrders";

const order: ApiOrder = {
  id: "order-1",
  buyerId: "buyer-1",
  farmerId: "farmer-1",
  items: [
    {
      productId: "product-1",
      farmerId: "farmer-1",
      productName: "Roma Tomatoes",
      quantity: 2,
      unitPrice: 120,
      subtotal: 240,
    },
  ],
  totalAmount: 240,
  platformFeePercent: 5,
  platformFeeAmount: 12,
  grandTotal: 252,
  shippingAddress: { street: "12 Mall Road", city: "Lahore", province: "Punjab" },
  status: "paid",
  createdAt: "2026-08-17T00:00:00.000Z",
  updatedAt: "2026-08-17T00:00:00.000Z",
};

test("FarmerOrders renders API order facts without completion or rejection controls", () => {
  render(
    <LanguageProvider>
      <FarmerOrders orders={[order]} />
    </LanguageProvider>,
  );

  expect(screen.getByText(/order-1/)).toBeVisible();
  expect(screen.getByText("Roma Tomatoes")).toBeVisible();
  expect(screen.queryByRole("button", { name: "Mark Completed" })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Reject" })).not.toBeInTheDocument();
});
