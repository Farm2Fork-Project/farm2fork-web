# Web Buyer API Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> `superpowers:executing-plans` to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the buyer web prototype's mocked purchase path with the
existing backend API while making every current backend endpoint fully
documented in Swagger.

**Architecture:** The web app receives a short-lived browser session from
`POST /auth/login`, encapsulates it behind `WebSession`, and uses one typed
`ApiClient` and buyer repository layer for all protected HTTP calls. The cart
groups items by the backend `farmerId`, submits one order per group, then
initiates a pending payment for each created order. The backend Swagger
document is built by a reusable factory and asserted in tests so annotation
coverage cannot silently regress.

**Tech Stack:** Next.js 16, React 19, TypeScript, Vitest, Testing Library,
NestJS 11, `@nestjs/swagger`, pnpm, Docker Compose.

## Global Constraints

- Work only from a focused `feature/...` branch or `develop`; never commit to
  or push `main`, and do not push any branch.
- Execute in the existing checkouts (no worktree). Before Task 1, create
  `feature/web-api-swagger-contracts` from the backend `develop` branch. Before
  Task 2, create `feature/web-buyer-api-integration` from the current web
  design branch so the approved design and this plan remain in history.
- Use small, related commits. Branch names and commit messages must not mention
  Codex.
- The first real web slice is buyer-only: existing-buyer login, marketplace,
  product detail, cart, checkout, orders, and payment status.
- Keep registration, non-buyer portals, notifications, loans, community, AI,
  traceability UI, payment-provider redirects, and the local payment simulator
  out of scope.
- Store the temporary JWT session only in `sessionStorage`; do not put it in
  URLs, props, logs, cart records, or server-rendered HTML.
- The session adapter must be replaceable by the later backend HTTP-only
  access/refresh-cookie design without rewriting screens or cart logic.
- The web Docker configuration must use an explicit `NEXT_PUBLIC_API_BASE_URL`
  and no Compose `env_file`. Never place backend or Fabric secrets in the web
  image or container.
- Preserve backend contracts: browser checkout sends only product IDs,
  quantities, address, order ID, and supported payment gateway. Backend totals,
  price snapshots, stock checks, and payment results are authoritative.
- Swagger documentation must cover all current controllers: health, auth,
  products, orders, payments, and shipments. Documentation-only work must not
  change authorization or business behavior.

---

## File Structure

### Backend documentation boundary

| File | Responsibility |
|---|---|
| `farm2fork-backend/src/swagger-document.ts` | Build the canonical OpenAPI document and define all API tags/security scheme. |
| `farm2fork-backend/src/main.ts` | Use the shared Swagger document factory at runtime. |
| `farm2fork-backend/src/swagger-document.spec.ts` | Assert every current route has operation, request/security, success, and error metadata. |
| `farm2fork-backend/src/app.controller.ts` | Complete health response documentation. |
| `farm2fork-backend/src/modules/{auth,marketplace,order,payment,transport}/*.controller.ts` | Add exact Swagger error/role/parameter documentation without changing runtime behavior. |

### Web application boundary

| File | Responsibility |
|---|---|
| `farm2fork-web/lib/api/contracts.ts` | Backend-compatible request/response and normalized error types. |
| `farm2fork-web/lib/api/client.ts` | JSON fetch wrapper, Bearer attachment, response/error normalization. |
| `farm2fork-web/lib/auth/web-session.ts` | Versioned `sessionStorage` session adapter. |
| `farm2fork-web/lib/cart/cart.ts` | Cart item validation, farmer grouping, and post-checkout removal helpers. |
| `farm2fork-web/lib/buyer/buyer-repository.ts` | Typed calls for auth, products, orders, and payments. |
| `farm2fork-web/components/buyer/BuyerApp.tsx` | Protected buyer application state and screen selection. |
| `farm2fork-web/components/buyer/CheckoutPanel.tsx` | Address/gateway input and group-by-group checkout result rendering. |
| `farm2fork-web/components/{MarketplaceScreen,ProductDetailScreen,CartScreen,OrdersScreen,TopBar}.tsx` | Preserve visual hierarchy while replacing mock data/handlers with typed props. |
| `farm2fork-web/app/page.tsx` | Remove mock credentials and mount the buyer app entry point. |
| `farm2fork-web/Dockerfile`, `.dockerignore`, `docker-compose.yml`, `.env.example` | Reproducible web runtime using explicit API base configuration. |

## Task 1: Lock Swagger Documentation Coverage

**Repository:** `farm2fork-backend`

**Files:**
- Create: `src/swagger-document.ts`
- Create: `src/swagger-document.spec.ts`
- Modify: `src/main.ts`
- Modify: `src/app.controller.ts`
- Modify: `src/modules/auth/auth.controller.ts`
- Modify: `src/modules/marketplace/marketplace.controller.ts`
- Modify: `src/modules/order/order.controller.ts`
- Modify: `src/modules/payment/payment.controller.ts`
- Modify: `src/modules/transport/transport.controller.ts`

**Interfaces:**
- Consumes: the six current controllers and existing DTOs.
- Produces: `createSwaggerDocument(app, port, apiVersion): OpenAPIObject`, used
  both by the live Nest bootstrap and the regression test.

- [ ] **Step 0: Create the isolated backend documentation branch**

Run from `farm2fork-backend` after confirming its intended Swagger files are
clean. Preserve the existing Fabric feature branch and its generated files:

```bash
git switch develop
git switch -c feature/web-api-swagger-contracts
```

- [ ] **Step 1: Write the failing OpenAPI coverage test**

Create a Nest testing module with all six controllers and mocks for their
services. Create an application, call `createSwaggerDocument()`, and require
each route/method below to have `summary`, at least one `2xx` response, and the
specified security state:

```ts
const secured = [
  ['/auth/me', 'get'], ['/products', 'get'], ['/products/{id}', 'get'],
  ['/orders', 'post'], ['/orders', 'get'], ['/orders/{id}', 'get'],
  ['/orders/{id}/cancel', 'patch'], ['/payments', 'post'],
  ['/payments', 'get'], ['/payments/{id}', 'get'],
  ['/payments/{id}/simulate', 'post'], ['/payments/{id}/refund', 'post'],
  ['/shipments/available', 'get'], ['/shipments/claims', 'post'],
  ['/shipments', 'get'], ['/shipments/{id}', 'get'],
  ['/shipments/{id}/status', 'patch'],
] as const;

expect(document.paths['/api/auth/login'].post?.security).toBeUndefined();
for (const [path, method] of secured) {
  expect(document.paths[`/api${path}`][method]?.security).toEqual([
    { 'JWT-auth': [] },
  ]);
}
```

Also assert that `GET /api/health`, all public auth routes, and
`POST /api/payments/webhook/{gateway}` are public; that the document has
the `Health`, `Auth`, `Marketplace`, `Orders`, `Payments`, and `Shipments`
tags; and that the documented `PaymentResponseDto` schema has no `gatewayRef`.

- [ ] **Step 2: Run the Swagger test to verify it fails**

Run: `CI=true pnpm exec jest src/swagger-document.spec.ts --runInBand`

Expected: FAIL because `createSwaggerDocument()` and the complete operation
annotations do not yet exist.

- [ ] **Step 3: Extract the document factory and add exact operation metadata**

Create `src/swagger-document.ts` using the existing `DocumentBuilder` values,
adding the missing Shipments tag and returning a document generated from the
application instance:

```ts
export function createSwaggerDocument(
  app: INestApplication,
  port: number,
  apiVersion: string,
): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('Farm2Fork API')
    .setDescription('Farm2Fork API Documentation - Quality produce direct from farms')
    .setVersion(apiVersion)
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT-auth')
    .addServer(`http://localhost:${port}`, 'Local Development')
    .addServer('https://api.farm2fork.com', 'Production')
    .addTag('Health', 'Application health check endpoints')
    .addTag('Auth', 'Registration, login, email verification and password reset')
    .addTag('Marketplace', 'Product listings, search, filtering and QR codes')
    .addTag('Orders', 'Order placement, listing and cancellation')
    .addTag('Payments', 'Payment initiation, gateway callbacks and refunds')
    .addTag('Shipments', 'Transporter self-claim and shipment tracking')
    .build();
  return SwaggerModule.createDocument(app, config);
}
```

Replace the inline builder in `main.ts` with the factory. Add explicit
`ApiBadRequestResponse`, `ApiUnauthorizedResponse`, `ApiForbiddenResponse`,
`ApiNotFoundResponse`, `ApiConflictResponse`, or `ApiNotImplementedResponse`
annotations only where the route can return those statuses. Each description
must name the real condition: for example, mixed-farmer orders are `400`, an
already-claimed delivery is `409`, unsupported webhook processing is `501`, and
buyer/farmer/transporter ownership denials are `403`. Use existing DTOs for
success responses and leave controller service calls unchanged.

- [ ] **Step 4: Run Swagger and backend regression verification**

Run:

```bash
CI=true pnpm exec jest src/swagger-document.spec.ts --runInBand
CI=true pnpm exec jest --runInBand
CI=true pnpm run build
```

Expected: PASS. The complete unit suite and build must remain green because the
Swagger audit changes annotations/factory extraction only.

- [ ] **Step 5: Commit the Swagger contract work**

```bash
git add src/swagger-document.ts src/swagger-document.spec.ts src/main.ts \
  src/app.controller.ts src/modules/auth/auth.controller.ts \
  src/modules/marketplace/marketplace.controller.ts \
  src/modules/order/order.controller.ts src/modules/payment/payment.controller.ts \
  src/modules/transport/transport.controller.ts
git commit -m "docs: complete API Swagger contracts"
```

## Task 2: Add a Web Test Harness and Domain Contracts

**Repository:** `farm2fork-web`

**Files:**
- Create: `vitest.config.ts`
- Create: `test/setup.ts`
- Create: `lib/api/contracts.ts`
- Create: `lib/api/contracts.test.ts`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

**Interfaces:**
- Consumes: backend `AuthResultDto`, `ProductResponseDto`, `OrderResponseDto`,
  `PaymentResponseDto`, and list envelopes from the approved design.
- Produces: browser-safe TypeScript models and `pnpm test`.

- [ ] **Step 0: Create the web implementation branch from the approved design**

Run from `farm2fork-web`:

```bash
git switch feature/web-api-integration-design
git switch -c feature/web-buyer-api-integration
```

- [ ] **Step 1: Write the failing DTO-mapping test**

Create `lib/api/contracts.test.ts` with a backend product fixture containing
`id`, `farmerId`, `name`, `price`, `quantity`, `unit`, `images`,
`qualityGrade`, and `status`. Assert the mapper produces a `BuyerProduct` with
those fields and does not expose invented `farmName`, `rating`, `location`, or
`sales` keys:

```ts
expect(toBuyerProduct(apiProduct)).toEqual({
  id: '66a000000000000000000001',
  farmerId: '66a000000000000000000002',
  name: 'Roma Tomatoes',
  price: 120,
  quantity: 20,
  unit: 'kg',
  images: [],
  qualityGrade: 'A',
  status: 'active',
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run lib/api/contracts.test.ts`

Expected: FAIL because Vitest and `toBuyerProduct()` do not exist.

- [ ] **Step 3: Add the minimal test tooling and contract module**

Use pnpm to add `vitest`, `jsdom`, `@testing-library/react`, and
`@testing-library/jest-dom` as development dependencies. Add:

```json
"test": "vitest run",
"test:watch": "vitest"
```

to `package.json`. Do not modify the existing `package-lock.json`.

Configure `vitest.config.ts` with `environment: 'jsdom'`, `setupFiles:
['./test/setup.ts']`, and the `@` alias to the repository root. Define exact
backend response interfaces and pure mappers in `lib/api/contracts.ts`. Keep
`ApiError` as:

```ts
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly body?: unknown,
  ) {
    super(message);
  }
}
```

- [ ] **Step 4: Run the new web test suite**

Run: `pnpm test`

Expected: PASS with the mapper test. The test must run without a backend,
browser, or mock API server.

- [ ] **Step 5: Commit the web test and contract foundation**

```bash
git add package.json pnpm-lock.yaml vitest.config.ts test/setup.ts \
  lib/api/contracts.ts lib/api/contracts.test.ts
git commit -m "test: add web API contract coverage"
```

## Task 3: Implement the Replaceable Session and API Client

**Repository:** `farm2fork-web`

**Files:**
- Create: `lib/auth/web-session.ts`
- Create: `lib/auth/web-session.test.ts`
- Create: `lib/api/client.ts`
- Create: `lib/api/client.test.ts`

**Interfaces:**
- Consumes: `AuthResultDto` contract and `NEXT_PUBLIC_API_BASE_URL`.
- Produces: `WebSession`, `ApiClient`, and normalized `ApiError` instances for
  the buyer repository.

- [ ] **Step 1: Write failing session and request tests**

Test `WebSession.save()`, `read()`, and `clear()` with the exact
`farm2fork.web.session.v1` key. Test that `ApiClient.request()` sends:

```ts
headers: {
  Accept: 'application/json',
  Authorization: 'Bearer buyer-token',
}
```

when a session exists, and that a `401` response clears the session then throws
`new ApiError(401, 'Your session has expired.', body)`. Test a non-JSON `503`
response becomes an `ApiError` rather than a JSON parsing exception.

- [ ] **Step 2: Run the focused tests to verify they fail**

Run: `pnpm exec vitest run lib/auth/web-session.test.ts lib/api/client.test.ts`

Expected: FAIL because `WebSession` and `ApiClient` do not exist.

- [ ] **Step 3: Implement the session adapter and fetch wrapper**

Implement the browser-only adapter with this public shape:

```ts
export type BuyerSession = {
  accessToken: string;
  user: { id: string; email: string; role: 'buyer'; isVerified: boolean; isActive: boolean };
};

export const webSession = {
  read(): BuyerSession | null,
  save(session: BuyerSession): void,
  clear(): void,
};
```

`ApiClient` must reject a missing or empty `NEXT_PUBLIC_API_BASE_URL` before it
makes a request, append the configured API path once, serialize JSON only when
a body is present, attach the bearer token only when available, and parse a
backend `{ message }` body into a human-readable `ApiError`. It must not retry
any request internally.

- [ ] **Step 4: Run focused and complete web tests**

Run:

```bash
pnpm exec vitest run lib/auth/web-session.test.ts lib/api/client.test.ts
pnpm test
```

Expected: PASS. Confirm the token is confined to the session adapter/client
test fixtures and no module exports it into a UI state model.

- [ ] **Step 5: Commit session and API-client behavior**

```bash
git add lib/auth/web-session.ts lib/auth/web-session.test.ts \
  lib/api/client.ts lib/api/client.test.ts
git commit -m "feat: add web buyer session client"
```

## Task 4: Add Buyer Repository and Safe Cart Rules

**Repository:** `farm2fork-web`

**Files:**
- Create: `lib/buyer/buyer-repository.ts`
- Create: `lib/buyer/buyer-repository.test.ts`
- Create: `lib/cart/cart.ts`
- Create: `lib/cart/cart.test.ts`
- Modify: `components/types.ts`

**Interfaces:**
- Consumes: `ApiClient`, `BuyerProduct`, backend DTO contracts, and
  `webSession`.
- Produces: buyer login/session validation/product/order/payment methods and
  pure cart grouping helpers used by the React UI.

- [ ] **Step 1: Write failing repository/cart tests**

Add tests asserting:

```ts
expect(groupCartItemsByFarmer([
  { productId: 'p1', farmerId: 'f1', quantity: 2, product: productA },
  { productId: 'p2', farmerId: 'f2', quantity: 1, product: productB },
  { productId: 'p3', farmerId: 'f1', quantity: 3, product: productC },
])).toEqual([
  { farmerId: 'f1', items: expect.arrayContaining([expect.objectContaining({ productId: 'p1' }), expect.objectContaining({ productId: 'p3' })]) },
  { farmerId: 'f2', items: [expect.objectContaining({ productId: 'p2' })] },
]);
```

Also assert `addCartItem()` rejects quantities below one and a repository
checkout call sends exactly `{ items: [{ productId, quantity }],
shippingAddress }`, never client totals or `farmerId`.

- [ ] **Step 2: Run the focused tests to verify they fail**

Run: `pnpm exec vitest run lib/buyer/buyer-repository.test.ts lib/cart/cart.test.ts`

Expected: FAIL because buyer repository and cart functions do not exist.

- [ ] **Step 3: Implement repository methods and pure cart helpers**

Implement the following methods with the exact routes from the specification:

```ts
login(input: { email: string; password: string }): Promise<BuyerSession>
getCurrentBuyer(): Promise<BuyerSession['user']>
listProducts(query: ProductQuery): Promise<Paginated<BuyerProduct>>
getProduct(id: string): Promise<BuyerProduct>
createOrder(input: CreateOrderInput): Promise<BuyerOrder>
listOrders(query?: PaginationQuery): Promise<Paginated<BuyerOrder>>
initiatePayment(orderId: string, gateway: PaymentGateway): Promise<BuyerPayment>
listPayments(query?: PaymentQuery): Promise<Paginated<BuyerPayment>>
getPayment(id: string): Promise<BuyerPayment>
```

`login()` must reject a non-buyer response before it writes a session. Cart
helpers retain only product display snapshots and use `farmerId` solely for
local grouping; the request mapper omits it.

- [ ] **Step 4: Run repository/cart verification**

Run:

```bash
pnpm exec vitest run lib/buyer/buyer-repository.test.ts lib/cart/cart.test.ts
pnpm test
```

Expected: PASS. The tests prove no mixed-farmer request can be produced by one
cart group.

- [ ] **Step 5: Commit buyer data boundaries**

```bash
git add lib/buyer/buyer-repository.ts lib/buyer/buyer-repository.test.ts \
  lib/cart/cart.ts lib/cart/cart.test.ts components/types.ts
git commit -m "feat: add buyer checkout data layer"
```

## Task 5: Replace Mock Login and Marketplace Screens

**Repository:** `farm2fork-web`

**Files:**
- Create: `components/buyer/BuyerApp.tsx`
- Create: `components/buyer/BuyerApp.test.tsx`
- Modify: `app/page.tsx`
- Modify: `components/LoginScreen.tsx`
- Modify: `components/MarketplaceScreen.tsx`
- Modify: `components/ProductDetailScreen.tsx`
- Modify: `components/TopBar.tsx`
- Modify: `components/types.ts`

**Interfaces:**
- Consumes: `webSession`, buyer repository, cart helpers, and the current
  language/visual components.
- Produces: a protected real buyer shell with live product browse/detail and
  add-to-cart actions.

- [ ] **Step 1: Write failing buyer-shell tests**

Use Testing Library to assert that:

1. a saved buyer session causes `getCurrentBuyer()` before marketplace content
   appears;
2. a `401` renders login and clears protected buyer content;
3. a live product card uses a backend string ID and calls `getProduct(id)`;
4. the product detail and grid do not render mock farm name/rating/location or
   sales values; and
5. clicking Add adds an item with the backend product/farmer IDs to cart.

- [ ] **Step 2: Run the buyer-shell test to verify it fails**

Run: `pnpm exec vitest run components/buyer/BuyerApp.test.tsx`

Expected: FAIL because `BuyerApp` does not exist and `app/page.tsx` still uses
the mock `USERS` array and `PRODUCTS` data.

- [ ] **Step 3: Implement the protected buyer shell and convert product UI**

Move buyer session, navigation, product selection, cart state, and protected
loading/error state out of `app/page.tsx` into `BuyerApp`. Leave public
landing/signup and non-buyer route navigation intact. Wire `LoginScreen` to an
async submit state and display normalized login errors.

Update `MarketplaceScreen` props to receive paginated live products, loading,
error, query-change callbacks, `onViewProduct(id: string)`, and
`onAddToCart(product)`. Map the existing category/filter controls to valid
backend query fields; do not retain mock name-based category inference.

Update `ProductDetailScreen` to take a `BuyerProduct | null`, load/error
states, and `onAddToCart(product, quantity)`. Show only backend-owned product
fields. Update `TopBar` to take the authenticated buyer's email and cart count;
keep notifications visibly out of scope rather than rendering mock messages.

- [ ] **Step 4: Run screen and complete web tests**

Run:

```bash
pnpm exec vitest run components/buyer/BuyerApp.test.tsx
pnpm test
pnpm run lint
pnpm run build
```

Expected: PASS. The rendered buyer path contains no `buyer@test.com`, mock
users, numeric mock product IDs, or `PRODUCTS` imports.

- [ ] **Step 5: Commit live authentication and marketplace**

```bash
git add app/page.tsx components/buyer/BuyerApp.tsx \
  components/buyer/BuyerApp.test.tsx components/LoginScreen.tsx \
  components/MarketplaceScreen.tsx components/ProductDetailScreen.tsx \
  components/TopBar.tsx components/types.ts
git commit -m "feat: connect web buyer marketplace"
```

## Task 6: Implement Cart Checkout, Orders, and Payment Status

**Repository:** `farm2fork-web`

**Files:**
- Create: `components/buyer/CheckoutPanel.tsx`
- Create: `components/buyer/CheckoutPanel.test.tsx`
- Modify: `components/CartScreen.tsx`
- Modify: `components/OrdersScreen.tsx`
- Modify: `components/buyer/BuyerApp.tsx`
- Modify: `components/types.ts`

**Interfaces:**
- Consumes: farmer-grouped cart state, buyer repository, backend order/payment
  models, and the current buyer shell navigation.
- Produces: real group-by-group checkout and truthful order/payment displays.

- [ ] **Step 1: Write failing checkout tests**

Test a cart containing farmer groups `f1` and `f2`. Mock repository calls and
assert that `CheckoutPanel` calls `createOrder()` twice with separate item
arrays and the same validated address, then `initiatePayment()` once for each
created order. Add a timeout/rejected-write case:

```ts
repository.createOrder.mockRejectedValue(new ApiError(0, 'Network request failed'));
await user.click(screen.getByRole('button', { name: /place orders/i }));
expect(repository.createOrder).toHaveBeenCalledTimes(1);
expect(screen.getByText(/review orders before retrying/i)).toBeVisible();
```

Also test that known validation failure keeps that group in cart, a confirmed
order removes only its group, and a `pending` payment displays the backend
status without a success animation or simulate action.

- [ ] **Step 2: Run the checkout test to verify it fails**

Run: `pnpm exec vitest run components/buyer/CheckoutPanel.test.tsx`

Expected: FAIL because the cart is currently empty-only and checkout/payment
components do not exist.

- [ ] **Step 3: Implement truthful checkout and persisted read screens**

Replace `CartScreen`'s empty-only implementation with grouped lines,
quantity/remove controls, shipping-address fields (`street`, `city`,
`province`, optional `zip`), gateway selection (`jazzcash` or `stripe`), and
`CheckoutPanel`. Submit groups sequentially so each result is recorded before
the next write. Do not retry any `POST` internally. On an ambiguous write
failure, preserve the group and direct the buyer to refresh Orders/Payments.

Replace static order cards in `OrdersScreen` with repository-loaded orders and
associated payment state. Render only the backend order snapshots and payment
statuses (`pending`, `success`, `failed`, `refunded`). Do not add shipment
tracking, maps, payment polling, or a simulator control.

- [ ] **Step 4: Run checkout and complete web verification**

Run:

```bash
pnpm exec vitest run components/buyer/CheckoutPanel.test.tsx
pnpm test
pnpm run lint
pnpm run build
```

Expected: PASS. Confirm write tests make one order payload per farmer group and
never contain a client-calculated total or a `farmerId` field.

- [ ] **Step 5: Commit checkout and persisted reads**

```bash
git add components/buyer/CheckoutPanel.tsx \
  components/buyer/CheckoutPanel.test.tsx components/CartScreen.tsx \
  components/OrdersScreen.tsx components/buyer/BuyerApp.tsx components/types.ts
git commit -m "feat: add web buyer checkout flow"
```

## Task 7: Dockerize the Web Runtime and Document CORS

**Repositories:** `farm2fork-web`, `farm2fork-backend`

**Files:**
- Create: `farm2fork-web/Dockerfile`
- Create: `farm2fork-web/.dockerignore`
- Create: `farm2fork-web/docker-compose.yml`
- Create: `farm2fork-web/.env.example`
- Create: `farm2fork-web/test/docker-config.sh`
- Modify: `farm2fork-web/README.md`
- Modify: `farm2fork-backend/.env.example`
- Create: `farm2fork-backend/docs/web-browser-origin.md`

**Interfaces:**
- Consumes: `NEXT_PUBLIC_API_BASE_URL`, the backend HTTP port/API prefix, and
  `CORS_ORIGIN`.
- Produces: a reproducible web image and unambiguous local browser/container
  origin configuration.

- [ ] **Step 1: Write the failing Docker configuration assertion**

Create a shell verification script at `test/docker-config.sh` that requires an
explicit API URL and asserts the rendered Compose configuration includes a
`web` service, `NEXT_PUBLIC_API_BASE_URL`, port `3001:3000`, and no `env_file`:

```bash
test -n "${NEXT_PUBLIC_API_BASE_URL:-}"
docker compose --env-file .env.example config > "$config_file"
rg -q 'NEXT_PUBLIC_API_BASE_URL' "$config_file"
! rg -q 'env_file:' "$config_file"
```

- [ ] **Step 2: Run the assertion to verify it fails**

Run: `NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api bash test/docker-config.sh`

Expected: FAIL because no Dockerfile, Compose service, example environment, or
verification script exists.

- [ ] **Step 3: Add Docker assets and browser-origin documentation**

Create a multi-stage Node image that installs with `pnpm install --frozen-lockfile`,
builds with `ARG NEXT_PUBLIC_API_BASE_URL`, sets the same value as an `ENV` for
the build, and runs `pnpm start -p 3000`. Exclude `node_modules`, `.next`,
`.git`, and local environment files in `.dockerignore`.

Create `docker-compose.yml` with an explicit required interpolation:

```yaml
services:
  web:
    build:
      context: .
      args:
        NEXT_PUBLIC_API_BASE_URL: ${NEXT_PUBLIC_API_BASE_URL:?NEXT_PUBLIC_API_BASE_URL is required}
    environment:
      NEXT_PUBLIC_API_BASE_URL: ${NEXT_PUBLIC_API_BASE_URL:?NEXT_PUBLIC_API_BASE_URL is required}
    ports:
      - '3001:3000'
```

Do not add a database, Redis, Fabric network, credentials, or `env_file`.
Document that a browser visiting `http://localhost:3001` requires the backend
to set `CORS_ORIGIN=http://localhost:3001` and that a deployed browser URL—not
the Docker service hostname—is the public API base URL.

- [ ] **Step 4: Run Docker config, web tests, lint, and build verification**

Run:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api bash test/docker-config.sh
pnpm test
pnpm run lint
pnpm run build
```

Expected: PASS. The Compose render includes only public web API configuration.

- [ ] **Step 5: Commit Docker and CORS documentation**

```bash
git -C farm2fork-web add Dockerfile .dockerignore docker-compose.yml .env.example \
  test/docker-config.sh README.md
git -C farm2fork-web commit -m "chore: dockerize web buyer app"
git -C farm2fork-backend add .env.example docs/web-browser-origin.md
git -C farm2fork-backend commit -m "docs: document web browser CORS"
```

## Task 8: Record Handoff and Verify the Cross-Repository Boundary

**Repositories:** `farm2fork-web`, `farm2fork-backend`, `farm2fork-mobile`

**Files:**
- Modify: `farm2fork-web/README.md`
- Modify: `farm2fork-backend/docs/web-browser-origin.md`
- Modify: `farm2fork-mobile/PROGRESS.md`

**Interfaces:**
- Consumes: passing Swagger, web tests, Docker configuration, and build output.
- Produces: an accurate project status with no unverified browser/device or
  normal-flow payment claims.

- [ ] **Step 1: Record exact automated verification outcomes**

Update documentation to state the exact successful commands and test counts:

```bash
CI=true pnpm exec jest src/swagger-document.spec.ts --runInBand
CI=true pnpm exec jest --runInBand
pnpm test
pnpm run lint
pnpm run build
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api bash test/docker-config.sh
```

State explicitly that browser UI QA, the user-initiated normal
payment/shipment Fabric smoke, physical-device testing, real payment-provider
redirects, and the target HTTP-only-cookie architecture are not verified by
these automated checks.

- [ ] **Step 2: Verify documentation has no false claims**

Run:

```bash
git -C farm2fork-web diff --check
git -C farm2fork-backend diff --check
git -C farm2fork-mobile diff --check
```

Expected: PASS. Confirm the tracker calls the web buyer path real only after
the relevant tests/builds pass and leaves unrun smoke checks pending.

- [ ] **Step 3: Commit the cross-repository handoff records**

```bash
git -C farm2fork-web add README.md
git -C farm2fork-web commit -m "docs: record web buyer integration verification"
git -C farm2fork-mobile add PROGRESS.md
git -C farm2fork-mobile commit -m "docs: record web buyer integration progress"
```

## Plan Self-Review

### Spec coverage

- Temporary session storage, the HTTP-only-cookie migration boundary, and token
  handling are covered by Tasks 3 and 5.
- Real buyer login, products, cart grouping, order creation, payment
  initiation/status, and truthful error behavior are covered by Tasks 4–6.
- The complete six-controller Swagger requirement and its regression test are
  covered by Task 1.
- Docker, explicit public API configuration, and CORS documentation are covered
  by Task 7.
- Verification/handoff and explicitly unverified smoke boundaries are covered
  by Task 8.

### Consistency checks

- All later buyer UI tasks consume `WebSession`, `ApiClient`, repository, and
  cart helpers introduced earlier.
- Checkout calls `createOrder()` before `initiatePayment()` and never depends on
  a local simulated payment result.
- Docker uses the same exact `NEXT_PUBLIC_API_BASE_URL` identifier in the
  client, Compose, test script, and documentation.
- No task changes the business or authorization behavior of backend endpoints.
