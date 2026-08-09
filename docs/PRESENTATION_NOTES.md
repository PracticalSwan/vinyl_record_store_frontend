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

Users can narrow a catalog, compare metadata and availability, inspect why a record was suggested, and save future-facing preferences. Logged requests and attributed interactions create an evidence trail for later evaluation without claiming that the current ranking is personalized.

## Architecture Talking Point

The React frontend owns presentation, URL query state, tab-scoped guest state, and the unsent analytics queue. The Next.js backend owns contracts, validation, authenticated state, catalog repositories, request logs, scoring, and explanations. Secrets and raw private activity remain server-only.

## Limitations To State Clearly

- The active user ranking is deterministic `content-demo-v1`: a verified customer uses a session-owned cold-start path, a visitor sees anonymous fallback, and the legacy showcase is synthetic.
- Saved onboarding preferences do not alter the current deterministic ranker.
- Guest state ends with the tab and never merges into an existing account.
- Approved legacy release artwork has traceable source links and deterministic proxy -> bundled local JPEG -> placeholder fallbacks for all 116 records. The active verified Amazon-derived v3 release has 208 strict accepted matches with a separate local JPEG set; ambiguous and unresolved rows use the placeholder, and v2 rollback evidence pins the same stable set. No Amazon image was copied.
- The admin workspace and client-only simulated checkout exist; no real payment, backend order, or offline quality result exists. Historical inputs are data-ready, but no model was evaluated and the live evaluator still reports insufficient evidence.
- Automated behavior tests and logged events do not equal recommendation-quality evidence.
- PERS-00 through PERS-05 are complete for architecture, session-owned identity, default-off preference-profile presentation, and exact feedback controls. Behavior, popularity, and hybrid ranking remain planned and were not implemented with the dataset; no quality claim is made.
