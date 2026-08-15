# Frontend UI And UX

This document records the implemented Groovehaus experience and its required states.

## Implemented Routes

| Route | Purpose |
| --- | --- |
| `/` | Hero, current catalog statistics, new arrivals, and sample-profile recommendation row. |
| `/catalog` | URL-backed product grid, repeated filters, sorting, pagination, and no-result state. |
| `/records/:id` | Product metadata, guest/authenticated rating/cart actions, and backend similarity results. |
| `/search?q=` | 300 ms debounced literal server search with shared filters, sorting, pagination, and up to five clickable committed recent terms. |
| `/recommendations` | Explainable, session-owned recommendations with shopper-facing labels and server-provided reasons. |
| `/wishlist` | Guest-session or authenticated server-backed wishlist. |
| `/cart` | Guest-session or authenticated server-backed cart with an entry to checkout. |
| `/register`, `/login` | Customer account creation and existing-account access. |
| `/account` | Protected account summary and sign-out. |
| `/onboarding` | Protected three-step preference onboarding. |
| `/profile/preferences` | Protected preference editing, draft-only clearing, usage-data control, and a focus-contained save/discard/cancel guard for every SPA/history exit. |
| `/checkout` | Protected client-only checkout with availability checks and a no-real-payment disclosure. |
| `/checkout/complete/:reference` | Session-scoped checkout summary using `GH-XXXXXXXX`; no payment or backend order. |

## Design Language

Groovehaus uses a cream surface, dark brown navigation and cards, rust accent, serif display headings, compact metadata badges, reviewed release artwork where available, and the vinyl placeholder as the final fallback. Preserve this identity unless a task explicitly changes the design.

## Required States

- Catalog and Search: loading skeleton, empty response, connection/backend error with retry, success, pagination focus management, independent filter scrolling, bounded price inputs, and stale-request cancellation.
- Recommendations: loading, empty, error with retry, success, explicit recommendation mode, and default-off exact feedback controls with status/Undo recovery.
- Similar products: loading, empty, error, success.
- Store lists: guest/authenticated loading, warnings, mutation errors, populated, and empty states.
- Out-of-stock products: visible status and disabled purchase action.
- Dataset products: explicit Unknown/Unavailable copy for nullable artist/price/stock/condition/format, dynamic facet values, strict accepted artwork with a verified local fallback or placeholder, and disabled purchase when commercial state is unknown.
- Product images: stable aspect ratio, approved artwork success, slow-loading placeholder layer, remote-to-local failover, final generic fallback, and optional detail attribution.
- Preferences: draft-only clear, save confirmation, dirty navigation with save/discard/cancel, and a direct path back to Account.
- Recommendation feedback: `Not interested`, `Already own`, and contextual `Undo` only; pessimistic writes, in-card `role="status"`, recoverable errors, visible focus, and no browser-side reranking/refill.
- Page shell: footer remains below short content and follows long content without fixed overlap.
- Admin: active dataset status/counts, source/version column, retry state, read-only CLI-managed rows, ordinary-record mutation flows, and focus-contained confirmation dialogs.

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

- Keep backend recommendation mode identifiers internal to the API contract; map them through `recommendationPresentation` before rendering shopper-facing labels.
- Explain session ownership separately from ranking personalization; a customer-owned request does not by itself imply account history or measured quality.
- The default-off preference, behavior, popularity, and hybrid branches are active only when the backend flags and applicable evidence permit.
- Describe guest state as current-tab-only and authenticated state as account-backed.
- When a personalized flag is off or evidence is unavailable, render the lower mode returned by the backend with its shopper-facing label and render only server-provided reasons.
- Keep the usage-data opt-out visible and immediately authoritative.
- Keep checkout store-like while stating that no real payment is processed; never imply payment, shipment, fulfillment, persistence beyond the browser session, or a backend order.
