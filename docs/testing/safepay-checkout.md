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

These paths match the existing backend environment examples. Both return pages
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
server-calculated 210 PKR amount as 21000 subunits and preserve order IDs on
resume. MongoDB binaries may be downloaded on the first run.

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
harness. The backend Safepay implementation is pre-existing uncommitted work;
this increment preserves those files.

Before live use, verify sandbox checkout and its actual success/failure/cancel
callbacks with the configured merchant and deployed return origins. Mobile
Safepay handoff/return handling is the next client flow still pending.
