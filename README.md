# Groovehaus — Vinyl Record Store Frontend

Groovehaus is the customer-facing storefront for the **Vinyl Record Store Recommender System**, an academic project for CSX4207 (Decision Support and Recommender Systems) at Assumption University. It is a React single-page application for browsing a curated vinyl catalog and receiving explainable recommendations from the companion backend service.

## About

Groovehaus demonstrates how a recommender-powered storefront feels end to end: browsing, searching, and discovering records, with recommendations that explain why each title was suggested. The recommendation engine, catalog, and customer accounts all live in the separate Next.js backend; this repository is the user interface that consumes those APIs.

Two things worth knowing up front:

- Recommendations use a session-owned API path: signed-in customers receive deterministic `cold-start` results, visitors receive `anonymous-fallback`, and the restricted showcase remains `demo-profile`. Saved preferences and behavior do not affect ranking yet, and no recommendation-quality claim is made.
- Product surfaces display backend-approved Cover Art Archive images when available, with traceable source links and stable local fallbacks when artwork is missing or broken.
- `code_for_website/` is an early design-import snapshot kept for reference, not the running application. The active source lives in `src/`.

## What you can do

- Browse the catalog with genre, condition, era, price, and stock filters, with sorting and pagination.
- Search records by text and open detailed product pages.
- View similar records and demo recommendations, each with a short explanation.
- View responsive release artwork without losing product details or actions when an image is slow, missing, or unavailable.
- Save records to a wishlist and cart as a guest or a signed-in customer.
- Register, sign in, and manage an account with onboarding preferences.

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

## Demo accounts

Two roles exist: `customer` and `admin`. Showcase demo customer accounts are seeded into the backend database for classroom use.

- Customer (jazz): `jazzlistener` / `jazz-groove-2026`
- Customer (rock): `rockcollector` / `rock-groove-2026`
- Customer (soul): `soulseeker` / `soul-groove-2026`
- Admin: `admin` / `groovehaus-admin`

Visitors can also register their own customer account. Demo logins require the backend to reach its database; see the backend README for details.

## Project structure

- `src/pages/` — route-level screens.
- `src/components/` — reusable UI and API-state surfaces.
- `src/context/` — authentication, store, recommendation, and tracking state.
- `src/hooks/` — catalog, product, and recommendation data loading.
- `src/lib/api.js` — the backend client boundary.
- `docs/` — contracts, decisions, and evaluation notes.

## License

MIT, copyright Sithu Win San and Phone Khant Aung.
