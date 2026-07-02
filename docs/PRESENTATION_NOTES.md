# Frontend Presentation Notes

Use these points to describe the implemented frontend accurately.

## What The Frontend Demonstrates

- A distinct Groovehaus storefront with seven React routes.
- Catalog browsing, search, filters, product metadata, stock state, wishlist, and cart UI.
- Explainable ranked suggestions from a separate backend.
- Honest distinction between a synthetic demo profile, product similarity, and cold-start output.
- Loading, empty, error, retry, and success states for API data.

## Decision-Support Value

Users can narrow a catalog, compare metadata and availability, and inspect why a record was suggested. Explanations make the ranking easier to understand than an unexplained “recommended” label.

## Architecture Talking Point

The React frontend owns presentation and temporary UI state. The Next.js backend owns contracts, validation, the demo catalog, scoring, and explanations. This separation supports later persistence without placing database credentials in the browser.

## Limitations To State Clearly

- The user profile is synthetic.
- Wishlist, cart, rating, and quantity are local demo state.
- No authentication, MongoDB persistence, checkout, payment, or interaction write API exists.
- Automated behavior tests do not equal offline recommendation-quality metrics.
