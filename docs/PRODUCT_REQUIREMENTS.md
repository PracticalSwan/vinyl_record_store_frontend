# Frontend Product Requirements

## Goals

- Help users browse vinyl records clearly.
- Let users search, filter, and inspect products.
- Display recommendation explanations returned by the backend.
- Keep the UI useful for an academic Decision Support and Recommender Systems demo.

## Frontend Personas

| Persona | Frontend Need |
| --- | --- |
| New listener | Simple browsing and clear recommendation reasons. |
| Collector | Metadata such as artist, label, year, format, condition, and stock. |
| Returning customer | UI that can show personalized recommendations from backend data. |
| Academic reviewer | Visible explanation of how recommendations support decisions. |

## User Stories

- As a customer, I want to browse record cards so I can find interesting albums.
- As a customer, I want to filter by genre, artist, era, label, condition, and price.
- As a customer, I want to open a product detail page.
- As a customer, I want to see recommended records with short reasons.
- As a customer, I want clear loading and error states.
- As a reviewer, I want to see how recommendation reasons support user decisions.

## Functional Requirements

| ID | Requirement | Priority |
| --- | --- | --- |
| FFR-001 | Display product listing from backend API. | Must |
| FFR-002 | Display product detail from backend API. | Must |
| FFR-003 | Provide search and filter controls. | Must |
| FFR-004 | Display wishlist and cart actions. | Should |
| FFR-005 | Display product-based recommendations. | Must |
| FFR-006 | Display user-based recommendations when backend supports them. | Should |
| FFR-007 | Show recommendation explanation reasons. | Must |
| FFR-008 | Show loading, empty, and error states. | Must |

## Non-Functional Requirements

- UI should be responsive on mobile and desktop.
- Controls should be keyboard accessible.
- Text should not overlap in cards, buttons, filters, or recommendation rows.
- Frontend must not expose backend secrets.
- UI should be explainable to beginner developers and academic reviewers.

## Out Of Scope For Frontend

- MongoDB Atlas access.
- API route implementation.
- Recommender scoring.
- Product scraping.
- Production payment processing.
- Production authentication unless approved later.

## Success Criteria

- A user can find products using browsing, search, and filters.
- A user can understand why a record is recommended.
- Recommendation display works across screen sizes.
- Frontend docs stay synchronized with frontend changes.

## Change Tracking

Update this file when frontend requirements, user stories, success criteria, or out-of-scope items change.

