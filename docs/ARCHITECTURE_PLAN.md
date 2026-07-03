# Frontend Architecture

This document describes the implemented client structure and data flow.

## Runtime Flow

1. `App.jsx` creates the router and wraps routes in `CatalogProvider` and `StoreProvider`.
2. `src/lib/api.js` calls the backend configured by `VITE_API_BASE_URL` and validates response envelopes.
3. Catalog and Search use `useCatalogQuery` for canonical URL state and `useProductQuery` for cancellable server requests.
4. Home, Detail, Wishlist, and Cart request only the products they need instead of preloading the catalog.
5. `CatalogProvider` owns demo-profile recommendations; `StoreProvider` owns local wishlist and cart state.
6. Product detail routes request backend similarity results through `useProductRecommendations`.

## Layers

- Pages: route-specific rendering and URL-backed search/filter decisions.
- Components: reusable cards, grids, navigation, filters, loading, error, and empty states.
- Context: shared API-backed recommendation state and local demo store state.
- Hooks: canonical query state, abortable product requests, detail lookups, and recommendation requests.
- API client: URL construction, error normalization, and fetch calls.
- Styles: the current Groovehaus design tokens and responsive behavior in `src/index.css`.

## Data Ownership

The backend is the catalog and recommendation source of truth. The frontend owns temporary UI state. Local wishlist, cart, and rating state must not be presented as persisted.

## Design Snapshot

`code_for_website/` records the imported design starting point. It is excluded from active linting and must not receive normal feature changes.

## Security

Only public Vite variables may be used in frontend code. Database credentials and private interaction history stay on the backend.
