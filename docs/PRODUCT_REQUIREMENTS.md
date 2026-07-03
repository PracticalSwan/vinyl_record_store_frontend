# Frontend Product Requirements

Requirement status reflects the integrated academic demo as of 2026-07-03.

## Goal

Help users browse a demo vinyl catalog and understand explainable recommendations in an academic decision-support setting.

## Requirement Status

| ID | Requirement | Status | Evidence |
| --- | --- | --- | --- |
| FFR-001 | Display backend product listing. | Implemented | Abortable, paginated catalog query and catalog route. |
| FFR-002 | Display product details. | Implemented | Record detail route requests the backend product endpoint. |
| FFR-003 | Search, filter, and sort products. | Implemented | URL-backed literal server search, repeated facets, deterministic sort, and pagination. |
| FFR-004 | Display wishlist and cart actions. | Demo only | State is local and intentionally not persisted. |
| FFR-005 | Display product-based recommendations. | Implemented | Detail route consumes backend similarity results. |
| FFR-006 | Display user-based recommendations. | Demo only | Uses the documented `demo-user` sample profile. |
| FFR-007 | Show recommendation explanations. | Implemented | Cards display backend reasons. |
| FFR-008 | Handle loading, empty, error, and success states. | Implemented | Independent route query and recommendation states. |
| FFR-009 | Verify critical browser and accessibility behavior. | Implemented | Vitest, React Testing Library, Playwright browser matrix, and axe. |

## Non-Functional Requirements

- Responsive product grids and filters.
- Keyboard-visible focus and accessible names for icon actions.
- Text labels as well as color for stock and recommendation meaning.
- No frontend secrets or private interaction data.
- No false claims of persistence or personal history.

## Out Of Scope

Authentication, payments, production checkout, frontend database access, write APIs, scraping, and admin tools remain outside the current implemented demo.

## Success Criteria

- Unit, component, multi-browser, accessibility, lint, and production-build checks pass.
- A running frontend can load the backend catalog and recommendation responses.
- Users can distinguish demo-profile, content-similarity, and cold-start recommendation contexts.
