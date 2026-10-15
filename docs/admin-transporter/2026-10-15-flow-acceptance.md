# Admin and transporter release: flow and acceptance checklist

Date: 2026-10-15. Status: implementation completed; local verification recorded in [progress.md](progress.md). Device, external-service and deployment acceptance remain open.

This is the release acceptance contract, not a claim that the features below exist. Unchecked items require final release acceptance; implementation evidence and boundaries are tracked in the execution ledger. Backend, web, and mobile must ship compatible changes together.

## Confirmed decisions

- Admin operates on web only.
- Transporter mobile is the primary working experience; transporter web remains functional.
- Location tracking is foreground-only for this release. Background location permissions and services are excluded.
- Buyer delivery-code verification is required before a shipment becomes Delivered.
- Transporter earnings use a ledger and admin-recorded manual payouts. The application records money transferred externally; it does not initiate bank transfers.
- Preserve Farm2Fork's incumbent visual identity. Use Impeccable for task hierarchy, feedback, accessibility, and native interaction; use the Vercel React guidance for web implementation.
- Product and landing work belongs to the parallel effort. Shared contracts, buyer tracking, checkout, icons, authentication helpers, and DESIGN.md currently also contain concurrent edits and require coordination before modification.

## Verified starting point

| Surface | Existing behavior | Missing release behavior |
| --- | --- | --- |
| Admin web | Role-gated shell; dashboard, users, products, orders, loans, moderation, audit, configuration routes | Most page data and actions are samples; operational APIs, recovery actions, real notifications, and payouts |
| Admin backend | Config reads and audit schemas; existing order/shipment reads and loan decisions | Admin module has no controller; user management, product moderation, config writes, audit browsing, operational dashboard |
| Transporter mobile | GPS availability, nearby offers, atomic claims, normal delivery transitions, external navigation, history | Reliable foreground lifecycle, fresh offers, code verification, exception recovery, earnings, updated account integration |
| Transporter web | Availability, offers, claims, status transitions, shipment history | GPS-assisted availability, active-job focus, navigation, code verification, earnings, real header/account/notification behavior |
| Transport backend | Paid-order dispatch, approximate drop-off before acceptance, one active job, shipment history and outbox events | Delivery proof, coherent failed-delivery resolution, reassignment history and earning/payout transactions |
| Payments | Payment initiation and settlement infrastructure; admin refund endpoint | Current refund endpoint only changes a database status; it does not issue a gateway refund |

Evidence: `farm2fork-backend/src/modules/{admin,transport,payment,order,loan}`, `farm2fork-web/app/admin`, `farm2fork-web/components/{admin,transporter}`, and `farm2fork-mobile/lib/features/shipments`. This assessment is source-level, not a fresh authenticated runtime signoff.

Older Context.md, PROGRESS.md, PRODUCT.md and milestone notes contain obsolete restrictions and implementation snapshots. In particular, the older mobile-only transporter restriction is superseded by the confirmed web requirement. Do not repair unrelated documentation or design files as a side effect.

## End-to-end lifecycle and invariants

Normal journey: buyer pays → eligible transporter receives offer → transporter accepts → farmer hands over goods → transporter records pickup → delivery in transit → buyer supplies delivery code at handover → server verifies code and atomically completes delivery → exactly one earning becomes payable → admin records an external payout → transporter sees payment reference.

- [x] Preserve one order per farmer, frozen delivery pricing, approximate pre-acceptance destination, and atomic first-claim-wins behavior.
- [x] Derive eligible offers and permitted actions on the server, including account activation, availability, location freshness, assignment, and one active job.
- [x] Preserve the same order, shipment, payment, and ledger identities across retries and recovery. Never delete history to make reassignment possible.
- [ ] Give every operational exception an accountable admin queue entry, reason, current state, and explicit resolution; do not leave a failed shipment attached to an unresolvable order.
- [ ] Commit business changes before showing success. Treat a subsequent refresh failure as stale data with retry, not a failed write that invites duplication.
- [x] Persist financial amounts in a consistent exact representation, use PKR consistently, and retain the original fee snapshot. Never calculate historical earnings from current config.

## Transporter mobile acceptance

| ID | Journey | Acceptance |
| --- | --- | --- |
| T01 | Entry and account | Correct role routing, onboarding recovery, actual vehicle/profile data, editable supported fields, real notification/account screens, and reliable sign-out. No other user's active job or earnings survive account switching. |
| T02 | Go online | Obtain current permission and a sufficiently recent location. Explain denied permission, disabled GPS, stale location, timeout, and server failure with a useful retry/settings action. A failed request does not display online success. |
| T03 | Foreground lifecycle | Stop location listeners/timers when paused or signed out. Pending requests cannot restart them while backgrounded. Resume fetches current job and a fresh position before eligible dispatch resumes. Never resend an old coordinate as a newly measured position. |
| T04 | Discover work | Distinguish offline, checking location, looking for work, no offers, loading, and failure. Refresh offers while foregrounded and eligible, on resume, and after notification navigation; prevent overlapping refreshes. |
| T05 | Evaluate offer | Show cargo quantity/unit, pickup area, approximate drop-off, fee, distance basis, and vehicle information available in the system. Preserve destination privacy until acceptance. Do not claim capacity suitability from absent capacity data. |
| T06 | Accept or decline | Show action-level pending feedback and prevent duplicate submissions. A competing claim refreshes available work. Failed decline restores the offer or keeps it visible with retry. One driver cannot acquire two active jobs concurrently. |
| T07 | Active delivery | Make the current step and next action prominent. Provide exact permitted pickup/drop-off details, useful scoped contact information, navigation with a visible fallback, and a real timeline. Restore the job after restart. |
| T08 | Pickup and transit | Enforce legal transitions and assignment on the server. Explain failed writes and reconcile ambiguous timeouts by rereading state before retry. Going offline must not abandon an accepted job. |
| T09 | Delivery code | Request the buyer's code at handover. Wrong, invalidated, or rate-limited codes leave the shipment active. Successful verification completes the order and shipment once and creates one earning. Replaying the request cannot create a second earning. |
| T10 | Report a problem | Capture a structured reason and optional note; distinguish before-pickup failure from goods already in the driver's custody. Confirm the report and show the pending operational resolution. Never invent a support ticket that is not persisted. |
| T11 | History and earnings | Separate active work from completed/failed history. Show earned, unpaid, and paid amounts, per-job details, and payout records. Pending/failed jobs do not become payable as successful deliveries. |
| T12 | Notifications | Real offer, assignment, delivery, exception-resolution, and payout events open the right current screen. Old notifications cannot restore an obsolete assignment or expose another user's data. |

### Delivery code rules

- [ ] Only the authenticated buyer for that order can retrieve or reissue their code; drivers, farmers, generic shipment reads, exports, logs, analytics, and notifications must not expose it.
- [ ] The buyer can reopen delivery instructions after restart. Explain that the code is shared at completed handover, not before pickup.
- [ ] Bind verification to the current shipment assignment and permitted delivery stage. Reassignment or reissue invalidates the previous proof.
- [ ] Enforce server-side attempt limits, single-use completion, and race protection. Do not store or log a plaintext code without an explicitly protected storage design.
- [ ] Provide a buyer-authorized reissue/recovery action with an audit record. Admin may investigate and facilitate recovery, but cannot silently bypass recipient proof through the generic status endpoint.
- [ ] Remove the existing alternate path that accepts `delivered` without proof. Apply the rule equally to web, mobile, and direct API requests.

## Admin web acceptance

| ID | Journey | Acceptance |
| --- | --- | --- |
| A01 | Entry and shell | Real admin identity, correct unauthorized handling, recoverable request errors, current navigation, real notifications, working account/sign-out, accessible dialogs. Remove sample alerts and unsupported support/report actions. |
| A02 | Dashboard | Real explicitly defined metrics and periods, recent activity, unassigned paid orders, stale/failed deliveries, and unpaid earnings. Every actionable count links to the corresponding filtered list. Distinguish zero data from load failure. |
| A03 | Users | Server-backed search/filter/pagination, scoped detail, activation/deactivation with reason, confirmation, audit record, and notification. Prevent self-lockout and prevent deactivation from silently abandoning an active delivery. |
| A04 | Products and community moderation | Inspect real content and use dedicated admin moderation permissions rather than weakening farmer ownership checks. Persist reasons and reversible visibility state where supported. Do not fabricate reviews, reports, or a reporting queue; unsupported mock-only sections must be removed or replaced with real existing content. |
| A05 | Orders and shipments | Search/filter and inspect buyer, farmer, payment, fee snapshot, assignment, delivery timeline, proof outcome, and exception state. Distinguish unassigned, active, failed, delivered, and financially unresolved cases. |
| A06 | Dispatch recovery | Resolve pre-pickup failures through an audited redispatch/reassignment path with eligible drivers. Preserve assignment history and revoke old-driver write access. Goods already picked up require explicit custody resolution before reassignment or cancellation. |
| A07 | Loans | Reuse current loan service permissions, document access, review/approve/reject and repayment rules. Show real applicants, private signed documents, persisted reasons, and refreshed schedules; guard competing decisions. |
| A08 | Configuration | Allow only supported typed keys, validate bounds and related values, show persisted values and fallbacks, save with reason and audit. Changes affect future quotes/orders; historical snapshots stay unchanged. |
| A09 | Audit | Server-backed filters/pagination and meaningful actor/action/entity links. Audit operational mutations with redacted sensitive values. Audit history is not editable or deletable from the UI. |
| A10 | Payouts | Inspect unpaid earnings, select a transporter and eligible entries, record actual externally paid amount/date/reference, confirm, and show immutable payout history. Concurrent admins cannot allocate the same earning twice. |
| A11 | Refund resolution | Show actual payment state and unresolved refund cases honestly. Never label a database-only status update as returned money. Require a gateway-confirmed refund or a separately evidenced external refund workflow before showing Refunded. |

### Operational and financial recovery rules

- [ ] Before pickup: an admin can release/reassign with a reason; the same shipment retains append-only assignment and status history. Update offer eligibility and notify affected users.
- [ ] After pickup: flag goods-in-custody for admin resolution. No automatic redispatch to a second driver while the first still holds the goods.
- [x] Failed jobs remain visible in operational history and do not earn the full successful-delivery fee automatically. No unapproved cancellation compensation or deductions are introduced.
- [x] A successful verified delivery creates exactly one payable earning for the driver who completed that assignment, using the frozen delivery fee.
- [x] A manual payout records the administrator, transporter, earning allocations, amount, actual payment date, external reference, and creation time. The allocation sum must match the recorded amount.
- [x] Payout recording is atomic and retry-safe. Settled earnings cannot be paid again. Corrections use linked audited reversals/adjustments, never deletion or a silent rewrite of paid history.
- [ ] Expose financial exceptions for reconciliation. Refunds after delivery must not silently erase a paid earning or pretend to reverse an external transfer.
- [ ] Before enabling refund execution, verify the current provider's supported refund contract and idempotency behavior. If only manual refunds are supported, require real evidence and label that workflow explicitly. This integration remains an implementation dependency, not an assumed capability.

## Transporter web acceptance

- [ ] Cover T01–T12 wherever applicable to the browser using the same authorization, delivery-code, earning, and exception rules.
- [ ] Offer browser geolocation with permission/error recovery; retain an accurately labelled manual-pin fallback if needed. Do not imply manual coordinates are live GPS.
- [ ] Show one prominent active delivery, exact permitted locations, external directions, legal next steps, issue reporting, history, and payout records.
- [ ] Replace fake notifications/profile data with shared real components and appropriate language/auth providers.
- [ ] Recover from refresh/write races, account switching, stale assignments, expired sessions, and direct/deep-link entry.
- [ ] Work at narrow and desktop widths with keyboard access. Do not require a mobile installation to complete supported delivery work.

## Shared UI quality bar

- [ ] Every data surface has first-load, empty, recoverable error, refresh, and success states; every mutation has pending, failure, and persisted-success feedback.
- [ ] Preserve readable existing data during refresh where possible. Avoid replacing an entire active-job screen with a spinner for an unrelated request.
- [ ] Dialogs manage focus, escape/back behavior, keyboard access, scrolling, and dismissal during a pending action. Critical actions name their actual effect.
- [ ] Native controls respect touch targets, safe areas, large text, back navigation, and keyboard avoidance. Offer maps cannot obscure the primary task.
- [ ] Transporter mobile/web copy covers the existing English/Urdu locale set and RTL. Admin remains English for this release, matching the original MVP requirement.
- [ ] Long addresses, names, notes, zero fees, large amounts, missing optional fields, and empty history remain usable without invented fallback facts.
- [ ] Web reads reuse existing API/session patterns, fetch independent data concurrently, paginate large lists, and prevent stale responses from overwriting a newer filter/account state.
- [ ] Remove inactive controls and invented claims, including wallet transfers, optimized traffic routes, generated reports, and support submissions unless their corresponding real flow is implemented.

## Delivery sequence and ownership

Each slice includes backend contracts, affected clients, focused tests, and a runtime demonstration. A backend-only endpoint or a mocked screen does not close a slice.

1. [ ] **Admin operational foundation:** authenticated shell, real dashboard/list/detail data, server pagination, user controls, audit browsing, and typed config changes. Primary ownership: backend `src/modules/admin`, web `app/admin` and `components/admin`; reuse existing order/loan services.
2. [ ] **Reliable dispatch and driver work:** lifecycle/freshness fixes, offer refresh, failed-decline recovery, action serialization, active-job restoration and contacts/navigation. Primary ownership: backend `src/modules/transport`, native `lib/features/shipments` and `lib/core/location`, web `components/transporter` and `lib/shipment`.
3. [ ] **Verified handover:** server-protected code retrieval/reissue/completion, native and web code entry, buyer code visibility, order/shipment synchronization, notifications and tests. Coordinate buyer and shared contract edits with the parallel effort before touching those files.
4. [ ] **Delivery exceptions:** reasoned problem reporting, real admin queue, pre-pickup reassignment, post-pickup custody resolution, append-only history and stale-assignment protection. Establish any persisted schema migration/backfill before enabling new actions.
5. [ ] **Earnings and manual settlement:** exactly-once earning creation, native/web earnings views, admin payout recording, allocations, reversal history, reconciliation and race tests.
6. [ ] **Remaining admin work:** actual product/community moderation, loans/documents, notification/account integration, and removal of prototype controls. Refund resolution must use a verified provider/manual workflow before its acceptance item closes.
7. [ ] **Whole-release validation:** cross-role journeys, mobile/device checks, web responsive/accessibility checks, contract compatibility, migration rehearsal and deployment notes.

Before each slice, record the exact API/schema changes and affected client versions. Do not change a shared enum or remove an existing endpoint without updating all callers and tests. Commits must contain only owned paths/hunks; do not commit or reset concurrent work. Backend remains port 3000 and web port 3001.

## Verification and evidence

| Level | Required evidence |
| --- | --- |
| Backend focused tests | Authorization/ownership, code attempts/reissue/replay, state transitions, location eligibility, config validation, sanitized audit, exactly-once earning and payout allocation |
| Mongo replica-set integration | Competing driver claims, competing status/reassignment operations, concurrent completion, concurrent payout allocation, transaction rollback and retry with unchanged totals |
| Web tests/build | Real contracts and action recovery; `pnpm test`, `pnpm exec tsc --noEmit`, `pnpm build` from `farm2fork-web`; scoped ESLint without modifying unrelated files |
| Backend tests/build | Focused Jest during slices, then `pnpm test -- --runInBand` and `pnpm build` from `farm2fork-backend`; extend the existing delivery integration harness for code verification and earnings |
| Native tests/build | Provider/widget/repository tests, `flutter analyze`, `flutter test`, and `flutter build apk --debug` from `farm2fork-mobile`; account for existing analyzer warnings explicitly |
| Browser | Signed-in admin/transporter/buyer journeys, direct links, narrow/desktop layouts, keyboard dialogs, permissions, incorrect code, exception resolution and manual payout record |
| Device | Real foreground GPS, pause/resume, app restart, revoked permission, notification tap, external map launch/failure and code handover on the supported mobile platform |
| External services | Real FCM receipt and payment/refund provider outcomes require separate evidence; unit mocks, simulated settlement, and an APK build cannot establish them |

Required cross-role scenario set:

- [ ] Buyer pays → driver accepts/picks up → buyer reveals code → driver completes → all roles agree on delivery and exactly one unpaid earning appears → admin records payout → driver sees paid reference.
- [ ] Two drivers accept simultaneously; one wins and the other receives a clear conflict with no orphan shipment.
- [ ] Driver loses connectivity or backgrounds the app; location becomes stale honestly, resume restores the actual job, and no stale coordinate is relabelled fresh.
- [ ] Wrong code, repeated completion tap, timeout after a successful completion, and code reissue never bypass verification or duplicate earnings.
- [ ] Driver reports pre-pickup failure → admin reassigns → previous driver's requests are rejected → history and notifications explain the change.
- [ ] Driver reports a post-pickup problem → admin sees goods-in-custody and resolves it explicitly; no second driver is silently dispatched.
- [ ] Two admins record the same earning in a payout; exactly one allocation succeeds and totals remain correct.
- [ ] Account deactivation, sign-out/sign-in as another user, and expired authentication reveal no previous user's code, job, documents, or earnings.
- [ ] Real empty system and seeded realistic data both produce useful interfaces; failed reads are never presented as empty success.

## Completion record

For each slice record changed repositories/commits, closed acceptance IDs, commands and outcomes, browser/device evidence, migrations/backfills, and unresolved external dependencies. The release is complete only when applicable items above are closed with evidence; blocked provider/device checks remain explicitly open. The implementation is finalized through commits on `codex/admin-transporter-release` in the backend, web, mobile and blockchain repositories. No deployment was performed. See [progress.md](progress.md) for implementation coverage, local evidence, migration rulings and outstanding release checks.
