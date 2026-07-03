# Frontend Architecture

This document describes the implemented client structure and data flow.

## Runtime Flow

1. `App.jsx` creates the router and wraps routes in `CatalogProvider`, `AuthProvider`, and `StoreProvider`.
2. `src/lib/api.js` makes credentialed calls to the backend configured by `VITE_API_BASE_URL` and validates response envelopes.
3. Catalog and Search use `useCatalogQuery` for canonical URL state and `useProductQuery` for cancellable server requests.
4. Home, Detail, Wishlist, and Cart request only the products they need instead of preloading the catalog.
5. `AuthProvider` restores sessions, prevents stale restore/auth races, and supplies registration/login/logout state; `RequireAuth` protects `/account`.
6. `CatalogProvider` owns demo-profile recommendations; `StoreProvider` owns local wishlist and cart state.
7. Product detail routes request backend similarity results through `useProductRecommendations`.

## Layers

- Pages: route-specific rendering and URL-backed search/filter decisions.
- Components: reusable cards, grids, navigation, filters, loading, error, and empty states.
- Context: signed-session identity, shared API-backed recommendation state, and local demo store state.
- Hooks: canonical query state, abortable product requests, detail lookups, and recommendation requests.
- API client: URL construction, error normalization, and fetch calls.
- Styles: the current Groovehaus design tokens and responsive behavior in `src/index.css`.

## Data Ownership

The backend is the catalog, recommendation, identity, and customer-state API source of truth. The frontend owns temporary UI state. Local wishlist, cart, and rating state must not be presented as persisted until FFP-03 connects their providers to the server.

## Design Snapshot

`code_for_website/` records the imported design starting point. It is excluded from active linting and must not receive normal feature changes.

## Security

Only public Vite variables may be used in frontend code. Database credentials, auth secrets, password material, session-cookie contents, and private interaction history stay on the backend. Post-login return paths must resolve to the same frontend origin.
