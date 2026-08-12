# Frontend Consolidation Status

This file records current completion and deferred scope. It does not authorize continued development.

## Completed

- Twelve-route Groovehaus React storefront and responsive design.
- API-backed catalog, literal search, repeated facets, sorting, pagination, product details, session-owned customer cold-start, anonymous fallback, restricted demo-profile showcase, and product similarity.
- Signed-cookie registration/login/logout/restoration and protected account routes.
- FFP-03 session-only guest Store adapter, sign-up-only keyed merge, and authenticated wishlist/cart/rating persistence.
- FFP-02 three-step onboarding and protected preference editing/clearing.
- BFP-02 Part A request/list attribution consumed by the UI.
- FFP-01 privacy-controlled interaction analytics, auth-boundary isolation, and visible opt-out.
- FFP-06 backend-approved structured artwork, shared resilient rendering, source attribution, accessibility, responsive loading, and a 2026-07-21 proxy-to-local-to-placeholder hardening pass covering all 116 bundled records.
- BFP-06/BFP-02 Part B shared contracts: controlled backend ingestion and evidence-gated aggregate offline reporting.
- Loading, empty, error, retry, optimistic rollback, and warning states.
- Vitest/React Testing Library plus Playwright Chromium, Firefox, WebKit, responsive, history, failure, and axe coverage.
- Honest demo-profile/cold-start wording and current documentation.
- FFP-07 integrated administrator workspace and FFP-08 client-only simulated checkout.
- PERS-00/01/02 and FFP-09 architecture freeze, fixed identity contract, auth-gated `/api/recommendations/me` consumption, stale-response protection, and honest anonymous fallback.
- PERS-03/04/05 and FFP-10/11 server-internal profile integration, default-off `preference-profile` labelling, and exact-item feedback controls with pessimistic Undo state.
- DATA-00 through DATA-15 corrected v3 frontend compatibility: 2,305-product research catalog, controlled nonzero facets, original/edition year semantics, no commerce controls, strict accepted-art local fallback or placeholder, active dataset Admin status, CLI-managed rows, separate seed/dataset browser coverage, v2 immediate rollback, and preserved three showcase customers.

## Deferred And Not Started

- A recommendation-quality result: historical inputs are ready for a separately approved experiment, but no model was evaluated and live evidence remains insufficient.
- Real payments, deployment automation, and production commerce.
- PERS-09 integration/closure remains deferred. PERS-06 through PERS-08 / FFP-12 through FFP-13 are implemented behind default-off backend flags, including behavior/popularity/hybrid labels, up-to-two reasons, attribution, and exact feedback controls. No quality claim is made.

Detailed plans and the approved cross-repository order are in `FUTURE_IMPLEMENTATION_PLAN.md`. FFP-01 through FFP-13 are complete. Deferred items require a separate explicit implementation task.
