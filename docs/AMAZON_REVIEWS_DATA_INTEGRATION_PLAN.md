# Amazon Reviews 2023 Frontend Integration

Status: DATA-00 through DATA-15 completed and verified on 2026-08-02. This is the frontend companion to the authoritative backend runbook at `../../vinyl_record_store_backend/docs/AMAZON_REVIEWS_DATA_INTEGRATION_PLAN.md`.

Audience: Groovehaus frontend maintainers, reviewers, and Admin GUI operators.

Purpose: record how the active 2,305-product source-derived catalog is rendered without inventing store metadata or weakening the current recommendation-honesty boundary.

## Current Behavior

When the backend runs in MongoDB mode with `amazon-reviews-2023-cds-vinyl-5core-v1` active, Groovehaus consumes 2,305 dataset products. The original 116-record catalog remains the backend's reversible legacy fallback. The three showcase customers remain exactly `demo-jazz`, `demo-rock`, and `demo-soul`.

Dataset products can have nullable artist, price, currency, stock, condition, and format values. Shared display helpers render safe labels, format money only when both value and currency are known, and expose purchase availability only when price and stock support it. Unknown price or stock disables add-to-cart and checkout; browsing, details, wishlist, and rating remain available.

Genres and formats come from bounded backend facets instead of a fixed seed-only list. Saved preferences that are not in the current facet response are preserved rather than silently discarded.

## Artwork And Source Policy

The dataset pipeline does not download or commit Amazon images. `ProductImage` identifies Amazon-derived products and uses the generic vinyl placeholder instead of requesting the 116-record local artwork endpoint. The public product and Admin table show safe source/version information; no source reviewer identifier or historical rating row reaches the browser.

## Admin GUI Compatibility

The Admin dashboard shows the active dataset key, source/version, activation timestamp, and product/user/rating counts. The products table has a Source column. Amazon dataset rows are labelled as CLI-managed and cannot be edited, deleted, restored, or artwork-enriched through the GUI. This avoids changing one row outside the reproducible dataset version.

The existing GUI remains fully available for ordinary records:

- dashboard counts, warnings, and recent audit actions;
- paginated product list and include-deleted toggle;
- create and edit forms with optimistic-concurrency recovery;
- soft-delete and restore confirmation flows;
- reviewed artwork preview/apply;
- bounded CSV/JSON catalog preview and one-time apply.

The Admin import screen is not an Amazon Reviews ingestion surface. Operators use the backend CLI for source verification, staging, import, activation, verification, and rollback.

## UI Rules

| Source condition | Required presentation |
| --- | --- |
| Artist missing | Display `Unknown artist`; do not infer from title. |
| Price/currency missing | Display `Price unavailable`; disable purchase. |
| Stock unknown | Display `Availability unknown`; disable purchase. |
| Condition/format missing | Display `Unknown`; do not reuse a seed default. |
| No approved artwork | Render the generic vinyl placeholder. |
| Dataset-managed Admin row | Show source/version and a CLI-managed notice; hide mutation actions. |
| Long source metadata | Wrap safely without breaking card, detail, cart, checkout, or Admin layouts. |

## Validation Evidence

Observed 2026-08-02:

- Vitest: 90/90 passed;
- ESLint passed;
- Vite production build passed;
- full Playwright matrix: 67 passed and 1 intentional skip across Chromium desktop/mobile/tablet, Firefox, and WebKit;
- live Admin inspection found and corrected a legacy edit-form response-unwrapping regression; the new desktop/mobile regression path passed 4/4 after the fix;
- Playwright global teardown removed 36 test interactions, preserved 2,421 total catalog documents (2,305 active dataset + 116 legacy) and exactly three showcase customers, and left zero residue on the follow-up dry-run;
- live Admin screenshots are recorded outside both repositories in the uncommitted Admin GUI guide.

## Recommender Boundary

This dataset integration does not implement PERS-03 through PERS-09. The frontend still presents `demo-profile`, session-owned `cold-start`, or `anonymous-fallback` honestly. Saved preferences and behavior do not affect ranking. Historical dataset readiness is not a recommendation-quality result.

Any future recommender plan must consume only backend-approved aggregate/version metadata, preserve the historical/live evidence separation, and receive separate user authorization before implementation.

## Operator Reference

Run dataset commands from the backend repository. The complete source hashes, transformation contract, data model, activation/rollback commands, milestone closure, and failure matrix are in the backend runbook linked above. Do not add raw data, staging files, reviewer identifiers, review text, or downloaded Amazon images to this repository.
