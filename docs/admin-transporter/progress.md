# Execution ledger — admin/transporter release

Updated: 2026-10-15. Implementation is complete in backend, web, mobile and compatible blockchain source; local verification is recorded below. This is not a production or physical-device signoff. The user subsequently authorized commits, pushes and removal of the separate implementation worktrees. Deployment remains outside this pass.

## Delivered scope

| Slice | Implemented behavior | Evidence and remaining boundary |
| --- | --- | --- |
| Admin foundation, A01–A03/A08–A09 | Real role-gated shell, dashboard, paginated users, account suspension with commitment guards, audit filters/links, revision-controlled typed config | HTTP/unit tests, replica-set integration, responsive fixture browser inspection. Real signed-in browser acceptance remains open. |
| Dispatch, T01–T08 | Foreground location lifecycle, fresh offers, atomic claims, action locks, timeout reconciliation, scoped contacts/directions, active job restoration; functional web counterpart | Provider/widget/contract tests and actual clients against local backend. Physical GPS, OS permission/settings and external-map behavior remain open. |
| Handover, T09 | Buyer-only reveal/reissue; assigned driver code entry; strict attempt lockout; atomic order/shipment completion and exactly one earning | Wrong/reissued/concurrent/replayed proof tests; actual web/mobile → Nest → Mongo delivery journeys. |
| Exceptions, T10/A05–A06 | Structured report, unresolved admin queue, safe pre-pickup reassignment, explicit custody return/retry, append-only history, assignment revocation | Replica-set integration; transactional audit and supply-chain outbox. Real Fabric submission/readback remains open. |
| Earnings, T11/A10 | Frozen fee in integer minor units, own ledger, external payout records, atomic allocations/idempotency, linked clerical correction, visible history | Concurrent allocation and correction integration; payout UI pending/failure/retry tests. No bank transfer is initiated. |
| Remaining admin, A04/A07/A11/T12 | Actual product/community hide/restore, loan/document/decision flows, real notification/account integration, evidenced external-refund recording | Source/contracts and focused tests. Real signed-document access, FCM receipt and actual external refund evidence need signed-in acceptance. |
| Whole-release validation | Full tests/builds, desktop/narrow fixture inspection, direct API integration across both clients | Device, hosted identity/payment, external settlement and production rollout checks remain open. |

## Verification

- Backend: 231 unit tests across 31 suites; 14 replica-set integration tests across two suites. Build, type check and scoped ESLint passed.
- Web: 347 passed, two intentionally skipped; payout correction focused test passed. Production build and type check passed. Scoped ESLint has no errors and five existing transporter-auth unused-variable warnings (also present at the baseline). Admin dashboard, long user data, config, payouts and drawer inspected at desktop and 390px width using labelled fixture data; drawer focus/Escape/inert behavior checked.
- Mobile: 277 passed, two intentionally skipped. Final Android debug APK built. Analyzer reports only four existing Firebase Future-await warnings. The final focused dispatch/notification check passed 14 tests after style cleanup.
- Both actual client harnesses exercise repository/UI → Nest HTTP/JWT/CSRF → Mongo replica-set transactions. Local Safepay responses and JWT identities are fixtures. They verify two delivered orders, exactly ten delivery/payment outbox records, persisted notifications, ownership, settlement replay, inventory protection and payment/cancel races. They do not prove real Firebase login, hosted gateway UI, push receipt or Fabric confirmation.
- Review regressions: concurrent wrong-code guesses capped transactionally; resolved exceptions removed from attention counts; mobile ambiguous writes reread persisted state before another mutation. Failed refresh after persisted success remains explicitly distinguishable from a failed write.

- Blockchain: all Go packages pass; recovery-event allowlist regressions first reproduced rejection, then passed with explicit admin/transporter role constraints. No real ledger was reset or upgraded.

- Commit-time verification: the existing rate-limit test could receive inconsistent responses while Supertest repeatedly rebound an ephemeral server. Binding its disposable listener once reproduced the expected 60 successful responses followed by 429; the production route is unchanged.

## Product and migration rulings

- Existing admin accounts cannot be deactivated through this operational UI. Accounts holding unresolved paid orders or active/custody work cannot be suspended until resolved.
- Only eight configuration keys actually read by services are editable; concurrent revision changes conflict. Historical order/fee snapshots remain unchanged.
- Location remains foreground-only. Never send a cached location with a newly fabricated measurement time. No background service or location permission was added.
- A buyer code is never stored in plaintext or included in generic shipment/audit/notification payloads. Configure a stable `DELIVERY_CODE_SECRET` of at least 16 characters, or an equally stable `JWT_SECRET` fallback. Rotation invalidates outstanding codes; coordinate any rotation.
- Generic shipment status writes cannot mark delivered or failed; both new clients must ship with the backend. Older clients must upgrade to use verified completion and structured issues.
- Legacy shipments gain proof lazily on authorized buyer code access. Old failed shipments without structured custody evidence permit confirmed return only. Do not silently reset them, reassign unknown custody, or invent an earlier issue stage.
- Earnings begin with verified completions. Older delivered jobs are not automatically marked unpaid: their fee/assignment/previous external settlement must be reconciled before any deliberate historical import. Clients disclose this scope.
- Return confirmation cancels the order and releases the custody commitment. It does not restock perishable goods automatically or issue a refund. Farmer inventory requires an explicit quality/quantity review.
- External refund records require a cancelled, successfully paid order and the full actual payment amount, date, reference, reason and actor. The former database-only refund success path now rejects execution. Gateway refund initiation is not enabled.
- Payout corrections retain originals and append a linked reversal. Use only when the payment entry was mistaken and no money was transferred. They do not recover or reverse external funds.

## Coordinated rollout and rollback

1. Back up the database and inspect unresolved legacy shipments plus historical delivered/paid jobs. Rehearse on a disposable replica-set copy; do not infer external settlements from application status alone.
2. Configure/retain the stable delivery-code secret. MongoDB transactions require a replica set, including staging.
3. Upgrade the chaincode allowlist for `shipment_issue_reported` (transporter), `shipment_reassigned` and `shipment_issue_resolved` (admin) before consuming these backend outbox events. Deploy the additive backend schemas/indexes and compatible web/mobile clients together. Verify unique ledger shipment, payout request/reversal and refund indexes before enabling payout administration. Old clients cannot complete deliveries using the former status endpoint.
4. Run signed-in buyer/farmer/transporter/admin acceptance with realistic data. Test wrong/reissued code, reassignment revocation, timeout recovery, return confirmation and manual payout receipt. Exercise EN/Urdu and large text on a device.
5. Check real FCM taps, foreground pause/resume/GPS settings/maps, private document access and provider outcomes separately. Confirm real Fabric outbox consumption/readback without resetting the ledger.
6. On rollback preserve all new finance/audit/assignment records and code secret. Pause delivery completion/payout administration if client/backend versions diverge. Do not deploy the old database-only refund handler or delete earning allocations as a rollback mechanism. Restore a tested compatible version rather than erasing financial history.

## Workspace / transfer

Implementation checkouts: `.worktrees/admin-backend`, `.worktrees/admin-web`, `.worktrees/admin-mobile`, `.worktrees/admin-blockchain`, branch `codex/admin-transporter`. Baselines: backend `7ee3d69`, web `d251acc`, mobile `7d492f2`, blockchain `ffa35e0`. Dependency symlinks and generated build directories are excluded. Product/landing source is preserved; shared buyer code visibility and additive API contracts are the narrow integration edits. Source was applied back to all four primary repositories after clean-baseline and collision checks; all 116 owned source files matched SHA-256 content hashes. Final commits are published on matching `codex/admin-transporter-release` branches. The separate implementation worktrees are removed after remote SHA verification; source remains in the primary checkouts and pushed commits.

## Open release acceptance

- [ ] Real signed-in browser flows across admin, buyer and transporter, including private loan documents and expired authentication.
- [ ] Physical-device foreground GPS, pause/resume, restart, permission changes, external maps, notification taps and EN/Urdu/large-text inspection.
- [ ] Real external payout/refund evidence and operational reconciliation; no real funds moved during development.
- [ ] Production identity, hosted payment outcomes, FCM receipt and Fabric ledger submission/readback.
- [ ] Staging migration/index rehearsal and coordinated deployment/rollback rehearsal.
