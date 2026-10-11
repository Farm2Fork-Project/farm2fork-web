# Web Safepay checkout and return handling

Normal buyer checkout now requests `safepay` and preserves the backend's
`{ payment, checkoutUrl }` response. Each saved farmer order has its own hosted
checkout link. Creating an order does not mark its payment successful.

The checkout receipt stays mounted after confirmed cart groups are removed. If
an order was saved but payment initiation failed, the receipt links to Orders;
the saved group is removed from the cart to avoid creating it again on retry.
Unprocessed groups remain in the cart.

Pending orders can be paid or resumed from Orders, including orders without a
payment record and failed payments. Resume calls `POST /payments` with the
existing order ID. Requests disable the action while pending, and errors allow
deliberate retry. The UI accepts HTTPS checkout links only on the backend's
default Safepay authorities: `sandbox.api.getsafepay.com` and `getsafepay.com`.
Missing or invalid links show an error instead of an actionable URL.

Configure the backend return URLs for the deployed web origin:

```dotenv
SAFEPAY_REDIRECT_URL=https://your-web-origin/order/complete
SAFEPAY_CANCEL_URL=https://your-web-origin/order/cancel
```

These paths match the existing backend environment examples. Without a valid `mobileOrderId`, both return pages
redirect to the authenticated buyer application with a `payment_return` hint.
The hint selects Orders and displays return/cancel copy; it never changes order
or payment state. Only the backend's persisted status is displayed. Buyers can
refresh status when a webhook arrives later; focusing the Orders view also
refreshes it. A completed/paid order no longer offers a checkout link.

JazzCash/Stripe are existing local placeholders, so their selectors and local
settlement controls require `NEXT_PUBLIC_PAYMENT_SIMULATOR_ENABLED=true` in a
non-production build. The backend simulator must be enabled separately. Safepay
payments do not show a local simulation button.

## Verification

From `farm2fork-web`:

```sh
pnpm exec vitest run
pnpm exec tsc --noEmit
pnpm exec next build
```

From `farm2fork-backend`, run the real HTTP integration harness:

```sh
pnpm exec ts-node --compiler-options '{"rootDir":"."}' scripts/test/web-checkout-e2e.ts
```

The harness starts a disposable MongoDB replica set, real Nest controllers,
services, JWT/role/CSRF guards and a local HTTP fixture for Safepay tracker and
passport responses. It runs the actual React checkout/Orders components and web
repository against that backend. It checks two farmer orders, server-calculated
totals, hosted URLs and return destinations, cancel/resume, failed-payment retry,
unauthorized access, signed settlement/replay, final paid status, depleted stock
and exactly two persisted payment/outbox records. Gateway requests use the
persisted server total, including delivery, converted to subunits and preserve
order IDs on resume. MongoDB binaries may be downloaded on the first run.

Verified on 2026-10-11: 72 web tests passed; two live harness tests skip without
their environment configuration. The checkout harness passed when invoked as
above. TypeScript and production build passed. Changed-file ESLint had no
errors; five existing unused-variable warnings remain in the buyer/root page
files. Both built return pages were checked over HTTP for the correct
prerendered redirect and rejection of untrusted status query parameters.

## Remaining runtime checks

The harness uses seeded JWT identities, synthetic signed callbacks and local
gateway responses. Account acquisition, Firebase session cookies, real Safepay
event shapes/hosted checkout, browser visuals and deployed Fabric transactions
are outside its scope. Shipment reads are a separate fixture in the component
harness. Notification and transport dispatch are stubbed; ledger outbox persistence is
real.

Before live use, verify sandbox checkout and its actual success/failure/cancel
callbacks with the configured merchant and deployed return origins. Signed-in native browser-to-app return still needs device verification.

## Mobile return bridge (2026-10-11)

Mobile requests supply `client: mobile`. The backend adds the existing order ID
as `mobileOrderId` to the configured success/cancel URLs. Both pages validate
this marker and render an Open app link to
`farm2fork://app/payments?orderId=<id>&result=complete` (or `cancel`). The app
reads persisted backend status; the marker never settles a payment. Ordinary
web requests retain their Orders redirect. The built routes passed HTTP checks
for valid, invalid and absent mobile IDs.

Five bridge regression tests bring the full web suite to 77 passing tests and
two environment-gated skips. Web TypeScript and production build pass; the
existing web checkout harness also passes after this addition. Mobile behavior,
harness commands and device checks are documented in
`farm2fork-mobile/docs/testing/safepay-checkout.md`.

## Delivery quote and pickup setup — 2026-10-11

The backend rebase introduced required delivery coordinates and delivery fees.
Checkout now validates latitude/longitude in Pakistan, fetches one backend quote
per farmer and displays items, platform fee, delivery fee, estimated distance and
total before Place orders. Editing an address or cart invalidates the quote.
Quoting creates no order and quote failures keep the cart available for retry.
The backend recalculates authoritative totals when placing orders.

Farmers save a complete pickup address, city, province and map coordinates in
Listings. Existing incomplete profiles can be repaired there. Signup directs new
farmers to this step instead of sending an incomplete address-only object.
Coordinates are entered explicitly using a map app; no automatic GPS acquisition
or default pins are supplied.

Current verification: 81 web tests passed, two environment-gated skips; TypeScript
and production build passed. The real checkout harness passed with initially
incomplete farmer profiles updated over HTTP and gateway amounts matched against
persisted totals including delivery. Changed-file ESLint has no errors and three
existing unused-import/parameter warnings. Merchant-hosted checkout, Firebase
acquisition, browser appearance and deployed Fabric remain separate runtime checks.
