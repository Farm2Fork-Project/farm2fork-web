# Web Role Onboarding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Enable real buyer, farmer, and transporter onboarding on the web, and let an authenticated farmer create and view backend marketplace products.

**Architecture:** Generalize the versioned browser session into a three-role discriminated session and centralize role validation plus auth HTTP calls in RoleAuthRepository. Keep portal routes and visual screens, but replace their localStorage/mock completion behavior with exact backend DTOs. Add a focused farmer marketplace repository rather than coupling dashboard components to ApiClient.

**Tech Stack:** Next.js 16, React 19, TypeScript, Vitest, Testing Library, Docker Compose, NestJS REST API.

## Global Constraints

- Work only on feature/web-buyer-api-integration; do not push or commit to main.
- Use small related commits; never use prohibited assistant names in commit messages or branch names.
- NEXT_PUBLIC_API_BASE_URL stays a required Compose build variable; do not add backend secrets to the web image.
- MongoDB Atlas remains external and Redis remains backend-local.
- No test or smoke action creates accounts or products in Atlas.
- Backend authorization and validation are authoritative; do not retain localStorage.role as authorization.
- Preserve mock dashboard areas unless a task explicitly owns them.

---

### Task 1: Generalize browser auth contracts and session

**Files:**
- Modify: lib/api/contracts.ts
- Modify: lib/auth/web-session.ts
- Modify: lib/auth/web-session.test.ts

**Interfaces:**
- Produce WebRole = 'buyer' | 'farmer' | 'transporter', WebSession, RegisterFarmerRequest, and RegisterTransporterRequest.
- Produce webSession.read(): WebSession | null, save(session: WebSession), and clear().
- Reject backend admin results from persisted browser sessions.

- [ ] **Step 1: Write the failing session-contract tests**

    test('webSession accepts transporter data and rejects an admin result', () => {
      const transporter = { accessToken: 'transporter-token', user: {
        id: 't-1', email: 't@example.com', role: 'transporter' as const,
        isVerified: false, isActive: true,
      }};
      webSession.save(transporter);
      expect(webSession.read()).toEqual(transporter);
      sessionStorage.setItem(WEB_SESSION_KEY, JSON.stringify({
        ...transporter, user: { ...transporter.user, role: 'admin' },
      }));
      expect(webSession.read()).toBeNull();
    });

- [ ] **Step 2: Verify RED**

Run: CI=true pnpm vitest run lib/auth/web-session.test.ts

Expected: FAIL because the existing validator is buyer-only.

- [ ] **Step 3: Implement the minimal generalized session**

    export type WebRole = 'buyer' | 'farmer' | 'transporter';
    export type WebSession = {
      accessToken: string;
      user: Pick<ApiAuthUser, 'id' | 'email' | 'isVerified' | 'isActive'> & {
        role: WebRole;
      };
    };

Require non-empty token/id/email, booleans, and one allowed WebRole. Add input types that match the backend fields exactly: farmer cnic/farmName/farmLocation/cropTypes/landSizeAcres and transporter cnic/vehicleType/vehicleNumber/licenseNumber/serviceAreas.

- [ ] **Step 4: Verify GREEN**

Run: CI=true pnpm vitest run lib/auth/web-session.test.ts lib/api/contracts.test.ts

Expected: PASS.

- [ ] **Step 5: Commit**

    git add lib/api/contracts.ts lib/auth/web-session.ts lib/auth/web-session.test.ts
    git commit -m "feat: generalize web auth sessions"

### Task 2: Centralize role-aware authentication requests

**Files:**
- Create: lib/auth/role-auth-repository.ts
- Create: lib/auth/role-auth-repository.test.ts
- Modify: lib/buyer/buyer-repository.ts
- Modify: lib/buyer/buyer-repository.test.ts

**Interfaces:**
- Produce RoleAuthRepository.login(input, expectedRole), registerBuyer, registerFarmer, registerTransporter, and getCurrentUser(expectedRole).
- Consume ApiClient-compatible requester and webSession from Task 1.
- Throw ApiError 403 before saving a result with a mismatched role.

- [ ] **Step 1: Write failing repository tests**

    await repository.registerTransporter({
      email: 'driver@example.com', password: 'StrongP@ss1',
      cnic: '35202-1234567-1', vehicleType: 'van',
      vehicleNumber: 'LEB-1234', licenseNumber: 'DL-998877',
      serviceAreas: ['Lahore'],
    });
    expect(calls).toEqual([{
      path: '/auth/register/transporter',
      options: { method: 'POST', body: expect.objectContaining({
        vehicleNumber: 'LEB-1234',
      })},
    }]);

Also cover a farmer login receiving a buyer response (no session save) and a 401 from getCurrentUser clearing the session.

- [ ] **Step 2: Verify RED**

Run: CI=true pnpm vitest run lib/auth/role-auth-repository.test.ts

Expected: FAIL because RoleAuthRepository does not exist.

- [ ] **Step 3: Implement the repository and delegate buyer authentication**

    async login(input: Credentials, expectedRole: WebRole): Promise<WebSession> {
      return this.persistExpectedRole(
        await this.client.request<ApiAuthResult>('/auth/login', {
          method: 'POST', body: input,
        }),
        expectedRole,
      );
    }

Use the exact registration endpoints. Have BuyerRepository delegate login, buyer registration, and current-user validation while retaining marketplace/order/payment methods.

- [ ] **Step 4: Verify GREEN**

Run: CI=true pnpm vitest run lib/auth/role-auth-repository.test.ts lib/buyer/buyer-repository.test.ts

Expected: PASS.

- [ ] **Step 5: Commit**

    git add lib/auth/role-auth-repository.ts lib/auth/role-auth-repository.test.ts lib/buyer/buyer-repository.ts lib/buyer/buyer-repository.test.ts
    git commit -m "feat: add role-aware web authentication"

### Task 3: Replace farmer mock signup and session gating

**Files:**
- Modify: app/farmer/page.tsx
- Modify: components/farmer/FarmerSignup2.tsx
- Create: components/farmer/FarmerSignup2.test.tsx

**Interfaces:**
- Consume RoleAuthRepository.registerFarmer(input) and login(input, 'farmer').
- FarmerSignup exposes onSubmit(input: RegisterFarmerRequest): Promise<void>.
- Render FarmerDashboard only after getCurrentUser('farmer') succeeds.

- [ ] **Step 1: Write the failing farmer-form mapping test**

    await user.type(screen.getByLabelText('CNIC'), '35202-1234567-1');
    await user.type(screen.getByLabelText('Farm name'), 'Green Acres');
    await user.click(screen.getByRole('button', { name: 'Create Account' }));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      farmName: 'Green Acres', cnic: '35202-1234567-1',
      farmLocation: { address: 'Lahore' },
      cropTypes: ['wheat'], landSizeAcres: 12.5,
    }));

- [ ] **Step 2: Verify RED**

Run: CI=true pnpm vitest run components/farmer/FarmerSignup2.test.tsx

Expected: FAIL because the form has neither CNIC nor DTO submit callback.

- [ ] **Step 3: Implement real farmer signup and portal gate**

Remove first/last-name fields because the backend has nowhere to persist them. Add labeled CNIC and password confirmation; map non-empty location to farmLocation.address, parsed non-negative acreage to landSizeAcres, and selected crops to cropTypes. Add submit loading/error UI. In the route remove localStorage.role, validate a restored farmer token via getCurrentUser, show a clear role/auth error, and clear the real session on logout.

- [ ] **Step 4: Verify GREEN**

Run: CI=true pnpm vitest run components/farmer/FarmerSignup2.test.tsx components/SignUpFormScreen.test.tsx

Expected: PASS.

- [ ] **Step 5: Commit**

    git add app/farmer/page.tsx components/farmer/FarmerSignup2.tsx components/farmer/FarmerSignup2.test.tsx
    git commit -m "feat: connect farmer web onboarding"

### Task 4: Replace transporter mock signup and session gating

**Files:**
- Modify: app/transporter/page.tsx
- Modify: components/transporter/TransporterSignup1Screen.tsx
- Modify: components/transporter/TransporterSignup2Screen.tsx
- Create: components/transporter/TransporterSignup.test.tsx

**Interfaces:**
- First step returns credentials, CNIC, and optional phone to route state.
- Second step returns vehicle data and calls RoleAuthRepository.registerTransporter once.
- Render the dashboard only after getCurrentUser('transporter') succeeds.

- [ ] **Step 1: Write the failing two-step transporter test**

    expect(registerTransporter).toHaveBeenCalledWith({
      email: 'driver@example.com', password: 'StrongP@ss1',
      phone: '+923001234567', cnic: '35202-1234567-1',
      vehicleType: 'van', vehicleNumber: 'LEB-1234',
      licenseNumber: 'DL-998877', serviceAreas: ['Lahore', 'Kasur'],
    });

- [ ] **Step 2: Verify RED**

Run: CI=true pnpm vitest run components/transporter/TransporterSignup.test.tsx

Expected: FAIL because the two mock forms do not return the required DTO or call the backend.

- [ ] **Step 3: Implement API-backed transporter signup and portal gate**

Add CNIC to step one. In step two add distinct Vehicle Number and Driving Licence Number inputs, and split the comma-separated service-area value into trimmed non-empty serviceAreas. Keep vehicle choices to backend enum values bike, rickshaw, van, and truck. Replace mock credentials and role localStorage with repository registration, login, session validation, and visible errors.

- [ ] **Step 4: Verify GREEN**

Run: CI=true pnpm vitest run components/transporter/TransporterSignup.test.tsx

Expected: PASS.

- [ ] **Step 5: Commit**

    git add app/transporter/page.tsx components/transporter/TransporterSignup1Screen.tsx components/transporter/TransporterSignup2Screen.tsx components/transporter/TransporterSignup.test.tsx
    git commit -m "feat: connect transporter web onboarding"

### Task 5: Connect farmer product creation and own listings

**Files:**
- Create: lib/farmer/farmer-repository.ts
- Create: lib/farmer/farmer-repository.test.ts
- Modify: components/farmer/CreateListingForm.tsx
- Modify: components/farmer/FarmerDashboard.tsx
- Modify: components/farmer/FarmerListings.tsx
- Create: components/farmer/CreateListingForm.test.tsx

**Interfaces:**
- Produce FarmerRepository.listMyProducts() and createProduct(input).
- CreateListingForm awaits an API-compatible product request from its parent.
- Normalize API products into the existing Listing display shape without inventing profile/sales data.

- [ ] **Step 1: Write failing repository and form-mapping tests**

    await repository.createProduct({
      name: 'Roma Tomatoes', category: 'vegetables', price: 120, quantity: 50,
      unit: 'litre', qualityGrade: 'A', description: 'Fresh',
    });
    expect(calls).toEqual([{
      path: '/products',
      options: { method: 'POST', body: expect.any(Object) },
    }]);

    await user.selectOptions(screen.getByLabelText('Selling Unit'), 'litre');
    await user.click(screen.getByRole('button', { name: /publish listing/i }));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      category: 'vegetables', unit: 'litre', qualityGrade: 'A',
    }));

- [ ] **Step 2: Verify RED**

Run: CI=true pnpm vitest run lib/farmer/farmer-repository.test.ts components/farmer/CreateListingForm.test.tsx

Expected: FAIL because the repository and normalized product form contract do not exist.

- [ ] **Step 3: Implement the farmer marketplace boundary and real listing data path**

Add exact GET /products/mine and POST /products calls. Normalize UI categories to lowercase. Offer only API-supported units kg, ton, dozen, piece, and litre; do not send the former unsupported g or mound values. Load real products after authenticated mount, remove seeded listings and farmer_listings persistence, prepend a created product, show errors on load/create, and leave delete/status-toggle/mock orders/profile/feed unchanged.

- [ ] **Step 4: Verify GREEN**

Run: CI=true pnpm vitest run lib/farmer/farmer-repository.test.ts components/farmer/CreateListingForm.test.tsx

Expected: PASS.

- [ ] **Step 5: Commit**

    git add lib/farmer/farmer-repository.ts lib/farmer/farmer-repository.test.ts components/farmer/CreateListingForm.tsx components/farmer/CreateListingForm.test.tsx components/farmer/FarmerDashboard.tsx components/farmer/FarmerListings.tsx
    git commit -m "feat: connect farmer product listings"

### Task 6: Record status and verify Docker runtime

**Files:**
- Modify: README.md
- Modify: docs/superpowers/specs/2026-08-12-web-role-onboarding-design.md

**Interfaces:**
- Document all role routes, required fields, host API URL, and that real transporter claims still require paid orders.

- [ ] **Step 1: Update manual smoke guidance**

Document this user-owned sequence: register farmer, create product, register buyer, buy after user-controlled payment setup, then register/login transporter. State that neither automated tests nor this implementation simulate a payment or create Atlas data.

- [ ] **Step 2: Run complete automated verification**

Run: CI=true pnpm test && CI=true pnpm run build && NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api docker compose build

Expected: all tests and Next build pass; Docker build succeeds without env_file or backend secrets.

- [ ] **Step 3: Commit docs and verification status**

    git add README.md docs/superpowers/specs/2026-08-12-web-role-onboarding-design.md
    git commit -m "docs: record role onboarding verification"

## Plan Self-Review

- Spec coverage: Tasks 1-4 deliver shared sessions and all role onboarding; Task 5 delivers the real farmer product path; Task 6 records configuration and validation.
- Scope boundaries: transporter shipment claiming, payments, product mutation, image upload, and mock dashboard areas are excluded from every task.
- Interface consistency: Task 1 defines role/session/input contracts; Task 2 consumes them; Tasks 3-5 call its named repository methods.
- Placeholder scan: no TODO, TBD, or undefined future behavior remains.

