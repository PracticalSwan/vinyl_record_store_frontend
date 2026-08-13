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
- PERS-06 through PERS-09 / FFP-12 through FFP-14 behavior/popularity/hybrid presentation, server-reason attribution, passive-only opt-out semantics, identity/surface stale-response protection, accessible exact-feedback state, full-gate browser/data regressions, and documentation closure.
- DATA-00 through DATA-15 corrected v3 frontend compatibility: 2,305-product research catalog, controlled nonzero facets, original/edition year semantics, no commerce controls, strict accepted-art local fallback or placeholder, active dataset Admin status, CLI-managed rows, separate seed/dataset browser coverage, v2 immediate rollback, and preserved three showcase customers.
- Post-PERS NEXT-01 through NEXT-03 historical benchmark presentation boundary: random, positive-popularity, content, and observed-only biased MF were evaluated by the backend. Content was strongest descriptively; biased MF was a negative offline-only result and was rejected for live integration.
- NEXT-04/NEXT-05 finalization: explicit MongoDB/v3 Profile B procedure, selected-profile multi-browser/accessibility verification, failure-path coverage, and protected-state cleanup; committed ranking defaults remain off.

## Deferred And Not Started

- A live recommendation-quality result: the historical aggregate experiment is complete, but it does not evaluate the live preference/behavior/hybrid signals and the live evaluator remains `insufficient-evidence`.
- Real payments, deployment automation, and production commerce.
- Ranking-flag production enablement and learned/live collaborative integration remain separate decisions. Neighborhood CF and classical SVD were rejected at NEXT-02; one biased-MF candidate was evaluated offline and rejected for live use. PERS-04 through PERS-08 stay behind default-off backend flags, and no live quality claim is made.

Detailed plans and the approved cross-repository order are in `FUTURE_IMPLEMENTATION_PLAN.md`. FFP-01 through FFP-14 are complete. Deferred items require a separate explicit implementation task.
