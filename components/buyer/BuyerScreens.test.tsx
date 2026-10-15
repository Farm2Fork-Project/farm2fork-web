import {
  cleanup,
  render as testingRender,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import type { BuyerSession } from "@/lib/auth/web-session.ts";
import { LanguageProvider } from "../LanguageContext";
import { BuyerApp } from "./BuyerApp";

afterEach(() => {
  cleanup();
  sessionStorage.clear();
});
const render = (ui: React.ReactNode) =>
  testingRender(<LanguageProvider>{ui}</LanguageProvider>);

const session: BuyerSession = {
  user: {
    id: "buyer-1",
    email: "buyer@example.com",
    role: "buyer",
    isVerified: true,
    isActive: true,
  },
};

const product = {
  id: "aaaaaaaaaaaaaaaaaaaaaaaa",
  farmerId: "farmer-1",
  name: "Roma Tomatoes",
  price: 120,
  quantity: 20,
  unit: "kg",
  images: [],
  qualityGrade: "A",
  status: "active",
  farmer: { farmName: "Hassan Farm", city: "Multan", province: "Punjab" },
};

function repo(overrides: Record<string, unknown> = {}) {
  return {
    getCurrentBuyer: vi.fn().mockResolvedValue(session.user),
    listProducts: vi.fn().mockResolvedValue({
      data: [product],
      total: 41,
      page: 1,
      limit: 20,
      totalPages: 3,
    }),
    getProduct: vi.fn(),
    listOrders: vi.fn().mockResolvedValue({ data: [] }),
    listPayments: vi.fn().mockResolvedValue({ data: [] }),
    listShipments: vi.fn().mockResolvedValue([]),
    quoteOrder: vi.fn(),
    createOrder: vi.fn(),
    initiatePayment: vi.fn(),
    simulatePaymentSuccess: vi.fn(),
    ...overrides,
  };
}

test("marketplace filters go to the server and show the true result count", async () => {
  const user = userEvent.setup();
  const repository = repo();
  render(
    <BuyerApp session={session} repository={repository} onLogout={vi.fn()} />,
  );

  expect(await screen.findByText("Showing 1 of 41 listings")).toBeVisible();

  const grade = screen.getByRole("group", { name: "Quality grade" });
  await user.click(within(grade).getByRole("button", { name: "A" }));
  await user.click(screen.getByLabelText(/Verified origin only/));
  await user.type(screen.getByLabelText("Highest price"), "300");
  await user.selectOptions(screen.getByLabelText("Sort by"), "price:asc");

  await waitFor(() =>
    expect(repository.listProducts).toHaveBeenLastCalledWith(
      expect.objectContaining({
        qualityGrade: "A",
        verifiedOrigin: true,
        maxPrice: 300,
        sortBy: "price",
        sortOrder: "asc",
        page: 1,
      }),
    ),
  );

  await user.click(
    screen.getByRole("button", { name: "Remove filter: Grade A" }),
  );
  await waitFor(() =>
    expect(repository.listProducts).toHaveBeenLastCalledWith(
      expect.objectContaining({
        qualityGrade: undefined,
        verifiedOrigin: true,
      }),
    ),
  );
  await user.click(screen.getByRole("button", { name: "Clear all" }));
  await waitFor(() =>
    expect(
      repository.listProducts.mock.lastCall?.[0].verifiedOrigin,
    ).toBeUndefined(),
  );
});

test("opening the cart syncs it with the listings and says what changed", async () => {
  const user = userEvent.setup();
  const gone = { ...product, id: "bbbbbbbbbbbbbbbbbbbbbbbb", name: "Mangoes" };
  const getProduct = vi.fn(async (id: string) => {
    if (id === gone.id) return { ...gone, quantity: 0 };
    return { ...product, price: 150, quantity: 2 };
  });
  render(
    <BuyerApp
      session={session}
      repository={repo({
        listProducts: vi.fn().mockResolvedValue({
          data: [product, gone],
          total: 2,
          page: 1,
          limit: 20,
          totalPages: 1,
        }),
        getProduct,
      })}
      onLogout={vi.fn()}
    />,
  );

  await user.click(
    await screen.findByRole("button", { name: "Add Roma Tomatoes to cart" }),
  );
  await user.click(screen.getByRole("button", { name: "Add Mangoes to cart" }));
  for (let i = 0; i < 4; i++)
    await user.click(
      screen.getByRole("button", { name: "Add Roma Tomatoes to cart" }),
    );
  await user.click(screen.getByRole("button", { name: /cart \(2\)/i }));

  const note = await screen.findByText(
    "Your cart was updated to match the farms.",
  );
  const box = note.closest(".cv-changes") as HTMLElement;
  expect(
    within(box).getByText(
      /Roma Tomatoes: only 2 left, so the quantity went from 5 to 2/,
    ),
  ).toBeVisible();
  expect(
    within(box).getByText(
      /Roma Tomatoes: the price went up from 120 to 150 PKR/,
    ),
  ).toBeVisible();
  expect(within(box).getByText(/Mangoes is sold out/)).toBeVisible();
  expect(screen.getByRole("button", { name: /cart \(1\)/i })).toBeVisible();
  expect(
    screen.getByRole("spinbutton", { name: "Roma Tomatoes quantity" }),
  ).toHaveValue(2);
  expect(screen.getByText("That is all the farm has right now.")).toBeVisible();
});

test("orders show a timeline, the farm, a journey link per item and a filter", async () => {
  const user = userEvent.setup();
  const order = {
    id: "6acf31a55ab403729542ef2c",
    farmerId: "farmer-1",
    status: "shipped",
    canCancel: false,
    items: [
      {
        productId: "aaaaaaaaaaaaaaaaaaaaaaaa",
        productName: "Roma Tomatoes",
        quantity: 2,
        subtotal: 240,
      },
    ],
    totalAmount: 240,
    platformFeeAmount: 12,
    deliveryFee: 80,
    deliveryDistanceKm: 14,
    grandTotal: 332,
    shippingAddress: {
      street: "1 Mall Road",
      city: "Lahore",
      province: "Punjab",
    },
    createdAt: "2026-10-01T08:00:00.000Z",
    updatedAt: "2026-10-01T08:00:00.000Z",
  };
  const cancelled = {
    ...order,
    id: "6acf31a55ab403729542ef99",
    status: "cancelled",
    createdAt: "2026-09-01T08:00:00.000Z",
  };
  render(
    <BuyerApp
      session={session}
      farmRepository={{
        getFarmProfile: vi.fn().mockResolvedValue({
          farmerId: "farmer-1",
          farmName: "Hassan Farm",
          city: "Multan",
          province: "Punjab",
          cropTypes: [],
          certifications: [],
          memberSince: "2026-01-01",
          stats: { activeListings: 1, completedOrders: 0 },
        }),
      }}
      repository={repo({
        listOrders: vi.fn().mockResolvedValue({ data: [cancelled, order] }),
        listPayments: vi.fn().mockResolvedValue({
          data: [
            {
              id: "pay-1",
              orderId: order.id,
              status: "success",
              gateway: "safepay",
              paidAt: "2026-10-01T09:00:00.000Z",
            },
          ],
        }),
        listShipments: vi.fn().mockResolvedValue([
          {
            id: "s1",
            orderId: order.id,
            status: "picked_up",
            statusHistory: [
              { status: "picked_up", timestamp: "2026-10-02T07:00:00.000Z" },
            ],
          },
        ]),
      })}
      onLogout={vi.fn()}
    />,
  );

  await user.click(await screen.findByRole("button", { name: "Orders" }));

  const cards = await screen.findAllByRole("article");
  // Newest first: the shipped order precedes the cancelled one.
  expect(within(cards[0]).getByText("Order #42EF2C")).toBeVisible();
  const timeline = within(cards[0]).getByRole("list", {
    name: "Order progress",
  });
  expect(within(timeline).getByText("Picked up from the farm")).toBeVisible();
  expect(
    within(timeline).getByText("Picked up from the farm").closest("li"),
  ).toHaveAttribute("data-state", "done");
  expect(
    within(timeline).getByText("On the way").closest("li"),
  ).toHaveAttribute("data-state", "current");
  expect(within(cards[0]).getByText("Paid")).toBeVisible();
  expect(await within(cards[0]).findByText("Hassan Farm")).toBeVisible();
  expect(
    within(cards[0]).getByRole("link", {
      name: "See the journey of Roma Tomatoes",
    }),
  ).toHaveAttribute("href", "/trace/aaaaaaaaaaaaaaaaaaaaaaaa");
  expect(within(cards[0]).getByText("Delivery (14 km)")).toBeVisible();

  const filters = screen.getByRole("group", { name: "Filter orders" });
  await user.click(within(filters).getByRole("button", { name: /Cancelled/ }));
  expect(screen.getAllByRole("article")).toHaveLength(1);
  expect(screen.getByText("Order #42EF99")).toBeVisible();
});
