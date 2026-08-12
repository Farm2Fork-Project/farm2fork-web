# Web Shipment Self-Claim and Tracking Design

## Goal

Replace the transporter dashboard's seeded shipment records with the existing
backend self-claim API, let an authenticated transporter claim an eligible paid
order and advance its real delivery status, and show buyers the resulting
read-only shipment status within their real order view.

## Scope and boundaries

This is a web client integration slice. The Nest backend remains the sole
authority for delivery eligibility, atomic claims, assignment, privacy, and
valid state transitions. The web client must never create a shipment locally,
infer a paid order is available, or retry an ambiguous write automatically.

The slice includes:

- transporter available-delivery discovery and atomic self-claim;
- transporter-owned shipment list, full post-claim addresses, status history,
  and status transitions with an audit note;
- buyer read-only shipment status/history for existing real orders; and
- exact TypeScript contract mapping and automated coverage.

It excludes farmer order integration because the current farmer order screen is
still seeded UI data. It also excludes GPS/maps, proof of delivery, bids,
reassignment, notifications, payment simulation, and any Fabric credentials or
ledger calls from the browser.

## Backend contract

All requests use the existing bearer-token `ApiClient` and
`NEXT_PUBLIC_API_BASE_URL`.

| Operation | Endpoint | Request | Response and privacy rule |
|---|---|---|---|
| Available deliveries | `GET /shipments/available` | none | `orderId`, pickup/delivery city and province, item count, created time; no street address or buyer contact data |
| Claim | `POST /shipments/claims` | `{ orderId }` | one assigned shipment or backend `409` when another transporter has won |
| Scoped shipment list | `GET /shipments` | none | transporter receives its own shipments; buyer receives shipments for their orders |
| Advance status | `PATCH /shipments/:id/status` | `{ status, note }` | the persisted shipment with status history |

The wire status values are exactly `assigned`, `picked_up`, `in_transit`,
`delivered`, and `failed`. Normal delivery actions follow
`assigned → picked_up → in_transit → delivered`; a transporter can report the
terminal `failed` state from a nonterminal shipment. Every update requires a
non-empty note of at most 500 characters.

## Architecture

`lib/api/contracts.ts` gains API-only shipment DTOs. A focused
`ShipmentRepository` owns request paths and returns those typed records; it has
no React state and is reusable by transporter and buyer UI. Existing
`BuyerRepository` gains only its scoped `listShipments()` read method, retaining
the current buyer-authentication and order/payment ownership boundary.

`app/transporter/page.tsx` constructs one repository per mounted session and
passes it to `ShipmentScreen`. The screen loads available deliveries and owned
shipments in parallel after authentication, then derives all visible tabs,
search results, and legal actions from server state. It never uses the old
`initialShipments` data or locally mutates a shipment before a successful API
response.

The buyer orders load joins its already-fetched real orders, payments, and
scoped shipment list by `orderId`. A shipment card displays the backend status
and history read-only; an order without a shipment remains clearly unassigned.

## Interaction and error handling

Before claim, cards show only the backend-provided city/province route and item
count. A successful claim removes that available card, adds the returned full
shipment, and selects the owned-shipment view. A `409` claim failure shows the
backend message and refreshes available deliveries because another transporter
may have claimed it.

For owned shipments, each permitted action reveals/uses a note field. The
action stays disabled until the note is nonblank and no request is pending.
On success, replace the shipment with the response and clear its note. On
failure, preserve the note, render the backend error, and leave all displayed
status/history unchanged. An expired `401` continues to use the shared client
behavior, which clears the browser session.

The client makes one request per click. It does not retry claim or status
writes after a timeout because the server may have committed the action.

## Tests and verification

Tests first define the exact shipment wire contracts and repository requests:
redacted available-delivery mapping, claim body, required status note, and
scoped shipment reads. UI tests cover no seeded rows, successful claim
replacement, the legal three-step progression, a failed-terminal action, and a
`409` refresh/error path. Buyer order tests cover shipment status matching by
`orderId` without fabricating a shipment for unmatched orders.

Required automated verification is `CI=true pnpm test` and
`CI=true pnpm run build`. The Docker image is rebuilt with
`NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api` after code completion.
Live payment, claim, and delivery testing remains user-owned because it needs a
real paid order and must not create Atlas records without explicit permission.

## Acceptance criteria

- No transporter shipment seed data, fabricated addresses, local status
  simulation, or browser payment simulation remains on the converted flow.
- Pre-claim UI exposes only the fields returned by `GET /shipments/available`.
- A claim posts only `{ orderId }`, and all delivery updates post both the exact
  next status and a nonempty note.
- Buyer order status is derived only from `GET /shipments` records with the
  same `orderId`.
- API failures are visible and preserve authoritative server state.
- The build, unit suite, and Docker rebuild are recorded with their actual
  result; browser/device and real payment/shipment smoke tests are not claimed
  without user execution.
