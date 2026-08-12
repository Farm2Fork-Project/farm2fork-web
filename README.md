# Farm2Fork web app

Buyer, farmer, and transporter routes use the Nest API directly. Their browser-visible configuration is
limited to `NEXT_PUBLIC_API_BASE_URL`; do not put MongoDB, Redis, Fabric, JWT,
or payment-provider secrets in this application or image.

## Local development

Copy `.env.example` to `.env.local` and set the API base when necessary. The
current Nest service has the `/api` route prefix; `API_VERSION=v1` is Swagger
metadata, not a URL segment.

```bash
pnpm dev
```

For the normal host-port setup, use `http://localhost:3000/api` as the API
base. The backend must allow the web origin through `CORS_ORIGIN`, for example
`CORS_ORIGIN=http://localhost:3001` for the Compose command below. This buyer
slice uses bearer tokens and does not request browser credentials; the future
HTTP-only cookie design will need an explicit non-wildcard CORS origin.

## Docker runtime

No Compose `env_file` is used. Supply the public API base explicitly at build
and runtime:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api docker compose up --build
```

The web app is available at `http://localhost:3001`. `NEXT_PUBLIC_*` values are
embedded in the browser bundle during the image build, so rebuild after changing
the API base.

## Real role onboarding

- Buyer: open `/`, choose Buyer, and create an account.
- Farmer: open `/farmer?signup=true`; a farmer can then create and view their
  own API-backed listings.
- Transporter: open `/transporter?signup=true`.

All roles use the same short-lived browser session, but each portal validates
its expected role with `GET /api/auth/me`. The farmer requires a CNIC and farm
name. The transporter requires a CNIC, vehicle type/number, driving licence
number, and at least one service area.

The user-owned multi-role smoke sequence is: register a farmer, create a
product, register a buyer, complete a configured payment, then register/login a
transporter. Transporter shipment discovery and self-claim are not connected to
the web UI yet, and a real transporter delivery cannot exist until payment is
settled. Automated checks do not create Atlas data or simulate payments.

## Verification

```bash
CI=true pnpm test
CI=true pnpm run build
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api docker compose build
```
