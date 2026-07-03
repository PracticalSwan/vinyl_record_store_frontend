# AGENTS.md

Frontend instructions for the Vinyl Record Store Recommender System.

This is a subtree instruction file. Read the global instructions and the project-root `../AGENTS.md` and `../CLAUDE.md` first. Root rules take precedence.

## Current State

The Groovehaus storefront is an implemented API-backed academic demo, not a Vite starter or planning-only scaffold.

- React 19.2.7, Vite 8.1, and React Router 7.
- Routes: home, catalog, product detail, search, recommendation demo, wishlist, and cart.
- Catalog and recommendation data come from the separate Next.js backend.
- Wishlist, cart, quantity, and rating state are local demo state only.
- The backend can connect to MongoDB Atlas, but it has no active models, repositories, collections, or persistence APIs; the frontend must still treat all current catalog and user state as non-persistent.
- Checkout, authentication, MongoDB persistence, and write APIs are not implemented.

## Canonical Source And Folder Boundary

- `src/` is the only active storefront source tree.
- `code_for_website/` is a retained design-import snapshot. Do not treat it as a second app, run it as the project, or keep feature changes synchronized into it.
- `../vinyl_record_store_backend/` owns route handlers, validation, catalog seed data, recommender scoring, and future persistence.
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
- Keep requests in `src/lib/api.js` and server data ownership in `CatalogProvider`.
- Every remote-data surface must handle loading, empty, error, and success states.
- Recommendation copy must distinguish `demo-profile`, `content-similarity`, and `cold-start` modes.
- Never imply a real user's history or personalization unless authenticated persistence is actually implemented.
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
npm run lint
npm run build
```

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
