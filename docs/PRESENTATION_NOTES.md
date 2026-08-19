# Frontend Presentation Notes

Use these points to describe the implemented frontend accurately.

## What The Frontend Demonstrates

- A distinct twelve-route Groovehaus storefront.
- URL-backed catalog browsing, literal server search, repeated filters, pagination, product metadata, and stock state.
- An immutable 2,305-row source-derived vinyl dataset with a 2,259-record customer presentation after non-destructive duplicate suppression; Admin explicitly labels the 2,305 value as a source count.
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
- Artwork is source-aware: strict dataset rows use verified local -> proxy -> placeholder; 1,124 supplemental release-group mappings use proxy -> placeholder; unresolved rows stay placeholders; legacy/seed remains proxy -> local -> placeholder. Visible artwork is 1,300/2,259 (57.55%). No Amazon image was copied, and supplemental art is representative album artwork rather than exact pressing evidence.
- The admin workspace and client-only simulated checkout exist; no real payment or backend order exists. The backend historical benchmark evaluated random, positive-popularity, content, and observed-only biased MF: content was strongest descriptively and biased MF was a negative offline-only result. This is aggregate historical evidence without significance analysis; the live evaluator still reports `insufficient-evidence`.
- Automated behavior tests and logged events do not equal recommendation-quality evidence.
- PERS-00 through PERS-09 are complete for architecture, session-owned identity, default-off preference/behavior/popularity/hybrid presentation, exact feedback controls, browser/data regression protection, and documentation closure. No quality claim is made.
- For the classroom presentation, follow Profile B in `DEMO_PERSONALIZATION_RUNBOOK.md`: MongoDB/v3, preference ranking and exact feedback enabled by environment, behavior/popularity/hybrid disabled, and source defaults unchanged.

- Production storefront: `https://groovehaus-store.netlify.app/`, with same-origin `/api/*` proxying to the Netlify backend.
- Production uses explicit Profile B environment flags: preference ranking and exact feedback enabled; behavior, popularity, and hybrid disabled. Source defaults remain unchanged.
