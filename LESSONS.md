# Frontend Lessons

Read this file before every frontend session.

## Current Position

- `src/` is the active Groovehaus storefront. It is no longer a Vite starter or planning-only scaffold.
- The frontend consumes catalog and recommendation data from the separate backend.
- Backend authentication and customer-state write APIs are implemented. `StoreProvider` uses them for authenticated wishlist/cart/rating state and keeps guest state in `sessionStorage`.
- `code_for_website/` is a retained design-import snapshot and must not become a second source of truth.
- Describe state precisely: guest state lasts for the current tab; new-account registration merges it; existing-account login/ordinary restore discards it; authenticated state persists through server APIs.
- `AuthProvider` restores the signed-cookie session and guards `/account`. Completed login/register/logout operations must win over stale restoration responses, while failed operations must not strand the provider in `loading`.
- Recommendation copy must label sample-profile, session-owned cold-start, product similarity, anonymous fallback, preference, behavior, aggregate popularity, and hybrid modes honestly; the backend owns mode selection and evidence.
- Preserve the full server `reasons[]` and request/list/version/mode/rank attribution, render at most two unique reasons, and never expose raw component scores or weights.
- Recommendation loading must stay below `AuthProvider`, remain disabled while auth is `loading`, key state by the authenticated public subject, abort on identity change, and generation-check responses because some transports can ignore abort.
- Production API helpers must never accept a customer ID for recommendations. `/api/recommendations/me` owns identity; the rollback showcase helper is fixed to `demo-user`.
- Fetch user recommendations only on Home and Recommendations, where the lists render; otherwise request logs falsely describe unseen lists.
- Flush or discard queued analytics before login, registration, or logout so the backend cannot attach capture-time events to the wrong identity.
- `ProductImage` is the only artwork boundary. Accept only the backend-approved image envelope and use a source-specific chain: verified dataset local -> proxy -> placeholder; supplemental dataset proxy -> placeholder; legacy/seed proxy -> local -> placeholder. Key state by the complete chain identity and generation-guard load/error transitions so stale events cannot skip or resurrect a source after rerender.
- Live search may update after 300 ms, but recent history and `search_submit` analytics are committed only by submit or recent-term replay. Keep at most five terms and scope storage by guest or authenticated public ID.
- Preference clearing changes the draft only. Saving empty preferences marks onboarding incomplete. Guard dirty state at the React Router data-router boundary, not on one button: Navbar navigation and browser history must enter the same focus-contained save/discard/cancel flow, preserve the pending destination, and restore the trigger on cancel.
- Keep the application root as a flex column with growing main content so the footer follows short pages without overlaying long pages. Filter controls scroll independently from the product grid, and paired price fields must never overflow.
- Checkout is a client-only flow with `/checkout/complete/:reference` and `GH-XXXXXXXX` references. Keep the no-real-payment and session-only disclosure visible, and do not rename compatibility analytics identifiers unless the stored-evidence contract is intentionally migrated.

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

## 2026-08-19 â€” Production visual and deployment lessons

- Narrow mobile layout bugs can hide behind desktop/tablet coverage. Keep explicit 360px navbar geometry, recommendation container inset, long research-label wrapping, and serious/critical axe regressions.
- Netlify production is GitHub-linked from `master`; generated `.netlify/`, `dist/`, Playwright output, and `.tmp-*` files are local residue and must remain untracked.
- Admin dataset counts are source metrics, not storefront presentation metrics. Label them as source counts so the 2,305 sealed rows are not confused with the 2,259 customer-visible overlay or supplemental artwork coverage.
