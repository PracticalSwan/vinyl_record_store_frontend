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
- FFP-06 backend-approved structured artwork and resilient rendering; production now uses source-specific local/proxy ordering, with 1,300/2,259 visible dataset records showing validated artwork.
- BFP-06/BFP-02 Part B shared contracts: controlled backend ingestion and evidence-gated aggregate offline reporting.
- Loading, empty, error, retry, optimistic rollback, and warning states.
- Vitest/React Testing Library plus Playwright Chromium, Firefox, WebKit, responsive, history, failure, and axe coverage.
- Honest demo-profile/cold-start wording and current documentation.
- FFP-07 integrated administrator workspace and FFP-08 client-only simulated checkout.
- PERS-00/01/02 and FFP-09 architecture freeze, fixed identity contract, auth-gated `/api/recommendations/me` consumption, stale-response protection, and honest anonymous fallback.
- PERS-03/04/05 and FFP-10/11 server-internal profile integration, default-off `preference-profile` labelling, and exact-item feedback controls with pessimistic Undo state.
- PERS-06 through PERS-09 / FFP-12 through FFP-14 behavior/popularity/hybrid presentation, server-reason attribution, passive-only opt-out semantics, identity/surface stale-response protection, accessible exact-feedback state, full-gate browser/data regressions, and documentation closure.
- DATA-00 through DATA-15 corrected v3 frontend compatibility: 2,305 sealed source products with a later non-mutating 2,259-record customer presentation, controlled facets, original/edition year semantics, no commerce controls, source-aware artwork, active dataset Admin status, CLI-managed rows, separate seed/dataset browser coverage, v2 immediate rollback, and preserved three showcase customers.
- Post-PERS NEXT-01 through NEXT-03 historical benchmark presentation boundary: random, positive-popularity, content, and observed-only biased MF were evaluated by the backend. Content was strongest descriptively; biased MF was a negative offline-only result and was rejected for live integration.
- NEXT-04/NEXT-05 finalization: explicit MongoDB/v3 Profile B procedure, selected-profile multi-browser/accessibility verification, failure-path coverage, and protected-state cleanup; committed ranking defaults remain off.
- 2026-08-29 maintenance: Profile C supersedes only the live classroom/production environment, adds canonical Jazz/Rock/Soul showcase state plus a focused three-login screenshot flow, and consumes the existing backend hybrid without client-side scoring. Historical NEXT evidence and committed defaults remain unchanged.
- Post-NEXT production hardening: GitHub-linked Netlify deployment, same-origin API proxy, 2,259-record deduplicated customer presentation over the 2,305 sealed source, 1,300 visible artwork mappings, Admin source-metric labels, and narrow-mobile layout fixes are complete.

## Deferred And Not Started

- A live recommendation-quality result: the historical aggregate experiment is complete, but it does not evaluate the live preference/behavior/hybrid signals and the live evaluator remains `insufficient-evidence`.
- Real payments, backend orders/fulfillment, custom-domain/advanced observability work, and infrastructure beyond the current GitHub-linked Netlify deployment.
- Source-default ranking enablement and learned/live collaborative integration remain separate decisions. Production uses explicit Profile C runtime flags for the existing preference, behavior, aggregate-popularity, exact-feedback, and hybrid stages. Neighborhood CF and classical SVD were rejected at NEXT-02; one biased-MF candidate was evaluated offline and rejected for live use. PERS-04 through PERS-08 stay behind default-off source flags, and no live quality claim is made.

Detailed plans and the approved cross-repository order are in `FUTURE_IMPLEMENTATION_PLAN.md`. FFP-01 through FFP-14 are complete. Deferred items require a separate explicit implementation task.
