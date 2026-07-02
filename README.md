# Vinyl Record Store Frontend

Groovehaus is the React storefront for the CSX4207 Vinyl Record Store Recommender System. It is an implemented academic demo that consumes the separate Next.js backend.

## Implemented Features

- Home, catalog, product detail, search, recommendation, wishlist, and cart routes.
- Responsive product grid, mobile filters, keyboard-visible focus, empty/error/loading states, and horizontal recommendation rows.
- Catalog data loaded from the backend API.
- Product-similarity and sample-profile recommendations with backend-generated explanations.
- Local demo wishlist, cart quantity, and rating interactions.

The UI does not implement authentication, MongoDB persistence, interaction writes, checkout, payments, or real customer personalization.

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

## Validation

Run both checks before committing frontend source or integration changes.

```bash
npm run lint
npm run build
```

## Source Layout

- `src/pages/`: route-level screens.
- `src/components/`: reusable storefront UI and API state surfaces.
- `src/context/`: remote catalog/recommendation state and local demo store state.
- `src/hooks/`: reusable product-recommendation loading logic.
- `src/lib/api.js`: the backend client boundary.
- `docs/`: current frontend contracts, decisions, limitations, and evaluation notes.
- `code_for_website/`: retained design-import snapshot, not the active application.

## Backend Boundary

The backend owns catalog seed data, API validation, recommendation scoring, explanations, and future persistence. Contract changes must be documented in both repositories.

## License

MIT, copyright Sithu Win San.
