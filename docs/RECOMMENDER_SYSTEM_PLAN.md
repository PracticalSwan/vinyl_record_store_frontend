# Frontend Recommendation Display Plan

Backend recommender logic belongs in `../../vinyl_record_store_backend/docs/RECOMMENDER_SYSTEM_PLAN.md`.

This file plans how the frontend displays recommendation results and explanations.

## Frontend Responsibility

The frontend should:

- Request recommendations from the backend.
- Display recommended vinyl records.
- Show clear explanation reasons.
- Handle loading, empty, and error states.
- Avoid implying recommendations are personal when the backend returned cold-start or generic results.

## Recommendation UI Locations

Planned locations:

- Product detail page: similar records.
- Catalog page: optional "recommended for you" row.
- Wishlist page: records related to wishlist items.
- Cart page: optional related records before checkout.

## Explanation UI

Example explanation text:

- "Same artist."
- "Shares the same genre and release era."
- "Similar to records in your wishlist."
- "Matches tags from records you viewed."
- "In stock now."

Keep reasons short and readable.

## Frontend States

- Loading recommendations.
- No recommendations available.
- Backend error.
- Partial recommendation data.
- Generic recommendations for a new user.

## Accessibility Notes

- Recommendation reasons must be text, not icons only.
- Carousel or row controls must be keyboard accessible.
- Product cards must have readable labels.
- Do not rely only on color to explain recommendation strength or stock.

## Evaluation Support

Frontend evaluation can check:

- Do users notice recommendation reasons?
- Are reasons understandable?
- Can users distinguish similar records from generic recommendations?
- Does the recommendation row work on mobile and desktop?

## Documentation Update Rules

Update this file when recommendation display, explanation copy, UI location, frontend states, accessibility behavior, or evaluation expectations change.

