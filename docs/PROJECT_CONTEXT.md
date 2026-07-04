# Frontend Project Context

This is the frontend source of truth for the Vinyl Record Store Recommender System.

## Current State

Groovehaus is an implemented Vite 8.1 and React 19.2.7 storefront with twelve routes. It loads catalog and recommendation results, restores signed-cookie authentication, persists authenticated customer state, and sends privacy-controlled interaction events through `VITE_API_BASE_URL`.

## Responsibilities

- Render catalog, search, filters, product details, recommendations, wishlist, cart, registration, login, protected account, onboarding, and preference screens.
- Own responsive layout, accessibility, navigation, URL query state, and API state surfaces.
- Display backend-generated recommendation reasons and honest mode labels.
- Keep guest wishlist/cart/rating state in versioned `sessionStorage` and authenticated state behind one `StoreProvider` interface.
- Merge guest state only into a brand-new registration. A persisted merge key resumes a failed merge after refresh; existing-account login and ordinary restore discard unrelated guest state.
- Capture bounded pseudonymous analytics with an immediate visible opt-out and recommendation request/list attribution.

The frontend does not own database access, API route implementation, scoring algorithms, raw private interaction rows, or offline evaluation.

## Canonical Source

- `src/` is the active application; `code_for_website/` is a retained design-import snapshot only.
- `src/lib/api.js` is the backend boundary.
- `AuthProvider` owns session/auth operations and preferences; `StoreProvider` owns guest/authenticated customer state; `TrackingProvider` owns the usage-data choice; `CatalogProvider` loads shared user recommendations only on Home and Recommendations.
- Route query hooks own fetched catalog/product data.

## Current Limitations

- Preferences are saved for future recommendation work but do not change the active deterministic demo ranking.
- User results remain explicitly `demo-profile` or `cold-start`; no measured real-customer personalization is claimed.
- Guest state ends with the tab by design. Existing-account login never imports guest state.
- No checkout, payment, administrator workspace, artwork pipeline, or offline recommendation benchmark.
- Interaction and recommendation logs use 90-day eventual TTL retention in MongoDB mode; seed mode does not persist recommendation request logs.

## Academic Focus

The interface supports decision-making through product metadata, filtering, stock information, ranked suggestions, explanations, and a reconstructable privacy-bounded evidence trail. Behavior tests do not establish recommendation quality.

## Update Rule

Update this file when routes, state ownership, tracking/privacy behavior, API dependencies, recommendation presentation, or limitations change.
