# Vinyl Record Store Frontend

Groovehaus is the React storefront for the CSX4207 Vinyl Record Store Recommender System. It is an implemented academic demo that consumes the separate Next.js backend.

## Implemented Features

- Home, catalog, product detail, search, recommendation, wishlist, cart, registration, login, protected account, onboarding, and profile-preferences routes.
- Responsive product grid, mobile filters, keyboard-visible focus, empty/error/loading states, and horizontal recommendation rows.
- URL-backed server search, repeated filters, deterministic sorting, pagination, and full-catalog facet counts.
- Route-specific product queries with cancellation of stale search responses.
- Product-similarity and sample-profile recommendations with backend-generated explanations.
- Session-only guest wishlist/cart/rating state and server-backed authenticated state. A keyed guest merge runs only for a new registration and safely resumes after refresh; existing-account login and ordinary restore discard unrelated guest state.
- Customer registration/login/logout, signed-cookie session restoration, safe post-login return paths, protected account routing, and authenticated navigation state.
- Three-step onboarding plus editable/clearable account preferences, with honest wording that the current algorithm does not consume them.
- Privacy-controlled interaction analytics with a durable bounded queue, visible opt-out, recommendation attribution, and auth-boundary isolation.
- Unit and component tests with Vitest and React Testing Library; multi-browser, responsive, and axe checks with Playwright.

The backend can serve the catalog from its safe seed default or explicit MongoDB mode. Authentication, registered identity, and authenticated customer state are server-backed. Guest state remains intentionally session-only. Checkout, payments, offline recommendation evaluation, and measured real-customer personalization remain unimplemented.

## Run Locally

Start the backend first from `../vinyl_record_store_backend`:

```bash
npm install
npm run dev
```

Then start this frontend:

```bash
npm install
npm run dev
```

The default URLs are `http://localhost:3000` for the backend and `http://localhost:5173` for the frontend.

## Environment

Copy `.env.example` to `.env.local` only when local overrides are needed:

```text
VITE_APP_NAME=Groovehaus
VITE_APP_URL=http://localhost:5173
VITE_API_BASE_URL=http://localhost:3000
```

Vite only exposes variables prefixed with `VITE_`. Do not place secrets in frontend environment variables.

## Test Auth Users

The site has two roles only: `customer` and `admin`. Showcase demo customer accounts are seeded into MongoDB and their (intentionally public) credentials are listed below. The administrator account is environment-backed on the backend (`.env.local`).

- Customer (demo, jazz): `jazzlistener` / `jazz-groove-2026`
- Customer (demo, rock): `rockcollector` / `rock-groove-2026`
- Customer (demo, soul): `soulseeker` / `soul-groove-2026`
- Admin: `admin` / `groovehaus-admin`

The three demo customer accounts start with empty preferences. Distinct per-account preference profiles (for example a jazz listener, a rock collector, and a soul seeker) will be added once recommender algorithm selection is finalized; see the backend `docs/FUTURE_IMPLEMENTATION_PLAN.md`. The demo customer usernames are reserved, so visitors cannot register them. Registered customers choose their own username and password through the Create Account page.

The demo customer logins require the backend to reach MongoDB. The local backend runs against Atlas, so they work in development; in pure seed-catalog mode without a configured `MONGODB_URI` they are unavailable, though registration still creates MongoDB-backed customers when `MONGODB_URI` is set.

## Validation

Run the complete frontend quality gate before committing source or integration changes.

```bash
npm run test:all
```

Targeted commands are `npm run test:unit`, `npm run test:e2e`, `npm run test:a11y`, `npm run lint`, and `npm run build`.

## Source Layout

- `src/pages/`: route-level screens.
- `src/components/`: reusable storefront UI and API state surfaces.
- `src/context/`: authentication, recommendation, tracking, and guest/authenticated store state.
- `src/hooks/`: URL query, catalog request, product-detail, and recommendation loading logic.
- `src/lib/api.js`: the backend client boundary.
- `docs/`: current frontend contracts, decisions, limitations, and evaluation notes.
- `code_for_website/`: retained design-import snapshot, not the active application.

## Backend Boundary

The backend owns catalog and customer-state persistence, authentication/authorization, API validation, search execution, recommendation scoring, and explanations. Contract changes must be documented in both repositories.

## License

MIT, copyright Sithu Win San.
