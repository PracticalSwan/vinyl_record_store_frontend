# Groovehaus — Vinyl Record Store Frontend

Groovehaus is the customer-facing storefront for the **Vinyl Record Store Recommender System**, an academic project for CSX4207 (Decision Support and Recommender Systems) at Assumption University. It is a React single-page application for browsing a curated vinyl catalog and receiving explainable recommendations from the companion backend service.

## About

Groovehaus demonstrates how a recommender-powered storefront feels end to end: browsing, searching, and discovering records, with recommendations that explain why each title was suggested. The recommendation engine, catalog, and customer accounts all live in the separate Next.js backend; this repository is the user interface that consumes those APIs.

Three things worth knowing up front:

- Recommendations use a session-owned API path: signed-in customers receive `preference-profile`, `behavior-profile`, or `personalized-hybrid` only when the backend's default-off flags and evidence permit, otherwise `cold-start`; visitors may receive aggregate `popularity` or `anonymous-fallback`, and the restricted showcase remains `demo-profile`. Exact feedback controls are also default-off and no recommendation-quality claim is made.
- MongoDB mode currently serves the immutable 2,305-product Amazon Reviews 2023 v3 research catalog. Nullable commerce metadata is shown honestly and cart/checkout controls are absent for dataset products. V2 is the immediate rollback release, V1 is the identity/legacy base, and the original 116 illustrated records remain preserved.
- Product surfaces keep the approved Cover Art Archive proxy -> verified local JPEG -> placeholder chain. Legacy records use their fixed reviewed bundle; accepted v3 matches use a separate dataset bundle; ambiguous and unresolved v3 records skip local artwork and use the generic placeholder. The v2 rollback evidence pins the same stable accepted-art set. Amazon images are never used.
- `code_for_website/` is an early design-import snapshot kept for reference, not the running application. The active source lives in `src/`.

## What you can do

- Browse the catalog with independently scrollable dynamic genre/format, condition, era, price, and stock controls, with sorting and pagination.
- Search records as you type with a 300 ms debounce, keep up to five account/guest-scoped recent searches, and replay any committed term from the search menu.
- View similar records and demo recommendations, each with a short explanation.
- View responsive release artwork without losing product details or actions when a remote image is slow, missing, or unavailable; every legacy record and every strict accepted v3 match has a verified backend-local JPEG fallback.
- Save records to a wishlist and cart as a guest or a signed-in customer.
- Register, sign in, and manage an account with onboarding preferences. Preference clearing changes only the draft, and every dirty SPA/history transition offers a focus-contained save, discard, or cancel choice before leaving.
- Run the client-only checkout preview and view its session-scoped confirmation without implying a real payment or backend order.
- Use the role-gated Admin workspace to view active dataset status and source-managed rows while retaining ordinary product/import controls for non-dataset records.

## Tech stack

React 19, Vite, React Router, and Tailwind CSS, tested with Vitest, React Testing Library, Playwright, and axe.

## Run locally

The frontend depends on the backend, so start the backend first.

1. From `../vinyl_record_store_backend`:

   ```bash
   npm install
   npm run dev
   ```

2. Then from this repository:

   ```bash
   npm install
   npm run dev
   ```

The app opens at `http://localhost:5173` and expects the backend at `http://localhost:3000`. If your backend runs elsewhere, set `VITE_API_BASE_URL` in `.env.local`.

Dataset acquisition, staging, activation, and rollback are backend CLI operations. See [`docs/AMAZON_REVIEWS_DATA_INTEGRATION_PLAN.md`](docs/AMAZON_REVIEWS_DATA_INTEGRATION_PLAN.md) for the frontend behavior and the linked authoritative backend runbook.

## Showcase accounts

Two roles exist: `customer` and `admin`. Exactly three showcase customer accounts are seeded into the backend database, and one administrator is environment-backed.

- Customer (jazz): `jazzlistener` / `jazz-groove-2026`
- Customer (rock): `rockcollector` / `rock-groove-2026`
- Customer (soul): `soulseeker` / `soul-groove-2026`
- Admin: environment-backed; the administrator password is not committed. Configure the backend `AUTH_DEMO_ADMIN_*` values for local login.

Visitors can also register their own customer account. Showcase customer logins require the backend to reach its database; see the backend README for details.

## Project structure

- `src/pages/` — route-level screens.
- `src/components/` — reusable UI and API-state surfaces.
- `src/context/` — authentication, store, recommendation, and tracking state.
- `src/hooks/` — catalog, product, and recommendation data loading.
- `src/lib/api.js` — the backend client boundary.
- `docs/` — contracts, decisions, and evaluation notes.

## License

MIT, copyright Sithu Win San and Phone Khant Aung.
