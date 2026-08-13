# Frontend Presentation Notes

Use these points to describe the implemented frontend accurately.

## What The Frontend Demonstrates

- A distinct twelve-route Groovehaus storefront.
- URL-backed catalog browsing, literal server search, repeated filters, pagination, product metadata, and stock state.
- An active 2,305-product source-derived vinyl catalog with dynamic facets, safe nullable metadata, explicit source/version in Admin, and non-destructive 116-record legacy fallback.
- Session-only guest wishlist/cart/ratings and account-backed authenticated state with sign-up-only merge.
- Customer registration, signed-session restoration, three-step onboarding, and preference management.
- Explainable ranked suggestions with exact request/list attribution.
- Privacy-controlled pseudonymous interaction analytics and a visible opt-out.
- Unit, component, multi-browser, responsive, history, failure, and accessibility checks.

## Decision-Support Value

Users can narrow a catalog, compare metadata and availability, inspect why a record was suggested, and save preferences. When explicitly enabled, the deterministic preference, behavior, popularity, and hybrid modes demonstrate session-owned personalization; logged requests and attributed interactions create an evidence trail without establishing recommendation quality.

## Architecture Talking Point

The React frontend owns presentation, URL query state, tab-scoped guest state, and the unsent analytics queue. The Next.js backend owns contracts, validation, authenticated state, catalog repositories, request logs, scoring, and explanations. Secrets and raw private activity remain server-only.

## Limitations To State Clearly

- `content-demo-v1` remains the default rollback path. PERS-04 through PERS-08 ranking flags stay default-off; enabled deterministic modes demonstrate integration but are not measured as optimal or high quality.
- Guest state ends with the tab and never merges into an existing account.
- Approved legacy release artwork has traceable source links and deterministic proxy -> bundled local JPEG -> placeholder fallbacks for all 116 records. The active verified Amazon-derived v3 release has 208 strict accepted matches with a separate local JPEG set; ambiguous and unresolved rows use the placeholder, and v2 rollback evidence pins the same stable set. No Amazon image was copied.
- The admin workspace and client-only simulated checkout exist; no real payment or backend order exists. The backend historical benchmark evaluated random, positive-popularity, content, and observed-only biased MF: content was strongest descriptively and biased MF was a negative offline-only result. This is aggregate historical evidence without significance analysis; the live evaluator still reports `insufficient-evidence`.
- Automated behavior tests and logged events do not equal recommendation-quality evidence.
- PERS-00 through PERS-09 are complete for architecture, session-owned identity, default-off preference/behavior/popularity/hybrid presentation, exact feedback controls, browser/data regression protection, and documentation closure. No quality claim is made.
- For the classroom presentation, follow Profile B in `DEMO_PERSONALIZATION_RUNBOOK.md`: MongoDB/v3, preference ranking and exact feedback enabled by environment, behavior/popularity/hybrid disabled, and source defaults unchanged.
