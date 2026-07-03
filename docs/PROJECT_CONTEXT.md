# Frontend Project Context

This is the frontend source of truth for the Vinyl Record Store Recommender System.

## Current State

Groovehaus is an implemented Vite 8.1 and React 19.2.7 storefront with seven routes. It loads the demo catalog and recommendation results from the separate Next.js backend through `VITE_API_BASE_URL`.

## Responsibilities

- Render catalog, search, filters, product details, recommendations, wishlist, and cart screens.
- Own responsive layout, accessibility, navigation, URL query state, and API state surfaces.
- Display backend-generated recommendation reasons and mode labels.
- Keep wishlist, cart quantity, and rating behavior as clearly local demo state until write APIs and identity exist.

The frontend does not own database access, API route implementation, scoring algorithms, or private interaction data.

## Canonical Source

- `src/` is the active application.
- `src/lib/api.js` is the API client boundary.
- Route query hooks own fetched catalog and product data; `CatalogProvider` owns shared recommendation data.
- `StoreProvider` owns local demo wishlist and cart state.
- `code_for_website/` is a retained design-import snapshot only.

## Current Limitations

- No authentication or real user profile.
- The backend can serve the catalog from the seed default or explicit verified MongoDB mode.
- No MongoDB-backed frontend user state or interaction write APIs.
- No checkout or payment behavior.
- Recommendation results use a documented sample profile or cold-start mode.
- Search, repeated filters, sort, pagination, and facet counts run through bounded backend queries.

## Academic Focus

The interface supports decision-making by combining product metadata, filtering, stock information, ranked suggestions, and readable explanation reasons. It must never overstate the evidence as real personalization.

## Update Rule

Update this file when the frontend's implemented routes, data ownership, API dependency, recommendation presentation, or limitations change.
