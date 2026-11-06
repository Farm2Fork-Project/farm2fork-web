# Web release readiness — 2026-10-29

## Scope and changes

Owned `farm2fork-web` only; preserved pre-existing QR/private-order/delivery/maps/account edits, package changes and shared contract additions. No commits, pushes, deployment or production requests.

- `lib/api/contracts.ts`: required quality review metadata; canonical official-wholesale price fields. Preserved unrelated existing contract edits.
- `lib/farmer/ai-contract.ts`, `farmer-repository.ts`, `components/farmer/AiListingAssistant.tsx`: independently require explicit review=false/lowConfidence=false and reviewReason=null, trained/supported matching crop with matching model/suggested grade, confidence >=0.7, finite 0..1 photo similarity and listable grade. Missing/unsafe output offers localized retake/manual recovery and no Apply grade. Raw unsafe model grade is not displayed as a farmer recommendation.
- Price repository and UI reject obsolete or incomplete response data, invalid or future calendar dates, units, currency, ranges or source URLs (HTTP/HTTPS accepted, credentials rejected). Price shows commodity/source/date/market/count/PKR, links to source, and explicitly describes historical wholesale rather than live/farm-gate prices. Farmer chooses whether to apply a midpoint or enter a manual price. Changed listing inputs invalidate references and ignore late price results.
- `components/financial/*`, `app/financial/page.tsx`, `components/types.ts`, `lib/dictionaries.ts`: EN/Urdu text, translated status/actions/search, locale money/date formatting, RTL on screen/modal/topbar, language switch. Fixed detail-screen logout wiring. Preserved existing layout/design.
- Financial settings are clearly browser-local preferences; they do not modify account identity or actual loans. Unsupported email reports/alerts and two-factor controls are disabled and honestly described in both languages.
- `lib/firebase/client.ts`: fixed documented local HTTP initialization with blank auth domain by resolving the hosted domain before validating the config. Failed initialization clears its rejected cached promise so retry is possible. HTTPS still requires configured auth domain.
- `KNOWN_GAPS.md`: replaced stale assertions with current source-grounded gaps. Loans use actual API; admin has real actions; buyer has localization; listing image upload already exists.

## Validation

- Read web AGENTS and installed Next.js use-client documentation before edits.
- Focused new guard tests first failed with missing guard module; then passed after implementation. Cover missing review flag, untrained/low-confidence/unsupported/mismatched crop, invalid similarity, non-listable grades, obsolete wholesale method, invalid date and incomplete provenance.
- Full `pnpm test`: 82 files passed, 2 files skipped; 371 tests passed, 2 skipped after the final repository regression was added.
- Latest focused component/Firebase checks: 20 passed after recovery/copy changes. Urdu queue test asserts actual translated heading/status/search and RTL.
- `pnpm exec tsc --noEmit`: passed.
- Scoped ESLint across changed AI/financial/Firebase/contracts/dictionary files: passed without warnings.
- `git diff --check`: passed after removing introduced whitespace.
- `pnpm build`: passed outside restrictive sandbox, including TypeScript and 85 generated static pages. Nonblocking warning: no fallback font override metrics for Atkinson Hyperlegible Next. The sandboxed attempt stalled >5 minutes; its owned process was stopped with auto-review-approved escalation before the successful retry.
- Local environment audit found API/Firebase/maps/VAPID/site keys present in `.env.local`; values were not printed or network-verified.

## Remaining gates and proof limits

No authenticated production or external service integration claims. Firebase provider/authorized-domain setup, cookie/CORS/CSRF environment, storage, maps, browser push, payment service configuration and physical QR/camera/GPS require intended-environment acceptance. No full authenticated browser visual review was performed. Source and component RTL checks do not establish all responsive layouts.

No shared contract deviations: wholesale responses contain no fabricated confidence or crop/category rule basis. Confidence >=0.7 is a conservative independent client gate matching current served quality configuration. Historical observation dates are never guessed. Finite photoSimilarity is required for Apply; the upstream/backend review flag remains responsible for unfamiliar-photo threshold decisions.

## Develop integration — 2026-11-06

Merged the release work onto develop based on freshly fetched origin/main. Final merged-tree validation passed: 371 tests, 2 skipped, TypeScript. Production was not contacted or deployed. Signing/device/provider acceptance gates remain as recorded above.
