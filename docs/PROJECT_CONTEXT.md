# Frontend Project Context

This is the frontend source of truth for the Vinyl Record Store Recommender System.

## Current State

Groovehaus is an implemented Vite 8.1 and React 19.2.7 storefront. It loads catalog, structured artwork, and recommendation results, restores signed-cookie authentication, persists authenticated customer state, sends privacy-controlled interaction events, exposes a role-gated administrator workspace, and runs a client-only simulated checkout through `VITE_API_BASE_URL`.

## Responsibilities

- Render catalog, debounced live search with scoped recent history, independently scrollable filters, product details, recommendations, wishlist, cart, registration, login, protected account, onboarding, and preference screens.
- Own responsive layout, accessibility, navigation, URL query state, and API state surfaces.
- Display backend-generated recommendation reasons and honest mode labels.
- Gate recommendation loading on restored auth, call `/api/recommendations/me` without a client-selected identity, and prevent stale cross-identity responses through subject keys, aborts, and request generations.
- Keep guest wishlist/cart/rating state in versioned `sessionStorage` and authenticated state behind one `StoreProvider` interface.
- Merge guest state only into a brand-new registration. A persisted merge key resumes a failed merge after refresh; existing-account login and ordinary restore discard unrelated guest state.
- Capture bounded pseudonymous analytics with an immediate visible opt-out and recommendation request/list attribution.
- Render the backend-reviewed Cover Art Archive mapping for all 116 bundled records through one resilient `ProductImage` component with responsive sizing, attribution, accessibility, and a proxy -> committed local JPEG -> placeholder chain.
- FFP-07 administrator workspace: a `RequireRole`-guarded `/admin` area (dashboard, product table with soft-delete/restore, create/edit form with optimistic-concurrency conflict re-fetch, import preview/apply, artwork refresh) consumes role-gated `/api/admin/*` routes. FFP-08 checkout preview: a `/checkout` wizard and `/orders/preview/:reference` confirmation with sessionStorage persistence, availability blocking, and cart clear on confirm. No real payment or backend order.
- Preference clearing is draft-only. The data router intercepts every dirty SPA/history transition, preserves the pending destination, and provides a focus-contained save/discard/cancel dialog plus a direct back path to `/account`. The flex page shell keeps the footer below short content on every route.

The frontend does not own database access, catalog ingestion/enrichment, API route implementation, scoring algorithms, raw private interaction rows, or offline evaluation.

## Canonical Source

- `src/` is the active application; `code_for_website/` is a retained design-import snapshot only.
- `src/lib/api.js` is the backend boundary.
- `AuthProvider` owns session/auth operations and preferences; `StoreProvider` owns guest/authenticated customer state; `TrackingProvider` owns the usage-data choice; `CatalogProvider` loads shared user recommendations only on Home and Recommendations.
- Route query hooks own fetched catalog/product data.

## Current Limitations

- Preferences are saved for future recommendation work but do not change the active deterministic demo ranking.
- User results are explicitly `cold-start` for a verified customer or `anonymous-fallback` without one; the restricted showcase remains `demo-profile`. Session ownership is real, but saved preferences/behavior still do not affect ranking and no quality claim is made.
- Guest state ends with the tab by design. Existing-account login never imports guest state.
- Checkout is a preview only: no real payment, no backend order, and sessionStorage-only confirmation persistence. The administrator workspace requires the MongoDB catalog source for writes; in seed-catalog mode, admin reads work but create/edit/delete/restore/import/artwork surface a persistence-unavailable error.
- Interaction and recommendation logs use 90-day eventual TTL retention in MongoDB mode; seed mode does not persist recommendation request logs.
- PERS-00 through PERS-02 / FFP-09 are complete. Preference, feedback, behavioral, popularity, and hybrid personalization (PERS-03 through PERS-09) remains planned; no quality claim is made.

## Academic Focus

The interface supports decision-making through product metadata, filtering, stock information, ranked suggestions, explanations, and a reconstructable privacy-bounded evidence trail. Behavior tests do not establish recommendation quality.

## Update Rule

Update this file when routes, state ownership, tracking/privacy behavior, API dependencies, recommendation presentation, or limitations change.
