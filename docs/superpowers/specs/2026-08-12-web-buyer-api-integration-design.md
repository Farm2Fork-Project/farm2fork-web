# Web Buyer API Integration Design

**Date:** 2026-08-12  
**Status:** Approved for specification review  
**Repositories:** `farm2fork-web`, `farm2fork-backend`

## Goal

Replace the buyer web prototype's mocked authentication, marketplace, cart,
checkout, orders, and payment-status data with the existing Nest backend API.
The first live web slice must let an existing buyer sign in, place valid
one-farmer orders, initiate persisted pending payments, and read the resulting
orders and payments without inventing backend data or simulating settlement.

## Scope

### Included

- Buyer registration through `POST /api/auth/register/buyer`, followed by the
  same session handling used by login.
- Existing-buyer email/password login through `POST /api/auth/login`.
- Session validation through `GET /api/auth/me`.
- Buyer-only real API surfaces: marketplace, product detail, cart, checkout,
  order list, payment initiation, and payment status.
- One browser-session cart that groups line items by `farmerId` before checkout.
- Complete Swagger audit for every current backend controller: root, auth,
  products, orders, payments, and shipments.
- Docker-compatible web configuration and backend CORS documentation.
- Automated web tests for the API/session/cart/checkout boundary.

### Explicitly excluded

- Email verification, password reset, and guest checkout.
- Farmer, transporter, administrator, and financial-partner API integration.
- A production payment-provider redirect, webhook verification, or exposing the
  local payment simulator in the web UI.
- A backend cart resource, stock reservation, payment polling, shipment map,
  notifications, loans, community, AI, and traceability UI.
- The user-initiated normal payment/shipment Fabric smoke. That remains a
  separate, explicitly approved activity.

## Authentication Architecture

The current backend returns an `accessToken` JSON field from login and does not
issue HTTP-only cookies or refresh tokens. The first slice therefore uses a
browser-only `WebSession` adapter:

1. `POST /auth/register/buyer` and `POST /auth/login` return `{ accessToken,
   user }`.
2. The adapter stores exactly that pair under a versioned `sessionStorage` key.
3. The API client reads the token only when constructing a Bearer header.
4. The application validates the session with `GET /auth/me` at buyer-app
   startup before it renders protected data.
5. Logout and every `401` remove the complete session record and return the
   browser to login.

The access token must never be placed in the URL, React component props,
analytics, error text, cart records, or server-rendered HTML. `sessionStorage`
is deliberately temporary: closing the browser session ends the login.

### Target migration: HTTP-only cookies

The long-term target is backend-issued, secure, HTTP-only access/refresh
cookies with CSRF protection. Screens, cart state, and domain repositories must
depend only on the API-client interface, not on `sessionStorage`. The migration
replaces the session adapter and request credential strategy; it does not
rewrite marketplace, checkout, orders, or payment views.

## Web Component and Data Boundaries

| Boundary | Responsibility | Source of truth |
|---|---|---|
| `WebSession` | Save/read/clear the temporary buyer session | `sessionStorage` |
| `ApiClient` | Base URL, JSON serialization, Bearer header, normalized API errors | HTTP response |
| Buyer repositories | Map backend DTOs to web-safe product/order/payment models | Backend DTOs |
| Marketplace and product detail | Query/render live products; keep filters in view state | `GET /products` and `GET /products/:id` |
| Cart | Hold buyer-selected product IDs, farmer IDs, quantities, and display snapshots | browser session state |
| Checkout | Revalidate via order creation; submit one farmer group at a time | `POST /orders` and `POST /payments` |
| Orders/payments views | Render persisted backend records and payment states | `GET /orders`, `GET /payments`, `GET /payments/:id` |

The existing mock `PRODUCTS`, mock users, fabricated farm/rating/location/sales
figures, static orders, and fake authentication do not remain on any converted
buyer surface. The current product API returns a `farmerId`, not a farmer
profile, so the converted product UI must not fabricate a farm name, rating,
location, or sales count.

## Buyer API Contract

All paths below use the configured API prefix (`/api` in the current backend).
`API_VERSION=v1` is OpenAPI metadata; it is not part of the route prefix. Every
endpoint except login requires `Authorization: Bearer <token>`.

| Web action | Endpoint | Request | Result used by web |
|---|---|---|---|
| Register buyer | `POST /auth/register/buyer` | required business name, business type, CNIC, email, strong password; optional phone and saved addresses | `accessToken`, buyer user summary |
| Login | `POST /auth/login` | `{ email, password }` | `accessToken`, buyer user summary |
| Validate session | `GET /auth/me` | none | authenticated buyer summary |
| Browse products | `GET /products` | `page`, `limit`, `search`, `category`, `qualityGrade`, `minPrice`, `maxPrice`, `sortBy`, `sortOrder` as applicable | paginated product data |
| Product detail | `GET /products/:id` | product ID | product data |
| Create order | `POST /orders` | `{ items: [{ productId, quantity }], shippingAddress }` | price/fee snapshots and status |
| List orders | `GET /orders` | pagination/status only when supported | persisted buyer orders |
| Initiate payment | `POST /payments` | `{ orderId, gateway: 'jazzcash' | 'stripe' }` | persisted payment |
| List payments | `GET /payments` | pagination/status/gateway filters as applicable | persisted buyer payments |
| Payment detail | `GET /payments/:id` | payment ID | persisted payment status |

The browser sends product IDs and quantities, never client-calculated totals,
platform fees, farmer identity, stock, payment amount, or payment success.
`POST /orders` remains the authority for product availability, price snapshots,
and the one-order-one-farmer rule.

## Cart and Checkout Flow

1. Marketplace and product detail load live `ProductResponseDto` values.
2. Add-to-cart stores a cart item with `productId`, `farmerId`, requested
   quantity, and a display snapshot. It rejects zero or negative quantities.
3. The cart groups its items by `farmerId` and displays a separate checkout
   group for each farmer.
4. The buyer supplies one valid shipping address for the checkout attempt.
5. Checkout creates one order per group. It then initiates one payment for each
   successfully created order with the buyer-selected supported gateway.
6. The result screen records each group independently as order-created,
   payment-pending, or failed-with-a-known-response. It renders success only
   when every group has a persisted pending payment.
7. Orders and payments are refreshed from the backend after the submission
   attempt; cart lines are removed only for groups with a known persisted order.

The browser must not automatically retry a failed `POST /orders` or
`POST /payments`. A timeout can be ambiguous after the backend has created an
order or payment. The UI directs the buyer to refresh Orders/Payments before a
manual retry. A clear backend validation response may be corrected and
resubmitted by the buyer.

The application displays `pending`, `success`, `failed`, and `refunded` exactly
as returned by the payment API. This slice never calls `POST /payments/:id/simulate`.

## Error and Loading Behavior

| Condition | Required browser behavior |
|---|---|
| `401` | Clear session and show login with a session-expired message. |
| `403` | Keep session; show role/ownership denial. A non-buyer login cannot enter the real buyer flow. |
| `400`/`409` | Render the backend message at the affected filter, cart group, address, order, or payment action. |
| `404` | Show a missing-product/order/payment state with a safe return action. |
| Network error | Keep cart/session state, show retry for reads, and do not retry writes automatically. |
| Initial protected load | Render a loading state until session validation completes; do not flash mocked buyer content. |

No error path falls back to mock users, mock products, mock orders, or a fake
payment result.

## Buyer Registration Amendment

The original first-slice restriction to existing buyers was corrected after
the deployed web UI sent a buyer selecting Sign up back to login despite the
backend already exposing `POST /auth/register/buyer`. The web app must render a
buyer-specific form with the backend's required `businessName`, `businessType`,
`cnic`, `email`, and strong `password` fields. `phone` and saved addresses are
optional and omitted when blank. A successful buyer-only result is saved by
the existing session adapter and opens the protected buyer application without
a second login. A non-buyer response is rejected before session persistence.

The legacy `/login` page must no longer use hard-coded credentials or route
sign-up users to an ignored `?auth=signup` value. It must use the same real
buyer login/registration entry state as `/`.

## Docker and Runtime Configuration

- The web image receives `NEXT_PUBLIC_API_BASE_URL` at build time; it is the
  only browser-visible API configuration and contains no secret.
- Docker Compose supplies the value explicitly. It must not use Compose
  `env_file` to inject web runtime configuration.
- The backend `CORS_ORIGIN` must include the web origin used by the container
  or local browser.
- The web container does not mount backend credentials, Fabric crypto, MongoDB
  credentials, JWT signing secrets, or payment-provider credentials.
- The Docker design remains compatible with the future HTTP-only-cookie model;
  the backend and web must then use the same secure-site/cookie policy.

## Swagger Completeness Requirement

Before web integration begins, audit all six backend controllers. Each
operation must declare:

- one `ApiTags` group;
- an operation summary and behavior description;
- bearer-auth requirement or explicit public status;
- role/ownership restrictions where applicable;
- request DTO type (body, query, and parameters);
- concrete success status and response DTO/schema; and
- documented `400`, `401`, `403`, `404`, `409`, `422`, `501`, or other error
  responses that the operation can return.

The root health endpoint must have a concrete public response schema. Swagger
must never describe sensitive response fields such as `passwordHash`, JWT
signing material, payment `gatewayRef`, or Fabric private keys. The audit may
improve annotations only; it must not alter authorization or business logic.

## Test Strategy

The web repository gains a test runner and focused tests for:

1. Session save/read/clear behavior and clearing on a normalized `401`.
2. API-client Bearer-header construction and normalized non-success responses.
3. Product DTO mapping without fabricated farmer profile fields.
4. Cart quantity rules and grouping by `farmerId`.
5. Checkout request construction: exactly one order request per farmer group,
   then one payment request per confirmed order.
6. Ambiguous write failures: no automatic re-submission and persisted cart
   state remains available for buyer review.
7. Pending-payment, failed-payment, and empty order states.

Backend Swagger verification includes controller-level tests or an OpenAPI
document assertion that confirms every current route has operation metadata,
security/public state, concrete request/response schemas, and declared error
responses. Existing backend unit/e2e tests continue to protect behavior; the
Swagger audit must not change them.

Manual browser and user-initiated payment/shipment smoke tests remain required
after automated tests. They are not claimed by this design.

## Acceptance Criteria

The slice is complete only when all of the following are true:

- An existing buyer can log in with real backend credentials and reload the
  buyer app during the same browser session.
- Unauthenticated or expired sessions never render protected mock content.
- Live products, details, cart groups, orders, and payment statuses come from
  the backend and use backend string IDs.
- A multi-farmer cart creates separate orders; it never sends a mixed-farmer
  order payload.
- Payment initiation creates persisted `pending` payments without a web-side
  simulated outcome.
- Read/write failures preserve truthful state and do not generate duplicate
  checkout writes automatically.
- All six backend controllers satisfy the Swagger completeness requirement.
- The web application builds and runs through its Docker configuration with an
  explicit API base URL and allowed backend CORS origin.
- Focused web tests, backend Swagger verification, and relevant builds pass.
