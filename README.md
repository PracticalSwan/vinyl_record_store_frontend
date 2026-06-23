# Vinyl Record Store Frontend

This folder owns the frontend for the Vinyl Record Store Recommender System.

The frontend is planned as a React application that displays the vinyl catalog, product details, search and filters, wishlist/cart surfaces, and recommendation explanations returned by the backend.

## Current Status

Planning/setup stage.

This folder currently contains a Vite React starter. Product UI has not been implemented. The backend now lives separately in `../vinyl_record_store_backend`.

## Frontend Responsibilities

- Customer-facing React screens.
- Reusable UI components.
- Product browsing UI.
- Search and filter UI.
- Wishlist and cart UI.
- Recommendation rows, cards, and explanation text.
- Client-side API consumption.
- Loading, empty, and error states.
- Accessibility and responsive layout.

Backend APIs, MongoDB Atlas access, interaction logging, and recommender algorithms belong in `../vinyl_record_store_backend`.

## Planned Tech Stack

- Frontend: ReactJS.
- Current scaffold: Vite React starter.
- Backend provider: separate Next.js backend folder.
- Database: backend-only MongoDB Atlas.
- Recommender logic: backend-only, displayed by the frontend.

## Before Working Here

Read these files first:

1. `LESSONS.md`
2. `AGENTS.md`
3. `CLAUDE.md`
4. Relevant files in `docs/`

## Environment Variables

Use `.env.local` for real local frontend values. Do not commit secrets.

See `.env.example` for placeholders.

## Scripts

Current scripts come from the Vite starter:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

Run lint/build checks when frontend implementation changes make those checks relevant.

## Documentation Index

- `docs/PROJECT_CONTEXT.md`: frontend source of truth.
- `docs/PRODUCT_REQUIREMENTS.md`: frontend-facing product requirements.
- `docs/UI_UX_PLAN.md`: planned pages, components, and flows.
- `docs/API_CONTRACT_PLAN.md`: backend API consumption plan for the frontend.
- `docs/DATA_MODEL_PLAN.md`: frontend data shapes received from APIs.
- `docs/RECOMMENDER_SYSTEM_PLAN.md`: recommendation display and explanation UI plan.
- `docs/DESIGN_REFERENCE_POLICY.md`: safe design research rules.
- `docs/ARCHITECTURE_PLAN.md`: frontend architecture and boundaries.
- `docs/ROADMAP.md`: frontend phase plan.
- `docs/TASK_BACKLOG.md`: frontend task list.
- `docs/DECISION_LOG.md`: frontend decisions.
- `docs/EVALUATION_PLAN.md`: frontend evaluation plan.
- `docs/PRESENTATION_NOTES.md`: presentation notes for frontend contribution.
- `docs/RISK_REGISTER.md`: frontend risks.
- `docs/SETUP_LATER.md`: future setup notes.

## Documentation Rule

Update frontend docs when frontend setup, UI behavior, API consumption, data shapes, recommendation display, environment variables, package choices, commands, risks, or scope change.

