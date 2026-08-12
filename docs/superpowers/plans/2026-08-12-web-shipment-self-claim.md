# Web Shipment Self-Claim Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace seeded transporter shipments with the real self-claim/status API and render buyer shipment tracking from scoped backend records.

**Architecture:** Exact shipment DTOs and a focused repository sit over `ApiClient`. The transporter screen loads available and owned records in parallel, writes only after an explicit action, and replaces data only with a persisted API response. Buyer orders load scoped shipments beside orders/payments and join only by `orderId`.

**Tech Stack:** Next.js 16, React 19, TypeScript, Vitest, Testing Library, Nest REST API.

## Global Constraints

- Work on `feature/web-shipment-self-claim`, integrate only verified commits into `develop`, and never push `main`.
- Make small related commits; no commit or branch name may mention Codex.
- Use `NEXT_PUBLIC_API_BASE_URL` and `ApiClient`; add no secrets, `env_file`, payment simulation, Fabric credentials, or ledger calls to the browser.
- Available delivery cards expose only returned city/province, item count, and time.
- Claims post only `{ orderId }`; updates post exact wire status plus a trimmed 1–500-character note.
- Never automatically retry claim/status writes. Leave farmer seeded orders unchanged. Localize new transporter text in English and Urdu.

---

### Task 1: Shipment contracts and repository

**Files:**
- Modify: `lib/api/contracts.ts`
- Create: `lib/shipment/shipment-repository.ts`
- Create: `lib/shipment/shipment-repository.test.ts`

**Interfaces:**
- `ShipmentStatus = 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed'`.
- `ApiAvailableDelivery`, `ApiShipmentAddress`, `ApiShipmentStatusHistory`, and `ApiShipment` match Swagger field names.
- `ShipmentRepository.listAvailable()`, `claim(orderId)`, `listShipments()`, and `updateStatus(id, { status, note })` use the shared request client.

- [ ] **Step 1: Write a failing repository test**

```ts
await repository.claim('order-1');
expect(request).toHaveBeenCalledWith('/shipments/claims', { method: 'POST', body: { orderId: 'order-1' } });
```

- [ ] **Step 2: Confirm red**

Run: `CI=true pnpm vitest run lib/shipment/shipment-repository.test.ts`

Expected: FAIL because the repository does not exist.

- [ ] **Step 3: Implement the exact API boundary**

`claim` calls `POST /shipments/claims`; `listAvailable` calls `GET /shipments/available`; `listShipments` calls `GET /shipments`; `updateStatus` calls `PATCH /shipments/:id/status`. Use generic `client.request<T>()` and no browser state.

- [ ] **Step 4: Confirm green**

Run: `CI=true pnpm vitest run lib/shipment/shipment-repository.test.ts lib/api/contracts.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

Run: `git add lib/api/contracts.ts lib/shipment/shipment-repository.ts lib/shipment/shipment-repository.test.ts && git commit -m "feat: add web shipment repository"`

### Task 2: Real transporter discovery and atomic claim

**Files:**
- Modify: `components/transporter/ShipmentScreen.tsx`
- Create: `components/transporter/ShipmentScreen.test.tsx`
- Modify: `app/transporter/page.tsx`
- Modify: `lib/dictionaries.ts`

**Interfaces:**
- `ShipmentScreen` receives `Pick<ShipmentRepository, 'listAvailable' | 'claim' | 'listShipments' | 'updateStatus'>`.
- The screen produces Available deliveries and My shipments views; `initialShipments` is removed.

- [ ] **Step 1: Write failing discovery/claim UI tests**

```tsx
expect(await screen.findByText('Multan, Punjab → Lahore, Punjab')).toBeVisible();
expect(screen.queryByText('Farm Road 1')).not.toBeInTheDocument();
await userEvent.click(screen.getByRole('button', { name: /claim/i }));
expect(claim).toHaveBeenCalledWith('order-1');
expect(await screen.findByText('Farm Road 1, Multan')).toBeVisible();
```

Also cover a `409` claim: show the backend error and call `listAvailable` again, without inventing a shipment.

- [ ] **Step 2: Confirm red**

Run: `CI=true pnpm vitest run components/transporter/ShipmentScreen.test.tsx`

Expected: FAIL because the screen still contains seed data and no repository prop.

- [ ] **Step 3: Implement server-owned discovery and claim**

Start independent `listAvailable()` and `listShipments()` calls together in one mount effect. Render pre-claim cards only from redacted fields. On success, remove that order from availability, add/replace the returned shipment, and select My shipments. On `ApiError` 409, show its message and refresh availability only. On any other error, preserve server-derived records. Construct one repository using `useMemo` in `app/transporter/page.tsx` after authentication.

- [ ] **Step 4: Add EN/UR copy and confirm green**

Add matching `tship.*` values for availability, claim, item count, delivery note, pickup, transit, failed, loading, and unassigned states.

Run: `CI=true pnpm vitest run components/transporter/ShipmentScreen.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

Run: `git add app/transporter/page.tsx components/transporter/ShipmentScreen.tsx components/transporter/ShipmentScreen.test.tsx lib/dictionaries.ts && git commit -m "feat: connect transporter shipment claims"`

### Task 3: Legal transitions, notes, and timeline

**Files:**
- Modify: `components/transporter/ShipmentScreen.tsx`
- Modify: `components/transporter/ShipmentScreen.test.tsx`

**Interfaces:**
- Normal next steps: `assigned → picked_up`, `picked_up → in_transit`, `in_transit → delivered`.
- Each nonterminal shipment also offers terminal `failed`.
- `updateStatus(id, { status, note })` is called only with a valid trimmed note.

- [ ] **Step 1: Write failing transition tests**

```tsx
expect(screen.getByRole('button', { name: /confirm pickup/i })).toBeDisabled();
await userEvent.type(screen.getByLabelText(/delivery note/i), 'Collected at farm gate');
await userEvent.click(screen.getByRole('button', { name: /confirm pickup/i }));
expect(updateStatus).toHaveBeenCalledWith('shipment-1', { status: 'picked_up', note: 'Collected at farm gate' });
```

Also cover rejected update: preserve note/status and display the backend error.

- [ ] **Step 2: Confirm red**

Run: `CI=true pnpm vitest run components/transporter/ShipmentScreen.test.tsx`

Expected: FAIL because the current UI skips `picked_up`, requires no note, and never persists updates.

- [ ] **Step 3: Implement status controls**

Keep `notesByShipmentId` and `pendingShipmentId` transiently. Reject blank/overlong notes before a request. Use a static next-status map, replace only the API result, clear only that note on success, and render backend `statusHistory` ordered by server timestamps. Preserve the note and authoritative data on failure. Terminal records have no normal action.

- [ ] **Step 4: Confirm green**

Run: `CI=true pnpm vitest run components/transporter/ShipmentScreen.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

Run: `git add components/transporter/ShipmentScreen.tsx components/transporter/ShipmentScreen.test.tsx && git commit -m "feat: track transporter shipment status"`

### Task 4: Buyer read-only shipment status

**Files:**
- Modify: `lib/buyer/buyer-repository.ts`
- Modify: `components/buyer/BuyerApp.tsx`
- Modify: `components/buyer/BuyerApp.test.tsx`

**Interfaces:**
- Adds `BuyerRepository.listShipments(): Promise<ApiShipment[]>`.
- Extends `BuyerRepositoryPort` with `listShipments`.
- `Orders` receives shipments and joins only where `shipment.orderId === order.id`.

- [ ] **Step 1: Write a failing buyer regression**

```tsx
await userEvent.click(await screen.findByRole('button', { name: 'Orders' }));
expect(await screen.findByText('Shipment: in_transit')).toBeVisible();
expect(screen.queryByText('Shipment: delivered')).not.toBeInTheDocument();
```

The fixture includes `in_transit` for `order-1` and a different delivered shipment, proving no fabricated match.

- [ ] **Step 2: Confirm red**

Run: `CI=true pnpm vitest run components/buyer/BuyerApp.test.tsx`

Expected: FAIL because buyer orders do not read shipments.

- [ ] **Step 3: Implement scoped read and display**

Add `listShipments()` to `BuyerRepository` and order-tab `Promise.all`. Build an `orderId` map before card render. Unmatched orders display `Shipment: awaiting assignment`; matched orders display exact status and compact status-history timestamps. Do not expose transporter identity, actions, or mock shipment data.

- [ ] **Step 4: Confirm green**

Run: `CI=true pnpm vitest run components/buyer/BuyerApp.test.tsx lib/buyer/buyer-repository.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

Run: `git add lib/buyer/buyer-repository.ts components/buyer/BuyerApp.tsx components/buyer/BuyerApp.test.tsx && git commit -m "feat: show buyer shipment status"`

### Task 5: Verify, record progress, and integrate

**Files:**
- Modify: `../farm2fork-mobile/PROGRESS.md`

- [ ] **Step 1: Run complete web validation**

Run: `CI=true pnpm test && CI=true pnpm run build`

Expected: all tests pass and standalone Next build succeeds.

- [ ] **Step 2: Rebuild Docker runtime**

Run: `NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api docker compose build`

Expected: standalone image build succeeds without `.env` injection.

- [ ] **Step 3: Update the central tracker**

Record real transporter/buyer shipment behavior, commands/results, no automated Atlas payment/claim, and user-owned browser/device smoke still open. Run `git -C ../farm2fork-mobile diff --check`, then commit only `PROGRESS.md` with `docs: record web shipment integration`.

- [ ] **Step 4: Integrate verified branches**

Run: `git switch develop && git merge --ff-only feature/web-shipment-self-claim && git push origin develop && git -C ../farm2fork-mobile push origin develop`

Confirm each local `develop` equals `origin/develop`; do not modify `main`.

## Plan self-review

- Tasks 1–3 cover privacy, atomic claim, legal transitions, notes, timeline, and API errors.
- Task 4 joins buyer records only by `orderId` and never manufactures a shipment.
- Task 5 covers full tests, Docker, tracker, and verified develop integration.
- All request fields and status values match the approved design and backend Swagger contract.
