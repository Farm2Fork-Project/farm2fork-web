# Farm2Fork web app

Buyer, farmer, and transporter routes use Firebase Auth plus the Nest API.
Browser-visible values are limited to `NEXT_PUBLIC_*` configuration; do not put
MongoDB, Redis, Fabric, Firebase Admin, JWT, or payment-provider secrets in
this application or image.

## Local development

Copy `.env.example` to `.env.local` and set the API base and Firebase web
configuration. The Nest service has the `/api` route prefix; `API_VERSION=v1`
is Swagger metadata, not a URL segment.

For local development:

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:3002/api
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=localhost:3001
```

```bash
pnpm dev
```

The backend must allow the exact web origin through `CORS_ORIGIN` and
`WEB_APP_ORIGIN`, for example `http://localhost:3001`. Browser requests use
credentialed, HTTP-only backend sessions and the `X-Farm2Fork-CSRF` header.

## Docker runtime

No Compose `env_file` is used. Supply the public API base explicitly at build
and runtime:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3002/api \
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=localhost:3001 \
docker compose up --build
```

The web app is available at `http://localhost:3001`. `NEXT_PUBLIC_*` values are
embedded in the browser bundle during the image build, so rebuild after changing
the API base or Firebase auth domain.

## Firebase Google redirect setup

Firebase redirect helpers are served through Next at `/__/auth/*` and proxied
transparently to the Firebase project. This keeps the helper on the same origin
as the app and works in the Docker runtime.

For each web environment, set `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` to the exact
web authority (`localhost:3001` locally; the deployed web host in production),
then configure Firebase/Google OAuth to allow:

```text
https://<web-domain>/__/auth/handler
```

For local HTTP development, use `http://localhost:3001/__/auth/handler` when
the OAuth configuration permits it. Add the same host to Firebase
Authentication's Authorized domains. Do not point `authDomain` at
`<project>.firebaseapp.com`; that helper configuration is unavailable for this
project and is the cause of the prior redirect failure.

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
