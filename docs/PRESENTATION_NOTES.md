# Frontend Presentation Notes

Use these points to describe the implemented frontend accurately.

## What The Frontend Demonstrates

- A distinct Groovehaus storefront with seven React routes.
- URL-backed catalog browsing, literal server search, repeated filters, pagination, product metadata, stock state, wishlist, and cart UI.
- Explainable ranked suggestions from a separate backend.
- Honest distinction between a synthetic demo profile, product similarity, and cold-start output.
- Loading, empty, error, retry, and success states for API data.
- Automated unit, component, multi-browser, responsive, history, and accessibility checks.

## Decision-Support Value

Users can narrow a catalog, compare metadata and availability, and inspect why a record was suggested. Explanations make the ranking easier to understand than an unexplained “recommended” label.

## Architecture Talking Point

The React frontend owns presentation, URL query state, and temporary user state. The Next.js backend owns contracts, validation, catalog repositories, query execution, scoring, and explanations. Database credentials remain server-only.

## Limitations To State Clearly

- The user profile is synthetic.
- Wishlist, cart, rating, and quantity are local demo state.
- No authentication, persistent user-state, checkout, payment, or interaction write API exists.
- Automated behavior tests do not equal offline recommendation-quality metrics.
