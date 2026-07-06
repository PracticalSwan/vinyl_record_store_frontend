# Frontend Lessons

Read this file before every frontend session.

## Current Position

- `src/` is the active Groovehaus storefront. It is no longer a Vite starter or planning-only scaffold.
- The frontend consumes catalog and recommendation data from the separate backend.
- Backend authentication and customer-state write APIs are implemented. `StoreProvider` uses them for authenticated wishlist/cart/rating state and keeps guest state in `sessionStorage`.
- `code_for_website/` is a retained design-import snapshot and must not become a second source of truth.
- Describe state precisely: guest state lasts for the current tab; new-account registration merges it; existing-account login/ordinary restore discards it; authenticated state persists through server APIs.
- `AuthProvider` restores the signed-cookie session and guards `/account`. Completed login/register/logout operations must win over stale restoration responses, while failed operations must not strand the provider in `loading`.
- Recommendation copy must label sample-profile and cold-start behavior honestly.
- Fetch user recommendations only on Home and Recommendations, where the lists render; otherwise request logs falsely describe unseen lists.
- Flush or discard queued analytics before login, registration, or logout so the backend cannot attach capture-time events to the wrong identity.
- `ProductImage` is the only remote artwork boundary. Accept only the complete backend-approved image envelope, use local metadata for alt text, keep repeated card/list images decorative, and fall back once without retry loops.

## Working Rules

- Read project-root instructions before this subtree's instructions.
- Keep `AGENTS.md` and `CLAUDE.md` aligned.
- Use `VITE_API_BASE_URL`, not `NEXT_PUBLIC_` variables, for Vite configuration.
- Keep remote requests in `src/lib/api.js`; use `AuthProvider` for session identity, query hooks for route-specific catalog state, and `CatalogProvider` for shared recommendation state.
- Treat the URL as the catalog and search query source of truth. Canonicalize repeated facets, reset invalid pages, and cancel superseded requests.
- Run the Vitest and Playwright suites for behavior changes; lint and build alone do not cover responsive flows, browser history, or accessibility.
- Preserve loading, empty, error, and success states when changing API-backed screens.
- Keep image boxes dimensionally stable, lazy-load card/list art, reserve eager high-priority loading for the main detail image, and render explicit fallbacks for nullable imported metadata.
- Derive catalog counts from API data; do not reintroduce fictional inventory statistics.
- Run `npm run lint` and `npm run build` after source or integration changes.

## Safety

- Never expose backend secrets or private user data.
- Do not copy proprietary design, code, images, logos, product data, or branding.
- Use SVG icons or plain text instead of emoji characters.
- Cleanup only verified exact paths inside this repository. Leave uncertain files in place.
