# AGENTS.md

Frontend instructions for the Vinyl Record Store Recommender System.

This is a subtree instruction file. Read the global instructions and the project-root `../AGENTS.md` and `../CLAUDE.md` first. Root rules take precedence.

## Current State

The Groovehaus storefront is an implemented API-backed application, not a Vite starter or planning-only scaffold.

- React 19.2.7, Vite 8.1, and React Router 7.
- Routes: home, catalog, product detail, search, recommendations, wishlist, cart, registration, login, protected account, onboarding, profile preferences, administrator workspace, checkout, and the session-scoped checkout summary.
- Catalog pages use URL-backed server queries with literal search, repeated facets, deterministic sorting, pagination, and stale-request cancellation. The navigation and Search page debounce live queries by 300 ms, and scoped recent-search history keeps at most five clickable committed terms.
- Product details and recommendation data come from the separate Next.js backend.
- Authentication and registered identity are backend-backed through credentialed signed-cookie sessions restored by `AuthProvider`.
- `StoreProvider` uses session-only guest state and server-backed authenticated state. Guest state merges only into a new registration, resumes a keyed failed merge after refresh, and is discarded on existing-account login or ordinary restore.
- Onboarding/preferences and privacy-controlled interaction analytics are implemented. The React Router data router blocks every dirty preference transition (buttons, Navbar, and browser history) behind one focus-contained save/discard/cancel dialog. Recommendation requests carry request/list attribution and are fetched only on pages that render them.
- PERS-00 through PERS-09 / FFP-09 through FFP-14 are implemented. `AuthProvider` resolves before `CatalogProvider`; Home and Recommendations use `GET /api/recommendations/me`, key state by the authenticated public subject, abort and generation-guard identity changes, omit anonymous IDs for signed-in requests, and render `cold-start`, `preference-profile`, `behavior-profile`, `popularity`, `personalized-hybrid`, or `anonymous-fallback` honestly. The source flags remain default-off, while production Profile C enables the existing preference, behavior, aggregate-popularity, hybrid, and exact-feedback stages for three canonical synthetic showcase personas. Ranking quality is not claimed.
- Corrected DATA-00 through DATA-15 v3 compatibility is implemented. The immutable source has 2,305 research-only rows; the customer presentation overlay hides 46 high-confidence duplicate display rows and exposes 2,259 records without deleting source/history. Admin keeps source counts explicit. V2 is the immediate rollback release, V1 is the identity/legacy base, and the 116-record legacy fallback plus exactly three showcase customers remain intact.
- Production is GitHub-linked Netlify at `https://groovehaus-store.netlify.app/`; `master` is the only branch and triggers production builds. Browser API calls stay same-origin through `/api/*` to the companion backend, preserving first-party session-cookie behavior.
- `ProductImage` is the single artwork boundary. Verified dataset rows prefer their backend-local JPEG then use the bounded proxy as recovery; supplemental presentation artwork uses the proxy then placeholder; unresolved dataset rows use the placeholder; legacy/seed rows retain proxy -> local -> placeholder. The 208 strict v3 local files remain source evidence, while 1,124 supplemental mappings raise customer-visible artwork to 1,300/2,259 (57.55%) without using Amazon images or claiming exact Amazon pressings.
- FFP-07 integrated administrator mode and FFP-08 checkout are implemented. The admin workspace (`RequireRole` guard, `AdminLayout`, dashboard, product table, create/edit form, import UX, artwork refresh) consumes role-gated `/api/admin/*` routes whose writes are mongodb-only. The checkout (`/checkout`, `/checkout/complete/:reference`) is client-only with no real payment or backend order, uses sessionStorage persistence, and clears the cart on confirm. Visible references use `GH-XXXXXXXX`; real payments and order APIs are intentionally out of scope.
- Historical Amazon input is backend-only and data-ready, not a quality result or customer profile. PERS-03 through PERS-09 are implemented; PERS-04 through PERS-08 remain behind default-off flags, and PERS-09 does not enable them or establish quality.
- Filters have independently scrollable controls and bounded price inputs. The page shell keeps the footer below short routes. Preference clearing changes only the draft; dirty navigation uses an accessible save/discard/cancel dialog and provides a direct return to `/account`.
- Vitest, React Testing Library, Playwright, and axe provide unit, component, browser, responsive, and accessibility coverage.

## Canonical Source And Folder Boundary

- `src/` is the only active storefront source tree.
- `code_for_website/` is a retained design-import snapshot. Do not treat it as a second app, run it as the project, or keep feature changes synchronized into it.
- `../vinyl_record_store_backend/` owns route handlers, validation, catalog persistence, query execution, and recommender scoring.
- Never put database credentials, MongoDB code, or recommender algorithms in this repo.

## Required Startup Reads

Read `../AGENT_MEMORY.md` at session start and append a dated entry at session end if anything changed (cross-agent shared memory — see root `CLAUDE.md`/`AGENTS.md`).

1. Global and project-root instructions.
2. `LESSONS.md`.
3. `AGENTS.md` and `CLAUDE.md`.
4. `README.md` and the relevant files under `docs/`.
5. `package.json`, `.env.example`, and lockfiles when scripts, dependencies, or integration change.

## Integration Contract

- Configure the backend with `VITE_API_BASE_URL`; the local default is `http://localhost:3000`.
- Keep requests in `src/lib/api.js`. `AuthProvider` owns session restoration and identity, query hooks own route-specific catalog data, and `CatalogProvider` owns shared recommendation state only.
- Every remote-data surface must handle loading, empty, error, and success states.
- Every product image surface must use `ProductImage`; never render an unvalidated remote product URL directly. Preserve source-specific ordering: verified dataset local -> proxy -> placeholder; supplemental dataset proxy -> placeholder; legacy/seed proxy -> local -> placeholder; retain stale-event guards.
- Recommendation copy must distinguish `demo-profile`, `content-similarity`, `cold-start`, `preference-profile`, `behavior-profile`, `popularity`, `personalized-hybrid`, and `anonymous-fallback` modes.
- Session ownership and the default-off preference-profile/feedback UI are implemented. Never imply measured quality or personalization beyond the active backend mode and effective backend flags.
- Credentialed auth/write requests depend on exact backend/frontend origin alignment. Preserve safe same-origin `returnTo` handling and ensure stale restoration responses cannot overwrite completed auth operations.
- `VITE_PERS_ME_ENDPOINT` defaults on and is the frontend rollback switch for FFP-09; disabling it restores only the fixed, labelled `demo-user` showcase path.
- API contract changes require matching updates in both repositories' `docs/API_CONTRACT_PLAN.md`.

## UI And Accessibility Rules

- Preserve the current Groovehaus visual language unless a task explicitly changes the design.
- Keep components focused and responsive; use semantic elements and visible keyboard focus.
- Icon-only buttons need accessible names. Status cannot rely on color alone.
- Keep touch targets usable on mobile and verify narrow-screen navigation, filters, horizontal recommendation rows, and text wrapping.
- Do not copy unapproved proprietary designs, images, logos, product data, or source code. The reviewed Cover Art Archive files are backend-owned third-party assets with explicit provenance and a separate rights notice.

## Validation

For source or integration changes, run from this repository:

```bash
npm run test:all
```

Use `npm run test:unit`, `npm run test:e2e`, `npm run test:a11y`, `npm run lint`, or `npm run build` for targeted checks.

When backend behavior is involved, also validate the backend tests, lint, and build from the backend repository. Use a live browser check when the environment permits it.

After the suite, the Playwright `globalTeardown` (`tests/e2e/global-teardown.mjs`) automatically removes test-generated documents from the Atlas database; set `E2E_SKIP_CLEANUP=1` to skip it when intentionally accumulating interaction evidence, and clean manually before evaluation. This enforces the root `CLAUDE.md`/`AGENTS.md` "Post-test Atlas cleanup" rule; the underlying tool is `npm run db:clean:test:apply` in the backend.

## Documentation Synchronization

Update only the files affected by the change, with `docs/PROJECT_CONTEXT.md` as the frontend source of truth. Keep these surfaces current when relevant:

- `README.md`, `LESSONS.md`, `.env.example`.
- Architecture, API contract, data shape, UI/UX, recommendation display, evaluation, risk, roadmap, backlog, decision, and presentation docs.
- `AGENTS.md` and `CLAUDE.md` together whenever instructions change.

## Safety

- Never commit real keys, tokens, passwords, connection strings, private interaction data, or `.env` files.
- Treat user activity, orders, ratings, and emails as privacy-sensitive.
- Do not over-engineer, over-complicate, or over-test; prefer the smallest evidence-backed change and verification set that covers the changed boundary.
- Do not use destructive Git commands or overwrite user work.
- Cleanup must use verified exact paths inside this repository. Never delete source, docs, assets, config, or `node_modules` without explicit scope.
- Do not commit or push unless the user explicitly asks.
- Do not use emojis in responses, docs, code comments, UI copy, commits, or project files. Use SVG icons or plain text.

## Completion Report

Report changed behavior, files, validation actually run, integration limitations, and any deferred work. Do not present deferred work as started.
