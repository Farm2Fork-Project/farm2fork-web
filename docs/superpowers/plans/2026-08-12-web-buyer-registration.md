# Web Buyer Registration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow a new buyer to register through the real backend and enter the buyer application with the returned session.

**Architecture:** The buyer repository gains one typed `registerBuyer` method that posts the exact backend DTO and saves only a buyer `AuthResultDto`. A focused registration form owns form validation and submission state; `app/page.tsx` owns the resulting session and remains the one buyer entry point. `/login` delegates to that entry point instead of retaining fake credentials.

**Tech Stack:** Next.js 16, React 19, TypeScript, Vitest, Testing Library, NestJS Auth API, Docker Compose.

## Global Constraints

- Work only on `feature/web-buyer-api-integration`; do not push or touch `main`.
- Make small related commits; branch and commit names must not mention Codex.
- Use `POST /api/auth/register/buyer`; do not create mock users or bypass backend validation.
- Required registration fields are `businessName`, `businessType`, `cnic`, `email`, and strong `password`; `phone` and addresses remain optional.
- Persist the returned JWT only through the existing versioned `sessionStorage` adapter; reject a non-buyer result before saving it.
- Do not alter payment, checkout, Fabric, Docker API URL, or backend runtime behavior.

---

### Task 1: Add the registration contract and repository behavior

**Files:**
- Modify: `lib/api/contracts.ts`
- Modify: `lib/buyer/buyer-repository.ts`
- Modify: `lib/buyer/buyer-repository.test.ts`

**Interfaces:**
- Produces `RegisterBuyerRequest` and `BuyerRepository.registerBuyer(input): Promise<BuyerSession>`.
- Consumes the existing `ApiAuthResult` and `toBuyerSession` role guard.

- [ ] Write a failing test asserting `registerBuyer` posts exactly to `/auth/register/buyer` and saves a returned buyer session.
- [ ] Run `CI=true pnpm exec vitest run lib/buyer/buyer-repository.test.ts` and confirm it fails because the method does not exist.
- [ ] Define the typed request and add the minimal repository method using `toBuyerSession`.
- [ ] Rerun the focused repository test and confirm it passes.

### Task 2: Render and submit the real buyer registration form

**Files:**
- Modify: `components/SignUpFormScreen.tsx`
- Modify: `components/types.ts`
- Modify: `app/page.tsx`
- Modify: `app/login/page.tsx`
- Create: `components/SignUpFormScreen.test.tsx`

**Interfaces:**
- Consumes `RegisterBuyerRequest` and an async `onSubmit(input)` callback.
- Produces a buyer registration screen that reports local validation/API errors and submits valid backend input.

- [ ] Write a failing UI test that completes business name, business type, CNIC, email, password, and confirmation, then asserts the exact registration request passed to the callback.
- [ ] Run `CI=true pnpm exec vitest run components/SignUpFormScreen.test.tsx` and confirm it fails because the form does not have backend-required fields.
- [ ] Replace the stale full-name form with the backend-required buyer fields, password confirmation, optional phone, and submission state. Selecting Buyer opens this form; success sets the same buyer session used by login.
- [ ] Replace `/login` hard-coded credentials with a redirect to `/?auth=login`; make `auth=signup` open the role selector.
- [ ] Rerun component and repository tests and confirm they pass.

### Task 3: Verify and record the buyer-registration path

**Files:**
- Modify: `farm2fork-mobile/PROGRESS.md`

- [ ] Run `CI=true pnpm test`, `CI=true pnpm run build`, and `NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api docker compose build`.
- [ ] Commit the related web UI, tests, and approved design/plan with `feat: register buyers through web`.
- [ ] Record verification and the remaining live-backend browser smoke in the central tracker, then commit only the tracker on mobile `develop`.
