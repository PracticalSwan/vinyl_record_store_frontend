# Amazon Reviews 2023 Frontend Integration

Status: corrected immutable v3 dataset UI and integration regression verified on 2026-08-10. Historical v2 live integration verification from 2026-08-08 remains recorded below; v2 is the immediate rollback release and V1 is the identity/legacy base. This document is the frontend companion to `../../vinyl_record_store_backend/docs/AMAZON_REVIEWS_DATA_INTEGRATION_PLAN.md`; the backend runbook is authoritative for source evidence, transformation, import, activation, rollback, and exact counts.

Audience: Groovehaus frontend maintainers, reviewers, and Admin GUI operators.

Purpose: define the truthful, accessible research-only presentation for the active 2,305-product dataset without changing the recommender algorithm or inventing commerce data.

Source of truth: active React source under `src/`, public API contracts, unit/component tests, the separate seed and dataset Playwright configurations, and the backend dataset runbook. `code_for_website/` remains a reference snapshot and is not updated.

## Current Contract

When immutable `amazon-reviews-2023-cds-vinyl-5core-v3` is active, product responses carry `catalogMode: research-only`, source/version, controlled field origins/quality flags, original-versus-edition year fields, and an explicit local-artwork availability flag. V2 is the immediate rollback release, V1 is the identity/legacy base, and the 116-record legacy catalog remains preserved. The application customers remain exactly `demo-jazz`, `demo-rock`, and `demo-soul`.

The research catalog intentionally has no Groovehaus price, currency, stock, condition, cart, or checkout behavior. Users can browse, search, filter, paginate, open details, save a wishlist item, and rate a record. This is a real source-derived research catalog, not Groovehaus commercial inventory.

The dataset change does not implement preference-aware, behavioral, popularity, collaborative, matrix-factorization, SVD, or hybrid ranking. The separately implemented PERS-03 through PERS-05 / FFP-10 through FFP-11 batch remains default-off and data-lifecycle independent. Current lists are labelled `demo-profile`, session-owned `cold-start` or optional `preference-profile`, or `anonymous-fallback`; no recommendation-quality claim is made.

## UI Behavior Matrix

| Surface | V3 behavior |
| --- | --- |
| Home | Research-catalog headline/stat context; no inventory or price claim. |
| Catalog/search | Dynamic nonzero genre/format/era facets; no price, condition, stock filters, or price sorts; old price-sort URLs canonicalize to newest. |
| Product card | Title, safe artist fallback, canonical genre, original/edition year label, Research record badge, wishlist, and View record. No price/stock/condition. |
| Detail | Separate original and edition rows, source note, wishlist, and rating. No Add to cart or commerce table rows. |
| Wishlist | Saved research records remain removable and viewable; no price/cart controls. |
| Cart/checkout | Dataset records cannot enter cart. Backend enforcement protects direct or stale requests. |
| Preferences/onboarding/profile | Load active nonzero genre/format facets; hide budget/condition; preserve previously saved inactive values rather than deleting them. |
| Artwork | Approved remote proxy, then backend-confirmed local fallback, then placeholder. Unresolved rows never request a legacy local ID. |
| Admin dashboard | Active dataset source/version/counts and Research-only browsing policy; no stock cards. |
| Admin products | Dataset rows are browsable and labelled CLI-managed/read-only; mutation controls remain for ordinary records only. |

`displayYear` uses `originalReleaseYear` first. An edition year appears only as `<year> edition`; it never masquerades as an original year or populate the era facet. `isResearchProduct` and `canPurchase` centralize the commerce boundary instead of duplicating nullable checks across pages.

## Artwork And Failure Behavior

Amazon product images are never used. A dataset product receives remote Cover Art Archive URLs and `localArtworkAvailable: true` only after the backend's strict MusicBrainz/CAA decision and local verifier succeed. `ProductImage` then follows:

1. approved remote URL through `/api/artwork?u=`;
2. `/api/artwork/local/:publicId` only when the backend confirms a local binding;
3. generic vinyl placeholder.

Network, proxy, local, or image-decode failures never remove wishlist/rating/navigation actions. Ambiguous and unresolved rows start with the placeholder and cannot collide with the 116 legacy numeric artwork bindings.

## Admin GUI Boundary

The current Admin GUI still provides:

- dashboard counts, active dataset evidence, recent safe audit actions, and research/commerce policy;
- paginated product list, include-deleted toggle, detail/edit navigation;
- ordinary product create/edit with optimistic-concurrency recovery;
- ordinary soft-delete/restore confirmations;
- ordinary MusicBrainz/Cover Art Archive preview/apply;
- bounded CSV/JSON preview and one-time apply.

The browser import and artwork controls do not manage Amazon v3. Dataset preparation, strict artwork decisions, local artwork publication, import, verification, activation, failed-import cleanup, and rollback remain backend CLI operations. Dataset mutation attempts fail with a conflict and a CLI recovery message.

## Test Modes

Seed mode remains the full regression suite:

```powershell
npm.cmd run test:e2e:seed
```

The seed suite forces the PERS-03 through PERS-05 flags off and verifies the signed-in cold-start/no-feedback contract. To run the controlled first-batch preference and feedback path explicitly, set `E2E_ENABLE_PERS_FIRST_BATCH=1` for that invocation.

```powershell
$env:E2E_ENABLE_PERS_FIRST_BATCH = '1'
npm.cmd run test:e2e:seed -- tests/e2e/personalization.spec.js
```

The deterministic dataset mode uses invented fixtures and no developer Atlas dependency:

```powershell
npm.cmd run test:e2e:dataset
```

It covers the 2,305 total/pagination contract, controlled facets, original/edition year semantics, research-only controls, accepted remote/local art, unresolved placeholder behavior, no legacy-art collision, wishlist/rating state, cart/checkout absence, search/sort, Admin read-only status, desktop/mobile layout, keyboard access, and axe checks. Seed-only assertions for 116 products and named legacy records remain in seed mode.

## Validation Record

Current regression evidence observed on 2026-08-10:

- unit/component tests: 99/99 passed across 18 test files;
- `npm run test:all`: seed Playwright passed 69 with one intentional skip, deterministic dataset Playwright passed 10 with two project-specific skips, ESLint passed, and the Vite production build passed;
- explicit `E2E_ENABLE_PERS_FIRST_BATCH=1` personalization coverage passed 2/2 (desktop and mobile), exercising preference-profile ranking plus exact feedback/Undo;
- dedicated seed-mode accessibility passed 20/20 with no serious or critical axe violations; the deterministic dataset suite also passed its axe cases;
- post-test cleanup preserved the protected catalog/dataset collections and exactly three showcase customers; the final dry-run found zero `e2e_` users and zero residue;
- the earlier 2026-08-08 v2 browser/API/artwork/Admin inspection and v1/v2 counts remain historical release evidence, not current v3 runtime claims;
- dependency audit: patched development transitive findings; the remaining React Router RSC-mode advisory is not exercised by this Vite SPA and requires a separate compatible major-upgrade decision.

## Known Limits

- Missing or ambiguous artist/genre/year/artwork remains visibly unresolved instead of being guessed.
- The catalog exposes broad `Vinyl`, not LP/EP/single/diameter/disc-count semantics.
- Cover artwork is third-party material with source provenance; the code license does not grant image rights.
- Research browsing is not a real inventory, store offer, order, or payment system.
- Historical readiness is not model evaluation and does not personalize the signed-in customer.

## Recommender Gate

Dataset UI completion does not authorize PERS-06 through PERS-08, BFP-13 through BFP-15, FFP-12 through FFP-13, or any dataset change. PERS-03 through PERS-08 / FFP-10 through FFP-13 were opened separately behind default-off flags. PERS-09 remains deferred. The implementation preserves the v3 source/version boundary, v2 rollback evidence, historical/live separation, exact three demo users, truthful mode copy, positive-rating-skew disclosure, and `content-demo-v1` regression behavior.
