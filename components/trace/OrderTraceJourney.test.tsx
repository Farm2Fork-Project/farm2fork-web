import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import OrderTraceJourney from "./OrderTraceJourney";
vi.mock("../LanguageContext", () => ({
  useLanguage: () => ({ language: "en", t: (key: string) => key }),
}));
afterEach(cleanup);
it("shows only public snapshot and explains unavailable independent readback", () => {
  render(
    <OrderTraceJourney
      trace={{
        order: {
          id: "6a2fe77bb77795516febc287",
          reference: "ORDER-123",
          status: "paid",
          paidAt: "2026-10-28T10:00:00Z",
          items: [
            {
              productId: "product",
              productName: "Rice",
              quantity: 2,
              unit: "kg",
            },
          ],
        },
        farmer: { farmName: "Green Farm", city: "Lahore" },
        events: [],
        summary: {
          totalEvents: 1,
          confirmedEvents: 1,
          originVerified: false,
          ledgerCheck: "unavailable",
        },
      }}
    />,
  );
  expect(
    screen.getByText(/Independent ledger readback is unavailable/),
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Rice" })).toHaveAttribute(
    "href",
    "/trace/product",
  );
  expect(
    screen.getByRole("link", { name: "Private order details" }),
  ).toHaveAttribute("href", "/login?next=%2Forders%2F6a2fe77bb77795516febc287");
  expect(screen.queryByText(/PKR/)).toBeNull();
});
