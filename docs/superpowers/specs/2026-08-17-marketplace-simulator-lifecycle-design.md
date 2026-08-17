# Marketplace Simulator Lifecycle Design

## Goal

Deliver a demonstrable local marketplace lifecycle without pretending that a
simulated settlement is a production payment:

1. a buyer places a single-farmer order;
2. the buyer starts and explicitly settles a local simulated payment;
3. a transporter sees and claims the paid delivery;
4. the transporter advances the shipment through its permitted statuses; and
5. buyer and farmer see the resulting live order, payment, and shipment state.

This design does not add a real payment provider and does not add Cloudinary
media uploads.

## Scope and non-goals

In scope:

- Existing product browsing, cart grouping, order placement, payment
  initiation, local settlement, delivery claim, shipment status updates, and
  role-scoped tracking.
- Replacing web screens that show hard-coded farmer or transporter order data
  where that data prevents the workflow from reflecting backend state.
- Backend and web tests that cover the full allowed transition chain.
- Dockerized local verification using the existing payment simulator.

Out of scope:

- JazzCash, Stripe, real callbacks, signature verification, refunds through a
  real provider, or production payment claims.
- Cloudinary accounts, upload signatures, public IDs, transformations, or
  product-media migration. Product `images` remain the existing URL array
  until the separate media module begins.
- A farmer changing delivery state. Shipment status belongs only to the
  assigned transporter.
- Automatic payment success, seeded order cards, or client-side state that
  claims an order is paid or delivered without the backend confirming it.

## Existing system boundaries

The Nest backend already owns the authoritative state and exposes these
endpoints behind Firebase-backed application sessions:

| Stage | Endpoint | Allowed role | Existing condition |
| --- | --- | --- | --- |
| Place order | `POST /orders` | buyer | One farmer per order |
| Initiate payment | `POST /payments` | buyer | Owned pending order |
| Settle locally | `POST /payments/:id/simulate` | buyer | Simulator enabled and non-production |
| Available deliveries | `GET /shipments/available` | transporter | Paid, unclaimed order |
| Claim delivery | `POST /shipments/claims` | transporter | Atomic claim |
| Update delivery | `PATCH /shipments/:id/status` | assigned transporter | Valid next status |
| Track records | `GET /orders`, `GET /payments`, `GET /shipments` | scoped role | Backend authorization |

The web application uses HTTP-only sessions, `credentials: "include"`, and
the CSRF header provided by `ApiClient`. The marketplace work must retain
those transport rules and must not introduce browser-held bearer tokens.

## User-facing lifecycle

### Buyer

Checkout remains grouped by farmer. Each successful group creates one order
and one pending payment. The cart removes only groups for which both calls
succeeded.

The buyer's Orders view joins its backend-scoped orders, payments, and
shipments by order ID. A pending payment shows a visibly local-only action:
`Simulate payment success`. It is available only when the API exposes the
existing local simulator behavior; it is never described as a gateway payment
or real charge. On success, the payment and order views refresh from the API.

If settlement fails, the UI preserves the pending payment and displays the
server error. It must not offer a second payment initiation for the same order
as a substitute for understanding the current payment state.

### Farmer

The farmer dashboard's orders view must obtain actual scoped records from the
backend. It may show item, totals, payment/order state, and delivery progress
that the backend authorizes for that role. The current mock `Complete` and
`Reject` actions are removed or made unavailable because neither represents a
valid farmer transition in the backend's lifecycle.

### Transporter

The existing shipment screen becomes the only web surface that performs the
delivery transitions. It refreshes available deliveries after a buyer settles
payment, prevents a duplicate claim after an API conflict, and renders the
server-issued status history. It never receives full delivery addresses in the
available-delivery list; those are fetched only in the transporter-owned
shipment record after claim, as determined by the API contract.

## Data and error handling

- A payment is keyed by its `orderId`; the UI must retrieve it from the
  existing payment list rather than infer payment state from an order label.
- A shipment is keyed by its `orderId` for buyer timeline presentation.
- Every mutation uses `ApiClient`; HTTP 401 clears the web session through the
  existing client/session boundary, while other API errors render the backend
  message.
- Mutation completion triggers a fresh read of the relevant resources. Local
  state may provide immediate feedback but cannot manufacture lifecycle state.
- Double-clicks are disabled while the specific mutation is pending.
- The UI exposes no simulator control in a production configuration. The
  backend remains the final enforcement point through
  `PAYMENT_SIMULATOR_ENABLED` and non-production checks.

## Implementation slices

1. Extend web API contracts and `BuyerRepository` with the existing simulated
   settlement endpoint, including repository tests.
2. Add a buyer pending-payment control and refreshable order/payment/shipment
   tracking with component tests for success, rejection, and no duplicate
   action.
3. Replace farmer order mock data/actions with an authenticated repository and
   server-backed, read-only order view.
4. Remove any remaining transporter seeded-order presentation that is part of
   the lifecycle, retain the existing real shipment repository, and test the
   paid-order claim/status path.
5. Run backend E2E tests plus web tests, build both Docker images, and execute
   a three-role local walkthrough with the simulator enabled.

## Acceptance criteria

- A buyer can place an order, see a pending payment, settle it through the
  explicitly labelled local simulator, and then see the resulting shipment
  timeline.
- An unpaid order never appears in the transporter's available deliveries.
- A paid order can be claimed only once and only by a transporter.
- Only the assigned transporter can advance shipment status; farmer pages do
  not show fabricated completion controls.
- Reloading any role's screen obtains authoritative state from the API.
- No Cloudinary or Firebase Storage dependency, secret, or upload code is
  introduced in this milestone.
- Backend E2E tests, focused web tests, production builds, and Docker local
  walkthrough pass before the milestone is claimed complete.
