import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import type { BuyerProduct } from "@/lib/api/contracts.ts";
import type { FarmProfile } from "@/lib/farm/farm-repository.ts";
import type { ProductTrace } from "@/lib/trace/trace-repository.ts";
import { LanguageProvider } from "../LanguageContext";
import { ProductDetail } from "./ProductDetail";

beforeEach(() => {
  window.scrollTo = vi.fn();
});
afterEach(cleanup);

const farmer = {
  farmName: "Green Valley Farm",
  city: "Multan",
  province: "Punjab",
};

function product(overrides: Partial<BuyerProduct> = {}): BuyerProduct {
  return {
    id: "p1",
    farmerId: "f1",
    name: "Chaunsa Mangoes",
    category: "fruits",
    description: "Tree-ripened and picked this week.",
    price: 320,
    quantity: 40,
    unit: "kg",
    images: [],
    qualityGrade: "A",
    status: "active",
    createdAt: "2026-08-11T11:00:00.000Z",
    farmer,
    ...overrides,
  };
}

const trace: ProductTrace = {
  product: {
    id: "p1",
    name: "Chaunsa Mangoes",
    category: "fruits",
    unit: "kg",
    qualityGrade: "A",
    status: "active",
    listedAt: "2026-08-11T11:00:00.000Z",
  },
  farmer,
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
        onChain: "verified",
      },
    },
  ],
  summary: { totalEvents: 1, confirmedEvents: 1, originVerified: true },
};

const profile: FarmProfile = {
  farmerId: "f1",
  farmName: "Green Valley Farm",
  ownerName: "Ahmed Raza",
  city: "Multan",
  province: "Punjab",
  cropTypes: ["mango", "wheat"],
  landSizeAcres: 12,
  certifications: [
    {
      name: "GlobalG.A.P.",
      issuedBy: "PSA",
      expired: false,
      expiryDate: "2999-01-01T00:00:00.000Z",
    },
  ],
  memberSince: "2026-01-02T00:00:00.000Z",
  stats: { activeListings: 3, completedOrders: 5 },
};

function setup(
  overrides: {
    product?: BuyerProduct;
    inCart?: number;
    trace?: () => Promise<ProductTrace>;
    farm?: () => Promise<FarmProfile>;
    listProducts?: ReturnType<typeof vi.fn>;
  } = {},
) {
  const onAddToCart = vi.fn();
  const listProducts =
    overrides.listProducts ??
    vi.fn(async (query: { farmerId?: string; category?: string }) => ({
      data: query.farmerId
        ? [
            product(),
            product({ id: "p2", name: "Sindhri Mangoes", price: 280 }),
          ]
        : [
            product({
              id: "p3",
              farmerId: "f2",
              name: "Anwar Ratol",
              farmer: { farmName: "Indus Orchard" },
            }),
          ],
      total: 2,
      page: 1,
      limit: 12,
      totalPages: 1,
    }));
  render(
    <LanguageProvider>
      <ProductDetail
        product={overrides.product ?? product()}
        inCart={overrides.inCart ?? 0}
        repository={{ listProducts } as never}
        traceRepository={{
          getProductTrace: overrides.trace ?? (async () => trace),
        }}
        farmRepository={{
          getFarmProfile: overrides.farm ?? (async () => profile),
        }}
        onAddToCart={onAddToCart}
        onBack={vi.fn()}
        onViewCart={vi.fn()}
      />
    </LanguageProvider>,
  );
  return { onAddToCart, listProducts };
}

test("shows the ledger journey and the farm without leaving the page", async () => {
  setup();

  expect(
    screen.getByRole("heading", { name: "Chaunsa Mangoes", level: 1 }),
  ).toBeVisible();
  expect(
    await screen.findAllByText("Origin verified on ledger"),
  ).not.toHaveLength(0);
  expect(await screen.findByText("Listed on marketplace")).toBeVisible();
  expect(screen.getByText("1 of 1 recorded on ledger")).toBeVisible();

  const farm = await screen.findByRole("region", { name: "Green Valley Farm" });
  expect(within(farm).getByText("Grown by Ahmed Raza")).toBeVisible();
  expect(within(farm).getByText("mango")).toBeVisible();
  expect(within(farm).getByText("GlobalG.A.P.")).toBeVisible();
  expect(within(farm).getByText("Orders delivered")).toBeVisible();
});

test("offers other produce from the same farm and similar produce from other farms", async () => {
  setup();

  const sameFarm = await screen.findByRole("region", {
    name: "More from Green Valley Farm",
  });
  expect(within(sameFarm).getByText("Sindhri Mangoes")).toBeVisible();
  // The product being viewed is never offered as "more".
  expect(within(sameFarm).queryByText("Chaunsa Mangoes")).toBeNull();

  const similar = await screen.findByRole("region", {
    name: "More Fruits from other farms",
  });
  // Cards are real links, so they open in a new tab and survive a refresh.
  expect(
    within(similar).getByRole("link", { name: "View Anwar Ratol" }),
  ).toHaveAttribute("href", "/product/anwar-ratol-p3");
});

test("adds the chosen quantity and never more than the stock left", async () => {
  const { onAddToCart } = setup({
    product: product({ quantity: 3 }),
    inCart: 1,
  });

  const increase = screen.getByRole("button", { name: "Increase quantity" });
  await userEvent.click(increase);
  expect(screen.getByRole("textbox", { name: "Quantity" })).toHaveValue("2");
  // 3 in stock, 1 already in the cart: 2 is the most that can still be added.
  expect(increase).toBeDisabled();

  await userEvent.click(
    screen.getAllByRole("button", { name: "Add to cart" })[0],
  );
  expect(onAddToCart).toHaveBeenCalledWith(
    expect.objectContaining({ id: "p1" }),
    2,
  );
  expect(await screen.findByText(/Added 2 kg to your cart/)).toBeVisible();
});

test("a failed journey or farm lookup degrades without hiding the product", async () => {
  setup({
    trace: () => Promise.reject(new Error("offline")),
    farm: () => Promise.reject(new Error("offline")),
    listProducts: vi.fn().mockRejectedValue(new Error("offline")),
  });

  expect(
    await screen.findByText("We couldn't load this journey."),
  ).toBeVisible();
  expect(
    await screen.findByText(/More about this farm isn't available right now/),
  ).toBeVisible();
  // What the listing itself carries is still shown.
  expect(screen.getAllByText(/Green Valley Farm/).length).toBeGreaterThan(0);
  expect(
    screen.getAllByRole("button", { name: "Add to cart" })[0],
  ).toBeEnabled();
  expect(screen.queryByText(/^More from/)).toBeNull();
});

test("a sold-out product cannot be added", async () => {
  setup({ product: product({ quantity: 0, status: "sold_out" }) });
  expect(
    screen.getAllByRole("button", { name: "Add to cart" })[0],
  ).toBeDisabled();
  expect(screen.getAllByText("Not available right now").length).toBeGreaterThan(
    0,
  );
});
