# UI/UX Plan

This file plans frontend behavior. It does not define React components.

## Planned Pages

- Home or catalog page.
- Product listing page.
- Product detail page.
- Search results page.
- Wishlist page.
- Cart page.
- User recommendation page.
- Admin product management page, optional.
- Evaluation/demo page, optional for academic presentation.

## Planned Components

- Header and navigation.
- Search bar.
- Filter panel.
- Product card.
- Product grid.
- Product detail summary.
- Recommendation carousel or row.
- Recommendation reason badge.
- Wishlist button.
- Cart button.
- Rating input, optional.
- Empty state.
- Loading state.
- Error state.

## User Flow

1. User opens catalog.
2. User searches or filters records.
3. User opens a product detail page.
4. User sees similar records with explanations.
5. User adds records to wishlist or cart.
6. The system logs interactions.
7. User receives more personalized recommendations after enough signals exist.

## Product Card Requirements

A product card should show:

- Cover image or placeholder.
- Record title.
- Artist.
- Genre or subgenre.
- Release year or era.
- Price.
- Stock status.
- Condition.
- Primary action such as view details.
- Optional wishlist action.

## Recommendation Carousel Requirements

The recommendation area should show:

- A clear title, such as "Similar records."
- Product cards.
- One or more recommendation reasons per item.
- In-stock status.
- Empty state when no recommendations are available.

## Explanation UI Examples

Example explanation text:

- "Recommended because you bought another record by this artist."
- "Recommended because it shares the same genre and release era."
- "Recommended because it matches records in your wishlist."
- "Recommended because it has similar tags and is in stock."

Keep explanations short. The user should understand the reason without knowing recommender-system terms.

## Accessibility Notes

- Use semantic headings.
- Use keyboard-friendly controls.
- Add alt text for product images.
- Do not rely only on color for stock or status.
- Make filter controls understandable to screen readers.
- Keep recommendation reasons as text, not only icons.

## Responsive Design Notes

- Product grids should adapt from mobile to desktop.
- Filters should collapse or move into a drawer on small screens.
- Product cards should keep key information visible.
- Recommendation rows should be usable on touch screens.
- Avoid text overlap in cards, buttons, and badges.

## Documentation Update Rules

Update this file when planned pages, user flows, component behavior, accessibility expectations, responsive behavior, or explanation UI changes.

