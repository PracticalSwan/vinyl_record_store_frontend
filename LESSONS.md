# Frontend Lessons

Read this file before every frontend session.

## Current Position

- `src/` is the active Groovehaus storefront. It is no longer a Vite starter or planning-only scaffold.
- The frontend consumes catalog and recommendation data from the separate backend.
- Backend authentication and customer-state write APIs are implemented. `StoreProvider` uses them for authenticated wishlist/cart/rating state and keeps guest state in `sessionStorage`.
- `code_for_website/` is a retained design-import snapshot and must not become a second source of truth.
- Describe state precisely: guest state lasts for the current tab; new-account registration merges it; existing-account login/ordinary restore discards it; authenticated state persists through server APIs.
- `AuthProvider` restores the signed-cookie session and guards `/account`. Completed login/register/logout operations must win over stale restoration responses, while failed operations must not strand the provider in `loading`.
- Recommendation copy must label sample-profile, session-owned cold-start, product similarity, and anonymous fallback honestly.
- Recommendation loading must stay below `AuthProvider`, remain disabled while auth is `loading`, key state by the authenticated public subject, abort on identity change, and generation-check responses because some transports can ignore abort.
- Production API helpers must never accept a customer ID for recommendations. `/api/recommendations/me` owns identity; the rollback showcase helper is fixed to `demo-user`.
- Fetch user recommendations only on Home and Recommendations, where the lists render; otherwise request logs falsely describe unseen lists.
- Flush or discard queued analytics before login, registration, or logout so the backend cannot attach capture-time events to the wrong identity.
- `ProductImage` is the only artwork boundary. Accept only the complete backend-approved image envelope, use local metadata for alt text, keep repeated card/list images decorative, and advance exactly once through the remote proxy, canonical-ID local endpoint, and generic placeholder. Key the image state by the full source-chain identity and generation-guard load/error transitions so stale events cannot skip or resurrect a source after rerender.
- Live search may update after 300 ms, but recent history and `search_submit` analytics are committed only by submit or recent-term replay. Keep at most five terms and scope storage by guest or authenticated public ID.
- Preference clearing changes the draft only. Saving empty preferences marks onboarding incomplete. Guard dirty state at the React Router data-router boundary, not on one button: Navbar navigation and browser history must enter the same focus-contained save/discard/cancel flow, preserve the pending destination, and restore the trigger on cancel.
- Keep the application root as a flex column with growing main content so the footer follows short pages without overlaying long pages. Filter controls scroll independently from the product grid, and paired price fields must never overflow.
- Checkout is a client-only preview with `/orders/preview/:reference` and `PREVIEW-` references. Do not rename compatibility analytics identifiers unless the stored-evidence contract is intentionally migrated.

## Working Rules

- Read project-root instructions before this subtree's instructions.
- Keep `AGENTS.md` and `CLAUDE.md` aligned.
- Use `VITE_API_BASE_URL`, not `NEXT_PUBLIC_` variables, for Vite configuration.
- Keep remote requests in `src/lib/api.js`; use `AuthProvider` for session identity, query hooks for route-specific catalog state, and `CatalogProvider` for shared recommendation state.
- Treat the URL as the catalog and search query source of truth. Canonicalize repeated facets, reset invalid pages, and cancel superseded requests.
- Do not record every debounced search prefix. Only a committed term belongs in recent history or submit analytics.
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
