# Frontend Presentation Notes

Use these points to describe the implemented frontend accurately.

## What The Frontend Demonstrates

- A distinct twelve-route Groovehaus storefront.
- URL-backed catalog browsing, literal server search, repeated filters, pagination, product metadata, and stock state.
- Session-only guest wishlist/cart/ratings and account-backed authenticated state with sign-up-only merge.
- Customer registration, signed-session restoration, three-step onboarding, and preference management.
- Explainable ranked suggestions with exact request/list attribution.
- Privacy-controlled pseudonymous interaction analytics and a visible opt-out.
- Unit, component, multi-browser, responsive, history, failure, and accessibility checks.

## Decision-Support Value

Users can narrow a catalog, compare metadata and availability, inspect why a record was suggested, and save future-facing preferences. Logged requests and attributed interactions create an evidence trail for later evaluation without claiming that the current ranking is personalized.

## Architecture Talking Point

The React frontend owns presentation, URL query state, tab-scoped guest state, and the unsent analytics queue. The Next.js backend owns contracts, validation, authenticated state, catalog repositories, request logs, scoring, and explanations. Secrets and raw private activity remain server-only.

## Limitations To State Clearly

- The active user recommendation profile is synthetic or cold-start.
- Saved onboarding preferences do not alter the current deterministic ranker.
- Guest state ends with the tab and never merges into an existing account.
- No checkout, payment, admin workspace, or offline quality result exists.
- Automated behavior tests and logged events do not equal recommendation-quality evidence.
