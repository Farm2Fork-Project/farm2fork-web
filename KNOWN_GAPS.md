# Known gaps

Rechecked against local source and package tests on 2026-10-29. Local tests and builds do not establish production service availability or physical-device acceptance.

## Financial preferences are local browser preferences

Loan queue/detail, review/approval/rejection and repayment actions use `LoanRepository` and the real `/loans` contract. The earlier statement that this module had no backend is obsolete.

Settings profile/currency/repayment defaults remain browser-local and do not change account identity, loan records or actual currency. Copy now states this in English/Urdu. Email/weekly alerts and two-factor controls remain unavailable and disabled, with explanatory copy. A server-backed preference/security feature is required before enabling them.

## Admin English-only surface

The admin module remains English-only. Its source includes API-backed actions in `components/admin/AdminContentOperations.tsx`; the earlier claim that it had no working actions is obsolete. Full admin localization remains separate work if required by the product specification.

## Release acceptance requires configured external services

Firebase auth, cookie sessions, API/CORS/CSRF, storage, maps, browser push and real payment configuration require deployment-environment verification. This pass made no production requests because the server is stopped. Local HTTP Firebase initialization now resolves the hosted auth domain before validating the configuration, matching `.env.example`; HTTPS still requires the deployed auth authority.

Quality recommendations fail closed on missing review fields, low confidence, invalid photo similarity, untrained/unsupported/mismatched crop or non-listable grades. Price references require official wholesale provenance and a valid observed date, and explicitly disclose historical wholesale rather than farm-gate/live prices. These guards do not establish genuine field accuracy or current commodity coverage.

## Physical and visual acceptance

QR/camera, private order links, maps/GPS, notifications and responsive Urdu flows need browser/device acceptance in the intended release environment. Unit tests do not prove these integrations. Financial screen RTL and translated status/search render are covered locally; a full authenticated browser visual review was not performed in this pass.

## Prior audit notes corrected

Buyer already has language support; financial screens now use EN/Urdu dictionaries, locale formatting and RTL. Listing creation already supports images and uploads. Notification rendering uses the shared `NotificationBell` on the financial topbar. Old claims of no buyer localization, no financial backend, no admin actions and no listing image field must not be treated as current blockers.
