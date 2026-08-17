# Marketplace Simulator Lifecycle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect the local payment simulator to a full buyer-to-transporter marketplace lifecycle.

**Architecture:** NestJS remains the sole lifecycle authority. Web mutations use the existing HTTP-only session API and re-fetch orders, payments, and shipments. Farmer and transporter seeded order data is removed; `ShipmentScreen` remains the delivery-transition authority.

**Tech Stack:** Next.js, React, TypeScript, Vitest, NestJS, MongoDB transactions, Docker Compose, Firebase HTTP-only sessions.

## Global Constraints

- Keep `ApiClient` cookie credentials and CSRF behavior; do not add browser bearer tokens.
- Use the exact label `Simulate payment success`; never present it as a real payment.
- Do not add Cloudinary, Firebase Storage, media uploads, or media secrets.
- Preserve one-farmer-per-order grouping and backend-owned statuses.
- Only an assigned transporter updates shipment state; farmer views are read-only.
- Make small local commits. Do not push or stage unrelated backend WIP.

### Task 1: Add the typed settlement adapter

**Files:** Modify `lib/buyer/buyer-repository.ts`; modify `lib/buyer/buyer-repository.test.ts`.

**Interface:** `simulatePaymentSuccess(paymentId: string): Promise<ApiPayment>` sends `POST /payments/:id/simulate` with `{ status: "success" }`.

- [ ] **Step 1: Write the failing test**

```ts
test("settles a pending payment through the local simulator", async () => {
  const calls: Array<{ path: string; options?: unknown }> = [];
  const repository = new BuyerRepository({ client: {
    request: async (path, options) => {
      calls.push({ path, options });
      return { id: "payment-1", status: "success" };
    },
  } });
  await repository.simulatePaymentSuccess("payment-1");
  expect(calls).toEqual([{
    path: "/payments/payment-1/simulate",
    options: { method: "POST", body: { status: "success" } },
  }]);
});
```

- [ ] **Step 2: Run it and verify failure**

Run: `CI=true pnpm vitest run lib/buyer/buyer-repository.test.ts`

Expected: FAIL because `simulatePaymentSuccess` is missing.

- [ ] **Step 3: Implement the minimal adapter**

```ts
simulatePaymentSuccess(paymentId: string): Promise<ApiPayment> {
  return this.client.request<ApiPayment>(`/payments/${paymentId}/simulate`, {
    method: "POST",
    body: { status: "success" },
  });
}
```

- [ ] **Step 4: Verify and commit**

Run: `CI=true pnpm vitest run lib/buyer/buyer-repository.test.ts`

Commit: `git add lib/buyer/buyer-repository.ts lib/buyer/buyer-repository.test.ts && git commit -m "feat(payments): add local settlement adapter"`

### Task 2: Settle and refresh buyer Orders

**Files:** Modify `components/buyer/BuyerApp.tsx`; modify `components/buyer/BuyerApp.test.tsx`.

**Consumes:** Task 1. **Produces:** A single `refreshOrders()` path and an enabled-only-for-pending settlement action.

- [ ] **Step 1: Write the failing tests**

```tsx
test("settles a pending payment and refreshes its timeline", async () => {
  const simulatePaymentSuccess = vi.fn().mockResolvedValue({ id: "pay-1", status: "success" });
  render(<BuyerApp repository={buyerRepository({ simulatePaymentSuccess })} session={buyerSession} onLogout={vi.fn()} />);
  await userEvent.click(await screen.findByRole("button", { name: "Orders" }));
  await userEvent.click(await screen.findByRole("button", { name: "Simulate payment success" }));
  expect(simulatePaymentSuccess).toHaveBeenCalledWith("pay-1");
  expect(await screen.findByText("Payment: success")).toBeInTheDocument();
});

test("disables settlement while the request is pending", async () => {
  const simulatePaymentSuccess = vi.fn(() => new Promise<ApiPayment>(() => undefined));
  render(<BuyerApp repository={buyerRepository({ simulatePaymentSuccess })} session={buyerSession} onLogout={vi.fn()} />);
  await userEvent.click(await screen.findByRole("button", { name: "Orders" }));
  const button = await screen.findByRole("button", { name: "Simulate payment success" });
  await userEvent.click(button);
  expect(button).toBeDisabled();
});
```

- [ ] **Step 2: Run and verify failure**

Run: `CI=true pnpm vitest run components/buyer/BuyerApp.test.tsx`

Expected: FAIL because settlement is not in the repository port or Orders UI.

- [ ] **Step 3: Implement one authoritative refresh path**

```tsx
const refreshOrders = useCallback(async () => {
  const [ordersResponse, paymentsResponse, shipmentResponse] = await Promise.all([
    repository.listOrders({ limit: 20 }),
    repository.listPayments({ limit: 50 }),
    repository.listShipments(),
  ]);
  setOrders(ordersResponse.data);
  setPayments(paymentsResponse.data);
  setShipments(shipmentResponse);
}, [repository]);
```

Use `refreshOrders` in the Orders-tab effect and after `simulatePaymentSuccess`. Pass a targeted pending ID to `Orders`, render `Simulate payment success` only for `payment.status === "pending"`, disable only that button while awaiting the mutation, and show API errors with `role="alert"` without clearing the pending record.

- [ ] **Step 4: Verify and commit**

Run: `CI=true pnpm vitest run components/buyer/BuyerApp.test.tsx && CI=true pnpm test`

Commit: `git add components/buyer/BuyerApp.tsx components/buyer/BuyerApp.test.tsx && git commit -m "feat(buyer): settle local payments from orders"`

### Task 3: Replace farmer mock orders with scoped API data

**Files:** Modify `lib/farmer/farmer-repository.ts`, `lib/farmer/farmer-repository.test.ts`, `components/farmer/FarmerDashboard.tsx`, and `components/farmer/FarmerOrders.tsx`; create `components/farmer/FarmerOrders.test.tsx`.

**Interface:** `listOrders(): Promise<ApiPage<ApiOrder>>` calls `GET /orders?limit=20`; backend scopes results to the farmer.

- [ ] **Step 1: Write failing repository and UI tests**

```ts
test("reads the authenticated farmer order page", async () => {
  const paths: string[] = [];
  const repository = new FarmerRepository({ client: {
    request: async (path) => { paths.push(path); return page([]); },
  } });
  await repository.listOrders();
  expect(paths).toEqual(["/orders?limit=20"]);
});
```

```tsx
test("shows API order facts without completion or rejection controls", () => {
  render(<FarmerOrders orders={[paidOrder]} />);
  expect(screen.getByText(`Order ${paidOrder.id}`)).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /complete|reject/i })).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run and verify failure**

Run: `CI=true pnpm vitest run lib/farmer/farmer-repository.test.ts components/farmer/FarmerOrders.test.tsx`

Expected: FAIL because farmer orders are seeded objects.

- [ ] **Step 3: Implement server-backed, read-only orders**

Add `listOrders`. Replace seeded `Order[]`, completion, and cancellation state in `FarmerDashboard` with `ApiOrder[] | null`, loading, and error state fetched only when the Orders tab is active. Convert `FarmerOrders` to show `createdAt`, items, totals, and backend status. Remove mock customer/address fields and both mutation props; do not add farmer transition endpoints.

- [ ] **Step 4: Verify and commit**

Run: `CI=true pnpm vitest run lib/farmer/farmer-repository.test.ts components/farmer/FarmerOrders.test.tsx && CI=true pnpm test`

Commit: `git add lib/farmer/farmer-repository.ts lib/farmer/farmer-repository.test.ts components/farmer/FarmerDashboard.tsx components/farmer/FarmerOrders.tsx components/farmer/FarmerOrders.test.tsx && git commit -m "feat(farmer): show scoped marketplace orders"`

### Task 4: Remove transporter seeded orders

**Files:** Modify `app/transporter/page.tsx`, `components/transporter/TopBar.tsx`, `components/transporter/types.ts`, and `components/transporter/ShipmentScreen.test.tsx`; delete `components/transporter/OrdersScreen.tsx`.

**Consumes:** Existing `ShipmentRepository` and `ShipmentScreen`. **Produces:** No reachable seeded `ord_1001`/`ord_1002` delivery state.

- [ ] **Step 1: Write a failing navigation assertion**

```tsx
test("does not expose seeded transporter orders", async () => {
  render(<TransporterApp />);
  expect(await screen.findByText(/available deliveries/i)).toBeInTheDocument();
  expect(screen.queryByText("ord_1001")).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run and verify failure**

Run: `CI=true pnpm vitest run components/transporter/ShipmentScreen.test.tsx`

Expected: FAIL or demonstrate that the seeded screen is still reachable.

- [ ] **Step 3: Remove the mock route**

Remove the `orders` tab identifier, TopBar button, page switch case, and `OrdersScreen.tsx`. Retain `ShipmentScreen` unchanged: it already lists paid available deliveries, handles claim conflicts, and validates status notes.

- [ ] **Step 4: Verify and commit**

Run: `CI=true pnpm vitest run components/transporter/ShipmentScreen.test.tsx && CI=true pnpm test`

Commit: `git add app/transporter/page.tsx components/transporter/TopBar.tsx components/transporter/types.ts components/transporter/ShipmentScreen.test.tsx && git rm components/transporter/OrdersScreen.tsx && git commit -m "fix(transporter): remove seeded order screen"`

### Task 5: Verify backend authority and document the Docker walkthrough

**Files:** Modify `README.md`; modify `../farm2fork-backend/test/payment.e2e-spec.ts` or `../farm2fork-backend/test/shipment.e2e-spec.ts` only if a required assertion is absent.

- [ ] **Step 1: Run backend lifecycle coverage before changing production code**

Run from `farm2fork-backend`: `pnpm test -- payment.e2e-spec.ts shipment.e2e-spec.ts --runInBand`

Expected: PASS for stock decrement once, paid order state, paid-only availability, atomic claim, and transporter-only status updates. Add a missing assertion first; do not alter services without a failing contract test.

- [ ] **Step 2: Document the local walkthrough**

Add this README sequence: farmer creates an active listing with an existing URL or no image; buyer orders and selects `Simulate payment success`; transporter claims the paid delivery and records `assigned`, `picked_up`, `in_transit`, then `delivered` with notes; buyer and farmer reload Orders. State that payment is simulated only and Cloudinary media is separate.

- [ ] **Step 3: Run full validation and commit**

Run from `farm2fork-web`: `CI=true pnpm test && CI=true pnpm run build`. Run the backend focused E2E suite, rebuild both existing Compose services, check `/api/health`, and perform the observed three-role walkthrough. Commit documentation separately with `git add README.md && git commit -m "docs(marketplace): document local simulator walkthrough"`. If backend tests change, commit those separately and exclude unrelated backend `docker-compose.yml` and `scripts/fabric-gateway-benchmark.mjs` work.
