# Frontend UI And UX

This document records the implemented Groovehaus experience and its required states.

## Implemented Routes

| Route | Purpose |
| --- | --- |
| `/` | Hero, current catalog statistics, new arrivals, and sample-profile recommendation row. |
| `/catalog` | URL-backed product grid, repeated filters, sorting, pagination, and no-result state. |
| `/records/:id` | Product metadata, guest/authenticated rating/cart actions, and backend similarity results. |
| `/search?q=` | 300 ms debounced literal server search with shared filters, sorting, pagination, and up to five clickable committed recent terms. |
| `/recommendations` | Explainable session-owned cold-start, anonymous-fallback, or labelled showcase results. |
| `/wishlist` | Guest-session or authenticated server-backed wishlist. |
| `/cart` | Guest-session or authenticated server-backed cart with an entry to the checkout preview. |
| `/register`, `/login` | Customer account creation and existing-account access. |
| `/account` | Protected account summary and sign-out. |
| `/onboarding` | Protected three-step preference onboarding. |
| `/profile/preferences` | Protected preference editing, draft-only clearing, usage-data control, and a focus-contained save/discard/cancel guard for every SPA/history exit. |
| `/checkout` | Protected client-only checkout preview with availability checks. |
| `/orders/preview/:reference` | Session-scoped preview confirmation; no payment or backend order. |

## Design Language

Groovehaus uses a cream surface, dark brown navigation and cards, rust accent, serif display headings, compact metadata badges, approved release artwork where available, and the vinyl placeholder as the final fallback after the bundled local source. Preserve this identity unless a task explicitly changes the design.

## Required States

- Catalog and Search: loading skeleton, empty response, connection/backend error with retry, success, pagination focus management, independent filter scrolling, bounded price inputs, and stale-request cancellation.
- Recommendations: loading, empty, error with retry, success and explicit recommendation mode.
- Similar products: loading, empty, error, success.
- Store lists: guest/authenticated loading, warnings, mutation errors, populated, and empty states.
- Out-of-stock products: visible status and disabled purchase action.
- Product images: stable aspect ratio, approved artwork success, slow-loading placeholder layer, remote-to-local failover, final generic fallback, and optional detail attribution.
- Preferences: draft-only clear, save confirmation, dirty navigation with save/discard/cancel, and a direct path back to Account.
- Page shell: footer remains below short content and follows long content without fixed overlap.

## Accessibility And Responsive Behavior

- Semantic headings, lists, navigation, forms, and named icon buttons.
- Visible focus treatment and keyboard-operable controls.
- Text labels in addition to stock colors.
- Mobile filter disclosure below 900px.
- Back/forward navigation restores canonical search, filter, sort, and page state.
- Product grids reflow and recommendation rows remain horizontally scrollable.
- Recommendation explanations remain text, not icon-only meaning.
- Card/list artwork is decorative when the surrounding product already has an accessible name; detail artwork uses local title/artist alt text.

## Honesty Rules

- Use “demo profile” for the sample profile.
- Use “cold-start” when no history exists.
- Use “anonymous fallback” when no verified customer session resolves; do not imply account history.
- Describe session ownership separately from ranking personalization: the request can be customer-owned while preferences and behavior remain inactive.
- Describe guest state as current-tab-only and authenticated state as account-backed.
- State that saved preferences do not alter the current demo ranking.
- Keep the usage-data opt-out visible and immediately authoritative.
- Label checkout as a preview and never imply real payment, shipment, persistence, or a backend order.
