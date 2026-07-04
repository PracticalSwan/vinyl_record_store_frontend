# Frontend Architecture

This document describes the implemented client structure and data flow.

## Runtime Flow

1. `App.jsx` creates the router and wraps routes in `CatalogProvider`, `AuthProvider`, `TrackingProvider`, and `StoreProvider`.
2. `src/lib/api.js` makes credentialed calls to the backend configured by `VITE_API_BASE_URL` and validates response envelopes.
3. Catalog and Search use `useCatalogQuery` for canonical URL state and `useProductQuery` for cancellable server requests.
4. Home, Detail, Wishlist, and Cart request only the products they need instead of preloading the catalog.
5. `AuthProvider` restores sessions, prevents stale restore/auth races, supplies registration/login/logout/preferences state, and clears the analytics identity boundary before auth changes; `RequireAuth` protects account/onboarding routes.
6. `CatalogProvider` requests demo-profile recommendations only on Home and Recommendations. `StoreProvider` presents one interface over session guests and authenticated server state.
7. Product detail routes request backend similarity results through `useProductRecommendations`.

## Layers

- Pages: route-specific rendering and URL-backed search/filter decisions.
- Components: reusable cards, grids, navigation, filters, loading, error, and empty states.
- Context: signed-session identity, shared recommendation state, guest/authenticated Store adapters, and tracking preference.
- Hooks: canonical query state, abortable product requests, detail lookups, and recommendation requests.
- API client: URL construction, error normalization, and fetch calls.
- Styles: the current Groovehaus design tokens and responsive behavior in `src/index.css`.

## Data Ownership

The backend is the catalog, recommendation, identity, and authenticated customer-state source of truth. The frontend owns temporary UI state, session-only guest state, the usage-data preference, and the bounded unsent analytics queue.

## Design Snapshot

`code_for_website/` records the imported design starting point. It is excluded from active linting and must not receive normal feature changes.

## Security

Only public Vite variables may be used in frontend code. Database credentials, auth secrets, password material, session-cookie contents, and private interaction history stay on the backend. Post-login return paths must resolve to the same frontend origin.
