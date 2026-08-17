# Local Google Authentication Design

## Goal

Make Google sign-in work in local HTTP development without weakening the
production redirect flow or exposing backend credentials/tokens to browser
storage.

## Problem

The Firebase redirect SDK always opens the configured `authDomain` over HTTPS.
Local Farm2Fork runs at `http://localhost:3001`, so the current same-origin
redirect configuration tries to load `https://localhost:3001/__/auth/handler`
and fails with `ERR_SSL_PROTOCOL_ERROR` before the Nest API is contacted.

## Design

Authentication transport is selected from the explicit browser environment:

- Local HTTP (`localhost` or `127.0.0.1`): Firebase uses its project-hosted
  `firebaseapp.com` auth domain and `signInWithPopup`.
- HTTPS application origins: Firebase keeps the application origin as
  `authDomain`, uses `signInWithRedirect`, and Next transparently proxies
  `/__/auth/*` to Firebase.

Both transports return the same Firebase user to the existing onboarding and
HTTP-only backend-session flow. The backend contract, CSRF rules, and role
onboarding routes do not change.

## Configuration

The web app derives its local-development auth domain as
`${NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseapp.com`. Production must
explicitly provide its HTTPS application host as the redirect auth domain. The
Firebase console must list `localhost` as an authorized domain for local
development and Google OAuth must authorize the production callback at
`https://<configured-production-web-host>/__/auth/handler`.

## Error Handling

Popup-blocked, cancelled, and Firebase provider errors continue through the
existing sign-in error path. The app must not silently fall back from a failed
popup to redirect, because that would recreate the HTTPS-localhost failure.

## Tests

- Client configuration selects the hosted Firebase auth domain only for a
  local HTTP origin.
- Google sign-in calls the popup transport locally and redirect transport on
  HTTPS origins.
- Existing redirect-helper rewrite remains present for production.

## Verification

Run the focused web auth tests and production build, rebuild the web Docker
image, then manually complete Google sign-in locally. Confirm the Firebase
user reaches the existing role-selection or returning-session flow and that
the backend exchanges the ID token successfully.
