# Frontend Product Requirements

Requirement status reflects the integrated academic demo as of 2026-07-02.

## Goal

Help users browse a demo vinyl catalog and understand explainable recommendations in an academic decision-support setting.

## Requirement Status

| ID | Requirement | Status | Evidence |
| --- | --- | --- | --- |
| FFR-001 | Display backend product listing. | Implemented | Catalog provider and catalog route. |
| FFR-002 | Display product details. | Implemented | Record detail route using backend-loaded catalog data. |
| FFR-003 | Search, filter, and sort products. | Implemented | Client-side controls over API-loaded products. |
| FFR-004 | Display wishlist and cart actions. | Demo only | State is local and intentionally not persisted. |
| FFR-005 | Display product-based recommendations. | Implemented | Detail route consumes backend similarity results. |
| FFR-006 | Display user-based recommendations. | Demo only | Uses the documented `demo-user` sample profile. |
| FFR-007 | Show recommendation explanations. | Implemented | Cards display backend reasons. |
| FFR-008 | Handle loading, empty, error, and success states. | Implemented | Catalog gate and recommendation states. |

## Non-Functional Requirements

- Responsive product grids and filters.
- Keyboard-visible focus and accessible names for icon actions.
- Text labels as well as color for stock and recommendation meaning.
- No frontend secrets or private interaction data.
- No false claims of persistence or personal history.

## Out Of Scope

Authentication, payments, production checkout, MongoDB access, write APIs, scraping, and admin tools remain outside the current implemented demo.

## Success Criteria

- Lint and production build pass.
- A running frontend can load the backend catalog and recommendation responses.
- Users can distinguish demo-profile, content-similarity, and cold-start recommendation contexts.
