import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import type { ProductTrace } from "@/lib/trace/trace-repository.ts";
import { LanguageProvider } from "../LanguageContext";
import TraceJourney from "./TraceJourney";

afterEach(cleanup);

function trace(overrides: Partial<ProductTrace> = {}): ProductTrace {
  return {
    product: {
      id: "6a2fe77bb77795516febc287",
      name: "Chaunsa Mangoes",
      category: "fruits",
      unit: "kg",
      qualityGrade: "A",
      status: "active",
      listedAt: "2026-08-11T11:00:00.000Z",
    },
    farmer: { farmName: "Green Valley Farm", city: "Multan", province: "Punjab" },
    events: [
      {
        id: "e1",
        type: "listed",
        occurredAt: "2026-08-11T11:00:00.000Z",
        location: "Multan, Punjab",
        ledger: {
          status: "confirmed",
          txHash: "4f1c9a0e7b2d4c8f9a1b3c5d7e9f0a2b4c6d8e0f",
          blockNumber: 7,
        },
      },
      {
        id: "e2",
        type: "shipment_in_transit",
        occurredAt: "2026-08-12T09:00:00.000Z",
        location: "Lahore, Punjab",
        reference: "C287A1",
        ledger: { status: "pending" },
      },
    ],
    summary: { totalEvents: 2, confirmedEvents: 1, originVerified: true },
    ...overrides,
  };
}

function renderTrace(value: ProductTrace) {
  render(
    <LanguageProvider>
      <TraceJourney trace={value} />
    </LanguageProvider>,
  );
}

test("shows the farm, a verified origin and each event's own ledger state", async () => {
  renderTrace(trace());

  expect(await screen.findByText("Origin verified on ledger")).toBeTruthy();
  expect(screen.getByText("Green Valley Farm")).toBeTruthy();
  expect(screen.getByText("1 of 2 recorded on ledger")).toBeTruthy();

  const [listed, inTransit] = screen.getAllByRole("listitem");
  expect(within(listed).getByText("Recorded on ledger")).toBeTruthy();
  expect(within(listed).getByText("4f1c9a0e7b…4c6d8e0f")).toBeTruthy();
  expect(within(listed).getByText("Block 7")).toBeTruthy();
  expect(within(inTransit).getByText("Awaiting ledger confirmation")).toBeTruthy();
  expect(within(inTransit).queryByText("Recorded on ledger")).toBeNull();
  expect(within(inTransit).getByText("Delivery #C287A1")).toBeTruthy();
});

test("never claims verification while the origin is only queued", async () => {
  const pending = trace({
    events: [
      {
        id: "e1",
        type: "listed",
        occurredAt: "2026-08-11T11:00:00.000Z",
        location: "Multan, Punjab",
        ledger: { status: "pending" },
      },
    ],
    summary: { totalEvents: 1, confirmedEvents: 0, originVerified: false },
  });
  renderTrace(pending);

  expect(await screen.findByText("Origin awaiting ledger confirmation")).toBeTruthy();
  expect(screen.queryByText("Origin verified on ledger")).toBeNull();
  expect(screen.queryByText("Recorded on ledger")).toBeNull();
});

test("is honest about legacy listings with no ledger record and no farm details", async () => {
  renderTrace(
    trace({
      farmer: null,
      events: [],
      summary: { totalEvents: 0, confirmedEvents: 0, originVerified: false },
    }),
  );

  expect(await screen.findByText("No ledger record for this listing")).toBeTruthy();
  expect(screen.getByText("Farm details not provided")).toBeTruthy();
  expect(
    screen.getByText(
      "Only the listing so far. Sales and deliveries will appear here as they happen.",
    ),
  ).toBeTruthy();
});
