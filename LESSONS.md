# Frontend Lessons

Read this file before every frontend session.

## Current Position

- `src/` is the active Groovehaus storefront. It is no longer a Vite starter or planning-only scaffold.
- The frontend consumes catalog and recommendation data from the separate backend.
- Backend catalog persistence is optional and verified, but no user-state write API exists. Do not infer durable wishlist, cart, rating, or identity state from MongoDB catalog mode.
- `code_for_website/` is a retained design-import snapshot and must not become a second source of truth.
- Wishlist, cart, quantity, and rating behavior is local demo state; do not describe it as persisted.
- Recommendation copy must label sample-profile and cold-start behavior honestly.

## Working Rules

- Read project-root instructions before this subtree's instructions.
- Keep `AGENTS.md` and `CLAUDE.md` aligned.
- Use `VITE_API_BASE_URL`, not `NEXT_PUBLIC_` variables, for Vite configuration.
- Keep remote requests in `src/lib/api.js`; use query hooks for route-specific catalog state and `CatalogProvider` for shared recommendation state.
- Treat the URL as the catalog and search query source of truth. Canonicalize repeated facets, reset invalid pages, and cancel superseded requests.
- Run the Vitest and Playwright suites for behavior changes; lint and build alone do not cover responsive flows, browser history, or accessibility.
- Preserve loading, empty, error, and success states when changing API-backed screens.
- Derive catalog counts from API data; do not reintroduce fictional inventory statistics.
- Run `npm run lint` and `npm run build` after source or integration changes.

## Safety

- Never expose backend secrets or private user data.
- Do not copy proprietary design, code, images, logos, product data, or branding.
- Use SVG icons or plain text instead of emoji characters.
- Cleanup only verified exact paths inside this repository. Leave uncertain files in place.
