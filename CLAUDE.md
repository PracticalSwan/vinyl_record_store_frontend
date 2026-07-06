# CLAUDE.md

Frontend instructions for the Vinyl Record Store Recommender System.

This is a subtree instruction file. Read the global instructions and the project-root `../AGENTS.md` and `../CLAUDE.md` first. Root rules take precedence.

## Current State

The Groovehaus storefront is an implemented API-backed academic demo, not a Vite starter or planning-only scaffold.

- React 19.2.7, Vite 8.1, and React Router 7.
- Routes: home, catalog, product detail, search, recommendation demo, wishlist, cart, registration, login, protected account, onboarding, and profile preferences.
- Catalog pages use URL-backed server queries with literal search, repeated facets, deterministic sorting, pagination, and stale-request cancellation.
- Product details and recommendation data come from the separate Next.js backend.
- Authentication and registered identity are backend-backed through credentialed signed-cookie sessions restored by `AuthProvider`.
- `StoreProvider` uses session-only guest state and server-backed authenticated state. Guest state merges only into a new registration, resumes a keyed failed merge after refresh, and is discarded on existing-account login or ordinary restore.
- Onboarding/preferences and privacy-controlled interaction analytics are implemented. Recommendation requests carry request/list attribution and are fetched only on pages that render them.
- FFP-06 structured artwork is implemented through one `ProductImage` boundary with approved-host validation, stable layout, lazy/eager sizing, source attribution, and loading/missing/broken fallbacks. The backend owns ingestion and offline evaluation; its current report is `insufficient-evidence` without quality metrics.
- Checkout, administrator UI, and payments are not implemented.
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
- Every product image surface must use `ProductImage`; never render an unvalidated remote product URL directly.
- Recommendation copy must distinguish `demo-profile`, `content-similarity`, and `cold-start` modes.
- Never imply a real user's history or personalization unless authenticated persistence is actually implemented.
- Credentialed auth/write requests depend on exact backend/frontend origin alignment. Preserve safe same-origin `returnTo` handling and ensure stale restoration responses cannot overwrite completed auth operations.
- API contract changes require matching updates in both repositories' `docs/API_CONTRACT_PLAN.md`.

## UI And Accessibility Rules

- Preserve the current Groovehaus visual language unless a task explicitly changes the design.
- Keep components focused and responsive; use semantic elements and visible keyboard focus.
- Icon-only buttons need accessible names. Status cannot rely on color alone.
- Keep touch targets usable on mobile and verify narrow-screen navigation, filters, horizontal recommendation rows, and text wrapping.
- Do not copy proprietary designs, images, logos, product data, or source code.

## Validation

For source or integration changes, run from this repository:

```bash
npm run test:all
```

Use `npm run test:unit`, `npm run test:e2e`, `npm run test:a11y`, `npm run lint`, or `npm run build` for targeted checks.

When backend behavior is involved, also validate the backend tests, lint, and build from the backend repository. Use a live browser check when the environment permits it.

## Documentation Synchronization

Update only the files affected by the change, with `docs/PROJECT_CONTEXT.md` as the frontend source of truth. Keep these surfaces current when relevant:

- `README.md`, `LESSONS.md`, `.env.example`.
- Architecture, API contract, data shape, UI/UX, recommendation display, evaluation, risk, roadmap, backlog, decision, and presentation docs.
- `AGENTS.md` and `CLAUDE.md` together whenever instructions change.

## Safety

- Never commit real keys, tokens, passwords, connection strings, private interaction data, or `.env` files.
- Treat user activity, orders, ratings, and emails as privacy-sensitive.
- Do not use destructive Git commands or overwrite user work.
- Cleanup must use verified exact paths inside this repository. Never delete source, docs, assets, config, or `node_modules` without explicit scope.
- Do not commit or push unless the user explicitly asks.
- Do not use emojis in responses, docs, code comments, UI copy, commits, or project files. Use SVG icons or plain text.

## Completion Report

Report changed behavior, files, validation actually run, integration limitations, and any deferred work. Do not present deferred work as started.
