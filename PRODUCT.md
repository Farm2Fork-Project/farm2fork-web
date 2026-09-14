# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Farm2Fork's web app has grown beyond its original "admin panel only" scope into a multi-role surface. Treat the actual routes/components as ground truth over any older spec:

- **Buyers** — land on the public marketing/landing page at `/`, sign up, browse the marketplace, build a farmer-grouped cart, check out, and track orders/payments. This is the primary acquisition surface for the whole product, so the public landing page carries real persuasive weight, not just a login gate.
- **Farmers** — a self-service portal at `/farmer` (`?signup=true` to onboard) for creating/viewing API-backed listings and managing their own orders/feed.
- **Transporters** — a self-service portal at `/transporter` (`?signup=true` to onboard) for claiming available deliveries and updating shipment status.
- **Financial partners** — a portal at `/financial` for reviewing farmer loan applications.
- **Administrators** — a full internal panel under `/admin/*` (dashboard, users, products, orders, loans, audit-logs, config, moderation) — English-only is acceptable here per the original spec; this audience is assumed English-literate.

Every role except admin also exists as a native-feeling role in the Flutter mobile app; the web app is expected to feel like the same product wearing a web layout, not a different product (see Product Principles).

## Product Purpose

Farm2Fork is a blockchain-backed, AI-enhanced platform connecting Pakistani farmers directly to buyers, removing exploitative middlemen and giving buyers verifiable, transparent supply-chain data. The web app is both the product's public front door (marketing/acquisition for buyers who may not have the mobile app yet) and a full desktop-class workspace for every role, plus the only surface administrators and financial partners use at all.

## Positioning

No existing local competitor combines direct marketplace + blockchain traceability + AI pricing/quality + microfinance + a dedicated transport module. On web specifically, the public landing page is the place that mechanism actually has to be sold to a skeptical buyer or partner before they'll create an account — vague "shop now" marketing copy undersells what's structurally different about this product (verifiable origin, fair-price signals, direct farmer payment).

## Operating Context

- Final Year Project, 3-person team, one member (Muhammad Qaim Raza) owns web UI/UX; heavy AI-coding-agent assistance against a shared cross-repo master spec (`farm2fork-mobile/Context.md`) and a cross-repo progress tracker (`farm2fork-mobile/PROGRESS.md`).
- Backend, mobile, and web move in lockstep on `feature/*` branches merged to each repo's own `develop`; `develop` is the integration branch, not `main`.
- Stack: Next.js App Router + TypeScript + Tailwind CSS is imported, but the app is styled overwhelmingly through one large hand-written global stylesheet (`app/globals.css`, thousands of lines of custom classes like `.btn`, `.card`, `.badge`, `.modal`, `.data-table`) whose design-token values (`--primary-green`, spacing, radii) are deliberately kept in sync with the Flutter mobile app's `AppColors`/`AppSpacing`/`AppRadius`. Any redesign work should extend this existing token system, not replace it with a pure-Tailwind rebuild, unless the user explicitly asks for that migration.
- Sessions use Firebase Auth plus a short-lived browser session validated per-portal against `GET /api/auth/me`; there is no HTTP-only-cookie session yet (temporary `sessionStorage`/browser-session token is a known, tracked gap, not a design concern to solve visually).
- No dedicated design-system component library (no `components/ui/`) — components are organized per role folder (`components/buyer`, `components/farmer`, `components/transporter`, `components/financial`, `components/admin`) and several primitives (TopBar, LanguageContext) appear to be duplicated per role rather than shared.

## Capabilities and Constraints

**Implemented and real (not mocked):** buyer registration/login, live marketplace, farmer-grouped checkout, orders/payment-status views; farmer/transporter real onboarding and farmer product creation; transporter self-claim and tracked delivery-status transitions; admin panel screens exist for dashboard/users/products/orders/loans/audit-logs/config/moderation.

**Explicitly not yet built or verified — do not design as if finished:** real JazzCash/Stripe gateway flow (payment settlement is simulated); user-owned browser/live-backend smoke testing of the full buyer path was still open as of the last progress update; HTTP-only cookie session security model; full Urdu localization — **now confirmed incomplete, not just unconfirmed:** farmer and transporter have full `useLanguage`/`t()`/RTL coverage in their own screens, but buyer's core screens (marketplace/cart/orders/checkout, all inline in `BuyerApp.tsx`), the entire financial module, and all 11 admin pages have zero i18n wiring — see `KNOWN_GAPS.md` for the full breakdown and why it's sized as its own workstream rather than a quick fix.

**Known technical debt that constrains design work:** no Next.js `loading.tsx`, `error.tsx`, or `not-found.tsx` exist anywhere in the app — there is currently no custom loading, error-boundary, or 404 experience at the framework level, only whatever ad hoc states individual components implement. A large block of `app/globals.css` design-system rules (tokens, cards, buttons, tables, modals, etc.) appears duplicated near-verbatim in two places in the same file — treat this as a real risk that a visual fix applied to one copy silently doesn't apply to the other.

## Brand Commitments

Product name is "Farm2Fork." The public landing page already has an established editorial/marketplace visual identity in progress (serif display headings, a warm paper/ink palette, hand-drawn-style route/process diagrams) — this is existing, intentional brand work to preserve and finish, not a blank slate; confirm with the user before replacing it rather than assuming a from-scratch redesign is wanted.

## Evidence on Hand

- `KNOWN_GAPS.md` (this repo) — confirmed, sized gaps deliberately deferred out of the UI/UX audit pass: i18n/RTL coverage on buyer/financial/admin, the financial module's missing backend, admin's missing action wiring, the missing product-image field, and the duplicated per-role NotificationDropdown.
- `farm2fork-mobile/Context.md` — full cross-repo master spec (data model, roles, module boundaries, sprint plan); note its section 12 describes web as admin-only — that has been superseded by the actual multi-role implementation and should not be treated as current scope.
- `farm2fork-mobile/PROGRESS.md` — living, dated log of exactly what's merged/tested/open per slice across all repos, including the web-specific slices.
- `docs/superpowers/plans/` and `docs/superpowers/specs/` (this repo) — dated design/implementation specs for individual web features (buyer API integration, role onboarding, shipment self-claim, local Google auth, marketplace simulator lifecycle).
- `app/globals.css` — the de facto design-token and component-class source of truth for this codebase.
- No user research, analytics, or real customer feedback exists yet — pre-launch academic work; do not fabricate testimonials, logos, or metrics on the landing page.

## Product Principles

1. Treat mobile and web as one product in two shells: same role color/badge/timeline meanings, same trust-forward escalation for verification/payment/admin screens, more density is allowed on web but the mood must stay calm, not louder just because there's more room.
2. Extend the existing `app/globals.css` token system and class patterns before inventing new ad hoc styling or migrating piecemeal to raw Tailwind.
3. The public landing page is a persuasion surface for buyers (and implicitly for the FYP evaluation committee) — its existing editorial identity should be finished and made consistent, not diluted into a generic SaaS template.
4. Every role surface needs honest loading/empty/error/partial-data states — several are currently backed by nothing at the framework level (no `loading.tsx`/`error.tsx`/`not-found.tsx`) and by unverified ad hoc behavior at the component level.
5. Don't design payment, gateway-callback, or notification UI as if the real integrations exist — they're simulated/absent today and must read as "in progress," not broken.

## Accessibility & Inclusion

Admin-only screens may stay English-only per the original spec (assumed English-literate administrators). Buyer/farmer/transporter parity with the bilingual (English/Urdu, RTL) mobile experience is a stated cross-platform goal in the design language doc — farmer and transporter have it, buyer and financial do not. See `KNOWN_GAPS.md`.
