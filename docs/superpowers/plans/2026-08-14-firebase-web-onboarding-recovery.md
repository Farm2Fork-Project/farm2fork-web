# Firebase Web Onboarding Recovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Complete secure Firebase Google and email/password onboarding for buyer, farmer, and transporter web users.

**Architecture:** Firebase continues to authenticate; the backend continues to create HTTP-only application sessions and own roles. The Next server transparently proxies Firebase's redirect helpers through the web origin. A short-lived, email-only onboarding intent lets a verified Firebase identity select a public role before the portal-specific profile form submits its Firebase ID token.

**Tech Stack:** Next.js 16, React 19, Firebase Auth, TypeScript, Vitest, Docker Compose.

## Global Constraints

- Keep Firebase credentials and backend JWTs out of browser storage.
- The onboarding intent contains only a verified email; Firebase signs out after session exchange or onboarding succeeds.
- Public self-service roles are buyer, farmer, and transporter; admin and financial partner remain provisioned or allowlisted.
- Keep Docker build inputs explicit and document the required Firebase OAuth configuration.
- Use focused tests, small related commits, and never push or commit directly to main.

### Task 1: Preserve a pending Firebase onboarding identity

**Files:**

- Create: `lib/auth/firebase-onboarding-intent.ts`
- Create: `lib/auth/firebase-onboarding-intent.test.ts`
- Modify: `lib/auth/firebase-web-auth-repository.ts`
- Modify: `lib/auth/firebase-web-auth-repository.test.ts`

- [x] Write failing tests that a Firebase onboarding result saves only a normalized email and that a portal can read the currently authenticated Firebase email.
- [x] Run `pnpm vitest run lib/auth/firebase-onboarding-intent.test.ts lib/auth/firebase-web-auth-repository.test.ts` and verify failure.
- [x] Implement the email-only session-storage intent and repository access to the current Firebase identity; do not expose Firebase tokens.
- [x] Re-run the focused tests and commit the completed boundary.

### Task 2: Route all first-time identities through role choice

**Files:**

- Modify: `app/page.tsx`
- Modify: `app/farmer/page.tsx`
- Modify: `app/transporter/page.tsx`

- [x] Add tests for onboarding-result handling that would fail if a new Firebase identity is sent directly to buyer onboarding or if verified email onboarding is left unfinished.
- [x] Run the focused tests and verify failure.
- [x] Make buyer, farmer, and transporter flows save the pending identity and use the one shared role-selection route. Make a verified email signup continue through its stored profile after `ONBOARDING_REQUIRED` is returned as a result.
- [x] Re-run the focused tests and commit the cross-role web behavior.

### Task 3: Make Firebase redirect helpers same-origin and Docker-ready

**Files:**

- Modify: `next.config.ts`
- Modify: `.env.example`
- Modify: `README.md`
- Modify: `docker-compose.yml`

- [x] Add a focused config test for the public Firebase auth domain and proxy target, then verify it fails.
- [x] Add the transparent `/__/auth/*` rewrite to the configured Firebase helper domain; document `localhost:3001` for development and the deployed web host for production.
- [x] Document the required Google OAuth redirect URI `https://<web-domain>/__/auth/handler` and Firebase authorized-domain update; do not perform external console changes without user credentials.
- [x] Run focused tests, the full web test suite, and production build. The standalone proxy returned 200 for `/__/auth/handler`; Docker Compose parses with the new variables. A cold Docker image build did not complete because its dependency-download session was interrupted before the app build stage.
