# Web Role Onboarding Design

## Goal

Make the web application capable of creating and restoring real buyer, farmer,
and transporter accounts through the existing backend API. A registered farmer
must also be able to publish and view their real marketplace products.

## Scope

This slice covers:

- Shared browser session handling for `buyer`, `farmer`, and `transporter`.
- Real role-specific registration and login against the existing auth API.
- Route-level role gating so a buyer token cannot enter a farmer or transporter
  dashboard, and vice versa.
- Farmer product creation and the farmer's own product list using the existing
  marketplace API.
- Focused unit and component tests for the API contracts and role flows.

This slice does not cover real transporter shipment discovery or claiming,
payment-provider settlement, email verification, password recovery, product
editing/deletion, image upload, or replacing the remaining dashboard mock data.

## Existing API Contracts

The backend already owns identity, authorization, and persistence:

| Role | Registration endpoint | Required request fields |
| --- | --- | --- |
| Buyer | `POST /api/auth/register/buyer` | `email`, `password`, `businessName`, `businessType`, `cnic` |
| Farmer | `POST /api/auth/register/farmer` | `email`, `password`, `farmName`, `cnic` |
| Transporter | `POST /api/auth/register/transporter` | `email`, `password`, `vehicleType`, `vehicleNumber`, `licenseNumber`, `cnic` |

All roles authenticate through `POST /api/auth/login` and receive the existing
`AuthResultDto` JWT response. `GET /api/auth/me` remains the authoritative
session validation endpoint. Farmer listing endpoints are `POST /api/products`
and `GET /api/products/mine`; the backend authorizes both as farmer-only.

## Architecture

### Shared role session

Replace the buyer-only `BuyerSession` validation with a discriminated
`WebSession` whose user role is one of `buyer`, `farmer`, or `transporter`.
Continue using `sessionStorage` and the existing versioned key; reject malformed
or admin sessions and clear them. The access token is sent only in the existing
Bearer header path.

`RoleAuthRepository` wraps `ApiClient` and exposes:

- `login(credentials, expectedRole)`;
- `registerBuyer(input)`;
- `registerFarmer(input)`;
- `registerTransporter(input)`; and
- `getCurrentUser(expectedRole)`.

Each method validates the returned role before persisting the session. A role
mismatch is an explicit 403 application error, never a client-side role flag.
The existing `BuyerRepository` may consume this shared session unchanged in
behavior; duplication of HTTP and role-validation logic is removed rather than
creating independent farmer and transporter token stores.

### Route behavior

`/`, `/farmer`, and `/transporter` each restore the shared session after mount.
They validate it with `GET /auth/me`, clear it on an expired or invalid token,
and render only their matching role dashboard. A valid session for a different
role receives a clear access error and is not allowed into the page.

The role signup cards retain the current route destinations. Their forms map
only persisted values to backend DTOs:

- Farmer: email, strong password, optional phone, CNIC, farm name, optional
  acreage, location, and crop types. First and last name are removed because
  the backend has no persisted field for them.
- Transporter: email, strong password, optional phone, CNIC, vehicle type,
  vehicle number, driving licence number, and one or more service areas.
  Vehicle number and driving licence number remain distinct values.

Frontend validation handles missing fields, basic email/CNIC shape, password
confirmation, finite non-negative acreage, and at least one non-empty service
area. Backend validation remains authoritative. API validation, conflict, and
network failures are rendered in the corresponding existing form rather than
being hidden or silently treated as success.

### Farmer product slice

The farmer dashboard obtains its listings from `GET /products/mine` after the
farmer session is validated. The existing Create Listing form maps its UI values
to the backend contract:

- category values become lowercase API categories;
- UI `liter` becomes API `litre`;
- grades remain `A`, `B`, or `C`; and
- a successful `POST /products` prepends the returned product and returns the
  dashboard to the listings tab.

Mock seed listings and `farmer_listings` localStorage persistence are removed
from the listing path. Unrelated mock-only dashboard features stay explicitly
out of scope.

## Error Handling and Security

- The public API base URL remains a required Compose build variable; no runtime
  secrets are introduced in the web image.
- Client fetch errors retain a safe user-facing message and do not expose token
  or environment data.
- A 401 clears the browser session. A 403 role mismatch does not overwrite a
  valid session for another portal.
- No registration test creates real Atlas data; repository tests use a request
  double and component tests use an in-memory session store.

## Verification

- Test the generalized session guard against valid roles, admin rejection,
  malformed storage, expiry clearing, and mismatched portal roles.
- Test each registration method's endpoint, exact DTO payload, role check, and
  persisted session result.
- Test farmer and transporter form field mapping, validation, backend-error
  display, and success navigation.
- Test farmer product category/unit mapping and create/list repository calls.
- Run the relevant test files, all web tests, TypeScript/Next build, then build
the Docker image with `NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api`.
- Browser smoke remains user-owned until the local browser cache issue is
resolved; no synthetic accounts will be created against Atlas.

## Acceptance Criteria

1. Each of buyer, farmer, and transporter can register and login through the
   respective real backend endpoint and receives only the correct portal.
2. A real farmer can create a product and see it in their own listing view.
3. A buyer or transporter token cannot render the farmer dashboard, and the
   analogous cross-role cases are rejected.
4. Form and API errors are visible, and no success path relies on the legacy
   `localStorage.role` flag or mock credentials.
5. The documented scope is delivered through small, related commits without a
   push or direct commit to `main`.
