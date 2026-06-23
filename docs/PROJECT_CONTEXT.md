# Frontend Project Context

This is the frontend source of truth for the Vinyl Record Store Recommender System.

## Frontend Role

The frontend presents the vinyl record store to users. It should let users browse products, inspect details, use search and filters, manage wishlist/cart UI, and understand recommendation explanations returned by the backend.

The frontend does not own database access or recommender algorithms.

## Academic Focus

The academic focus is Decision Support and Recommender Systems. Frontend work should make decision support visible through ranking, explanations, filters, and clear product information.

## Scope

Frontend scope:

- Catalog UI.
- Product detail UI.
- Search and filter UI.
- Wishlist and cart UI.
- Recommendation display.
- Explanation badges or text.
- API consumption from backend.
- Loading, empty, and error states.
- Accessibility and responsive behavior.

## Non-Goals

These are out of scope for the frontend unless the user explicitly changes the architecture:

- MongoDB Atlas connection code.
- Database schemas.
- API route implementation.
- Recommender scoring algorithms.
- Interaction logging implementation.
- Scraping external websites.
- Copying external website designs or assets.

## Assumptions

- The frontend calls APIs from `../vinyl_record_store_backend`.
- The backend returns products, recommendation results, scores or ranks, and explanation reasons.
- The frontend may store temporary client UI state, but persistent data belongs to the backend.
- The current frontend scaffold is Vite React.
- No backend URL has been finalized yet.

## Constraints

- Current phase is planning/setup only.
- Keep frontend and backend responsibilities separate.
- Keep secrets out of the frontend.
- Keep docs editable.
- Keep explanations beginner-friendly for academic review.

## Important Terms

- Product card: UI element that summarizes one vinyl record.
- Recommendation reason: user-facing text that explains why a record was recommended.
- API consumption: frontend code that calls backend endpoints and handles responses.
- Client data shape: the object structure the frontend expects from backend responses.
- Empty state: UI shown when no data is available.

## Documentation Maintenance Rule

Update frontend docs when frontend behavior, setup, architecture, UI, API consumption, recommendation display, environment variables, risks, or scope change.

If information is missing, add a clear `TODO` with the missing decision.

## Frontend Task Workflow

1. Read `LESSONS.md`, `AGENTS.md`, `CLAUDE.md`, and relevant docs.
2. Identify the frontend task type.
3. Make a short plan for multi-file work.
4. Modify only relevant frontend files.
5. Validate when practical.
6. Update affected frontend docs.
7. Check whether backend API docs need updates.
8. Summarize changed files, validation, assumptions, and next steps.

