# Known gaps

Pending work identified during a UI/UX audit pass but deliberately not started in that
pass, because it requires either a product/dependency decision or work outside this
repo's boundary. Each entry says why it was deferred rather than fixed, so it can be
picked up deliberately later instead of being rediscovered from scratch.

## Buyer / financial / admin surfaces have no i18n or RTL support

**Status:** confirmed gap, size estimated, not started.

Farm2Fork's bilingual (English/Urdu, RTL) support is a stated cross-platform goal
(mobile has full parity), but on web it only exists on the screens that happen to be
shared across roles — `LoginScreen.tsx`, `SignUpRoleScreen.tsx`, `ProfileScreen.tsx`,
`ScanScreen.tsx`, `LandingScreen.tsx` — plus each role's own screens *if* that role
already had its own dictionary namespace wired in. Confirmed via grep for
`useLanguage`/`t(`/`dir=` usage:

- **Farmer** (`components/farmer/*`) and **transporter** (`app/transporter/page.tsx`
  + its components) — already fully wired, their own `farmer.*` / `tTopBar.*`
  dictionary namespaces exist and are used throughout.
- **Buyer** — has *zero* i18n in its own core screens. Marketplace, cart, orders, and
  checkout are all implemented inline inside `components/buyer/BuyerApp.tsx`
  (~1059 lines across the buyer component folder) and never call `t()` or set `dir`.
  Buyer only gets any localized UI at all via the shared screens it happens to reuse
  (Login/Profile/Scan/SignUpRole).
- **Financial** (`components/financial/*`, ~1843 lines across 7 files: LoginScreen,
  DashboardScreen, LoanDetailScreen, SettingsScreen, Topbar, LogoutModal, and others) —
  zero `useLanguage`/`t()`/`dir` usage anywhere.
- **Admin** (`app/admin/**`, 11 pages) — zero `useLanguage`/`t()`/`dir` usage anywhere.
  (Admin-only screens are allowed to stay English-only per the original product spec —
  this is the one surface where the gap may be acceptable as-is; worth confirming with
  the user rather than assuming.)

**Why deferred:** full coverage means extracting hundreds of hardcoded strings into new
dictionary namespaces (`buyer.*`, `financial.*`, `admin.*` — admin only if the decision
above says it should be localized), doubled for Urdu translation, then wiring `dir="rtl"`
through every one of those files and re-testing each surface. That's a multi-day feature
build, not a polish-pass fix — the same size class as the two items below, which were
already flagged and deferred in the same audit pass.

**Next step if picked up:** decide admin's localization requirement first (it changes the
scope), then tackle buyer first (largest user-facing surface, feeds the public landing
page's growth), financial last (smallest user base, currently `localStorage`-only demo
data anyway — see below).

## Financial module has no real backend

**Status:** confirmed gap, not started.

Everything in `components/financial/*` — loan applications, status transitions, document
verification checklist, dashboard metrics — reads and writes `localStorage`
(`partner_loans_data`) with no API calls. There is no `farm2fork-backend` endpoint for
any of this yet. UI-level fixes (data wired to state instead of hardcoded, honest
copy) were made during the audit pass, but the underlying data has no persistence or
multi-user reality behind it.

**Why deferred:** requires new backend endpoints in `farm2fork-backend` (a separate
repo) plus a real data model for loan applications, documents, and audit trail — not a
frontend task.

## Admin panel has no working actions

**Status:** confirmed gap, not started.

Zero `onClick` handlers found across the 7 admin pages under `app/admin/*`
(dashboard, users, products, orders, loans, audit-logs, config, moderation) beyond
navigation. Buttons, filters, and row actions are visual only.

**Why deferred:** this is a functional build-out (wiring real moderation/config actions
to backend endpoints that may not exist yet), not a UI-state fix.

## CreateListingForm has no product image field

**Status:** confirmed gap — blocked on the API contract, not just missing UI.

`lib/api/contracts.ts`'s `CreateFarmerProductRequest` (the payload sent when a farmer
publishes a listing) has no `images` field at all, even though the read-model
`ApiProduct` does. Adding an upload control to `CreateListingForm.tsx` would have
nothing to submit the file(s) to.

**Why deferred:** needs a `farm2fork-backend` contract change to accept images on
create, and almost certainly a file/presigned-upload endpoint — out of this repo's
scope.

## Per-role NotificationDropdown is copy-pasted four times

**Status:** noted, not started (lower priority than the above).

Admin, transporter, financial, and the buyer/farmer inline headers each have their own
copy of the notification-bell dropdown, with role-specific data wired in independently.
One of them (`components/farmer/FarmerDashboard.tsx`) had its own separate i18n/data
bugs fixed during the audit pass; the underlying duplication itself was flagged but not
addressed since unifying it is a real feature-parameterization job (four different data
shapes to reconcile), not a quick dedup like the other component consolidations done in
the same pass.

**Why deferred:** touches four screens with role-specific data; needs a deliberate
shared-component design pass, not a rushed extraction, given how much of this repo's
component duplication has turned out to hide real behavioral differences (see the CSS
incident and ProfileScreen consolidation notes in git history for why "looks identical"
was verified rather than assumed on every prior dedup in this codebase).
