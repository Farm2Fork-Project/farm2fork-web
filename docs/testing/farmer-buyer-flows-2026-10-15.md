# Farmer and buyer flow completion — 15 October 2026

Scope: existing farmer and buyer capabilities in Farm2Fork web and Flutter mobile. The incumbent Farm2Fork green/paper identity is preserved. Changes were implemented and verified locally; no deployment was performed.

## Completed paths

| Journey | Web | Mobile |
| --- | --- | --- |
| Farmer listings | Load/refresh/retry; create and edit details, price, unit, grade, stock, description and photos; cover selection; visibility; remove from marketplace while retaining history | Same API-backed paths; role-gated edit route, gallery upload and thumbnails |
| Editing recovery | Draft retained after upload/save errors; busy and unsaved-navigation guards | Draft retained after failure, back/discard guard and duplicate-submit protection |
| Inventory correctness | Edit sends changed fields; stock replacement includes observed quantity | Same dirty-field PATCH and observed quantity |
| Marketplace | Loading/error/retry/empty/reset states; search/category/pagination; detail loading and stale-request protection | Combined search/category; debounced search; all API pages; image fallback |
| Cart | Quantity controls bounded by stock; removal; totals; empty recovery; account-scoped session restoration | Stock-bound controls; account-scoped secure-storage restoration; queued-write recovery |
| Checkout | Quotes and quote retry; cart/navigation lock during draft submission; payment return/retry | Quote readiness, submission guard and pin lock; existing payment return/retry |
| Orders | Full history; independent order/payment/shipment recovery; refresh; payment and delivery timelines; server-approved draft cancellation | Full history; refresh; cancellation confirmation/busy/retry; preserved order list after failed action |
| Community | Buyer entry; post/comment loading, retry and mutation recovery; owned post/comment removal | Comment-loading retry added to existing community flow |
| Farm finance | Application form, limits, private supporting documents, one-open-application guard, review history and repayment schedule; draft/busy navigation protection | Existing native finance flow retained |
| Language and layout | Added English/Urdu copy and RTL states; browser checked at desktop and phone widths | English/Urdu widget checks, phone dropdown and long-order-total overflow fixes |

## Backend contracts and sequencing

Deploy backend support alongside the clients: order responses expose `canCancel`, payment initiation claims the order before gateway work, and stock edits accept `expectedQuantity`.

Cancellation is deliberately restricted to an unpaid pending draft with no initiated or legacy payment session. Paid/processing/shipped orders require a refund/fulfillment reversal workflow that is not implemented here. A conditional update ensures payment initiation and cancellation cannot both win.

Product removal remains a reversible deactivation, preserving historical orders and provenance. Stock changes use an atomic quantity predicate and return HTTP 409 when the observed stock is stale. Unrelated edits never resubmit stock or unchanged visibility.

## Verification evidence

- Final full suites: 303 web tests passed (2 skipped), 261 mobile tests passed (2 skipped), and 218 backend tests passed. Focused inventory/persistence/loan regressions also passed.
- Web TypeScript and changed-file ESLint checks; backend Nest build.
- Production Next.js Webpack build and Android debug APK build.
- Real isolated listing integration: Flutter and web repositories → Nest HTTP/JWT/roles → disposable MongoDB replica set → buyer-visible products, ownership enforcement and listing lifecycle.
- Isolated web and mobile checkout harnesses: real HTTP/JWT/CSRF, a local gateway fixture and signed callbacks → persisted paid/delivered orders, shipments, notifications and blockchain outbox records.
- Checkout harness includes post-settlement listing edits and stale-stock rejection, draft ownership/idempotence, legacy-payment guard and concurrent payment/cancellation.
- Temporary browser fixture and review tab removed after desktop/phone checks. No fixture route is shipped.

## Verification boundaries

Hosted Safepay settlement and external webhook delivery, Firebase login acquisition, physical-device gallery/secure-storage behavior, FCM delivery and Fabric ledger commits were not proved by these local harnesses. Outbox and notification persistence are distinct from external delivery. No production rollout was performed.

Flutter analyzer retains four pre-existing `unawaited_return_in_try_block` warnings in `firebase_auth_gateway.dart`. The production web build retains an existing font-fallback metadata warning. Impeccable's detector reported incumbent style advisories; new files and appended task CSS had no detector findings. Urdu copy has no native-speaker review in this task.
