# Frontend Architecture

This document describes the implemented client structure and data flow.

## Runtime Flow

1. `App.jsx` creates the router and wraps routes in `CatalogProvider`, `StoreProvider`, and `CatalogGate`.
2. `src/lib/api.js` calls the backend configured by `VITE_API_BASE_URL`.
3. `CatalogProvider` fetches catalog and demo-profile recommendations and exposes separate status/error state for each.
4. Route components read server data with `useCatalog` and local wishlist/cart state with `useStore`.
5. Product detail routes request backend similarity results through `useProductRecommendations`.

## Layers

- Pages: route-specific rendering and client-side search/filter decisions.
- Components: reusable cards, grids, navigation, filters, loading, error, and empty states.
- Context: API-backed catalog/recommendation state and local demo store state.
- API client: URL construction, error normalization, and fetch calls.
- Styles: the current Groovehaus design tokens and responsive behavior in `src/index.css`.

## Data Ownership

The backend is the catalog and recommendation source of truth. The frontend owns temporary UI state. Local wishlist, cart, and rating state must not be presented as persisted.

## Design Snapshot

`code_for_website/` records the imported design starting point. It is excluded from active linting and must not receive normal feature changes.

## Security

Only public Vite variables may be used in frontend code. Database credentials and private interaction history stay on the backend.
