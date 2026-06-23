# Frontend Architecture Plan

## Summary

The frontend is a React application that consumes APIs from the separate Next.js backend. It owns UI behavior, layout, components, frontend state, and recommendation display.

## Frontend Layers

### Page Layer

Responsibilities:

- Catalog page.
- Product detail page.
- Search results page.
- Wishlist page.
- Cart page.
- User recommendation page.

### Component Layer

Responsibilities:

- Product cards.
- Product grids.
- Search controls.
- Filter controls.
- Recommendation rows.
- Recommendation reason labels.
- Loading, empty, and error states.

### API Client Layer

Planned responsibility:

- Call backend endpoints.
- Normalize backend responses for UI use.
- Keep API base URL configuration in frontend environment variables.
- Handle safe frontend errors.

### State Layer

Planned responsibility:

- Store temporary UI state such as filters, selected sort, active tabs, loading flags, and local wishlist/cart display state.
- Do not store persistent backend data as the source of truth.

## Backend Boundary

The backend owns:

- API route implementation.
- MongoDB Atlas access.
- Interaction logging.
- Recommender scoring.
- Recommendation explanation generation.

If an API contract changes, update this frontend plan and the backend API contract docs.

## Security Considerations

- Do not store MongoDB credentials in frontend files.
- Do not expose private user data unnecessarily.
- Use only public `NEXT_PUBLIC_` or Vite-safe public environment variables for frontend config.
- Treat recommendation and interaction displays as privacy-sensitive.

## Open Decisions

- Whether the frontend remains Vite or moves to a different React setup.
- Exact API base URL configuration.
- Whether TypeScript will be used.
- Design system choice.
- State management approach.
- Authentication UI scope.

## Documentation Update Rules

Update this file when frontend layers, component ownership, API client strategy, state management, security assumptions, or framework setup change.

