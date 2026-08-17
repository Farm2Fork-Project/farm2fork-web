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
NEXT_PUBLIC_FIREBASE_PROJECT_ID=farm2fork-2a5b9
# Required by the Docker build; local HTTP derives the Firebase hosted domain.
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=farm2fork-2a5b9.firebaseapp.com
```

```bash
pnpm dev
```

The backend must allow the exact web origin through `CORS_ORIGIN` and
`WEB_APP_ORIGIN`, for example `http://localhost:3001`. Browser requests use
credentialed, HTTP-only backend sessions and the `X-Farm2Fork-CSRF` header.

Local HTTP Google sign-in uses `signInWithPopup`. It does not use the
same-origin Firebase redirect helper because Firebase redirect authentication
opens its `authDomain` over HTTPS. Add `localhost` to Firebase Authentication's
Authorized domains before testing; Firebase projects created after April 2025
do not add it automatically.

## Docker runtime

No Compose `env_file` is used. Supply the public API base explicitly at build
and runtime:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3002/api \
NEXT_PUBLIC_FIREBASE_PROJECT_ID=farm2fork-2a5b9 \
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=farm2fork-2a5b9.firebaseapp.com \
docker compose up --build
```

The web app is available at `http://localhost:3001`. `NEXT_PUBLIC_*` values are
embedded in the browser bundle during the image build, so rebuild after changing
the API base or Firebase auth domain.

## Firebase Google authentication setup

Firebase redirect helpers are served through Next at `/__/auth/*` and proxied
transparently to the Firebase project for deployed HTTPS environments. This
keeps the helper on the same origin when the app is served over HTTPS.

For production, set `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` to the exact HTTPS web
authority that serves this app, then configure Firebase/Google OAuth to allow
that authority with the `/__/auth/handler` path. For example:

```text
https://<web-domain>/__/auth/handler
```

Do not configure local HTTP as the Firebase redirect `authDomain`: that makes
the SDK open `https://localhost:3001` and causes `ERR_SSL_PROTOCOL_ERROR`.
Local development instead uses the project-hosted `firebaseapp.com` auth domain
and a popup.

## Real role onboarding

- Buyer: open `/`, choose Buyer, and create an account.
- Farmer: open `/farmer?signup=true`; a farmer can then create and view their
  own API-backed listings.
- Transporter: open `/transporter?signup=true`.

All roles use the same short-lived browser session, but each portal validates
its expected role with `GET /api/auth/me`. The farmer requires a CNIC and farm
name. The transporter requires a CNIC, vehicle type/number, driving licence
number, and at least one service area.

## Local marketplace simulator walkthrough

The local payment simulator is deliberately a development-only stand-in for a
payment provider. It is not a Firebase or media feature, and no Cloudinary
configuration is required for this flow.

1. Register as a farmer and create an active listing.
2. Register as a buyer, add that listing to the cart, and submit an order.
3. Open Buyer **Orders** and select **Simulate payment success** for the
   pending payment. The API marks the order paid and makes the delivery
   claimable.
4. Register as a transporter, open **Shipments**, claim the available delivery,
   and progress it from `assigned` to `picked_up`, `in_transit`, and
   `delivered`. Each status update requires a delivery note.
5. Refresh Buyer **Orders** and Farmer **Orders** to see the shared lifecycle
   state and shipment history.

Automated checks do not create Atlas data or simulate marketplace payments.

## Verification

```bash
CI=true pnpm test
CI=true pnpm run build
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api docker compose build
```
