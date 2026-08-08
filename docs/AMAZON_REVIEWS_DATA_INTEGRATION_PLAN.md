# Amazon Reviews 2023 Frontend Integration

Status: corrected immutable v2 dataset UI and live integration verified on 2026-08-08. This document is the frontend companion to `../../vinyl_record_store_backend/docs/AMAZON_REVIEWS_DATA_INTEGRATION_PLAN.md`; the backend runbook is authoritative for source evidence, transformation, import, activation, rollback, and exact counts.

Audience: Groovehaus frontend maintainers, reviewers, and Admin GUI operators.

Purpose: define the truthful, accessible research-only presentation for the active 2,305-product dataset without changing the recommender algorithm or inventing commerce data.

Source of truth: active React source under `src/`, public API contracts, unit/component tests, the separate seed and dataset Playwright configurations, and the backend dataset runbook. `code_for_website/` remains a reference snapshot and is not updated.

## Current Contract

When immutable `amazon-reviews-2023-cds-vinyl-5core-v2` is active, product responses carry `catalogMode: research-only`, source/version, controlled field origins/quality flags, original-versus-edition year fields, and an explicit local-artwork availability flag. V1 and the 116-record legacy catalog remain backend rollback targets. The application customers remain exactly `demo-jazz`, `demo-rock`, and `demo-soul`.

The research catalog intentionally has no Groovehaus price, currency, stock, condition, cart, or checkout behavior. Users can browse, search, filter, paginate, open details, save a wishlist item, and rate a record. This is a real source-derived research catalog, not Groovehaus commercial inventory.

The change does not implement preference-aware, behavioral, popularity, collaborative, matrix-factorization, SVD, or hybrid ranking. Current lists remain explicitly labelled `demo-profile`, session-owned `cold-start`, or `anonymous-fallback`; no recommendation-quality claim is made.

## UI Behavior Matrix

| Surface | V2 behavior |
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

The browser import and artwork controls do not manage Amazon v2. Dataset preparation, strict artwork decisions, local artwork publication, import, verification, activation, failed-import cleanup, and rollback remain backend CLI operations. Dataset mutation attempts fail with a conflict and a CLI recovery message.

## Test Modes

Seed mode remains the full regression suite:

```powershell
npm.cmd run test:e2e:seed
```

The deterministic dataset mode uses invented fixtures and no developer Atlas dependency:

```powershell
npm.cmd run test:e2e:dataset
```

It covers the 2,305 total/pagination contract, controlled facets, original/edition year semantics, research-only controls, accepted remote/local art, unresolved placeholder behavior, no legacy-art collision, wishlist/rating state, cart/checkout absence, search/sort, Admin read-only status, desktop/mobile layout, keyboard access, and axe checks. Seed-only assertions for 116 products and named legacy records remain in seed mode.

## Validation Record

Observed on 2026-08-08:

- unit/component tests: 93/93 passed across 16 test files;
- seed Playwright: 67 passed, 1 intentional skip;
- dataset Playwright: 10 passed, 2 intentional device-specific skips;
- accessibility: dedicated seed-mode axe suite passed 20/20 with no serious/critical violations in the tested desktop/mobile routes; the deterministic dataset suite also passed its axe cases;
- ESLint and Vite production build: both passed on 2026-08-08;
- live v2 browser/API/artwork/Admin inspection: passed live catalog count/facets, accepted local fallback, unresolved placeholder with no local request, mobile keyboard filters, Admin v2 source/version/read-only rows, and authenticated wishlist/rating behavior;
- post-test cleanup preserved v1/v2/legacy evidence and exactly three showcase customers: dry-run ended with zero `e2e_` users and zero residue after the approved apply workflow; `datasetProducts` remained 2,305, `datasetImports` 2, and historical ratings remained 40,576 across v1/v2;
- dependency audit: patched development transitive findings; the remaining React Router RSC-mode advisory is not exercised by this Vite SPA and requires a separate compatible major-upgrade decision.

## Known Limits

- Missing or ambiguous artist/genre/year/artwork remains visibly unresolved instead of being guessed.
- The catalog exposes broad `Vinyl`, not LP/EP/single/diameter/disc-count semantics.
- Cover artwork is third-party material with source provenance; the code license does not grant image rights.
- Research browsing is not a real inventory, store offer, order, or payment system.
- Historical readiness is not model evaluation and does not personalize the signed-in customer.

## Recommender Gate

Dataset UI completion does not authorize PERS-03 through PERS-09, BFP-10 through BFP-16, FFP-10 through FFP-14, or any new ranking implementation. Those plans must remain deferred until the user starts a separate recommender task. That future task must preserve the v2 source/version boundary, historical/live separation, exact three demo users, truthful mode copy, positive-rating-skew disclosure, and `content-demo-v1` regression behavior.
