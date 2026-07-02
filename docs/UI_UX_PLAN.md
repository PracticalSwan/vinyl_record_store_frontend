# Frontend UI And UX

This document records the implemented Groovehaus experience and its required states.

## Implemented Routes

| Route | Purpose |
| --- | --- |
| `/` | Hero, current catalog statistics, new arrivals, and sample-profile recommendation row. |
| `/catalog` | Product grid, filters, sorting, and no-result state. |
| `/records/:id` | Product metadata, local demo rating/cart actions, and backend similarity results. |
| `/search?q=` | Client-side title, artist, and genre search over API-loaded products. |
| `/recommendations` | Explainable demo-profile or cold-start recommendation results. |
| `/wishlist` | Local demo wishlist. |
| `/cart` | Local demo cart and disabled checkout. |

## Design Language

Groovehaus uses a cream surface, dark brown navigation and cards, rust accent, serif display headings, compact metadata badges, and vinyl placeholder artwork. Preserve this identity unless a task explicitly changes the design.

## Required States

- Catalog: loading skeleton, empty response, connection/backend error with retry, success.
- Recommendations: loading, empty, error with retry, success and explicit recommendation mode.
- Similar products: loading, empty, error, success.
- Local lists: populated and empty states.
- Out-of-stock products: visible status and disabled purchase action.

## Accessibility And Responsive Behavior

- Semantic headings, lists, navigation, forms, and named icon buttons.
- Visible focus treatment and keyboard-operable controls.
- Text labels in addition to stock colors.
- Mobile filter disclosure below 900px.
- Product grids reflow and recommendation rows remain horizontally scrollable.
- Recommendation explanations remain text, not icon-only meaning.

## Honesty Rules

- Use “demo profile” for the sample profile.
- Use “cold-start” when no history exists.
- Mark rating, wishlist, and cart state as local demo behavior where ambiguity is possible.
- Keep checkout disabled until a real order workflow exists.
