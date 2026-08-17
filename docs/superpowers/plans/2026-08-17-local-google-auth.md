# Local Google Authentication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Google sign-in work from the local HTTP web app while preserving HTTPS redirect authentication in production.

**Architecture:** The Firebase client derives the project-hosted `firebaseapp.com` auth domain only when the browser origin is local HTTP and uses popup sign-in for that case. HTTPS environments retain the configured app-host auth domain, Firebase redirect flow, and Next `/__/auth/*` proxy. Both branches return the same Firebase user to the existing role onboarding and HTTP-only backend session flow.

**Tech Stack:** Next.js 16, React 19, Firebase Auth 12, TypeScript, Vitest, Docker Compose.

## Global Constraints

- Browser JavaScript must never store a backend JWT or session cookie value.
- Local HTTP is restricted to `localhost` and `127.0.0.1`; all other origins use the production redirect branch.
- Public self-service roles remain buyer, farmer, and transporter.
- The existing backend Firebase ID-token exchange, CSRF guard, and role onboarding endpoints do not change.
- Google popup failures must surface through the existing UI error flow; do not silently retry via redirect.
- Do not push or commit directly to `main`; use small, scoped local commits.

---

## File structure

- `lib/firebase/client.ts`: owns Firebase config resolution and local-vs-production Google transport selection.
- `lib/firebase/client.test.ts`: proves environment config and Google transport behavior with mocked Firebase Auth SDK calls.
- `.env.example`: documents the production redirect-domain value and the local derivation rule.
- `README.md`: documents local popup sign-in, Firebase Console authorization, and HTTPS production redirect requirements.

### Task 1: Specify and prove auth-domain and transport selection

**Files:**
- Modify: `lib/firebase/client.ts`
- Modify: `lib/firebase/client.test.ts`

**Interfaces:**
- Produces: `resolveFirebaseAuthDomain(environment, origin): string`
- Produces: `shouldUseGooglePopup(origin): boolean`
- Consumes: `FirebasePublicEnvironment`, `Location`-compatible `{ protocol: string; hostname: string }`
- Consumes: Firebase SDK `signInWithPopup`, `signInWithRedirect`, `GoogleAuthProvider`

- [ ] **Step 1: Write failing domain-selection tests**

```ts
test("derives the hosted Firebase auth domain for local HTTP", () => {
  expect(
    client.resolveFirebaseAuthDomain(environment, {
      protocol: "http:",
      hostname: "localhost",
    }),
  ).toBe("farm2fork.firebaseapp.com");
});

test("keeps the configured app auth domain for HTTPS", () => {
  expect(
    client.resolveFirebaseAuthDomain(environment, {
      protocol: "https:",
      hostname: "farm2fork.example.com",
    }),
  ).toBe("farm2fork.example.com");
});
```

- [ ] **Step 2: Verify the tests fail before implementation**

Run: `pnpm vitest run lib/firebase/client.test.ts`

Expected: FAIL because `resolveFirebaseAuthDomain` does not exist.

- [ ] **Step 3: Write failing Google-transport tests**

```ts
test("uses a Google popup from local HTTP", async () => {
  await gatewayFor({ protocol: "http:", hostname: "127.0.0.1" })
    .signInWithGoogle();

  expect(signInWithPopup).toHaveBeenCalledOnce();
  expect(signInWithRedirect).not.toHaveBeenCalled();
});

test("uses a Google redirect from HTTPS", async () => {
  await gatewayFor({ protocol: "https:", hostname: "farm2fork.example.com" })
    .signInWithGoogle();

  expect(signInWithRedirect).toHaveBeenCalledOnce();
  expect(signInWithPopup).not.toHaveBeenCalled();
});
```

Mock `firebase/app` and `firebase/auth` at the top of `client.test.ts`; return a
stable fake `Auth` from `getAuth`, make `setPersistence` resolve, and make
`signInWithPopup` resolve `{ user: fakeUser }`.

- [ ] **Step 4: Verify transport tests fail before implementation**

Run: `pnpm vitest run lib/firebase/client.test.ts`

Expected: FAIL because the current gateway always calls `signInWithRedirect`.

- [ ] **Step 5: Implement the minimum client boundary**

Add these functions to `lib/firebase/client.ts`:

```ts
export type FirebaseBrowserOrigin = Pick<Location, "protocol" | "hostname">;

export function shouldUseGooglePopup(origin: FirebaseBrowserOrigin): boolean {
  return origin.protocol === "http:" &&
    (origin.hostname === "localhost" || origin.hostname === "127.0.0.1");
}

export function resolveFirebaseAuthDomain(
  environment: FirebasePublicEnvironment,
  origin: FirebaseBrowserOrigin,
): string {
  const projectId = requirePublicFirebaseValue(
    environment,
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  );
  if (shouldUseGooglePopup(origin)) return `${projectId}.firebaseapp.com`;
  return requirePublicFirebaseValue(
    environment,
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  );
}
```

Pass `window.location` only inside browser-only Firebase initialization. Use
`resolveFirebaseAuthDomain` when building Firebase config. In
`signInWithGoogle`, await and return `signInWithPopup(auth, provider)` locally;
otherwise retain `signInWithRedirect(auth, provider)` and return `null`.

- [ ] **Step 6: Verify focused tests pass**

Run: `pnpm vitest run lib/firebase/client.test.ts`

Expected: PASS with the local popup and HTTPS redirect assertions both green.

- [ ] **Step 7: Commit the client boundary**

```bash
git add lib/firebase/client.ts lib/firebase/client.test.ts
git commit -m "fix(auth): use popup Google sign-in locally"
```

### Task 2: Align developer documentation with the two environments

**Files:**
- Modify: `.env.example`
- Modify: `README.md`

**Interfaces:**
- Consumes: `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- Produces: exact local and production Firebase configuration instructions.

- [ ] **Step 1: Write a failing documentation assertion**

```ts
test("documents local popup auth and production HTTPS redirect auth", () => {
  const readme = readFileSync("README.md", "utf8");
  expect(readme).toContain("signInWithPopup");
  expect(readme).toContain("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
  expect(readme).toContain("firebaseapp.com");
});
```

Place this test in `lib/firebase/auth-redirect-proxy.test.ts` and import
`readFileSync` from `node:fs`.

- [ ] **Step 2: Verify the assertion fails**

Run: `pnpm vitest run lib/firebase/auth-redirect-proxy.test.ts`

Expected: FAIL because the README currently states that local development must
use `localhost:3001` as `authDomain` and forbids `firebaseapp.com`.

- [ ] **Step 3: Update documentation and `.env.example`**

Replace the local `authDomain` guidance with:

```dotenv
# Local HTTP derives the Firebase hosted auth domain from the project ID and uses a popup.
# Set this only to the HTTPS app host used by production redirect auth.
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
```

Document that local development needs `NEXT_PUBLIC_FIREBASE_PROJECT_ID` and an
authorized `localhost` Firebase domain, while production needs the HTTPS app
host in `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, a transparent proxy for
`/__/auth/*`, and a provider callback made by appending
`/__/auth/handler` to that configured HTTPS host.

- [ ] **Step 4: Verify documentation and existing proxy tests pass**

Run: `pnpm vitest run lib/firebase/auth-redirect-proxy.test.ts`

Expected: PASS, including the existing transparent Firebase helper rewrite.

- [ ] **Step 5: Commit documentation**

```bash
git add .env.example README.md lib/firebase/auth-redirect-proxy.test.ts
git commit -m "docs(auth): clarify local Google sign-in"
```

### Task 3: Validate the production artifact and local runtime

**Files:**
- Modify: none

**Interfaces:**
- Consumes: the current web Docker Compose build args and the live backend at `http://localhost:3002/api`
- Produces: verified local popup-capable web image.

- [ ] **Step 1: Run the complete web test suite**

Run: `CI=true pnpm test`

Expected: PASS with no failing tests.

- [ ] **Step 2: Build the production web artifact**

Run: `NEXT_PUBLIC_API_BASE_URL=http://localhost:3002/api NEXT_PUBLIC_FIREBASE_API_KEY=test NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=farm2fork.example.com NEXT_PUBLIC_FIREBASE_PROJECT_ID=farm2fork-2a5b9 NEXT_PUBLIC_FIREBASE_APP_ID=test NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=test pnpm run build`

Expected: exit code 0.

- [ ] **Step 3: Rebuild and recreate the local web container**

Run: `docker compose build web && docker compose up -d --force-recreate web`

Expected: `f2f-web` is running on host port 3001.

- [ ] **Step 4: Verify the live helper and API boundaries**

Run:

```bash
curl --fail --silent http://localhost:3001/__/auth/handler >/dev/null
curl --fail --silent http://localhost:3002/api/health >/dev/null
```

Expected: both commands exit 0.

- [ ] **Step 5: Manually verify Google sign-in**

Open `http://localhost:3001`, select Google sign-in, complete the consent flow,
and confirm that no `https://localhost:3001` navigation occurs. A new Firebase
identity must reach role selection; a returning identity must restore its
backend role session through `/api/auth/web/session`.

- [ ] **Step 6: Commit only if Task 3 requires a source change**

No commit is expected for verification-only work. Do not commit Docker images,
container state, or ignored Firebase configuration.
