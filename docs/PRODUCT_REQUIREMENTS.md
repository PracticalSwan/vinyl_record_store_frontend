# Frontend Product Requirements

Requirement status reflects the integrated academic demo as of 2026-07-06.

## Goal

Help users browse a demo vinyl catalog and understand explainable recommendations in an academic decision-support setting.

## Requirement Status

| ID | Requirement | Status | Evidence |
| --- | --- | --- | --- |
| FFR-001 | Display backend product listing. | Implemented | Abortable, paginated catalog query and catalog route. |
| FFR-002 | Display product details. | Implemented | Record detail route requests the backend product endpoint. |
| FFR-003 | Search, filter, and sort products. | Implemented | URL-backed literal server search, repeated facets, deterministic sort, and pagination. |
| FFR-004 | Display wishlist, cart, quantity, and rating actions. | Implemented | Session guest adapter and authenticated server adapter with optimistic rollback. |
| FFR-005 | Display product-based recommendations. | Implemented | Detail route consumes backend similarity results. |
| FFR-006 | Display user-based recommendations. | Demo only | Uses the documented `demo-user` sample profile. |
| FFR-007 | Show recommendation explanations. | Implemented | Cards display backend reasons. |
| FFR-008 | Handle loading, empty, error, and success states. | Implemented | Independent route query and recommendation states. |
| FFR-009 | Verify critical browser and accessibility behavior. | Implemented | Vitest, React Testing Library, Playwright browser matrix, and axe. |
| FFR-010 | Register, restore, and protect customer accounts. | Implemented | Signed-cookie auth provider and protected routes. |
| FFR-011 | Capture and edit future-facing preferences. | Implemented | Three-step onboarding and profile editor. |
| FFR-012 | Capture privacy-controlled interaction analytics. | Implemented | Visible opt-out, bounded queue, recommendation attribution, and auth-boundary isolation. |
| FFR-013 | Display approved artwork safely. | Implemented | Shared validated image component with responsive loading, attribution, accessibility, and fallbacks. |

## Non-Functional Requirements

- Responsive product grids and filters.
- Keyboard-visible focus and accessible names for icon actions.
- Text labels as well as color for stock and recommendation meaning.
- No frontend secrets or direct personal information in analytics payloads.
- No false claims of persistence or personal history.

## Out Of Scope

Payments, production checkout, frontend database access, scraping, and admin tools remain outside the current implemented demo. Offline recommender evaluation belongs to the backend and currently reports insufficient evidence rather than quality metrics.

## Success Criteria

- Unit, component, multi-browser, accessibility, lint, and production-build checks pass.
- A running frontend can load the backend catalog and recommendation responses.
- Users can distinguish demo-profile, content-similarity, session-owned cold-start, and anonymous-fallback recommendation contexts.
