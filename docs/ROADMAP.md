# Frontend Consolidation Status

This file records current completion and deferred scope. It does not authorize continued development.

## Completed

- Frontend/backend folder boundary and aligned instructions.
- Groovehaus React routes and responsive design.
- Backend API client using `VITE_API_BASE_URL`.
- API-backed catalog, demo-profile recommendations, and product similarity.
- URL-backed literal server search, repeated filters, deterministic sorting, pagination, and full-catalog facets.
- Route-specific product fetching with stale-request cancellation and partial local-list hydration.
- Loading, empty, error, retry, and success states for remote data.
- Vitest/React Testing Library unit and component coverage.
- Playwright Chromium, Firefox, WebKit, responsive, history, failure, and axe coverage.
- Honest demo and cold-start labeling.
- Current README, architecture, contract, data, UI, evaluation, risk, decision, and presentation docs.
- Passing frontend tests, accessibility checks, lint, and production build.

## Deferred And Not Started

- Authentication and real user profiles.
- MongoDB-backed wishlist, cart, rating, interaction, and order writes.
- Checkout and payments.
- Approved album artwork pipeline.
- Offline recommendation benchmark against random and popularity baselines.

Detailed plans and the approved cross-repository implementation order are in `FUTURE_IMPLEMENTATION_PLAN.md`. Backend catalog persistence is available in explicit MongoDB mode, but authentication registration and persistent user state still require identity and write APIs. Deployment and real payments remain out of scope.

Deferred items require a separate explicit implementation task and must not be described as in progress.
